(() => {
  // ====== CONFIG ======
  const SUPABASE_URL = "https://yxeqmdivbcnsfkboyffk.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_mRpYXGoElj8xB9f600jx2g_EHll3-WZ";

  // cria 1x e reaproveita
  if (!window.__sb) {
    window.__sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  const sb = window.__sb;

  const $ = (id) => document.getElementById(id);

  // ====== FLOWERS ANIMATION ======

  const container = document.getElementById('flower-container');
  const totalFlores = 30; // Altere este número para a quantidade que desejar!

  for (let i = 0; i < totalFlores; i++) {
      const flower = document.createElement('div');
      flower.className = 'flower';
      flower.innerText = '🌸';
      
      // Gera valores aleatórios para cada flor
      const left = Math.random() * 100;           // Posição horizontal (0 a 100%)
      const delay = Math.random() * 10;          // Atraso para começar (0 a 10s)
      const duration = 5 + Math.random() * 10;   // Velocidade da queda (5 a 15s)
      const size = 15 + Math.random() * 20;      // Tamanho da flor (15px a 35px)

      flower.style.left = `${left}%`;
      flower.style.animationDelay = `${delay}s`;
      flower.style.animationDuration = `${duration}s`;
      flower.style.fontSize = `${size}px`;

      container.appendChild(flower);
  }


  // ====== UI / SESSION ======
  async function refreshSessionUI() {
    const { data: { session } } = await sb.auth.getSession();

    if (!session) {
      $("loginCard").style.display = "block";
      $("panel").style.display = "none";
      return;
    }

    $("loginCard").style.display = "none";
    $("panel").style.display = "block";
    $("userInfo").textContent = "Logado como: " + session.user.email;
  }

  // ====== LOGIN / LOGOUT ======
  $("btnLogin").addEventListener("click", async (e) => {
    e.preventDefault();

    $("loginMsg").textContent = "Entrando...";

    const email = $("email").value.trim();
    const password = $("password").value.trim();

    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      $("loginMsg").textContent = error.message;
      return;
    }

    $("loginMsg").textContent = "";
    await refreshSessionUI();
    await loadCoupons();
    await loadProducts();
  });

  $("btnLogout").addEventListener("click", async () => {
    await sb.auth.signOut();
    await refreshSessionUI();
  });

  // ====== COUPONS ======
  async function loadCoupons() {
    const { data, error } = await sb
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      $("couponsList").innerHTML = `<div class="muted">${error.message}</div>`;
      return;
    }

    $("couponsList").innerHTML = data.map(c => `
      <div class="item" style="box-sizing: border-box;">
        <div><b>${c.brand}</b> — ${c.description}</div>
        <div class="muted">Categoria: ${c.category}</div> 
        <div class="muted">Cupom: <b>${c.code}</b> | Publicado: ${c.is_published}</div>
        <div class="actions">
          <button class="secondary" data-act="toggleCoupon" data-id="${c.id}" data-cur="${c.is_published}">
            ${c.is_published ? "Despublicar" : "Publicar"}
          </button>
          <button class="secondary" data-act="deleteCoupon" data-id="${c.id}">Apagar</button>
        </div>
      </div>
    `).join("");
  }

  $("btnAddCoupon").addEventListener("click", async () => {
    $("c_msg").textContent = "";

    const payload = {
      category: $("c_category").value.trim(),
      icon: $("c_icon").value.trim() || null,
      brand: $("c_brand").value.trim(),
      description: $("c_desc").value.trim(),
      code: $("c_code").value.trim(),
      url: $("c_url").value.trim() || null,
      is_published: $("c_pub").checked
    };

    const { error } = await sb.from("coupons").insert(payload);
    const msgElement = $("c_msg");
    msgElement.textContent = error ? error.message : "Cupom salvo!";
    if (!error) 
        loadCoupons();


        document.getElementById('c_category').value = '';
        document.getElementById('c_icon').value = '';
        document.getElementById('c_brand').value = '';
        document.getElementById('c_code').value = '';
        document.getElementById('c_desc').value = '';
        document.getElementById('c_url').value = '';
        setTimeout(() => {
          msgElement.textContent = "";
        }, 3000);
  });

  // ====== PRODUCTS ======
  async function loadProducts() {
    const { data, error } = await sb
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      $("productsList").innerHTML = `<div class="muted">${error.message}</div>`;
      return;
    }

    $("productsList").innerHTML = data.map(p => `
      <div class="item" style="box-sizing: border-box;">
        <div><b>${p.name}</b> — ${p.description}</div>
        <div class="muted">Categoria: ${p.category} | Publicado: ${p.is_published}</div>
        <div class="actions">
          <button class="secondary" data-act="toggleProduct" data-id="${p.id}" data-cur="${p.is_published}">
            ${p.is_published ? "Despublicar" : "Publicar"}
          </button>
          <button class="secondary" data-act="deleteProduct" data-id="${p.id}">Apagar</button>
        </div>
      </div>
    `).join("");
  }

  $("btnAddProduct").addEventListener("click", async () => {
    $("p_msg").textContent = "";

    const payload = {
      category: $("p_category").value.trim(),
      image_url: $("p_image").value.trim() || null,
      name: $("p_name").value.trim(),
      description: $("p_desc").value.trim(),
      url: $("p_url").value.trim(),
      is_published: $("p_pub").checked
    };

    const { error } = await sb.from("products").insert(payload);
    const msgElement = $("c_msg");
    msgElement.textContent = error ? error.message : "Produto salvo";
    if (!error)
        loadProducts();
        document.getElementById('p_category').value = '';
        document.getElementById('p_image').value = '';
        document.getElementById('p_name').value = '';
        document.getElementById('p_desc').value = '';
        document.getElementById('p_url').value = '';
        setTimeout(() => {
          msgElement.textContent = "";
        }, 3000);
      
  });

  // ====== ACTIONS via event delegation (sem window.xxx) ======
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;

    const act = btn.dataset.act;
    const id = Number(btn.dataset.id);
    const cur = btn.dataset.cur === "true";

    if (act === "deleteCoupon") {
      await sb.from("coupons").delete().eq("id", id);
      return loadCoupons();
    }

    if (act === "toggleCoupon") {
      await sb.from("coupons").update({ is_published: !cur }).eq("id", id);
      return loadCoupons();
    }

    if (act === "deleteProduct") {
      await sb.from("products").delete().eq("id", id);
      return loadProducts();
    }

    if (act === "toggleProduct") {
      await sb.from("products").update({ is_published: !cur }).eq("id", id);
      return loadProducts();
    }
  });

  // ====== INIT ======
  refreshSessionUI().then(async () => {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      loadCoupons();
      loadProducts();
    }
  });
})();
