import { OpenAI } from "openai";

const openai = new OpenAI();

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: "Act like a cool bro",
  },
];

const createChat = async () => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: context,
  });
  const responseMessage = response.choices[0].message;
  context.push(responseMessage);

  console.log(response.choices[0].message.content);
};

// process.stdin.addListener is used to read user input from the command line
process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim();
  context.push({
    role: "user",
    content: userInput,
  });
  await createChat();
});
