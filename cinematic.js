(() => {
  "use strict";

  function initialiseCinematicReveals() {
    const root = document.documentElement;

    if (root.dataset.cinematicV2Ready) return;
    root.dataset.cinematicV2Ready = "true";

    const reducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const enabled = () =>
      root.dataset.motion !== "off" &&
      !reducedMotion.matches;

    const isMobile = () => innerWidth <= 760;

    /*
     * IMPORTANT:
     * This file replaces the previous cinematic.js.
     * Do not load both versions.
     */

    const records = [];
    const sections = [
      ...document.querySelectorAll(
        "#services, #approach, #leadership, #experience, #contact"
      )
    ];

    let scheduled = false;
    let previousScroll = scrollY;
    let direction = 1;
    let activeSection = "";

    /* Major headings and cards use the same scroll timeline. */
    sections.forEach(section => {
      const heading = section.querySelector(".section-heading");

      const cards = [
        ...section.querySelectorAll(
          ".team-card, " +
          ".engagement-card, " +
          ".service, " +
          ".outcomes article, " +
          ".founder-profile, " +
          ".mandates"
        )
      ];

      const elements = [
        ...(heading ? [heading] : []),
        ...cards
      ];

      elements.forEach(element => {
        element.classList.add("cinema-managed", "cinema-v2");

        const record = {
          element,
          section,
          heading: element === heading,
          played: false,
          animation: null,
          curtain: null
        };

        if (record.heading) {
          const curtain = document.createElement("span");
          curtain.className = "cinema-v2-curtain";
          curtain.setAttribute("aria-hidden", "true");

          element.append(curtain);
          record.curtain = curtain;
        }

        records.push(record);
      });
    });

    function finish(record) {
      record.animation?.cancel();
      record.animation = null;

      record.element.classList.remove("cinema-running");

      record.curtain?.getAnimations().forEach(animation => {
        animation.cancel();
      });
    }

    function reveal(record, delay = 0) {
      record.played = true;

      if (!enabled()) return;
      if (record.element.matches(":focus-within")) return;

      finish(record);

      const distance = isMobile() ? 22 : 42;
      const fromY = direction >= 0 ? distance : -distance * 0.45;

      record.element.classList.add("cinema-running");

      /*
       * Individual CSS properties avoid conflicting with
       * the earlier transform-based scroll scripts.
       */
      record.animation = record.element.animate(
        [
          {
            translate: `0 ${fromY}px`,
            scale: record.heading ? "1" : ".97",
            filter: "opacity(0)"
          },
          {
            translate: "0 0",
            scale: "1",
            filter: "opacity(1)"
          }
        ],
        {
          duration: isMobile() ? 850 : 1150,
          delay,
          easing: "cubic-bezier(.16, 1, .3, 1)",
          fill: "backwards"
        }
      );

      record.animation.addEventListener("finish", () => {
        record.element.classList.remove("cinema-running");
      }, { once: true });

      if (record.curtain) {
        record.curtain.animate(
          [
            { transform: "scaleX(1)", offset: 0 },
            { transform: "scaleX(1)", offset: 0.12 },
            { transform: "scaleX(0)", offset: 1 }
          ],
          {
            duration: isMobile() ? 850 : 1200,
            delay,
            easing: "cubic-bezier(.65, 0, .25, 1)"
          }
        );
      }
    }

    function update() {
      scheduled = false;

      const viewport = innerHeight;
      const trigger = viewport * 0.76;

      if (scrollY !== previousScroll) {
        direction = scrollY > previousScroll ? 1 : -1;
      }

      previousScroll = scrollY;

      /*
       * Measure everything before applying visual changes.
       */
      const measurements = records.map(record => ({
        record,
        rect: record.element.getBoundingClientRect(),
        visible: record.element.getClientRects().length > 0
      }));

      const sectionMeasurements = sections.map(section => ({
        section,
        rect: section.getBoundingClientRect()
      }));

      /*
       * Reveal only after the element has entered well into
       * the viewport. Tall sections do not require a percentage
       * of their entire height to be visible.
       */
      const ready = measurements.filter(({ record, rect, visible }) => {
        return (
          !record.played &&
          visible &&
          rect.top <= trigger &&
          rect.bottom > viewport * 0.12
        );
      });

      /*
       * Stagger only elements entering together.
       * This avoids delaying a single card because it happens
       * to be the sixth item in a grid.
       */
      ready.forEach(({ record }, index) => {
        const delay = Math.min(index, 3) * (isMobile() ? 75 : 130);
        reveal(record, delay);
      });

      measurements.forEach(({ record, rect, visible }) => {
        /*
         * Rearm well outside the screen, preventing repeated
         * triggering when the visitor pauses at a boundary.
         */
        if (
          !visible ||
          rect.bottom < -150 ||
          rect.top > viewport + 150
        ) {
          if (record.played) finish(record);
          record.played = false;
        }
      });

      /*
       * Connected section behaviour:
       * the current section sets the accent and sends a signal
       * to the travelling object.
       */
      const current = sectionMeasurements.find(({ rect }) => {
        return rect.top <= viewport * 0.45 &&
               rect.bottom > viewport * 0.45;
      });

      if (current && current.section.id !== activeSection) {
        activeSection = current.section.id;

        root.dataset.activeChapter = activeSection;

        sections.forEach(section => {
          section.classList.toggle(
            "chapter-active",
            section.id === activeSection
          );
        });

        const traveller = document.querySelector(".traveller-object");

        if (traveller && enabled()) {
          traveller.animate(
            [
              { scale: "1" },
              { scale: "1.6", offset: 0.4 },
              { scale: "1" }
            ],
            {
              duration: 900,
              easing: "ease-out"
            }
          );
        }
      }

      /*
       * Section progress powers a shared accent line.
       * It advances through the active section rather than
       * immediately filling when its heading appears.
       */
      sectionMeasurements.forEach(({ section, rect }) => {
        const range = Math.max(1, rect.height);
        const progress = Math.max(
          0,
          Math.min(1, (viewport * 0.45 - rect.top) / range)
        );

        section.style.setProperty(
          "--chapter-progress",
          enabled() ? progress.toFixed(4) : "1"
        );
      });
    }

    function queueUpdate() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }

    addEventListener("scroll", queueUpdate, { passive: true });
    addEventListener("resize", queueUpdate);

    document.addEventListener("toggle", queueUpdate, true);

    if ("ResizeObserver" in window) {
      new ResizeObserver(queueUpdate).observe(document.body);
    }

    records.forEach(record => {
      record.element.addEventListener("focusin", () => {
        finish(record);
        record.played = true;
      });
    });

    function updatePreference() {
      if (!enabled()) records.forEach(finish);
      queueUpdate();
    }

    new MutationObserver(updatePreference).observe(root, {
      attributes: true,
      attributeFilter: ["data-motion"]
    });

    reducedMotion.addEventListener("change", updatePreference);

    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialiseCinematicReveals,
      { once: true }
    );
  } else {
    initialiseCinematicReveals();
  }
})();