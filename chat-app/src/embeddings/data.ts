import OpenAI from "openai";

const openai = new OpenAI();

const generateEmbeddings = async (input: string | string[]) => {
  const response = await openai.embeddings.create({
    input: input,
    model: "text-embedding-3-small",
  });
  console.log(response.data);
  return response;
};

generateEmbeddings(["Hello", "world"]);
