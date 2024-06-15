import { join } from "path";

import { existsSync, readFileSync, writeFileSync } from "fs";
import { CreateEmbeddingResponse } from "openai/resources";
import OpenAI from "openai";

type Food = {
  name: string;
  description: string;
};

type FoodWithEmbedding = Food & { embedding: number[] };

const loadInputJson = <T>(fileName: string): T => {
  const path = join(__dirname, fileName);
  const rawInputData = readFileSync(path);
  return JSON.parse(rawInputData.toString());
};

const saveEmbeddingsToJson = (embeddings: any, fileName: string) => {
  const embeddingsString = JSON.stringify(embeddings);
  const buffer = Buffer.from(embeddingsString);
  const path = join(__dirname, fileName);
  writeFileSync(path, buffer);
  console.log(`Embeddings saved to ${path}`);
};

const dotProduct = (a: number[], b: number[]) => {
  return a.reduce((acc, val, index) => acc + val * b[index], 0);
};

const cosineSimilarity = (a: number[], b: number[]) => {
  const dot = dotProduct(a, b);
  // normA = sqrt(a1^2 + a2^2 + ... + an^2) or magnitude of vector a
  const normA = Math.sqrt(dotProduct(a, a));
  // normB = sqrt(b1^2 + b2^2 + ... + bn^2) or magnitude of vector b
  const normB = Math.sqrt(dotProduct(b, b));
  return dot / (normA * normB);
};

const openai = new OpenAI();

const data = loadInputJson<Food[]>("food.json");

console.log("What food do you like?");

process.stdin.addListener("data", async (input) => {
  let userInput = input.toString().trim();
  await recommendFoods(userInput);
});

const recommendFoods = async (input: string) => {
  const embeddings = await generateEmbeddings(input);

  const descriptionEmbeddings = await getFoodEmbeddings();

  const foodWithEmbeddings: FoodWithEmbedding[] = [];

  for (let i = 0; i < data.length; i++) {
    foodWithEmbeddings.push({
      name: data[i].name,
      description: data[i].description,
      embedding: descriptionEmbeddings.data[i].embedding,
    });
  }

  const similarities: {
    input: string;
    similarity: number;
  }[] = foodWithEmbeddings.map((food) => ({
    input: food.name,
    similarity: cosineSimilarity(food.embedding, embeddings.data[0].embedding),
  }));

  const sortedSimilarities = similarities.sort(
    (a, b) => b.similarity - a.similarity
  );

  console.log(`Recommended foods based on ${input}`);
  console.log(sortedSimilarities);
};

const getFoodEmbeddings = async () => {
  const fileName = "foodEmbeddings.json";
  const filePath = join(__dirname, fileName);
  if (existsSync(filePath)) {
    const descriptionEmbeddings =
      loadInputJson<CreateEmbeddingResponse>(fileName);
    return descriptionEmbeddings;
  } else {
    const descriptionEmbeddings = await generateEmbeddings(
      data.map((food) => food.description)
    );
    saveEmbeddingsToJson(descriptionEmbeddings, fileName);
    return descriptionEmbeddings;
  }
};

export const generateEmbeddings = async (input: string | string[]) => {
  const response = await openai.embeddings.create({
    input: input,
    model: "text-embedding-3-small",
  });
  console.log(response.data);
  return response;
};
