"use client";

import {NextIntlClientProvider} from "next-intl";
import {ReactNode, useEffect, useState} from "react";

type Messages = Record<string, any>;

async function loadMessages(locale: string): Promise<Messages> {
  switch (locale) {
    case "hi":
      return (await import("../../messages/hi.json")).default as Messages;
    case "en":
    default:
      return (await import("../../messages/en.json")).default as Messages;
  }
}

export default function IntlProvider({children, locale: initialLocale}: {children: ReactNode; locale?: string}) {
  const [locale, setLocale] = useState(initialLocale || (typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "en"));
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    let active = true;
    loadMessages(locale).then((m) => {
      if (active) setMessages(m);
    });
    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    // Read cookie if available
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(^|; )locale=([^;]+)/);
      if (match) {
        const cookieLocale = decodeURIComponent(match[2]);
        if (cookieLocale && cookieLocale !== locale) setLocale(cookieLocale);
      }
    }
  }, []);

  if (!messages) return null;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Kolkata">
      {children}
    </NextIntlClientProvider>
  );
}
