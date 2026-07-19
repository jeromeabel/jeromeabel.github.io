document.addEventListener("astro:page-load", () => {
  const links = document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]");
  if (!links.length) return;

  const bySlug = new Map<string, HTMLAnchorElement>();
  links.forEach((link) => {
    const slug = link.dataset.tocLink;
    if (slug) bySlug.set(slug, link);
  });

  const headings = [
    ...document.querySelectorAll<HTMLElement>(".prose :is(h2, h3)[id]"),
  ].filter((heading) => bySlug.has(heading.id));
  if (!headings.length) return;

  const visible = new Set<string>();

  const setActive = (slug: string | null) => {
    links.forEach((link) => link.removeAttribute("aria-current"));
    if (slug) bySlug.get(slug)?.setAttribute("aria-current", "location");
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visible.add(entry.target.id);
        } else {
          visible.delete(entry.target.id);
        }
      });

      const topmost = headings.find((heading) => visible.has(heading.id));
      setActive(topmost?.id ?? null);
    },
    { rootMargin: "0px 0px -70% 0px", threshold: 0 },
  );

  headings.forEach((heading) => observer.observe(heading));

  const motionOff = document.documentElement.dataset.motion === "off";
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const slug = link.dataset.tocLink;
      const target = slug ? document.getElementById(slug) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: motionOff ? "instant" : "smooth" });
      history.pushState(null, "", `#${slug}`);
    });
  });
});
