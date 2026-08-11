/* Сборка листа отчёта и автоподгонка под формат.
   Часть генератора отчётов. Скрипты подключаются по порядку в index.html. */

/* дескрипторы всех блоков: встроенные + пользовательские */
const TYPE_NAMES={text:"Текст",ctable:"Таблица",cchart:"График"};
function allBlocks(){
  const a=BLOCKS.filter(b=>S.blocksOn[b.id]).map(b=>({key:b.id, name:b.name, builtin:true}));
  for(const c of S.custom) a.push({key:c.uid, name:(c.title||TYPE_NAMES[c.type]), builtin:false, item:c});
  return a;
}
function getLay(d){ return d.builtin ? S.layout[d.key] : d.item.layout; }
function layoutRows(){
  const map={};
  for(const d of allBlocks()){ const L=getLay(d); (map[L.row]=map[L.row]||[]).push(d); }
  return Object.keys(map).map(Number).sort((a,b)=>a-b)
    .map(rn=>map[rn].sort((a,b)=>getLay(a).ord-getLay(b).ord));
}
const AUTO_BLOCKS={kpi:1,table:1,requests:1,summary:1}; // блоки с «естественной» высотой по контенту
function descAuto(d){ return d.builtin ? !!AUTO_BLOCKS[d.key] : (d.item.type==="text"||d.item.type==="ctable"); }
function rowIsAuto(row){ return row.some(descAuto) || row.every(d=>!getLay(d).hw); }
const PALETTE=["#1878c2","#f5b301","#22a565","#f97316","#8a5cf6","#e05677","#22b8cf","#8a94a6"];

/* ================= report ================= */
function renderReport(){
  const rep=$("#report");
  // сброс переменных прошлой темы, затем применение новой
  const oldVars=[]; for(let i=0;i<rep.style.length;i++){ const p=rep.style[i]; if(p.indexOf("--r-")===0) oldVars.push(p); }
  oldVars.forEach(p=>rep.style.removeProperty(p));
  for(const [k,v] of Object.entries(THEMES[S.theme].vars)) rep.style.setProperty(k,v);
  const catHexFor=c=>catHex(c, CATS.indexOf(c));

  const cats=visCats();
  const totals={}, totalsB={};
  for(const c of CATS){
    let a=0,b=0;
    for(const r of S.rows){ const p=pv(r.values[c.id]); a+=p.a; b+=(p.b||0); }
    totals[c.id]=a; totalsB[c.id]=b;
  }
  const grand=S.rows.reduce((a,r)=>a+rowTotal(r),0);
  const grandB=S.rows.reduce((a,r)=>{
    const ov=(r.override!==null&&r.override!==""&&r.override!==undefined);
    return a+((ov?pv(r.override).b:rowCalc(r).b)||0);
  },0);
  const sysTotal=S.rows.reduce((a,r)=>a+(+r.systems||0),0);
  const catSum=cats.reduce((a,c)=>a+totals[c.id],0);

  let deltaHtml="";
  if(S.trend.length>=2){
    const prev=+S.trend[S.trend.length-2].v||0;
    // дельта только если прошлое значение сопоставимо с текущим итогом (одна метрика)
    if(prev>0 && grand>0 && prev/grand<5 && grand/prev<5){
      const d=Math.round((grand-prev)/prev*100);
      deltaHtml='<small class="'+(d>=0?"up":"down")+'">'+(d>=0?"▲ +":"▼ ")+d+"%</small>";
    }
  }
  let top={name:"—",v:0};
  const topPool=totCats().filter(c=>S.catsOn[c.id]).length?totCats().filter(c=>S.catsOn[c.id]):cats;
  for(const c of topPool) if(totals[c.id]>top.v) top={name:c.name,v:totals[c.id]};

  const head =
    '<div class="r-head">'+
      '<span class="lgbox"><img class="lg" src="'+LOGO_LEFT+'" alt=""></span>'+
      '<div class="r-title"><h2>'+esc(S.title)+(S.subtitle?' <span style="color:var(--r-accent);font-weight:600">— '+esc(S.subtitle)+'</span>':'')+'</h2>'+
      '<div class="per">за период <b>'+fmtD(S.start)+' — '+fmtD(S.end)+'</b></div></div>'+
      '<span class="lgbox"><img class="lg" src="'+LOGO_RIGHT+'" alt=""></span>'+
    '</div>';

  const blockHtml = {
    kpi: ()=>'<div class="kpis">'+
      '<div class="kpi"><div class="kv">'+grand+deltaHtml+'</div><div class="kl">Всего событий за неделю'+(isDual()?' (передано: '+grandB+')':'')+'</div></div>'+
      '<div class="kpi"><div class="kv">'+top.v+'</div><div class="kl">Топ-категория: '+esc(top.name)+'</div></div>'+
      '<div class="kpi"><div class="kv">'+sysTotal+'</div><div class="kl">Всего систем</div></div>'+
      '<div class="kpi"><div class="kv">'+S.rows.length+'</div><div class="kl">Площадок в отчёте</div></div>'+
    '</div>',
    table: ()=>{
      let t='<table class="rt"><tr><th>Управление</th><th>Кол-во событий</th>';
      for(const c of cats) t+='<th>'+esc(c.name)+'</th>';
      t+='<th>Всего систем</th></tr>';
      for(const r of S.rows){
        t+='<tr><td>'+esc(r.name)+'</td><td class="tot">'+rowTotalDisp(r)+'</td>';
        for(const c of cats) t+='<td>'+esc(r.values[c.id]==null?"0":r.values[c.id])+'</td>';
        t+='<td>'+(+r.systems||0)+'</td></tr>';
      }
      t+='<tr class="total"><td>Всего</td><td>'+fmtDual(grand,grandB)+'</td>';
      for(const c of cats) t+='<td>'+fmtDual(totals[c.id],totalsB[c.id])+'</td>';
      t+='<td>'+sysTotal+'</td></tr></table>';
      return '<div class="card"><h3>Общие данные</h3><div class="grow">'+t+'</div></div>';
    },
    requests: ()=>{
      const q=S.requests;
      let t='<table class="rt"><tr>'+q.table.head.map(h=>'<th>'+esc(h)+'</th>').join("")+'</tr>';
      for(const r of q.table.rows){
        const isTotal=String(r[0]).trim()==="Всего";
        t+='<tr'+(isTotal?' class="total"':'')+'>'+q.table.head.map((_,j)=>'<td>'+esc(r[j]||"")+'</td>').join("")+'</tr>';
      }
      t+='</table>';
      return '<div class="card" style="flex:1;min-height:0"><h3>Работа по заявкам</h3><div class="grow">'+t+'</div></div>';
    },
    reqpies: ()=>'<div class="card" style="flex:1;min-height:0"><h3>Заявки: выполнение по месяцам</h3>'+
      '<div class="grow" id="reqPiesHost" style="display:flex;gap:14px;justify-content:center;align-items:center;flex-wrap:wrap"></div></div>',
    summary: ()=>{
      const q=S.summary;
      let t='<table class="rt"><tr>'+q.table.head.map(h=>'<th>'+esc(h)+'</th>').join("")+'</tr>';
      for(const r of q.table.rows)
        t+='<tr>'+q.table.head.map((_,j)=>'<td'+(j===0?' style="text-align:left;font-weight:600"':'')+'>'+esc(r[j]||"")+'</td>').join("")+'</tr>';
      t+='</table>';
      return '<div class="card" style="flex:1;min-height:0"><h3>Выявленные и переданные события</h3><div class="grow">'+t+'</div></div>';
    },
    donut: ()=>'<div class="card" style="flex:1;min-height:0"><h3>Общее количество событий по категориям</h3>'+
      '<div class="donut-wrap"><div id="donutHost"></div>'+
      '<div class="dlegend">'+cats.map(c=>{
        const v=totals[c.id], p=catSum?Math.round(v/catSum*100):0;
        return '<div class="row"><span class="dot" style="background:'+catHexFor(c)+'"></span>'+
               '<span class="nm">'+esc(c.name)+'</span><span class="vl">'+v+'</span><span class="pc">'+p+'%</span></div>';
      }).join("")+'</div></div></div>',
    bars: ()=>'<div class="card" style="flex:1;min-height:0"><h3>Соотношение событий между площадками</h3>'+
      '<div class="grow" id="barsHost"></div>'+
      '<div class="legend">'+cats.map(c=>'<span class="li"><span class="dot" style="background:'+catHexFor(c)+'"></span>'+esc(c.name)+'</span>').join("")+'</div></div>',
    trend: ()=>'<div class="card" style="flex:1;min-height:0"><h3>Тренд общего числа выявленных и переданных событий</h3>'+
      '<div class="grow" id="trendHost"></div></div>'
  };

  const customHtml = c => {
    if(c.type==="text")
      return '<div class="card" style="flex:1;min-height:0"><h3>'+esc(c.title)+'</h3>'+
        '<div class="grow" style="font-size:12px;line-height:1.5;white-space:pre-wrap;color:var(--r-ink)">'+esc(c.data.content)+'</div></div>';
    if(c.type==="ctable"){
      let t='<table class="rt"><tr>'+c.data.head.map(h=>'<th>'+esc(h)+'</th>').join("")+'</tr>';
      for(const r of c.data.rows)
        t+='<tr>'+c.data.head.map((_,j)=>'<td>'+esc(r[j]||"")+'</td>').join("")+'</tr>';
      t+='</table>';
      return '<div class="card" style="flex:1;min-height:0"><h3>'+esc(c.title)+'</h3><div class="grow">'+t+'</div></div>';
    }
    // cchart
    let legend="";
    if(c.data.kind==="pie"){
      const vals=(c.data.series[0]||{values:[]}).values;
      const sum=vals.reduce((a,b)=>a+(+b||0),0)||1;
      legend='<div class="dlegend">'+c.data.labels.map((l,i)=>
        '<div class="row"><span class="dot" style="background:'+PALETTE[i%PALETTE.length]+'"></span>'+
        '<span class="nm">'+esc(l)+'</span><span class="vl">'+(+vals[i]||0)+'</span><span class="pc">'+Math.round((+vals[i]||0)/sum*100)+'%</span></div>').join("")+'</div>';
      return '<div class="card" style="flex:1;min-height:0"><h3>'+esc(c.title)+'</h3>'+
        '<div class="donut-wrap"><div data-chart="'+c.uid+'"></div>'+legend+'</div></div>';
    }
    if(c.data.series.length>1)
      legend='<div class="legend">'+c.data.series.map(s=>'<span class="li"><span class="dot" style="background:'+s.color+'"></span>'+esc(s.name)+'</span>').join("")+'</div>';
    return '<div class="card" style="flex:1;min-height:0"><h3>'+esc(c.title)+'</h3>'+
      '<div class="grow" data-chart="'+c.uid+'"></div>'+legend+'</div>';
  };

  const descHtml = d => d.builtin ? blockHtml[d.key]() : customHtml(d.item);

  let rowsHtml="";
  for(const row of layoutRows()){
    const auto=rowIsAuto(row);
    const hw=auto?0:Math.max(...row.map(d=>getLay(d).hw||1));
    const style=auto?"":('flex:'+hw+' 1 0;min-height:72px');
    rowsHtml+='<div class="r-row'+(auto?" auto":"")+'" style="'+style+'">'+
      row.map(d=>'<div style="flex:'+(+getLay(d).w||1)+' 1 0;min-width:0;display:flex;flex-direction:column">'+descHtml(d)+'</div>').join("")+
      '</div>';
  }
  rep.innerHTML = head + '<div class="r-rows">'+rowsHtml+'</div>';

  fitDensity();                      // ужимаем плотность, пока всё не влезет по высоте
  fitTables();                       // сжимаем слишком широкие таблицы
  drawCharts(cats, totals, catSum);  // графики — по фактическим размерам ячеек
}

/* ---------- автоподгонка под лист ---------- */
function fitDensity(){
  const rep=$("#report"), rows=rep.querySelector(".r-rows");
  if(!rows) return;
  const manual=+S.density||0;
  if(manual){ rep.style.setProperty("--dens", manual); return; }  // ручной режим
  let d=1;
  rep.style.setProperty("--dens", d);
  // до 8 шагов по 5%: 1.00 → 0.65
  for(let i=0;i<8;i++){
    const over = rows.scrollHeight > rows.clientHeight+1 ||
      Array.from(rows.querySelectorAll(".card")).some(c=>c.scrollHeight>c.clientHeight+1);
    if(!over) break;
    d=Math.round((d-0.05)*100)/100;
    rep.style.setProperty("--dens", d);
  }
  $("#densInfo") && ($("#densInfo").textContent = d<1 ? ("масштаб содержимого "+Math.round(d*100)+"%") : "всё помещается на 100%");
}
function fitTables(){
  document.querySelectorAll("#report .card .grow > table.rt").forEach(t=>{
    const host=t.parentElement;
    t.classList.add("tfit"); t.style.transform="";
    const need=t.scrollWidth, have=host.clientWidth;
    if(need>have+1 && have>0){
      const k=have/need;
      t.style.transform="scale("+k.toFixed(3)+")";
      t.style.width=(100/k)+"%";
    } else { t.style.width=""; }
  });
}
function drawCharts(cats, totals, catSum){
  const rp=$("#reqPiesHost");
  if(rp){
    const size=Math.max(76, Math.min(rp.clientHeight-24, 150));
    rp.innerHTML = S.requests.months.map(m=>
      '<div style="text-align:center"><div style="font-size:10.5px;font-weight:700;color:var(--r-head);margin-bottom:2px">'+esc(m.name)+'</div>'+
      monthPieSVG(+m.done||0, +m.work||0, size)+'</div>').join("")+
      '<div style="font-size:10.5px;color:var(--r-ink)"><span class="dot" style="background:'+T().accent+';margin-right:5px"></span>Выполнено'+
      '<br><span class="dot" style="background:#c9e4f6;margin-right:5px"></span>В работе</div>';
  }
  const dh=$("#donutHost"), bh=$("#barsHost"), th=$("#trendHost");
  if(dh){ const par=dh.parentElement; const size=Math.max(110,Math.min(par.clientHeight-4, 240)); dh.innerHTML=donutSVG(cats,totals,catSum,size); }
  if(bh) bh.innerHTML=barsSVG(cats, Math.max(200,bh.clientWidth), Math.max(70, bh.clientHeight));
  if(th) th.innerHTML=trendSVG(Math.max(200,th.clientWidth), Math.max(55, th.clientHeight));
  document.querySelectorAll("[data-chart]").forEach(host=>{
    const c=cGet(host.getAttribute("data-chart")); if(!c) return;
    if(c.data.kind==="pie"){
      const par=host.parentElement;
      const size=Math.max(100,Math.min(par.clientHeight-4,230));
      host.innerHTML=gPieSVG(c.data, size);
    } else {
      host.innerHTML=gXYSVG(c.data, Math.max(160,host.clientWidth), Math.max(60,host.clientHeight));
    }
  });
}
