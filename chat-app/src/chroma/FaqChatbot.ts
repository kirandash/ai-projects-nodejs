import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import OpenAI from "openai";

const chroma = new ChromaClient({
  path: "http://localhost:8000",
});

const faqSingaporeInfo = `
Singapore is a city-state in Southeast Asia. Founded as a British trading colony in 1819, since independence it has become one of the world's most prosperous countries and boasts the world's busiest port. Combining the skyscrapers and subways of a modern, affluent city with a medley of Chinese, Malay and Indian influences and a tropical climate, with tasty food, good shopping and a vibrant night-life scene, this Garden City makes a great stopover or springboard into the region. It has a total land area of 724.2 square kilometers and a population of 5.88 million people.`;

const faqIndiaInfo = `
India, officially the Republic of India, is a country in South Asia. It is the seventh-largest country by land area, the second-most populous country, and the most populous democracy in the world. Bounded by the Indian Ocean on the south, the Arabian Sea on the southwest, and the Bay of Bengal on the southeast, it shares land borders with Pakistan to the west; China, Nepal, and Bhutan to the north; and Bangladesh and Myanmar to the east. In the Indian Ocean, India is in the vicinity of Sri Lanka and the Maldives; its Andaman and Nicobar Islands share a maritime border with Thailand, Myanmar and Indonesia. It has a total land area of 3.287 million square kilometers and a population of 1.3 billion people.`;

const faqAustraliaInfo = `
Australia is a country and continent surrounded by the Indian and Pacific oceans. Its major cities – Sydney, Brisbane, Melbourne, Perth, Adelaide – are coastal. Its capital, Canberra, is inland. The country is known for its Sydney Opera House, the Great Barrier Reef, a vast interior desert wilderness called the Outback, and unique animal species like kangaroos and duck-billed platypuses. It has a total land area of 7.692 million square kilometers and a population of 25.4 million people.`;

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const embeddingFunction: OpenAIEmbeddingFunction = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY,
  openai_model: "text-embedding-3-small",
});

const collectionName = "faq-singapore";

const createCollection = async () => {
  await chroma.createCollection({
    name: collectionName,
  });
};

const getCollection = async () => {
  const collection = await chroma.getCollection({
    name: collectionName,
    embeddingFunction: embeddingFunction,
  });
  return collection;
};

const populateCollection = async () => {
  const collection = await getCollection();
  await collection.add({
    ids: ["id1", "id2", "id3"],
    documents: [faqSingaporeInfo, faqIndiaInfo, faqAustraliaInfo],
  });
};

const askQuestion = async () => {
  const question = "What's the population of Singapore?";
  const collection = await getCollection();
  const response = await collection.query({
    queryTexts: question,
    nResults: 1,
  });
  const relevantInfo = response.documents[0][0];
  if (relevantInfo) {
    const openai = new OpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0,
      messages: [
        // This is called context injection
        {
          role: "assistant",
          content: `Answer the next question using the information provided: ${relevantInfo}`,
        },
        {
          role: "user",
          content: question,
        },
      ],
    });
    const responseMsg = response.choices[0].message;
    console.log(responseMsg);
  } else {
    console.log("No relevant information found");
  }
};

const main = async () => {
  // await createCollection();
  // await populateCollection();
  await askQuestion();
};

main();
