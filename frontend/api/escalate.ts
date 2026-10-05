/**
 * Vercel cron target. Set CRON_SECRET and call with Authorization: Bearer …
 * Alternatively enable pg_cron: select cron.schedule('fmc-esc', '* / 15 * * * *', $$ select public.run_escalation(); $$);
 */
export default async function handler(req: { headers?: Record<string, string> }, res: {
  status: (n: number) => { json: (b: unknown) => void };
}) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers?.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(200).json({ skipped: true, reason: "no supabase" });
  const r = await fetch(`${url}/rest/v1/rpc/run_escalation`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
}
