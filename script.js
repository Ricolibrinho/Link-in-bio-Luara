// =====================
// Maria Beauty - Site público (Supabase)
// =====================

const SUPABASE_URL = "https://yxeqmdivbcnsfkboyffk.supabase.co";
const SUPABASE_KEY = "sb_publishable_mRpYXGoElj8xB9f600jx2g_EHll3-WZ";

// ---------- fetch ----------
async function getCoupons() {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/coupons?select=*&is_published=eq.true&order=created_at.desc`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  return r.ok ? r.json() : [];
}

async function getProducts() {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=*&is_published=eq.true&order=created_at.desc`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
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

// ---------- cards ----------
function couponCard(c) {
  const icon = c.icon ? escapeHtml(c.icon) : "🏷️";
  const brand = escapeHtml(c.brand || "");
  const desc = escapeHtml(c.description || "");
  const code = escapeHtml(c.code || "");
  const category = escapeHtml(c.category || "");

  const href = c.url ? c.url : "#";
  const target = c.url ? "_blank" : "_self";
  const rel = c.url ? "noopener noreferrer" : "";

  // Card inteiro clicável (link do cupom)
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
            ${category ? `<p class="text-xs mb-1" style="color:#9CA3AF;">${category}</p>` : ``}
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
  const category = escapeHtml(p.category || "");
  const name = escapeHtml(p.name || "");
  const desc = escapeHtml(p.description || "");
  const url = p.url || "#";

  const img = p.image_url
    ? `<img src="${p.image_url}" alt="${name}" class="w-14 h-14 mx-auto mb-4 rounded-full object-cover" />`
    : `<div class="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
           style="background-color:#F9FAFB;">✨</div>`;

  // Card NÃO é link — só o botão "Ver produto →" é clicável
  return `
    <div class="product-card block bg-white rounded-lg p-5 border text-center"
      style="border-color:#E5E7EB;">
      ${img}
      ${category ? `<p class="text-xs mb-1" style="color:#9CA3AF;">${category}</p>` : ``}
      <h3 class="font-medium text-sm mb-1" style="color:#1F2937;">${name}</h3>
      <p class="text-xs mb-3" style="color:#9CA3AF;">${desc}</p>

      <a href="${url}" target="_blank" rel="noopener noreferrer"
         class="text-xs inline-block"
         style="color:#6B7280;">
        Ver produto →
      </a>
    </div>
  `;
}

// ---------- render ----------
function renderListSection(title, items, listHtml) {
  return `
    <section class="mb-14">
      <h2 class="font-heading text-xl font-light mb-6 text-center" style="color:#374151;">
        ${escapeHtml(title)}
      </h2>
      ${listHtml(items)}
    </section>
  `;
}

async function init() {
  const root = document.getElementById("dynamicContent");
  if (!root) return;

  const [coupons, products] = await Promise.all([getCoupons(), getProducts()]);

  const couponsHtml = (coupons && coupons.length)
    ? renderListSection("Cupons Exclusivos", coupons, (items) =>
        `<div class="space-y-4">${items.map(couponCard).join("")}</div>`
      )
    : "";

  const productsHtml = (products && products.length)
    ? renderListSection("Produtos Favoritos", products, (items) =>
        `<div class="grid grid-cols-2 gap-4">${items.map(productCard).join("")}</div>`
      )
    : "";

  if (!couponsHtml && !productsHtml) {
    root.innerHTML = `<p class="text-center text-sm" style="color:#9CA3AF;">Sem itens por enquanto.</p>`;
    return;
  }

  root.innerHTML = `${couponsHtml}${couponsHtml && productsHtml ? `<div class="divider mb-10"></div>` : ""}${productsHtml}`;
}

document.addEventListener("DOMContentLoaded", init);
