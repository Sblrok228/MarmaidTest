const MLG = (() => {
  // ====== EDIT YOUR PRIZES HERE (safe placeholders) ======
  // Replace labels with your own text (you can put ANY words you want here yourself).
  const PRIZES = [
    { t:"TG", w:10 },
    { t:"CUSTOM", w:1 },      // rare
    { t:"VIP", w:1 },         // rare
    { t:"CALL", w:1 },        // rare
    { t:"TEASING", w:9 },
    { t:"PHOTO SET", w:12 },
    { t:"VIDEO", w:12 },
    { t:"SURPRISE", w:9 },
    { t:"SEXTING", w:10 },
    { t:"DP", w:1 }           // rare (оставил как метку — если не хочешь, поменяй)
  ];
  // ======================================================

  function $(id){ return document.getElementById(id); }

  // Safari blocks autoplay: do it via button
  function setupMusicButton(){
    const bg = $("bgMusic");
    const btn = $("musicBtn");
    if(!bg || !btn) return;

    let on = false;
    const sync = () => btn.textContent = on ? "🔊 Music ON" : "🔇 Music OFF";

    btn.addEventListener("click", async () => {
      try{
        if(!on){ await bg.play(); on = true; }
        else { bg.pause(); on = false; }
      }catch(e){ on = false; }
      sync();
    });

    sync();
  }

  function spawnShells(count=60){
    for(let i=0;i<count;i++){
      const s = document.createElement("img");
      s.src = "assets/shell.png";
      s.className = "shell";
      const size = 32 + Math.random()*90;
      s.style.width = size + "px";
      s.style.left = (Math.random()*100) + "vw";
      s.style.top  = (Math.random()*100) + "vh";
      s.style.transform = `rotate(${Math.random()*360}deg)`;
      s.style.opacity = (0.20 + Math.random()*0.55).toFixed(2);
      document.body.appendChild(s);
    }
  }

  function spawnFloatingEmojis(count=75){
    const emojis = ["😈","🥵","💦","🍆","😏","🍓","🍑"];
    for(let i=0;i<count;i++){
      const e = document.createElement("div");
      e.className = "floatingEmoji";
      e.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      e.style.left = (Math.random()*100) + "vw";
      e.style.top  = (Math.random()*100) + "vh";
      e.style.fontSize = (18 + Math.random()*26) + "px";

      const dur = 9 + Math.random()*18;
      const dx = -60 + Math.random()*120;
      const dy = -80 + Math.random()*160;
      const delay = -Math.random()*dur;

      e.animate([
        { transform:`translate(0px,0px)` },
        { transform:`translate(${dx}px, ${dy}px)` },
        { transform:`translate(0px,0px)` }
      ], {
        duration: dur*1000,
        iterations: Infinity,
        direction: "alternate",
        easing: "ease-in-out",
        delay: delay*1000
      });

      document.body.appendChild(e);
    }
  }

  function showJackpot(){
    const fx = $("fxLayer");
    if(!fx) return;

    fx.innerHTML = "";
    const overlay = document.createElement("div");
    overlay.className = "jackpotOverlay";

    const t = document.createElement("div");
    t.className = "jackpotText";
    t.textContent = "JACKPOT!";
    overlay.appendChild(t);

    const c = document.createElement("canvas");
    c.width = innerWidth;
    c.height = innerHeight;
    c.style.position = "fixed";
    c.style.inset = "0";
    overlay.appendChild(c);

    fx.appendChild(overlay);

    const sfx = $("jackpotSfx");
    if(sfx){ sfx.currentTime = 0; sfx.play().catch(()=>{}); }

    const ctx = c.getContext("2d");
    const parts = Array.from({length: 380}).map(()=>({
      x: Math.random()*c.width,
      y: -40 - Math.random()*c.height*0.6,
      vx: -3 + Math.random()*6,
      vy: 2 + Math.random()*8,
      r: 3 + Math.random()*6,
      a: Math.random()*Math.PI*2,
      va: -0.25 + Math.random()*0.5,
      hue: Math.floor(Math.random()*360)
    }));

    let frames = 0;
    (function anim(){
      frames++;
      ctx.clearRect(0,0,c.width,c.height);

      for(const p of parts){
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.va;
        p.vy += 0.03;

        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = `hsla(${p.hue},100%,60%,0.95)`;
        ctx.fillRect(-p.r, -p.r, p.r*2.2, p.r*2.2);
        ctx.restore();

        if(p.y > c.height + 60){
          p.y = -40;
          p.x = Math.random()*c.width;
          p.vy = 2 + Math.random()*8;
        }
      }

      // sparkles
      for(let i=0;i<16;i++){
        ctx.beginPath();
        ctx.arc(Math.random()*c.width, Math.random()*c.height*0.55, 1+Math.random()*2, 0, Math.PI*2);
        ctx.fillStyle="rgba(255,255,255,.65)";
        ctx.fill();
      }

      if(frames < 260) requestAnimationFrame(anim);
    })();

    setTimeout(()=>{ fx.innerHTML=""; }, 4400);
  }

  // ===== Roulette =====
  function initRoulette(){
    setupMusicButton();
    spawnShells();
    spawnFloatingEmojis();

    const canvas = $("wheel");
    const btn = $("spinBtn");
    if(!canvas || !btn) return;

    const ctx = canvas.getContext("2d");
    const cx = canvas.width/2;
    const cy = canvas.height/2;
    const R  = Math.min(cx,cy) - 18;

    const items = PRIZES;
    const slice = (Math.PI*2)/items.length;
    let rot = 0;
    let spinning = false;

    const spinSfx = $("spinSfx");

    function pickWeighted(){
      const total = items.reduce((s,i)=>s+i.w,0);
      let r = Math.random()*total;
      for(let i=0;i<items.length;i++){
        r -= items[i].w;
        if(r <= 0) return i;
      }
      return items.length-1;
    }

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);

      // outer neon ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx,cy,R+8,0,Math.PI*2);
      ctx.strokeStyle="rgba(64,246,255,.95)";
      ctx.lineWidth=12;
      ctx.shadowColor="rgba(64,246,255,.85)";
      ctx.shadowBlur=34;
      ctx.stroke();
      ctx.restore();

      for(let i=0;i<items.length;i++){
        const a0 = rot + i*slice;
        const a1 = a0 + slice;

        const hue = (i*36)%360;
        const grad = ctx.createRadialGradient(cx,cy,50,cx,cy,R);
        grad.addColorStop(0, `hsla(${hue},100%,75%,0.35)`);
        grad.addColorStop(0.55, `hsla(${hue},100%,58%,0.98)`);
        grad.addColorStop(1, `hsla(${hue},100%,46%,1)`);

        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.arc(cx,cy,R,a0,a1);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.shadowColor = `hsla(${hue},100%,65%,.60)`;
        ctx.shadowBlur = 20;
        ctx.fill();

        // separators
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.arc(cx,cy,R,a0,a0+0.012);
        ctx.strokeStyle="rgba(255,255,255,.25)";
        ctx.lineWidth=2;
        ctx.stroke();
        ctx.restore();

        // label readable
        const label = items[i].t;
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(a0 + slice/2);

        ctx.textAlign = "right";
        ctx.font = "900 18px system-ui";
        ctx.lineWidth = 6;
        ctx.strokeStyle = "rgba(0,0,0,.70)";
        ctx.strokeText(label, R-20, 9);

        ctx.fillStyle = "rgba(255,255,255,.98)";
        ctx.shadowColor = "rgba(255,79,216,.55)";
        ctx.shadowBlur = 14;
        ctx.fillText(label, R-20, 9);
        ctx.restore();
      }

      // center cap
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx,cy,60,0,Math.PI*2);
      ctx.fillStyle="rgba(0,0,0,.35)";
      ctx.shadowColor="rgba(255,79,216,.45)";
      ctx.shadowBlur=20;
      ctx.fill();
      ctx.restore();
    }

    function spin(){
      if(spinning) return;
      spinning = true;

      if(spinSfx){ spinSfx.currentTime = 0; spinSfx.play().catch(()=>{}); }

      const winnerIndex = pickWeighted();
      const mid = winnerIndex*slice + slice/2;
      const target = (-Math.PI*0.5) - mid;

      const extraTurns = 9 + Math.random()*3;
      const start = rot;
      const end = target + extraTurns*Math.PI*2;

      const duration = 11000; // slow
      const t0 = performance.now();
      const ease = (x)=>1-Math.pow(1-x,3);

      function frame(now){
        const p = Math.min(1, (now-t0)/duration);
        rot = start + (end-start)*ease(p);
        draw();
        if(p < 1) requestAnimationFrame(frame);
        else{
          spinning = false;
          showJackpot();
        }
      }
      requestAnimationFrame(frame);
    }

    draw();
    btn.addEventListener("click", spin, {passive:true});
  }

  // ===== Slots =====
  function initSlots(){
    setupMusicButton();
    spawnShells();
    spawnFloatingEmojis();

    const btn = $("slotBtn");
    const r1 = $("r1");
    const r2 = $("r2");
    const r3 = $("r3");
    const reelSfx = $("reelSfx");
    if(!btn || !r1 || !r2 || !r3) return;

    const symbols = ["😈","🥵","💦","🍆","😏","🍓","🍑"];
    const rand = () => symbols[Math.floor(Math.random()*symbols.length)];
    let spinning = false;

    btn.addEventListener("click", ()=>{
      if(spinning) return;
      spinning = true;

      if(reelSfx){ reelSfx.currentTime = 0; reelSfx.play().catch(()=>{}); }

      const dur = 4200;
      const t0 = performance.now();

      function tick(now){
        r1.textContent = rand();
        r2.textContent = rand();
        r3.textContent = rand();

        if(now - t0 < dur){
          requestAnimationFrame(tick);
        }else{
          if(reelSfx) reelSfx.pause();

          const jackpot = Math.random() < 0.60; // часто 3 в ряд
          if(jackpot){
            const s = rand();
            r1.textContent = s; r2.textContent = s; r3.textContent = s;
            showJackpot();
          }else{
            const s = rand();
            r1.textContent = s; r2.textContent = s; r3.textContent = rand();
          }

          spinning = false;
        }
      }
      requestAnimationFrame(tick);
    }, {passive:true});
  }

  // ===== Dice =====
  // UPDATED DICE: faster + spin + bounce + not transparent
  function initDice(){
    setupMusicButton();
    spawnShells();
    spawnFloatingEmojis();

    const btn = $("diceBtn");
    const dice = $("diceBig");
    if(!btn || !dice) return;

    let running = false;

    // ensure visible
    dice.style.opacity = "1";

    btn.addEventListener("click", ()=>{
      if(running) return;
      running = true;

      // reset state
      dice.style.transition = "0s";
      dice.style.opacity = "1";
      dice.style.transform = "translateX(-140%) scale(.25) rotate(0deg)";
      dice.textContent = "🎲";

      // force reflow to apply reset instantly
      void dice.offsetWidth;

      // 1) approach + spin (SHORTER)
      const approachMs = 6000; // было 15000, теперь 6 секунд
      dice.style.transition = `${approachMs}ms cubic-bezier(.12,.9,.12,1)`;
      dice.style.transform = "translateX(0%) scale(3.1) rotate(1080deg)";

      // 2) bounce / toss
      setTimeout(()=>{
        dice.style.transition = "950ms ease-in-out";
        // small toss up + extra spin
        dice.style.transform = "translateX(0%) scale(3.2) rotate(1440deg) translateY(-46px)";
      }, approachMs);

      // 3) reveal face + jackpot
      setTimeout(()=>{
        const faces = ["⚀","⚁","⚂","⚃","⚄","⚅"];
        dice.textContent = faces[Math.floor(Math.random()*faces.length)];
        showJackpot();
      }, approachMs + 450);

      // 4) reset back
      setTimeout(()=>{
        dice.style.transition = "0s";
        dice.style.transform = "translateX(-140%) scale(.25) rotate(0deg)";
        dice.textContent = "🎲";
        running = false;
      }, approachMs + 2000);

    }, {passive:true});
  }

  function initHub(){
    setupMusicButton();
    spawnShells();
    spawnFloatingEmojis();
  }

  return { initHub, initRoulette, initSlots, initDice };
})();

window.MLG = MLG;




