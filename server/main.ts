import { Hono } from "hono";
import { cors } from "hono/middleware.ts"
import { getCookie, setCookie } from "hono/helper/cookie/index.ts";

const app = new Hono();

const CLIENT_ID = Deno.env.get("TRAQ_CLIENT_ID")!;
const REDIRECT_URL = Deno.env.get("TRAQ_REDIRECT_URL")!;

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

app.get("/api/auth/login", (c) => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_url: REDIRECT_URL,
  });
  return c.redirect(`https://q.trap.jp/api/v3/oauth2/authorize?${params.toString()}`);
});

app.get("/api/auth/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) return c.text("Unauthorized", 400);

  const formData = new URLSearchParams();
  formData.append("grant_type", "authorization_code");
  formData.append("client_id", CLIENT_ID);
  formData.append("code", code);

  const res = await fetch("https://q.trap.jp/api/v3/oauth2/token", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) return c.text("Failed to changing token", 500);

  const data = await res.json();
  
  setCookie(c, "traq_token", data.access_token, {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return c.redirect("http://localhost:5173");
});

app.get("api/me", async (c) => {
  const token = getCookie(c, "traq_token");
  if (!token) {
    return c.json(null);
  }

  try {
    const res = await fetch("https:/q.trap.jp/api/v3/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      return c.json(null);
    }
    const userData = await res.json();
    return c.json(userData);
  } catch {
    return c.json(null);
  }
});

Deno.serve(app.fetch);