const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const errorState = document.getElementById("errorState");
const usersTable = document.getElementById("usersTable");
const usersTbody = document.getElementById("usersTbody");
const userCount = document.getElementById("userCount");
const refreshBtn = document.getElementById("refreshBtn");
const retryBtn = document.getElementById("retryBtn");

function showState(state) {
  if (!loadingState || !emptyState || !errorState || !usersTable) return;
  loadingState.classList.add("hidden");
  emptyState.classList.add("hidden");
  errorState.classList.add("hidden");
  usersTable.classList.add("hidden");

  if (state === "loading") loadingState.classList.remove("hidden");
  else if (state === "empty") emptyState.classList.remove("hidden");
  else if (state === "error") errorState.classList.remove("hidden");
  else if (state === "table") usersTable.classList.remove("hidden");
}

function createTableCell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function createUserRow(user, index) {
  const tr = document.createElement("tr");

  const tdNum = document.createElement("td");
  tdNum.textContent = String(index + 1);
  tr.appendChild(tdNum);

  tr.appendChild(createTableCell(user.email || "-"));
  tr.appendChild(createTableCell(user.username || "-"));

  const tdId = document.createElement("td");
  const code = document.createElement("code");
  code.textContent = user._id || "-";
  tdId.appendChild(code);
  tr.appendChild(tdId);

  return tr;
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

    if (!usersTbody) return;
    usersTbody.replaceChildren();

    users.forEach((user, index) => {
      usersTbody.appendChild(createUserRow(user, index));
    });

    if (userCount) {
      userCount.textContent = `${users.length} user${users.length !== 1 ? "s" : ""} registered`;
    }
    showState("table");
  } catch {
    showState("error");
  }
}

if (refreshBtn) refreshBtn.addEventListener("click", loadUsers);
if (retryBtn) retryBtn.addEventListener("click", loadUsers);

window.addEventListener("unhandledrejection", () => {
  showState("error");
});

loadUsers();
