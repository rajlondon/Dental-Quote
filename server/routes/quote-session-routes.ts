// server/routes/quote-session-routes.ts
import express from "express";

const router = express.Router();

// In-memory session store (replace with Redis in production)
const sessionStore = new Map<string, any>();

// Backup quote session
router.post("/session/backup", async (req, res) => {
  try {
    const { sessionId, quoteData, version } = req.body;

    if (!sessionId || !quoteData) {
      return res.status(400).json({ error: "Missing sessionId or quoteData" });
    }

    // Store session with timestamp
    sessionStore.set(sessionId, {
      quoteData,
      version,
      lastBackup: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    });

    res.json({ success: true, sessionId, version });
  } catch (error) {
    console.error("Error backing up session:", error);
    res.status(500).json({ error: "Failed to backup session" });
  }
});

// Restore quote session
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessionStore.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      sessionStore.delete(sessionId);
      return res.status(410).json({ error: "Session expired" });
    }

    res.json({
      success: true,
      sessionId,
      quoteData: session.quoteData,
      version: session.version,
    });
  } catch (error) {
    console.error("Error restoring session:", error);
    res.status(500).json({ error: "Failed to restore session" });
  }
});

export default router;
