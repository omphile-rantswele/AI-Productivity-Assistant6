import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/AppShell";
import { Settings as SettingsIcon, Shield, Database, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Workplace AI" },
      { name: "description", content: "App settings, privacy notices, and data management." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  function clearAll() {
    if (typeof window === "undefined") return;
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("ai-wpa:"));
    keys.forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent("ai-wpa:metrics-changed"));
    toast.success("All local data cleared");
  }

  return (
    <div>
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Privacy, responsible AI, and local data management."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Shield className="h-4 w-4 text-primary" />
              Data Privacy
            </div>
            <p className="text-sm text-muted-foreground">
              All your prompts and outputs are processed by Lovable AI for the duration
              of a request and are never stored on our servers. Your chat history,
              metrics and preferences live only in your browser's local storage.
            </p>
            <p className="text-sm text-muted-foreground">
              Do not paste confidential customer data, secrets, or regulated information.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <AlertTriangle className="h-4 w-4 text-accent" />
              Responsible AI
            </div>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>AI outputs can be inaccurate, outdated, or biased.</li>
              <li>Always apply human review before sharing externally or making business decisions.</li>
              <li>Be mindful of bias when generating performance, hiring, or customer-facing content.</li>
              <li>Do not rely on AI for legal, medical, or financial advice.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)] lg:col-span-2">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Database className="h-4 w-4 text-primary" />
              Local Data
            </div>
            <p className="text-sm text-muted-foreground">
              Clear all locally-stored metrics and chat history from this browser.
            </p>
            <Button variant="destructive" onClick={clearAll}>
              Clear all local data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
