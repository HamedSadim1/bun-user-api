(() => {
  const path = window.location.pathname;

  const nav = document.createElement("nav");
  nav.className = "nav-bar";

  // Brand: het woordmerk is ook de weg naar huis
  const brand = document.createElement("a");
  brand.className = "nav-brand";
  brand.href = "/";
  brand.setAttribute("aria-label", "XYZ University, home");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.5");
  svg.setAttribute("aria-hidden", "true");

  const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
  title.textContent = "University icon";
  svg.appendChild(title);

  const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathEl.setAttribute("d", "M12 14l9-5-9-5-9 5 9 5z");
  svg.appendChild(pathEl);

  brand.appendChild(svg);

  const span = document.createElement("span");
  span.textContent = "XYZ University";
  brand.appendChild(span);

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
    if (page.match) a.setAttribute("aria-current", "page");
    a.textContent = page.label;
    links.appendChild(a);
  }

  nav.appendChild(links);
  document.body.prepend(nav);
})();
