/* Música ambiente e efeitos do Desconecta! sem arquivos externos. */
(()=>{'use strict';
let ctx=null,master=null,musicGain=null,musicTimer=null,step=0;
let enabled=localStorage.getItem('desconectaAudioMuted')!=='1';
const moods={
  calma:{notes:[392,440,493.88,440,349.23,392,440,392,329.63,392,440,392,349.23,392,440,392],tempo:820,wave:'sine',volume:.14,bass:.045},
  energia:{notes:[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,523.25,659.25,987.77,783.99,587.33,698.46,1046.5,880],tempo:360,wave:'square',volume:.075,bass:.075},
  foco:{notes:[329.63,392,440,392,293.66,349.23,392,349.23,261.63,329.63,392,329.63,293.66,349.23,392,349.23],tempo:620,wave:'triangle',volume:.12,bass:.06}
};
let currentMood=localStorage.getItem('desconectaMusicMood')||'calma';
if(!moods[currentMood])currentMood='calma';
function setup(){if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();master=ctx.createGain();master.gain.value=.8;master.connect(ctx.destination);musicGain=ctx.createGain();musicGain.gain.value=enabled?.12:0;musicGain.connect(master)}
function tone(freq,duration=.18,type='sine',volume=.08,when=0){if(!ctx||!enabled)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,ctx.currentTime+when);g.gain.setValueAtTime(.0001,ctx.currentTime+when);g.gain.exponentialRampToValueAtTime(Math.max(volume,.0002),ctx.currentTime+when+.025);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+when+duration);o.connect(g);g.connect(master);o.start(ctx.currentTime+when);o.stop(ctx.currentTime+when+duration+.04)}
function musicTick(){if(!ctx||!enabled)return;const mood=moods[currentMood]||moods.calma,n=mood.notes[step%mood.notes.length];const now=ctx.currentTime;
 const o=ctx.createOscillator(),g=ctx.createGain();o.type=mood.wave;o.frequency.setValueAtTime(n,now);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(mood.volume,now+.035);g.gain.exponentialRampToValueAtTime(.0001,now+Math.min(mood.tempo/1000*.88,.7));o.connect(g);g.connect(musicGain);o.start(now);o.stop(now+Math.min(mood.tempo/1000,.72));
 if(step%4===0){const b=ctx.createOscillator(),bg=ctx.createGain();b.type='sine';b.frequency.setValueAtTime(n/2,now);bg.gain.setValueAtTime(.0001,now);bg.gain.exponentialRampToValueAtTime(mood.bass,now+.04);bg.gain.exponentialRampToValueAtTime(.0001,now+.32);b.connect(bg);bg.connect(musicGain);b.start(now);b.stop(now+.34)}
 step++;
}
function stopMusicTimer(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}}
function start(){setup();if(!ctx)return;if(ctx.state==='suspended')ctx.resume();if(enabled){musicGain.gain.setTargetAtTime(.12,ctx.currentTime,.25);if(!musicTimer){musicTick();musicTimer=setInterval(musicTick,moods[currentMood].tempo)}}}
function setMood(mood){if(!moods[mood])return;currentMood=mood;step=0;try{localStorage.setItem('desconectaMusicMood',mood)}catch{};setup();if(!ctx)return;if(ctx.state==='suspended')ctx.resume();stopMusicTimer();if(enabled){musicGain.gain.setTargetAtTime(.12,ctx.currentTime,.12);musicTick();musicTimer=setInterval(musicTick,moods[currentMood].tempo)}}
function setEnabled(v){enabled=!!v;try{localStorage.setItem('desconectaAudioMuted',enabled?'0':'1')}catch{};setup();if(!ctx){updateButton();return}if(enabled){start();musicGain.gain.setTargetAtTime(.12,ctx.currentTime,.15)}else{musicGain.gain.setTargetAtTime(0,ctx.currentTime,.1);stopMusicTimer()}updateButton()}
function effect(kind='tap'){start();if(!ctx||!enabled)return;if(kind==='confirm'){tone(523.25,.12,'sine',.09);tone(783.99,.2,'sine',.07,.1)}else if(kind==='back'){tone(392,.12,'sine',.055);tone(329.63,.16,'sine',.045,.08)}else{tone(660,.075,'sine',.045);tone(880,.06,'sine',.025,.035)}}
function updateButton(){const b=document.getElementById('audioToggle');if(b){b.textContent=enabled?'♫ Música: ligada':'♪ Música: desligada';b.setAttribute('aria-pressed',String(enabled))}}
function injectButton(){if(document.getElementById('audioToggle'))return;const b=document.createElement('button');b.id='audioToggle';b.type='button';b.textContent=enabled?'♫ Música: ligada':'♪ Música: desligada';b.setAttribute('aria-pressed',String(enabled));b.style.cssText='border:1px solid #8fe9ff55;border-radius:999px;padding:7px 10px;background:#0b1728df;color:#dffaff;font:700 11px system-ui,Arial,sans-serif;box-shadow:0 8px 24px #0004;backdrop-filter:blur(10px);cursor:pointer;transition:transform .2s,background .2s;max-width:100%;white-space:nowrap';const hud=document.getElementById('hud');const lifeBox=hud&&hud.querySelector('.hudBox');if(lifeBox){b.style.position='static';b.style.display='block';b.style.marginTop='7px';lifeBox.appendChild(b)}else{b.style.position='fixed';b.style.right='14px';b.style.top='14px';b.style.zIndex='1500';document.body.appendChild(b)}b.addEventListener('click',e=>{e.stopPropagation();setEnabled(!enabled);if(enabled)effect('confirm')});b.addEventListener('pointerenter',()=>b.style.transform='translateY(-2px)');b.addEventListener('pointerleave',()=>b.style.transform='translateY(0)')}
document.addEventListener('DOMContentLoaded',()=>{injectButton();document.addEventListener('pointerdown',e=>{if(e.target.closest('button')&&!e.target.closest('#audioToggle')){start();if(enabled)effect('tap')}},{passive:true})});
window.DesconectaAudio={start,effect,setEnabled,setMood,get enabled(){return enabled},get mood(){return currentMood}};
try{const saved=localStorage.getItem('desconectaMusicMood');if(saved&&moods[saved])currentMood=saved}catch{}
})();
