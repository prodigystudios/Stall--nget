"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createRedirectUrl = (pathname: string, values: Record<string, string>) => {
  const params = new URLSearchParams(values);
  return `${pathname}?${params.toString()}`;
};

const verificationMessage =
  "Kontot är skapat. Kontrollera din e-post och verifiera kontot innan du loggar in. Titta även i skräpposten om mailet inte syns direkt.";

const verificationRateLimitMessage =
  "Kontot kan vara skapat, men verifieringsmailet kunde inte skickas just nu eftersom gränsen för e-postutskick är nådd. Kontrollera om mailet redan kommit, även i skräpposten. Annars behöver ni vänta en stund innan ni försöker igen.";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(
      createRedirectUrl("/login", {
        error: "Fyll i både e-post och lösenord.",
      }),
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(
      createRedirectUrl("/login", {
        error: "Supabase är inte konfigurerat ännu. Lägg in miljövariablerna först.",
      }),
    );
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      createRedirectUrl("/login", {
        error: "Inloggningen misslyckades. Kontrollera uppgifterna och försök igen.",
      }),
    );
  }

  revalidatePath("/", "layout");
  redirect(
    createRedirectUrl("/kalender", {
      status: "Du är nu inloggad.",
    }),
  );
}

export async function signUpAction(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    redirect(
      createRedirectUrl("/login", {
        error: "Fyll i namn, e-post och lösenord för att skapa konto.",
      }),
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(
      createRedirectUrl("/login", {
        error: "Inloggningen är inte aktiverad ännu.",
      }),
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError) {
      revalidatePath("/", "layout");
      redirect(
        createRedirectUrl("/kalender", {
          status: "Kontot är skapat och du är nu inloggad.",
        }),
      );
    }

    if (signInError.message.toLowerCase().includes("email not confirmed")) {
      redirect(
        createRedirectUrl("/login", {
          status: verificationMessage,
        }),
      );
    }

    if (error.message.toLowerCase().includes("email rate limit exceeded")) {
      redirect(
        createRedirectUrl("/login", {
          status: verificationRateLimitMessage,
        }),
      );
    }

    redirect(
      createRedirectUrl("/login", {
        error:
          error.message === "User already registered"
            ? "Det finns redan ett konto med den här e-posten."
            : `Det gick inte att skapa kontot just nu. (${error.message})`,
      }),
    );
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect(
      createRedirectUrl("/kalender", {
        status: "Kontot är skapat och du är nu inloggad.",
      }),
    );
  }

  redirect(
    createRedirectUrl("/login", {
      status: verificationMessage,
    }),
  );
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase?.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?status=Du+har+loggats+ut.");
}