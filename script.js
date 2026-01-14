// =====================
// Maria Beauty - Tabs dinâmicas (Decap CMS)
// Lê:
//  - /data/coupons.json   => { items: [...] }
//  - /data/products.json  => { items: [...] }
// =====================

const COUPONS_JSON = "/data/coupons.json";
const PRODUCTS_JSON = "/data/products.json";

// ---------- helpers ----------
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function groupByCategory(items) {
  const map = new Map();
  (items || []).forEach((item) => {
    const cat = String(item?.category ?? "").trim();
    if (!cat) return;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(item);
  });
  return map;
}

async function loadItems(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.items) ? data.items : [];
}

// ---------- cards ----------
function couponCard(c) {
  const icon = c.icon ? escapeHtml(c.icon) : "🏷️";
  const brand = escapeHtml(c.brand || "");
  const desc = escapeHtml(c.description || "");
  const code = escapeHtml(c.code || "");
  const href = c.url ? c.url : "#";
  const target = c.url ? "_blank" : "_self";
  const rel = c.url ? "noopener noreferrer" : "";

  return `
    <a href="${href}" target="${target}" rel="${rel}"
      class="link-item block bg-white rounded-lg p-5 border"
      style="border-color:#E5E7EB;">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 flex-1">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
               style="background-color:#F9FAFB; color:#6B7280;">
            ${icon}
          </div>
          <div class="flex-1">
            <h3 class="font-medium text-sm mb-0.5" style="color:#1F2937;">${brand}</h3>
            <p class="text-xs" style="color:#9CA3AF;">${desc}</p>
          </div>
        </div>
        <div class="px-3 py-1.5 rounded-md text-xs font-medium"
             style="background-color:#F3F4F6; color:#4B5563;">
          ${code}
        </div>
      </div>
    </a>
  `;
}

function productCard(p) {
  const name = escapeHtml(p.name || "");
  const desc = escapeHtml(p.description || "");
  const url = p.url || "#";
  const img = p.image_url
    ? `<img src="${p.image_url}" alt="${name}" class="w-14 h-14 mx-auto mb-4 rounded-full object-cover" />`
    : `<div class="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
           style="background-color:#F9FAFB;">✨</div>`;

  return `
    <a href="${url}" target="_blank" rel="noopener noreferrer"
      class="product-card block bg-white rounded-lg p-5 border text-center"
      style="border-color:#E5E7EB;">
      ${img}
      <h3 class="font-medium text-sm mb-1" style="color:#1F2937;">${name}</h3>
      <p class="text-xs mb-3" style="color:#9CA3AF;">${desc}</p>
      <div class="text-xs" style="color:#6B7280;">Ver produto →</div>
    </a>
  `;
}

// ---------- tabs ----------
function tabButton(label, active) {
  const safe = escapeHtml(label);
  return `
    <button
      data-tab="${safe}"
      class="px-4 py-2 rounded-full border text-sm transition"
      style="border-color:#E5E7EB; background:${active ? "#111827" : "#FFFFFF"}; color:${active ? "#FFFFFF" : "#111827"};">
      ${safe}
    </button>
  `;
}

function renderTabContent(category, couponsByCat, productsByCat) {
  const coupons = couponsByCat.get(category) || [];
  const products = productsByCat.get(category) || [];

  let html = `<div>`;

  if (coupons.length) {
    html += `
      <h2 class="font-heading text-xl font-light mb-4 text-center" style="color:#374151;">
        ${escapeHtml(category)}
      </h2>
      <div class="space-y-3 mb-10">
        ${coupons.map(couponCard).join("")}
      </div>
    `;
  }

  if (products.length) {
    html += `
      ${coupons.length ? `<div class="divider mb-10"></div>` : ""}
      <h3 class="font-heading text-xl font-light mb-4 text-center" style="color:#374151;">
        ${coupons.length ? "Produtos" : escapeHtml(category)}
      </h3>
      <div class="grid grid-cols-2 gap-4">
        ${products.map(productCard).join("")}
      </div>
    `;
  }

  html += `</div>`;
  return html;
}

async function init() {
  const tabsEl = document.getElementById("tabs");
  const contentEl = document.getElementById("tabContent");

  // se não existir container, não faz nada
  if (!tabsEl || !contentEl) return;

  // carrega dados
  const [coupons, products] = await Promise.all([
    loadItems(COUPONS_JSON),
    loadItems(PRODUCTS_JSON),
  ]);

  const couponsByCat = groupByCategory(coupons);
  const productsByCat = groupByCategory(products);

  const categories = Array.from(
    new Set([...couponsByCat.keys(), ...productsByCat.keys()])
  );

  if (!categories.length) {
    tabsEl.innerHTML = "";
    contentEl.innerHTML = `<p class="text-center text-sm" style="color:#9CA3AF;">Sem itens por enquanto.</p>`;
    return;
  }

  // ordem preferida (se existir)
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
    tabsEl.innerHTML = categories.map((c) => tabButton(c, c === active)).join("");

    tabsEl.querySelectorAll("button[data-tab]").forEach((btn) => {
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

document.addEventListener("DOMContentLoaded", init);
