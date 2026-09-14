"use strict";

(() => {
  const root = document.documentElement;
  root.classList.add("js");

  /* Motion preference */
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const motionToggle = document.querySelector("#motion-toggle");

  let storedMotion = null;

  try {
    storedMotion = localStorage.getItem("maathavam-motion");
  } catch {
    // The site still works if browser storage is unavailable.
  }

  let motionEnabled =
    !motionQuery.matches && storedMotion !== "off";

  function updateMotion() {
    root.dataset.motion = motionEnabled ? "on" : "off";
    motionToggle.textContent = motionEnabled
      ? "Pause animations"
      : "Enable animations";
    motionToggle.setAttribute("aria-pressed", String(!motionEnabled));
  }

  motionToggle.hidden = false;

  motionToggle.addEventListener("click", () => {
    motionEnabled = !motionEnabled && !motionQuery.matches;
    updateMotion();

    try {
      localStorage.setItem(
        "maathavam-motion",
        motionEnabled ? "on" : "off"
      );
    } catch {
      // Preference applies for this visit even without storage.
    }

    if (motionQuery.matches) {
      motionToggle.textContent = "Reduced motion enabled on your device";
    }
  });

  motionQuery.addEventListener("change", event => {
    if (event.matches) motionEnabled = false;
    updateMotion();
  });

  updateMotion();

  /* Mobile navigation */
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#main-nav");

  function closeMenu(returnFocus = false) {
    menu.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
    if (returnFocus) menu.focus();
  }

  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  });

  nav.addEventListener("click", event => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".site-header")) closeMenu();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      closeMenu(true);
    }
  });

  matchMedia("(min-width: 761px)").addEventListener("change", event => {
    if (event.matches) closeMenu();
  });

  /* Accessible tabs.
     Panels remain available as normal content without JavaScript. */
  function initialiseTabs(container) {
    const buttons = [
      ...container.querySelectorAll("button[data-panel]")
    ];

    container.setAttribute("role", "tablist");

    function select(index, moveFocus = false) {
      buttons.forEach((button, currentIndex) => {
        const selected = currentIndex === index;
        const panel = document.getElementById(button.dataset.panel);

        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
        panel.hidden = !selected;
      });

      if (moveFocus) buttons[index].focus();

      container.dispatchEvent(new CustomEvent("tabchange", {
        detail: { index }
      }));
    }

    buttons.forEach((button, index) => {
      const panel = document.getElementById(button.dataset.panel);

      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.tabIndex = 0;

      button.addEventListener("click", () => select(index));

      button.addEventListener("keydown", event => {
        let next;

        if (event.key === "ArrowRight") {
          next = (index + 1) % buttons.length;
        } else if (event.key === "ArrowLeft") {
          next = (index - 1 + buttons.length) % buttons.length;
        } else if (event.key === "Home") {
          next = 0;
        } else if (event.key === "End") {
          next = buttons.length - 1;
        }

        if (next !== undefined) {
          event.preventDefault();
          select(next, true);
        }
      });
    });

    select(0);
    return { select };
  }

  const serviceTabList = document.querySelector(".service-tabs");
  const serviceTabs = initialiseTabs(serviceTabList);
  initialiseTabs(document.querySelector(".journey-tabs"));

  /* Business-priority selector */
  const needs = {
    leadership: {
      tab: 0,
      ids: ["service-cfo", "service-board"],
      text: "Explore fractional financial leadership and board advisory."
    },
    cash: {
      tab: 0,
      ids: ["service-cash"],
      text: "Explore cash flow, working capital and cost engineering."
    },
    change: {
      tab: 0,
      ids: ["service-transformation", "service-programme"],
      text: "Explore organisational change, restructuring and integration."
    },
    people: {
      tab: 0,
      ids: ["service-teams"],
      text:
        "Explore finance team development. HR & Talent Operations " +
        "is also available under Service Delivery & Operations."
    },
    operations: {
      tab: 1,
      ids: ["service-finance", "service-shared", "service-hr"],
      text: "Explore finance, HR and shared-services operations."
    },
    technology: {
      tab: 1,
      ids: ["service-it", "service-digital"],
      text: "Explore managed technology, process redesign and automation."
    }
  };

  const explorer = document.querySelector(".needs-explorer");
  const needButtons = [...document.querySelectorAll("[data-need]")];
  const needStatus = document.querySelector("#need-status");

  explorer.hidden = false;

  function resetNeedSelection() {
    needButtons.forEach(button => {
      button.setAttribute("aria-pressed", "false");
    });

    needStatus.textContent =
      "Choose a priority to explore relevant services.";
  }

  serviceTabList.addEventListener("tabchange", resetNeedSelection);

  needButtons.forEach(button => {
    button.addEventListener("click", () => {
      const need = needs[button.dataset.need];
      serviceTabs.select(need.tab);

      document.querySelectorAll(".service").forEach(service => {
        service.open = need.ids.includes(service.id);
      });

      needButtons.forEach(option => {
        option.setAttribute(
          "aria-pressed",
          String(option === button)
        );
      });

      needStatus.textContent = need.text;
    });
  });

  /* Pass service and engagement choices into the enquiry. */
  const serviceSelect = document.querySelector("#service-select");
  const engagementSelect = document.querySelector("#engagement-select");

  document.querySelectorAll("[data-service]").forEach(link => {
    link.addEventListener("click", () => {
      serviceSelect.value = link.dataset.service;
    });
  });

  function markEngagement() {
    document.querySelectorAll(".engagement-card").forEach(card => {
      const link = card.querySelector("[data-engagement]");
      card.classList.toggle(
        "selected",
        link.dataset.engagement === engagementSelect.value
      );
    });
  }

  document.querySelectorAll("[data-engagement]").forEach(link => {
    link.addEventListener("click", () => {
      engagementSelect.value = link.dataset.engagement;
      markEngagement();
    });
  });

  engagementSelect.addEventListener("change", markEngagement);

  /* Reading progress */
  const progress = document.querySelector(".reading-progress");
  let progressScheduled = false;

  function updateProgress() {
    const scrollable =
      document.documentElement.scrollHeight - innerHeight;

    const fraction = scrollable > 0
      ? Math.min(1, Math.max(0, scrollY / scrollable))
      : 0;

    progress.style.transform = `scaleX(${fraction})`;
    progressScheduled = false;
  }

  function scheduleProgress() {
    if (progressScheduled) return;
    progressScheduled = true;
    requestAnimationFrame(updateProgress);
  }

  addEventListener("scroll", scheduleProgress, { passive: true });
  addEventListener("resize", scheduleProgress);

  document.addEventListener("toggle", scheduleProgress, true);
  document.addEventListener("load", scheduleProgress, true);

  if ("ResizeObserver" in window) {
    new ResizeObserver(scheduleProgress).observe(document.body);
  }

  updateProgress();

  /* Content stays visible if IntersectionObserver is unavailable. */
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        if (motionEnabled) {
          entry.target.classList.add("is-visible");
        }

        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal").forEach(element => {
      revealObserver.observe(element);
    });

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        nav.querySelectorAll("a").forEach(link => {
          if (link.hash === `#${entry.target.id}`) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, {
      rootMargin: "-15% 0px -55% 0px"
    });

    document.querySelectorAll("main section[id]").forEach(section => {
      sectionObserver.observe(section);
    });
  }

  /* Enquiry draft.
     This deliberately does not claim to send an email. */
  const form = document.querySelector("#enquiry-form");
  const status = document.querySelector("#form-status");
  const copyButton = document.querySelector("#copy-enquiry");
  let enquiry = "";

  function composeEnquiry() {
    const values = new FormData(form);
    const read = key => String(values.get(key) || "").trim();

    return {
      subject: `Maathavam enquiry: ${read("service")}`,
      body:
        `Hello Rajkumar,\n\n${read("message")}\n\n` +
        `Name: ${read("name")}\n` +
        `Email: ${read("email")}\n` +
        `Organisation: ${read("organisation") || "Not specified"}\n` +
        `Service: ${read("service")}\n` +
        `Engagement: ${read("engagement")}\n\n` +
        `Regards,\n${read("name")}`
    };
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const draft = composeEnquiry();
    enquiry = draft.body;
    copyButton.hidden = false;

    const mailto =
      "mailto:rajkumar@maathavam.com" +
      `?subject=${encodeURIComponent(draft.subject)}` +
      `&body=${encodeURIComponent(draft.body)}`;

    if (mailto.length > 1900) {
      status.textContent =
        "Your enquiry is ready. It is too long for a reliable " +
        "email-app link. Copy it below and send it to " +
        "rajkumar@maathavam.com.";
      return;
    }

    status.textContent =
      "Your draft is ready. Review and send it in your email app. " +
      "If no app opens, copy the enquiry below and email " +
      "rajkumar@maathavam.com.";

    window.location.href = mailto;
  });

  copyButton.addEventListener("click", async () => {
    if (!form.reportValidity()) return;

    enquiry = composeEnquiry().body;

    try {
      await navigator.clipboard.writeText(enquiry);
      status.textContent =
        "Enquiry copied. Paste it into an email to " +
        "rajkumar@maathavam.com and send when ready.";
    } catch {
      status.textContent =
        "Automatic copying is unavailable. Your details remain " +
        "in the form. Please copy them manually and email " +
        "rajkumar@maathavam.com.";
    }
  });

  form.hidden = false;
})();


/* =========================================
   MAATHAVAM — SCROLL & ENTRANCE ENHANCEMENTS
   Append after the existing script.
   ========================================= */

(() => {
  "use strict";

  function initialiseMotionEnhancements() {
    const root = document.documentElement;

    // Prevent duplicate controls or observers.
    if (root.dataset.motionEnhancements === "ready") return;
    root.dataset.motionEnhancements = "ready";

    const reducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    function canAnimate() {
      return (
        root.dataset.motion !== "off" &&
        !reducedMotion.matches
      );
    }

    /* -------------------------------------
       Staggered section and card reveals
       ------------------------------------- */

    const targets = new Set(
      document.querySelectorAll(
        ".section-heading, " +
        ".needs-explorer, " +
        ".service-tabs, " +
        ".service, " +
        ".journey-tabs, " +
        ".metrics-strip, " +
        ".engagement-heading, " +
        ".engagement-card, " +
        ".founder-profile, " +
        ".team-card, " +
        ".outcomes article, " +
        ".mandates, " +
        "blockquote, " +
        ".contact-copy, " +
        "#enquiry-form"
      )
    );

    const delays = new WeakMap();
    const timers = new Map();

    // Stagger sibling cards within each group.
    document.querySelectorAll(
      ".service-grid, .team-grid, .engagement-grid, .outcomes"
    ).forEach(group => {
      [...group.children].forEach((child, index) => {
        const step = innerWidth <= 760 ? 45 : 85;
        delays.set(child, Math.min(index, 3) * step);
      });
    });

    let entranceObserver;

    function reveal(element) {
      element.classList.remove("motion-waiting");
      element.classList.add("motion-entered");

      if (entranceObserver) {
        entranceObserver.unobserve(element);
      }
    }

    function revealAllImmediately() {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();

      targets.forEach(reveal);
    }

    if ("IntersectionObserver" in window && canAnimate()) {
      entranceObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const element = entry.target;

          if (!canAnimate()) {
            reveal(element);
            return;
          }

          if (timers.has(element)) return;

          const timer = setTimeout(() => {
            reveal(element);
            timers.delete(element);
          }, delays.get(element) || 0);

          timers.set(element, timer);
        });
      }, {
        // Works for both small cards and tall content blocks.
        threshold: 0,
        rootMargin: "0px 0px -35px 0px"
      });

      targets.forEach(element => {
        element.classList.add("motion-item");

        const bounds = element.getBoundingClientRect();
        const currentlyVisible =
          element.getClientRects().length > 0 &&
          bounds.top < innerHeight &&
          bounds.bottom > 0;

        // Do not briefly hide content already on screen.
        if (currentlyVisible) {
          reveal(element);
        } else {
          element.classList.add("motion-waiting");
          entranceObserver.observe(element);
        }
      });
    }

    // Honour the existing site's motion toggle.
    new MutationObserver(() => {
      if (!canAnimate()) revealAllImmediately();
    }).observe(root, {
      attributes: true,
      attributeFilter: ["data-motion"]
    });

    reducedMotion.addEventListener("change", event => {
      if (event.matches) revealAllImmediately();
    });

    /* -------------------------------------
       Subtle section background changes
       ------------------------------------- */

    if ("IntersectionObserver" in window) {
      const backgroundObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle(
            "section-in-view",
            entry.isIntersecting
          );
        });
      }, {
        threshold: 0,
        rootMargin: "-10% 0px -15% 0px"
      });

      document.querySelectorAll(
        "#services, #leadership, #contact"
      ).forEach(section => {
        backgroundObserver.observe(section);
      });
    }

    /* -------------------------------------
       Progressing delivery journey line
       ------------------------------------- */

    const journeyTabs = document.querySelector(".journey-tabs");

    if (journeyTabs) {
      const progress = document.createElement("div");
      progress.className = "journey-progress";
      progress.setAttribute("aria-hidden", "true");

      const fill = document.createElement("span");
      progress.append(fill);
      journeyTabs.after(progress);

      function updateJourneyLine() {
        const buttons = [
          ...journeyTabs.querySelectorAll("button")
        ];

        const selected = buttons.findIndex(button => {
          return button.getAttribute("aria-selected") === "true";
        });

        const fraction = buttons.length
          ? (Math.max(0, selected) + 1) / buttons.length
          : 0;

        fill.style.transform = `scaleX(${fraction})`;
      }

      // Existing tab behaviour emits this event.
      journeyTabs.addEventListener(
        "tabchange",
        updateJourneyLine
      );

      updateJourneyLine();
    }

    /* -------------------------------------
       Floating back-to-top button
       ------------------------------------- */

    const backToTop = document.createElement("button");
    backToTop.type = "button";
    backToTop.className = "back-to-top";
    backToTop.setAttribute("aria-label", "Back to top");
    backToTop.tabIndex = -1;

    const arrow = document.createElement("span");
    arrow.className = "top-arrow";
    arrow.textContent = "↑";
    arrow.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "top-label";
    label.textContent = "Back to top";
    label.setAttribute("aria-hidden", "true");

    backToTop.append(arrow, label);
    document.body.append(backToTop);

    let scrollFrame = false;

    function updateBackToTop() {
      const show = window.scrollY > 450;

      backToTop.classList.toggle("is-shown", show);
      backToTop.tabIndex = show ? 0 : -1;

      scrollFrame = false;
    }

    window.addEventListener("scroll", () => {
      if (scrollFrame) return;

      scrollFrame = true;
      requestAnimationFrame(updateBackToTop);
    }, { passive: true });

    backToTop.addEventListener("click", () => {
      // Move focus to a persistent, useful destination.
      document.querySelector(".brand")?.focus({
        preventScroll: true
      });

      window.scrollTo({
        top: 0,
        behavior: canAnimate() ? "smooth" : "instant"
      });
    });

    updateBackToTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialiseMotionEnhancements,
      { once: true }
    );
  } else {
    initialiseMotionEnhancements();
  }
})();

/* =========================================
   EXCLUSIVE SERVICES + NUMBERS + SCROLL
   ========================================= */

(() => {
  function initialiseFinalEnhancements() {
    const root = document.documentElement;

    if (root.dataset.finalEnhancements) return;
    root.dataset.finalEnhancements = "ready";

    const reducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const motionAllowed = () =>
      root.dataset.motion !== "off" &&
      !reducedMotion.matches;

    /* 1. Only one service can be open. */
    const services = [...document.querySelectorAll("details.service")];

    services.forEach(service => {
      // Native exclusive accordion behaviour.
      service.setAttribute("name", "maathavam-services");

      // Fallback for browsers without exclusive details support.
      service.addEventListener("toggle", () => {
        if (!service.open) return;

        services.forEach(other => {
          if (other !== service) other.open = false;
        });
      });
    });

    // Normalise any state already open when this script runs.
    let foundOpen = false;

    services.forEach(service => {
      if (!service.open) return;
      if (foundOpen) service.open = false;
      foundOpen = true;
    });

    /*
     * The earlier business-needs selector opened multiple matches.
     * Keep its tab selection and description, but expand just the
     * first relevant service.
     */
    const firstMatch = {
      leadership: "service-cfo",
      cash: "service-cash",
      change: "service-transformation",
      people: "service-teams",
      operations: "service-finance",
      technology: "service-it"
    };

    document.querySelectorAll("[data-need]").forEach(button => {
      button.addEventListener("click", () => {
        const target = document.getElementById(
          firstMatch[button.dataset.need]
        );

        services.forEach(service => {
          service.open = false;
        });

        if (target) target.open = true;
      });
    });

    // Switching service groups closes the previous selection.
    document.querySelector(".service-tabs")
      ?.addEventListener("tabchange", () => {
        services.forEach(service => {
          service.open = false;
        });
      });

    /* 2. Evidence-based numbers */
    const pedigree = document.querySelector(".pedigree");

    if (pedigree && !document.querySelector(".numbers-band")) {
      const band = document.createElement("section");
      band.className = "numbers-band";
      band.setAttribute("aria-label", "Maathavam at a glance");

      const facts = [
        {
          number: 30,
          suffix: "+",
          label: "Years of founder experience",
          detail: "Finance, leadership and transformation"
        },
        {
          number: 11,
          suffix: "",
          label: "Service areas",
          detail: "Across advisory and service delivery"
        },
        {
          number: 3,
          suffix: "",
          label: "Engagement models",
          detail: "Retainer, programme and advisory sprint"
        }
      ];

      facts.forEach(fact => {
        const item = document.createElement("article");
        item.className = "number-item";

        const value = document.createElement("div");
        value.className = "number-value";

        // Screen readers receive the final number only.
        const accessible = document.createElement("span");
        accessible.className = "visually-hidden";
        accessible.textContent = `${fact.number}${fact.suffix}`;

        const animated = document.createElement("span");
        animated.setAttribute("aria-hidden", "true");
        animated.dataset.target = String(fact.number);
        animated.dataset.suffix = fact.suffix;
        animated.textContent = `${fact.number}${fact.suffix}`;

        value.append(accessible, animated);

        const label = document.createElement("h3");
        label.textContent = fact.label;

        const detail = document.createElement("p");
        detail.textContent = fact.detail;

        item.append(value, label, detail);
        band.append(item);
      });

      pedigree.after(band);

      let frame = null;
      let counted = false;

      const counters = [
        ...band.querySelectorAll("[data-target]")
      ];

      function finishCounters() {
        if (frame !== null) cancelAnimationFrame(frame);

        counters.forEach(counter => {
          counter.textContent =
            counter.dataset.target + counter.dataset.suffix;
        });

        frame = null;
      }

      function animateCounters() {
        if (counted) return;
        counted = true;

        if (!motionAllowed()) {
          finishCounters();
          return;
        }

        const start = performance.now();
        const duration = 1100;

        function tick(now) {
          if (!motionAllowed()) {
            finishCounters();
            return;
          }

          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);

          counters.forEach(counter => {
            const target = Number(counter.dataset.target);
            counter.textContent =
              Math.round(target * eased) + counter.dataset.suffix;
          });

          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          } else {
            finishCounters();
          }
        }

        frame = requestAnimationFrame(tick);
      }

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
          if (!entries.some(entry => entry.isIntersecting)) return;

          animateCounters();
          observer.disconnect();
        }, { threshold: 0.2 });

        observer.observe(band);
      }

      new MutationObserver(() => {
        if (!motionAllowed()) finishCounters();
      }).observe(root, {
        attributes: true,
        attributeFilter: ["data-motion"]
      });

      reducedMotion.addEventListener("change", () => {
        if (!motionAllowed()) finishCounters();
      });
    }

    /* 3. Gold section-entry lines driven by scroll */
    const headings = [
      ...document.querySelectorAll(".section-heading")
    ];

    headings.forEach(heading => {
      if (heading.querySelector(".section-entry-line")) return;

      const line = document.createElement("div");
      line.className = "section-entry-line";
      line.setAttribute("aria-hidden", "true");
      heading.append(line);
    });

    let pending = false;

    function updateEntryLines() {
      const viewport = window.innerHeight;

      headings.forEach(heading => {
        const line = heading.querySelector(".section-entry-line");
        const rect = heading.getBoundingClientRect();

        // Fill as the heading moves from the lower screen
        // towards the upper third.
        const progress = motionAllowed()
          ? Math.max(
              0,
              Math.min(1, (viewport * 0.92 - rect.top) / (viewport * 0.62))
            )
          : 1;

        line.style.setProperty("--entry-progress", progress);
      });

      pending = false;
    }

    function queueUpdate() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(updateEntryLines);
    }

    addEventListener("scroll", queueUpdate, { passive: true });
    addEventListener("resize", queueUpdate);
    document.addEventListener("toggle", queueUpdate, true);

    if ("ResizeObserver" in window) {
      new ResizeObserver(queueUpdate).observe(document.body);
    }

    new MutationObserver(queueUpdate).observe(root, {
      attributes: true,
      attributeFilter: ["data-motion"]
    });

    reducedMotion.addEventListener("change", queueUpdate);
    updateEntryLines();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialiseFinalEnhancements,
      { once: true }
    );
  } else {
    initialiseFinalEnhancements();
  }
})();

/* Reversible scroll entrances and exits */
(() => {
  function initialiseScrollScenes() {
    const root = document.documentElement;

    if (root.dataset.scrollScenesReady) return;
    root.dataset.scrollScenesReady = "true";

    const reducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    /*
     * Animate content blocks, not section backgrounds.
     * Individual service details are excluded so expanding
     * an accordion does not make its contents jump.
     */
    const scenes = [
      ...document.querySelectorAll(
        ".section-heading, " +
        ".needs-explorer, " +
        ".metrics-strip, " +
        ".engagement-heading, " +
        ".engagement-card, " +
        ".founder-profile, " +
        ".team-card, " +
        ".outcomes article, " +
        ".mandates, " +
        "blockquote, " +
        ".contact-copy"
      )
    ];

    scenes.forEach(element => {
      element.classList.add("scroll-scene");
    });

    const clamp = value => Math.max(0, Math.min(1, value));

    // Smooth acceleration and deceleration.
    const smooth = value => {
      const t = clamp(value);
      return t * t * (3 - 2 * t);
    };

    let scheduled = false;

    function updateScenes() {
      scheduled = false;

      const enabled =
        root.dataset.motion !== "off" &&
        !reducedMotion.matches;

      const height = window.innerHeight;
      const mobile = window.innerWidth <= 760;
      const distance = mobile ? 18 : 36;

      const headerBottom =
        document.querySelector(".site-header")
          ?.getBoundingClientRect().bottom || 0;

      // Read layout first, then apply styles.
      const measurements = scenes.map(element => ({
        element,
        rect: element.getBoundingClientRect(),
        visible: element.getClientRects().length > 0
      }));

      measurements.forEach(({ element, rect, visible }) => {
        if (!enabled || !visible) {
          element.style.setProperty("--scene-opacity", "1");
          element.style.setProperty("--scene-y", "0px");
          return;
        }

        /*
         * Entrance:
         * fades in while moving from the lower edge towards
         * the lower-middle of the viewport.
         */
        const entrance = smooth(
          (height - rect.top) / (height * 0.24)
        );

        /*
         * Exit:
         * begins only when the block's bottom approaches
         * the sticky header, preserving reading time.
         */
        const exit = smooth(
          (headerBottom + 65 - rect.bottom) / 100
        );

        const opacity = Math.max(
          0.08,
          entrance * (1 - exit)
        );

        const translateY =
          (1 - entrance) * distance -
          exit * distance * 0.6;

        element.style.setProperty(
          "--scene-opacity",
          opacity.toFixed(3)
        );

        element.style.setProperty(
          "--scene-y",
          `${translateY.toFixed(2)}px`
        );
      });
    }

    function queueUpdate() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(updateScenes);
    }

    window.addEventListener("scroll", queueUpdate, {
      passive: true
    });

    window.addEventListener("resize", queueUpdate);
    document.addEventListener("toggle", queueUpdate, true);
    document.addEventListener("load", queueUpdate, true);

    // Recalculate after services expand or layout changes.
    if ("ResizeObserver" in window) {
      new ResizeObserver(queueUpdate).observe(document.body);
    }

    new MutationObserver(queueUpdate).observe(root, {
      attributes: true,
      attributeFilter: ["data-motion"]
    });

    reducedMotion.addEventListener("change", queueUpdate);

    updateScenes();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialiseScrollScenes,
      { once: true }
    );
  } else {
    initialiseScrollScenes();
  }
})();