(()=>{'use strict';
const $=id=>document.getElementById(id), screens=['lobby','shop','fight','result'];
const skins=[
{id:'rookie',name:'Rookie',color:'#eaf5ff',price:0,desc:'The original arena contender.'},
{id:'neon',name:'Neon Pulse',color:'#55edff',price:120,desc:'Electric cyan energy.'},
{id:'inferno',name:'Inferno',color:'#ff765d',price:220,desc:'Burn bright. Hit harder.'},
{id:'venom',name:'Venom',color:'#a5ff72',price:350,desc:'Toxic green assassin.'},
{id:'royal',name:'Royal Nova',color:'#bd91ff',price:500,desc:'A champion in purple.'},
{id:'gold',name:'Golden Legend',color:'#ffd477',price:750,desc:'A rare golden champion.'},
{id:'shadow',name:'Shadow X',color:'#aab4d5',price:950,desc:'Silent, fast, ruthless.'},
{id:'cyber',name:'Cyber Knight',color:'#ff75cf',price:1200,desc:'Future-tech fighter.'}
];
let save=JSON.parse(localStorage.getItem('stickmanArenaSave')||'null')||{coins:300,owned:['rookie'],equipped:'rookie',wins:0};
let difficulty='easy',game=null,raf=0,last=0,joystick={x:0,y:0},sound=true;
function persist(){localStorage.setItem('stickmanArenaSave',JSON.stringify(save));$('coins').textContent=save.coins}
function show(id){screens.forEach(s=>$(s).classList.toggle('active',s===id));if(id==='shop')renderShop()}
function skin(){return skins.find(s=>s.id===save.equipped)||skins[0]}
function beep(name){if(!sound)return;let a=new Audio('assets/audio/'+name+'.wav');a.volume=.38;a.play().catch(()=>{})}
function renderShop(){$('skinGrid').innerHTML=skins.map(s=>{let owned=save.owned.includes(s.id),equipped=save.equipped===s.id;return `<article class="skin-card"><div class="skin-preview" style="--skin:${s.color}"><div class="mini-stick"></div></div><h3>${s.name}</h3><p>${s.desc}</p><div class="skin-bottom"><span class="price">${s.price?`◆ ${s.price}`:'FREE'}</span><button class="skin-buy ${owned?'owned':''}" data-skin="${s.id}">${equipped?'EQUIPPED':owned?'EQUIP':'BUY'}</button></div></article>`}).join('')}
$('skinGrid').addEventListener('click',e=>{let id=e.target.dataset.skin;if(!id)return;let s=skins.find(x=>x.id===id);if(save.owned.includes(id)){save.equipped=id;beep('buy')}else if(save.coins>=s.price){save.coins-=s.price;save.owned.push(id);save.equipped=id;beep('buy')}else{toast('NOT ENOUGH COINS');return}persist();renderShop()});
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),650)}
document.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>{difficulty=b.dataset.diff;document.querySelectorAll('[data-diff]').forEach(x=>x.classList.toggle('selected',x===b))});
$('playBtn').onclick=startGame;$('shopBtn').onclick=()=>show('shop');document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>show('lobby'));$('homeBtn').onclick=()=>show('lobby');$('rematchBtn').onclick=startGame;$('quitBtn').onclick=()=>{if(game){cancelAnimationFrame(raf);game=null}show('lobby')};
$('soundBtn').onclick=()=>{sound=!sound;$('soundBtn').textContent=sound?'♫':'♪'};
const canvas=$('arena'),ctx=canvas.getContext('2d');let bg=new Image(),bg2=new Image();bg.src='assets/backgrounds/arena_1.png';bg2.src='assets/backgrounds/arena_2.png';
const cfg={easy:{hp:80,damage:5,rate:1.35,speed:90,skill:0.04,label:'EASY AI'},normal:{hp:100,damage:8,rate:.95,speed:125,skill:.13,label:'NORMAL AI'},hard:{hp:125,damage:11,rate:.72,speed:155,skill:.25,label:'HARD AI'},expert:{hp:150,damage:14,rate:.52,speed:185,skill:.38,label:'EXPERT AI'}};
function fighter(x,color,side,hp){return{x,y:450,vx:0,vy:0,dir:side===0?1:-1,color,side,hp,max:hp,attack:0,flash:0,block:false,skillFx:0,walk:0}}
function startGame(){let c=cfg[difficulty];game={player:fighter(390,skin().color,0,100),cpu:fighter(890,'#ff769b',1,c.hp),time:90,elapsed:0,aiWait:.6,over:false,keys:{},lastSkill:[0,0,0],bg:Math.random()>.5?bg:bg2};$('roundName').textContent=difficulty.toUpperCase()+' MATCH';$('cpuLevel').textContent=c.label;$('playerSkinName').textContent=skin().name.toUpperCase();show('fight');updateBars();last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);toast('FIGHT!')}
function drawStick(f){let x=f.x,y=f.y,scale=1;ctx.save();ctx.translate(x,y);ctx.scale(f.dir,1);ctx.globalAlpha=f.flash>0?.65:1;ctx.shadowColor=f.color;ctx.shadowBlur=f.skillFx>0?25:9;ctx.strokeStyle=f.color;ctx.fillStyle=f.color;ctx.lineWidth=13;ctx.lineCap='round';ctx.lineJoin='round';
ctx.beginPath();ctx.arc(0,-116,19,0,Math.PI*2);ctx.stroke();ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(0,-95);ctx.lineTo(0,-35);ctx.stroke();
let swing=f.attack>0?Math.sin((f.attack/.22)*Math.PI)*.8:Math.sin(f.walk*8)*.12;
ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(0,-83);ctx.lineTo(-29,-57);ctx.lineTo(-47+swing*45,-35);ctx.moveTo(0,-83);ctx.lineTo(30,-57);ctx.lineTo(48,-35);ctx.stroke();
ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(0,-35);ctx.lineTo(-24+Math.sin(f.walk*8)*7,0);ctx.moveTo(0,-35);ctx.lineTo(25-Math.sin(f.walk*8)*7,0);ctx.stroke();
if(f.block){ctx.lineWidth=5;ctx.strokeStyle='#bdf5ff';ctx.beginPath();ctx.arc(0,-65,52,-1.4,1.4);ctx.stroke()}
if(f.skillFx>0){ctx.strokeStyle=f.color;ctx.globalAlpha=.5;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-60,65+Math.sin(f.skillFx*25)*12,0,Math.PI*2);ctx.stroke()}
ctx.restore();ctx.globalAlpha=1}
function draw(){let w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);let im=game.bg;if(im.complete&&im.naturalWidth)ctx.drawImage(im,0,0,w,h);else{let g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#182c50');g.addColorStop(1,'#10172b');ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
ctx.fillStyle='#07102088';ctx.fillRect(0,420,w,200);ctx.strokeStyle='#75dfff55';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,420);ctx.lineTo(w,420);ctx.stroke();for(let i=0;i<9;i++){ctx.strokeStyle='#7cc9ff20';ctx.beginPath();ctx.moveTo(w/2,420);ctx.lineTo(i*w/8,620);ctx.stroke()}drawStick(game.player);drawStick(game.cpu);
ctx.fillStyle='#b7c9e6';ctx.font='bold 15px Inter';ctx.fillText('PLAYER',game.player.x-30,game.player.y+28);ctx.fillText('CPU',game.cpu.x-15,game.cpu.y+28)}
function updateBars(){if(!game)return;let p=game.player,c=game.cpu;$('playerHealth').style.width=Math.max(0,p.hp/p.max*100)+'%';$('cpuHealth').style.width=Math.max(0,c.hp/c.max*100)+'%';$('playerHpText').textContent=Math.ceil(p.hp)+' / '+p.max;$('cpuHpText').textContent=Math.ceil(c.hp)+' / '+c.max;$('timer').textContent=Math.ceil(game.time)}
function hurt(target,amount){if(target.block)amount*=.22;target.hp=Math.max(0,target.hp-amount);target.flash=.12;beep('hit')}
function playerAttack(){if(!game||game.over)return;let p=game.player,c=game.cpu;if(p.attack>0)return;p.attack=.22; if(Math.abs(p.x-c.x)<145){hurt(c,10+Math.random()*5);toast('HIT!')}}
function useSkill(n){if(!game||game.over)return;let now=game.elapsed,cd=[3.5,6,12][n-1];if(now-game.lastSkill[n-1]<cd){toast('SKILL RECHARGING');return}game.lastSkill[n-1]=now;let p=game.player,c=game.cpu;p.skillFx=.5;beep(n===1?'dash':'skill');if(n===1){p.x=Math.min(1160,p.x+p.dir*95);if(Math.abs(p.x-c.x)<160)hurt(c,12)}else if(n===2){if(Math.abs(p.x-c.x)<300)hurt(c,20);else toast('TOO FAR')}else{if(Math.abs(p.x-c.x)<390)hurt(c,34);else toast('ULTIMATE MISSED')}updateBars()}
$('attackBtn').onclick=playerAttack;$('blockBtn').onpointerdown=()=>{if(game)game.player.block=true};$('blockBtn').onpointerup=$('blockBtn').onpointerleave=()=>{if(game)game.player.block=false};
['skill1','skill2','skill3'].forEach((id,i)=>$(id).onclick=()=>useSkill(i+1));
window.addEventListener('keydown',e=>{if(!game)return;game.keys[e.key.toLowerCase()]=true;if(e.key===' '){e.preventDefault();playerAttack()}if(e.key==='1')useSkill(1);if(e.key==='2')useSkill(2);if(e.key==='3')useSkill(3);if(e.key.toLowerCase()==='j')game.player.block=true});
window.addEventListener('keyup',e=>{if(game){game.keys[e.key.toLowerCase()]=false;if(e.key.toLowerCase()==='j')game.player.block=false}});
const joy=$('joystick'),knob=$('joyKnob');let joyActive=false;
function joyMove(e){let r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.34,len=Math.hypot(dx,dy);if(len>max){dx=dx/len*max;dy=dy/len*max}joystick.x=dx/max;joystick.y=dy/max;knob.style.transform=`translate(${dx}px,${dy}px)`}
joy.addEventListener('pointerdown',e=>{joyActive=true;joy.setPointerCapture(e.pointerId);joyMove(e)});joy.addEventListener('pointermove',e=>{if(joyActive)joyMove(e)});function joyEnd(){joyActive=false;joystick.x=joystick.y=0;knob.style.transform=''}joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
function loop(t){if(!game||game.over)return;let dt=Math.min(.04,(t-last)/1000);last=t;let g=game,p=g.player,c=g.cpu,conf=cfg[difficulty];g.elapsed+=dt;g.time-=dt;
let dx=(joystick.x||0)+(g.keys.d||g.keys.arrowright?1:0)-(g.keys.a||g.keys.arrowleft?1:0);p.x=Math.max(60,Math.min(1220,p.x+dx*260*dt));p.walk+=Math.abs(dx)*dt*4;p.dir=c.x>=p.x?1:-1;
p.attack=Math.max(0,p.attack-dt);p.flash=Math.max(0,p.flash-dt);p.skillFx=Math.max(0,p.skillFx-dt);
c.dir=p.x>=c.x?1:-1;c.attack=Math.max(0,c.attack-dt);c.flash=Math.max(0,c.flash-dt);c.skillFx=Math.max(0,c.skillFx-dt);
let dist=Math.abs(p.x-c.x);g.aiWait-=dt;
if(g.aiWait<=0){g.aiWait=conf.rate*(.7+Math.random()*.65);if(dist>95)c.x+=Math.sign(p.x-c.x)*Math.min(conf.speed*.35,dist-80);else if(Math.random()>.25){c.attack=.22;if(Math.random()<conf.skill&&dist<220){hurt(p,conf.damage*1.8);c.skillFx=.4;beep('skill')}else hurt(p,conf.damage)}}
if(p.block&&dist<120&&Math.random()<dt*4){}else if(!p.block&&dist<90&&Math.random()<dt*.8){}c.walk+=dt*2;
if(g.time<=0||p.hp<=0||c.hp<=0){finish(p.hp>c.hp);return}updateBars();draw();raf=requestAnimationFrame(loop)}
function finish(win){if(!game||game.over)return;game.over=true;cancelAnimationFrame(raf);let reward=win?50+(difficulty==='expert'?100:difficulty==='hard'?60:difficulty==='normal'?25:0):15;save.coins+=reward;if(win)save.wins++;persist();$('resultTitle').textContent=win?'VICTORY':'DEFEAT';$('resultTitle').style.color=win?'#ffd477':'#ff7897';$('resultEmblem').textContent=win?'✦':'☠';$('resultKicker').textContent=win?'ARENA CHAMPION':'KEEP TRAINING';$('resultDesc').textContent=win?'You dominated the arena. Claim your reward!':'The CPU got you this time. Come back stronger.';$('rewardCoins').textContent=reward;beep(win?'win':'block');show('result')}
$('coins').textContent=save.coins;persist();
if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();