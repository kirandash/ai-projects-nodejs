import { OpenAI } from "openai";

// Create an instance of the OpenAI class
const openai = new OpenAI(process.env.OPENAI_API_KEY);

const main = async () => {
  // Define the prompt
  const prompt =
    "I need to start resistance training. Can you create a 7-day workout plan for me to ease into it? Limit it in 100 words or less.";

  // send api request
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Print the response
  console.log(response.choices[0].message.content);
};

main();
