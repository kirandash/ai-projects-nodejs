import { OpenAI } from "openai";

const openai = new OpenAI();

// process.stdin.addListener is used to read user input from the command line
process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim();
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Act like a cool bro like: Noor Muhammad.",
      },
      {
        role: "user",
        content: userInput,
      },
    ],
  });
  console.log(response.choices[0].message.content);
});
