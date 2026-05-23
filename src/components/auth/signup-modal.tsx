"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type SignupModalProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function SignupModal({ action }: SignupModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <Button type="button" size="lg" className="w-full sm:w-auto" onClick={() => setIsOpen(true)}>
        Skapa konto
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26170f]/45 px-4 py-8 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} aria-hidden="true" />

          <div className="relative z-10 w-full max-w-xl rounded-[2rem] border border-border/80 bg-surface p-6 shadow-[0_32px_120px_-50px_rgba(33,14,4,0.85)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted">Skapa konto</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                  Ny i Stall Änget?
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
                  Fyll i namn, e-post och lösenord så kan du börja boka pass direkt.
                </p>
                <p className="mt-3 rounded-[1.25rem] bg-[#f7efe6] px-4 py-3 text-sm leading-7 text-muted sm:text-base">
                  När kontot är skapat kan du behöva verifiera din e-post innan första inloggningen. Om mailet inte dyker upp direkt, kontrollera även skräpposten.
                </p>
              </div>

              <Button type="button" variant="ghost" className="px-3" onClick={() => setIsOpen(false)}>
                Stäng
              </Button>
            </div>

            <form action={action} className="mt-8 space-y-5">
              <label className="block text-sm font-medium text-foreground">
                Namn
                <input
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  className="mt-2 h-12 w-full rounded-2xl border border-border bg-white px-4 text-base outline-none transition focus:border-accent"
                  placeholder="För- och efternamn"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                E-post
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="mt-2 h-12 w-full rounded-2xl border border-border bg-white px-4 text-base outline-none transition focus:border-accent"
                  placeholder="namn@stallanget.se"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                Lösenord
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  className="mt-2 h-12 w-full rounded-2xl border border-border bg-white px-4 text-base outline-none transition focus:border-accent"
                  placeholder="Välj ett lösenord"
                  required
                />
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit">Skapa konto</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}