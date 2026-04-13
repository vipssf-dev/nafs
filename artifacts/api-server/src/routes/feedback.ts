import { Router } from "express";
import { db, feedbackTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

const ADMIN_KEY = process.env.ADMIN_FEEDBACK_KEY || "0969860a95868f94163ffeb1dcdca859";

router.post("/feedback", async (req, res) => {
  try {
    const { name, message, contact, page } = req.body as {
      name?: string;
      message: string;
      contact?: string;
      page?: string;
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "الملاحظة مطلوبة" });
      return;
    }

    await db.insert(feedbackTable).values({
      name: name?.trim() || null,
      message: message.trim(),
      contact: contact?.trim() || null,
      page: page || null,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: "حدث خطأ، يرجى المحاولة مرة أخرى" });
  }
});

router.get("/feedback", async (req, res) => {
  const { key } = req.query as { key?: string };

  if (key !== ADMIN_KEY) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(feedbackTable)
      .orderBy(desc(feedbackTable.createdAt));

    res.json({ success: true, feedback: rows, total: rows.length });
  } catch (err) {
    console.error("Fetch feedback error:", err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.delete("/feedback/:id", async (req, res) => {
  const { key } = req.query as { key?: string };

  if (key !== ADMIN_KEY) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }

  try {
    const { eq } = await import("drizzle-orm");
    const id = parseInt(req.params.id);
    await db.delete(feedbackTable).where(eq(feedbackTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Delete feedback error:", err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

export default router;
