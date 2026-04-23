export default async () => {
  const icsUrl = process.env.GIGS_ICS_URL;

  if (!icsUrl) {
    return new Response(
      JSON.stringify({ error: "Missing GIGS_ICS_URL" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const res = await fetch(icsUrl);

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch calendar" }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  const ics = await res.text();

  const unfolded = ics.replace(/\r?\n[ \t]/g, "");

  const parseIcsDate = (value) => {
    if (!value) return null;
    const v = value.replace("Z", "");
    const hasTime = v.includes("T");

    const y = Number(v.slice(0, 4));
    const m = Number(v.slice(4, 6)) - 1;
    const d = Number(v.slice(6, 8));

    if (!hasTime) return new Date(Date.UTC(y, m, d));

    const hh = Number(v.slice(9, 11));
    const mm = Number(v.slice(11, 13));
    const ss = Number(v.slice(13, 15)) || 0;

    return new Date(Date.UTC(y, m, d, hh, mm, ss));
  };

  const now = new Date();

  const blocks = unfolded.split("BEGIN:VEVENT").slice(1);
  const events = [];

  for (const b of blocks) {
    const body = b.split("END:VEVENT")[0];

    const summaryMatch = ("\n" + body).match(/\nSUMMARY:([^\n]+)/i);
    const dtStartMatch = ("\n" + body).match(/\nDTSTART(?:;[^:]*)?:([^\n]+)/i);
    const locationMatch = ("\n" + body).match(/\nLOCATION:([^\n]+)/i);
    const descriptionMatch = ("\n" + body).match(/\nDESCRIPTION:([^\n]+)/i);

    if (!dtStartMatch) continue;

    const start = parseIcsDate(dtStartMatch[1].trim());
    if (!start) continue;
    if (start < now) continue;

    events.push({
      title: summaryMatch ? summaryMatch[1].trim() : "Gig",
      start: start.toISOString(),
      hasTime: dtStartMatch[1].includes("T"),
      venue: locationMatch ? locationMatch[1].trim() : "",
      description: descriptionMatch ? descriptionMatch[1].trim() : ""
    });
  }

  events.sort((a, b) => new Date(a.start) - new Date(b.start));

  return new Response(JSON.stringify({ events }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=300",
    },
  });
};
