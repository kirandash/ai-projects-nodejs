import { DataWithEmbeddings, generateEmbeddings, loadInputJson } from "./main";

const dotProduct = (a: number[], b: number[]) => {
  return a.reduce((acc, val, index) => acc + val * b[index], 0);
  // return a
  //   .map((val, index) => val * b[index])
  //   .reduce((acc, val) => acc + val, 0);
};

// angle between two vectors
const cosineSimilarity = (a: number[], b: number[]) => {
  const dot = dotProduct(a, b);
  // normA = sqrt(a1^2 + a2^2 + ... + an^2) or magnitude of vector a
  const normA = Math.sqrt(dotProduct(a, a));
  // normB = sqrt(b1^2 + b2^2 + ... + bn^2) or magnitude of vector b
  const normB = Math.sqrt(dotProduct(b, b));
  return dot / (normA * normB);
};

const main = async () => {
  const dataWithEmbeddings = loadInputJson<DataWithEmbeddings[]>(
    "dataWithEmbeddings2.json"
  );

  const input = "number of kangaroos in australia";

  const inputEmbeddings = await generateEmbeddings(input);

  const similarities: {
    input: string;
    similarity: number;
  }[] = dataWithEmbeddings.map((data) => ({
    input: data.input,
    similarity: cosineSimilarity(
      data.embeddings,
      inputEmbeddings.data[0].embedding
    ),
  }));

  const sortedSimilarities = similarities.sort(
    (a, b) => b.similarity - a.similarity
  );

  console.log(`Similarity of ${input}`, sortedSimilarities);
};

main();
