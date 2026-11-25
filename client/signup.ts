type ToastType = "success" | "error";

const form = document.querySelector<HTMLFormElement>("#signupForm");
const successState = document.getElementById("successState");
const successUsername = document.getElementById("successUsername");
const createAnotherBtn = document.querySelector<HTMLButtonElement>("#createAnotherBtn");
const formHeader = document.querySelector<HTMLElement>(".form-header");
const toast = document.getElementById("toast");
const strengthMeter = document.getElementById("strength-meter");
const strengthText = document.getElementById("strength-text");
const submitBtn = document.querySelector<HTMLButtonElement>("#formBtn");
const togglePassword = document.querySelector<HTMLButtonElement>(".toggle-password");
const passwordInput = document.querySelector<HTMLInputElement>("#password");
const emailInput = document.querySelector<HTMLInputElement>("#email");
const usernameInput = document.querySelector<HTMLInputElement>("#username");

if (!form || !submitBtn || !toast) {
  throw new Error("Signup form elements not found");
}

const btnText = submitBtn.querySelector(".btn-text");
const btnLoader = submitBtn.querySelector(".btn-loader");

let toastTimer: ReturnType<typeof setTimeout> | undefined;

// Toast helper: reset de timer, zodat een nieuwe melding niet door de vorige wordt verborgen
function showToast(message: string, type: ToastType = "success"): void {
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast toast-${type}`;
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
}

// Shared field state: icon, wrapper class and aria-invalid
function setFieldState(input: HTMLInputElement, isValid: boolean, message: string): void {
  const wrapper = input.closest(".input-wrapper");
  const errorEl = document.getElementById(`${input.id}-error`);
  if (!wrapper || !errorEl) return;
  const icon = wrapper.querySelector(".validation-icon");

  if (!isValid) {
    wrapper.classList.add("invalid");
    wrapper.classList.remove("valid");
    if (icon) icon.textContent = "✕";
    input.setAttribute("aria-invalid", "true");
    errorEl.textContent = message;
  } else {
    wrapper.classList.add("valid");
    wrapper.classList.remove("invalid");
    if (icon) icon.textContent = "✓";
    input.setAttribute("aria-invalid", "false");
    errorEl.textContent = "";
  }
}

// Toggle password visibility
if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.classList.toggle("visible", isPassword);
    togglePassword.setAttribute("aria-pressed", String(isPassword));
    togglePassword.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
  });
}

// Password strength checker
if (passwordInput && strengthMeter && strengthText) {
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
    strengthText.textContent = levels[idx] ?? "Very weak";
    // De meter bepaalt zowel balkbreedte als kleur (CSS-variabelen)
    strengthMeter.dataset.strength = String(idx);
  });
}

// Field validation
function validateField(input: HTMLInputElement): boolean {
  const wrapper = input.closest(".input-wrapper");
  const errorEl = document.getElementById(`${input.id}-error`);
  if (!wrapper || !errorEl) return false;

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

  setFieldState(input, isValid, message);
  return isValid;
}

// Live validation on blur
document.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
  input.addEventListener("blur", () => {
    if (input.value) validateField(input);
  });
  input.addEventListener("input", () => {
    const wrapper = input.closest(".input-wrapper");
    if (wrapper?.classList.contains("invalid")) {
      validateField(input);
    }
  });
});

// Create another account button
if (createAnotherBtn && successState && formHeader) {
  createAnotherBtn.addEventListener("click", () => {
    form.classList.remove("hidden");
    successState.classList.add("hidden");
    formHeader.classList.remove("hidden");
    form.reset();
    if (togglePassword) {
      togglePassword.classList.remove("visible");
      togglePassword.setAttribute("aria-pressed", "false");
      togglePassword.setAttribute("aria-label", "Show password");
    }
    if (passwordInput) passwordInput.type = "password";
    if (strengthMeter) strengthMeter.classList.add("hidden");
    for (const input of form.querySelectorAll("input")) {
      input.setAttribute("aria-invalid", "false");
    }
    document.querySelectorAll(".validation-icon").forEach((icon) => {
      icon.textContent = "";
    });
    document.querySelectorAll(".input-wrapper").forEach((w) => {
      w.classList.remove("valid", "invalid");
    });
    document.getElementById("email")?.focus();
  });
}

// Form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = form.querySelectorAll<HTMLInputElement>("input");
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
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      showToast("Account created successfully! 🎉", "success");
      if (successUsername) successUsername.textContent = String(data.username ?? "");
      form.classList.add("hidden");
      if (successState) {
        successState.classList.remove("hidden");
        document.getElementById("successHeading")?.focus();
      }
      if (formHeader) formHeader.classList.add("hidden");
      if (strengthMeter) strengthMeter.classList.add("hidden");
    } else {
      const err = (await response.json().catch(() => null)) as {
        error?: string;
        field?: "email" | "username";
      } | null;
      const message = err?.error || "Something went wrong. Please try again.";

      // A conflict belongs to a specific field, not to a floating toast
      if (response.status === 409 && err?.field) {
        const conflictInput = err.field === "username" ? usernameInput : emailInput;
        if (conflictInput) {
          setFieldState(conflictInput, false, message);
          conflictInput.focus();
        }
      } else {
        showToast(message, "error");
      }
    }
  } catch {
    showToast("Could not connect to the server.", "error");
  } finally {
    submitBtn.disabled = false;
    if (btnText) btnText.classList.remove("hidden");
    if (btnLoader) btnLoader.classList.add("hidden");
  }
});
