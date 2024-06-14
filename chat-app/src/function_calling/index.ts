import OpenAI from "openai";

const openai = new OpenAI();

const getCurrentTimeAndDate = () => {
  const date = new Date();
  return date.toLocaleString();
};

const callOpenAIWithFunctionCalling = async () => {
  const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "Act like a cool bro",
    },
    {
      role: "user",
      content: "what is the current date and time?",
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: context,
    // Configure the function calling
    tools: [
      {
        type: "function",
        function: {
          name: "getCurrentTimeAndDate",
          description: "Get the current time and date",
        },
      },
    ],
    tool_choice: "auto", // openai will decide which tool to use
  });
  console.log("First openai response:", response.choices[0].message.content);

  const shouldInvokeFunction =
    response.choices[0].finish_reason === "tool_calls";
  const toolCall = response.choices[0].message.tool_calls?.[0];

  if (!toolCall) {
    return;
  }
  if (shouldInvokeFunction) {
    const functionName = toolCall.function.name;

    if (functionName === "getCurrentTimeAndDate") {
      const functionResponse = getCurrentTimeAndDate();
      context.push(response.choices[0].message);
      context.push({
        role: "tool",
        content: functionResponse,
        tool_call_id: toolCall.id,
      });
    }
  }

  const finalResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: context,
  });
  console.log(
    "Final OpenAI response:",
    finalResponse.choices[0].message.content
  );
};

callOpenAIWithFunctionCalling();
