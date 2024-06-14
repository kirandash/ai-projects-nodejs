import OpenAI from "openai";

const openai = new OpenAI();

const getTrainsBetweenStations = (
  origin: string,
  destination: string
): string[] => {
  if (origin === "Delhi" && destination === "Mumbai") {
    return ["Train 1", "Train 2", "Train 3", "Rajdhani"];
  } else if (origin === "Mumbai" && destination === "Delhi") {
    return ["Shatabdi", "Duronto", "Train 4"];
  }
  return ["Premium Train", "Express Train"];
};

const bookTicket = (train: string): string | "UNAVAILABLE" => {
  if (train === "Rajdhani") {
    return "334456";
  } else {
    return "UNAVAILABLE";
  }
};

const history: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: "Hello! I am Train Reservation Assistant. How can I help you?",
  },
];

const callOpenAIWithFunctions = async () => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: history,
    temperature: 0,
    tools: [
      {
        type: "function",
        function: {
          name: "getTrainsBetweenStations",
          parameters: {
            type: "object",
            properties: {
              origin: {
                type: "string",
                description: "The origin station",
              },
              destination: {
                type: "string",
                description: "The destination station",
              },
            },
            required: ["origin", "destination"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "bookTicket",
          parameters: {
            type: "object",
            properties: {
              train: {
                type: "string",
                description: "The train name",
              },
            },
            required: ["train"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  const shouldInvokeFunction =
    response.choices[0].finish_reason === "tool_calls";

  if (shouldInvokeFunction) {
    const toolCall = response.choices[0].message.tool_calls?.[0];
    if (!toolCall) {
      return;
    }
    const functionName = toolCall.function.name;

    if (functionName === "getTrainsBetweenStations") {
      const rawArguments = toolCall.function.arguments;
      const { origin, destination } = JSON.parse(rawArguments);
      const trains = getTrainsBetweenStations(origin, destination);
      history.push(response.choices[0].message);
      history.push({
        role: "tool",
        content: trains.toString(),
        tool_call_id: toolCall.id,
      });
    }

    if (functionName === "bookTicket") {
      const rawArguments = toolCall.function.arguments;
      const { train } = JSON.parse(rawArguments);
      const ticket = bookTicket(train);
      history.push(response.choices[0].message);
      history.push({
        role: "tool",
        content: ticket,
        tool_call_id: toolCall.id,
      });
    }
  }

  // call openai again with function calling response
  const finalResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: history,
    temperature: 0,
  });

  console.log(finalResponse.choices[0].message.content);
};

process.stdin.addListener("data", async (data) => {
  const userInput = data.toString().trim();
  history.push({ role: "user", content: userInput });
  await callOpenAIWithFunctions();
});
