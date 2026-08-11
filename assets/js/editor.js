/* Левая панель: формы, таблицы, раскладка, шаблоны, пользовательские блоки.
   Часть генератора отчётов. Скрипты подключаются по порядку в index.html. */

/* ================= editor ================= */
/* редактор «свободной таблицы» (заявки, сводка). path: 'requests'|'summary' */
function ftEditorHTML(path){
  const tb=S[path].table, P="'"+path+"'";
  let t='<table class="edt"><tr>'+tb.head.map((h,j)=>'<th><input type="text" value="'+esc(h)+'" oninput="ftSet('+P+',t=>t.head['+j+']=this.value)"></th>').join("")+'<th></th></tr>';
  tb.rows.forEach((r,i)=>{
    t+='<tr>'+tb.head.map((_,j)=>'<td><input type="text" value="'+esc(r[j]||"")+'" oninput="ftSet('+P+',t=>t.rows['+i+']['+j+']=this.value)"></td>').join("")+
      '<td><button class="rowdel" onclick="ftSetB('+P+',t=>t.rows.splice('+i+',1))">✕</button></td></tr>';
  });
  t+='</table>';
  return t+'<div class="iorow">'+
    '<button class="btn small" onclick="ftSetB('+P+',t=>t.rows.push(t.head.map(()=>\'\')))">+ Строка</button>'+
    '<button class="btn small" onclick="ftSetB('+P+',t=>{t.head.push(\'Колонка\');t.rows.forEach(r=>r.push(\'\'))})">+ Колонка</button>'+
    '<button class="btn small" onclick="ftSetB('+P+',t=>{if(t.head.length>1){t.head.pop();t.rows.forEach(r=>r.pop())}})">− Колонка</button></div>'+
    '<label class="f">Вставка из Excel (первая строка — заголовки)</label>'+
    '<textarea style="width:100%;min-height:40px;border:1px solid var(--line);border-radius:7px;padding:6px 8px;font-size:11px;font-family:inherit" placeholder="Ctrl+V…" onchange="ftPaste('+P+',this.value);this.value=\'\'"></textarea>';
}
function ftSet(path,fn){ fn(S[path].table); save(); renderReport(); }
function ftSetB(path,fn){ fn(S[path].table); save(); buildEditor(); renderReport(); }
function ftPaste(path,txt){
  const lines=String(txt||"").split(/\r?\n/).filter(l=>l.trim());
  if(!lines.length) return;
  const sep=lines[0].indexOf("\t")>=0?"\t":";";
  const arr=lines.map(l=>l.split(sep));
  S[path].table={head:arr[0], rows:arr.slice(1)};
  save(); buildEditor(); renderReport();
}
function monthsEditorHTML(){
  return S.requests.months.map((m,i)=>'<div class="flex" style="margin-top:6px;align-items:center">'+
    '<input type="text" value="'+esc(m.name)+'" oninput="S.requests.months['+i+'].name=this.value;save();renderReport()">'+
    '<input type="number" title="Выполнено" value="'+(+m.done||0)+'" oninput="S.requests.months['+i+'].done=+this.value||0;save();renderReport()">'+
    '<input type="number" title="В работе" value="'+(+m.work||0)+'" oninput="S.requests.months['+i+'].work=+this.value||0;save();renderReport()">'+
    '<button class="rowdel" onclick="S.requests.months.splice('+i+',1);save();buildEditor();renderReport()">✕</button></div>').join("")+
    '<div class="iorow"><button class="btn small" onclick="S.requests.months.push({name:\'Месяц\',done:0,work:0});save();buildEditor();renderReport()">+ Пирог месяца</button></div>'+
    '<div class="hint">Колонки: название, «Выполнено», «В работе» (число или %).</div>';
}

function buildEditor(){
  $("#typeSel").innerHTML=Object.entries(TYPES).map(([id,t])=>
    '<option value="'+id+'"'+(id===ACTIVE?" selected":"")+'>'+esc(t.label)+'</option>').join("");
  $("#inTitle").value=S.title; $("#inOrg").value=S.org;
  $("#inStart").value=S.start; $("#inEnd").value=S.end;
  $("#inSubtitle").value=S.subtitle||"";
  $("#densSel").value=String(S.density||0);

  // заявки и сводка
  $("#secRequests").style.display = (S.blocksOn.requests||S.blocksOn.reqpies) ? "" : "none";
  $("#secSummary").style.display = S.blocksOn.summary ? "" : "none";
  $("#edRequests").innerHTML = ftEditorHTML("requests")+'<label class="f" style="margin-top:10px">Пироги по месяцам</label>'+monthsEditorHTML();
  $("#edSummary").innerHTML = ftEditorHTML("summary");

  // themes
  $("#edThemes").innerHTML = Object.entries(THEMES).map(([id,t])=>
    '<div class="theme-card'+(S.theme===id?" active":"")+'" onclick="setTheme(\''+id+'\')">'+
    '<span class="sw">'+t.swatch.map(c=>'<i style="background:'+c+'"></i>').join("")+'</span>'+esc(t.name)+'</div>').join("");

  // layout rows
  $("#edLayout").innerHTML = allBlocks().map(d=>{
    const L=getLay(d);
    const num=(k,min,max)=>'<input type="number" min="'+min+'" max="'+max+'" value="'+L[k]+'" onchange="setLay(\''+d.key+'\',\''+k+'\',this.value)">';
    return '<div class="lay-row"><span class="bn">'+esc(d.name)+'</span>'+
      '<span class="lb">Стр.</span>'+num("row",1,9)+'<span class="lb">Поз.</span>'+num("ord",1,9)+
      '<span class="lb">Шир.</span>'+num("w",5,100)+'<span class="lb">Выс.</span>'+num("hw",0,9)+'</div>';
  }).join("");
  drawMiniMap();

  // saved templates
  $("#edTpls").innerHTML = S.savedTemplates.length ? S.savedTemplates.map((t,i)=>
    '<div class="tpl"><span class="nm">'+esc(t.name)+'</span>'+
    '<button class="btn small" onclick="applyTpl('+i+')">Применить</button>'+
    '<button class="rowdel" onclick="delTpl('+i+')">✕</button></div>').join("")
    : '<div class="hint">Пока нет сохранённых шаблонов.</div>';

  // blocks
  $("#edBlocks").innerHTML=BLOCKS.map(b=>
    '<label class="chk"><input type="checkbox" '+(S.blocksOn[b.id]?"checked":"")+' onchange="S.blocksOn[\''+b.id+'\']=this.checked;save();buildEditor();renderReport()">'+esc(b.name)+'</label>').join("")+
    '<label class="f" style="margin-top:10px">Свои блоки</label>'+
    S.custom.map(customEditorHTML).join("")+
    '<div class="iorow">'+
      '<button class="btn small" onclick="addCustom(\'text\')">+ Текст</button>'+
      '<button class="btn small" onclick="addCustom(\'ctable\')">+ Таблица</button>'+
      '<button class="btn small" onclick="addCustom(\'cchart\')">+ График</button>'+
    '</div>'+
    '<div class="hint">Своих блоков может быть сколько угодно — например, два пирога «Июнь» и «Июль» в одной строке. Позиция и размер настраиваются в «Раскладке блоков».</div>';

  // data table
  let h='<table class="edt"><tr><th style="text-align:left">Управление</th>';
  for(const c of CATS) h+='<th title="'+esc(c.name)+'">'+esc(c.name).replace(/ /,"<br>")+'</th>';
  h+='<th>Всего<br>систем</th><th>Итог<br>(правка)</th><th></th></tr>';
  const dual=isDual(), cw=dual?54:34;
  S.rows.forEach((r,i)=>{
    h+='<tr><td class="nm" style="min-width:86px"><input type="text" value="'+esc(r.name)+'" oninput="upRow('+i+',\'name\',this.value)"></td>';
    for(const c of CATS){
      const val=r.values[c.id]==null?(dual?"0 (0)":0):r.values[c.id];
      h+='<td style="width:'+cw+'px"><input type="'+(dual?"text":"number")+'" '+(dual?'':'min="0"')+' value="'+esc(val)+'" oninput="upVal('+i+',\''+c.id+'\',this.value)"></td>';
    }
    h+='<td style="width:38px"><input type="number" min="0" value="'+(+r.systems||0)+'" oninput="upRow('+i+',\'systems\',this.value)"></td>';
    const ov=(r.override!==null&&r.override!==""&&r.override!==undefined);
    h+='<td style="width:'+(dual?54:40)+'px" class="'+(ov?"ovr":"")+'"><input type="'+(dual?"text":"number")+'" placeholder="'+esc(fmtDual(rowCalc(r).a,rowCalc(r).b))+'" value="'+(ov?esc(r.override):"")+'" oninput="upRow('+i+',\'override\',this.value)"></td>';
    h+='<td><button class="rowdel" title="Удалить строку" onclick="delRow('+i+')">✕</button></td></tr>';
  });
  h+='</table>';
  $("#edTableWrap").innerHTML=h;

  // categories
  $("#edCats").innerHTML=CATS.map(c=>
    '<label class="chk"><input type="checkbox" '+(S.catsOn[c.id]?"checked":"")+' onchange="S.catsOn[\''+c.id+'\']=this.checked;save();renderReport()">'+
    '<span class="dot" style="background:'+c.hex+'"></span>'+esc(c.name)+'</label>').join("");

  // trend
  $("#edTrend").innerHTML='<table class="edt"><tr><th style="text-align:left">Дата</th><th>Значение</th><th></th></tr>'+
    S.trend.map((p,i)=>'<tr><td><input type="text" value="'+esc(p.d)+'" oninput="S.trend['+i+'].d=this.value;save();renderReport()"></td>'+
      '<td style="width:70px"><input type="number" value="'+(+p.v||0)+'" oninput="S.trend['+i+'].v=+this.value||0;save();renderReport()"></td>'+
      '<td><button class="rowdel" onclick="S.trend.splice('+i+',1);save();buildEditor();renderReport()">✕</button></td></tr>').join("")+'</table>';
}

function setTheme(id){ S.theme=id; save(); buildEditor(); renderReport(); }
function setLay(bid,k,v){
  v = (k==="hw") ? clamp(+v||0,0,9) : clamp(+v||1, 1, k==="w"?100:9);
  const L = S.layout[bid] || (S.custom.find(c=>c.uid===bid)||{}).layout;
  if(L) L[k]=v;
  save(); buildEditor(); renderReport();
}

function drawMiniMap(){
  const colors={kpi:"#8ea9c4",table:"#1878c2",donut:"#f5b301",bars:"#22a565",trend:"#f97316"};
  const rows=layoutRows();
  const hs=rows.map(row=>{
    if(row.some(d=>d.builtin&&d.key==="table")) return 42;
    if(row.some(d=>d.builtin&&d.key==="kpi")) return 13;
    if(rowIsAuto(row)) return 22;
    return 12+Math.max(...row.map(d=>getLay(d).hw||1))*8;
  });
  const totalH=hs.reduce((a,b)=>a+b,0)+ (rows.length-1)*3;
  const k=120/Math.max(totalH,1);
  let y=0, s="", ci=0;
  rows.forEach((row,i)=>{
    const wSum=row.reduce((a,d)=>a+(+getLay(d).w||1),0);
    let x=0;
    for(const d of row){
      const col = d.builtin ? colors[d.key] : PALETTE[(ci++)%PALETTE.length];
      const w=240*(+getLay(d).w||1)/wSum;
      const h=hs[i]*k;
      s+='<rect x="'+(x+1)+'" y="'+(y+1)+'" width="'+(w-2)+'" height="'+Math.max(h-2,4)+'" rx="3" fill="'+col+'" fill-opacity=".78"/>';
      if(h>10) s+='<text x="'+(x+w/2)+'" y="'+(y+h/2+3)+'" text-anchor="middle" font-size="8" fill="#fff" font-weight="600">'+esc(d.name.split(" ")[0].replace(/[«»]/g,""))+'</text>';
      x+=w;
    }
    y+=hs[i]*k+3*k;
  });
  $("#miniMap").innerHTML=s;
}

/* ---------- пользовательские блоки: CRUD ---------- */
function addCustom(type){
  const maxRow=Math.max(0,...allBlocks().map(d=>getLay(d).row));
  const uid="c"+Date.now().toString(36)+Math.floor(Math.random()*1000);
  const base={uid, type, title:TYPE_NAMES[type], layout:{row:maxRow+1, ord:1, w:100, hw:type==="cchart"?2:0}};
  if(type==="text") base.data={content:"Текст блока…"};
  else if(type==="ctable") base.data={head:["Показатель","Значение"], rows:[["",""]]};
  else base.data={kind:"bar", labels:["А","Б","В"], series:[{name:"Ряд 1", color:"#1878c2", values:[3,5,2]}]};
  S.custom.push(base); save(); buildEditor(); renderReport();
}
function delCustom(uid){
  const c=S.custom.find(c=>c.uid===uid);
  if(c && confirm("Удалить блок «"+(c.title||"")+"»?")){
    S.custom=S.custom.filter(x=>x.uid!==uid); save(); buildEditor(); renderReport();
  }
}
function cGet(uid){ return S.custom.find(c=>c.uid===uid); }
function cSet(uid,fn){ const c=cGet(uid); if(c){ fn(c); save(); renderReport(); } }
function cSetB(uid,fn){ const c=cGet(uid); if(c){ fn(c); save(); buildEditor(); renderReport(); } }
function cPaste(uid,txt){
  const lines=String(txt||"").split(/\r?\n/).filter(l=>l.trim());
  if(!lines.length) return;
  const sep=lines[0].indexOf("\t")>=0?"\t":";";
  const arr=lines.map(l=>l.split(sep));
  cSetB(uid,c=>{ c.data.head=arr[0]; c.data.rows=arr.slice(1); });
}
function customEditorHTML(c){
  let inner="";
  const U="'"+c.uid+"'";
  if(c.type==="text"){
    inner='<textarea style="width:100%;min-height:70px;border:1px solid var(--line);border-radius:7px;padding:6px 8px;font-size:12px;font-family:inherit" oninput="cSet('+U+',c=>c.data.content=this.value)">'+esc(c.data.content)+'</textarea>';
  } else if(c.type==="ctable"){
    let t='<table class="edt"><tr>'+c.data.head.map((h,j)=>'<th><input type="text" value="'+esc(h)+'" oninput="cSet('+U+',c=>c.data.head['+j+']=this.value)"></th>').join("")+'<th></th></tr>';
    c.data.rows.forEach((r,i)=>{
      t+='<tr>'+c.data.head.map((_,j)=>'<td><input type="text" value="'+esc(r[j]||"")+'" oninput="cSet('+U+',c=>c.data.rows['+i+']['+j+']=this.value)"></td>').join("")+
        '<td><button class="rowdel" onclick="cSetB('+U+',c=>c.data.rows.splice('+i+',1))">✕</button></td></tr>';
    });
    t+='</table>';
    inner=t+'<div class="iorow">'+
      '<button class="btn small" onclick="cSetB('+U+',c=>c.data.rows.push(c.data.head.map(()=>String())))">+ Строка</button>'+
      '<button class="btn small" onclick="cSetB('+U+',c=>{c.data.head.push(\'Колонка\');c.data.rows.forEach(r=>r.push(\'\'))})">+ Колонка</button>'+
      '<button class="btn small" onclick="cSetB('+U+',c=>{if(c.data.head.length>1){c.data.head.pop();c.data.rows.forEach(r=>r.pop())}})">− Колонка</button></div>'+
      '<label class="f">Вставка из Excel (скопируйте ячейки и вставьте сюда, первая строка — заголовки)</label>'+
      '<textarea style="width:100%;min-height:44px;border:1px solid var(--line);border-radius:7px;padding:6px 8px;font-size:11px;font-family:inherit" placeholder="Ctrl+V…" onchange="cPaste('+U+',this.value);this.value=\'\'"></textarea>';
  } else {
    inner='<label class="f">Тип графика</label><select onchange="cSet('+U+',c=>c.data.kind=this.value)">'+
      [["bar","Столбцы"],["line","Линия"],["pie","Пирог"]].map(o=>'<option value="'+o[0]+'"'+(c.data.kind===o[0]?" selected":"")+'>'+o[1]+'</option>').join("")+'</select>'+
      '<label class="f">Подписи (через запятую)</label>'+
      '<input type="text" value="'+esc(c.data.labels.join(", "))+'" onchange="cSet('+U+',c=>c.data.labels=this.value.split(\',\').map(s=>s.trim()))">'+
      c.data.series.map((s,i)=>'<div class="flex" style="margin-top:6px;align-items:center">'+
        '<input type="text" style="flex:2" value="'+esc(s.name)+'" onchange="cSet('+U+',c=>c.data.series['+i+'].name=this.value)">'+
        '<input type="color" style="flex:0 0 36px;padding:2px;height:29px" value="'+s.color+'" onchange="cSet('+U+',c=>c.data.series['+i+'].color=this.value)">'+
        '<input type="text" style="flex:3" value="'+s.values.join(", ")+'" onchange="cSet('+U+',c=>c.data.series['+i+'].values=this.value.split(\',\').map(x=>+x.trim()||0))">'+
        '<button class="rowdel" onclick="cSetB('+U+',c=>c.data.series.splice('+i+',1))">✕</button></div>').join("")+
      '<div class="iorow"><button class="btn small" onclick="cSetB('+U+',c=>c.data.series.push({name:\'Ряд \'+(c.data.series.length+1),color:\''+PALETTE[(c.data.series.length+1)%PALETTE.length]+'\',values:c.data.labels.map(()=>0)}))">+ Ряд данных</button></div>'+
      '<div class="hint">Значения — через запятую, по одному на подпись. Для пирога используется первый ряд.</div>';
  }
  return '<details class="sec" style="margin-top:8px"><summary style="font-size:12px">'+esc(c.title||TYPE_NAMES[c.type])+
    ' <span style="color:var(--muted);font-weight:400">('+TYPE_NAMES[c.type]+')</span>'+
    '<button class="rowdel" style="margin-left:auto" onclick="event.preventDefault();delCustom(\''+c.uid+'\')">✕</button></summary>'+
    '<div class="sec-body"><label class="f">Заголовок блока</label>'+
    '<input type="text" value="'+esc(c.title)+'" oninput="cSet('+U+',c=>c.title=this.value)">'+inner+'</div></details>';
}

function upRow(i,k,v){ S.rows[i][k] = (k==="override" ? (v===""?null:v) : (k==="name"?v:+v||0)); save(); renderReport(); }
function upVal(i,cid,v){ S.rows[i].values[cid] = isDual() ? v : (+v||0); save(); renderReport(); }
function addRow(){ S.rows.push({name:"Новое управление",systems:0,override:null,values:Object.fromEntries(CATS.map(c=>[c.id,isDual()?"0 (0)":0]))}); save(); buildEditor(); renderReport(); }
function delRow(i){ if(confirm("Удалить строку «"+S.rows[i].name+"»?")){ S.rows.splice(i,1); save(); buildEditor(); renderReport();} }
function addTrend(){ S.trend.push({d:"",v:0}); save(); buildEditor(); renderReport(); }
function appendCurrentWeek(){
  const tot=S.rows.reduce((a,r)=>a+rowTotal(r),0);
  const d=(S.end||"").split("-");
  S.trend.push({d:d.length===3?d[2]+"."+d[1]:"", v:tot});
  save(); buildEditor(); renderReport();
}
document.addEventListener("input",e=>{
  if(e.target.id==="inTitle")S.title=e.target.value;
  else if(e.target.id==="inSubtitle")S.subtitle=e.target.value;
  else if(e.target.id==="inOrg")S.org=e.target.value;
  else if(e.target.id==="inStart")S.start=e.target.value;
  else if(e.target.id==="inEnd")S.end=e.target.value;
  else return;
  save(); renderReport();
});

/* ================= templates ================= */
function tplObj(name){ return {name:name, theme:S.theme,
  layout:JSON.parse(JSON.stringify(S.layout)),
  blocksOn:JSON.parse(JSON.stringify(S.blocksOn)),
  catsOn:JSON.parse(JSON.stringify(S.catsOn)),
  custom:JSON.parse(JSON.stringify(S.custom))}; }
function saveTpl(){
  const n=($("#tplName").value||"").trim();
  if(!n){ alert("Введите название шаблона"); return; }
  const ex=S.savedTemplates.findIndex(t=>t.name===n);
  if(ex>=0) S.savedTemplates[ex]=tplObj(n); else S.savedTemplates.push(tplObj(n));
  $("#tplName").value=""; save(); buildEditor();
}
function applyTpl(i){
  const t=S.savedTemplates[i]; if(!t) return;
  S.theme=THEMES[t.theme]?t.theme:"corporate";
  S.layout=JSON.parse(JSON.stringify(t.layout));
  S.blocksOn=JSON.parse(JSON.stringify(t.blocksOn));
  if(t.catsOn) S.catsOn=JSON.parse(JSON.stringify(t.catsOn));
  if(Array.isArray(t.custom)) S.custom=JSON.parse(JSON.stringify(t.custom));
  save(); buildEditor(); renderReport();
}
function delTpl(i){ if(confirm("Удалить шаблон «"+S.savedTemplates[i].name+"»?")){ S.savedTemplates.splice(i,1); save(); buildEditor(); } }
function exportTpl(){ download("шаблон_отчета.json", JSON.stringify(tplObj("экспорт"),null,2), "application/json"); }
function importTpl(inp){
  const f=inp.files[0]; if(!f) return;
  const rd=new FileReader();
  rd.onload=()=>{ try{
    const t=JSON.parse(rd.result);
    if(!t.layout||!t.blocksOn) throw new Error("это не файл шаблона");
    t.name=t.name||f.name.replace(/\.json$/i,"");
    S.savedTemplates.push(t); save(); buildEditor();
  }catch(e){ alert("Не удалось прочитать шаблон: "+e.message); } inp.value=""; };
  rd.readAsText(f,"utf-8");
}
