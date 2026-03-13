"use client";

import { type SyntheticEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { getStoredSession, saveStoredSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getStoredSession()?.token) {
      router.replace("/feriados");
    }
  }, [router]);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });

      if (!response.token) {
        throw new Error("A API não retornou um token válido.");
      }

      saveStoredSession({
        token: response.token,
        expiration: response.expiration ?? null,
      });

      router.push("/feriados");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Não foi possível realizar o login.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-6 py-8 text-[#3f3f46] md:px-10 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="w-full max-w-[520px] rounded-[36px] border border-[#e6e3dd] bg-white px-8 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.06)] md:px-12 md:py-12">
          <p className="text-[11px] font-medium tracking-[0.24em] text-[#8c8a86]">
            MEUS FERIADOS
          </p>

          <div className="mt-10 space-y-3">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[#111827] md:text-4xl">
              Faça seu login
            </h1>
            <p className="max-w-sm text-sm leading-6 text-[#7c7c85]">
              Acesse a sua área para consultar, filtrar e organizar os feriados.
            </p>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <label className="block border-b border-[#ddd8d0] pb-3">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#8c8a86]">
                E-mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite seu e-mail"
                className="mt-3 w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#bbb3aa]"
                required
              />
            </label>

            <label className="block border-b border-[#ddd8d0] pb-3">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#8c8a86]">
                Senha
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                className="mt-3 w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#bbb3aa]"
                required
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-[#f1c5c5] bg-[#fff3f3] px-4 py-3 text-sm text-[#b42318]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1017a8] px-6 text-sm font-semibold text-white transition hover:bg-[#0a1085] disabled:cursor-not-allowed disabled:bg-[#7f86d8]"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}