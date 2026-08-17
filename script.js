(() => {
  "use strict";

  const applications = {
    home: { title: "Home", icon: "folder-home", template: "template-home", width: 700, height: 430 },
    about: { title: "About", icon: "folder-about", template: "template-about", width: 650, height: 480 },
    projects: { title: "Projects", icon: "folder-projects", template: "template-projects", width: 810, height: 500 },
    contact: { title: "Contact", icon: "folder-contact", template: "template-contact", width: 650, height: 430 },
    resume: { title: "Resume", icon: "folder-resume", template: "template-resume", width: 700, height: 560 },
    terminal: { title: "Terminal", icon: "terminal", template: "template-terminal", width: 680, height: 400 }
  };

  const windows = new Map();
  const layer = document.querySelector("#windows-layer");
  const mobileQuery = window.matchMedia("(max-width: 700px)");
  let topZ = 20;
  let positionOffset = 0;

  function iconMarkup(icon) {
    return `<svg aria-hidden="true"><use href="assets/icons.svg#${icon}"></use></svg>`;
  }

  function updateRunningState(appName, running) {
    document.querySelectorAll(`.dock-item[data-open="${appName}"]`).forEach((item) => {
      item.classList.toggle("running", running);
    });
  }

  function focusWindow(windowElement) {
    document.querySelectorAll(".app-window.is-active").forEach((item) => item.classList.remove("is-active"));
    windowElement.classList.remove("is-minimized");
    windowElement.classList.add("is-active");
    windowElement.style.zIndex = String(++topZ);
    updateRunningState(windowElement.dataset.app, true);
  }

  function syncHash(appName) {
    const nextHash = `#${appName}`;
    if (window.location.hash !== nextHash) window.location.hash = appName;
  }

  function clearHash(appName) {
    if (window.location.hash === `#${appName}`) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }

  function placeWindow(windowElement, app) {
    const layerWidth = layer.clientWidth;
    const layerHeight = layer.clientHeight;
    const width = Math.min(app.width, Math.max(310, layerWidth - 32));
    const height = Math.min(app.height, Math.max(190, layerHeight - 32));
    const stagger = positionOffset % 120;
    const left = Math.max(12, Math.round((layerWidth - width) / 2 + stagger / 2));
    const top = Math.max(12, Math.round((layerHeight - height) / 2 + stagger / 3));

    windowElement.style.width = `${width}px`;
    windowElement.style.height = `${height}px`;
    windowElement.style.left = `${Math.min(left, Math.max(12, layerWidth - width - 12))}px`;
    windowElement.style.top = `${Math.min(top, Math.max(12, layerHeight - height - 12))}px`;
    positionOffset += 24;
  }

  function buildWindow(appName) {
    const app = applications[appName];
    const template = document.getElementById(app.template);
    const windowElement = document.createElement("section");
    windowElement.className = "app-window";
    windowElement.dataset.app = appName;
    windowElement.setAttribute("role", "dialog");
    windowElement.setAttribute("aria-modal", "false");
    windowElement.setAttribute("aria-label", `${app.title} application`);
    windowElement.tabIndex = -1;
    windowElement.innerHTML = `
      <header class="window-titlebar">
        ${iconMarkup(app.icon)}
        <span class="window-title">${app.title}</span>
        <div class="window-controls">
          <button type="button" data-window-action="minimize" aria-label="Minimize ${app.title}" title="Minimize">_</button>
          <button type="button" data-window-action="maximize" aria-label="Maximize ${app.title}" title="Maximize">□</button>
          <button type="button" data-window-action="close" aria-label="Close ${app.title}" title="Close">×</button>
        </div>
      </header>
      <div class="window-content"></div>
    `;
    windowElement.querySelector(".window-content").append(template.content.cloneNode(true));
    layer.append(windowElement);
    placeWindow(windowElement, app);
    attachWindowEvents(windowElement);
    if (appName === "terminal") initializeTerminal(windowElement);
    return windowElement;
  }

  function openApp(appName, options = {}) {
    if (!applications[appName]) return;
    let windowElement = windows.get(appName);
    if (!windowElement) {
      windowElement = buildWindow(appName);
      windows.set(appName, windowElement);
    }
    focusWindow(windowElement);
    if (options.updateHash !== false) syncHash(appName);
    windowElement.focus({ preventScroll: true });
    if (appName === "terminal") {
      windowElement.querySelector(".terminal-form input")?.focus({ preventScroll: true });
    }
  }

  function closeWindow(windowElement) {
    const appName = windowElement.dataset.app;
    windows.delete(appName);
    windowElement.remove();
    updateRunningState(appName, false);
    clearHash(appName);
  }

  function minimizeWindow(windowElement) {
    windowElement.classList.add("is-minimized");
    windowElement.classList.remove("is-active");
    clearHash(windowElement.dataset.app);
  }

  function toggleMaximize(windowElement) {
    const maximized = windowElement.classList.toggle("is-maximized");
    const button = windowElement.querySelector('[data-window-action="maximize"]');
    button.textContent = maximized ? "❐" : "□";
    button.setAttribute("aria-label", `${maximized ? "Restore" : "Maximize"} ${applications[windowElement.dataset.app].title}`);
    focusWindow(windowElement);
  }

  function attachWindowEvents(windowElement) {
    windowElement.addEventListener("pointerdown", () => focusWindow(windowElement));

    windowElement.querySelector(".window-controls").addEventListener("click", (event) => {
      const action = event.target.closest("[data-window-action]")?.dataset.windowAction;
      if (action === "close") closeWindow(windowElement);
      if (action === "minimize") minimizeWindow(windowElement);
      if (action === "maximize") toggleMaximize(windowElement);
    });

    const titlebar = windowElement.querySelector(".window-titlebar");
    titlebar.addEventListener("dblclick", (event) => {
      if (!event.target.closest("button") && !mobileQuery.matches) toggleMaximize(windowElement);
    });

    titlebar.addEventListener("pointerdown", (event) => {
      if (mobileQuery.matches || windowElement.classList.contains("is-maximized") || event.target.closest("button")) return;
      event.preventDefault();
      focusWindow(windowElement);
      titlebar.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = windowElement.offsetLeft;
      const startTop = windowElement.offsetTop;

      const move = (moveEvent) => {
        const maxLeft = Math.max(0, layer.clientWidth - windowElement.offsetWidth);
        const maxTop = Math.max(0, layer.clientHeight - windowElement.offsetHeight);
        const nextLeft = Math.min(maxLeft, Math.max(0, startLeft + moveEvent.clientX - startX));
        const nextTop = Math.min(maxTop, Math.max(0, startTop + moveEvent.clientY - startY));
        windowElement.style.left = `${nextLeft}px`;
        windowElement.style.top = `${nextTop}px`;
      };

      const end = () => {
        titlebar.removeEventListener("pointermove", move);
        titlebar.removeEventListener("pointerup", end);
        titlebar.removeEventListener("pointercancel", end);
      };

      titlebar.addEventListener("pointermove", move);
      titlebar.addEventListener("pointerup", end);
      titlebar.addEventListener("pointercancel", end);
    });
  }

  function closeMenus() {
    document.querySelectorAll(".menu-trigger").forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
    document.querySelectorAll(".panel-menu").forEach((menu) => { menu.hidden = true; });
  }

  function toggleMenu(trigger) {
    const menu = document.getElementById(trigger.getAttribute("aria-controls"));
    const willOpen = trigger.getAttribute("aria-expanded") !== "true";
    closeMenus();
    if (willOpen) {
      trigger.setAttribute("aria-expanded", "true");
      menu.hidden = false;
      menu.querySelector('[role="menuitem"]')?.focus();
    }
  }

  function minimizeAll() {
    windows.forEach((windowElement) => {
      windowElement.classList.add("is-minimized");
      windowElement.classList.remove("is-active");
    });
    if (window.location.hash) history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  const terminalCommands = {
    help: () => "Available commands: help, about, projects, contact, date, clear",
    about: () => { openApp("about"); return "Opening About…"; },
    projects: () => { openApp("projects"); return "Opening Projects…"; },
    contact: () => { openApp("contact"); return "Opening Contact…"; },
    date: () => new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "long" }).format(new Date())
  };

  function addTerminalLine(output, text, className = "") {
    const line = document.createElement("p");
    line.className = `terminal-line ${className}`.trim();
    line.textContent = text;
    output.append(line);
    output.parentElement.scrollTop = output.parentElement.scrollHeight;
  }

  function initializeTerminal(windowElement) {
    const output = windowElement.querySelector(".terminal-output");
    const form = windowElement.querySelector(".terminal-form");
    const input = form.querySelector("input");
    addTerminalLine(output, "Portfolio Terminal 1.0");
    addTerminalLine(output, "Type 'help' to see the available commands.");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const rawCommand = input.value.trim();
      if (!rawCommand) return;
      addTerminalLine(output, `visitor@portfolio:~$ ${rawCommand}`, "command");
      input.value = "";
      const command = rawCommand.toLowerCase();
      if (command === "clear") {
        output.replaceChildren();
      } else if (terminalCommands[command]) {
        addTerminalLine(output, terminalCommands[command]());
      } else {
        addTerminalLine(output, `Command not found: ${rawCommand}. Type 'help' for available commands.`, "error");
      }
    });

    windowElement.querySelector(".terminal-view").addEventListener("click", () => input.focus());
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".menu-trigger");
    if (trigger) {
      event.stopPropagation();
      toggleMenu(trigger);
      return;
    }

    const desktopIcon = event.target.closest(".desktop-icon[data-open]");
    const appLauncher = event.target.closest("[data-open]");
    if (appLauncher && (!desktopIcon || mobileQuery.matches)) {
      event.preventDefault();
      openApp(appLauncher.dataset.open);
      closeMenus();
      return;
    }

    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "minimize-all") {
      minimizeAll();
      closeMenus();
      return;
    }

    if (!event.target.closest(".panel-menu")) closeMenus();
  });

  document.querySelectorAll(".desktop-icon[data-open]").forEach((icon) => {
    icon.addEventListener("dblclick", () => openApp(icon.dataset.open));
    icon.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openApp(icon.dataset.open);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenus();
  });

  document.querySelectorAll(".workspaces button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".workspaces button").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
    });
  });

  function updateClock() {
    const clock = document.getElementById("clock");
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = new Intl.DateTimeFormat(undefined, {
      weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    }).format(now);
  }

  function keepWindowsInBounds() {
    if (mobileQuery.matches) return;
    windows.forEach((windowElement) => {
      if (windowElement.classList.contains("is-maximized")) return;
      const maxLeft = Math.max(0, layer.clientWidth - windowElement.offsetWidth);
      const maxTop = Math.max(0, layer.clientHeight - windowElement.offsetHeight);
      windowElement.style.left = `${Math.min(maxLeft, Math.max(0, windowElement.offsetLeft))}px`;
      windowElement.style.top = `${Math.min(maxTop, Math.max(0, windowElement.offsetTop))}px`;
    });
  }

  window.addEventListener("resize", keepWindowsInBounds);
  window.addEventListener("hashchange", () => {
    const appName = window.location.hash.slice(1).toLowerCase();
    if (applications[appName]) openApp(appName, { updateHash: false });
  });

  updateClock();
  window.setInterval(updateClock, 30000);
  const initialApp = window.location.hash.slice(1).toLowerCase();
  if (applications[initialApp]) openApp(initialApp, { updateHash: false });
})();
