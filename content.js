// Content fetching and link processing

import { routes } from './manifest.js';

let contentCache = {}; // Cache fetched HTML content

// Fetch HTML content for a node (with caching)
export async function fetchContent(contentPath) {
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

// Fix internal links in content to use /notes/ prefix and SPA routing
export function processContentLinks(currentPath) {
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
