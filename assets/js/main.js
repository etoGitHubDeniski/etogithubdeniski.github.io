/* Точка входа: масштаб предпросмотра и первичная отрисовка.
   Часть генератора отчётов. Скрипты подключаются по порядку в index.html. */

/* ================= preview scale ================= */
function fitPreview(){
  const wrap=$("#previewWrap");
  const scale=Math.min(1,(wrap.clientWidth-46)/1280);
  const sc=$("#reportScale");
  sc.style.transform="scale("+scale+")";
  sc.style.width=(1280*scale)+"px";
  sc.style.height=(756*scale)+"px";
}
window.addEventListener("resize",fitPreview);

/* ================= init ================= */
buildEditor();
renderReport();
fitPreview();
