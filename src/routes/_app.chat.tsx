import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, AIDisclaimer } from "@/components/AppShell";
import { MessageSquare, Send, Trash2, Loader2, Bot, User } from "lucide-react";
import { Markdown } from "@/components/Markdown";

export const Route = createFileRoute("/_app/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Workplace AI" },
      { name: "description", content: "Ask the AI assistant anything about workplace productivity." },
    ],
  }),
  component: ChatPage,
});

const STORAGE_KEY = "ai-wpa:chat-messages";
const TS_KEY = "ai-wpa:chat-timestamps";

const STARTERS = [
  "Draft an email to a client requesting a project update",
  "Summarize the key points of a quarterly report",
  "Create a project schedule for launching a new product",
  "Explain the concept of OKRs in simple terms",
];

function loadStored(): { messages: UIMessage[]; ts: Record<string, number> } {
  if (typeof window === "undefined") return { messages: [], ts: {} };
  try {
    const m = localStorage.getItem(STORAGE_KEY);
    const t = localStorage.getItem(TS_KEY);
    return {
      messages: m ? (JSON.parse(m) as UIMessage[]) : [],
      ts: t ? JSON.parse(t) : {},
    };
  } catch {
    return { messages: [], ts: {} };
  }
}

function ChatPage() {
  const initial = useRef(loadStored());
  const [timestamps, setTimestamps] = useState<Record<string, number>>(initial.current.ts);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    messages: initial.current.messages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => console.error(e),
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    setTimestamps((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const m of messages) {
        if (!next[m.id]) {
          next[m.id] = Date.now();
          changed = true;
        }
      }
      if (changed) localStorage.setItem(TS_KEY, JSON.stringify(next));
      return changed ? next : prev;
    });
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const busy = status === "submitted" || status === "streaming";

  async function submit(text: string) {
    if (!text.trim() || busy) return;
    setInput("");
    await sendMessage({ text });
    inputRef.current?.focus();
  }

  function clearChat() {
    setMessages([]);
    setTimestamps({});
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TS_KEY);
    inputRef.current?.focus();
  }

  return (
    <div>
      <PageHeader
        icon={MessageSquare}
        title="AI Chatbot Assistant"
        description="Ask anything about workplace productivity — drafting, planning, summarizing, explaining."
      >
        <Button variant="outline" size="sm" onClick={clearChat} disabled={messages.length === 0}>
          <Trash2 className="h-4 w-4" /> Clear chat
        </Button>
      </PageHeader>

      <Card className="shadow-[var(--shadow-card)] overflow-hidden">
        <CardContent className="p-0 flex flex-col h-[68vh]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
            {messages.length === 0 && (
              <div className="text-center max-w-md mx-auto pt-8">
                <div
                  className="mx-auto h-12 w-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Bot className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-1">How can I help you today?</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Try one of these starters:
                </p>
                <div className="grid sm:grid-cols-2 gap-2 text-left">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="text-sm rounded-md border border-border p-3 hover:border-primary hover:bg-primary/5 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              const isUser = m.role === "user";
              const ts = timestamps[m.id];
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                    {isUser ? (
                      <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap">
                        {text}
                      </div>
                    ) : (
                      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm">
                        <Markdown>{text}</Markdown>
                      </div>
                    )}
                    {ts && (
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {new Date(ts).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {status === "submitted" && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="border-t border-border p-3 flex items-end gap-2 bg-background"
          >
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about work…"
              rows={1}
              className="min-h-[44px] max-h-40 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
            />
            <Button type="submit" disabled={busy || !input.trim()} size="icon">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AIDisclaimer />
    </div>
  );
}
