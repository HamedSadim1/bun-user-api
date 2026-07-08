const form = document.getElementById("signupForm");
const successState = document.getElementById("successState");
const successUsername = document.getElementById("successUsername");
const createAnotherBtn = document.getElementById("createAnotherBtn");
const formHeader = document.querySelector(".form-header");
const toast = document.getElementById("toast");
const strengthMeter = document.getElementById("strength-meter");
const strengthBar = document.getElementById("strength-bar");
const strengthText = document.getElementById("strength-text");
const submitBtn = document.getElementById("formBtn");
const btnText = submitBtn.querySelector(".btn-text");
const btnLoader = submitBtn.querySelector(".btn-loader");
const togglePassword = document.querySelector(".toggle-password");
const passwordInput = document.getElementById("password");

// Toggle password visibility
togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.classList.toggle("visible", isPassword);
});

// Password strength checker
passwordInput.addEventListener("input", () => {
  const val = passwordInput.value;
  if (!val) {
    strengthMeter.classList.add("hidden");
    return;
  }
  strengthMeter.classList.remove("hidden");

  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];
  const widths = ["20%", "40%", "60%", "80%", "100%"];

  const idx = Math.min(score, levels.length - 1);
  strengthText.textContent = levels[idx];
  strengthText.style.color = colors[idx];
  strengthBar.style.width = widths[idx];
  strengthBar.style.background = colors[idx];
});

// Toast helper
function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast toast-${type}`;
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
}

// Field validation
function validateField(input) {
  const errorEl = document.getElementById(`${input.id}-error`);
  const wrapper = input.closest(".input-wrapper");
  const icon = wrapper.querySelector(".validation-icon");

  let isValid = true;
  let message = "";

  if (input.id === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input.value.trim()) {
      isValid = false;
      message = "Email is required";
    } else if (!emailRegex.test(input.value)) {
      isValid = false;
      message = "Please enter a valid email address";
    }
  } else if (input.id === "username") {
    if (!input.value.trim()) {
      isValid = false;
      message = "Username is required";
    } else if (input.value.length < 2) {
      isValid = false;
      message = "Username must be at least 2 characters";
    }
  } else if (input.id === "password") {
    if (!input.value) {
      isValid = false;
      message = "Password is required";
    } else if (input.value.length < 6) {
      isValid = false;
      message = "Password must be at least 6 characters";
    }
  }

  if (!isValid) {
    wrapper.classList.add("invalid");
    wrapper.classList.remove("valid");
    icon.textContent = "✕";
    errorEl.textContent = message;
  } else {
    wrapper.classList.add("valid");
    wrapper.classList.remove("invalid");
    icon.textContent = "✓";
    errorEl.textContent = "";
  }

  return isValid;
}

// Live validation on blur
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("blur", () => {
    if (input.value) validateField(input);
  });
  input.addEventListener("input", () => {
    const wrapper = input.closest(".input-wrapper");
    if (wrapper.classList.contains("invalid")) {
      validateField(input);
    }
  });
});

// Create another account button
createAnotherBtn.addEventListener("click", () => {
  form.classList.remove("hidden");
  successState.classList.add("hidden");
  formHeader.classList.remove("hidden");
  form.reset();
  togglePassword.classList.remove("visible");
  passwordInput.type = "password";
  strengthMeter.classList.add("hidden");
  document.querySelectorAll(".validation-icon").forEach((icon) => {
    icon.textContent = "";
  });
  document.querySelectorAll(".input-wrapper").forEach((w) => {
    w.classList.remove("valid", "invalid");
  });
});

// Form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = form.querySelectorAll("input");
  let allValid = true;
  inputs.forEach((input) => {
    if (!validateField(input)) {
      allValid = false;
    }
  });

  if (!allValid) return;

  submitBtn.disabled = true;
  btnText.classList.add("hidden");
  btnLoader.classList.remove("hidden");

  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch("/addUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      showToast("Account created successfully! 🎉", "success");
      successUsername.textContent = data.username;
      form.classList.add("hidden");
      successState.classList.remove("hidden");
      formHeader.classList.add("hidden");
      strengthMeter.classList.add("hidden");
    } else if (response.status === 400) {
      const err = await response.json();
      showToast(err.error || "Validation failed. Please check your input.", "error");
    } else {
      showToast("Something went wrong. Please try again.", "error");
    }
  } catch {
    showToast("Could not connect to the server.", "error");
  } finally {
    submitBtn.disabled = false;
    btnText.classList.remove("hidden");
    btnLoader.classList.add("hidden");
  }
});
