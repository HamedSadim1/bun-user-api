type User = {
  _id?: string;
  email?: string;
  username?: string;
};

type ViewState = "loading" | "empty" | "error" | "table";

const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const errorState = document.getElementById("errorState");
const usersTable = document.getElementById("usersTable");
const usersTbody = document.getElementById("usersTbody");
const userCount = document.getElementById("userCount");
const refreshBtn = document.querySelector<HTMLButtonElement>("#refreshBtn");
const retryBtn = document.querySelector<HTMLButtonElement>("#retryBtn");

function showState(state: ViewState): void {
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

function createTableCell(text: string): HTMLTableCellElement {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function createUserRow(user: User, index: number): HTMLTableRowElement {
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

async function loadUsers(): Promise<void> {
  showState("loading");
  if (refreshBtn) refreshBtn.disabled = true;
  if (retryBtn) retryBtn.disabled = true;

  try {
    const response = await fetch("/getUsers");

    if (!response.ok) {
      showState("error");
      return;
    }

    const payload: unknown = await response.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      showState("empty");
      return;
    }

    const users = payload as User[];

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
  } finally {
    if (refreshBtn) refreshBtn.disabled = false;
    if (retryBtn) retryBtn.disabled = false;
  }
}

if (refreshBtn) refreshBtn.addEventListener("click", loadUsers);
if (retryBtn) retryBtn.addEventListener("click", loadUsers);

window.addEventListener("unhandledrejection", () => {
  showState("error");
});

loadUsers();
