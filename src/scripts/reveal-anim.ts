document.addEventListener("astro:page-load", () => {
  function handleImageFadeIn() {
    document
      .querySelectorAll<HTMLElement>(".reveal-img")
      .forEach((container) => {
        const picture = container.querySelector<HTMLElement>("picture");
        const placeholder = container.querySelector<HTMLElement>(".absolute");
        const imgElement = picture?.querySelector("img");

        if (!picture || !imgElement) return;

        const showImage = () => {
          picture.style.opacity = "1";
          if (placeholder) placeholder.style.opacity = "0";
        };

        if (imgElement.complete) {
          showImage(); // Image chargée depuis le cache
        } else {
          picture.style.transition = "opacity 1200ms ease";
          if (placeholder) placeholder.style.transition = "opacity 1200ms ease";

          imgElement.addEventListener("load", showImage);
        }
      });
  }

  function setupRevealAnimations() {
    const reveals = document.querySelectorAll<HTMLElement>(".reveal");

    if (reveals.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-anim");
          }
        });
      },
      { threshold: 0.25 },
    );

    reveals.forEach((reveal) => observer.observe(reveal));
  }

  handleImageFadeIn();
  setupRevealAnimations();
});
