// Required modules
const axios = require("axios");
const dotenv = require("dotenv");
const questions = require("./questions");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

dotenv.config();

console.log("🔑 ENV:", process.env); // only for debug
console.log("✅ AUTHTOKEN:", process.env.AUTHTOKEN);

if (!process.env.AUTHTOKEN) {
  console.error("❌ AUTHTOKEN is missing. Check Railway Variables.");
  process.exit(1);
}

const authToken = process.env.AUTHTOKEN;

// API Configuration
const URL = "https://api.hyperbolic.xyz/v1/chat/completions";
const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${authToken}`,
};

const totalQuestions = questions.length;
console.log(`Total questions loaded: ${totalQuestions}`);

// Function to send API request
async function sendChatRequest(question) {
  const data = {
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct",
    max_tokens: 2048,
    temperature: 0.7,
    top_p: 0.9,
  };

  try {
    const response = await axios.post(URL, data, { headers: HEADERS });
    const answer = response.data.choices[0].message.content;
    return answer;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

// Main bot loop
async function runChatBot() {
  console.log("Starting automated chat bot...");
  let availableQuestions = [...questions];

  for (let i = 0; i < totalQuestions; i++) {
    if (availableQuestions.length === 0) {
      console.log("Ran out of questions unexpectedly!");
      break;
    }

    // Pick and remove a random question
    const index = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions.splice(index, 1)[0];

    console.log(`Question ${i + 1}: ${question}`);

    const answer = await sendChatRequest(question);

    console.log(`Answer: ${answer}`);

    // Random delay between 20-60 seconds
    const delay = Math.random() * (60 - 20) + 20;

    console.log(`Waiting ${delay.toFixed(1)} seconds before next question...`);

    await sleep(delay * 1000);
  }

  console.log(`Completed ${totalQuestions} questions!`);

  await sleep(delay * 20000);
  runChatBot();
}

// Run the bot
runChatBot();
