import express from "express";
import OpenAI from "openai";
import Property from "../models/Property.js";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const bannedWords = ["abuse", "hate", "kill", "sex"];

router.post("/", protect, aiLimiter, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.length > 500) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const lowerMsg = message.toLowerCase();

    if (bannedWords.some(word => lowerMsg.includes(word))) {
      return res.status(400).json({
        message: "Inappropriate content not allowed",
      });
    }

    // 🔥 STEP 1: INTELLIGENT QUERY DETECTION

    let properties = [];

    // 💰 Most expensive
    if (lowerMsg.includes("expensive") || lowerMsg.includes("highest")) {
      properties = await Property.find().sort({ price: -1 }).limit(3);
    }

    // 💸 Cheapest
    else if (lowerMsg.includes("cheap") || lowerMsg.includes("lowest")) {
      properties = await Property.find().sort({ price: 1 }).limit(3);
    }

    // 🏙️ City-based search
    else if (lowerMsg.includes("in ")) {
      const city = lowerMsg.split("in ")[1];
      properties = await Property.find({
        location: { $regex: city, $options: "i" },
      }).limit(5);
    }

    // 💵 Budget-based (example: under 50000)
    else if (lowerMsg.match(/\d+/)) {
      const price = parseInt(lowerMsg.match(/\d+/)[0]);

      properties = await Property.find({
        price: { $lte: price },
      }).limit(5);
    }

    // 🏠 Default → show some properties
    else {
      properties = await Property.find().limit(5);
    }

    // 🔥 STEP 2: NO DATA CASE
    if (!properties.length) {
      return res.json({
        reply: "No matching properties found on our platform.",
      });
    }

    // 🔥 STEP 3: CREATE CONTEXT FROM DB
    const context = properties
      .map(
        p =>
          `${p.title} in ${p.location} for ₹${p.price} with ${p.beds} beds`
      )
      .join("\n");

    // 🔥 STEP 4: SEND TO AI (ONLY FOR FORMATTING)
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are a smart real estate assistant.

ONLY use the data below:
${context}

Rules:
- Do NOT make up properties
- Suggest best options
- Be short and helpful
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error("AI Error:", error);

    if (error.status === 429) {
      return res.json({
        reply: "Server busy. Please try again in a few seconds.",
      });
    }

    res.status(500).json({ message: "AI Failed" });
  }
});

export default router;