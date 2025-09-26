# Strategic Sales Guide Website

This repository contains the source for a digital companion to the **Strategic Sales Guide: Inventory Analysis & Customer Alignment Focus Sheets**.  It transforms the original PDF report into a searchable, accessible and responsive web application.

## Project Structure

```
website/
├── index.html                # Executive summary and strategic overview
├── inventory.html            # Master inventory table with searchable rows
├── focus-sheets.html         # Per‑vehicle focus sheets with filters and deep‑links
├── recommendations.html      # Synthesis of inventory insights and action items
├── about.html                # About and contact form
├── data/
│   └── vehicles.json         # Structured data extracted from every vehicle focus sheet
├── assets/
│   ├── styles.css            # Main site styles (responsive and print media)
│   ├── print.css             # Print‑specific tweaks; loaded only when printing
│   ├── app.js                # Vanilla JS for search, filtering and interactions
│   └── favicon.svg           # Simple accent‑color glyph used as a browser icon
└── README.md                # This file
```

## Getting Started

To preview the site locally, you only need a static HTTP server.  If you have Python installed, you can launch one with the built‑in module:

```bash
cd website
python -m http.server
```

Then visit `http://localhost:8000` in your browser.  If you prefer another server (Node.js, Ruby, etc.), any static server will work as long as it preserves relative paths.

## Data Schema (`data/vehicles.json`)

Each object in `vehicles.json` represents a single vehicle from the Sales Focus Sheets.  The properties are:

| Field               | Type      | Description                                                                                                   |
|-------------------- |---------- |---------------------------------------------------------------------------------------------------------------|
| `stock`             | `string`  | Stock number that uniquely identifies the vehicle; also used to generate deep‑link IDs.                       |
| `year`              | `number`  | Model year of the vehicle.                                                                                    |
| `make`              | `string`  | Manufacturer (e.g., "Hyundai").                                                                             |
| `model`             | `string`  | Model name (e.g., "Palisade").                                                                              |
| `trim`              | `string`  | Specific trim or package (if provided).                                                                      |
| `mileage`           | `number` or `null` | Mileage at the time of listing; `null` when not available in the report.                                 |
| `color`             | `string` or `null` | Exterior color; `null` when not specified.                                                               |
| `tags`              | `string[]` | List of descriptive tags used to drive filters (e.g., "Three‑row", "Hybrid").                              |
| `coreValue`         | `string`  | Succinct statement summarizing why the vehicle matters for buyers.                                           |
| `idealCustomer`     | `string`  | Description of the target customer profile.                                                                  |
| `sellingPoints`     | `string[]` | Bulleted list of unique selling points gleaned directly from the PDF.                                       |
| `benefits`          | `string[]` | Corresponding benefits that explain why each selling point matters to the buyer.                             |
| `conversationStarters` | `string[]` | Suggested open‑ended questions to spark consultative conversations with customers.                         |

All fields are extracted verbatim from the original report wherever possible; missing information is represented with `null` and flagged in the UI.  Some tags were inferred to aid filtering but the core content remains faithful to the source.

## Notes

* **Accessibility:** The site uses semantic HTML5 landmarks, ARIA labels on interactive elements, accessible keyboard navigation and a high‑contrast color palette to meet WCAG 2.1 AA guidelines.
* **Printing:** A separate stylesheet (`print.css`) ensures each vehicle focus sheet prints cleanly on its own page without navigation or interactive controls.
* **Modifications:** Feel free to adjust the style variables defined at the top of `styles.css` to fit your own brand colors or fonts.  The vanilla JavaScript in `app.js` is self‑documenting and can be extended to add new filters or functionality.

## License

This site is for internal use only.  No explicit license is provided; usage is restricted to the dealership team as permitted by the original report.
