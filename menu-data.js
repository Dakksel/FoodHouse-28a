/* =====================================================
   FOOD HOUSE — общие данные меню
   Используется и на сайте (script.js), и в панели оператора (operator.js)
   ===================================================== */
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
