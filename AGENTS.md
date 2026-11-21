# Repository Guidelines

## Project Structure & Module Organization

This repository is a small Node.js/Express point-of-sale and Khata ledger app. The entry point is `server.js`; configuration and shop settings live in `config.js`. HTTP endpoints are in `routes/` (`orders.js`, `products.js`, `customers.js`, `reports.js`), and business logic and persistence helpers are in `lib/` (pricing, tax, coupons, inventory, orders, ledger, reports, invoices, dates, and JSON storage). The browser interface is under `public/` (`index.html`, `js/app.js`, `css/style.css`). Runtime data is stored in `data/db.json`; the architecture diagram is in `docs/architecture.svg`. There is currently no test directory.

## Build, Test, and Development Commands

- `npm start` — starts the Express server at the configured port (defaults to 3000).
- `npm test` — currently a placeholder that exits with an error; no test framework or build command is configured.

Do not use production data for local experiments. The application writes orders, settlements, and audit entries directly to `data/db.json`.

## Coding Style & Naming Conventions

Use the existing CommonJS style (`require` / `module.exports`) and two-space indentation. Keep route handlers in `routes/` and reusable domain logic in `lib/`. Use lowercase filenames with descriptive names (for example, `pricing.js`); exported functions use camelCase. Match surrounding code and avoid adding dependencies or formatters without a clear need; no linter or formatter is configured.

## Testing Guidelines

There is no established test suite, coverage target, or test naming convention. For changes to pricing, GST, coupons, inventory, or ledger behavior, manually verify representative success and rejection cases and compare stored totals with the printable invoice. Do not report `npm test` as passing: its current script intentionally fails.

## Commit & Pull Request Guidelines

Recent history uses short, lowercase, descriptive commit subjects (for example, “customer khata credit ledger and order cancellation”), with no required prefix. Keep commits focused. Pull requests should explain the behavior change, list relevant verification, link related issues when available, and include screenshots for browser UI changes.

## Security & Configuration Tips

Keep credentials and real customer data out of commits. `config.js` contains an admin key and shop details; review these before deployment. The JSON file is the live persistence store, so back it up before any manual edits.
