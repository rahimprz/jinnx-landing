// Receives lead forms from the landing page and forwards them to the Jinnx Book Press
// inquiries API from the server, so the browser never makes a cross-origin request.
// Set INQUIRY_ENDPOINT in the Vercel project to point somewhere else.
const TARGET = process.env.INQUIRY_ENDPOINT || "https://jinnxbookpress.com/api/inquiries";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON body" }); }
  }

  // Honeypot: people never see the "company" field; bots that fill every field do.
  if (text(body.company, 200)) return res.status(200).json({ ok: true });

  const name = text(body.name, 200);
  const email = text(body.email, 254);
  const phone = text(body.phone, 50);
  if (!name || !EMAIL.test(email) || phone.replace(/\D/g, "").length < 7) {
    return res.status(400).json({ error: "Name, a valid email and a phone number are required." });
  }

  const form = text(body.form, 40);
  const page = text(body.page, 250) || "jinnx-landing";
  const payload = {
    name,
    email,
    phone,
    service: "landing-page",
    serviceLabel: "Publish Your Book landing page",
    message: text(body.message, 5000),
    sourcePage: form ? `${page} [${form}]` : page,
  };

  try {
    const r = await fetch(TARGET, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      console.error("Inquiry forward failed:", r.status, await r.text().catch(() => ""));
      return res.status(502).json({ error: "Could not save the inquiry." });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Inquiry forward error:", err);
    return res.status(502).json({ error: "Could not reach the inquiries service." });
  }
};
