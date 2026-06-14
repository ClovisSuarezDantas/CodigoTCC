"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_BASE_URL,
  getAuthSession,
  login,
  register,
  saveAuthSession
} from "@/src/lib/api";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("aluno@tcc.com");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getAuthSession()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result =
      mode === "login"
        ? await login(DEFAULT_BASE_URL, email, senha)
        : await register(DEFAULT_BASE_URL, { nome, email, senha });

    if (!result.ok) {
      if (mode === "login" && email === "aluno@tcc.com" && senha === "123456") {
        createDemoSession();
        router.replace("/dashboard");
        return;
      }

      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    router.replace("/dashboard");
  }

  function createDemoSession() {
    saveAuthSession({
      accessToken: "demo-local-token",
      usuario: {
        id: "demo",
        nome: "Usuario TCC",
        email: "aluno@tcc.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px]">
      <section className="flex min-h-[42vh] items-end bg-slate-950 px-5 py-8 text-white sm:px-8 lg:min-h-screen lg:items-center">
        <div className="max-w-2xl">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1 text-xs font-extrabold uppercase tracking-normal text-sky-100">
              Caixa preta veicular
            </span>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-extrabold uppercase tracking-normal text-emerald-100">
              Telemetria / ESP32 / OBD-II
            </span>
          </div>
          <h1 className="max-w-xl text-4xl font-extrabold tracking-normal sm:text-5xl">
            Acesso ao painel de telemetria
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Entre para acompanhar veiculos, dispositivos, telemetria e eventos em um ambiente de demonstracao.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-950">
              {mode === "login" ? "Login" : "Cadastro"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Acesse o painel de telemetria veicular.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              {mode === "register" ? (
                <div>
                  <label htmlFor="nome" className="mb-2 block text-sm font-extrabold text-slate-700">
                    Nome
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    autoComplete="name"
                    className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              ) : null}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-extrabold text-slate-700">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label htmlFor="senha" className="mb-2 block text-sm font-extrabold text-slate-700">
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="Digite a senha"
                  className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-extrabold text-rose-800">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 min-h-12 w-full rounded-md bg-slate-950 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar e entrar"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode((current) => (current === "login" ? "register" : "login"));
                setError(null);
              }}
              className="mt-3 min-h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              {mode === "login" ? "Criar novo usuario" : "Ja tenho cadastro"}
            </button>
          </form>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="font-extrabold text-slate-800">Credenciais de demonstracao</div>
            <div className="mt-1">E-mail: aluno@tcc.com</div>
            <div>Senha: 123456</div>
          </div>
        </div>
      </section>
    </main>
  );
}
