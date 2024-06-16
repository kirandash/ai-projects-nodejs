import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not set");
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

type MetaData = {
  name: string;
  age: number;
};

// namespace: partion vector data from an index into multiple namespaces or groups. This will make the operations limited to a specific namespace.
const createNameSpace = async () => {
  const index = getIndex("bgwebagency-chat-app-index");
  const namespace = index.namespace("bgwebagency-chat-app-namespace");
};

const listIndexes = async () => {
  const indexes = await pinecone.listIndexes();
  console.log(indexes);
};

const getIndex = (indexName: string) => {
  const index = pinecone.index<MetaData>(indexName);
  console.log(index);
  return index;
};

// Generate random vectors
const generateRandomVectors = (length: number) => {
  return Array.from({ length }, () => Math.random());
};

const upsertVectors = async () => {
  const embedding = generateRandomVectors(1536);
  const index = getIndex("bgwebagency-chat-app-index");

  await index.upsert([
    {
      id: "id-2",
      values: embedding,
      metadata: {
        name: "John Doe",
        age: 25,
      },
    },
  ]);
  console.log("upsert successful");
};

const createIndex = async () => {
  await pinecone.createIndex({
    name: "bgwebagency-chat-app-index",
    dimension: 1536,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
  });
};

const queryVectors = async () => {
  const index = getIndex("bgwebagency-chat-app-index");
  const results = await index.query({
    id: "id-2",
    // how many query results to return
    topK: 1,
    includeMetadata: true,
  });
  console.log(results);
};

const main = async () => {
  // await listIndexes();
  // getIndex("bgwebagency-chat-app-index");
  // await upsertVectors();
  await queryVectors();
};

main();
