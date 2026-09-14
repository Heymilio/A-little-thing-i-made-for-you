const $ = s => document.querySelector(s);
const home = $("#home"), game = $("#game"), finalScreen = $("#final");
const miniGame = $("#miniGame"), instruction = $("#instruction");
const hintBox = $("#hintBox"), continueBtn = $("#continueBtn");
const stageLabel = $("#stageLabel"), progress = $("#progress");
const music = $("#bgMusic"), musicBtn = $("#musicBtn");

let stage = 0, selectedPiece = null, memoryState = [], memoryFirst = null;
const stages = [
 {hint:"Cuando el día se queda en silencio, hay una luz que sigue allí. No la busques en el cielo. Busca su reflejo en la tierra", type:"constellation"},
 {hint:"Si la noche te mostró el camino, ahora deja que la luz te guíe. Busca aquello que siempre encuentra la forma de brillar.", type:"pieces"},
 {hint:"No siempre necesitas mirar. A veces basta con escuchar. Busca aquello que nunca deja de moverse.", type:"memory"},
 {hint:"El agua también sabe quedarse quieta. Cuando el movimiento desaparece, queda aquello que parece guardar el tiempo.", type:"perception"},
 {hint:"Después del frío, busca aquello que nunca sabe quedarse quieto. No necesita hablar para hacerse notar.", type:"chaos"},
 {hint:"Has seguido la luz. Has seguido el agua. Has encontrado el frío y el fuego. Ahora busca aquello que representa una decisión.", type:"hangman"}
];

function ambient(){
  const a=$("#ambient"), d=$("#doodles");
  for(let i=0;i<32;i++){
    const e=document.createElement("span");
    e.className=`dot ${i%2?"jade":"hazel"}`;
    e.style.left=Math.random()*100+"%"; e.style.top=Math.random()*100+"%";
    e.style.setProperty("--dur",(5+Math.random()*7)+"s");
    a.appendChild(e);
  }
  ["✦","·","♡","╱","◇","✧","✦","╲"].forEach((s,i)=>{
    const e=document.createElement("span");
    e.className=`doodle ${i%2?"":"hazel"}`; e.textContent=s;
    e.style.left=(5+Math.random()*90)+"%"; e.style.top=(8+Math.random()*80)+"%";
    e.style.animationDelay=(-Math.random()*8)+"s"; d.appendChild(e);
  });
}
ambient();

function burst(count=14){
  const layer=$("#ambient");
  for(let i=0;i<count;i++){
    const e=document.createElement("span");
    e.className=`dot ${i%2?"jade":"hazel"}`;
    e.style.left=(45+Math.random()*10)+"%"; e.style.top=(45+Math.random()*10)+"%";
    e.style.width=e.style.height=(2+Math.random()*4)+"px";
    e.style.animation=`burst .9s ease forwards`;
    const dx=(Math.random()*240-120), dy=(Math.random()*200-100);
    e.style.setProperty("--dx",dx+"px"); e.style.setProperty("--dy",dy+"px");
    layer.appendChild(e); setTimeout(()=>e.remove(),1000);
  }
}
const burstStyle=document.createElement("style");
burstStyle.textContent="@keyframes burst{to{transform:translate(var(--dx),var(--dy));opacity:0}}";
document.head.appendChild(burstStyle);

function progressDraw(){
  progress.innerHTML="";
  for(let i=0;i<stage+1;i++){
    const s=document.createElement("span");
    s.className="progress-star "+(i<stage?"done":"");
    s.textContent="✦"; progress.appendChild(s);
  }
}
function walkIn(){}
function winCharacter(){burst(20)}
function wrongCharacter(){burst(4)}
function resetPanels(){
  hintBox.classList.add("hidden"); continueBtn.classList.add("hidden");
  hintBox.innerHTML="";
  miniGame.innerHTML="";
}
function renderInstruction(title, sub=""){
  instruction.innerHTML=`<h2>${title}</h2>${sub?`<p>${sub}</p>`:""}`;
}
function startStage(n){
  stage=n; stageLabel.textContent=String(n+1).padStart(2,"0"); progressDraw();
  resetPanels();
  if(n===0) renderInstruction("Encuentra el patrón.","Hay algo que no encaja.");
  if(n===1) renderInstruction("Hay una forma escondida aquí.","Ordénala.");
  if(n===2) renderInstruction("¿Lo recuerdas?","");
  if(n===3) renderInstruction("Mira un poco más de cerca.","");
  if(n===4) renderInstruction("Creo que algo se perdió.","Encuéntralo.");
  if(n===5) renderInstruction("A ver si puedes descubrirlo.","");
  [renderConstellation,renderPieces,renderMemory,renderPerception,renderChaos,renderHangman][n]();
}

function completeStage(){
  if(stage===5){ // stage 6 is followed by the final
    showHint(stages[stage].hint,true); return;
  }
  showHint(stages[stage].hint,false);
}
function showHint(text,last=false){
  miniGame.classList.add("fade-out"); instruction.classList.add("fade-out");
  setTimeout(()=>{
    miniGame.innerHTML=""; instruction.innerHTML="";
    miniGame.classList.remove("fade-out"); instruction.classList.remove("fade-out");
    hintBox.innerHTML=`<div class="hint-title">PISTA DESBLOQUEADA</div><div>${text}</div>`;
    hintBox.classList.remove("hidden");
    continueBtn.classList.remove("hidden");
    continueBtn.textContent="continuar →";
    if(last) continueBtn.onclick=()=>showFinal();
    else continueBtn.onclick=()=>startStage(stage+1);
  },520);
}

function renderConstellation(){
  const wrap=document.createElement("div"); wrap.className="constellation";
  const pts=[["18","25"],["42","12"],["68","28"],["82","62"],["54","78"],["29","67"],["50","48"]];
  const wrong=6;
  pts.forEach((p,i)=>{
    const b=document.createElement("button"); b.className=`constellation-star ${i%2?"jade":"hazel"}`;
    b.textContent="✦"; b.style.left=p[0]+"%"; b.style.top=p[1]+"%";
    b.onclick=()=>{
      if(i!==wrong){ b.animate([{transform:"translateX(-5px)"},{transform:"translateX(5px)"},{transform:"translateX(0)"}],{duration:260}); wrongCharacter(); return; }
      b.classList.add("correct"); winCharacter();
      wrap.querySelectorAll(".constellation-star").forEach((x,j)=>setTimeout(()=>x.classList.add("correct"),j*90));
      setTimeout(completeStage,850);
    }; wrap.appendChild(b);
  });
  miniGame.appendChild(wrap);
}

function renderPieces(){
  selectedPiece=null;
  const wrap=document.createElement("div"); wrap.className="pieces";
  const symbols=["◇","✦","♡","·"]; 
  symbols.forEach((sym,i)=>{
    const b=document.createElement("button"); b.className="piece "+(i%2?"hazel":""); b.textContent=sym;
    b.dataset.pos=i;
    b.onclick=()=>{
      if(selectedPiece===null){selectedPiece=b;b.classList.add("selected");return}
      if(selectedPiece===b){b.classList.remove("selected");selectedPiece=null;return}
      const a=selectedPiece, temp=a.textContent; a.textContent=b.textContent;b.textContent=temp;
      a.classList.remove("selected");selectedPiece=null;
      const vals=[...wrap.children].map(x=>x.textContent).join("");
      if(vals==="◇✦♡·"){winCharacter();setTimeout(completeStage,700)}
    }; wrap.appendChild(b);
  });
  // scramble initial order intentionally
  [wrap.children[0].textContent,wrap.children[2].textContent]=[wrap.children[2].textContent,wrap.children[0].textContent];
  miniGame.appendChild(wrap);
}

function renderMemory(){
  const wrap=document.createElement("div"); wrap.className="memory-grid";
  const symbols=["✦","♡","◇","·","✧"];
  memoryState=[...symbols,...symbols]; memoryFirst=null;
  const order=[2,4,0,3,1,1,3,0,4,2];
  order.forEach((v)=>{
    const b=document.createElement("button"); b.className="memory-card hidden-symbol"; b.textContent=symbols[v]; b.dataset.value=symbols[v];
    b.onclick=()=>{
      if(b.classList.contains("locked")||b.classList.contains("revealed")) return;
      b.classList.add("revealed");
      if(!memoryFirst){memoryFirst=b;return}
      if(memoryFirst.dataset.value===b.dataset.value){
        memoryFirst.classList.add("locked"); b.classList.add("locked"); memoryFirst=null;
        if([...wrap.children].every(x=>x.classList.contains("locked"))){winCharacter();setTimeout(completeStage,750)}
      }else{
        wrongCharacter(); const old=memoryFirst; memoryFirst=null;
        setTimeout(()=>{old.classList.remove("revealed");b.classList.remove("revealed")},450);
      }
    }; wrap.appendChild(b);
  });
  wrap.querySelectorAll(".memory-card").forEach(x=>x.classList.add("revealed"));
  miniGame.appendChild(wrap);
  setTimeout(()=>wrap.querySelectorAll(".memory-card:not(.locked)").forEach(x=>x.classList.remove("revealed")),1900);
}

function renderPerception(){
  const wrap=document.createElement("div"); wrap.className="perception";
  const glyphs=["✦","·","◇","╱","♡","✧","·","◇","✦","╲","·","✧","◇","·","✦","♡","╱","◇"];
  const odd=11;
  glyphs.forEach((g,i)=>{
    const e=document.createElement("button"); e.className="shape "+(i===odd?"odd":""); e.textContent=g;
    e.style.left=(5+(i*37)%88)+"%"; e.style.top=(8+(i*61)%76)+"%";
    e.onclick=()=>{
      if(i!==odd){wrongCharacter();return}
      e.animate([{transform:"scale(1)"},{transform:"scale(1.8)"},{transform:"scale(0)"}],{duration:650});
      winCharacter();setTimeout(completeStage,750);
    }; wrap.appendChild(e);
  });
  miniGame.appendChild(wrap);
}

function renderChaos(){
  const wrap=document.createElement("div"); wrap.className="chaos";
  const glyphs=["✦","·","♡","◇","✧","╱","✦","·","◇","♡","✧","·","✦","◇","╲","♡","·","✧","◇","✦","·","♡","◇"];
  const target=17;
  glyphs.forEach((g,i)=>{
    const e=document.createElement("button"); e.className="item "+(i===target?"target":""); e.textContent=g;
    e.style.left=(4+(i*31)%90)+"%"; e.style.top=(5+(i*53)%82)+"%";
    e.style.animationDelay=(-Math.random()*3)+"s";
    e.onclick=()=>{
      if(i!==target){wrongCharacter();return}
      e.textContent="✦"; e.style.color="var(--jade)";
      winCharacter();setTimeout(completeStage,750);
    }; wrap.appendChild(e);
  });
  miniGame.appendChild(wrap);
}

function renderHangman(){
  const wrap=document.createElement("div"); wrap.className="hangman";
  const drawing=document.createElement("pre"); drawing.className="hang-drawing";
  const wordEl=document.createElement("div"); wordEl.className="hang-word";
  const keyboard=document.createElement("div"); keyboard.className="keyboard";
  const status=document.createElement("div"); status.className="hang-status";
  wrap.append(drawing,wordEl,keyboard,status); miniGame.appendChild(wrap);

  const word="DESTINO"; let guessed=new Set(), errors=0, finished=false;
  const drawings=["","┌──┐","┌──┐\n  │","┌──┐\n  │  O","┌──┐\n  │  O\n  │  │","┌──┐\n  │  O\n  │ /│","┌──┐\n  │  O\n  │ /│\\","┌──┐\n  │  O\n  │ /│\\\n  │ /","┌──┐\n  │  O\n  │ /│\\\n  │ / \\" ];
  function update(){
    wordEl.textContent=[...word].map(c=>guessed.has(c)?c:"_").join(" ");
    drawing.textContent=drawings[errors];
    status.textContent=`Errores: ${errors}/8`;
  }
  function success(){
    finished=true; keyboard.querySelectorAll("button").forEach(b=>b.disabled=true);
    winCharacter();
    setTimeout(()=>{
      miniGame.classList.add("fade-out"); instruction.classList.add("fade-out");
      setTimeout(()=>{
        miniGame.innerHTML=""; instruction.innerHTML="";
        miniGame.classList.remove("fade-out"); instruction.classList.remove("fade-out");
        miniGame.innerHTML='<div class="destination-message"><div class="destination-word">DESTINO</div><div>Quizá este camino también tenía un destino.</div></div>';
        setTimeout(completeStage,1800);
      },500);
    },650);
  }
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(letter=>{
    const b=document.createElement("button"); b.className="key"; b.textContent=letter;
    b.onclick=()=>{
      if(finished)return; b.disabled=true;
      if(word.includes(letter)) guessed.add(letter); else {errors++; wrongCharacter();}
      update();
      if([...word].every(c=>guessed.has(c))) success();
      else if(errors>=8){
        setTimeout(()=>{errors=0;guessed.clear();keyboard.querySelectorAll("button").forEach(x=>x.disabled=false);update()},700);
      }
    }; keyboard.appendChild(b);
  });
  update();
}

function showFinal(){
  game.classList.add("hidden"); finalScreen.classList.remove("hidden");
  const c=$("#finalContent"); c.innerHTML="";
  const lines=[
    "Has llegado hasta aquí.",
    "Y si ha sido un camino largo,",
    "algo que tal vez me complicó mucho...",
    "pero bueno, ya llegados hasta aquí, dime."
  ];
  let i=0;
  function next(){
    if(i<lines.length){
      c.innerHTML=`<p class="fade-in">${lines[i++]}</p>`;
      setTimeout(next,1500);
    }else{
      c.innerHTML=`<div class="final-question fade-in">¿Aceptas el último reto?</div>
      <div class="choice-row">
        <button class="choice" id="yes1">Sí, obviamente sí</button>
        <button class="choice" id="yes2">Sí... pero con nervios</button>
      </div>`;
      $("#yes1").onclick=finalHint; $("#yes2").onclick=finalHint;
    }
  } next();
}
function finalHint(){
  const c=$("#finalContent"); c.innerHTML="";
  const stars=document.createElement("div"); stars.className="final-stars";
  for(let i=0;i<80;i++){
    const s=document.createElement("span");s.className="final-star";
    s.textContent=Math.random()>.45?"✦":"·";s.style.left=Math.random()*100+"%";s.style.top=Math.random()*100+"%";
    s.style.color=Math.random()>.5?"var(--jade)":"var(--hazel)";s.style.animationDelay=(Math.random()*1.2)+"s";stars.appendChild(s);
  }
  finalScreen.appendChild(stars);
  setTimeout(()=>{
    stars.remove();
    c.innerHTML=`<div class="final-hint fade-in">Tu última pista es que hay algo que te ha estado esperando y acompañando todo este camino.<br><br>Debes encontrarlo.<br><br><span class="final-clue">Ya no necesitas buscar. Ya no necesitas seguir ninguna señal. Todo este camino te trajo hasta aquí. Ahora busca aquello que estuvo presente desde el principio.</span></div>`;
  },1900);
}
$("#startBtn").onclick=()=>{
  $("#startBtn").animate([{transform:"scale(1)"},{transform:"scale(.96)"},{transform:"scale(1)"}],{duration:240});
  burst(18);
  music.play().catch(()=>{});
  home.classList.add("hidden"); game.classList.remove("hidden");
  startStage(0);
};
musicBtn.onclick=()=>{
  if(music.paused){music.play();musicBtn.textContent="♫";musicBtn.setAttribute("aria-label","Pausar música")}
  else{music.pause();musicBtn.textContent="♪";musicBtn.setAttribute("aria-label","Reproducir música")}
};
