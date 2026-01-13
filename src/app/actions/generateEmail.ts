'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { EmailGenerationRequest, EmailGenerationResponse } from "@/types/email";

const generateEmailPrompt = (
  commits: EmailGenerationRequest["commits"],
  timeRange: EmailGenerationRequest["timeRange"],
  tone: string = "professional"
) => {
  const commitMessages = commits
    .map((commit) => {
      const message = commit.commit.message.split("\n")[0];
      const repo = commit.repository;
      return `- ${message} (${repo})`;
    })
    .join("\n");

  const dateRange = `${new Date(
    timeRange.startDate
  ).toLocaleDateString()} to ${new Date(
    timeRange.endDate
  ).toLocaleDateString()}`;

  let toneInstruction = "";
  switch (tone) {
    case "casual":
      toneInstruction = "Use a casual and friendly tone.";
      break;
    case "concise":
      toneInstruction = "Be extremely concise and to the point. Use bullet points primarily.";
      break;
    case "enthusiastic":
      toneInstruction = "Use an enthusiastic and energetic tone.";
      break;
    case "professional":
    default:
      toneInstruction = "Use plain, professional, and straightforward language.";
      break;
  }

  return `Please write a ${tone} email summarizing the following work completed between ${dateRange}.

Commits:
${commitMessages}

Guidelines:
1. Group similar tasks together for clarity.
2. Limit the email body to about 200 words (maximum total length: 250 words).
3. Avoid vague or generic phrases like "significant improvement", "major enhancement", "various updates", or "general fixes".
4. Clearly describe what was done, why it was done, and the benefit or outcome.
5. ${toneInstruction}
6. Highlight the key achievements and their actual impact.
7. Format the email with:
   - A subject line
   - A proper greeting
   - A clear and concise body
   - A closing signature`;
};

export async function generateEmailAction(
  request: EmailGenerationRequest & { tone?: string }
): Promise<EmailGenerationResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Gemini API key is not configured."
      );
    }

    // Initialize Gemini API with your API key
    const genAI = new GoogleGenerativeAI(apiKey);

    // Configure the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = generateEmailPrompt(request.commits, request.timeRange, request.tone);

    // Generate content
    const result = await model.generateContent(prompt);

    if (!result.response) {
      throw new Error("Failed to generate response from Gemini API");
    }

    const text = result.response.text();

    // Split the text into subject and body
    const parts = text.split("\n");
    let subject = "";
    let body = text;

    // Look for "Subject:" line
    const subjectIndex = parts.findIndex((part) =>
      part.toLowerCase().startsWith("subject:")
    );

    if (subjectIndex !== -1) {
      subject = parts[subjectIndex].replace(/^subject:\s*/i, "");
      body = parts
        .slice(subjectIndex + 1)
        .join("\n")
        .trim();
    }

    return {
      email: {
        subject,
        body,
      },
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      email: {
        subject: "",
        body: "",
      },
      error:
        error instanceof Error ? error.message : "Failed to generate email",
    };
  }
}
