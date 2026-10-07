# MoneyTrack

MoneyTrack is a responsive personal finance tracker built with **HTML, CSS, and vanilla JavaScript**.

## Features

- Total balance, income, and expenses dashboard
- Add income and expense transactions
- Transaction name, amount, type, category, and date
- Categories:
  - Food
  - Transport
  - Shopping
  - Entertainment
  - Bills
  - Other
- Transaction list with delete controls
- Automatic financial calculations
- Spending chart
- Category spending summaries
- Data saved in browser `localStorage`
- Responsive desktop and mobile layout
- Subtle animations and hover effects
- No backend, database, React, or other frameworks

## Files

```text
MoneyTrack/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run locally

No installation or build step is required.

### Option 1: Open directly

Double-click `index.html` and open it in your browser.

### Option 2: Use a local server

If you have Python installed:

```bash
cd MoneyTrack
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Using a local server is recommended when testing browser behavior.

## Data storage

MoneyTrack uses the browser's `localStorage`.

This means:

- Transactions remain after refreshing the page.
- No account or backend is required.
- Data is stored locally in the browser/device.
- Clearing browser site data can remove the saved transactions.

## Deploy to GitHub Pages

### 1. Create a GitHub repository

Create a new repository on GitHub, for example:

```text
moneytrack
```

### 2. Upload the files

Upload these files to the repository root:

```text
index.html
style.css
script.js
README.md
```

### 3. Enable GitHub Pages

In the repository:

1. Open **Settings**.
2. Select **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`.
5. Click **Save**.

GitHub will build the site automatically.

### 4. Open the website

After deployment, GitHub Pages will provide a URL similar to:

```text
https://YOUR-USERNAME.github.io/moneytrack/
```

The exact URL depends on your GitHub username and repository name.

## License

You can freely modify this project for personal or educational use.
