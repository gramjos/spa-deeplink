// SPA Router for nested manifest-based content

let manifest = null;  // The full manifest tree
let routes = {};      // Flat lookup: { "/notes/nature/tundra": node }
let contentCache = {}; // Cache fetched HTML content

// Static pages (Home and About)
const staticPages = {
  '/': {
    title: 'Home',
    content: `
      <h1>🏠 Welcome</h1>
      <p>This is your personal knowledge vault, converted from Obsidian notes.</p>
      <p>Use the <strong>Notes</strong> tab to explore your content.</p>
    `
  },
  '/about': {
    title: 'About',
    content: `
      <h1>ℹ️ About</h1>
      <p>This SPA serves markdown notes converted to HTML.</p>
      <h2>Features</h2>
      <ul>
        <li>Nested directory navigation</li>
        <li>Breadcrumb trails</li>
        <li>Deep linking support</li>
      </ul>
    `
  }
};

// Flatten the nested manifest into a route lookup
// All vault routes are prefixed with /notes
function flattenManifest(node, parentSlug = '') {
  let urlPath;
  if (node.slug === 'root') {
    urlPath = '/notes';
  } else {
    urlPath = '/notes/' + node.slug;
  }
  
  // Add to routes lookup
  routes[urlPath] = node;
  
  // Recurse into children
  if (node.children) {
    for (const child of node.children) {
      flattenManifest(child, node.slug);
    }
  }
}

// Load manifest and build routes
async function loadManifest() {
  const response = await fetch('/manifest.json');
  const data = await response.json();
  manifest = data.root;
  flattenManifest(manifest);
}

// Fetch HTML content for a node (with caching)
async function fetchContent(contentPath) {
  if (contentCache[contentPath]) {
    return contentCache[contentPath];
  }
  
  try {
    // Content is in the try_hosting_Vault_ready_2_serve directory
    const response = await fetch('/try_hosting_Vault_ready_2_serve' + contentPath);
    if (!response.ok) throw new Error('Not found');
    const html = await response.text();
    contentCache[contentPath] = html;
    return html;
  } catch (e) {
    return `<p class="error">Failed to load content: ${contentPath}</p>`;
  }
}

// Build breadcrumb navigation from path (for /notes paths)
function buildBreadcrumbs(path) {
  if (!path.startsWith('/notes')) return '';
  if (path === '/notes') {
    return `<nav class="breadcrumbs"><span>Notes</span></nav>`;
  }
  
  const parts = path.split('/').filter(Boolean); // ['notes', 'nature', 'tundra']
  let crumbs = [`<a href="/notes" data-link>Notes</a>`];
  let accumulated = '/notes';
  
  for (let i = 1; i < parts.length; i++) {
    accumulated += '/' + parts[i];
    const node = routes[accumulated];
    const isLast = i === parts.length - 1;
    
    if (node) {
      if (isLast) {
        crumbs.push(`<span>${node.title}</span>`);
      } else {
        crumbs.push(`<a href="${accumulated}" data-link>${node.title}</a>`);
      }
    }
  }
  
  return `<nav class="breadcrumbs">${crumbs.join(' / ')}</nav>`;
}

// Build the two-column files/directories view
function buildFilesAndDirs(node) {
  if (!node.children || node.children.length === 0) return '';
  
  const files = node.children.filter(c => c.type === 'file');
  const dirs = node.children.filter(c => c.type === 'directory');
  
  const fileLinks = files.map(child => {
    const href = '/notes/' + child.slug;
    return `<li><a href="${href}" data-link>📄 ${child.title}</a></li>`;
  }).join('');
  
  const dirLinks = dirs.map(child => {
    const href = '/notes/' + child.slug;
    return `<li><a href="${href}" data-link>📁 ${child.title}</a></li>`;
  }).join('');
  
  return `
    <div class="files-dirs-container">
      <div class="files-list">
        <h3>Files</h3>
        <ul>${fileLinks || '<li class="empty">No files</li>'}</ul>
      </div>
      <div class="dirs-list">
        <h3>Directories</h3>
        <ul>${dirLinks || '<li class="empty">No subdirectories</li>'}</ul>
      </div>
    </div>
  `;
}

// Fix internal links in content to use /notes/ prefix and SPA routing
function processContentLinks(currentPath) {
  const contentEl = document.querySelector('.content');
  if (!contentEl) return;
  
  contentEl.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Skip external links and already-processed links
    if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) {
      return;
    }
    
    // Skip if already has data-link
    if (link.hasAttribute('data-link')) return;
    
    // Determine the correct path
    let newHref = href;
    
    if (href.startsWith('/notes/')) {
      // Already correct
      newHref = href;
    } else if (href.startsWith('/')) {
      // Absolute path like /about -> /notes/about
      newHref = '/notes' + href;
    } else {
      // Relative path like "desert" -> resolve from current directory
      const currentDir = currentPath.endsWith('/') ? currentPath : currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
      newHref = currentDir + href;
    }
    
    // Check if route exists, if not keep original href (might be external or graphics)
    if (routes[newHref]) {
      link.setAttribute('href', newHref);
      link.setAttribute('data-link', '');
    }
  });
}

// Router class
class Router {
  constructor() {
    this.appElement = document.getElementById('app');
    this.navElement = document.getElementById('main-nav');
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => this.render());
    
    // Handle link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
  }
  
  // Build fixed nav: Home, About, Notes
  buildNav() {
    this.navElement.innerHTML = `
      <a href="/" data-link>Home</a>
      <a href="/about" data-link>About</a>
      <a href="/notes" data-link>Notes</a>
    `;
  }
  
  navigate(path) {
    if (path !== location.pathname) {
      history.pushState(null, null, path);
      this.render();
    }
  }
  
  async render() {
    const path = location.pathname;
    
    // Check for static pages first (Home, About)
    if (staticPages[path]) {
      const page = staticPages[path];
      document.title = `${page.title} | Vault`;
      this.appElement.innerHTML = `
        <article class="content">
          ${page.content}
        </article>
      `;
      this.updateActiveNav(path);
      return;
    }
    
    // Check for vault routes (/notes/...)
    const node = routes[path];
    
    if (!node) {
      this.renderNotFound();
      return;
    }
    
    // Update page title
    document.title = `${node.title} | Vault`;
    
    // Fetch the HTML content
    const content = await fetchContent(node.content_path);
    
    // Build the page based on wireframe layout
    const breadcrumbs = buildBreadcrumbs(path);
    const filesDirs = node.type === 'directory' ? buildFilesAndDirs(node) : '';
    
    this.appElement.innerHTML = `
      ${breadcrumbs}
      ${filesDirs}
      <article class="content">
        ${content}
      </article>
    `;
    
    // Fix internal links in content
    processContentLinks(path);
    
    // Update active nav link
    this.updateActiveNav(path);
  }
  
  updateActiveNav(path) {
    document.querySelectorAll('#main-nav a').forEach(link => {
      const href = link.getAttribute('href');
      let isActive = false;
      if (href === '/') {
        isActive = path === '/';
      } else if (href === '/notes') {
        isActive = path.startsWith('/notes');
      } else {
        isActive = path === href;
      }
      link.classList.toggle('active', isActive);
    });
  }
  
  renderNotFound() {
    document.title = '404 | Vault';
    this.appElement.innerHTML = `
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <p><a href="/" data-link>← Back to Home</a></p>
      <div class="path-info">Requested: ${location.pathname}</div>
    `;
  }
}

// Initialize
async function init() {
  const router = new Router();
  
  // Show loading state
  router.appElement.innerHTML = '<p>Loading...</p>';
  
  // Load manifest and build routes
  await loadManifest();
  
  // Build navigation from manifest
  router.buildNav();
  
  // Render current route
  router.render();
}

init();
