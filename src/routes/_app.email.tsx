import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateEmail } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, AIDisclaimer } from "@/components/AppShell";
import { Mail, Copy, RefreshCw, Eraser, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { incrementMetric } from "@/lib/storage";

export const Route = createFileRoute("/_app/email")({
  head: () => ({
    meta: [
      { title: "Email Generator — Workplace AI" },
      { name: "description", content: "Generate professional emails with AI." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const gen = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("Client");
  const [tone, setTone] = useState("Professional");
  const [keyPoints, setKeyPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  async function run() {
    if (!purpose.trim() || !keyPoints.trim()) {
      toast.error("Add a purpose and key points.");
      return;
    }
    setLoading(true);
    try {
      const { text } = await gen({ data: { purpose, recipient, tone, keyPoints } });
      setOutput(text);
      incrementMetric("emails");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate email");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setPurpose("");
    setKeyPoints("");
    setOutput("");
  }

  async function copy() {
    await navigator.clipboard.writeText(output);
    toast.success("Email copied");
  }

  return (
    <div>
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Generate a professional email with subject line, body, and call-to-action."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="purpose">Email purpose</Label>
              <Input
                id="purpose"
                placeholder="e.g. Request a project status update"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Recipient</Label>
                <Select value={recipient} onValueChange={setRecipient}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Client", "Manager", "Team Member", "Vendor", "Stakeholder"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Professional", "Friendly", "Persuasive", "Formal"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kp">Key points to include</Label>
              <Textarea
                id="kp"
                rows={6}
                placeholder="One point per line..."
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={run} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {output ? "Regenerate" : "Generate Email"}
              </Button>
              <Button variant="outline" onClick={clearAll} disabled={loading}>
                <Eraser className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Generated Email</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={copy} disabled={!output}>
                  <Copy className="h-4 w-4" /> Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={run} disabled={loading || !purpose}>
                  <RefreshCw className="h-4 w-4" /> Regenerate
                </Button>
              </div>
            </div>
            <div className="min-h-[20rem] rounded-md border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {loading
                ? "Generating..."
                : output || "Your email will appear here."}
            </div>
          </CardContent>
        </Card>
      </div>

      <AIDisclaimer />
    </div>
  );
}
