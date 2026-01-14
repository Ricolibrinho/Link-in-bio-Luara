const SUPABASE_URL = "https://yxeqmdivbcnsfkboyffk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mRpYXGoElj8xB9f600jx2g_EHll3-WZ";

// evita "already been declared" mesmo se o script rodar 2x
window.__supabaseClient = window.__supabaseClient || window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const supabase = window.__supabaseClient;

// evita redeclarar também
window.__$ = window.__$ || ((id) => document.getElementById(id));
const $ = window.__$;

console.log("admin.js carregou", new Date().toISOString());

// =======================
// SESSÃO / UI
// =======================
async function refreshSessionUI() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    $("loginCard").style.display = "block";
    $("panel").style.display = "none";
    return;
  }

  $("loginCard").style.display = "none";
  $("panel").style.display = "block";
  $("userInfo").textContent = "Logado como: " + session.user.email;
}

// =======================
// LOGIN / LOGOUT
// =======================
$("btnLogin").onclick = async () => {
  $("loginMsg").textContent = "Entrando...";

  const email = $("email").value.trim();
  const password = $("password").value.trim();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    $("loginMsg").textContent = error.message;
    return;
  }

  $("loginMsg").textContent = "";
  await refreshSessionUI();
  await loadCoupons();
  await loadProducts();
};

$("btnLogout").onclick = async () => {
  await supabase.auth.signOut();
  await refreshSessionUI();
};

// =======================
// CUPONS
// =======================
async function loadCoupons() {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    $("couponsList").innerHTML = `<div class="muted">${error.message}</div>`;
    return;
  }

  $("couponsList").innerHTML = data.map(c => `
    <div class="item">
      <b>${c.brand}</b> — ${c.description}<br>
      <span class="muted">Categoria: ${c.category} | Código: ${c.code}</span>
      <div class="actions">
        <button class="secondary" onclick="toggleCoupon(${c.id}, ${c.is_published})">
          ${c.is_published ? "Despublicar" : "Publicar"}
        </button>
        <button class="secondary" onclick="deleteCoupon(${c.id})">Apagar</button>
      </div>
    </div>
  `).join("");
}

$("btnAddCoupon").onclick = async () => {
  $("c_msg").textContent = "";

  const payload = {
    category: $("c_category").value.trim(),
    icon: $("c_icon").value.trim() || null,
    brand: $("c_brand").value.trim(),
    description: $("c_desc").value.trim(),
    code: $("c_code").value.trim(),
    url: $("c_url").value.trim() || null,
    is_published: $("c_pub").checked,
  };

  const { error } = await supabase.from("coupons").insert(payload);
  $("c_msg").textContent = error ? error.message : "Cupom salvo!";
  if (!error) loadCoupons();
};

window.deleteCoupon = async (id) => {
  await supabase.from("coupons").delete().eq("id", id);
  loadCoupons();
};

window.toggleCoupon = async (id, current) => {
  await supabase.from("coupons").update({ is_published: !current }).eq("id", id);
  loadCoupons();
};

// =======================
// PRODUTOS
// =======================
async function loadProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    $("productsList").innerHTML = `<div class="muted">${error.message}</div>`;
    return;
  }

  $("productsList").innerHTML = data.map(p => `
    <div class="item">
      <b>${p.name}</b> — ${p.description}<br>
      <span class="muted">Categoria: ${p.category}</span>
      <div class="actions">
        <button class="secondary" onclick="toggleProduct(${p.id}, ${p.is_published})">
          ${p.is_published ? "Despublicar" : "Publicar"}
        </button>
        <button class="secondary" onclick="deleteProduct(${p.id})">Apagar</button>
      </div>
    </div>
  `).join("");
}

$("btnAddProduct").onclick = async () => {
  $("p_msg").textContent = "";

  const payload = {
    category: $("p_category").value.trim(),
    image_url: $("p_image").value.trim() || null,
    name: $("p_name").value.trim(),
    description: $("p_desc").value.trim(),
    url: $("p_url").value.trim(),
    is_published: $("p_pub").checked,
  };

  const { error } = await supabase.from("products").insert(payload);
  $("p_msg").textContent = error ? error.message : "Produto salvo!";
  if (!error) loadProducts();
};

window.deleteProduct = async (id) => {
  await supabase.from("products").delete().eq("id", id);
  loadProducts();
};

window.toggleProduct = async (id, current) => {
  await supabase.from("products").update({ is_published: !current }).eq("id", id);
  loadProducts();
};

// =======================
// INIT
// =======================
refreshSessionUI().then(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    loadCoupons();
    loadProducts();
  }
});
