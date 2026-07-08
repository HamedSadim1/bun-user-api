(() => {
  const path = window.location.pathname;

  const nav = document.createElement("nav");
  nav.className = "nav-bar";

  // Brand
  const brand = document.createElement("div");
  brand.className = "nav-brand";
  brand.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><title>University icon</title><path d="M12 14l9-5-9-5-9 5 9 5z"/></svg>' +
    "<span>XYZ University</span>";
  nav.appendChild(brand);

  // Links
  const links = document.createElement("div");
  links.className = "nav-links";

  const pages = [
    { href: "/", label: "Sign Up", match: path === "/" },
    { href: "/users", label: "Users", match: path === "/users" },
  ];

  for (const page of pages) {
    const a = document.createElement("a");
    a.href = page.href;
    a.className = page.match ? "nav-link active" : "nav-link";
    a.textContent = page.label;
    links.appendChild(a);
  }

  nav.appendChild(links);
  document.body.prepend(nav);
})();
