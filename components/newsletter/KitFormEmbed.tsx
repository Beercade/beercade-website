"use client";

import { useEffect, useRef } from "react";

interface Props {
  /** Kit form uid (the data-uid in the embed snippet) */
  uid: string;
}

/**
 * Renders a Kit (ConvertKit) inline form embed. Kit's index.js injects the
 * form into the DOM immediately after its own <script> element, so we append
 * the script into a container ref to control where the form lands. The
 * querySelector guard keeps React's double-invoked effect (Strict Mode, dev)
 * from injecting the script — and therefore the form — twice.
 */
export function KitFormEmbed({ uid }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.querySelector("script")) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://beercade.kit.com/${uid}/index.js`;
    script.setAttribute("data-uid", uid);
    el.appendChild(script);
  }, [uid]);

  return <div ref={ref} />;
}
