import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

const EmailInput = z.object({
  purpose: z.string().min(1),
  recipient: z.string().min(1),
  tone: z.string().min(1),
  keyPoints: z.string().min(1),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a professional workplace communication assistant. Write clear, concise business emails. Output exactly in this format with no preamble:\n\nSubject: <subject line>\n\n<email body with greeting, body paragraphs, clear call-to-action, and professional sign-off>",
      prompt: `Write an email for the following:
- Purpose: ${data.purpose}
- Recipient type: ${data.recipient}
- Tone: ${data.tone}
- Key points to include:\n${data.keyPoints}`,
    });
    return { text };
  });

const NotesInput = z.object({ notes: z.string().min(10) });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => NotesInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You summarize raw meeting notes into a structured executive report. Use clean Markdown with these exact H2 sections in order: ## Executive Summary, ## Key Discussion Points, ## Decisions Made, ## Action Items, ## Deadlines, ## Responsible Persons. Use bullet lists under each section. Be concise and corporate.",
      prompt: data.notes,
    });
    return { text };
  });

const TasksInput = z.object({ tasks: z.string().min(5) });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TasksInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a productivity coach. Given a list of tasks with optional deadlines and priorities, produce a structured plan in Markdown with these exact H2 sections in order: ## Priority Matrix (group as High Priority, Medium Priority, Low Priority bullet lists), ## Daily Schedule (today, time-blocked), ## Weekly Plan (Mon–Fri overview), ## Productivity Recommendations, ## Time Optimization Tips. Be practical and concise.",
      prompt: data.tasks,
    });
    return { text };
  });

const ResearchInput = z.object({
  topic: z.string().optional().default(""),
  article: z.string().optional().default(""),
  question: z.string().optional().default(""),
});

export const researchAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a research analyst. Output Markdown with these exact H2 sections in order: ## Summary, ## Key Insights, ## Recommendations, ## Important Statistics, ## Simplified Explanation (ELI5). Be factual and concise. If statistics are not given in the source, mark them as illustrative.",
      prompt: `Topic: ${data.topic || "(none)"}\nResearch question: ${data.question || "(none)"}\n\nArticle / source text:\n${data.article || "(none)"}`,
    });
    return { text };
  });
