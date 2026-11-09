const OFFICIAL_SOURCES = require("./sources");
const LEGAL_DATA = require("./legal-data");
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
    const legalInfo = LEGAL_DATA[country];

const legalContext = legalInfo
  ? legalInfo.laws.map(law =>
      `Title: ${law.title}
Topic: ${law.topic}
Reference summary: ${law.summary}
Official URL: ${law.url}`
    ).join("\n\n")
  : "No curated legal references are available for this jurisdiction.";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "AI configuration is missing."
      });
    }

    const prompt = `
You are LegalMind AI, a multilingual general-purpose AI assistant with strong expertise in law.

GENERAL CAPABILITIES:
- Answer questions on any topic, not only law.
- Help with science, technology, history, education, business, finance, languages, writing, and everyday life.
- Respond naturally to greetings and casual conversations.
- Explain complex topics in simple and understandable language.
- Never reject a question simply because it is not about law.
LANGUAGE SUPPORT:
- Support Uzbek, English, and Russian.
- Automatically detect the language of the user's question.
- Always respond in the same language as the user.
- If the user explicitly requests another supported language, follow that request.
- Use natural, grammatically correct language.
JURISDICTION:
$

USER'S QUESTION:
$

OFFICIAL SOURCE PORTALS:
$

These are official source portals, not retrieved legal texts.
Never claim that you accessed or verified a statute unless its actual text was retrieved and checked.

CURATED LEGAL REFERENCES:
$

Use these references only when relevant.
These are summaries, not full statutory texts.
Never present a summary as a direct quotation.
If a relevant provision is not included, clearly state that it has not been verified in the current legal database.

LEGAL ACCURACY RULES:
1. Apply the selected jurisdiction when answering legal questions.
2. If US law depends on the state, identify the state or ask the user.
3. Cite statutes and cases only when confident they exist.
4. Never invent laws, cases, citations, or URLs.
5. Explain important exceptions to legal rules.
6. Distinguish established law from interpretation and uncertainty.
7. Use official government sources when reliable source information is available.
8. Never claim to have checked a source if you have not.
9. Give practical next steps when relevant.
10. Do not claim to be a licensed attorney.
11. Explain that legal information is educational, not legal advice.
RESPONSE STYLE:
- Be helpful, accurate, professional, and friendly.
- Adapt the length of the answer to the question.
- Use headings and bullet points when useful.
- Ask clarifying questions when necessary.
- Do not add irrelevant recommendations.
LEGAL ANSWER FORMAT:
For legal questions, use these sections when appropriate:
- Short Answer
- Legal Explanation
- Relevant Law
- Exceptions
- Official Sources
- Practical Next Steps
- Disclaimer
For non-legal questions, answer naturally without forcing a legal format.
`;
</CodeBlock>
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
