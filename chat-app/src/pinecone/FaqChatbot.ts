import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not set");
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const faqSingaporeInfo = `
Singapore is a city-state in Southeast Asia. Founded as a British trading colony in 1819, since independence it has become one of the world's most prosperous countries and boasts the world's busiest port. Combining the skyscrapers and subways of a modern, affluent city with a medley of Chinese, Malay and Indian influences and a tropical climate, with tasty food, good shopping and a vibrant night-life scene, this Garden City makes a great stopover or springboard into the region. It has a total land area of 724.2 square kilometers and a population of 5.88 million people.`;

const faqIndiaInfo = `
India, officially the Republic of India, is a country in South Asia. It is the seventh-largest country by land area, the second-most populous country, and the most populous democracy in the world. Bounded by the Indian Ocean on the south, the Arabian Sea on the southwest, and the Bay of Bengal on the southeast, it shares land borders with Pakistan to the west; China, Nepal, and Bhutan to the north; and Bangladesh and Myanmar to the east. In the Indian Ocean, India is in the vicinity of Sri Lanka and the Maldives; its Andaman and Nicobar Islands share a maritime border with Thailand, Myanmar and Indonesia. It has a total land area of 3.287 million square kilometers and a population of 1.34 billion people.`;

const faqAustraliaInfo = `
Australia is a country and continent surrounded by the Indian and Pacific oceans. Its major cities – Sydney, Brisbane, Melbourne, Perth, Adelaide – are coastal. Its capital, Canberra, is inland. The country is known for its Sydney Opera House, the Great Barrier Reef, a vast interior desert wilderness called the Outback, and unique animal species like kangaroos and duck-billed platypuses. It has a total land area of 7.692 million square kilometers and a population of 25.4 million people.`;

type FaqData = {
  faqInfo: string;
  reference: string;
  relevance: number;
};

const dataToEmbed: FaqData[] = [
  {
    faqInfo: faqSingaporeInfo,
    reference: "Singapore",
    relevance: 0.93,
  },
  {
    faqInfo: faqIndiaInfo,
    reference: "India",
    relevance: 0.77,
  },
  {
    faqInfo: faqAustraliaInfo,
    reference: "Australia",
    relevance: 0.88,
  },
];

const pineconeIndex = pinecone.index<FaqData>("bgwebagency-chat-app-index");

const storeEmbeddings = async () => {
  await Promise.all(
    dataToEmbed.map(async (data, index) => {
      const embeddingResult = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: [data.faqInfo],
      });
      const embedding = embeddingResult.data[0].embedding;
      await pineconeIndex.upsert([
        {
          id: `id-${index}`,
          values: embedding,
          metadata: data,
        },
      ]);
    })
  );
};

const queryEmbeddings = async (question: string) => {
  const questionEmbeddingResult = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });
  const questionEmbedding = questionEmbeddingResult.data[0].embedding;

  const queryResult = await pineconeIndex.query({
    vector: questionEmbedding,
    topK: 1,
    includeMetadata: true,
    includeValues: true,
  });

  return queryResult;
};

const askOpenAI = async (question: string, relevantInfo: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [
      {
        role: "assistant",
        content: `Answer the next question using this information: ${relevantInfo}`,
      },
      {
        role: "user",
        content: question,
      },
    ],
  });
  const responseMsg = response.choices[0].message.content;
  console.log(responseMsg);
};

const main = async () => {
  // await storeEmbeddings();
  const question = "What is the population of India?";
  const result = await queryEmbeddings(question);
  const relevantInfo = result.matches[0].metadata;
  if (relevantInfo) {
    await askOpenAI(question, relevantInfo.faqInfo);
  }
};

main();
