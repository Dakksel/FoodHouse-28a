/* =====================================================
   FOOD HOUSE — панель оператора (наличие товаров)
   ===================================================== */

const $ = sel => document.querySelector(sel);

const auth      = firebase.auth();
const db        = firebase.firestore();
const STATUS_DOC = db.collection("status").doc("menu");

let currentUnavailable = new Set();
let unsubscribeStatus = null;

/* ---------- РЕНДЕР СПИСКА ---------- */
function renderItemsList(){
  const wrap = $("#itemsList");
  wrap.innerHTML = MENU.map((g, gi) => `
    <div class="admin-group">
      <h3 class="admin-group-title">${g.cat}</h3>
      ${g.items.map((it, ii) => {
        const item = ITEMS.find(x => x.id === `${gi}-${ii}`);
        const off = currentUnavailable.has(item.id);
        return `
          <label class="admin-item ${off ? 'is-off' : ''}">
            <span class="admin-item-name">${item.name}</span>
            <span class="admin-item-price">${item.price.toLocaleString("ru-RU")} ₸</span>
            <span class="admin-toggle">
              <input type="checkbox" data-id="${item.id}" ${off ? '' : 'checked'}>
              <span class="admin-toggle-label">${off ? 'Нет в наличии' : 'В наличии'}</span>
            </span>
          </label>`;
      }).join("")}
    </div>
  `).join("");
}

/* ---------- СОХРАНЕНИЕ ---------- */
async function toggleItem(id, available){
  const status = $("#saveStatus");
  status.textContent = "Сохранение…";
  try{
    await STATUS_DOC.set({
      unavailable: available
        ? firebase.firestore.FieldValue.arrayRemove(id)
        : firebase.firestore.FieldValue.arrayUnion(id)
    }, { merge: true });
    status.textContent = "Сохранено ✓ Клиенты увидят изменение сразу";
  } catch(err){
    console.error(err);
    status.textContent = "Ошибка сохранения. Проверьте интернет и попробуйте снова.";
  }
}

/* ---------- ИНИЦИАЛИЗАЦИЯ ПАНЕЛИ ---------- */
function initPanel(){
  if(unsubscribeStatus) unsubscribeStatus(); // не плодим подписки при повторном входе

  unsubscribeStatus = STATUS_DOC.onSnapshot(snap=>{
    const data = snap.exists ? snap.data() : {};
    currentUnavailable = new Set(data.unavailable || []);
    renderItemsList();
  }, err=>{
    console.error("Ошибка загрузки статуса:", err);
    $("#saveStatus").textContent = "Не удалось загрузить данные. Проверьте интернет.";
  });
}

/* ---------- ВХОД / ВЫХОД ---------- */
function showLogin(){
  $("#loginBox").style.display = "block";
  $("#panelBox").style.display = "none";
}
function showPanel(){
  $("#loginBox").style.display = "none";
  $("#panelBox").style.display = "block";
}

auth.onAuthStateChanged(user=>{
  if(user){
    showPanel();
    initPanel();
  } else {
    if(unsubscribeStatus){ unsubscribeStatus(); unsubscribeStatus = null; }
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

$("#itemsList").addEventListener("change", e=>{
  const cb = e.target.closest('input[type="checkbox"]');
  if(!cb) return;
  toggleItem(cb.dataset.id, cb.checked);
});

$("#logoutBtn").addEventListener("click", ()=> auth.signOut());
