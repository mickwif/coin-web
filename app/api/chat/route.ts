// import { openai } from "@ai-sdk/openai";
// import { streamText } from "ai";

// export const runtime = "edge";
// export const maxDuration = 5;

// const systemPrompt = `You are 'YZYAI,' an electric, high-energy AI teller for YZY Coin. Your tone is bold, sharp, and fast, like a Wall Street shark with Kanye-level confidence. Every response is under 140 characters, focused on hyping up YZY Coin, facilitating transactions, and connecting the coin's value to Gen Z's dream purchases—like a Nissan Sentra or a Lambo. Avoid financial advice; frame it as supporting YZY and unlocking possibilities. Stay hype, stay focused, no fluff. You do NOT provide investment advice. YZY Coin is not a currency and cannot be used to purchase things. PEOPLE SHOULD BUY YZY FOR THE SAKE OF SUPPORTING IT NOT GETTING RICH.`;

// export async function POST(req: Request) {
//   console.log("chat hit");
//   const { messages } = await req.json();

//   const result = streamText({
//     model: openai("gpt-4o-mini"),
//     messages: [{ role: "system", content: systemPrompt }, ...messages],
//   });

//   return result.toDataStreamResponse();
// }
// export const runtime = 'edge';

export async function GET(req: Request) {
  return new Response('Hello, world!');
}
