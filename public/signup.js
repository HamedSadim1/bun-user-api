// Toast helper
function showToast(message, type = "success") {
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast toast-${type}`;
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
}

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
const togglePassword = document.querySelector(".toggle-password");
const passwordInput = document.getElementById("password");

if (!form || !submitBtn || !toast) {
  throw new Error("Signup form elements not found");
}

const btnText = submitBtn.querySelector(".btn-text");
const btnLoader = submitBtn.querySelector(".btn-loader");

// Toggle password visibility
if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.classList.toggle("visible", isPassword);
  });
}

// Password strength checker
if (passwordInput && strengthMeter && strengthBar && strengthText) {
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

    const idx = Math.min(score, levels.length - 1);
    strengthText.textContent = levels[idx];
    strengthText.dataset.strength = String(idx);
    strengthBar.dataset.strength = String(idx);
  });
}

// Field validation
function validateField(input) {
  const errorEl = document.getElementById(`${input.id}-error`);
  const wrapper = input.closest(".input-wrapper");
  if (!wrapper || !errorEl) return false;
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
    if (icon) icon.textContent = "✕";
    errorEl.textContent = message;
  } else {
    wrapper.classList.add("valid");
    wrapper.classList.remove("invalid");
    if (icon) icon.textContent = "✓";
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
    if (wrapper && wrapper.classList.contains("invalid")) {
      validateField(input);
    }
  });
});

// Create another account button
if (createAnotherBtn && form && successState && formHeader) {
  createAnotherBtn.addEventListener("click", () => {
    form.classList.remove("hidden");
    successState.classList.add("hidden");
    formHeader.classList.remove("hidden");
    form.reset();
    if (togglePassword) togglePassword.classList.remove("visible");
    if (passwordInput) passwordInput.type = "password";
    if (strengthMeter) strengthMeter.classList.add("hidden");
    document.querySelectorAll(".validation-icon").forEach((icon) => {
      icon.textContent = "";
    });
    document.querySelectorAll(".input-wrapper").forEach((w) => {
      w.classList.remove("valid", "invalid");
    });
  });
}

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
  if (btnText) btnText.classList.add("hidden");
  if (btnLoader) btnLoader.classList.remove("hidden");

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
      if (successUsername) successUsername.textContent = data.username;
      form.classList.add("hidden");
      if (successState) successState.classList.remove("hidden");
      if (formHeader) formHeader.classList.add("hidden");
      if (strengthMeter) strengthMeter.classList.add("hidden");
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
    if (btnText) btnText.classList.remove("hidden");
    if (btnLoader) btnLoader.classList.add("hidden");
  }
});
