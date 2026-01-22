// UI generation helpers (breadcrumbs, file/directory lists)

import { routes } from './manifest.js';

// Build breadcrumb navigation from path (for /notes paths)
export function buildBreadcrumbs(path) {
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
export function buildFilesAndDirs(node) {
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
