import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.8,
});

const hardCodedData = [
  "My full name is John Doe",
  "I am a software engineer",
  "My favorite programming language is JavaScript",
  "My favorite programming language is also python",
  "My favorite programming language is also rust",
  "I love to play the guitar",
];

const question = "What is my favorite programming language?";

const main = async () => {
  // Create an embeddings instance
  const embeddings = new OpenAIEmbeddings();
  // Create a vector store (in memory for this example)
  const vectorStore = new MemoryVectorStore(embeddings);

  // Add documents to the vector store
  await vectorStore.addDocuments(
    hardCodedData.map((text) => new Document({ pageContent: text }))
  );

  // Retrieve the top 3 most similar documents
  const retriever = vectorStore.asRetriever({
    k: 3,
  });

  const result = await retriever.invoke(question);
  const resultDocuments = result.map((doc) => doc.pageContent);

  // build template for chat
  const template = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Answer to users question based on the following context: {context}.",
    ],
    ["user", "{query}"],
  ]);

  const chain = template.pipe(model);
  const response = await chain.invoke({
    query: question,
    context: resultDocuments,
  });
  console.log(response.content);
};

main();
