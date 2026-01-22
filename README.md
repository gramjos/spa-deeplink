# SPA Deep Link Demo
A minimal Single Page Application with deep linking support using the History API and the 404 redirect hack.

## Features
- **3 Pages**: Home, About, Contact
- **History API**: Client-side routing with `pushState`/`popstate`
- **Deep Linking**: 404 redirect hack for static hosting (GitHub Pages, etc.)
- **No Dependencies**: Pure vanilla JavaScript


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
# Node.js (npx)
npx serve -s
```

## Execution Flow Documentation

This section provides rigorous documentation of every function, script, and code path in the application.

---

### File Overview

| File | Purpose |
|------|---------|
| `index.html` | Main entry point, contains navigation, app container, and redirect restoration script |
| `404.html` | Fallback page that captures the URL and redirects to root (for static hosts) |
| `app.js` | Router logic, route loading, and rendering |
| `routes.json` | Route configuration data (titles, headings, content) |
| `wrangler.jsonc` | Cloudflare Workers deployment configuration |

---

### Scenario 1: Direct Navigation to Root (`/`)

**Trigger**: User visits `https://root.com/`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Browser requests /                                                  │
│ Server returns index.html (200 OK)                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: index.html <script> (inline IIFE) executes                          │
│                                                                             │
│   (function() {                                                             │
│     const redirect = sessionStorage.redirect;  // undefined (nothing stored)│
│     delete sessionStorage.redirect;            // no-op                     │
│     if (redirect && redirect !== location.href) {                           │
│       history.replaceState(null, null, redirect);  // SKIPPED               │
│     }                                                                       │
│   })();                                                                     │
│                                                                             │
│ Result: No redirect stored, script does nothing                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Browser loads app.js                                                │
│ Executes init() at bottom of file                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: init() executes                                                     │
│                                                                             │
│   async function init() {                                                   │
│     await loadRoutes();           // ← waits for routes.json                │
│     const router = new Router(routes);                                      │
│   }                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: loadRoutes() executes                                               │
│                                                                             │
│   async function loadRoutes() {                                             │
│     const response = await fetch('/routes.json');  // HTTP GET              │
│     const data = await response.json();            // Parse JSON            │
│                                                                             │
│     for (const [path, route] of Object.entries(data)) {                     │
│       routes[path] = {                                                      │
│         title: route.title,                                                 │
│         render: () => `<h1>${route.heading}</h1>...`                        │
│       };                                                                    │
│     }                                                                       │
│   }                                                                         │
│                                                                             │
│ Result: Global `routes` object populated with:                              │
│   routes['/']        → { title: 'Home', render: Function }                  │
│   routes['/about']   → { title: 'About', render: Function }                 │
│   routes['/contact'] → { title: 'Contact', render: Function }               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: new Router(routes) executes                                         │
│                                                                             │
│   constructor(routes) {                                                     │
│     this.routes = routes;                                                   │
│     this.appElement = document.getElementById('app');  // <div id="app">    │
│                                                                             │
│     // Register popstate listener for back/forward buttons                  │
│     window.addEventListener('popstate', () => this.render());               │
│                                                                             │
│     // Register click listener for SPA navigation                           │
│     document.addEventListener('click', (e) => {                             │
│       const link = e.target.closest('[data-link]');                         │
│       if (link) {                                                           │
│         e.preventDefault();                                                 │
│         this.navigate(link.getAttribute('href'));                           │
│       }                                                                     │
│     });                                                                     │
│                                                                             │
│     this.render();  // ← Initial render called                              │
│   }                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 7: render() executes                                                   │
│                                                                             │
│   render() {                                                                │
│     const path = location.pathname;           // "/"                        │
│     const route = this.routes[path]           // routes['/'] found          │
│                   || this.notFound();         // ← not called               │
│                                                                             │
│     document.title = `${route.title} | SPA Demo`;  // "Home | SPA Demo"     │
│     this.appElement.innerHTML = route.render();    // Injects HTML          │
│                                                                             │
│     // Update nav active states                                             │
│     document.querySelectorAll('nav a').forEach(link => {                    │
│       link.classList.toggle('active', link.getAttribute('href') === path);  │
│     });                                                                     │
│   }                                                                         │
│                                                                             │
│ Result: Home page content rendered in #app, nav link highlighted            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Scenario 2: SPA Navigation (Clicking a Link)

**Trigger**: User clicks "About" link in navigation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Click event fires on <a href="/about" data-link>About</a>           │
│                                                                             │
│ Document click listener (registered in Router constructor) catches event   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Click handler executes                                              │
│                                                                             │
│   document.addEventListener('click', (e) => {                               │
│     const link = e.target.closest('[data-link]');  // Finds the <a> tag     │
│     if (link) {                                    // ✓ Found               │
│       e.preventDefault();                          // Stop browser nav      │
│       this.navigate(link.getAttribute('href'));    // navigate('/about')    │
│     }                                                                       │
│   });                                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: navigate('/about') executes                                         │
│                                                                             │
│   navigate(path) {                                                          │
│     if (path !== location.pathname) {      // '/about' !== '/' → true       │
│       history.pushState(null, null, path); // URL changes to /about         │
│       this.render();                       // Re-render with new path       │
│     }                                                                       │
│   }                                                                         │
│                                                                             │
│ Result: Browser URL bar shows /about, no HTTP request made                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: render() executes                                                   │
│                                                                             │
│   const path = location.pathname;  // "/about"                              │
│   const route = this.routes[path]; // routes['/about'] found                │
│                                                                             │
│ Result: About page content rendered, nav updated                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Scenario 3: Browser Back/Forward Button

**Trigger**: User clicks browser back button

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Browser fires 'popstate' event                                      │
│                                                                             │
│ The popstate listener (registered in Router constructor) fires              │
│                                                                             │
│   window.addEventListener('popstate', () => this.render());                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: render() executes                                                   │
│                                                                             │
│   const path = location.pathname;  // Previous URL from history stack       │
│   const route = this.routes[path]; // Look up route                         │
│                                                                             │
│ Result: Previous page rendered                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Scenario 4: Deep Link with 404 Redirect Hack (Static Hosts)

**Trigger**: User directly navigates to `https://example.com/contact` on a static host without SPA support

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Browser requests /contact                                           │
│                                                                             │
│ Server has no file at /contact → returns 404.html                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: 404.html <script> executes                                          │
│                                                                             │
│   sessionStorage.redirect = location.href;                                  │
│   // Stores: "https://example.com/contact"                                  │
│                                                                             │
│   location.replace(location.origin);                                        │
│   // Redirects to: "https://example.com/"                                   │
│   // Uses replace() so back button doesn't return to 404                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Browser requests / (root)                                           │
│                                                                             │
│ Server returns index.html (200 OK)                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: index.html <script> (inline IIFE) executes                          │
│                                                                             │
│   (function() {                                                             │
│     const redirect = sessionStorage.redirect;                               │
│     // redirect = "https://example.com/contact"                             │
│                                                                             │
│     delete sessionStorage.redirect;  // Clean up                            │
│                                                                             │
│     if (redirect && redirect !== location.href) {                           │
│       // "https://example.com/contact" !== "https://example.com/" → true    │
│                                                                             │
│       history.replaceState(null, null, redirect);                           │
│       // URL bar now shows /contact (no page reload)                        │
│       // Uses replaceState() so history isn't polluted                      │
│     }                                                                       │
│   })();                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: app.js loads → init() → loadRoutes() → new Router()                 │
│                                                                             │
│ STEP 6: render() called with location.pathname = "/contact"                 │
│                                                                             │
│ Result: Contact page rendered, user sees correct content                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Scenario 5: Deep Link with Cloudflare SPA Mode

**Trigger**: User directly navigates to `https://example.com/contact` on Cloudflare Workers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Browser requests /contact                                           │
│                                                                             │
│ Cloudflare Workers configured with:                                         │
│   "not_found_handling": "single-page-application"                           │
│                                                                             │
│ No file at /contact → Cloudflare returns index.html (not 404.html)          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: index.html <script> (inline IIFE) executes                          │
│                                                                             │
│   const redirect = sessionStorage.redirect;  // undefined                   │
│                                                                             │
│ Result: No redirect stored, script does nothing                             │
│ URL bar already shows /contact (no redirect needed)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: app.js loads → init() → loadRoutes() → new Router()                 │
│                                                                             │
│ STEP 4: render() called with location.pathname = "/contact"                 │
│                                                                             │
│ Result: Contact page rendered directly (faster, no redirect)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Scenario 6: Unknown Route (404 Page)

**Trigger**: User navigates to `/unknown-page`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: render() executes                                                   │
│                                                                             │
│   const path = location.pathname;            // "/unknown-page"             │
│   const route = this.routes[path]            // undefined                   │
│                 || this.notFound();          // ← called                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: notFound() returns fallback route object                            │
│                                                                             │
│   notFound() {                                                              │
│     return {                                                                │
│       title: '404',                                                         │
│       render: () => `                                                       │
│         <h1>404 - Page Not Found</h1>                                       │
│         <p>The page you're looking for doesn't exist.</p>                   │
│         <div class="path-info">Requested path: ${location.pathname}</div>   │
│       `                                                                     │
│     };                                                                      │
│   }                                                                         │
│                                                                             │
│ Result: Client-side 404 page rendered                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Function Reference

#### `app.js`

| Function/Method | Type | Description |
|-----------------|------|-------------|
| `loadRoutes()` | `async function` | Fetches `/routes.json`, parses it, and populates the global `routes` object with route objects containing `title` and `render()` function |
| `init()` | `async function` | Entry point. Awaits `loadRoutes()`, then instantiates `Router` |
| `Router.constructor(routes)` | `class method` | Stores routes, gets `#app` element, registers `popstate` and `click` listeners, calls initial `render()` |
| `Router.navigate(path)` | `class method` | Pushes new state to history if path changed, then calls `render()` |
| `Router.render()` | `class method` | Reads `location.pathname`, finds matching route (or 404), updates `document.title`, injects HTML into `#app`, updates nav active states |
| `Router.notFound()` | `class method` | Returns fallback route object for unknown paths |

#### `index.html` (inline script)

| Code | Description |
|------|-------------|
| IIFE at load | Checks `sessionStorage.redirect`, if present and different from current URL, calls `history.replaceState()` to restore the deep-linked path |

#### `404.html` (inline script)

| Code | Description |
|------|-------------|
| Script at load | Stores `location.href` in `sessionStorage.redirect`, then redirects to origin using `location.replace()` |

---

### Data Flow Diagram

```
┌─────────────┐     fetch      ┌──────────────┐
│ routes.json │ ◄───────────── │ loadRoutes() │
└─────────────┘                └──────────────┘
       │                              │
       │ JSON data                    │ populates
       ▼                              ▼
┌─────────────────────────────────────────────┐
│              routes (global object)          │
│  {                                          │
│    '/': { title, render() },                │
│    '/about': { title, render() },           │
│    '/contact': { title, render() }          │
│  }                                          │
└─────────────────────────────────────────────┘
                      │
                      │ passed to
                      ▼
              ┌──────────────┐
              │    Router    │
              └──────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │ popstate│  │  click  │  │ render()│
    │ listener│  │ listener│  │         │
    └─────────┘  └─────────┘  └─────────┘
         │            │            │
         └────────────┴────────────┘
                      │
                      ▼
              ┌──────────────┐
              │  <div #app>  │
              │  (DOM)       │
              └──────────────┘
```

---

### Key Browser APIs Used

| API | Usage |
|-----|-------|
| `history.pushState(state, title, url)` | Updates URL without page reload (SPA navigation) |
| `history.replaceState(state, title, url)` | Updates URL without adding to history stack (redirect restoration) |
| `window.popstate` event | Fires when user clicks back/forward buttons |
| `sessionStorage` | Persists redirect URL across the 404→index.html redirect |
| `location.pathname` | Current URL path (e.g., `/contact`) |
| `location.href` | Full URL (e.g., `https://example.com/contact`) |
| `location.origin` | Protocol + host (e.g., `https://example.com`) |
| `location.replace(url)` | Redirects without adding to history stack |
| `fetch()` | Loads routes.json asynchronously |
| `document.getElementById()` | Gets the `#app` container |
| `document.querySelectorAll()` | Finds all nav links for active state updates |
| `element.closest(selector)` | Finds ancestor matching selector (for `data-link` detection) |
| `event.preventDefault()` | Stops default link navigation behavior |
