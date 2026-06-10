import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { researchAssistant } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, AIDisclaimer } from "@/components/AppShell";
import { Search, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { incrementMetric } from "@/lib/storage";
import { Markdown } from "@/components/Markdown";

export const Route = createFileRoute("/_app/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — Workplace AI" },
      { name: "description", content: "Summarize articles, extract insights, and answer research questions." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const run = useServerFn(researchAssistant);
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [article, setArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");

  async function go() {
    if (!topic.trim() && !article.trim() && !question.trim()) {
      toast.error("Add a topic, question, or article text.");
      return;
    }
    setLoading(true);
    try {
      const { text } = await run({ data: { topic, article, question } });
      setOut(text);
      incrementMetric("research");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to research");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(out);
    toast.success("Research copied");
  }

  return (
    <div>
      <PageHeader
        icon={Search}
        title="AI Research Assistant"
        description="Provide a topic, question, or paste an article — get a summary, insights, recommendations, and statistics."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Topic</Label>
              <Input
                placeholder="e.g. Remote work productivity trends"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Research question (optional)</Label>
              <Input
                placeholder="e.g. What are the biggest blockers in 2024?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Article / source text (optional)</Label>
              <Textarea
                rows={10}
                placeholder="Paste an article or report excerpt..."
                value={article}
                onChange={(e) => setArticle(e.target.value)}
              />
            </div>
            <Button onClick={go} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Research
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Findings</h3>
              <Button size="sm" variant="ghost" onClick={copy} disabled={!out}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
            <div className="min-h-[24rem] rounded-md border border-border bg-muted/30 p-4">
              {loading ? (
                <div className="text-sm text-muted-foreground">Researching...</div>
              ) : out ? (
                <Markdown>{out}</Markdown>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Summary, insights, and recommendations will appear here.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AIDisclaimer />
    </div>
  );
}
