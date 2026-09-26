import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** Link-preview cards (1200×630) in the site's "desk at night" look: one per page and language. */
export const ogSize = { width: 1200, height: 630 };

const dir = join(process.cwd(), "src/assets/og");
const font = (f: string) => readFile(join(dir, f));

export async function ogCard({ title, mark, note }: { title: string; mark?: string; note: string }) {
  const [gc, gl, sc, sl] = await Promise.all([
    font("golos-text-cyrillic-600-normal.woff"), font("golos-text-latin-600-normal.woff"),
    font("pt-serif-cyrillic-400-italic.woff"), font("pt-serif-latin-400-italic.woff"),
  ]);
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "72px 80px", color: "#e6e9ef", fontFamily: "GolosLat, GolosCyr",
        background: "radial-gradient(60% 70% at 78% 18%, rgba(245,163,92,0.22), rgba(18,26,43,0) 70%), #121a2b",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, letterSpacing: -0.5 }}>
          <div style={{ width: 16, height: 16, borderRadius: 16, background: "#f5a35c" }} />
          Ember Court
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", fontSize: title.length > 48 ? 64 : 76, lineHeight: 1.08, letterSpacing: -2.4, maxWidth: 1000 }}>
          <span>{title}{mark ? " " : ""}</span>
          {mark && (
            <span style={{ display: "flex", flexDirection: "column" }}>
              {mark}
              <div style={{ height: 7, marginTop: 2, borderRadius: 7, background: "#f0766b", width: "104%" }} />
            </span>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 26, color: "#9aa4b5" }}>
          <span style={{ fontFamily: "SerifLat, SerifCyr", fontStyle: "italic", fontSize: 32, color: "#f48c83" }}>{note}</span>
          <span>ember-court.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        // Fontsource ships Latin and Cyrillic as separate files; each gets its own name and the family list falls back.
        { name: "GolosLat", data: gl, weight: 600, style: "normal" },
        { name: "GolosCyr", data: gc, weight: 600, style: "normal" },
        { name: "SerifLat", data: sl, weight: 400, style: "italic" },
        { name: "SerifCyr", data: sc, weight: 400, style: "italic" },
      ],
    },
  );
}
