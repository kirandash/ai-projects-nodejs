import OpenAI from "openai";

const openai = new OpenAI();

const getCurrentTimeAndDate = () => {
  const date = new Date();
  return date.toLocaleString();
};

const getTaskStatus = (taskId: string) => {
  console.log("Getting task status for task id:", taskId);
  if (parseInt(taskId) % 2 === 0) {
    return "Task is completed";
  } else {
    return "Task is pending";
  }
};

const callOpenAIWithFunctionCalling = async () => {
  const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "Act like a cool bro. You are an assistant who can also give current time and date and task information.",
    },
    // {
    //   role: "user",
    //   content: "what is the current date and time?",
    // },
    // {
    //   role: "user",
    //   content: "what is the status of task 343",
    // },
    {
      role: "user",
      content: "what is the status of task 343",
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
      {
        type: "function",
        function: {
          name: "getTaskStatus",
          description: "Get the status of a task",
          parameters: {
            type: "object",
            properties: {
              taskId: {
                type: "string",
                description: "The task ID",
              },
            },
            required: ["taskId"],
          },
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

    if (functionName === "getTaskStatus") {
      // extract parameters from tool call
      const argRaw = toolCall.function.arguments;
      const parsedArgs = JSON.parse(argRaw);
      const functionResponse = getTaskStatus(parsedArgs.taskId);
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
