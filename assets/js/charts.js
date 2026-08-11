/* Отрисовка графиков в SVG.
   Часть генератора отчётов. Скрипты подключаются по порядку в index.html. */

/* ---- SVG charts (цвета берутся из активной темы) ---- */
function donutSVG(cats,totals,sum,size){
  const c0=size/2, R=size*0.44, r=R*0.62;
  if(!sum) return '<svg width="'+size+'" height="'+size+'"></svg>';
  let a0=-Math.PI/2, parts="";
  for(const c of cats){
    const v=totals[c.id]; if(!v) continue;
    const fill=catHex(c, CATS.indexOf(c));
    const a1=a0+v/sum*2*Math.PI;
    const large=(a1-a0)>Math.PI?1:0;
    const x0=c0+R*Math.cos(a0), y0=c0+R*Math.sin(a0), x1=c0+R*Math.cos(a1), y1=c0+R*Math.sin(a1);
    const xi=c0+r*Math.cos(a1), yi=c0+r*Math.sin(a1), xi0=c0+r*Math.cos(a0), yi0=c0+r*Math.sin(a0);
    parts+='<path d="M'+x0.toFixed(1)+' '+y0.toFixed(1)+' A'+R+' '+R+' 0 '+large+' 1 '+x1.toFixed(1)+' '+y1.toFixed(1)+
      ' L'+xi.toFixed(1)+' '+yi.toFixed(1)+' A'+r+' '+r+' 0 '+large+' 0 '+xi0.toFixed(1)+' '+yi0.toFixed(1)+' Z" fill="'+fill+'" stroke="'+THEMES[S.theme].vars["--r-card"]+'" stroke-width="1.5"/>';
    const mid=(a0+a1)/2, pct=v/sum;
    if(pct>=0.05){
      const lx=c0+(R+r)/2*Math.cos(mid), ly=c0+(R+r)/2*Math.sin(mid);
      parts+='<text x="'+lx.toFixed(1)+'" y="'+(ly+3.5).toFixed(1)+'" text-anchor="middle" font-size="11" font-weight="700" fill="'+txtOn(fill)+'">'+Math.round(pct*100)+'%</text>';
    }
    a0=a1;
  }
  parts+='<text x="'+c0+'" y="'+(c0-2)+'" text-anchor="middle" font-size="'+(size*0.125)+'" font-weight="700" fill="'+T().head+'">'+sum+'</text>'+
         '<text x="'+c0+'" y="'+(c0+size*0.08)+'" text-anchor="middle" font-size="9.5" fill="'+T().muted+'">событий</text>';
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+parts+'</svg>';
}

/* пирог «Выполнено/В работе» для блока заявок */
function monthPieSVG(done, work, size){
  const sum=done+work;
  const c0=size/2, R=size*0.46;
  if(!sum) return '<svg width="'+size+'" height="'+size+'"></svg>';
  const aw=work/sum*2*Math.PI;
  const x1=c0+R*Math.cos(-Math.PI/2+aw), y1=c0+R*Math.sin(-Math.PI/2+aw);
  let s='<circle cx="'+c0+'" cy="'+c0+'" r="'+R+'" fill="'+T().accent+'"/>';
  if(work>0) s+='<path d="M'+c0+' '+c0+' L'+c0+' '+(c0-R)+' A'+R+' '+R+' 0 '+(aw>Math.PI?1:0)+' 1 '+x1.toFixed(1)+' '+y1.toFixed(1)+' Z" fill="#c9e4f6"/>';
  const pd=Math.round(done/sum*100), pw=100-pd;
  s+='<text x="'+c0+'" y="'+(c0+R*0.45)+'" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">'+pd+'%</text>';
  if(pw>=3) s+='<text x="'+(c0+R*0.45)+'" y="'+(c0-R*0.45)+'" text-anchor="middle" font-size="9.5" font-weight="700" fill="#1c2733">'+pw+'%</text>';
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+s+'</svg>';
}

function barsSVG(cats,W,H){
  const padL=30, padB=16, padT=14;
  const groups=S.rows;
  const maxV=Math.max(1,...groups.flatMap(r=>cats.map(c=>pv(r.values[c.id]).a)));
  const gw=(W-padL)/Math.max(1,groups.length);
  const bw=Math.min(15,Math.max(4,(gw-24)/Math.max(1,cats.length)));
  let s="";
  const steps=4;
  for(let i=0;i<=steps;i++){
    const y=padT+(H-padT-padB)*i/steps, v=Math.round(maxV*(1-i/steps));
    s+='<line x1="'+padL+'" y1="'+y+'" x2="'+W+'" y2="'+y+'" stroke="'+T().grid+'" stroke-width="1"/>'+
       '<text x="'+(padL-5)+'" y="'+(y+3)+'" text-anchor="end" font-size="8.5" fill="'+T().axis+'">'+v+'</text>';
  }
  groups.forEach((r,gi)=>{
    const x0=padL+gi*gw+(gw-bw*cats.length)/2;
    cats.forEach((c,ci)=>{
      const v=pv(r.values[c.id]).a;
      const h=(H-padT-padB)*v/maxV;
      const x=x0+ci*bw, y=H-padB-h;
      s+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+(bw-2).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="1.5" fill="'+catHex(c,CATS.indexOf(c))+'"/>';
      if(v>0) s+='<text x="'+(x+(bw-2)/2).toFixed(1)+'" y="'+(y-2.5).toFixed(1)+'" text-anchor="middle" font-size="8.5" font-weight="600" fill="'+T().label+'">'+v+'</text>';
    });
    s+='<text x="'+(padL+gi*gw+gw/2).toFixed(1)+'" y="'+(H-3)+'" text-anchor="middle" font-size="9.5" font-weight="600" fill="'+T().label+'">'+esc(r.name)+'</text>';
  });
  return '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+s+'</svg>';
}

function trendSVG(W,H){
  const padL=30, padB=14, padT=13;
  const pts=S.trend.filter(p=>p.d!=="");
  if(!pts.length) return "";
  const maxV=Math.max(1,...pts.map(p=>+p.v||0));
  const n=pts.length, dx=(W-padL-18)/Math.max(1,n-1);
  const X=i=>padL+i*dx, Y=v=>padT+(H-padT-padB)*(1-v/maxV);
  let line="", area="M"+X(0)+" "+(H-padB);
  pts.forEach((p,i)=>{ const c=X(i).toFixed(1)+" "+Y(+p.v||0).toFixed(1);
    line+=(i?" L":"M")+c; area+=" L"+c; });
  area+=" L"+X(n-1).toFixed(1)+" "+(H-padB)+" Z";
  const ac=T().accent;
  let s='<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">'+
    '<stop offset="0" stop-color="'+ac+'" stop-opacity=".18"/><stop offset="1" stop-color="'+ac+'" stop-opacity="0"/></linearGradient></defs>';
  s+='<line x1="'+padL+'" y1="'+(H-padB)+'" x2="'+W+'" y2="'+(H-padB)+'" stroke="'+T().base+'"/>';
  s+='<path d="'+area+'" fill="url(#tg)"/>';
  s+='<path d="'+line+'" fill="none" stroke="'+ac+'" stroke-width="2" stroke-linejoin="round"/>';
  pts.forEach((p,i)=>{
    const x=X(i), y=Y(+p.v||0);
    const last=i===n-1;
    s+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(last?3.4:2.2)+'" fill="'+(last?T().head:ac)+'"/>';
    s+='<text x="'+x.toFixed(1)+'" y="'+(y-5).toFixed(1)+'" text-anchor="middle" font-size="8" font-weight="'+(last?"800":"500")+'" fill="'+(last?T().head:T().muted)+'">'+p.v+'</text>';
    s+='<text x="'+x.toFixed(1)+'" y="'+(H-2)+'" text-anchor="middle" font-size="7.6" fill="'+T().axis+'">'+esc(p.d)+'</text>';
  });
  return '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+s+'</svg>';
}

/* ---- универсальные графики для своих блоков ---- */
function gPieSVG(data, size){
  const vals=(data.series[0]||{values:[]}).values.map(v=>+v||0);
  const sum=vals.reduce((a,b)=>a+b,0);
  const c0=size/2, R=size*0.44, r=R*0.6;
  if(!sum) return '<svg width="'+size+'" height="'+size+'"></svg>';
  let a0=-Math.PI/2, parts="";
  vals.forEach((v,i)=>{
    if(!v) return;
    const a1=a0+v/sum*2*Math.PI, large=(a1-a0)>Math.PI?1:0;
    const x0=c0+R*Math.cos(a0), y0=c0+R*Math.sin(a0), x1=c0+R*Math.cos(a1), y1=c0+R*Math.sin(a1);
    const xi=c0+r*Math.cos(a1), yi=c0+r*Math.sin(a1), xi0=c0+r*Math.cos(a0), yi0=c0+r*Math.sin(a0);
    parts+='<path d="M'+x0.toFixed(1)+' '+y0.toFixed(1)+' A'+R+' '+R+' 0 '+large+' 1 '+x1.toFixed(1)+' '+y1.toFixed(1)+
      ' L'+xi.toFixed(1)+' '+yi.toFixed(1)+' A'+r+' '+r+' 0 '+large+' 0 '+xi0.toFixed(1)+' '+yi0.toFixed(1)+' Z" fill="'+PALETTE[i%PALETTE.length]+'" stroke="'+THEMES[S.theme].vars["--r-card"]+'" stroke-width="1.5"/>';
    const mid=(a0+a1)/2, pct=v/sum;
    if(pct>=0.06){
      const lx=c0+(R+r)/2*Math.cos(mid), ly=c0+(R+r)/2*Math.sin(mid);
      parts+='<text x="'+lx.toFixed(1)+'" y="'+(ly+3.5).toFixed(1)+'" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">'+Math.round(pct*100)+'%</text>';
    }
    a0=a1;
  });
  parts+='<text x="'+c0+'" y="'+(c0+4)+'" text-anchor="middle" font-size="'+(size*0.12)+'" font-weight="700" fill="'+T().head+'">'+sum+'</text>';
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+parts+'</svg>';
}
function gXYSVG(data, W, H){
  const padL=30, padB=16, padT=13;
  const labels=data.labels, series=data.series;
  const maxV=Math.max(1,...series.flatMap(s=>s.values.map(v=>+v||0)));
  let s="";
  const steps=3;
  for(let i=0;i<=steps;i++){
    const y=padT+(H-padT-padB)*i/steps, v=Math.round(maxV*(1-i/steps));
    s+='<line x1="'+padL+'" y1="'+y+'" x2="'+W+'" y2="'+y+'" stroke="'+T().grid+'"/>'+
       '<text x="'+(padL-5)+'" y="'+(y+3)+'" text-anchor="end" font-size="8.5" fill="'+T().axis+'">'+v+'</text>';
  }
  const n=labels.length;
  if(data.kind==="line"){
    const dx=(W-padL-14)/Math.max(1,n-1);
    const X=i=>padL+i*dx, Y=v=>padT+(H-padT-padB)*(1-v/maxV);
    for(const sr of series){
      let line="";
      labels.forEach((_,i)=>{ line+=(i?" L":"M")+X(i).toFixed(1)+" "+Y(+sr.values[i]||0).toFixed(1); });
      s+='<path d="'+line+'" fill="none" stroke="'+sr.color+'" stroke-width="2" stroke-linejoin="round"/>';
      labels.forEach((_,i)=>{
        const v=+sr.values[i]||0;
        s+='<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(v).toFixed(1)+'" r="2.4" fill="'+sr.color+'"/>'+
           '<text x="'+X(i).toFixed(1)+'" y="'+(Y(v)-5).toFixed(1)+'" text-anchor="middle" font-size="8" fill="'+T().muted+'">'+v+'</text>';
      });
    }
    labels.forEach((l,i)=>{ s+='<text x="'+X(i).toFixed(1)+'" y="'+(H-2)+'" text-anchor="middle" font-size="8.5" fill="'+T().axis+'">'+esc(l)+'</text>'; });
  } else {
    const gw=(W-padL)/Math.max(1,n);
    const bw=Math.min(26,Math.max(5,(gw-14)/Math.max(1,series.length)));
    labels.forEach((l,gi)=>{
      const x0=padL+gi*gw+(gw-bw*series.length)/2;
      series.forEach((sr,si)=>{
        const v=+sr.values[gi]||0, h=(H-padT-padB)*v/maxV;
        const x=x0+si*bw, y=H-padB-h;
        s+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+(bw-2).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="1.5" fill="'+sr.color+'"/>';
        if(v>0) s+='<text x="'+(x+(bw-2)/2).toFixed(1)+'" y="'+(y-2.5).toFixed(1)+'" text-anchor="middle" font-size="8.5" font-weight="600" fill="'+T().label+'">'+v+'</text>';
      });
      s+='<text x="'+(padL+gi*gw+gw/2).toFixed(1)+'" y="'+(H-3)+'" text-anchor="middle" font-size="9" font-weight="600" fill="'+T().label+'">'+esc(l)+'</text>';
    });
  }
  return '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+s+'</svg>';
}
