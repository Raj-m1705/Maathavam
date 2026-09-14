(() => {
  const root = document.documentElement;
  const opening = document.getElementById("brand-opening");

  if (!opening || !root.classList.contains("opening-running")) {
    return;
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  let finished = false;
  let exiting = false;
  let timer;
  const animations = [];

  function animate(element, frames, options) {
    if (!element?.animate) return null;

    const animation = element.animate(frames, options);
    animations.push(animation);
    return animation;
  }

  function finish(withTrail = false) {
    if (finished) return;
    finished = true;

    clearTimeout(timer);
    clearTimeout(window.maathavamOpeningFallback);

    const restoreFocus = opening.contains(document.activeElement);

    animations.forEach(animation => animation.cancel());

    opening.remove();
    root.classList.remove("opening-running");

    document.removeEventListener("keydown", onKey);
    reduced.removeEventListener("change", onPreferenceChange);
    window.removeEventListener("pagehide", onPageHide);

    if (restoreFocus) {
      document.querySelector(".brand")?.focus({
        preventScroll: true
      });
    }

    if (!withTrail || reduced.matches) return;

    const hero = document.querySelector(".hero");
    if (!hero?.animate) return;

    const trail = document.createElement("span");
    trail.className = "opening-hero-trail";
    trail.setAttribute("aria-hidden", "true");
    hero.append(trail);

    const animation = trail.animate(
      [
        { transform: "scaleX(0)", opacity: 0 },
        { transform: "scaleX(.5)", opacity: 1, offset: .45 },
        { transform: "scaleX(1)", opacity: 0 }
      ],
      {
        duration: 1100,
        easing: "cubic-bezier(.16, 1, .3, 1)"
      }
    );

    animation.addEventListener("finish", () => trail.remove(), {
      once: true
    });

    setTimeout(() => trail.remove(), 1300);
  }

  function revealPage() {
    if (finished || exiting) return;
    exiting = true;

    if (reduced.matches || !opening.animate) {
      finish();
      return;
    }

    const content = opening.querySelector(".opening-composition");
    const feather = opening.querySelector(".opening-feather");

    /*
     * Preserve the overlay's appearance before removing the
     * class that hides the underlying website.
     */
    opening.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: grid;
      place-items: center;
      overflow: hidden;
      isolation: isolate;
      background:
        radial-gradient(
          ellipse at 50% 38%,
          rgba(156, 119, 41, .12),
          transparent 55%
        ),
        #080a0c;
    `;

    const edge = document.createElement("span");
    edge.className = "opening-exit-trail";
    edge.setAttribute("aria-hidden", "true");
    opening.append(edge);

    root.classList.remove("opening-running");

    animate(
      feather,
      [
        { transform: "translateY(0) rotate(0deg)" },
        { transform: "translateY(-28px) rotate(-7deg)" }
      ],
      {
        duration: 700,
        easing: "cubic-bezier(.16, 1, .3, 1)",
        fill: "forwards"
      }
    );

    animate(
      content,
      [
        { opacity: 1 },
        { opacity: 0 }
      ],
      {
        duration: 500,
        easing: "ease-in",
        fill: "forwards"
      }
    );

    const exit = animate(
      opening,
      [
        { clipPath: "inset(0 0 0 0)" },
        { clipPath: "inset(0 0 100% 0)" }
      ],
      {
        duration: 900,
        easing: "cubic-bezier(.76, 0, .24, 1)",
        fill: "forwards"
      }
    );

    // Follow the moving bottom edge of the curtain.
    animate(
      edge,
      [
        { top: "100%", opacity: 0 },
        { opacity: 1, offset: .15 },
        { top: "0%", opacity: 0 }
      ],
      {
        duration: 900,
        easing: "cubic-bezier(.76, 0, .24, 1)",
        fill: "forwards"
      }
    );

    exit.addEventListener("finish", () => finish(true), {
      once: true
    });
  }

  function onKey(event) {
    if (event.key === "Escape" || event.key === "Tab") {
      finish();
    }
  }

  function onPreferenceChange() {
    if (reduced.matches) finish();
  }

  function onPageHide() {
    finish();
  }

  opening.querySelector(".opening-skip")
    ?.addEventListener("click", () => finish());

  document.addEventListener("keydown", onKey);
  reduced.addEventListener("change", onPreferenceChange);
  window.addEventListener("pagehide", onPageHide);

  const elapsed =
    performance.now() - window.maathavamOpeningStart;

  // Roughly 2.1 seconds of drawing + 0.9 seconds of reveal.
  timer = setTimeout(revealPage, Math.max(0, 2100 - elapsed));
})();