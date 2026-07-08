const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const errorState = document.getElementById("errorState");
const usersTable = document.getElementById("usersTable");
const usersTbody = document.getElementById("usersTbody");
const userCount = document.getElementById("userCount");
const refreshBtn = document.getElementById("refreshBtn");
const retryBtn = document.getElementById("retryBtn");

function showState(state) {
  loadingState.classList.add("hidden");
  emptyState.classList.add("hidden");
  errorState.classList.add("hidden");
  usersTable.classList.add("hidden");

  if (state === "loading") loadingState.classList.remove("hidden");
  else if (state === "empty") emptyState.classList.remove("hidden");
  else if (state === "error") errorState.classList.remove("hidden");
  else if (state === "table") usersTable.classList.remove("hidden");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function loadUsers() {
  showState("loading");

  try {
    const response = await fetch("/getUsers");

    if (!response.ok) {
      showState("error");
      return;
    }

    const users = await response.json();

    if (!users || users.length === 0) {
      showState("empty");
      return;
    }

    usersTbody.innerHTML = "";

    users.forEach((user, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${index + 1}</td><td>${escapeHtml(user.email || "-")}</td><td>${escapeHtml(user.username || "-")}</td><td><code>${escapeHtml(user._id || "-")}</code></td>`;
      usersTbody.appendChild(tr);
    });

    userCount.textContent = `${users.length} user${users.length !== 1 ? "s" : ""} registered`;
    showState("table");
  } catch {
    showState("error");
  }
}

refreshBtn.addEventListener("click", loadUsers);
retryBtn.addEventListener("click", loadUsers);
loadUsers();
