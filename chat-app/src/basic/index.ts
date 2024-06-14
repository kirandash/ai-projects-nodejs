import { OpenAI } from "openai";
import { encoding_for_model } from "tiktoken";

const openai = new OpenAI();
const encoder = encoding_for_model("gpt-3.5-turbo");

const MAX_TOKENS = 500;

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

  if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
    removeOlderTokens();
  }

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

const getContextLength = () => {
  let length = 0;
  context.forEach(
    (message: OpenAI.Chat.Completions.ChatCompletionMessageParam) => {
      if (typeof message.content === "string") {
        length += encoder.encode(message.content).length;
      } else if (Array.isArray(message.content)) {
        message.content.forEach((content) => {
          if (content.type === "text") {
            length += encoder.encode(content.text).length;
          }
        });
      }
    }
  );
  return length;
};

const removeOlderTokens = () => {
  let contextLength = getContextLength();
  while (contextLength > MAX_TOKENS) {
    for (let i = 0; i < context.length; i++) {
      const message = context[i];
      if (message.role !== "system") {
        context.splice(i, 1);
        contextLength = getContextLength();
        console.log("Updated context length: ", contextLength);
        break;
      }
    }
  }
};
