/* Состояние приложения: демо-данные, загрузка/сохранение, переключение типов, расчётные помощники.
   Часть генератора отчётов. Скрипты подключаются по порядку в index.html. */

/* ================= state ================= */
function demoState(type){
  type = TYPES[type] ? type : "ivn";
  const C = TYPES[type];
  const mkRows = (names, data, sys) => names.map((n,i)=>({name:n, systems:sys[i], override:null,
    values:Object.fromEntries(C.cats.map((c,j)=>[c.id, data[i][j]]))}));
  const tr = pairs => pairs.map(p=>({d:p[0], v:p[1]}));
  const S0 = {
    type:type,
    title:C.title, subtitle:C.subtitle,
    org:"ОСП «Автотранс»",
    start:"2026-07-20", end:"2026-07-26",
    theme:"corporate", density:0,
    layout: JSON.parse(JSON.stringify(DEF_LAYOUT)),
    catsOn:Object.fromEntries(C.cats.map(c=>[c.id, C.catsOff.indexOf(c.id)<0])),
    blocksOn:{kpi:true,table:true,donut:true,bars:true,requests:false,summary:false,trend:true},
    savedTemplates:[], custom:[],
    requests:{table:{head:["Управление","Поступило"],rows:[["",""]]}, months:[]},
    summary:{table:{head:["","2025","2026"],rows:[["Макс.","",""]]}},
    rows:[], trend:[]
  };
  if(type==="ivn"){
    S0.rows = mkRows(
      ["Кедровская АБ","Сартакинская АБ","Бачатская АБ","Краснобродская АБ","Вахрушевская АБ","Талдинская АБ","Калтанская АБ","УАТО"],
      [[0,0,1,33,0,0,0],[1,0,1,57,5,0,0],[3,1,6,55,0,0,0],[3,2,2,35,4,0,0],[0,0,1,41,0,0,0],[2,0,0,54,1,11,0],[2,0,0,43,2,0,0],[0,0,0,3,0,0,0]],
      [32,63,54,38,23,67,32,3]);
    S0.trend = tr([["18.01",889],["25.01",941],["01.02",832],["08.02",732],["15.02",852],["22.02",635],
      ["01.03",654],["08.03",624],["15.03",661],["22.03",570],["29.03",621],["05.04",586],
      ["12.04",587],["19.04",517],["26.04",492],["03.05",549],["10.05",482],["17.05",256],
      ["24.05",208],["31.05",218],["07.06",540],["14.06",277],["21.06",271],["28.06",175],
      ["05.07",185],["12.07",104],["19.07",199],["26.07",369]]);
  }
  if(type==="osp"){
    S0.title="Еженедельный отчёт службы мониторинга";
    S0.rows = mkRows(
      ["Кедровская АБ","Сартакинская АБ","Бачатская АБ","Краснобродская АБ","Вахрушевская АБ","Талдинская АБ","Калтанская АБ","УАТО"],
      [["0 (0)","0 (0)","3 (0)","1 (1)","33 (18)","0 (0)","1 (1)","6 (2)"],
       ["0 (0)","0 (0)","2 (1)","1 (0)","57 (43)","1 (0)","8 (7)","14 (12)"],
       ["1 (0)","0 (0)","2 (4)","6 (0)","55 (11)","3 (3)","9 (12)","19 (20)"],
       ["0 (0)","0 (0)","4 (5)","2 (0)","35 (26)","3 (5)","8 (10)","29 (29)"],
       ["0 (0)","0 (0)","2 (1)","1 (1)","41 (16)","0 (0)","4 (3)","1 (2)"],
       ["0 (1)","11 (0)","2 (4)","0 (1)","54 (20)","2 (0)","21 (19)","17 (13)"],
       ["0 (0)","0 (0)","1 (1)","0 (2)","43 (7)","2 (2)","9 (3)","7 (3)"],
       ["0 (0)","0 (0)","0 (0)","0 (0)","3 (1)","0 (0)","0 (0)","0 (0)"]],
      [32,63,54,38,23,67,32,3]);
    // «Кол-во событий» в исходном отчёте берётся из БД и не всегда равно сумме колонок — задаём как правку
    const ospTotals=["44 (22)","88 (63)","95 (50)","50 (89)","49 (22)","108 (58)","64 (18)","3 (1)"];
    S0.rows.forEach((r,i)=>{ r.override=ospTotals[i]; });
    S0.trend = tr([["11.01",1003],["18.01",998],["25.01",914],["01.02",819],["08.02",966],["15.02",738],
      ["22.02",755],["01.03",744],["08.03",773],["15.03",688],["22.03",743],["29.03",738],
      ["05.04",757],["12.04",715],["19.04",737],["26.04",596],["03.05",632],["10.05",431],
      ["17.05",331],["24.05",349],["31.05",686],["07.06",402],["14.06",424],["21.06",347],
      ["28.06",353],["05.07",248],["12.07",323],["19.07",323],["26.07",501]]);
    S0.blocksOn={kpi:true,table:true,donut:true,bars:false,requests:true,reqpies:true,summary:false,trend:true};
    S0.requests={
      table:{head:["Управление","Простои ч.","Июль: поступило","Июль: КРУ/ИТП","Июль: выполнено","Неделя: поступило","Неделя: КРУ/ИТП","Неделя: выполнено"],
        rows:[["Кедровская АБ","0","11","11","10","8","8","7"],
              ["Сартакинская АБ","0","2","2","2","0","0","0"],
              ["Бачатская АБ","0","4","4","4","3","3","3"],
              ["Краснобродская АБ","0","1","1","1","0","0","0"],
              ["Вахрушевская АБ","0","2","2","1","1","1","0"],
              ["Талдинская АБ","0","2","2","2","1","1","1"],
              ["Калтанская АБ","0","5","5","5","0","0","0"],
              ["УАТО","0","0","0","0","0","0","0"],
              ["Всего","0","27","27","25","13","13","11"]]},
      months:[{name:"Июль",done:93,work:7}]};
    S0.layout={kpi:{row:1,ord:1,w:100,hw:0}, table:{row:2,ord:1,w:60,hw:0}, requests:{row:2,ord:2,w:40,hw:0},
      donut:{row:3,ord:1,w:32,hw:2}, reqpies:{row:3,ord:2,w:22,hw:2}, trend:{row:3,ord:3,w:46,hw:2},
      bars:{row:4,ord:1,w:100,hw:2}, summary:{row:5,ord:1,w:40,hw:0}};
  }
  if(type==="kru_s"){
    S0.rows = mkRows(
      ["Бачатский УР","Кедровский УР","Краснобродский УР","Вахрушевский УР","Талдинский УР","Калтанский УР"],
      [["25 (23)","166 (164)","0 (0)","74 (71)","2 (0)","5 (3)","31 (38)"],
       ["16 (17)","23 (39)","0 (1)","30 (38)","0 (0)","1 (3)","1 (1)"],
       ["31 (33)","90 (103)","5 (5)","48 (40)","2 (1)","0 (0)","9 (5)"],
       ["8 (7)","8 (2)","0 (0)","8 (5)","0 (0)","0 (0)","2 (2)"],
       ["11 (8)","48 (59)","5 (14)","33 (35)","0 (1)","0 (0)","5 (8)"],
       ["0 (0)","21 (26)","0 (0)","12 (12)","0 (0)","0 (0)","0 (0)"]],
      [196,61,132,34,141,78]);
    S0.start="2026-07-15"; S0.end="2026-07-21";
    S0.trend = tr([["13.01",1161],["20.01",1033],["27.01",980],["03.02",794],["10.02",970],["17.02",902],
      ["24.02",886],["03.03",784],["10.03",1039],["17.03",1064],["24.03",847],["31.03",671],
      ["07.04",768],["14.04",586],["21.04",665],["28.04",728],["05.05",760],["12.05",611],
      ["19.05",694],["26.05",670],["02.06",680],["09.06",695],["16.06",742],["23.06",785],
      ["30.06",755],["07.07",794],["14.07",764],["21.07",722]]);
    S0.blocksOn={kpi:true,table:true,donut:true,bars:false,requests:true,reqpies:true,summary:true,trend:true};
    S0.requests={
      table:{head:["","Простои ч.","Июль: поступило","Июль: КРУ/ИТП","Июль: выполнено","Неделя: поступило","Неделя: КРУ/ИТП","Неделя: выполнено"],
        rows:[["Бачатский","7.35 (4.35)","54","18","36","26","9","17"],
              ["Кедровский","2.20 (2.40)","17","11","6","7","3","4"],
              ["Вахрушевский","0.00 (0.45)","4","1","3","0","2","2"],
              ["Краснобродский","7.00 (2.40)","40","12","28","15","3","12"],
              ["Талдинский","3.10 (2.00)","57","38","19","27","22","5"],
              ["Калтанский","2.20 (0.20)","28","6","22","8","2","6"],
              ["Всего","22.25 (13.00)","200","86","114","85","39","46"]]},
      months:[{name:"Июнь",done:100,work:0},{name:"Июль",done:99,work:1}]};
    S0.summary={table:{head:["","2023","2024","2025","2026"],
      rows:[["Макс.","798","1225","1437","1161"],["Ср. значение","567","664","931","927"],["Мин.","451","411","516","586"],
            ["Кол-во систем","634","647","649","642"],["Общее кол-во событий","11104","36986","61071","24724"],["Коэффициент событий","17,5","57,1","94,1","39,6"]]}};
    S0.layout={kpi:{row:1,ord:1,w:100,hw:0}, table:{row:2,ord:1,w:58,hw:0}, requests:{row:2,ord:2,w:42,hw:0},
      summary:{row:3,ord:1,w:26,hw:0}, donut:{row:3,ord:2,w:26,hw:2}, reqpies:{row:3,ord:3,w:20,hw:2}, trend:{row:3,ord:4,w:28,hw:2},
      bars:{row:4,ord:1,w:100,hw:2}};
  }
  if(type==="kru_e"){
    S0.rows = mkRows(
      ["Бачатский УР","Кедровский УР","Краснобродский УР","Вахрушевский УР","Талдинский УР","Калтанский УР"],
      [["0 (0)","0 (0)","476 (454)","35 (15)"],
       ["0 (0)","0 (0)","123 (83)","2 (6)"],
       ["1 (1)","0 (1)","237 (223)","22 (8)"],
       ["0 (1)","0 (1)","66 (34)","4 (1)"],
       ["0 (0)","0 (0)","146 (149)","9 (2)"],
       ["0 (0)","0 (0)","163 (149)","4 (2)"]],
      [18,3,13,4,7,6]);
    S0.start="2026-07-15"; S0.end="2026-07-21";
    S0.blocksOn={kpi:true,table:true,donut:false,bars:false,requests:true,reqpies:true,summary:true,trend:true};
    S0.trend = tr([["13.01",844],["20.01",1318],["27.01",1567],["03.02",1222],["10.02",1512],["17.02",1247],
      ["24.02",1489],["03.03",1300],["10.03",1450],["17.03",1260],["24.03",1498],["31.03",1330],
      ["07.04",1132],["14.04",972],["21.04",1233],["28.04",1351],["05.05",1386],["12.05",1260],
      ["19.05",1183],["26.05",1200],["02.06",1137],["09.06",1487],["16.06",1546],["23.06",1571],
      ["30.06",1440],["07.07",1234],["14.07",1094],["21.07",1212]]);
    S0.requests={
      table:{head:["","Простои ч.","Июль: поступило","Июль: выполнено","Неделя: поступило","Неделя: выполнено"],
        rows:[["Бачатский","0 (0)","8","6","5","4"],
              ["Кедровский","0 (0)","0","0","0","0"],
              ["Вахрушевский","0 (0)","0","0","0","0"],
              ["Краснобродский","0 (0)","1","1","0","0"],
              ["Талдинский","0 (0)","0","0","0","0"],
              ["Калтанский","0 (0)","0","0","0","0"],
              ["Всего","0 (0)","9","7","5","4"]]},
      months:[{name:"Июнь",done:93,work:7},{name:"Июль",done:78,work:22}]};
    S0.summary={table:{head:["","2025","2026"],
      rows:[["Макс.","2158","1567"],["Ср. значение","965","1320"],["Мин.","256","844"],
            ["Кол-во систем","42","51"],["Общее кол-во событий","39572","35512"],["Коэффициент событий","942,1","696,3"]]}};
    S0.layout={kpi:{row:1,ord:1,w:100,hw:0}, table:{row:2,ord:1,w:58,hw:0}, requests:{row:2,ord:2,w:42,hw:0},
      summary:{row:3,ord:1,w:28,hw:0}, reqpies:{row:3,ord:2,w:26,hw:2}, trend:{row:3,ord:3,w:46,hw:2},
      donut:{row:4,ord:1,w:100,hw:2}, bars:{row:5,ord:1,w:100,hw:2}};
  }
  return S0;
}

const LS_PREFIX="report-v5-";
let S;
function normState(st, type){
  if(!st) return null;
  st.type = type;
  const demo = demoState(type);
  if(!st.layout || !st.layout.kpi || st.layout.kpi.row===undefined) st.layout = demo.layout;
  if(!st.blocksOn) st.blocksOn = demo.blocksOn;
  for(const b of BLOCKS){
    if(!st.layout[b.id]) st.layout[b.id] = demo.layout[b.id] || {row:9,ord:1,w:100,hw:0};
    if(st.blocksOn[b.id]===undefined) st.blocksOn[b.id]=false;
  }
  if(Array.isArray(st.savedTemplates)) st.savedTemplates = st.savedTemplates.filter(t=>t.layout && t.layout.kpi && t.layout.kpi.row!==undefined);
  else st.savedTemplates=[];
  if(!Array.isArray(st.custom)) st.custom=[];
  if(!st.requests) st.requests=demo.requests;
  if(!st.summary) st.summary=demo.summary;
  if(st.subtitle===undefined) st.subtitle=TYPES[type].subtitle;
  if(!st.theme || !THEMES[st.theme]) st.theme="corporate";
  if(!st.catsOn) st.catsOn=demo.catsOn;
  if(st.density===undefined) st.density=0;
  // миграция: блок заявок разделён на таблицу и пироги
  if(st.blocksOn.reqpies===undefined){
    st.blocksOn.reqpies = !!st.blocksOn.requests;
    const dl = demoState(type).layout;
    if(dl.reqpies) st.layout.reqpies = JSON.parse(JSON.stringify(dl.reqpies));
  }
  return st;
}
/* Хранилище браузера. Если оно недоступно (приватный режим, политика для локальных
   файлов), работаем на временном хранилище в памяти — приложение не должно падать. */
const memStore = {};
function lsGet(key){
  try{ return localStorage.getItem(key); }catch(e){ return key in memStore ? memStore[key] : null; }
}
function lsSet(key, val){
  try{ localStorage.setItem(key, val); }catch(e){ memStore[key] = val; }
}

function loadType(type){
  let st=null;
  try{ st = JSON.parse(lsGet(LS_PREFIX+type)); }catch(e){}
  if(!st && type==="ivn"){ // миграция данных ИВН из прошлых версий
    try{ st = JSON.parse(lsGet("ivn-report-v2")); }catch(e){}
  }
  return normState(st, type) || demoState(type);
}
let ACTIVE = lsGet(LS_PREFIX+"active") || "ivn";
if(!TYPES[ACTIVE]) ACTIVE="ivn";
S = loadType(ACTIVE);
CATS = TYPES[ACTIVE].cats;
function save(){
  lsSet(LS_PREFIX+ACTIVE, JSON.stringify(S));
  lsSet(LS_PREFIX+"active", ACTIVE);
}
function switchType(t){
  if(!TYPES[t] || t===ACTIVE) return;
  save();
  ACTIVE=t; S=loadType(t); CATS=TYPES[t].cats;
  save(); buildEditor(); renderReport();
}

/* ================= helpers ================= */
const $=q=>document.querySelector(q);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const visCats=()=>CATS.filter(c=>S.catsOn[c.id]);
const isDual=()=>TYPES[ACTIVE].dual;
/* «35 (15)» → {a:35, b:15}; «12» → {a:12, b:null} */
function pv(v){
  const m=String(v==null?"":v).replace(",",".").match(/-?\d+(?:\.\d+)?/g);
  return {a:m&&m[0]!==undefined?parseFloat(m[0]):0, b:m&&m[1]!==undefined?parseFloat(m[1]):null};
}
const fmtDual=(a,b)=>isDual()?(a+" ("+(b||0)+")"):String(a);
const totCats=()=>TYPES[ACTIVE].totalCats ? CATS.filter(c=>TYPES[ACTIVE].totalCats.indexOf(c.id)>=0) : CATS;
function rowCalc(r){
  let a=0,b=0;
  for(const c of totCats()){ const p=pv(r.values[c.id]); a+=p.a; b+=(p.b||0); }
  return {a,b};
}
const rowAuto=r=>rowCalc(r).a;
function rowTotal(r){
  if(r.override===null||r.override===""||r.override===undefined) return rowCalc(r).a;
  return pv(r.override).a;
}
function rowTotalDisp(r){
  if(r.override!==null&&r.override!==""&&r.override!==undefined) return esc(r.override);
  const c=rowCalc(r); return fmtDual(c.a,c.b);
}
const fmtD=iso=>{ if(!iso) return "—"; const p=iso.split("-"); return p[2]+"."+p[1]+"."+p[0]; };
const T=()=>THEMES[S.theme].chart;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
