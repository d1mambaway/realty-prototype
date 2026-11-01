"use client";

import { useEffect } from "react";

/** Заголовок вкладки и описание страницы на языке посетителя */
export function usePageMeta(title: string | undefined, description?: string) {
  useEffect(() => {
    if (!title) return;
    const apply = () => {
      if (document.title !== title) document.title = title;
      const meta = document.querySelector('meta[name="description"]');
      if (description && meta && meta.getAttribute("content") !== description) meta.setAttribute("content", description);
    };
    apply();
    // Next.js после загрузки может вернуть заголовок из статического HTML — возвращаем свой
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true, attributes: true });
    return () => observer.disconnect();
  }, [title, description]);
}
