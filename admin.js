/* =====================================================
   FOOD HOUSE — панель администратора (наличие + цены)
   Требует роль "admin" в коллекции roles/{uid}
   ===================================================== */

const $ = sel => document.querySelector(sel);

const auth        = firebase.auth();
const db          = firebase.firestore();
const STATUS_DOC  = db.collection("status").doc("menu");
const PRICING_DOC = db.collection("pricing").doc("menu");

let currentUnavailable = new Set();
let currentOverrides   = {};
let unsubStatus  = null;
let unsubPricing = null;

/* ---------- РЕНДЕР: НАЛИЧИЕ ---------- */
function renderAvailability(){
  const wrap = $("#availList");
  wrap.innerHTML = MENU.map((g, gi) => `
    <div class="admin-group">
      <h3 class="admin-group-title">${g.cat}</h3>
      ${g.items.map((it, ii) => {
        const item = ITEMS.find(x => x.id === `${gi}-${ii}`);
        const off = currentUnavailable.has(item.id);
        return `
          <label class="admin-item ${off ? 'is-off' : ''}">
            <span class="admin-item-name">${item.name}</span>
            <span class="admin-toggle">
              <input type="checkbox" class="avail-cb" data-id="${item.id}" ${off ? '' : 'checked'}>
              <span class="admin-toggle-label">${off ? 'Нет в наличии' : 'В наличии'}</span>
            </span>
          </label>`;
      }).join("")}
    </div>
  `).join("");
}

/* ---------- РЕНДЕР: ЦЕНЫ ---------- */
function renderPricing(){
  const wrap = $("#priceList");
  wrap.innerHTML = MENU.map((g, gi) => `
    <div class="admin-group">
      <h3 class="admin-group-title">${g.cat}</h3>
      ${g.items.map((it, ii) => {
        const item = ITEMS.find(x => x.id === `${gi}-${ii}`);
        const current = currentOverrides[item.id] ?? item.price;
        return `
          <div class="admin-price-row">
            <span class="admin-item-name">${item.name}</span>
            <input type="number" class="admin-price-input" data-id="${item.id}" value="${current}" min="1" step="10">
            <span class="admin-price-currency">₸</span>
            <button class="admin-price-save" data-id="${item.id}">Сохранить</button>
          </div>`;
      }).join("")}
    </div>
  `).join("");
}

/* ---------- СОХРАНЕНИЕ ---------- */
async function toggleAvailability(id, available){
  const status = $("#saveStatus");
  status.textContent = "Сохранение…";
  try{
    await STATUS_DOC.set({
      unavailable: available
        ? firebase.firestore.FieldValue.arrayRemove(id)
        : firebase.firestore.FieldValue.arrayUnion(id)
    }, { merge: true });
    status.textContent = "Сохранено ✓";
  }catch(e){
    console.error(e);
    status.textContent = "Ошибка сохранения наличия.";
  }
}

async function savePrice(id, rawValue){
  const status = $("#saveStatus");
  const price = Number(rawValue);
  if(!price || price <= 0){
    status.textContent = "Введите корректную цену (больше 0).";
    return;
  }
  status.textContent = "Сохранение…";
  try{
    await PRICING_DOC.set({
      overrides: { [id]: price }
    }, { merge: true });
    status.textContent = "Цена сохранена ✓ Обновится у всех клиентов мгновенно";
  }catch(e){
    console.error(e);
    status.textContent = "Ошибка сохранения цены.";
  }
}

/* ---------- ИНИЦИАЛИЗАЦИЯ ПАНЕЛИ ---------- */
function initPanel(){
  if(unsubStatus)  unsubStatus();
  if(unsubPricing) unsubPricing();

  unsubStatus = STATUS_DOC.onSnapshot(snap=>{
    const data = snap.exists ? snap.data() : {};
    currentUnavailable = new Set(data.unavailable || []);
    renderAvailability();
  }, err=>{
    console.error(err);
    $("#saveStatus").textContent = "Не удалось загрузить наличие.";
  });

  unsubPricing = PRICING_DOC.onSnapshot(snap=>{
    const data = snap.exists ? snap.data() : {};
    currentOverrides = data.overrides || {};
    renderPricing();
  }, err=>{
    console.error(err);
    $("#saveStatus").textContent = "Не удалось загрузить цены.";
  });
}

/* ---------- ВХОД / ВЫХОД + ПРОВЕРКА РОЛИ ---------- */
function showLogin(){
  $("#loginBox").style.display = "block";
  $("#panelBox").style.display = "none";
}
function showPanel(){
  $("#loginBox").style.display = "none";
  $("#panelBox").style.display = "block";
}

async function checkRoleAndInit(user){
  try{
    const roleSnap = await db.collection("roles").doc(user.uid).get();
    const role = roleSnap.exists ? roleSnap.data().role : null;
    if(role !== "admin"){
      $("#loginError").textContent = "У этого аккаунта нет прав администратора.";
      await auth.signOut();
      return;
    }
    showPanel();
    initPanel();
  }catch(e){
    console.error(e);
    $("#loginError").textContent = "Ошибка проверки доступа.";
    await auth.signOut();
  }
}

auth.onAuthStateChanged(user=>{
  if(user){
    checkRoleAndInit(user);
  } else {
    if(unsubStatus){  unsubStatus();  unsubStatus  = null; }
    if(unsubPricing){ unsubPricing(); unsubPricing = null; }
    showLogin();
  }
});

$("#loginBtn").addEventListener("click", async ()=>{
  const email = $("#opEmail").value.trim();
  const pass  = $("#opPass").value;
  const err   = $("#loginError");
  err.textContent = "";
  if(!email || !pass){ err.textContent = "Заполните email и пароль."; return; }
  try{
    await auth.signInWithEmailAndPassword(email, pass);
  }catch(e){
    err.textContent = "Неверный email или пароль.";
  }
});
$("#opPass").addEventListener("keydown", e=>{
  if(e.key === "Enter") $("#loginBtn").click();
});

$("#logoutBtn").addEventListener("click", ()=> auth.signOut());

/* ---------- СОБЫТИЯ: НАЛИЧИЕ ---------- */
$("#availList").addEventListener("change", e=>{
  const cb = e.target.closest(".avail-cb");
  if(!cb) return;
  toggleAvailability(cb.dataset.id, cb.checked);
});

/* ---------- СОБЫТИЯ: ЦЕНЫ ---------- */
$("#priceList").addEventListener("click", e=>{
  const btn = e.target.closest(".admin-price-save");
  if(!btn) return;
  const input = document.querySelector(`.admin-price-input[data-id="${btn.dataset.id}"]`);
  savePrice(btn.dataset.id, input.value);
});

/* ---------- ВКЛАДКИ ---------- */
document.querySelectorAll(".admin-tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".admin-tab").forEach(b=>b.classList.remove("is-active"));
    btn.classList.add("is-active");
    $("#availTab").style.display = btn.dataset.tab === "avail" ? "block" : "none";
    $("#priceTab").style.display  = btn.dataset.tab === "price" ? "block" : "none";
  });
});
