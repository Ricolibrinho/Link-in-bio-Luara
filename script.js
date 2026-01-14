console.log("script.js carregou ✅");
// Extracted from original index.html
const COUPONS_JSON = "/data/coupons.json";
const PRODUCTS_JSON = "/data/products.json";

const defaultConfig = {
  profile_name: 'Maria Beauty',
  profile_bio: 'Dicas de beleza e perfumaria\nReviews honestos de produtos\nCupons exclusivos',
  cupons_title: 'Cupons Exclusivos',
  produtos_title: 'Produtos Favoritos',
  background_color: '#FAFAFA',
  card_color: '#FFFFFF',
  text_primary: '#1F2937',
  text_secondary: '#6B7280',
  accent_color: '#F3F4F6',
  font_family: 'Inter',
  font_size: 16
};

async function onConfigChange(config) {
  // Update text content
  document.getElementById('profile-name').textContent =
    config.profile_name || defaultConfig.profile_name;

  document.getElementById('profile-bio').innerHTML =
    (config.profile_bio || defaultConfig.profile_bio).replace(/\n/g, '<br>');

  document.getElementById('cupons-title').textContent =
    config.cupons_title || defaultConfig.cupons_title;

  document.getElementById('produtos-title').textContent =
    config.produtos_title || defaultConfig.produtos_title;

  // Update colors
  const bgColor = config.background_color || defaultConfig.background_color;
  const cardColor = config.card_color || defaultConfig.card_color;
  const textPrimary = config.text_primary || defaultConfig.text_primary;
  const textSecondary = config.text_secondary || defaultConfig.text_secondary;
  const accentColor = config.accent_color || defaultConfig.accent_color;

  // Apply background
  document.getElementById('app-wrapper').style.backgroundColor = bgColor;

  // Apply text colors
  document.getElementById('profile-name').style.color = textPrimary;
  document.getElementById('profile-bio').style.color = textSecondary;
  document.getElementById('cupons-title').style.color = textPrimary;
  document.getElementById('produtos-title').style.color = textPrimary;

  // Apply card colors
  document.querySelectorAll('.link-item, .product-card').forEach(card => {
    card.style.backgroundColor = cardColor;
  });

  // Apply accent colors to badges and circles
  document.querySelectorAll('.link-item > div > div:last-child').forEach(badge => {
    badge.style.backgroundColor = accentColor;
    badge.style.color = textSecondary;
  });

  // Apply fonts
  const fontFamily = config.font_family || defaultConfig.font_family;
  const fontSize = config.font_size || defaultConfig.font_size;

  document.body.style.fontFamily = `${fontFamily}, Inter, sans-serif`;
  document.querySelectorAll('.font-heading').forEach(el => {
    el.style.fontFamily = `${fontFamily}, Crimson Pro, serif`;
  });

  // Apply font size scaling
  document.getElementById('profile-name').style.fontSize = `${fontSize * 1.875}px`;
  document.getElementById('profile-bio').style.fontSize = `${fontSize * 0.875}px`;
  document.getElementById('cupons-title').style.fontSize = `${fontSize * 1.25}px`;
  document.getElementById('produtos-title').style.fontSize = `${fontSize * 1.25}px`;
}

function mapToCapabilities(config) {
  return {
    recolorables: [
      {
        get: () => config.background_color || defaultConfig.background_color,
        set: (value) => { config.background_color = value; window.elementSdk.setConfig({ background_color: value }); }
      },
      {
        get: () => config.card_color || defaultConfig.card_color,
        set: (value) => { config.card_color = value; window.elementSdk.setConfig({ card_color: value }); }
      },
      {
        get: () => config.text_primary || defaultConfig.text_primary,
        set: (value) => { config.text_primary = value; window.elementSdk.setConfig({ text_primary: value }); }
      },
      {
        get: () => config.text_secondary || defaultConfig.text_secondary,
        set: (value) => { config.text_secondary = value; window.elementSdk.setConfig({ text_secondary: value }); }
      },
      {
        get: () => config.accent_color || defaultConfig.accent_color,
        set: (value) => { config.accent_color = value; window.elementSdk.setConfig({ accent_color: value }); }
      }
    ],
    borderables: [],
    fontEditable: {
      get: () => config.font_family || defaultConfig.font_family,
      set: (value) => { config.font_family = value; window.elementSdk.setConfig({ font_family: value }); }
    },
    fontSizeable: {
      get: () => config.font_size || defaultConfig.font_size,
      set: (value) => { config.font_size = value; window.elementSdk.setConfig({ font_size: value }); }
    }
  };
}

function mapToEditPanelValues(config) {
  return new Map([
    ['profile_name', config.profile_name || defaultConfig.profile_name],
    ['profile_bio', config.profile_bio || defaultConfig.profile_bio],
    ['cupons_title', config.cupons_title || defaultConfig.cupons_title],
    ['produtos_title', config.produtos_title || defaultConfig.produtos_title]
  ]);
}

// Initialize SDK
if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities,
    mapToEditPanelValues
  });
}

// banco de dados 

async function initDataTabs() {
  const tabsEl = document.getElementById("tabs");
  const contentEl = document.getElementById("tabContent");

  if (!tabsEl || !contentEl) {
    console.warn("Containers de abas não encontrados");
    return;
  }

  const [couponsRes, productsRes] = await Promise.allSettled([
    fetch(COUPONS_JSON, { cache: "no-store" }).then(r => r.json()),
    fetch(PRODUCTS_JSON, { cache: "no-store" }).then(r => r.json()),
  ]);

  const coupons = couponsRes.status === "fulfilled"
    ? (couponsRes.value.items || [])
    : [];

  const products = productsRes.status === "fulfilled"
    ? (productsRes.value.items || [])
    : [];

  const couponsByCat = groupByCategory(coupons);
  const productsByCat = groupByCategory(products);

  const categories = Array.from(
    new Set([...couponsByCat.keys(), ...productsByCat.keys()])
  );

  if (!categories.length) {
    tabsEl.innerHTML = "";
    contentEl.innerHTML =
      `<p class="text-center text-sm" style="color:#9CA3AF;">Sem itens por enquanto.</p>`;
    return;
  }

  const priority = ["Cupons Exclusivos", "Produtos Favoritos"];
  categories.sort((a, b) => {
    const ia = priority.indexOf(a);
    const ib = priority.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  let active = categories[0];

  function render() {
    tabsEl.innerHTML = categories
      .map(cat => buildTabButton(cat, cat === active))
      .join("");

    tabsEl.querySelectorAll("button[data-tab]").forEach(btn => {
      btn.onclick = () => {
        active = btn.dataset.tab;
        render();
        contentEl.innerHTML =
          renderTabContent(active, couponsByCat, productsByCat);
      };
    });

    contentEl.innerHTML =
      renderTabContent(active, couponsByCat, productsByCat);
  }

  render();
}


function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function couponCard(c) {
  const href = c.url ? c.url : "#";
  const target = c.url ? `_blank` : `_self`;
  const rel = c.url ? `noopener noreferrer` : "";
  return `
    <a href="${href}" target="${target}" rel="${rel}"
      class="link-item block bg-white rounded-lg p-5 border"
      style="border-color:#E5E7EB;">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 flex-1">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style="background-color:#F9FAFB; color:#6B7280;">
            ${escapeHtml(c.icon || "🏷️")}
          </div>
          <div class="flex-1">
            <h3 class="font-medium text-sm mb-0.5" style="color:#1F2937;">${escapeHtml(c.brand)}</h3>
            <p class="text-xs" style="color:#9CA3AF;">${escapeHtml(c.description)}</p>
          </div>
        </div>
        <div class="px-3 py-1.5 rounded-md text-xs font-medium"
          style="background-color:#F3F4F6; color:#4B5563;">
          ${escapeHtml(c.code)}
        </div>
      </div>
    </a>
  `;
}

function productCard(p) {
  const img = p.image_url
    ? `<img src="${p.image_url}" alt="${escapeHtml(p.name)}" class="w-14 h-14 mx-auto mb-4 rounded-full object-cover" />`
    : `<div class="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style="background-color:#F9FAFB;">✨</div>`;

  return `
    <a href="${p.url}" target="_blank" rel="noopener noreferrer"
      class="product-card block bg-white rounded-lg p-5 border text-center"
      style="border-color:#E5E7EB;">
      ${img}
      <h3 class="font-medium text-sm mb-1" style="color:#1F2937;">${escapeHtml(p.name)}</h3>
      <p class="text-xs mb-3" style="color:#9CA3AF;">${escapeHtml(p.description)}</p>
      <div class="text-xs" style="color:#6B7280;">Ver produto →</div>
    </a>
  `;
}

function groupByCategory(items) {
  const map = new Map();
  (items || []).forEach(item => {
    const cat = (item.category || "").trim();
    if (!cat) return;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(item);
  });
  return map;
}

function buildTabButton(label, isActive) {
  return `
    <button
      class="px-4 py-2 rounded-full border text-sm transition"
      style="border-color:#E5E7EB; background:${isActive ? "#111827" : "#FFFFFF"}; color:${isActive ? "#FFFFFF" : "#111827"};"
      data-tab="${escapeHtml(label)}"
    >${escapeHtml(label)}</button>
  `;
}

function renderTabContent(category, couponsByCat, productsByCat) {
  const coupons = couponsByCat.get(category) || [];
  const products = productsByCat.get(category) || [];

  let html = `<div class="fade-in" style="animation-delay:0.05s;">`;

  if (coupons.length) {
    html += `
      <h2 class="font-heading text-xl font-light mb-4 text-center" style="color:#374151;">${escapeHtml(category)}</h2>
      <div class="space-y-3 mb-10">${coupons.map(couponCard).join("")}</div>
    `;
  }

  if (products.length) {
    html += `
      ${coupons.length ? `<div class="divider mb-10"></div>` : ""}
      <h3 class="font-heading text-xl font-light mb-4 text-center" style="color:#374151;">
        ${coupons.length ? "Produtos" : escapeHtml(category)}
      </h3>
      <div class="grid grid-cols-2 gap-4">${products.map(productCard).join("")}</div>
    `;
  }

  html += `</div>`;
  return html;
}

async function initTabs() {
  const tabsEl = document.getElementById("tabs");
  const contentEl = document.getElementById("tabContent");

  const [couponsRes, productsRes] = await Promise.allSettled([
    fetch(COUPONS_JSON, { cache: "no-store" }).then(r => r.json()),
    fetch(PRODUCTS_JSON, { cache: "no-store" }).then(r => r.json()),
  ]);

  const coupons = couponsRes.status === "fulfilled" ? couponsRes.value : [];
  const products = productsRes.status === "fulfilled" ? productsRes.value : [];

  const couponsByCat = groupByCategory(coupons);
  const productsByCat = groupByCategory(products);

  const categories = Array.from(new Set([...couponsByCat.keys(), ...productsByCat.keys()]));

  const priority = ["Cupons Exclusivos", "Produtos Favoritos"];
  categories.sort((a, b) => {
    const ia = priority.indexOf(a);
    const ib = priority.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  if (!categories.length) {
    tabsEl.innerHTML = "";
    contentEl.innerHTML = `<p class="text-center text-sm" style="color:#9CA3AF;">Sem itens por enquanto.</p>`;
    return;
  }

  let active = categories[0];

  function render() {
    tabsEl.innerHTML = categories.map(cat => buildTabButton(cat, cat === active)).join("");
    tabsEl.querySelectorAll("button[data-tab]").forEach(btn => {
      btn.onclick = () => {
        active = btn.dataset.tab;
        render();
        contentEl.innerHTML = renderTabContent(active, couponsByCat, productsByCat);
      };
    });
    contentEl.innerHTML = renderTabContent(active, couponsByCat, productsByCat);
  }

  render();
}

document.addEventListener("DOMContentLoaded", () => {
  initDataTabs();
});
