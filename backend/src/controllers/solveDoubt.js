

const { GoogleGenAI } = require("@google/genai");

const solveDoubt = async (req, res) => {

    try {

        const {
            messages,
            title,
            description,
            testCases,
            startCode
        } = req.body;

        console.log("Gemini Key:", process.env.GEMINI_KEY);

        const recentMessages = messages.slice(-10);

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_KEY
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: recentMessages,
            config: {
                systemInstruction: `
                Your existing prompt here...
                `
            }
        });

        console.log(response.text);

        return res.status(200).json({
            message: response.text
        });

    } catch (err) {

        console.error("Full Gemini Error:", err);

        return res.status(500).json({
            message:
                err?.message ||
                "Gemini API Error"
        });
    }
};

module.exports = solveDoubt;