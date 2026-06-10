import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizeMeeting } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, AIDisclaimer } from "@/components/AppShell";
import { FileText, Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { incrementMetric } from "@/lib/storage";
import { Markdown } from "@/components/Markdown";
import jsPDF from "jspdf";

export const Route = createFileRoute("/_app/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — Workplace AI" },
      { name: "description", content: "Summarize meeting notes into executive summaries and action items." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");

  async function go() {
    if (notes.trim().length < 10) {
      toast.error("Paste your meeting notes first.");
      return;
    }
    setLoading(true);
    try {
      const { text } = await run({ data: { notes } });
      setOut(text);
      incrementMetric("summaries");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to summarize");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(out);
    toast.success("Summary copied");
  }

  function pdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    doc.setFontSize(16);
    doc.text("Meeting Summary", margin, margin);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(out, width);
    doc.text(lines, margin, margin + 24);
    doc.save("meeting-summary.pdf");
  }

  return (
    <div>
      <PageHeader
        icon={FileText}
        title="Meeting Notes Summarizer"
        description="Paste raw meeting notes and get an executive summary with decisions and action items."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-sm">Meeting Notes</h3>
            <Textarea
              rows={16}
              placeholder="Paste your meeting notes, transcript, or bullet points here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button onClick={go} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Summarize
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Summary</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={copy} disabled={!out}>
                  <Copy className="h-4 w-4" /> Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={pdf} disabled={!out}>
                  <Download className="h-4 w-4" /> PDF
                </Button>
              </div>
            </div>
            <div className="min-h-[24rem] rounded-md border border-border bg-muted/30 p-4">
              {loading ? (
                <div className="text-sm text-muted-foreground">Summarizing...</div>
              ) : out ? (
                <Markdown>{out}</Markdown>
              ) : (
                <div className="text-sm text-muted-foreground">Your summary will appear here.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AIDisclaimer />
    </div>
  );
}
