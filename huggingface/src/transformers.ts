import { pipeline } from "@xenova/transformers";
import wavefile from "wavefile";

const generateEmbedding = async () => {
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  const result = await embedder("Hello, world!", {
    pooling: "mean",
    normalize: true,
  });
  console.log(result);
};

const genText = async () => {
  const textGenerator = await pipeline(
    "text2text-generation",
    "Xenova/LaMini-Flan-T5-783M"
  );
  const result = await textGenerator("Please suggest some songs for a party.", {
    max_new_tokens: 100,
    temperature: 0.8,
    repetition_penalty: 2.0,
  });
  console.log(result);
};

const speecRecognition = async () => {
  // 1. Creating a transcriber
  let transcriber = await pipeline(
    "automatic-speech-recognition",
    "Xenova/whisper-small.en"
  );
  // 2. Fetching the audio file
  let url =
    "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav";
  // convert the audio file to a buffer
  let buffer = Buffer.from(await fetch(url).then((item) => item.arrayBuffer()));

  // 3. Processing our audio file to match the model's requirements from huggingface
  let wav = new wavefile.WaveFile(buffer);
  wav.toBitDepth("32f"); // convert to 32-bit float because the pipeline expects it
  wav.toSampleRate(16000); // convert to 16kHz sampling rate because the whisper-small.en model expects it

  // 4. Extracting the audio data
  let audioData = wav.getSamples();
  if (Array.isArray(audioData)) {
    if (audioData.length > 1) {
      const SCALING_FACTOR = Math.sqrt(2);

      // Merge all the channels into one i.e. to save some memory
      for (let i = 0; i < audioData[0].length; i++) {
        audioData[0][i] =
          (SCALING_FACTOR * (audioData[0][i] + audioData[1][i])) / 2;
      }
    }

    // select the first channel
    audioData = audioData[0];
  }

  // Transcribe the audio
  let result = await transcriber(audioData);
  console.log(result);
};

// generateEmbedding();
// genText();
speecRecognition();
