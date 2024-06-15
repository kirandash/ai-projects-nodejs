import { readFileSync, writeFileSync } from "fs";
import OpenAI from "openai";
import { join } from "path";

export type DataWithEmbeddings = {
  input: string;
  embeddings: number[];
};

const openai = new OpenAI();

export const generateEmbeddings = async (input: string | string[]) => {
  const response = await openai.embeddings.create({
    input: input,
    model: "text-embedding-3-small",
  });
  console.log(response.data);
  return response;
};

export const loadInputJson = <T>(fileName: string): T => {
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

const main = async () => {
  const input = loadInputJson<string[]>("inputstatements.json");
  const embeddings = await generateEmbeddings(input);
  const dataWithEmbeddings: DataWithEmbeddings[] = input.map(
    (input, index) => ({
      input,
      embeddings: embeddings.data[index].embedding,
    })
  );
  saveEmbeddingsToJson(dataWithEmbeddings, "dataWithEmbeddings2.json");
};

// main();

// generateEmbeddings(["Hello", "world"]);
