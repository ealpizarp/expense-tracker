import { NextApiRequest, NextApiResponse } from "next";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return res.status(500).json({
        error: "Failed to generate insights",
        details: errorData.error?.message || "Unknown error",
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return res.status(500).json({ error: "No content generated" });
    }

    // Parse the JSON response
    let insights;
    try {
      insights = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Raw response:", content);
      return res.status(500).json({
        error: "Failed to parse AI response",
        details: "Invalid JSON format",
      });
    }

    // Validate the response format
    if (!Array.isArray(insights)) {
      return res.status(500).json({
        error: "Invalid response format",
        details: "Expected an array of insights",
      });
    }

    // Ensure each insight has required fields
    const validatedInsights = insights.map((insight: any, index: number) => ({
      type: insight.type || "trend_analysis",
      title: insight.title || `Insight ${index + 1}`,
      description: insight.description || "No description available",
      recommendation: insight.recommendation || undefined,
      severity: ["low", "medium", "high"].includes(insight.severity)
        ? insight.severity
        : "low",
      icon: insight.icon || "💡",
    }));

    res.status(200).json({ insights: validatedInsights });
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
