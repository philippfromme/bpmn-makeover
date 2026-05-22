# BPMN Modeler Demo

Simple web app that embeds a BPMN modeler powered by `bpmn-js` and built with Vite.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This project includes two deployment options:

1. GitHub Actions workflow (recommended)
2. Manual `gh-pages` publish script

### Option 1: GitHub Actions

Push to `main` and GitHub will deploy automatically with the workflow in `.github/workflows/deploy-pages.yml`.

In your repository settings:

- Go to **Settings > Pages**
- Set **Source** to **GitHub Actions**

### Option 2: Manual publish

```bash
npm run deploy
```

This runs `npm run build` and publishes `dist/` to the `gh-pages` branch.
