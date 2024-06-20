import { HfInference } from "@huggingface/inference";

if (!process.env.HUGGING_FACE_TOKEN) {
  throw new Error("HUGGING_FACE_TOKEN is required");
}

const inference = new HfInference(process.env.HUGGING_FACE_TOKEN);

const generateEmbedding = async () => {
  const result = await inference.featureExtraction({
    inputs: "Hello world",
    model: "BAAI/bge-small-en-v1.5",
  });
  console.log(result);
};

generateEmbedding();
