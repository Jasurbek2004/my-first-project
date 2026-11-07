
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { question, country } = req.body || {};

    // Validate user input
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: "Please enter a legal question."
      });
    }

    if (question.length > 6000) {
      return res.status(400).json({
        error: "Your question is too long."
      });
    }

    if (!["United States", "Uzbekistan"].includes(country)) {
      return res.status(400).json({
        error: "Unsupported country."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "AI configuration is missing."
      });
    }

    const prompt = `
You are LegalMind AI, an educational legal assistant.

Jurisdiction: ${country}

User's legal question:
${question}

Instructions:
1. Answer in clear, simple English.
2. Explain the relevant legal principles.
3. Identify relevant statutes or cases only when you are confident they exist.
4. Never invent laws, case names, citations, or legal provisions.
5. If the applicable law depends on a US state, ask which state.
6. If information is uncertain, clearly say so.
7. Explain practical next steps when appropriate.
8. Do not claim to be a licensed attorney.
9. Remind users that your response is educational information, not legal advice.

Structure your answer with:
- Short Answer
- Legal Explanation
- Relevant Law (if known)
- Practical Next Steps
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1500
          }
        })
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status);

      return res.status(502).json({
        error: "AI service is temporarily unavailable."
      });
    }

    const data = await response.json();

    const aiAnswer =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!aiAnswer) {
      return res.status(502).json({
        error: "AI could not generate an answer. Please try again."
      });
    }

    return res.status(200).json({
      answer: aiAnswer
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
};
