"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { ProtectedView } from "@/components/protected-view";

type PlaceholderTabPageProps = Readonly<{
  heading: string;
}>;

export function PlaceholderTabPage({ heading }: PlaceholderTabPageProps) {
  return (
    <DashboardShell>
      <ProtectedView>
        {() => (
          <section className="rounded-[32px] border border-[#e6e3dd] bg-white px-8 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#111827]">
              {heading}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#7c7c85]">
              Esta aba utiliza o mesmo componente de navegação reutilizável. O
              conteúdo principal foi mantido como placeholder para preservar o
              foco da entrega na tela de login e na listagem de feriados.
            </p>
          </section>
        )}
      </ProtectedView>
    </DashboardShell>
  );
}