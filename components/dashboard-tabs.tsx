"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/tela-a", label: "Tela A" },
  { href: "/tela-b", label: "Tela B" },
  { href: "/tela-c", label: "Tela C" },
  { href: "/feriados", label: "Feriados" },
];

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 border-b border-[#ddd8d0]">
      <ul className="flex flex-wrap gap-7 text-sm text-[#a4a09a] md:gap-10">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`inline-flex border-b-3 px-1 pb-4 transition ${
                  isActive
                    ? "border-[#1017a8] font-semibold text-[#111827]"
                    : "border-transparent hover:text-[#57534e]"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}