/* Справочники: типы отчётов, категории, блоки, темы, раскладка по умолчанию.
   Часть генератора отчётов. Скрипты подключаются по порядку в index.html. */

/* ---- ресурсы ---- */
const LOGO_LEFT  = "assets/img/logo-left.png";
const LOGO_RIGHT = "assets/img/logo-right.png";

/* Конфигурация типов отчётов. dual=true — значения вида «35 (15)»: всего (верифицировано/передано) */
const TYPES = {
  ivn:{ label:"ИВН", title:"Еженедельный отчёт по работе ИВН", subtitle:"", dual:false,
    cats:[
      {id:"phone", name:"Телефон",              hex:"#2563eb"},
      {id:"smoke", name:"Курение",              hex:"#f97316"},
      {id:"dbelt", name:"Ремень водителя",      hex:"#8a94a6"},
      {id:"pbelt", name:"Ремень пассажира",     hex:"#f5b301"},
      {id:"disc",  name:"Нарушение дисциплины", hex:"#38bdf8"},
      {id:"sabot", name:"Саботаж камеры",       hex:"#22c55e"},
      {id:"dirt",  name:"Загрязнение камеры",   hex:"#a16207"}
    ], totalCats:null, catsOff:["dirt"] },
  osp:{ label:"ОСП (мониторинг)", title:"Еженедельный отчёт службы мониторинга", subtitle:"", dual:true,
    cats:[
      {id:"ut",    name:"Утомлённость водителя",   hex:"#8a5cf6"},
      {id:"sab",   name:"Саботаж",                 hex:"#22c55e"},
      {id:"att",   name:"Отвлечение внимания",     hex:"#38bdf8"},
      {id:"dbelt", name:"Ремень водителя",         hex:"#8a94a6"},
      {id:"pbelt", name:"Ремень пассажира",        hex:"#f5b301"},
      {id:"phone", name:"Использование телефона",  hex:"#2563eb"},
      {id:"ncal",  name:"Некорректная калибровка", hex:"#f97316"},
      {id:"ocal",  name:"Отсутствие калибровки",   hex:"#e05677"}
    ], totalCats:null, catsOff:[] },
  kru_s:{ label:"КРУ — Самосвалы", title:"Еженедельный отчёт службы мониторинга", subtitle:"Самосвалы", dual:true,
    cats:[
      {id:"ut",    name:"Утомлённость водителя",     hex:"#8a5cf6"},
      {id:"att",   name:"Отвлечение внимания",       hex:"#38bdf8"},
      {id:"ocal",  name:"Отсутствует калибровка",    hex:"#e05677"},
      {id:"ncal",  name:"Некорректная калибровка",   hex:"#f97316"},
      {id:"sab",   name:"Кол-во саботажей",          hex:"#22c55e"},
      {id:"droad", name:"Загрязнение дорожной камеры", hex:"#a16207"},
      {id:"dcirc", name:"Загрязнение круговой камеры", hex:"#2563eb"}
    ], totalCats:null, catsOff:[] },
  kru_e:{ label:"КРУ — Экскаваторы", title:"Еженедельный отчёт службы мониторинга", subtitle:"Экскаваторы", dual:true,
    cats:[
      {id:"sabv",    name:"Саботаж вод. камеры — всего",   hex:"#22c55e"},
      {id:"sabver",  name:"Саботаж вод. камеры — вериф.",  hex:"#0e9f6e"},
      {id:"dirtv",   name:"Загрязнение камеры — всего",    hex:"#a16207"},
      {id:"dirtver", name:"Загрязнение камеры — вериф.",   hex:"#f5b301"}
    ], totalCats:["sabv","dirtver"], catsOff:[] }
};
let CATS = TYPES.ivn.cats; // категории активного типа (переназначается при переключении)
const BLOCKS = [
  {id:"kpi",      name:"Ключевые показатели"},
  {id:"table",    name:"Таблица «Общие данные»"},
  {id:"donut",    name:"Диаграмма по категориям"},
  {id:"bars",     name:"Соотношение между площадками"},
  {id:"requests", name:"Заявки: таблица"},
  {id:"reqpies",  name:"Заявки: пироги по месяцам"},
  {id:"summary",  name:"Сводка по годам"},
  {id:"trend",    name:"Тренд по неделям"}
];
const THEMES = {
  corporate:{ name:"Корпоративный синий", swatch:["#0f3b63","#1878c2","#f5b301"],
    vars:{"--r-page":"#ffffff","--r-card":"#ffffff","--r-border":"#dde5ec","--r-ink":"#1c2733","--r-muted":"#5b6b7b",
      "--r-head":"#0f3b63","--r-accent":"#1878c2","--r-th-bg":"#0f3b63","--r-th-fg":"#ffffff","--r-zebra":"#f6f9fc",
      "--r-total":"#e8f1f8","--r-kpi":"linear-gradient(180deg,#f7fafc,#eef4f9)","--r-rule":"#0f3b63"},
    chart:{axis:"#8a97a5",grid:"#eef2f6",label:"#3c4a58",head:"#0f3b63",muted:"#5b6b7b",accent:"#1878c2",base:"#dde5ec"}},
  minimal:{ name:"Минимализм", swatch:["#111827","#0ea5e9","#e5e7eb"],
    vars:{"--r-page":"#ffffff","--r-card":"#ffffff","--r-border":"#eceff3","--r-ink":"#1f2937","--r-muted":"#6b7280",
      "--r-head":"#111827","--r-accent":"#0ea5e9","--r-th-bg":"#f3f4f6","--r-th-fg":"#374151","--r-zebra":"#fafbfc",
      "--r-total":"#f3f4f6","--r-kpi":"#fafafa","--r-rule":"#e5e7eb"},
    chart:{axis:"#9ca3af",grid:"#f3f4f6",label:"#4b5563",head:"#111827",muted:"#6b7280",accent:"#0ea5e9",base:"#e5e7eb"}},
  dark:{ name:"Тёмный", swatch:["#0f1b2a","#4db3ff","#16283c"],
    vars:{"--r-page":"#0f1b2a","--r-card":"#16283c","--r-border":"#24405c","--r-ink":"#e6eef6","--r-muted":"#9db2c6",
      "--r-head":"#ffffff","--r-accent":"#4db3ff","--r-th-bg":"#0e4a75","--r-th-fg":"#eaf4fc","--r-zebra":"#1a3049",
      "--r-total":"#0e4a75","--r-kpi":"#1a3049","--r-rule":"#4db3ff"},
    chart:{axis:"#86a3bd",grid:"#24405c",label:"#c9dcee",head:"#ffffff",muted:"#9db2c6",accent:"#4db3ff",base:"#24405c"}},
  graphite:{ name:"Графит + оранжевый", swatch:["#263238","#f97316","#f7f7f7"],
    vars:{"--r-page":"#ffffff","--r-card":"#ffffff","--r-border":"#e4e7ea","--r-ink":"#263238","--r-muted":"#607080",
      "--r-head":"#263238","--r-accent":"#f97316","--r-th-bg":"#263238","--r-th-fg":"#ffffff","--r-zebra":"#f7f8f9",
      "--r-total":"#fff1e6","--r-kpi":"#fff7ed","--r-rule":"#f97316"},
    chart:{axis:"#90a0ae","grid":"#f0f2f4",label:"#37474f",head:"#263238",muted:"#607080",accent:"#f97316",base:"#e4e7ea"}},
  navy:{ name:"Штаб (синий + золото)", swatch:["#123a5e","#d9a306","#f2f5f8"],
    vars:{"--r-page":"#eef2f7","--r-card":"#ffffff","--r-border":"#e3eaf1","--r-card-bw":"0px","--r-card-sh":"0 2px 10px rgba(18,58,94,.10)",
      "--r-ink":"#1b2b3a","--r-muted":"#5d7186","--r-head":"#123a5e","--r-accent":"#c99005","--r-th-bg":"#123a5e","--r-th-fg":"#ffffff",
      "--r-zebra":"#f4f7fa","--r-total":"#fdf3d7","--r-kpi":"linear-gradient(180deg,#ffffff,#f2f6fa)","--r-rule":"#123a5e"},
    chart:{axis:"#8296aa",grid:"#edf1f6",label:"#33475c",head:"#123a5e",muted:"#5d7186",accent:"#c99005",base:"#dfe6ee"}},
  print:{ name:"Ч/б печать", swatch:["#222222","#777777","#dddddd"],
    vars:{"--r-page":"#ffffff","--r-card":"#ffffff","--r-border":"#cfcfcf","--r-radius":"3px","--r-ink":"#1a1a1a","--r-muted":"#666666",
      "--r-head":"#000000","--r-accent":"#333333","--r-th-bg":"#2b2b2b","--r-th-fg":"#ffffff","--r-zebra":"#f4f4f4",
      "--r-total":"#e8e8e8","--r-kpi":"#f6f6f6","--r-rule":"#000000"},
    chart:{axis:"#8c8c8c",grid:"#ececec",label:"#333333",head:"#000000",muted:"#666666",accent:"#444444",base:"#cfcfcf"},
    catColors:["#1f1f1f","#575757","#8a8a8a","#b5b5b5","#3b3b3b","#6f6f6f","#9f9f9f","#cccccc"]}
};
/* цвет категории с учётом темы (например, ч/б палитра) */
function catHex(c,i){
  const o=THEMES[S.theme].catColors;
  return o ? o[i%o.length] : c.hex;
}
/* тёмный или светлый текст поверх цвета */
function txtOn(hex){
  const h=hex.replace("#",""); const r=parseInt(h.substr(0,2),16),g=parseInt(h.substr(2,2),16),b=parseInt(h.substr(4,2),16);
  return (0.299*r+0.587*g+0.114*b)/255 > 0.62 ? "#1c2733" : "#ffffff";
}
/* row — номер строки; ord — порядок в строке; w — ширина (доля, %);
   hw — вес высоты для «резиновых» строк с графиками (0 = высота по содержимому) */
const DEF_LAYOUT = {
  kpi:  {row:1, ord:1, w:100, hw:0},
  table:{row:2, ord:1, w:58,  hw:0},
  donut:{row:2, ord:2, w:42,  hw:0},
  bars: {row:3, ord:1, w:100, hw:3},
  trend:{row:4, ord:1, w:100, hw:2}
};
