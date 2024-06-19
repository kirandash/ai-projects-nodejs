import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.8,
});

const question = "How was this PDF created?";

const main = async () => {
  // Create a web loader
  const loader = new PDFLoader("sample-1.pdf", {
    splitPages: false,
  });
  const docs = await loader.load();
  const splitter = new RecursiveCharacterTextSplitter({
    separators: [`. \n`],
  });
  const splittedDocs = await splitter.splitDocuments(docs);

  // Create an embeddings instance
  const embeddings = new OpenAIEmbeddings();
  // Create a vector store (in memory for this example)
  const vectorStore = new MemoryVectorStore(embeddings);

  // Add documents to the vector store
  await vectorStore.addDocuments(splittedDocs);

  // Retrieve the top 3 most similar documents
  const retriever = vectorStore.asRetriever({
    k: 3,
  });

  const result = await retriever.invoke(question);
  const resultDocuments = result.map((doc) => doc.pageContent);

  // build template for chat
  const template = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Answer to users question based on the following context: {context}.",
    ],
    ["user", "{query}"],
  ]);

  const chain = template.pipe(model);
  const response = await chain.invoke({
    query: question,
    context: resultDocuments,
  });
  console.log(response.content);
};

main();
