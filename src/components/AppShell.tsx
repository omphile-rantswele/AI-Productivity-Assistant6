import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageSquare,
  Settings,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Summarizer", icon: FileText },
  { to: "/tasks", label: "Task Planner", icon: ListChecks },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "AI Chatbot", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-sidebar-foreground">Workplace AI</div>
          <div className="text-[11px] text-sidebar-foreground/60">Productivity Assistant</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <div className="rounded-lg bg-sidebar-accent/60 p-3 text-[11px] leading-relaxed text-sidebar-foreground/70">
          AI-generated content may contain inaccuracies. Always review before
          acting on outputs.
        </div>
      </div>
    </div>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-72 bg-sidebar text-sidebar-foreground">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4 lg:px-8 h-14">
          <button
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="text-sm text-muted-foreground hidden sm:block">
            AI Workplace Productivity Assistant
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-2 w-2 rounded-full bg-accent" />
            AI Online
          </div>
        </header>
        <main className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function AIDisclaimer() {
  return (
    <div className="mt-6 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
      <strong className="text-foreground">Responsible AI:</strong>{" "}
      AI-generated content may contain inaccuracies or bias. Review outputs,
      apply human judgment, and avoid pasting confidential data.
    </div>
  );
}
