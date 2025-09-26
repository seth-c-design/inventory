/*
 * Main JavaScript for Strategic Sales Guide.
 *
 * Responsible for:
 *  - Responsive navigation toggle
 *  - Loading vehicle data from JSON
 *  - Rendering inventory table with sorting and search
 *  - Rendering focus sheet cards with search and tag filtering
 *  - Simple contact form handler
 */

// Utility: fetch and cache vehicle data
let vehicleData = [];

async function loadVehicles() {
  if (vehicleData.length) return vehicleData;
  try {
    const resp = await fetch('data/vehicles.json');
    if (!resp.ok) throw new Error('Failed to fetch vehicles');
    vehicleData = await resp.json();
    return vehicleData;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Render inventory cards in a grid.  Each card shows key details and links to the focus sheet.
function renderInventoryCards(vehicles) {
  const grid = document.getElementById('inventory-grid');
  if (!grid) return;
  const searchInput = document.getElementById('inventory-search');

  function build(list) {
    grid.innerHTML = '';
    list.forEach(v => {
      const card = document.createElement('article');
      card.className = 'card';
      // Header: year/make/model/trim
      const header = document.createElement('div');
      header.className = 'card-header';
      header.textContent = `${v.year} ${v.make} ${v.model}${v.trim ? ' ' + v.trim : ''}`;
      card.appendChild(header);
      // Content
      const content = document.createElement('div');
      content.className = 'card-content';
      // Snapshot
      const snapshot = document.createElement('p');
      snapshot.innerHTML = `<strong>Stock:</strong> ${v.stock}<br />` +
        `<strong>Mileage:</strong> ${v.mileage === null ? 'N/A' : v.mileage + ' mi'}<br />` +
        `<strong>Color:</strong> ${v.color || 'N/A'}`;
      content.appendChild(snapshot);
      // Optional core value summary (first sentence)
      if (v.coreValue) {
        const summary = document.createElement('p');
        const firstSentence = v.coreValue.split('. ')[0] + '.';
        summary.innerHTML = `<em>${firstSentence}</em>`;
        summary.style.fontSize = '0.875rem';
        summary.style.color = 'var(--text-light)';
        content.appendChild(summary);
      }
      // Link to focus sheet
      const link = document.createElement('a');
      link.href = `focus-sheets.html#${v.stock}`;
      link.className = 'btn card-link';
      link.textContent = 'View focus sheet';
      content.appendChild(link);
      card.appendChild(content);
      grid.appendChild(card);
    });
  }
  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const filtered = vehicles.filter(v => {
        return (
          v.stock.toLowerCase().includes(q) ||
          String(v.year).includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          (v.trim || '').toLowerCase().includes(q) ||
          (v.color || '').toLowerCase().includes(q) ||
          (v.coreValue || '').toLowerCase().includes(q)
        );
      });
      build(filtered);
    });
  }
  // Initial render
  build(vehicles);
}

// Responsive navigation
function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (!navToggle || !navMenu) return;
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', (!expanded).toString());
    navMenu.classList.toggle('open');
  });
}

// Inventory table rendering and sorting
function renderInventoryTable(vehicles) {
  const tbody = document.querySelector('#inventory-table tbody');
  if (!tbody) return;

  let currentSort = { key: null, asc: true };

  function buildRows(list) {
    tbody.innerHTML = '';
    list.forEach(v => {
      const tr = document.createElement('tr');
      function td(content) {
        const cell = document.createElement('td');
        cell.textContent = content !== null && content !== undefined ? content : 'N/A';
        return cell;
      }
      tr.appendChild(td(v.stock));
      tr.appendChild(td(v.year));
      tr.appendChild(td(v.make));
      tr.appendChild(td(v.model));
      tr.appendChild(td(v.trim));
      tr.appendChild(td(v.mileage === null ? 'N/A' : v.mileage + ' mi'));
      tr.appendChild(td(v.color));
      tr.appendChild(td(v.coreValue));
      tbody.appendChild(tr);
    });
  }

  function sortBy(key) {
    const asc = currentSort.key === key ? !currentSort.asc : true;
    currentSort = { key, asc };
    const sorted = vehicles.slice().sort((a, b) => {
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') {
        return asc ? av - bv : bv - av;
      }
      return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    buildRows(sorted);
  }

  // Attach click handlers to table headers
  const headers = document.querySelectorAll('#inventory-table th');
  headers.forEach(th => {
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-sort');
      if (key) sortBy(key);
    });
  });

  // Search filter
  const searchInput = document.getElementById('inventory-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const filtered = vehicles.filter(v => {
        return (
          v.stock.toLowerCase().includes(q) ||
          String(v.year).includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          (v.trim || '').toLowerCase().includes(q) ||
          (v.color || '').toLowerCase().includes(q) ||
          v.coreValue.toLowerCase().includes(q)
        );
      });
      buildRows(filtered);
    });
  }
  // Initial render
  buildRows(vehicles);
}

// Focus sheet cards rendering
function renderFocusSheets(vehicles) {
  const container = document.getElementById('vehicle-cards');
  if (!container) return;

  const tagBar = document.getElementById('tag-filters');
  const searchInput = document.getElementById('focus-search');
  let activeTags = new Set();

  // Build unique tag list
  const tagSet = new Set();
  vehicles.forEach(v => {
    (v.tags || []).forEach(t => tagSet.add(t));
  });
  const tags = Array.from(tagSet).sort();
  // Render chips
  if (tagBar) {
    tags.forEach(tag => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'filter-chip';
      chip.textContent = tag;
      chip.setAttribute('aria-pressed', 'false');
      chip.addEventListener('click', () => {
        const isActive = chip.classList.toggle('active');
        chip.setAttribute('aria-pressed', isActive.toString());
        if (isActive) {
          activeTags.add(tag);
        } else {
          activeTags.delete(tag);
        }
        updateCards();
      });
      tagBar.appendChild(chip);
    });
  }

  function buildCard(v) {
    const article = document.createElement('article');
    article.className = 'card';
    article.id = v.stock;
    const header = document.createElement('div');
    header.className = 'card-header';
    header.textContent = `${v.year} ${v.make} ${v.model} ${v.trim}`;
    article.appendChild(header);
    const content = document.createElement('div');
    content.className = 'card-content';
    const subtitle = document.createElement('h3');
    subtitle.textContent = v.stock;
    content.appendChild(subtitle);
    // Snapshot list
    const snapshot = document.createElement('p');
    snapshot.innerHTML = `<strong>Mileage:</strong> ${v.mileage === null ? 'N/A' : v.mileage + ' mi'}<br />` +
      `<strong>Color:</strong> ${v.color || 'N/A'}`;
    content.appendChild(snapshot);
    // Core value
    const core = document.createElement('p');
    core.innerHTML = `<strong>Core Value:</strong> ${v.coreValue}`;
    content.appendChild(core);
    // Ideal customer
    const ideal = document.createElement('p');
    ideal.innerHTML = `<strong>Ideal Customer:</strong> ${v.idealCustomer}`;
    content.appendChild(ideal);
    // Tags
    if (v.tags && v.tags.length) {
      const tagList = document.createElement('div');
      tagList.className = 'tag-list';
      v.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = tag;
        tagList.appendChild(span);
      });
      content.appendChild(tagList);
    }
    // Selling points and benefits
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'More details';
    details.appendChild(summary);
    const sp = document.createElement('div');
    sp.innerHTML = `<strong>Selling Points:</strong><ul>${v.sellingPoints.map(p => `<li>${p}</li>`).join('')}</ul>` +
      `<strong>Benefits:</strong><ul>${v.benefits.map(b => `<li>${b}</li>`).join('')}</ul>` +
      `<strong>Conversation Starters:</strong><ul>${v.conversationStarters.map(q => `<li>${q}</li>`).join('')}</ul>`;
    details.appendChild(sp);
    content.appendChild(details);
    article.appendChild(content);
    return article;
  }

  function updateCards() {
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    container.innerHTML = '';
    vehicles.forEach(v => {
      // Filter by search text
      const haystack = `${v.stock} ${v.year} ${v.make} ${v.model} ${v.trim} ${v.coreValue} ${v.idealCustomer}`.toLowerCase();
      const matchesSearch = haystack.includes(q);
      // Filter by tags
      const matchesTags = activeTags.size === 0 || (v.tags || []).some(t => activeTags.has(t));
      if (matchesSearch && matchesTags) {
        container.appendChild(buildCard(v));
      }
    });
    // If URL has a hash, scroll to the matching card
    if (location.hash) {
      const target = container.querySelector(location.hash);
      if (target) {
        target.scrollIntoView();
        target.classList.add('highlight');
        setTimeout(() => target.classList.remove('highlight'), 2000);
      }
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', updateCards);
  }
  // Initial render
  updateCards();
}

// Contact form submission handler
function handleContactForm() {
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const team = document.getElementById('contact-team').value.trim();
  const message = document.getElementById('contact-message').value.trim();
  const feedback = document.getElementById('contact-feedback');
  const payload = { name, email, team, message };
  // In a real implementation this would send to a server. Here we simply
  // copy to clipboard and show a toast.
  navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
    feedback.textContent = 'Message copied to clipboard. Paste into your email client to send.';
  }).catch(() => {
    feedback.textContent = 'Unable to copy message. Please manually copy the form contents.';
  });
}

// Initialize page functionality when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  const vehicles = await loadVehicles();
  // Render the inventory grid when present
  const inventoryGrid = document.getElementById('inventory-grid');
  if (inventoryGrid) {
    renderInventoryCards(vehicles);
  }
  // Render the sortable table when present (fallback for print or other pages)
  const inventoryTable = document.getElementById('inventory-table');
  if (inventoryTable) {
    renderInventoryTable(vehicles);
  }
  // Render focus sheets when present
  const focusCards = document.getElementById('vehicle-cards');
  if (focusCards) {
    renderFocusSheets(vehicles);
  }
});