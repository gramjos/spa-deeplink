# SPA Deep Link Demo

A minimal Single Page Application with deep linking support using the History API and the 404 redirect hack.

## Features

- **3 Pages**: Home, About, Contact
- **History API**: Client-side routing with `pushState`/`popstate`
- **Deep Linking**: 404 redirect hack for static hosting (GitHub Pages, etc.)
- **No Dependencies**: Pure vanilla JavaScript

## How It Works

### History API
The app uses `history.pushState()` to update the URL without page reloads, and listens for `popstate` events to handle browser back/forward navigation.

### 404 Redirect Hack
When deployed to static hosts like GitHub Pages:
1. User visits `/about` directly
2. Server returns `404.html` (no server-side routing)
3. `404.html` saves the URL to `sessionStorage` and redirects to `/`
4. `index.html` reads `sessionStorage`, restores the URL with `replaceState`
5. The router renders the correct page

## Running Locally

You need a local server (direct file:// won't work with History API):

```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx serve

# Node.js (global)
npm install -g serve && serve
```

Then visit http://localhost:8000

## Deployment

Works with any static hosting that supports custom 404 pages:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

Just deploy all files to the root of your hosting.
