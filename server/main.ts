import { Hono } from "hono";
import { setCookie } from "hono/helper/cookie/index.ts";

const app = new Hono();

const CLIENT_ID = Deno.env.get("TRAQ_CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("TRAQ_CLIENT_SECRET")!;
const REDIRECT_URL = Deno.env.get("TRAQ_REDIRECT_URI")!;

// --- ① ログインボタンの飛び先 ---
app.get("/api/auth/login", (c) => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_url: REDIRECT_URL,
  });
  // traQ の認可画面へリダイレクト
  return c.redirect(`https://q.trap.jp/api/v3/oauth2/authorize?${params.toString()}`);
});

// --- ② traQ から戻ってくる場所 ---
app.get("/api/auth/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) return c.text("認可コードがありません", 400);

  // 認可コードをアクセストークンに交換するリクエスト
  const formData = new URLSearchParams();
  formData.append("grant_type", "authorization_code");
  formData.append("code", code);
  formData.append("client_id", CLIENT_ID);
  formData.append("client_secret", CLIENT_SECRET);
  formData.append("redirect_uri", REDIRECT_URL);

  const res = await fetch("https://q.trap.jp/api/v3/oauth2/token", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) return c.text("トークン交換に失敗しました", 500);

  const data = await res.json(); // { access_token: "...", ... }
  
  // ブラウザの Cookie に保存（HttpOnly で JS から触れないようにして安全性を確保）
  setCookie(c, "traq_token", data.access_token, {
    httpOnly: true,
    secure: false, // localhost なので false でOK
    maxAge: 60 * 60 * 24 * 7, // 1週間
    path: "/",
  });

  // ログインが終わったら Vue のトップ画面へ戻す
  return c.redirect("http://localhost:5173");
});

Deno.serve(app.fetch);