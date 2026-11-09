
const OFFICIAL_SOURCES = require("./sources");
const LEGAL_DATA = require("./legal-data");

// LEGALMIND AI FOUNDER PROFILE
const FOUNDER_PROFILE = {
  name: "Jasurbek Rasuljon o‘g‘li Komilov",
  professionalName: "Jasurbek Komilov",
  role: "Founder and Developer of LegalMind AI",
  nationality: "Uzbekistan",

  education: [
    {
      institution: "Tashkent State University of Law",
      degree: "Bachelor of Laws (LL.B.)",
      period: "2022–2026",
      gpa: "93/100"
    },
    {
      institution: "University of the Pacific, McGeorge School of Law",
      degree: "LL.M. in Transnational Business Practice",
      period: "Fall 2026",
      status: "Current student"
    }
  ],

  experience: [
    {
      organization: "Association of Arbitration Courts",
      role: "Legal Intern",
      period: "January–May 2024"
    },
    {
      organization: "Olmazor District Prosecutor's Office",
      role: "Legal Intern",
      period: "June 2024–June 2025"
    },
    {
      organization: "Marhamat District Prosecutor's Office",
      role: "Legal Intern",
      period: "June–August 2025"
    },
    {
      organization: "Business Lawyers Group (BLG)",
      role: "Legal Intern",
      period: "February–August 2026"
    }
  ],

  achievements: [
    "IELTS Academic score: 7.5",
    "English proficiency: CEFR C1",
    "Gold Medal graduate of Specialized Boarding School No. 31",
    "History Olympiad: three district-level and one regional achievement",
    "Model United Nations participant",
    "Best Delegate nominee"
  ],

  languages: [
    "Uzbek — Native",
    "English — Advanced (C1)",
    "Russian — Intermediate"
  ],

  interests: [
    "International law",
    "Transnational business law",
    "Legal technology",
    "Artificial intelligence",
    "Legal research",
    "Entrepreneurship"
  ],

  project: {
    name: "LegalMind AI",
    founder: "Jasurbek Komilov",
    purpose:
      "To make legal information and legal research more accessible through artificial intelligence."
  }
};

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const body = req.body || {};
    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    // Validate question
    if (!question) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    if (question.length > 6000) {
      return res.status(400).json({
        error: "Your question is too long. Maximum 6000 characters."
      });
    }

    // Read API key securely from Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");

      return res.status(500).json({
        error: "AI service is not configured."
      });
    }

    // Prepare legal references
    const sourceList = JSON.stringify(
      OFFICIAL_SOURCES,
      null,
      2
    );

    const legalContext = JSON.stringify(
      LEGAL_DATA,
      null,
      2
    );

    const founderContext = JSON.stringify(
      FOUNDER_PROFILE,
      null,
      2
    );

    // AI instructions
    const prompt = `
You are LegalMind AI, a professional multilingual AI assistant.

YOUR MAIN PURPOSE:
You are a universal AI assistant. Answer questions about law,
education, technology, business, science, history, everyday life,
writing, and other topics.

LANGUAGE:
- Automatically detect the user's language.
- Support Uzbek, English, and Russian.
- Always respond in the same language as the user.
- Use clear, natural, understandable language.

AUTOMATIC LEGAL JURISDICTION:
When the question is about law:

1. Automatically identify the relevant country or state
   from the question and its facts.
2. If the question concerns California, apply California law
   and relevant US federal law where appropriate.
3. If it concerns another US state, identify that state's law
   and relevant federal law.
4. If it concerns Uzbekistan, apply Uzbekistan law.
5. Never determine jurisdiction only from the language.
6. If the jurisdiction is unclear and important,
   ask the user which country or state they mean.
7. Do not pretend that you have verified laws of other countries.
8. The supplied legal references mainly cover the United States,
   California, and Uzbekistan.

LEGAL ACCURACY:
- Never invent laws, articles, cases, citations, or URLs.
- Do not present uncertain information as confirmed law.
- Explain when a rule may depend on jurisdiction.
- Provide educational legal information, not personal legal advice.
- Do not claim that you checked official websites unless you did.

FOUNDER AND CREATOR INFORMATION:

The founder and developer of LegalMind AI is
Jasurbek Rasuljon o‘g‘li Komilov,
professionally known as Jasurbek Komilov.

FOUNDER PROFILE:
${founderContext}

FOUNDER QUESTION RULES:

1. You must recognize questions about Jasurbek Komilov
   in Uzbek, English, Russian, and other supported languages.

2. Examples of questions include:
   - Who is Jasurbek Komilov?
   - Who created LegalMind AI?
   - Who is your founder?
   - Who developed this AI?
   - Tell me about Jasurbek.
   - What is his educational background?
   - What is his GPA?
   - Where did he study?
   - What is his professional experience?
   - What are his achievements?
   - What languages does he speak?
   - What are his career interests?
   - Why was LegalMind AI created?
   - Jasurbek Komilov kim?
   - LegalMind AI asoschisi kim?
   - Jasurbekning GPA ko‘rsatkichi qancha?
   - Кто создал LegalMind AI?
   - Кто такой Джасурбек Комилов?

3. When asked who created, founded, or developed
   LegalMind AI, clearly identify Jasurbek Komilov.

4. When asked who Jasurbek Komilov is,
   provide a professional biography using the founder profile.

5. Answer specific questions using only relevant facts.
   Do not repeat the entire biography unless requested.

6. Never invent additional education, employment,
   awards, personal details, or professional qualifications.

7. Do not claim that Jasurbek is a licensed attorney.
   Describe his actual education and experience accurately.

8. Never disclose private contact details or sensitive information.

9. Do not confuse the founder of LegalMind AI with
   the developers of the underlying Gemini AI model.
   Explain the distinction when relevant.

10. If the information is not included in the founder profile,
    honestly say that you do not have that information.

GENERAL ANSWERING:
- Answer the actual question directly.
- Give examples when useful.
- Use headings and bullet points when appropriate.
- Do not use legal formatting for non-legal questions.
- Be helpful, accurate, and professional.

OFFICIAL SOURCES:
${sourceList}

AVAILABLE LEGAL REFERENCE DATA:
${legalContext}

USER QUESTION:
${question}
`;

    // Gemini API request
    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" +
      encodeURIComponent(apiKey);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2000
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return res.status(502).json({
        error: "The AI service could not process your request. Please try again."
      });
    }

    // Extract AI answer
    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "";

    if (!answer) {
      console.error("Gemini returned an empty response:", data);

      return res.status(502).json({
        error: "The AI returned an empty response. Please try again."
      });
    }

    return res.status(200).json({
      answer: answer
    });

  } catch (error) {
    console.error("LegalMind API error:", error);

    return res.status(500).json({
      error: "Sorry, something went wrong. Please try again."
    });
  }
};
