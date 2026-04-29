import { getStore } from "@netlify/blobs";

const MODE_KEY = "public-site-mode";
const VALID_MODES = new Set(["live", "maintenance"]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store"
    }
  });
}

function isValidMode(mode) {
  return VALID_MODES.has(mode);
}

function getStoreHandle() {
  return getStore("site-config");
}

function getDefaultState() {
  const defaultMode = isValidMode(process.env.SITE_MODE_DEFAULT)
    ? process.env.SITE_MODE_DEFAULT
    : "live";

  return {
    mode: defaultMode,
    updatedAt: null
  };
}

async function readState() {
  const store = getStoreHandle();
  const saved = await store.get(MODE_KEY, { type: "json" });

  if (!saved || !isValidMode(saved.mode)) {
    return getDefaultState();
  }

  return {
    mode: saved.mode,
    updatedAt: typeof saved.updatedAt === "string" ? saved.updatedAt : null
  };
}

export default async (request) => {
  if (request.method === "GET") {
    return json(await readState());
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const adminToken = process.env.MAINTENANCE_ADMIN_TOKEN;
  if (!adminToken) {
    return json(
      { error: "Missing MAINTENANCE_ADMIN_TOKEN environment variable" },
      500
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (payload?.token !== adminToken) {
    return json({ error: "Invalid admin token" }, 401);
  }

  if (!isValidMode(payload?.mode)) {
    return json({ error: "Mode must be 'live' or 'maintenance'" }, 400);
  }

  const state = {
    mode: payload.mode,
    updatedAt: new Date().toISOString()
  };

  const store = getStoreHandle();
  await store.setJSON(MODE_KEY, state);

  return json(state);
};
