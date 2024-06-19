import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  StringOutputParser,
  CommaSeparatedListOutputParser,
} from "@langchain/core/output_parsers";
import { StructuredOutputParser } from "langchain/output_parsers";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.8,
});

const stringOutputParser = async () => {
  const prompt = ChatPromptTemplate.fromTemplate(
    "Write a summary of the movie {movieName}."
  );
  const parser = new StringOutputParser();

  const chain = prompt.pipe(model).pipe(parser);
  const response = await chain.invoke({
    movieName: "inception",
  });
  console.log(response);
};

const commaSeparatedListOutputParser = async () => {
  const prompt = ChatPromptTemplate.fromTemplate(
    "Provide six movies, separated by commas, for the genre: {genre}. Make it comma separated. And don't add numbered list"
  );
  const parser = new CommaSeparatedListOutputParser();

  const chain = prompt.pipe(model).pipe(parser);
  const response = await chain.invoke({
    genre: "drama",
  });
  console.log(response);
};

const structuredOutputParser = async () => {
  const templatePrompt = ChatPromptTemplate.fromTemplate(
    `Extract information from the following text.
    Formatting instructions: {formattingInstructions}
    Text: {text}
    `
  );

  const parser = StructuredOutputParser.fromNamesAndDescriptions({
    name: "the name of the user",
    age: "the age of the user",
    interests: "what the user is interested in",
  });

  const chain = templatePrompt.pipe(model).pipe(parser);

  const result = await chain.invoke({
    text: "Kiran is 32 years old and is interested in reading books and programming.",
    formattingInstructions: parser.getFormatInstructions(),
  });

  console.log(result);
};

// stringOutputParser();
// commaSeparatedListOutputParser();
structuredOutputParser();
