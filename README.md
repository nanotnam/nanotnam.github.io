# nanotnam.github.io

Personal portfolio and technical documentation published at [nanotnam.github.io](https://nanotnam.github.io/).

The portfolio deliberately uses plain HTML, CSS, and JavaScript. MkDocs Material builds the Markdown files in `docs/` and publishes them at `/docs/` with a custom retro theme. A GitHub Actions workflow combines both parts into one GitHub Pages artifact.

## Repository layout

```text
.
├── index.html           # Portfolio markup and window templates
├── styles.css           # Portfolio styles
├── script.js            # Window and desktop behaviour
├── site-config.js       # Applications, folders, and menu registration
├── assets/              # Icons, images, and the CV
├── docs/                # MkDocs Markdown sources
├── mkdocs.yml           # Documentation navigation and settings
└── .github/workflows/   # Build and deployment pipeline
```

## Run locally

Create a Python environment and install MkDocs:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Build the complete site and preview the same files that GitHub Pages will receive:

```bash
./scripts/build.sh
python3 -m http.server 8000 --directory dist
```

Open <http://localhost:8000>. The portfolio is at `/` and the documentation is at `/docs/`.

While writing documentation, MkDocs can also provide live reload:

```bash
source .venv/bin/activate
mkdocs serve
```

Use `mkdocs serve --dev-addr 127.0.0.1:8001` when the full-site preview is already using port 8000.

## Add another folder

Register it in `site-config.js`. An internal window also needs a matching `<template>` in `index.html`; an external page only needs an `href`. The registry controls its icon, label, desktop side, menus, and window size.

## Add documentation

Create a Markdown file in `docs/` and add it to `nav` in `mkdocs.yml`. Run `mkdocs build --strict` before committing. Every push to `main` builds and publishes the portfolio and documentation together; pull requests run the build without deploying.

The repository's GitHub Pages source must be set to **GitHub Actions** under **Settings → Pages → Build and deployment** for the workflow to deploy.
