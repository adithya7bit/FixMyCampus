/**
 * Vercel serverless function. Gemini key never leaves the server.
 * POST { title, description, category? }
 */
type Body = { title?: string; description?: string; category?: string };

const EMERGENCY = ["exposed wire", "gas smell", "flood", "fire", "cockroach in", "food poisoning"];
const HIGH = ["no water", "no electricity", "leak", "outage", "insect", "broken"];

function rules(title: string, description: string, category?: string) {
  const text = `${title} ${description}`.toLowerCase();
  let priority = "medium";
  if (EMERGENCY.some((w) => text.includes(w))) priority = "emergency";
  else if (category === "food_hygiene" || HIGH.some((w) => text.includes(w))) priority = "high";
  return {
    category: category ?? "other",
    priority,
    summary: title.slice(0, 80),
    source: "rules",
    reasons: ["rule-based fallback"],
  };
}

export default async function handler(req: { method?: string; body?: Body }, res: {
  status: (n: number) => { json: (b: unknown) => void };
}) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const title = String(req.body?.title ?? "");
  const description = String(req.body?.description ?? "");
  const category = req.body?.category;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(200).json(rules(title, description, category));

  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + key,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Classify this campus complaint. Return JSON only: {"category":"wifi|water|electricity|furniture|food_hygiene|washroom|classroom|security|infrastructure|other","priority":"low|medium|high|emergency","summary":"one line"}\n\nTitle: ${title}\nDescription: ${description}`,
                },
              ],
            },
          ],
        }),
      },
    );
    const data = await r.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const json = JSON.parse(text.replace(/```json|```/g, "").trim());
    return res.status(200).json({ ...json, source: "ai" });
  } catch {
    return res.status(200).json(rules(title, description, category));
  }
}
