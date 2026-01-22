// Static pages configuration (Home and About)

export const staticPages = {
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
