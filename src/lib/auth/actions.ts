"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createRedirectUrl = (pathname: string, values: Record<string, string>) => {
  const params = new URLSearchParams(values);
  return `${pathname}?${params.toString()}`;
};

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
    redirect(
      createRedirectUrl("/login", {
        error:
          error.message === "User already registered"
            ? "Det finns redan ett konto med den här e-posten."
            : "Det gick inte att skapa kontot just nu.",
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
      status:
        "Kontot är skapat. Kontrollera din e-post och verifiera kontot innan du loggar in. Titta även i skräpposten om mailet inte syns direkt.",
    }),
  );
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase?.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?status=Du+har+loggats+ut.");
}