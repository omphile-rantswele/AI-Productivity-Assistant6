import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { planTasks } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, AIDisclaimer } from "@/components/AppShell";
import { ListChecks, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { incrementMetric } from "@/lib/storage";
import { Markdown } from "@/components/Markdown";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({
    meta: [
      { title: "Task Planner — Workplace AI" },
      { name: "description", content: "Prioritize tasks and build an optimal daily and weekly plan." },
    ],
  }),
  component: TasksPage,
});

const SAMPLE = `- Finish Q3 report (high, Fri)
- Review marketing brief (medium, Wed)
- Reply to client emails (high, today)
- Schedule team 1:1s (low, this week)
- Prep board deck (high, next Mon)`;

function TasksPage() {
  const run = useServerFn(planTasks);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");

  async function go() {
    if (input.trim().length < 5) {
      toast.error("List a few tasks first.");
      return;
    }
    setLoading(true);
    try {
      const { text } = await run({ data: { tasks: input } });
      setOut(text);
      incrementMetric("plans");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to plan");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(out);
    toast.success("Plan copied");
  }

  return (
    <div>
      <PageHeader
        icon={ListChecks}
        title="AI Task Planner"
        description="Enter tasks with optional deadlines and priorities. Get a prioritized plan and time-optimization tips."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Your Tasks</h3>
              <Button size="sm" variant="ghost" onClick={() => setInput(SAMPLE)}>
                Load example
              </Button>
            </div>
            <Textarea
              rows={14}
              placeholder={`One task per line. Optionally add priority and deadline, e.g.\n- Send proposal (high, Fri)`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button onClick={go} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />}
              Build Plan
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Plan</h3>
              <Button size="sm" variant="ghost" onClick={copy} disabled={!out}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
            <div className="min-h-[24rem] rounded-md border border-border bg-muted/30 p-4">
              {loading ? (
                <div className="text-sm text-muted-foreground">Building your plan...</div>
              ) : out ? (
                <Markdown>{out}</Markdown>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Your priority matrix, daily schedule, and weekly plan will appear here.
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
