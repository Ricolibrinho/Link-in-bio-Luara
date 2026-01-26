// i18n loader (pt.json / de.json) + binder de IDs existentes
const DEFAULT_LANG = "pt";
let currentLang = DEFAULT_LANG;

function getLangFromUrl(){
  const p = new URLSearchParams(location.search);
  const lang = (p.get("lang") || "").toLowerCase();
  if (lang === "pt" || lang === "de") return lang;
  return null;
}

function setUrlLang(lang){
  const p = new URLSearchParams(location.search);
  p.set("lang", lang);
  const newUrl = location.pathname + "?" + p.toString() + location.hash;
  history.replaceState(null, "", newUrl);
}

function formatCurrency(value, locale, currency){
  try{
    return new Intl.NumberFormat(locale, { style:"currency", currency }).format(value);
  }catch(e){
    return currency + " " + String(value);
  }
}

function setPressed(lang){
  document.querySelectorAll("[data-lang-btn]").forEach(btn=>{
    const isActive = btn.getAttribute("data-lang-btn") === lang;
    btn.setAttribute("aria-pressed", isActive ? "true":"false");
  });
}

function setAllCheckoutLinks(url){
  document.querySelectorAll("[data-cta='checkout']").forEach(el=>{
    el.setAttribute("href", url);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "nofollow noopener");
  });
}

function setText(id, value){
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = (value ?? "");
}

function setHTML(id, value){
  const el = document.getElementById(id);
  if(!el) return;
  el.innerHTML = (value ?? "");
}

function clear(el){
  if(!el) return;
  while(el.firstChild) el.removeChild(el.firstChild);
}

function liText(text){
  const li = document.createElement("li");
  li.textContent = text;
  return li;
}

async function loadLang(lang){
  const file = (lang === "de") ? "de.json" : "pt.json";
  const res = await fetch("./" + file, { cache: "no-store" });
  if(!res.ok) throw new Error("Não foi possível carregar " + file);
  const data = await res.json();
  applyI18n(data);
  localStorage.setItem("lang", lang);
  setUrlLang(lang);
}

function applyI18n(data){
  currentLang = data?.meta?.lang || DEFAULT_LANG;

  // html attrs
  document.documentElement.lang = data?.meta?.locale || "pt-BR";
  document.documentElement.dataset.lang = currentLang;

  // title + brand
  setText("brandTitle", data?.content?.brandTitle || "");

  // hero
  setText("heroKicker", data?.content?.hero?.kicker || "");
  setText("heroHeadline", data?.content?.hero?.headline || "");
  setText("heroSubheadline", data?.content?.hero?.subheadline || "");

  // pricing
  const locale = data?.meta?.locale || "pt-BR";
  const currency = data?.meta?.currency || "EUR";
  const now = data?.pricing?.now ?? 20;
  const was = data?.pricing?.was ?? 98;

  setText("priceNow", formatCurrency(now, locale, currency));
  setText("priceWas", formatCurrency(was, locale, currency));
  setText("urgencyText", data?.pricing?.urgencyText || "");

  const checkoutUrl = data?.pricing?.ctaCheckoutUrl || "#";
  setAllCheckoutLinks(checkoutUrl);

  setText("ctaHeroPrimary", data?.content?.hero?.ctaPrimary || "Quero acesso agora");
  setText("ctaHeroSecondary", data?.content?.hero?.ctaSecondary || "Começar");

  // badges
  const badges = data?.content?.hero?.badges || [];
  setText("badge1", badges[0] || "");
  setText("badge2", badges[1] || "");
  setText("badge3", badges[2] || "");

  // images
  const productImg = document.getElementById("productImg");
  if(productImg){
    productImg.src = data?.assets?.images?.product || "";
    productImg.alt = data?.content?.product?.imageAlt || data?.content?.hero?.imageAlt || "";
  }
  setText("heroMiniNote", data?.content?.hero?.miniNote || "");

  // pain
  setText("painTitle", data?.content?.pain?.title || "");
  const painList = document.getElementById("painList");
  clear(painList);
  (data?.content?.pain?.text || []).forEach(t => painList.appendChild(liText(t)));

  // story
  setText("storyTitle", data?.content?.story?.title || "");
  setText("storyDavidLabel", data?.content?.story?.davidLabel || "David:");
  setText("storySarahLabel", data?.content?.story?.sarahLabel || "Sarah:");
  setText("storyDavid", data?.content?.story?.david || "");
  setText("storySarah", data?.content?.story?.sarah || "");
  setText("storyConclusion", data?.content?.story?.conclusion || "");

  // truth
  setText("truthTitle", data?.content?.truth?.title || "");
  const truthList = document.getElementById("truthList");
  clear(truthList);
  (data?.content?.truth?.items || []).forEach(t => truthList.appendChild(liText(t)));
  setText("truthClosing", data?.content?.truth?.closing || "");

  // product
  setText("productTitle", data?.content?.product?.title || "");
  setText("productDesc", data?.content?.product?.description || "");

  // includes
  setText("includesTitle", data?.content?.includes?.title || "");
  const includesList = document.getElementById("includesList");
  clear(includesList);
  (data?.content?.includes?.items || []).forEach(t => includesList.appendChild(liText(t)));

  // offer box
  setText("offerTitle", data?.content?.offer?.title || data?.content?.offerTitle || "Oferta");
  setText("ctaOffer", data?.content?.offer?.cta || data?.content?.cta?.primary || "Quero acesso agora");

  const valueBox = document.getElementById("valueBox");
  clear(valueBox);

  const breakdown = data?.content?.offer?.valueBreakdown || [];
  breakdown.forEach(line=>{
    const row = document.createElement("div");
    row.className = "valueLine";
    const parts = String(line).split("—");
    const l = (parts[0] || "").trim();
    const r = (parts[1] || "").trim();
    row.innerHTML = `<span>${(l || line)}</span><span>${(r || "")}</span>`;
    valueBox.appendChild(row);
  });

  const totalRow = document.createElement("div");
  totalRow.className = "valueTotal";
  totalRow.innerHTML = `<span>${data?.content?.offer?.totalLabel || "Valor total"}</span><span>${data?.content?.offer?.total || formatCurrency(was, locale, currency)}</span>`;
  valueBox.appendChild(totalRow);

  const nowRow = document.createElement("div");
  nowRow.className = "valueTotal";
  nowRow.style.marginTop = "8px";
  nowRow.innerHTML = `<span class="good">${data?.content?.offer?.priceNowLabel || "Hoje"}</span><span class="good">${formatCurrency(now, locale, currency)}</span>`;
  valueBox.appendChild(nowRow);

  // guarantee
  setText("guaranteeTitle", data?.content?.guarantee?.title || "");
  setText("guaranteeText", data?.content?.guarantee?.text || "");

  // faq
  setText("faqTitle", data?.content?.faq?.title || "");
  const faqList = document.getElementById("faqList");
  clear(faqList);
  (data?.content?.faq?.items || []).forEach(item=>{
    const d = document.createElement("details");
    const s = document.createElement("summary");
    s.textContent = item.q || "";
    const p = document.createElement("p");
    p.textContent = item.a || "";
    d.appendChild(s);
    d.appendChild(p);
    faqList.appendChild(d);
  });

  // final cta
  setText("ctaFinalTitle", data?.content?.ctaFinal?.title || "");
  setText("ctaFinalText", data?.content?.ctaFinal?.text || "");
  setText("ctaFinalBtn", data?.content?.ctaFinal?.cta || "Quero acesso agora");

  const ctaNotes = document.getElementById("ctaNotes");
  clear(ctaNotes);
  (data?.content?.ctaFinal?.notes || []).forEach(n=>{
    const li = document.createElement("li");
    li.textContent = n;
    ctaNotes.appendChild(li);
  });

  // footer
  setHTML("footerDisclaimer", data?.content?.footer?.disclaimer || "");
  setText("footerCopyright", data?.content?.footer?.copyright || "");

  // sticky
  setText("stickyMiniTop", data?.content?.sticky?.top || "");
  setText("stickyMiniPrice", formatCurrency(now, locale, currency));
  setText("stickyBtn", data?.content?.sticky?.cta || data?.content?.ctaFinal?.cta || "Quero acesso agora");

  // lang buttons pressed
  setPressed(currentLang);
}

// lang buttons
document.querySelectorAll("[data-lang-btn]").forEach(btn=>{
  btn.addEventListener("click", async ()=>{
    const lang = btn.getAttribute("data-lang-btn");
    try{ await loadLang(lang); }catch(e){ console.warn(e); }
  });
});

// init
(async function(){
  const urlLang = getLangFromUrl();
  const saved = localStorage.getItem("lang");
  const lang = urlLang || saved || DEFAULT_LANG;
  try{ await loadLang(lang); }
  catch(e){ console.warn(e); await loadLang(DEFAULT_LANG); }
})();  
