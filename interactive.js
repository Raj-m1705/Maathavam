(() => {
  "use strict";

  function initialiseInteractions() {
    const root = document.documentElement;

    if (root.dataset.interactiveReady) return;
    root.dataset.interactiveReady = "true";

    const reducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const finePointer = matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    function motionAllowed() {
      return (
        root.dataset.motion !== "off" &&
        !reducedMotion.matches
      );
    }

    /* -------------------------------------
       Travelling gold light
       ------------------------------------- */

    const traveller = document.createElement("div");
    traveller.className = "scroll-traveller";
    traveller.setAttribute("aria-hidden", "true");

    const fill = document.createElement("div");
    fill.className = "traveller-fill";

    const object = document.createElement("div");
    object.className = "traveller-object";

    const label = document.createElement("span");
    label.className = "traveller-label";

    object.append(label);
    traveller.append(fill, object);
    document.body.append(traveller);

    const chapters = [
      ["home", "WELCOME"],
      ["services", "OUR EXPERTISE"],
      ["approach", "OUR APPROACH"],
      ["leadership", "OUR PEOPLE"],
      ["experience", "OUR EXPERIENCE"],
      ["contact", "LET’S TALK"]
    ].map(([id, title]) => ({
      element: document.getElementById(id),
      title
    })).filter(chapter => chapter.element);

    let previousChapter = "";
    let labelTimer;
    let pendingScroll = false;

    function updateTraveller() {
      pendingScroll = false;

      if (!motionAllowed()) {
        traveller.classList.remove("is-active");
        return;
      }

      const scrollable =
        document.documentElement.scrollHeight - innerHeight;

      const progress = scrollable > 0
        ? Math.max(0, Math.min(1, scrollY / scrollable))
        : 0;

      traveller.style.setProperty(
        "--travel-progress",
        progress.toFixed(4)
      );

      traveller.classList.toggle(
        "is-active",
        scrollY > 120 && scrollable > 0
      );

      let active = chapters[0];

      for (const chapter of chapters) {
        if (
          chapter.element.getBoundingClientRect().top <=
          innerHeight * .45
        ) {
          active = chapter;
        }
      }

      if (active && active.title !== previousChapter) {
        previousChapter = active.title;
        label.textContent = active.title;

        traveller.classList.add("show-label");

        clearTimeout(labelTimer);
        labelTimer = setTimeout(() => {
          traveller.classList.remove("show-label");
        }, 1500);
      }
    }

    function queueTravellerUpdate() {
      if (pendingScroll) return;

      pendingScroll = true;
      requestAnimationFrame(updateTraveller);
    }

    addEventListener("scroll", queueTravellerUpdate, {
      passive: true
    });

    addEventListener("resize", queueTravellerUpdate);

    if ("ResizeObserver" in window) {
      new ResizeObserver(queueTravellerUpdate)
        .observe(document.body);
    }

    /* -------------------------------------
       Card spotlight and restrained tilt
       ------------------------------------- */

    const cards = [
      ...document.querySelectorAll(
        ".team-card, .engagement-card, .service, .number-item"
      )
    ];

    const resetFunctions = [];

    cards.forEach(card => {
      card.classList.add("interactive-card");

      let frame = null;
      let pointerX = 0;
      let pointerY = 0;

      function resetCard() {
        if (frame !== null) cancelAnimationFrame(frame);

        frame = null;
        card.classList.remove("pointer-active");
        card.style.removeProperty("rotate");
        card.style.removeProperty("--pointer-x");
        card.style.removeProperty("--pointer-y");
      }

      resetFunctions.push(resetCard);

      function paintPointer() {
        frame = null;

        if (!motionAllowed() || !finePointer.matches) {
          resetCard();
          return;
        }

        const bounds = card.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;

        const x = Math.max(
          0,
          Math.min(1, (pointerX - bounds.left) / bounds.width)
        );

        const y = Math.max(
          0,
          Math.min(1, (pointerY - bounds.top) / bounds.height)
        );

        card.style.setProperty("--pointer-x", `${x * 100}%`);
        card.style.setProperty("--pointer-y", `${y * 100}%`);

        /*
         * Keep accordion rows stable.
         * Only portrait and engagement cards tilt.
         */
        if (
          card.matches(".team-card, .engagement-card") &&
          !card.matches(":focus-within")
        ) {
          const axisX = -(y - .5);
          const axisY = x - .5;
          const magnitude = Math.hypot(axisX, axisY);

          card.style.rotate = magnitude < .01
            ? "none"
            : `${axisX} ${axisY} 0 ${magnitude * 2.5}deg`;
        }

        card.classList.add("pointer-active");
      }

      card.addEventListener("pointermove", event => {
        if (
          event.pointerType !== "mouse" ||
          !motionAllowed() ||
          !finePointer.matches
        ) {
          return;
        }

        pointerX = event.clientX;
        pointerY = event.clientY;

        if (frame === null) {
          frame = requestAnimationFrame(paintPointer);
        }
      });

      card.addEventListener("pointerleave", resetCard);
      card.addEventListener("pointercancel", resetCard);
      card.addEventListener("focusin", resetCard);
    });

    function refreshPreferences() {
      resetFunctions.forEach(reset => reset());
      queueTravellerUpdate();
    }

    reducedMotion.addEventListener("change", refreshPreferences);
    finePointer.addEventListener("change", refreshPreferences);

    new MutationObserver(refreshPreferences).observe(root, {
      attributes: true,
      attributeFilter: ["data-motion"]
    });

    updateTraveller();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialiseInteractions,
      { once: true }
    );
  } else {
    initialiseInteractions();
  }
})();