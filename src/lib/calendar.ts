import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  startOfMonth,
  subMonths,
} from "date-fns";
import { sv } from "date-fns/locale";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { SWEDISH_SPECIAL_DATES_2026, type SpecialDateEntry } from "@/lib/swedish-holidays";

export type SlotDefinition = {
  id: string;
  slug: string;
  label: string;
  startsAt: string;
  endsAt: string;
  description: string | null;
  colorToken: string;
  sortOrder: number;
};

type AssignmentRecord = {
  id: string;
  dutyDate: string;
  slotDefinitionId: string;
  assignedUserId: string;
  assigneeName: string;
};

export type CalendarSlot = SlotDefinition & {
  dutyDate: string;
  isBooked: boolean;
  isMine: boolean;
  assigneeName: string | null;
  assignedUserId: string | null;
};

export type CalendarDay = {
  isoDate: string;
  title: string;
  subtitle: string;
  isToday: boolean;
  isSpecialDate: boolean;
  specialDateLabel: string | null;
  slots: CalendarSlot[];
};

export type CalendarViewModel = {
  currentUser: {
    id: string;
    displayName: string;
    email: string | null;
  } | null;
  days: CalendarDay[];
  notices: string[];
  dataSource: "demo" | "supabase";
  isConfigured: boolean;
  monthLabel: string;
  monthKey: string;
  previousMonthKey: string;
  nextMonthKey: string;
};

type SpecialDate = SpecialDateEntry;

const defaultSlotDefinitions: SlotDefinition[] = [
  {
    id: "slot-morgon",
    slug: "morgon",
    label: "Morgonpass",
    startsAt: "06:30",
    endsAt: "08:30",
    description: "Morgonrundan med utsläpp, foder och första koll i stallet.",
    colorToken: "amber",
    sortOrder: 1,
  },
  {
    id: "slot-kvall",
    slug: "kvall",
    label: "Kvällspass",
    startsAt: "17:00",
    endsAt: "20:00",
    description: "Kvällsrundan med insläpp, vatten, foder och sista avstämningen.",
    colorToken: "clay",
    sortOrder: 2,
  },
];

const defaultSpecialDates: SpecialDate[] = SWEDISH_SPECIAL_DATES_2026;

const getCandidateDates = (visibleMonth: Date) => {
  const start = startOfMonth(visibleMonth);
  const end = endOfMonth(visibleMonth);
  return eachDayOfInterval({ start, end });
};

const toIsoDate = (value: Date) => format(value, "yyyy-MM-dd");
const toMonthKey = (value: Date) => format(value, "yyyy-MM");

const parseMonthKey = (value?: string) => {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return startOfMonth(new Date());
  }

  const [year, month] = value.split("-").map(Number);

  if (!year || !month || month < 1 || month > 12) {
    return startOfMonth(new Date());
  }

  return new Date(year, month - 1, 1);
};

const isWeekendBookingDay = (value: Date) => {
  const day = getDay(value);
  return day === 5 || day === 6 || day === 0;
};

const getRelevantDates = (dates: Date[], specialDates: SpecialDate[]) => {
  const specialDateMap = new Map(specialDates.map((entry) => [entry.date, entry.label]));

  return dates
    .map((date) => {
      const isoDate = toIsoDate(date);
      const specialDateLabel = specialDateMap.get(isoDate) ?? null;

      if (!isWeekendBookingDay(date) && !specialDateLabel) {
        return null;
      }

      return {
        date,
        isoDate,
        specialDateLabel,
      };
    })
    .filter((entry): entry is { date: Date; isoDate: string; specialDateLabel: string | null } => Boolean(entry));
};

const createDemoAssignments = (days: Date[]): AssignmentRecord[] => {
  const [firstDay, secondDay, thirdDay] = days;

  return [
    {
      id: "demo-1",
      dutyDate: toIsoDate(firstDay),
      slotDefinitionId: "slot-morgon",
      assignedUserId: "demo-anna",
      assigneeName: "Anna",
    },
    {
      id: "demo-2",
      dutyDate: toIsoDate(firstDay),
      slotDefinitionId: "slot-kvall",
      assignedUserId: "demo-jonas",
      assigneeName: "Jonas",
    },
    {
      id: "demo-3",
      dutyDate: toIsoDate(secondDay),
      slotDefinitionId: "slot-morgon",
      assignedUserId: "demo-emma",
      assigneeName: "Emma",
    },
    {
      id: "demo-4",
      dutyDate: toIsoDate(thirdDay),
      slotDefinitionId: "slot-kvall",
      assignedUserId: "demo-lina",
      assigneeName: "Lina",
    },
  ];
};

const colorStyles: Record<string, string> = {
  amber: "from-[#d7b26d] to-[#c9863b]",
  sage: "from-[#9ba77a] to-[#6f7b55]",
  clay: "from-[#c68f73] to-[#9d5f45]",
  night: "from-[#5b5b7d] to-[#2f3146]",
};

type BuildViewModelParams = {
  slotDefinitions: SlotDefinition[];
  assignments: AssignmentRecord[];
  specialDates: SpecialDate[];
  currentUser: CalendarViewModel["currentUser"];
  notices: string[];
  dataSource: CalendarViewModel["dataSource"];
  isConfigured: boolean;
  visibleMonth: Date;
};

function buildCalendarViewModel({
  slotDefinitions,
  assignments,
  specialDates,
  currentUser,
  notices,
  dataSource,
  isConfigured,
  visibleMonth,
}: BuildViewModelParams): CalendarViewModel {
  const days = getRelevantDates(getCandidateDates(visibleMonth), specialDates);
  const assignmentMap = new Map(
    assignments.map((assignment) => [
      `${assignment.dutyDate}:${assignment.slotDefinitionId}`,
      assignment,
    ]),
  );

  return {
    currentUser,
    notices,
    dataSource,
    isConfigured,
    monthLabel: format(visibleMonth, "LLLL yyyy", { locale: sv }),
    monthKey: toMonthKey(visibleMonth),
    previousMonthKey: toMonthKey(subMonths(visibleMonth, 1)),
    nextMonthKey: toMonthKey(addMonths(visibleMonth, 1)),
    days: days.map(({ date, isoDate, specialDateLabel }) => {

      return {
        isoDate,
        title: format(date, "EEEE", { locale: sv }),
        subtitle: format(date, "d MMMM", { locale: sv }),
        isToday: isToday(date),
        isSpecialDate: Boolean(specialDateLabel),
        specialDateLabel,
        slots: slotDefinitions.map((slot) => {
          const assignment = assignmentMap.get(`${isoDate}:${slot.id}`);

          return {
            ...slot,
            dutyDate: isoDate,
            isBooked: Boolean(assignment),
            isMine: Boolean(currentUser && assignment?.assignedUserId === currentUser.id),
            assigneeName: assignment?.assigneeName ?? null,
            assignedUserId: assignment?.assignedUserId ?? null,
            colorToken: colorStyles[slot.colorToken] ? slot.colorToken : "amber",
          };
        }),
      };
    }),
  };
}

export async function getCalendarViewModel(month?: string): Promise<CalendarViewModel> {
  const visibleMonth = parseMonthKey(month);
  const demoDays = getRelevantDates(getCandidateDates(visibleMonth), defaultSpecialDates).map(
    (entry) => entry.date,
  );

  if (!isSupabaseConfigured) {
    return buildCalendarViewModel({
      slotDefinitions: defaultSlotDefinitions,
      assignments: createDemoAssignments(demoDays),
      specialDates: defaultSpecialDates,
      currentUser: null,
      notices: [
        "Kalendern visar månadens bokningsdagar med morgon- och kvällspass.",
      ],
      dataSource: "demo",
      isConfigured: false,
      visibleMonth,
    });
  }

  try {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      throw new Error("Supabase-klienten kunde inte skapas.");
    }

    const candidateDates = getCandidateDates(visibleMonth);
    const start = toIsoDate(candidateDates[0]);
    const end = toIsoDate(candidateDates[candidateDates.length - 1]);

    const [
      {
        data: { user },
      },
      { data: slotRows, error: slotError },
      { data: specialDateRows, error: specialDateError },
      { data: assignmentRows, error: assignmentError },
    ] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("duty_slot_definitions")
        .select(
          "id, slug, label, starts_at, ends_at, description, color_token, sort_order, is_active",
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("special_dates")
        .select("calendar_date, label")
        .gte("calendar_date", start)
        .lte("calendar_date", end)
        .order("calendar_date", { ascending: true }),
      supabase
        .from("duty_assignments")
        .select("id, duty_date, slot_definition_id, assigned_user_id")
        .gte("duty_date", start)
        .lte("duty_date", end),
    ]);

    if (slotError) {
      throw slotError;
    }

    if (specialDateError) {
      throw specialDateError;
    }

    if (assignmentError) {
      throw assignmentError;
    }

    const slotDefinitions =
      slotRows?.map((row) => ({
        id: row.id,
        slug: row.slug,
        label: row.label,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        description: row.description,
        colorToken: row.color_token,
        sortOrder: row.sort_order,
      })) ?? defaultSlotDefinitions;

    const specialDates =
      specialDateRows?.map((row) => ({
        date: row.calendar_date,
        label: row.label,
      })) ?? [];

    const profileIds = [...new Set((assignmentRows ?? []).map((row) => row.assigned_user_id))];

    const { data: profileRows, error: profileError } = profileIds.length
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", profileIds)
      : { data: [], error: null };

    if (profileError) {
      throw profileError;
    }

    const profileMap = new Map(
      (profileRows ?? []).map((profile) => [
        profile.id,
        profile.full_name || profile.email || "Någon i stallet",
      ]),
    );

    const currentUserProfile = user
      ? (profileRows ?? []).find((profile) => profile.id === user.id)
      : null;

    return buildCalendarViewModel({
      slotDefinitions,
      assignments:
        assignmentRows?.map((row) => ({
          id: row.id,
          dutyDate: row.duty_date,
          slotDefinitionId: row.slot_definition_id,
          assignedUserId: row.assigned_user_id,
          assigneeName:
            profileMap.get(row.assigned_user_id) || "Någon i stallet",
        })) ?? [],
      specialDates,
      currentUser: user
        ? {
            id: user.id,
            displayName:
              currentUserProfile?.full_name ||
              user.user_metadata.full_name ||
              user.email ||
              "Du",
            email: user.email ?? null,
          }
        : null,
      notices: [],
      dataSource: "supabase",
      isConfigured: true,
      visibleMonth,
    });
  } catch {
    return buildCalendarViewModel({
      slotDefinitions: defaultSlotDefinitions,
      assignments: createDemoAssignments(demoDays),
      specialDates: defaultSpecialDates,
      currentUser: null,
      notices: [
        "Kalendern visar månadens bokningsdagar. Kontrollera att specialdagar och pass är uppdaterade om något saknas.",
      ],
      dataSource: "demo",
      isConfigured: true,
      visibleMonth,
    });
  }
}