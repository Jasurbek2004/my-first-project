const OFFICIAL_SOURCES = require("./sources");
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
const sourceList = (OFFICIAL_SOURCES[country] || [])
  .map(source =>
    `- ${source.name} (${source.jurisdiction}): ${source.url}`
  )
  .join("\n");
    
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
OFFICIAL SOURCE PORTALS:
${sourceList}

These are official source portals, not retrieved legal texts.
Never claim that you accessed or verified a statute unless
its actual text was retrieved and checked.
Use only genuine legal citations.
If the exact legal provision cannot be verified, say so.
IMPORTANT LEGAL ACCURACY RULES:

1. Answer in clear, simple English.
2. Apply only the law of the selected jurisdiction.
3. If US law depends on the state, identify the state or ask the user.
4. Cite statutes with their correct names and section numbers only when confident.
5. Never invent statutes, case names, court decisions, citations, or URLs.
6. Explain important exceptions to general legal rules.
7. Distinguish established law from interpretation or uncertainty.
8. Use official government sources whenever reliable source information is available.
9. Never claim that a source has been checked or verified if it has not.
10. If you cannot verify a legal provision, clearly say so.
11. Give practical next steps relevant to the question.
12. Do not claim to be a licensed attorney.
13. State that the answer is educational information, not legal advice.

ANSWER FORMAT:

- Short Answer
- Legal Explanation
- Relevant Law
- Exceptions (if applicable)
- Official Sources (only genuine sources you can identify confidently)
- Practical Next Steps
- Disclaimer

Do not include irrelevant recommendations.
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
