"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createRedirectUrl = (values: Record<string, string>) => {
  const params = new URLSearchParams(values);
  return `/kalender?${params.toString()}`;
};

export async function claimDutyAction(formData: FormData) {
  const dutyDate = String(formData.get("dutyDate") ?? "");
  const slotDefinitionId = String(formData.get("slotDefinitionId") ?? "");
  const month = String(formData.get("month") ?? "");

  if (!dutyDate || !slotDefinitionId) {
    redirect(
      createRedirectUrl({
        error: "Det gick inte att identifiera passet som skulle bokas.",
        ...(month ? { month } : {}),
      }),
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(
      createRedirectUrl({
        error: "Supabase är inte konfigurerat ännu. Kalendern är därför i demoläge.",
        ...(month ? { month } : {}),
      }),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Du+beh%C3%B6ver+vara+inloggad+f%C3%B6r+att+boka+ett+pass.");
  }

  const { error } = await supabase.from("duty_assignments").insert({
    duty_date: dutyDate,
    slot_definition_id: slotDefinitionId,
    assigned_user_id: user.id,
  });

  if (error) {
    redirect(
      createRedirectUrl({
        ...(month ? { month } : {}),
        error:
          error.code === "23505"
            ? "Det passet hann bokas av någon annan precis före dig."
            : "Det gick inte att boka passet just nu.",
      }),
    );
  }

  revalidatePath("/kalender");
  redirect(
    createRedirectUrl({
      ...(month ? { month } : {}),
      status: "Passet är nu bokat på dig.",
    }),
  );
}

export async function releaseDutyAction(formData: FormData) {
  const dutyDate = String(formData.get("dutyDate") ?? "");
  const slotDefinitionId = String(formData.get("slotDefinitionId") ?? "");
  const month = String(formData.get("month") ?? "");

  if (!dutyDate || !slotDefinitionId) {
    redirect(
      createRedirectUrl({
        error: "Det gick inte att identifiera passet som skulle avbokas.",
        ...(month ? { month } : {}),
      }),
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(
      createRedirectUrl({
        error: "Supabase är inte konfigurerat ännu. Kalendern är därför i demoläge.",
        ...(month ? { month } : {}),
      }),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Du+beh%C3%B6ver+vara+inloggad+f%C3%B6r+att+avboka+ett+pass.");
  }

  const { error } = await supabase
    .from("duty_assignments")
    .delete()
    .eq("duty_date", dutyDate)
    .eq("slot_definition_id", slotDefinitionId)
    .eq("assigned_user_id", user.id);

  if (error) {
    redirect(
      createRedirectUrl({
        ...(month ? { month } : {}),
        error: "Det gick inte att avboka passet just nu.",
      }),
    );
  }

  revalidatePath("/kalender");
  redirect(
    createRedirectUrl({
      ...(month ? { month } : {}),
      status: "Passet är nu avbokat.",
    }),
  );
}