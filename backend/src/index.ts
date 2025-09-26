import { Hono } from "hono";
import { JSONFilePreset } from "lowdb/node";
import { Database } from "./database";

const app = new Hono();

app.post("/onboarding", async (c) => {
  const db = await JSONFilePreset<Database>("db.json", { shops: [] });
  return c.text("Hello Hono!");
});

export default app;
