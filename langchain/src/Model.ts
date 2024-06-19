import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.8,
  maxTokens: 900,
  // verbose: true,
});

const main = async () => {
  // 1. invoke
  // const responseFirst = await model.invoke(
  //   'Give me a summary of the movie "Inception".'
  // );
  // console.log(responseFirst.content);
  // 2. batch
  // const response = await model.batch(["Hi", "How are you?"]);
  // console.log(response);
  // 3. stream
  const response = await model.stream(
    "hi give me recommendation for four movies"
  );
  for await (const res of response) {
    console.log(res.content);
  }
};

main();
