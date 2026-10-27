/* Desconecta! V10 - ciclo de sessão.
   F5/recarregar preserva o progresso. Sair/fechar e voltar inicia uma sessão limpa.
   O navegador não informa com precisão qual app foi aberto; usamos pagehide + tipo de navegação. */
(() => {
  'use strict';
  const EXIT='desconectaExitPending';
  const INTERNAL='desconectaInternalNavigation';
  const nav=performance.getEntriesByType('navigation')[0];
  const type=nav?nav.type:'navigate';
  const internal=sessionStorage.getItem(INTERNAL)==='1';
  let reset=false;
  if(internal){sessionStorage.removeItem(INTERNAL);}
  else if(type==='reload'){
    // O F5 também dispara pagehide; cancela apenas essa marca, sem apagar saves.
    localStorage.removeItem(EXIT);
  } else if(localStorage.getItem(EXIT)==='1'){
    const remove=[];
    for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&key.startsWith('desconecta'))remove.push(key)}
    remove.forEach(key=>localStorage.removeItem(key));
    reset=true;
    window.__desconectaSessionReset=true;
  }
  window.marcarNavegacaoInterna=function(){sessionStorage.setItem(INTERNAL,'1')};
  window.addEventListener('pagehide',()=>{
    if(sessionStorage.getItem(INTERNAL)==='1')return;
    // Mark a departure; if it was F5, the next page load cancels this marker.
    localStorage.setItem(EXIT,'1');
  });
  if(reset){
    const showOverlay=()=>{
      if(document.getElementById('sessionPenaltyOverlay'))return;
      const overlay=document.createElement('div');overlay.id='sessionPenaltyOverlay';
      overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(1,5,13,.88);backdrop-filter:blur(12px);animation:sessionFade .35s ease';
      overlay.innerHTML='<section style="width:min(480px,100%);padding:28px;border:1px solid #79e5ff70;border-radius:24px;background:linear-gradient(145deg,#12263b,#0a1220);box-shadow:0 25px 90px #000b;color:#f3fbff;text-align:center;font-family:system-ui,Arial,sans-serif"><div style="font-size:42px;margin-bottom:10px">📵</div><h2 style="font-size:clamp(24px,5vw,32px);margin:0 0 10px;color:#8fe9ff">Sessão reiniciada</h2><p style="line-height:1.65;color:#c2d5e6;margin:0">Você saiu do Desconecta! e voltou depois. Como consequência, seus saves, moedas e compras foram zerados. Cada retorno é uma nova jornada.</p><button id="sessionPenaltyOkay" style="margin-top:22px;width:100%;border:0;border-radius:13px;padding:14px;background:linear-gradient(120deg,#1688c6,#5753dc);color:white;font-weight:800;font-size:15px;cursor:pointer">Entendi, começar de novo</button></section>';
      document.body.appendChild(overlay);
      const style=document.createElement('style');style.textContent='@keyframes sessionFade{from{opacity:0}to{opacity:1}}';document.head.appendChild(style);
      document.getElementById('sessionPenaltyOkay').addEventListener('click',()=>{overlay.style.transition='opacity .25s';overlay.style.opacity='0';setTimeout(()=>overlay.remove(),260);if(window.DesconectaAudio)window.DesconectaAudio.effect('confirm')});
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showOverlay,{once:true});else showOverlay();
  }
})();
