const { GoogleGenAI } = require("@google/genai");

const solveDoubt = async (req, res) => {
  try {
    const { messages, title, description, testCases, startCode } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages,
      config: {
        systemInstruction: `...your same prompt...`,
      },
    });

    res.status(201).json({
      message: response.text,  // ✅ FIXED
    });

  } catch (err) {
    console.error("ERROR:", err); // 🔥 VERY IMPORTANT

    res.status(500).json({
      message: err.message, // show real error
    });
  }
};

module.exports = solveDoubt;