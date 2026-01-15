// =====================
// CONFIGURAÇÃO SUPABASE
// =====================
const SUPABASE_URL = "https://yxeqmdivbcnsfkboyffk.supabase.co";
const SUPABASE_KEY = "sb_publishable_mRpYXGoElj8xB9f600jx2g_EHll3-WZ";

// =====================
// UTILIDADES
// =====================
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeUrl(url) {
  let u = (url || "").trim();
  if (!u) return "";
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    u = "https://" + u;
  }
  return u;
}

// =====================
// FETCH SUPABASE
// =====================
async function getCoupons() {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/coupons?select=*&is_published=eq.true&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  return r.ok ? r.json() : [];
}

async function getProducts() {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=*&is_published=eq.true&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  return r.ok ? r.json() : [];
}

// =====================
// COMPONENTES (CARDS)
// =====================
function couponCard(c) {
  const icon = c.icon ? escapeHtml(c.icon) : "🏷️";
  const brand = escapeHtml(c.brand || "");
  const desc = escapeHtml(c.description || "");
  const code = escapeHtml(c.code || "");
  const category = escapeHtml(c.category || "");
  const url = normalizeUrl(c.url);

  return `
    <a href="${url || "#"}" target="_blank" rel="noopener noreferrer"
      class="block bg-white rounded-lg p-5 border"
      style="border-color:#E5E7EB; border-radius:28px; background-color:#FAF3EF; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.226);
      ">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 flex-1">
          <div class="w-14 h-14 rounded-full flex items-center justify-center text-lg"
               style="background-color:#F9FAFB; color:#6B7280;">
            ${icon}
          </div>
          <div class="flex-1">
            ${category ? `<p class="text-xs mb-1" style="color:#32363D;">${category}</p>` : ""}
            <h3 class="font-medium text-sm mb-0.5" style="color:#32363D;">${brand}</h3>
            <p class="text-xs" style="color:#9CA3AF;">${desc}</p>
          </div>
        </div>
        <div class="px-3 py-1.5 rounded-md text-xs font-medium"
             style="border-radius:28px; background-color:#32363D; color:#ffffff;">
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
  const url = normalizeUrl(p.url);

  const img = p.image_url
    ? `<img src="${p.image_url}" alt="${name}" class="w-14 h-14 mx-auto mb-4 rounded-full object-cover" />`
    : `<div class="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
         style="background-color:#F9FAFB;">✨</div>`;

  return `
    <div class="bg-white rounded-lg p-5 border text-center"
      style="border-color:#E5E7EB; border-radius:28px; background-color:#FAF3EF; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.226);">
      ${img}
      ${category ? `<p class="text-xs mb-1" style="color:#32363D;">${category}</p>` : ""}
      <h3 class="font-medium text-sm mb-1" style="color:#1F2937;">${name}</h3>
      <p class="text-xs mb-3" style="color:#9CA3AF;">${desc}</p>
      ${url ? `
        <a href="${url}" target="_blank" rel="noopener noreferrer"
           class="text-xs inline-block"
           style="color:#6B7280;">
          Ver produto →
        </a>` : ""}
    </div>
  `;
}

// =====================
// RENDER
// =====================
function renderSection(title, contentHtml) {
  return `
    <section class="mb-14">
      <h2 class="text-xl font-light mb-6 text-center" style="color:#374151;">
        ${escapeHtml(title)}
      </h2>
      ${contentHtml}
    </section>
  `;
}

async function init() {
  const root = document.getElementById("dynamicContent");
  if (!root) return;

  const [coupons, products] = await Promise.all([getCoupons(), getProducts()]);

  const couponsHtml = coupons.length
    ? renderSection(
        "Cupons Exclusivos",
        `<div class="space-y-4">${coupons.map(couponCard).join("")}</div>`
      )
    : "";

  const productsHtml = products.length
    ? renderSection(
        "Produtos Favoritos",
        `<div class="grid grid-cols-2 gap-4">${products.map(productCard).join("")}</div>`
      )
    : "";

  if (!couponsHtml && !productsHtml) {
    root.innerHTML = `<p class="text-center text-sm" style="color:#9CA3AF;">Sem itens por enquanto.</p>`;
    return;
  }

  root.innerHTML = `
    ${couponsHtml}
    ${couponsHtml && productsHtml ? `<div class="my-10"></div>` : ""}
    ${productsHtml}
  `;
}

// =====================
// EFEITO VISUAL (FLORES)
// =====================
function initFlowers() {
  const container = document.getElementById("flower-container");
  if (!container) return;

  const total = 30;
  for (let i = 0; i < total; i++) {
    const flower = document.createElement("div");
    flower.className = "flower";
    flower.innerText = "🌸";
    flower.style.left = `${Math.random() * 100}%`;
    flower.style.animationDelay = `${Math.random() * 10}s`;
    flower.style.animationDuration = `${5 + Math.random() * 10}s`;
    flower.style.fontSize = `${15 + Math.random() * 20}px`;
    container.appendChild(flower);
  }
}

// =====================
// START
// =====================
document.addEventListener("DOMContentLoaded", () => {
  initFlowers();
  init();
});
