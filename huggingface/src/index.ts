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

const translate = async () => {
  const result = await inference.translation({
    inputs: "Hello world",
    // model: "Helsinki-NLP/opus-mt-en-de",
    model: "t5-small",
  });
  console.log(result);
};

const translateWithParam = async () => {
  const result = await inference.translation({
    inputs: "Hola mundo",
    // model: "Helsinki-NLP/opus-mt-en-de",
    model: "facebook/nllb-200-distilled-600M",
    // @ts-ignore
    parameters: {
      src_lang: "spa_Latn",
      tgt_lang: "eng-Latn",
    },
  });
  console.log(result);
};

const questionAnswering = async () => {
  const result = await inference.questionAnswering({
    inputs: {
      context:
        "The Apollo program, also known as Project Apollo, was the third United States human spaceflight program carried out by the National Aeronautics and Space Administration (NASA), which accomplished landing the first humans on the Moon from 1969 to 1972.",
      question: "Who is Einstein?",
    },
  });
  console.log(result);
};

// generateEmbedding();
// translate();
// translateWithParam();
questionAnswering();
