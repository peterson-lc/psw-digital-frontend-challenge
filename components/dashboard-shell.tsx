import { ReactNode } from "react";
import { DashboardTabs } from "@/components/dashboard-tabs";

type DashboardShellProps = Readonly<{
  children: ReactNode;
}>;

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-[#f5f5f3] px-6 py-8 text-[#3f3f46] md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-medium tracking-[0.24em] text-[#8c8a86]">
          MEUS FERIADOS
        </p>
        <DashboardTabs />
        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}