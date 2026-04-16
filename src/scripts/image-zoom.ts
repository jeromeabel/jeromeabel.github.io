document.addEventListener("astro:page-load", () => {
  const prose = document.querySelector<HTMLElement>(".prose[data-expand-image]");
  if (!prose) return;

  const mode = prose.dataset.expandImage; // "inline" or "modal"
  const images = prose.querySelectorAll<HTMLImageElement>("img");
  if (images.length === 0) return;

  // --- Inline mode ---
  let expandedImg: HTMLImageElement | null = null;
  const overflowParents: HTMLElement[] = [];

  function isExpandable(img: HTMLImageElement) {
    const targetWidth = Math.min(img.naturalWidth, window.innerWidth * 0.8);
    return targetWidth > img.offsetWidth;
  }

  function setOverflowVisible(img: HTMLImageElement) {
    let el: HTMLElement | null = img.parentElement;
    while (el && el !== document.body) {
      const style = getComputedStyle(el);
      if (style.overflow !== "visible" || style.overflowX !== "visible") {
        el.classList.add("img-zoom-active");
        overflowParents.push(el);
      }
      el = el.parentElement;
    }
  }

  function restoreOverflow() {
    overflowParents.forEach((el) => el.classList.remove("img-zoom-active"));
    overflowParents.length = 0;
  }

  function toggleInline(img: HTMLImageElement) {
    if (img === expandedImg) {
      img.classList.remove("img-expanded");
      img.style.width = "";
      img.style.marginLeft = "";
      expandedImg = null;
      restoreOverflow();
      return;
    }

    // Collapse previous
    if (expandedImg) {
      expandedImg.classList.remove("img-expanded");
      expandedImg.style.width = "";
      expandedImg.style.marginLeft = "";
      restoreOverflow();
    }

    // Expand to natural size, capped at 80% of viewport
    const targetWidth = Math.min(img.naturalWidth, window.innerWidth * 0.8);
    const currentWidth = img.offsetWidth;
    const marginLeft = -(targetWidth - currentWidth) / 2;

    img.classList.add("img-expanded");
    img.style.width = `${targetWidth}px`;
    img.style.marginLeft = `${marginLeft}px`;
    expandedImg = img;
    setOverflowVisible(img);
  }

  // --- Modal mode ---
  let backdrop: HTMLDivElement | null = null;
  let lightboxImg: HTMLImageElement | null = null;

  function openModal(src: string, alt: string) {
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "img-lightbox-backdrop";
      backdrop.addEventListener("click", closeModal);
      lightboxImg = document.createElement("img");
      backdrop.appendChild(lightboxImg);
      document.body.appendChild(backdrop);
    }
    if (lightboxImg) {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
    }
    backdrop.offsetHeight;
    backdrop.classList.add("active");
    document.addEventListener("keydown", handleEscape);
  }

  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.remove("active");
    document.removeEventListener("keydown", handleEscape);
  }

  function handleEscape(e: KeyboardEvent) {
    if (e.key === "Escape") {
      if (mode === "modal") closeModal();
      else if (expandedImg) toggleInline(expandedImg);
    }
  }

  // --- Bind ---
  images.forEach((img) => {
    img.addEventListener("click", () => {
      if (img === expandedImg) {
        toggleInline(img);
        return;
      }
      if (!isExpandable(img)) return;
      if (mode === "modal") openModal(img.src, img.alt);
      else toggleInline(img);
    });
  });
});
