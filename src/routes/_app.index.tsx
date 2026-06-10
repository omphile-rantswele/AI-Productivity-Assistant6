import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, AIDisclaimer } from "@/components/AppShell";
import { useMetrics } from "@/lib/storage";
import {
  LayoutDashboard,
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageSquare,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workplace AI" },
      {
        name: "description",
        content:
          "AI-powered workplace productivity dashboard: generate emails, summarize meetings, plan tasks, and research smarter.",
      },
    ],
  }),
  component: HomePage,
});

const TOOLS = [
  {
    to: "/email" as const,
    title: "Smart Email Generator",
    desc: "Draft professional emails in seconds.",
    icon: Mail,
  },
  {
    to: "/meetings" as const,
    title: "Meeting Summarizer",
    desc: "Turn raw notes into clean action items.",
    icon: FileText,
  },
  {
    to: "/tasks" as const,
    title: "Task Planner",
    desc: "Build a prioritized schedule for the week.",
    icon: ListChecks,
  },
  {
    to: "/research" as const,
    title: "Research Assistant",
    desc: "Summarize articles & extract insights.",
    icon: Search,
  },
  {
    to: "/chat" as const,
    title: "AI Chatbot",
    desc: "Ask anything about workplace productivity.",
    icon: MessageSquare,
  },
];

function HomePage() {
  const m = useMetrics();
  const total = m.emails + m.summaries + m.plans + m.research;
  const timeSavedMin = m.emails * 10 + m.summaries * 15 + m.plans * 20 + m.research * 12;

  const chartData = [
    { name: "Emails", value: m.emails },
    { name: "Summaries", value: m.summaries },
    { name: "Plans", value: m.plans },
    { name: "Research", value: m.research },
  ];

  return (
    <div>
      <PageHeader
        icon={LayoutDashboard}
        title="Welcome back"
        description="Your AI co-worker for emails, meetings, planning and research — all in one place."
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <MetricCard label="Emails Generated" value={m.emails} />
        <MetricCard label="Notes Summarized" value={m.summaries} />
        <MetricCard label="Tasks Planned" value={m.plans} />
        <MetricCard label="Research Requests" value={m.research} />
        <MetricCard
          label="Time Saved"
          value={formatMinutes(timeSavedMin)}
          icon={<Clock className="h-4 w-4 text-accent" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base">Productivity Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {total === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Start using a tool below to see your activity here.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base">Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {TOOLS.slice(0, 5).map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm">
                  <t.icon className="h-4 w-4 text-primary" />
                  {t.title}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-10 mb-3">
        All Tools
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((t) => (
          <Card
            key={t.to}
            className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <t.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.desc}</p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to={t.to}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AIDisclaimer />
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          {icon}
        </div>
        <div className="text-2xl font-semibold text-foreground tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}

function formatMinutes(min: number) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
