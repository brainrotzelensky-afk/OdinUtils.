const btn = document.getElementById("copyBtn");
const gf = document.getElementById("File");
const pin = document.getElementById("pin");
const toast = document.getElementById("toast");

// Small helper function to show toast messages
const showToast = (msg, success = true) => {
  toast.textContent = msg;
  toast.style.color = success ? "#00ff7f" : "#ff4f4f";
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
};

// Handle button click
btn.onclick = async () => {
  const content = gf.value.trim();
  const pinValue = pin.value.trim();

  // Validate
  if (!content || content.length < 50) {
    showToast("File too short", false);
    return;
  }

  if (!pinValue) {
    showToast("Enter PIN", false);
    return;
  }

  try {
    // Send to your Vercel serverless function
    const response = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, pin: pinValue }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showToast("Uploaded ✅");
      gf.value = "";
      pin.value = "";
    } else {
      showToast("Send failed ❌", false);
    }
  } catch (error) {
    showToast("Error connecting to server ❌", false);
    console.error(error);
  }
};
