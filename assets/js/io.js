/* Импорт и экспорт: JSON, CSV, Excel.
   Часть генератора отчётов. Скрипты подключаются по порядку в index.html. */

/* ================= import / export ================= */
function download(name, text, type){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([text],{type:type||"text/plain;charset=utf-8"}));
  a.download=name; a.click(); URL.revokeObjectURL(a.href);
}
function exportJSON(){ download("otchet_"+ACTIVE+"_"+(S.start||"")+"_"+(S.end||"")+".json", JSON.stringify(S,null,2), "application/json"); }
function importJSON(inp){
  const f=inp.files[0]; if(!f) return;
  const rd=new FileReader();
  rd.onload=()=>{ try{
    const st=Object.assign(demoState(ACTIVE), JSON.parse(rd.result));
    S=normState(st, ACTIVE); save(); buildEditor(); renderReport();
  }catch(e){ alert("Не удалось прочитать JSON: "+e.message); } inp.value=""; };
  rd.readAsText(f,"utf-8");
}
function downloadCSVTemplate(){
  let h="Управление;"+CATS.map(c=>c.name).join(";")+";Всего систем\n";
  for(const r of S.rows) h+=r.name+";"+CATS.map(c=>r.values[c.id]==null?"0":String(r.values[c.id])).join(";")+";"+(+r.systems||0)+"\n";
  download("shablon_"+ACTIVE+".csv","﻿"+h,"text/csv;charset=utf-8");
}
function applyTableRows(arr){
  const n=CATS.length;
  S.rows=arr.map(a=>({name:String(a[0]||"").trim(), systems:+a[n+1]||0, override:null,
    values:Object.fromEntries(CATS.map((c,i)=>[c.id, isDual()?String(a[i+1]==null?"0":a[i+1]).trim():(+a[i+1]||0)]))}));
  save(); buildEditor(); renderReport();
}
function importTable(inp){
  const f=inp.files[0]; if(!f) return;
  const done=()=>{ inp.value=""; };
  if(/\.csv$/i.test(f.name)){
    const rd=new FileReader();
    rd.onload=()=>{ try{
      const sep=(rd.result.split("\n")[0].match(/;/g)||[]).length ? ";" : ((rd.result.indexOf("\t")>=0)?"\t":",");
      const lines=rd.result.replace(/^﻿/,"").split(/\r?\n/).filter(l=>l.trim());
      applyTableRows(lines.slice(1).map(l=>l.split(sep)));
    }catch(e){ alert("Ошибка разбора CSV: "+e.message); } done(); };
    rd.readAsText(f,"utf-8");
  } else {
    const go=()=>{ const rd=new FileReader();
      rd.onload=()=>{ try{
        const wb=XLSX.read(rd.result,{type:"array"});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const arr=XLSX.utils.sheet_to_json(ws,{header:1});
        applyTableRows(arr.slice(1).filter(a=>a&&a.length&&String(a[0]).trim()));
      }catch(e){ alert("Ошибка чтения Excel: "+e.message); } done(); };
      rd.readAsArrayBuffer(f); };
    if(window.XLSX){ go(); }
    else{
      const sc=document.createElement("script");
      sc.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      sc.onload=go;
      sc.onerror=()=>{ alert("Не удалось загрузить библиотеку Excel (нет интернета). Сохраните файл как CSV и импортируйте его."); done(); };
      document.head.appendChild(sc);
    }
  }
}
function resetDemo(){ if(confirm("Заменить данные текущего типа отчёта демо-данными? Сохранённые шаблоны останутся.")){
  const tpls=S.savedTemplates; S=demoState(ACTIVE); S.savedTemplates=tpls; save(); buildEditor(); renderReport(); } }
