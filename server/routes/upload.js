const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const router = express.Router();

// ✅ Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ✅ Configure Multer (store in memory)
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    console.error("❌ No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const uniqueFilename = `${Date.now()}-${req.file.originalname}`;
    console.log(`📂 Uploading ${uniqueFilename} to Supabase...`);

    // ✅ Use fetch() with duplex: "half"
    const response = await fetch(
      `${process.env.SUPABASE_URL}/storage/v1/object/audio-uploads/${uniqueFilename}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
          "Content-Type": req.file.mimetype,
        },
        body: req.file.buffer,
        duplex: "half", // ✅ Required for Node.js 18+
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase Upload Failed: ${response.statusText}`);
    }

    console.log("✅ File uploaded successfully");

    // ✅ Generate Public URL
    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/audio-uploads/${uniqueFilename}`;
    console.log("🌐 Public File URL:", fileUrl);

    res.json({ message: "File uploaded successfully", file_url: fileUrl });
  } catch (error) {
    console.error("❌ File upload error:", error.message);
    res
      .status(500)
      .json({
        error: "Error uploading file to Supabase",
        details: error.message,
      });
  }
});

module.exports = router;
