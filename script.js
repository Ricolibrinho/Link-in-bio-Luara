// =====================
// Maria Beauty - Seções separadas (Cupons / Produtos)
// Lê:
//  - /data/coupons.json   => { items: [...] }
//  - /data/products.json  => { items: [...] }
// =====================

const SUPABASE_URL = "https://yxeqmdivbcnsfkboyffk.supabase.co";
const SUPABASE_KEY = "sb_publishable_mRpYXGoElj8xB9f600jx2g_EHll3-WZ";

async function getCoupons() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/coupons?select=*&is_published=eq.true&order=created_at.desc`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return r.ok ? r.json() : [];
}

async function getProducts() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&is_published=eq.true&order=created_at.desc`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return r.ok ? r.json() : [];
}

// ---------- helpers ----------
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadItems(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.items) ? data.items : [];
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

// ---------- render ----------
function renderCouponsSection(container, couponsByCat) {
  const cats = Array.from(couponsByCat.keys());
  if (!cats.length) return "";

  // opcional: coloca "Cupons Exclusivos" primeiro
  cats.sort((a, b) => a.localeCompare(b));
  if (cats.includes("Cupons Exclusivos")) {
    cats.splice(cats.indexOf("Cupons Exclusivos"), 1);
    cats.unshift("Cupons Exclusivos");
  }

  return `
    <section class="mb-14">
      <h2 class="font-heading text-xl font-light mb-6 text-center" style="color:#374151;">
        Cupons Exclusivos
      </h2>

      ${cats
        .map((cat) => {
          const list = couponsByCat.get(cat) || [];
          if (!list.length) return "";
          return `
            <div class="mb-8">
              ${cat !== "Cupons Exclusivos"
                ? `<h3 class="text-sm font-medium mb-3 text-center" style="color:#6B7280;">${escapeHtml(cat)}</h3>`
                : ``
              }
              <div class="space-y-3">
                ${list.map(couponCard).join("")}
              </div>
            </div>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderProductsSection(container, productsByCat) {
  const cats = Array.from(productsByCat.keys());
  if (!cats.length) return "";

  cats.sort((a, b) => a.localeCompare(b));
  if (cats.includes("Produtos Favoritos")) {
    cats.splice(cats.indexOf("Produtos Favoritos"), 1);
    cats.unshift("Produtos Favoritos");
  }

  return `
    <section class="mb-6">
      <h2 class="font-heading text-xl font-light mb-6 text-center" style="color:#374151;">
        Produtos Favoritos
      </h2>

      ${cats
        .map((cat) => {
          const list = productsByCat.get(cat) || [];
          if (!list.length) return "";
          return `
            <div class="mb-8">
              ${cat !== "Produtos Favoritos"
                ? `<h3 class="text-sm font-medium mb-3 text-center" style="color:#6B7280;">${escapeHtml(cat)}</h3>`
                : ``
              }
              <div class="grid grid-cols-2 gap-4">
                ${list.map(productCard).join("")}
              </div>
            </div>
          `;
        })
        .join("")}
    </section>
  `;
}

async function init() {
  // você escolhe onde quer renderizar (um container único)
  const root = document.getElementById("dynamicContent");
  if (!root) return;

  const [coupons, products] = await Promise.all([
    loadItems(COUPONS_JSON),
    loadItems(PRODUCTS_JSON),
  ]);

  const couponsByCat = groupByCategory(coupons);
  const productsByCat = groupByCategory(products);

  const couponsHtml = renderCouponsSection(root, couponsByCat);
  const productsHtml = renderProductsSection(root, productsByCat);

  if (!couponsHtml && !productsHtml) {
    root.innerHTML = `<p class="text-center text-sm" style="color:#9CA3AF;">Sem itens por enquanto.</p>`;
    return;
  }

  root.innerHTML = `${couponsHtml}${couponsHtml && productsHtml ? `<div class="divider mb-10"></div>` : ""}${productsHtml}`;
}

document.addEventListener("DOMContentLoaded", init);
