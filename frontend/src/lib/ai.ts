import type { Category, Priority } from "@/types";
import { CATEGORIES } from "@/lib/constants";

export interface Suggestion {
  category: Category;
  priority: Priority;
  summary: string;
  source: "ai" | "rules";
  reasons: string[];
}

const EMERGENCY = [
  "exposed wire",
  "exposed wires",
  "live wire",
  "gas smell",
  "gas leak",
  "flood",
  "flooding",
  "fire",
  "smoke",
  "blood",
  "collapse",
  "collapsed",
  "electrocute",
  "shock",
  "snake",
  "glass shatter",
  "health hazard",
  "food poisoning",
  "insect in food",
  "cockroach in",
  "short circuit",
];

const HIGH = [
  "no water",
  "no electricity",
  "power cut",
  "outage",
  "leak",
  "leaking",
  "sewage",
  "overflow",
  "blocked toilet",
  "insect",
  "cockroach",
  "hygiene",
  "spoiled",
  "broken",
  "not working",
  "unsafe",
  "dark corridor",
];

const KEYWORDS: Record<Category, string[]> = {
  wifi: ["wifi", "wi-fi", "network", "internet", "lan", "router", "intranet", "connectivity"],
  water: ["water", "leak", "tap", "pipe", "drainage", "sewage", "tank", "drinking"],
  electricity: ["electric", "power", "light", "fan", "wire", "socket", "switch", "outage", "mcb"],
  furniture: ["chair", "bench", "desk", "table", "board", "furniture", "stool"],
  food_hygiene: ["food", "mess", "canteen", "insect", "cockroach", "hygiene", "kitchen", "meal", "spoiled"],
  washroom: ["washroom", "toilet", "bathroom", "restroom", "urinal", "housekeeping", "dirty", "smell"],
  classroom: ["projector", "classroom", "lab", "ac", "podium", "mic", "speaker", "computer"],
  security: ["security", "gate", "theft", "stranger", "lighting", "cctv", "safety", "fight"],
  infrastructure: ["roof", "road", "wall", "ceiling", "window", "door", "crack", "drain", "parking"],
  other: [],
};

function score(text: string, words: string[]): number {
  const t = text.toLowerCase();
  return words.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
}

export function ruleBasedSuggest(input: {
  title: string;
  description: string;
  category?: Category;
}): Suggestion {
  const text = `${input.title} ${input.description}`.toLowerCase();
  const reasons: string[] = [];

  let category: Category = input.category ?? "other";
  if (!input.category) {
    let best: Category = "other";
    let bestN = 0;
    (Object.keys(KEYWORDS) as Category[]).forEach((c) => {
      const n = score(text, KEYWORDS[c]);
      if (n > bestN) {
        bestN = n;
        best = c;
      }
    });
    category = best;
    if (bestN > 0) reasons.push(`Matched ${CATEGORIES.find((c) => c.id === best)?.label} keywords`);
  }

  let priority: Priority = "medium";
  if (EMERGENCY.some((w) => text.includes(w)) || category === "food_hygiene" && /insect|cockroach|poison|spoiled/.test(text)) {
    priority = "emergency";
    reasons.push("Language indicates an immediate hazard");
  } else if (category === "food_hygiene") {
    priority = "high";
    reasons.push("Food & hygiene is treated as high priority");
  } else if (HIGH.some((w) => text.includes(w))) {
    priority = "high";
    reasons.push("Disruption keywords detected");
  } else if (/minor|request|suggestion|paint|notice board/.test(text)) {
    priority = "low";
    reasons.push("Reads as a minor request");
  }

  const summary = input.title.trim()
    ? input.title.trim().slice(0, 80)
    : `${CATEGORIES.find((c) => c.id === category)?.label ?? "Issue"} reported`;

  return { category, priority, summary, source: "rules", reasons };
}

function hashInput(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return String(h);
}

const cache = new Map<string, Suggestion>();

export async function suggestComplaint(input: {
  title: string;
  description: string;
  category?: Category;
}): Promise<Suggestion> {
  const key = hashInput(`${input.title}|${input.description}|${input.category ?? ""}`);
  const hit = cache.get(key);
  if (hit) return hit;

  const fallback = ruleBasedSuggest(input);

  if (import.meta.env.VITE_AI_ENABLED === "true") {
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const data = (await res.json()) as Suggestion;
        const out = { ...fallback, ...data, source: "ai" as const };
        cache.set(key, out);
        return out;
      }
    } catch {
      /* silent fallback */
    }
  }

  cache.set(key, fallback);
  return fallback;
}

export { hashInput };
