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

  serviceTabList.addEventListener("tabchange", () => {
    resetNeedSelection();
    document.querySelectorAll('.service').forEach(service => service.open = false);
  });
  const serviceDetails = [...document.querySelectorAll('.service')];
  serviceDetails.forEach(service => {
    service.setAttribute('name', 'maathavam-services');
    service.addEventListener('toggle', () => {
      if (service.open) serviceDetails.forEach(other => { if (other !== service) other.open = false; });
    });
  });

  needButtons.forEach(button => {
    button.addEventListener("click", () => {
      const need = needs[button.dataset.need];
      serviceTabs.select(need.tab);

      document.querySelectorAll(".service").forEach(service => {
        service.open = service.id === need.ids[0];
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


