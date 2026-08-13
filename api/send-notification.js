export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, phone, email, cleaningType, propertySize, suburb, preferredDate, message } = req.body || {};

  if (!name || !phone || !email || !cleaningType || !suburb) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const notifyNumber = process.env.NOTIFY_PHONE_NUMBER || "+61430230971";

  if (!accountSid || !authToken || !fromNumber) {
    res.status(500).json({ error: "Twilio is not configured on the server yet" });
    return;
  }

  const lines = [
    `New website enquiry from ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Cleaning Type: ${cleaningType}`,
    `Suburb: ${suburb}`
  ];
  if (propertySize) lines.push(`Property Size: ${propertySize}`);
  if (preferredDate) lines.push(`Preferred Date: ${preferredDate}`);
  if (message) lines.push(`Message: ${message}`);
  const body = lines.join("\n");

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  async function sendTwilioMessage(to, from) {
    const params = new URLSearchParams();
    params.append("To", to);
    params.append("From", from);
    params.append("Body", body);

    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      }
    );
    const data = await twilioRes.json().catch(() => ({}));
    return { ok: twilioRes.ok, status: twilioRes.status, data };
  }

  const results = {};

  // SMS
  try {
    const smsResult = await sendTwilioMessage(notifyNumber, fromNumber);
    results.sms = smsResult.ok ? "sent" : (smsResult.data?.message || `failed (${smsResult.status})`);
  } catch (err) {
    results.sms = "error";
  }

  // WhatsApp — requires the Twilio number to be WhatsApp-enabled, and on a
  // trial account, requires the recipient to have joined the sandbox first
  try {
    const waResult = await sendTwilioMessage(`whatsapp:${notifyNumber}`, `whatsapp:${fromNumber}`);
    results.whatsapp = waResult.ok ? "sent" : (waResult.data?.message || `failed (${waResult.status})`);
  } catch (err) {
    results.whatsapp = "error";
  }

  res.status(200).json({ ok: true, results });
}
