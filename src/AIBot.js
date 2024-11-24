const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");
require("dotenv").config();

const contextFilePath = path.join(__dirname, "./context/mydata.txt");
const context = fs.readFileSync(contextFilePath, "utf-8");

const contextFilePathRetail = path.join(__dirname, "./context/TechZone.txt");
const contextRetail = fs.readFileSync(contextFilePathRetail, "utf-8");

const groq = new Groq({
  apiKey: process.env.GROQ_ACCESS_TOKEN,
});

async function getAnswerFromGroq(question, context) {
  try {
    const params = {
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Here is the restaurant's details: ${context}`,
        },
        {
          role: "system",
          content: `If you dont find the answer in the provided context, please provide the phone number from the context file to call or message directly. If user wants to order something then they can call at the provided number.`,
        },
        { role: "user", content: question },
      ],
      model: "llama3-8b-8192",
    };

    const chatCompletion = await groq.chat.completions.create(params);
    const answer = chatCompletion.choices[0].message.content;

    return answer;
  } catch (error) {
    console.error("Error getting answer from Groq:", error);
    return `Sorry, I could not process your request at the moment.
    Please call or message restaurant directly at 0300 9542683 for further information.`;
  }
}

const askGroq = async (question, type = 1) => {
  const answer = await getAnswerFromGroq(
    question,
    type ? context : contextRetail
  );
  return answer;
};

module.exports = askGroq;
