"use client";

import {useTranslations} from "next-intl";
import {useState} from "react";

export default function LocaleSwitcher() {
  const t = useTranslations("locale");
  const [value, setValue] = useState<string>(typeof document !== "undefined" ? (document.cookie.match(/(^|; )locale=([^;]+)/)?.[2] ? decodeURIComponent(document.cookie.match(/(^|; )locale=([^;]+)/)![2]) : "en") : "en");

  const changeLocale = async (next: string) => {
    try {
      document.cookie = `locale=${encodeURIComponent(next)}; path=/; max-age=${60 * 60 * 24 * 365}`;
      setValue(next);
      // For simplicity, reload to apply strings everywhere
      window.location.reload();
    } catch (e) {
      console.error("Failed to change locale", e);
    }
  };

  return (
    <div style={{display: "flex", gap: 8, alignItems: "center", padding: "8px 16px"}}>
      <span style={{fontSize: 12, opacity: 0.7}}>{t("language")}:</span>
      <select
        value={value}
        onChange={(e) => changeLocale(e.target.value)}
        style={{padding: 6, borderRadius: 6, border: "1px solid #ddd"}}
        aria-label="Language"
      >
        <option value="en">{t("english")}</option>
        <option value="hi">{t("hindi")}</option>
      </select>
    </div>
  );
}
