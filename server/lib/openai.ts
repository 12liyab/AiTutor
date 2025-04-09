import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" }); // you can also use the `openai` object directly

interface QuestionAnswer {
  question: string;
  answer: string;
}

/**
 * Generates questions and answers based on document text
 */
export async function generateQuestionsFromText(
  text: string, 
  count: number = 5
): Promise<QuestionAnswer[]> {
  try {
    const prompt = `
      Analyze the following text and generate ${count} educational questions with detailed answers.
      The questions should test understanding of key concepts from the content.
      Include detailed explanations in the answers to aid learning.
      
      FORMAT YOUR RESPONSE AS A JSON ARRAY with objects containing "question" and "answer" fields.
      
      TEXT TO ANALYZE:
      ${text.slice(0, 10000)} // Limit text size to avoid token limits
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educator who creates high-quality study materials. Generate insightful questions with comprehensive answers based on document content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate questions: Empty response from OpenAI");
    }

    const parsedResponse = JSON.parse(content);
    
    // Check if the response has the expected format
    if (Array.isArray(parsedResponse.questions)) {
      return parsedResponse.questions;
    } else {
      // Handle different possible response formats
      return Array.isArray(parsedResponse) 
        ? parsedResponse 
        : Object.entries(parsedResponse).map(([key, value]) => {
            // If response is an object with numbered keys
            if (typeof value === 'object' && value !== null && 'question' in value && 'answer' in value) {
              return value as QuestionAnswer;
            }
            return null;
          }).filter(item => item !== null) as QuestionAnswer[];
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
