const express = require("express");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// ✅ Upload audio to AssemblyAI & request transcription
async function transcribeAudio(audioUrl) {
  try {
    console.log("📤 Sending audio to AssemblyAI...");

    const response = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      { audio_url: audioUrl },
      { headers: { Authorization: process.env.ASSEMBLYAI_API_KEY } }
    );

    return response.data.id; // Transcript ID
  } catch (error) {
    console.error(
      "❌ AssemblyAI Upload Error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to upload audio to AssemblyAI");
  }
}

// ✅ Check transcription status
async function getTranscription(transcriptId) {
  try {
    while (true) {
      const result = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { Authorization: process.env.ASSEMBLYAI_API_KEY },
        }
      );

      if (result.data.status === "completed") {
        return result.data.text; // ✅ Return final transcription
      } else if (result.data.status === "failed") {
        throw new Error("Transcription failed.");
      }

      console.log("⏳ Waiting for transcription...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
    }
  } catch (error) {
    console.error(
      "❌ AssemblyAI Transcription Error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to get transcription from AssemblyAI");
  }
}

// ✅ API Route to Transcribe Audio
router.post("/transcribe", async (req, res) => {
  const { audio_url } = req.body;
  if (!audio_url) {
    return res.status(400).json({ error: "No audio URL provided" });
  }

  try {
    console.log("📥 Downloading audio from:", audio_url);

    // ✅ Step 1: Upload to AssemblyAI
    const transcriptId = await transcribeAudio(audio_url);

    // ✅ Step 2: Get the transcription result
    const transcription = await getTranscription(transcriptId);

    console.log("✅ Transcription received:", transcription);
    res.json({ transcription });
  } catch (error) {
    console.error("❌ Error processing transcription:", error.message);
    res
      .status(500)
      .json({ error: "Transcription failed", details: error.message });
  }
});

module.exports = router;
