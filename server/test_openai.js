require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testAPI() {
  try {
    const models = await openai.models.list();
    console.log("✅ OpenAI API is working!");
  } catch (error) {
    console.error("❌ OpenAI API Error:", error.message);
  }
}

testAPI();
