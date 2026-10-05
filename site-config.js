/*
 * This is the single registry for applications shown as folders or menu items.
 *
 * To add an internal window:
 *   1. Add an entry here with a template id.
 *   2. Add the matching <template> to index.html.
 *
 * To add a link such as the documentation, use `href` instead of `template`.
 */
window.PORTFOLIO_CONFIG = {
  applications: {
    home: {
      title: "Home",
      label: "home",
      icon: "folder-home",
      template: "template-home",
      width: 700,
      height: 430,
      desktop: "left",
      menus: ["applications", "places"]
    },
    about: {
      title: "About",
      label: "about",
      icon: "folder-about",
      template: "template-about",
      width: 650,
      height: 480,
      desktop: "left",
      menus: ["applications"]
    },
    terminal: {
      title: "Terminal",
      label: "terminal",
      icon: "terminal",
      template: "template-terminal",
      width: 680,
      height: 400,
      desktop: "left",
      menus: ["applications"]
    },
    projects: {
      title: "Projects",
      label: "projects",
      icon: "folder-projects",
      template: "template-projects",
      width: 810,
      height: 500,
      desktop: "right",
      menus: ["applications", "places"]
    },
    docs: {
      title: "Docs",
      label: "docs",
      icon: "folder-about",
      href: "docs/",
      desktop: "right",
      menus: ["applications", "places"]
    },
    contact: {
      title: "Contact",
      label: "contact",
      icon: "folder-contact",
      template: "template-contact",
      width: 650,
      height: 430,
      desktop: "right",
      menus: ["applications"]
    },
    resume: {
      title: "Resume",
      label: "resume",
      icon: "folder-resume",
      template: "template-resume",
      width: 700,
      height: 560,
      desktop: "right",
      menus: ["applications", "places"]
    }
  }
};
