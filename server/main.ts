import { Hono } from "hono";
import { Song } from "@scope/common"; // 共有型をインポート

const app = new Hono();

app.get("/api/songs", (c) => {
  const songs: Song[] = [
    { id: "1", name: "Sample.mp3", mime: "audio/mpeg", createdAt: new Date().toISOString() }
  ];
  return c.json(songs);
});

Deno.serve(app.fetch);