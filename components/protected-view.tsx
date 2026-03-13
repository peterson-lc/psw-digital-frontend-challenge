"use client";

import { ReactNode, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { StoredSession } from "@/lib/auth";

type ProtectedViewProps = {
  children: (session: StoredSession) => ReactNode;
};

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

let cachedRaw: string | null = null;
let cachedSession: StoredSession | null = null;

function getSnapshot(): StoredSession | null {
  const raw =
    typeof window !== "undefined"
      ? window.localStorage.getItem("psw-digital-frontend-session")
      : null;

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSession = raw ? (JSON.parse(raw) as StoredSession) : null;
  }

  return cachedSession;
}

export function ProtectedView({ children }: ProtectedViewProps) {
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => null,
  );

  useEffect(() => {
    if (!session?.token) {
      router.replace("/login");
    }
  }, [router, session?.token]);

  if (!session?.token) {
    return (
      <div className="rounded-[32px] border border-[#e6e3dd] bg-white px-8 py-12 text-sm text-[#7c7c85] shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
        Carregando...
      </div>
    );
  }

  return <>{children(session)}</>;
}