document.addEventListener('astro:page-load', () => {
  const reveals = [...document.querySelectorAll('.reveal')];

  // create observer
  const callbackObserver = (entries: any[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-anim');
      }
    });
  };
  const observer = new IntersectionObserver(callbackObserver, {
    threshold: 0.25,
  });

  // observe boxes
  reveals.forEach((reveal) => observer.observe(reveal));
});
