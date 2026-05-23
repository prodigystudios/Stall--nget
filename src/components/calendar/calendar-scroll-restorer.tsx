"use client";

import { useEffect } from "react";

const CALENDAR_SCROLL_KEY = "stall-anget-calendar-scroll";

export function CalendarScrollRestorer() {
  useEffect(() => {
    const storedValue = window.sessionStorage.getItem(CALENDAR_SCROLL_KEY);

    if (!storedValue) {
      return;
    }

    const scrollY = Number(storedValue);

    if (Number.isFinite(scrollY)) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, behavior: "auto" });
      });
    }

    window.sessionStorage.removeItem(CALENDAR_SCROLL_KEY);
  }, []);

  return null;
}