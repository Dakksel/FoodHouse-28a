/* =====================================================
   FOOD HOUSE — menu data + cart + WhatsApp redirect
   ===================================================== */

const PHONE = "77051367685"; // international format, no "+"

/* ---------- 0. CONFIG ---------- */
const DELIVERY_THRESHOLD = 4000;  // ₸ — orders at or above this get free delivery
const DELIVERY_FEE       = 700;   // ₸ — charged when subtotal is below threshold

/* ---------- 1. MENU (extracted from photos/menu.jpg) ---------- */
const MENU = [
  /* ---- ДОНЕР ---- */
  {cat:"ДОНЕР", color:"yellow", items:[
    {name:"Донер тауық етінен", price:1690},
    {name:"Донер сиыр етінен", price:1790},
    {name:"Донер аралас", price:1790},
  ]},

  /* ---- ШАУРМА ---- */
  {cat:"ШАУРМА", color:"yellow", items:[
    {name:"Шаурма тауық етінен", price:1290},
    {name:"Шаурма сиыр етінен", price:1390},
    {name:"Шаурма аралас", price:1390},
  ]},

  /* ---- ТҮРІК ДОНЕРІ ---- */
  {cat:"ТҮРІК ДОНЕРІ", color:"yellow", items:[
    {name:"Түрік донері тауық етінен", price:1690},
    {name:"Түрік донері сиыр етінен", price:1790},
    {name:"Түрік донері аралас", price:1790},
  ]},

  /* ---- СНЕКЕТ ---- */
  {cat:"СНЕКЕТ", color:"red", items:[
    {name:"Фри картоп", price:890},
    {name:"Наггетстер", price:990},
    {name:"Картоп тілімдері", price:990},
    {name:"Стрипстер", price:1790},
  ]},

  /* ---- ХОТ-ДОГ ---- */
  {cat:"ХОТ-ДОГ", color:"red", items:[
    {name:"Хот-дог классикалық", price:890},
    {name:"Хот-дог Big", price:1090},
  ]},

  /* ---- STREET BOX ---- */
  {cat:"STREET BOX", color:"red", items:[
    {name:"Street Box", price:1990},
  ]},

  /* ---- БУРГЕР ---- */
  {cat:"БУРГЕР", color:"red", items:[
    {name:"Бургер классикалық", price:1690},
    {name:"Бургер Цезарь", price:1890},
    {name:"Бургер Италиялық", price:2390},
    {name:"Бургер Мексикалық", price:2390},
  ]},

  /* ---- ПИЦЦА ---- */
  {cat:"ПИЦЦА", color:"red", items:[
    {name:"Маргарита", price:2190},
    {name:"Пепперони", price:2490},
    {name:"Саңырауқұлақ қосылған тауық еті", price:2690},
    {name:"4 мезгіл", price:2790},
    {name:"Тартылған ет қосылған", price:2690},
    {name:"Тәтті", price:2590},
  ]},

  /* ---- ТВИСТЕР ---- */
  {cat:"ТВИСТЕР", color:"red", items:[
    {name:"Твистер", price:1690},
  ]},

  /* ---- ЧИКЕН ---- */
  {cat:"ЧИКЕН", color:"yellow", items:[
    {name:"Қанаттар 8 шт", price:2090},
    {name:"Қанаттар 15 шт", price:3490},
    {name:"Қанаттар 24 шт", price:5290},
  ]},
];

/* flatten into one items list with stable IDs */
const ITEMS = MENU.flatMap((group, gi) =>
  group.items.map((it, ii) => ({
    id:`${gi}-${ii}`,
    cat:group.cat,
    color:group.color || "red",
    name:it.name,
    price:it.price,
  }))
);

/* ---------- 2. STATE ---------- */
const state = {};   // subTotal, delivery, grand — populated by updateCart()
let cart = {};      // { id: qty }

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* ---------- 3. RENDER ---------- */
function renderChips(){
  const wrap = $("#cats");
  wrap.innerHTML = MENU.map((g,i)=>
    `<button class="cat-chip ${i===0?'active':''}" data-i="${i}">${g.cat}</button>`
  ).join("");
  wrap.addEventListener("click", e=>{
    const b = e.target.closest(".cat-chip"); if(!b) return;
    $$(".cat-chip").forEach(c=>c.classList.remove("active"));
    b.classList.add("active");
    const i = +b.dataset.i;
    document.getElementById(`cat-${i}`)?.scrollIntoView({behavior:"smooth",block:"start"});
  });
}

function renderMenu(){
  const wrap = $("#menu");
  wrap.innerHTML = MENU.map((g,gi)=>`
    <section class="cat-section" id="cat-${gi}" style="grid-column:1/-1">
      <h2 style="color:var(--red);border-bottom:2px solid var(--red);padding-bottom:6px;margin:18px 0 4px;letter-spacing:1px;text-transform:uppercase">${g.cat}</h2>
    </section>
    ${g.items.map((it,ii)=>{
      const item = ITEMS.find(x=>x.id===`${gi}-${ii}`);
      return `
        <div class="card">
          <div class="card-body">
            <h3>${item.name}</h3>
            <p class="desc">&nbsp;</p>
            <div class="price">${item.price.toLocaleString("ru-RU")} ₸</div>
            <div class="qty" data-id="${item.id}">
              <button class="minus" aria-label="Убрать">−</button>
              <span>0</span>
              <button class="plus" aria-label="Добавить">+</button>
            </div>
          </div>
        </div>`;
    }).join("")}
  `).join("");
}

/* ---------- 4. CART LOGIC ---------- */
function add(id){ cart[id] = (cart[id]||0) + 1; updateCart(); }
function sub(id){ if(!cart[id]) return; cart[id]--; if(cart[id]<=0) delete cart[id]; updateCart(); }

function updateCart(){
  /* counters on cards */
  $$(".qty").forEach(el=>{
    const id = el.dataset.id;
    el.querySelector("span").textContent = cart[id]||0;
  });

  /* top-bar badge + total */
  const count = Object.values(cart).reduce((a,b)=>a+b,0);
  const total = Object.entries(cart).reduce((sum,[id,q])=>{
    const it = ITEMS.find(x=>x.id===id); return sum + (it.price*q);
  },0);
  $("#cartBadge").textContent = count;
  $("#cartTotal").textContent = total.toLocaleString("ru-RU") + " ₸";

  /* drawer list */
  const list = $("#cartList");
  list.innerHTML = Object.entries(cart).map(([id,q])=>{
    const it = ITEMS.find(x=>x.id===id);
    return `<li>
      <span class="name">${it.name} × ${q}</span>
      <span class="price-col">${(it.price*q).toLocaleString("ru-RU")} ₸</span>
      <button class="rm" data-id="${id}" aria-label="Удалить">🗑</button>
    </li>`;
  }).join("");
  $("#emptyMsg").style.display = count?"none":"block";
  $("#orderForm").style.display = count?"block":"none";

  /* delivery fee */
  let fee = 0, hint = "", hintClass = "";
  if(total === 0){
    fee = 0; hint = "";
  } else if(total < DELIVERY_THRESHOLD){
    fee = DELIVERY_FEE;
    const need = DELIVERY_THRESHOLD - total;
    hint = `+${need.toLocaleString("ru-RU")} ₸ до бесплатной доставки`;
  } else {
    fee = 0;
    hint = "бесплатно 🎉";
    hintClass = "success";
  }
  $("#deliveryFee").textContent = fee ? `+${fee.toLocaleString("ru-RU")} ₸` : "бесплатно";
  $("#deliveryHint").textContent = hint;
  $("#deliveryHint").className = "hint-inline " + hintClass;

  const grand = total + fee;
  $("#subTotal").textContent = total.toLocaleString("ru-RU") + " ₸";
  $("#grandTotal").textContent = grand.toLocaleString("ru-RU") + " ₸";

  state.subTotal = total;
  state.delivery = fee;
  state.grand    = grand;
}

/* ---------- 5. DRAWER OPEN/CLOSE ---------- */
function openDrawer(){ $("#drawer").classList.add("on"); $("#overlay").classList.add("on"); }
function closeDrawer(){ $("#drawer").classList.remove("on"); $("#overlay").classList.remove("on"); }

/* ---------- 6. WHATSAPP REDIRECT ---------- */
function buildMessage(){
  const name = $("#custName").value.trim();
  const addr = $("#custAddress").value.trim();
  const gate = $("#custGate").value.trim();
  const pay  = $("#custPay").value;
  const note = $("#custNote").value.trim();

  if(!name || !addr){ alert("Пожалуйста, заполните имя и адрес доставки."); return null; }

  const lines = Object.entries(cart).map(([id,q])=>{
    const it = ITEMS.find(x=>x.id===id);
    return `• ${it.name} × ${q} — ${(it.price*q).toLocaleString("ru-RU")} ₸`;
  });

  const sub   = state.subTotal;
  const fee   = state.delivery;
  const grand = state.grand;
  const feeLine = fee ? `• Доставка: +${fee.toLocaleString("ru-RU")} ₸` : `• Доставка: бесплатно`;

  return [
    "   Новый заказ — Food House ",
    "",
    `  Имя: ${name}`,
    `  Адрес: ${addr}`,
    gate ? `  Домофон/этаж: ${gate}` : null,
    `  Оплата: ${pay}`,
    "",
    " Заказ: ",
    ...lines,
    "",
    ` Сумма: ${sub.toLocaleString("ru-RU")} ₸`,
    feeLine,
    `  Итого: ${grand.toLocaleString("ru-RU")} ₸ `,
    note ? `\nКомментарий: ${note}` : "",
  ].filter(Boolean).join("\n");
}

/* Удаляет любые эмодзи (в т.ч. набранные вручную в комментарии) из текста заказа */
function stripEmoji(text){
  return text
    // сами эмодзи (основной диапазон + доп. символы)
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, "")
    // модификаторы: variation selector, ZWJ, тон кожи, региональные буквы (флаги)
    .replace(/[\u{FE0F}\u{FE0E}\u{200D}\u{1F3FB}-\u{1F3FF}\u{1F1E6}-\u{1F1FF}]/gu, "")
    // подчищаем двойные пробелы, которые могли остаться на месте эмодзи
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ \n/g, "\n");
}

function sendToWhatsApp(){
  let msg = buildMessage();
  if(!msg) return;
  msg = stripEmoji(msg);
  const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

/* ---------- 7. EVENT WIRING ---------- */
function init(){
  renderChips();
  renderMenu();
  updateCart();

  /* click delegation for + / - */
  $("#menu").addEventListener("click", e=>{
    const q = e.target.closest(".qty"); if(!q) return;
    const id = q.dataset.id;
    if(e.target.classList.contains("plus")) add(id);
    else if(e.target.classList.contains("minus")) sub(id);
  });

  /* drawer */
  $("#cartBtn").addEventListener("click", openDrawer);
  $("#closeDrawer").addEventListener("click", closeDrawer);
  $("#overlay").addEventListener("click", closeDrawer);

  /* remove single line */
  $("#cartList").addEventListener("click", e=>{
    const b = e.target.closest(".rm"); if(!b) return;
    delete cart[b.dataset.id]; updateCart();
  });

  /* send */
  $("#sendBtn").addEventListener("click", sendToWhatsApp);
}

document.addEventListener("DOMContentLoaded", init);
