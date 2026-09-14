(() => {
  function initialiseFeatherExperience() {
    const root = document.documentElement;

    if (root.dataset.featherExperienceReady) return;
    root.dataset.featherExperienceReady = "true";

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");

    const motionAllowed = () =>
      root.dataset.motion !== "off" &&
      !reduced.matches;

    /*
     * Standalone vector: no external image dependency.
     * Uses a separate gradient ID from the opening feather.
     */
    const feather = document.createElement("div");
    feather.className = "floating-feather";
    feather.setAttribute("aria-hidden", "true");

    feather.innerHTML = `
      <svg viewBox="0 0 240 320" fill="none"
           xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="background-feather-gold"
                          x1="45" y1="20" x2="190" y2="300"
                          gradientUnits="userSpaceOnUse">
            <stop stop-color="#fff0be"/>
            <stop offset=".45" stop-color="#d8aa48"/>
            <stop offset="1" stop-color="#896321"/>
          </linearGradient>
        </defs>

        <g stroke="url(#background-feather-gold)"
           stroke-width="1.7" stroke-linecap="round">
          <path d="M72 302C91 249 115 186 132 118"/>

          <path d="M109 225C56 184 47 113 76 63
                   C91 37 121 19 149 17
                   C190 40 207 89 191 132
                   C179 168 145 198 109 225Z"/>

          <path d="M110 218Q76 184 65 143"/>
          <path d="M115 203Q79 154 71 111"/>
          <path d="M120 184Q87 137 85 81"/>
          <path d="M126 164Q107 118 112 50"/>

          <path d="M111 218Q158 188 176 157"/>
          <path d="M117 198Q167 164 188 118"/>
          <path d="M123 179Q173 139 187 86"/>
          <path d="M129 155Q171 111 170 49"/>

          <path d="M132 148C104 135 94 112 104 87
                   C111 68 130 51 148 46
                   C170 63 179 87 171 109
                   C164 128 149 141 132 148Z"/>

          <path d="M136 126C120 117 116 102 123 89
                   C128 80 136 73 146 70
                   C157 81 161 94 156 105
                   C152 115 144 122 136 126Z"/>
        </g>

        <ellipse cx="140" cy="99" rx="8" ry="12"
                 transform="rotate(18 140 99)"
                 fill="#d8b66a"/>
      </svg>
    `;

    document.body.prepend(feather);

    const stage = document.querySelector(".feather-stage");

    let scheduled = false;

    function updateFeather() {
      scheduled = false;

      const width = innerWidth;
      const height = innerHeight;
      const mobile = width <= 760;

      const featherWidth = feather.offsetWidth;
      const featherHeight = feather.offsetHeight;

      const stageRect = stage?.getBoundingClientRect();

      /*
       * Start in the empty hero visual.
       * Then follow a broad curved route down the page.
       */
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - height
      );

      const progress = Math.max(
        0,
        Math.min(1, scrollY / maxScroll)
      );

      let x;
      let y;
      let angle;

      if (!motionAllowed()) {
        // Static decoration confined to the hero.
        if (!stageRect || stageRect.bottom < 0) {
          feather.style.opacity = "0";
          return;
        }

        x = stageRect.left +
            (stageRect.width - featherWidth) / 2;

        y = stageRect.top +
            (stageRect.height - featherHeight) / 2;

        angle = -12;
      } else {
        const heroBlend = Math.min(
          1,
          scrollY / Math.max(1, height * .75)
        );

        const startX = stageRect
          ? stageRect.left + (stageRect.width - featherWidth) / 2
          : width * .62;

        const startY = stageRect
          ? stageRect.top + (stageRect.height - featherHeight) / 2
          : height * .12;

        // Desktop makes a broad sweep; mobile stays near the edge.
        const routeX = mobile
          ? width - featherWidth * .65
          : (width - featherWidth) *
            (.5 + .43 * Math.cos(progress * Math.PI * 3));

        const routeY =
          (height - featherHeight) * .45 +
          Math.sin(progress * Math.PI * 4) * (mobile ? 20 : 65);

        x = startX * (1 - heroBlend) + routeX * heroBlend;
        y = startY * (1 - heroBlend) + routeY * heroBlend;

        angle = -12 + Math.sin(progress * Math.PI * 4) *
          (mobile ? 12 : 30);
      }

      feather.style.transform =
        `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;

      feather.style.opacity = mobile ? ".48" : ".7";
      feather.classList.add("is-positioned");
    }

    function queueFeather() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(updateFeather);
    }

    addEventListener("scroll", queueFeather, { passive: true });
    addEventListener("resize", queueFeather);

    if ("ResizeObserver" in window) {
      new ResizeObserver(queueFeather).observe(document.body);
    }

    /* 3D cards */
    const resets = [];

    document.querySelectorAll(
      ".team-card, .engagement-card"
    ).forEach(card => {
      if (card.closest(".depth-shell")) return;

      const shell = document.createElement("div");
      shell.className = "depth-shell";

      const plane = document.createElement("div");
      plane.className = "depth-plane";

      card.before(shell);
      shell.append(plane);
      plane.append(card);

      let frame = null;
      let clientX = 0;
      let clientY = 0;

      function reset() {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;

        shell.classList.remove("is-hovered");
        plane.style.setProperty("--tilt-x", "0deg");
        plane.style.setProperty("--tilt-y", "0deg");
      }

      resets.push(reset);

      function paint() {
        frame = null;

        if (
          !motionAllowed() ||
          !pointer.matches ||
          card.classList.contains("cinema-running") ||
          shell.matches(":focus-within")
        ) {
          reset();
          return;
        }

        // Measure the stable shell, not the rotated card.
        const rect = shell.getBoundingClientRect();

        const x = Math.max(
          0, Math.min(1, (clientX - rect.left) / rect.width)
        );

        const y = Math.max(
          0, Math.min(1, (clientY - rect.top) / rect.height)
        );

        plane.style.setProperty("--tilt-x", `${(0.5 - y) * 12}deg`);
        plane.style.setProperty("--tilt-y", `${(x - 0.5) * 12}deg`);

        plane.style.setProperty("--light-x", `${x * 100}%`);
        plane.style.setProperty("--light-y", `${y * 100}%`);

        shell.classList.add("is-hovered");
      }

      shell.addEventListener("pointermove", event => {
        if (event.pointerType !== "mouse") return;

        clientX = event.clientX;
        clientY = event.clientY;

        if (frame === null) {
          frame = requestAnimationFrame(paint);
        }
      });

      shell.addEventListener("pointerleave", reset);
      shell.addEventListener("pointercancel", reset);
      shell.addEventListener("focusin", reset);
    });

    function refreshPreferences() {
      resets.forEach(reset => reset());
      queueFeather();
    }

    reduced.addEventListener("change", refreshPreferences);
    pointer.addEventListener("change", refreshPreferences);

    new MutationObserver(refreshPreferences).observe(root, {
      attributes: true,
      attributeFilter: ["data-motion"]
    });

    queueFeather();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialiseFeatherExperience,
      { once: true }
    );
  } else {
    initialiseFeatherExperience();
  }
})();