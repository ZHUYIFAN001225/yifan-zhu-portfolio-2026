# Yifan Zhu — Portfolio V3

Research-led multidisciplinary design across digital products and UX, 3D/AI/motion, creative technology, and service transformation.

## Run locally

Use Node.js 22 or newer. No application framework is required.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4176/. The optional device comparison panel is at /scripts/local-preview.html.

## Build and check

```sh
npm test
npm run build
```

The deployable website is generated in `dist/`. Vercel and Netlify use the existing repository configuration. Private local configuration, databases, temporary files and build output are excluded from Git.

## Work collections

- All Work: `work.html?filter=all`
- Digital Products & UX: `work.html?filter=digital-products-ux`
- 3D, AI & Motion: `work.html?filter=3d-ai-motion`
- Creative Technology: `work.html?filter=creative-technology`
- Service & Transformation: `work.html?filter=service-transformation`

Append `&lang=en` or `&lang=zh` for the preferred language. Each project keeps one canonical case, even when it belongs to multiple collections. The light/dark choice is saved in the browser.

## Content and prototypes

The catalogue lives in `scripts/portfolio-catalog.mjs`; the two product case narratives live in `scripts/product-case-data.mjs`. Existing case pages and original media remain part of this project.

LOOK and Glasgow Booking are developing prototypes. Their public cases include screenshots, design logic, research plans and English/Chinese case PDFs. Their interactive services currently run in the separate local product projects; this portfolio build does not publish those services, accounts or databases. Fieldwork and testing are labelled according to available evidence.

For the optional local product harness, create the ignored file `.codex-tmp/v3/local-projects.json` pointing to the existing local product directories before running `npm run demos` or `npm run demos:prepare`.

## Optional case PDF export

`npm run export:cases` uses Python with ReportLab and the font paths defined in `scripts/export-product-cases.py` (currently Windows Arial and SimHei). Set `PORTFOLIO_PYTHON` when Python is not on PATH. The checked-in PDFs allow the website build to run without Python.
