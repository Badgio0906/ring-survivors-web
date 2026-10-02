(() => {
  const send = data => window.rsMobileEvent?.(JSON.stringify(data));
  const media = matchMedia('(any-pointer:coarse), (max-width:1000px)');
  let state, menu, toolbar, stick, knob, mobileHud, fullscreen, pointer=null, origin;
  let signature='', pointerActive=false;
  const reset = () => { pointer=null;pointerActive=false;if(knob)knob.style.transform='translate(-50%,-50%)';send({type:'move',x:0,y:0}); };
  const button = (text, action) => { const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=action;return b; };
  const create = () => {
    document.body.style.touchAction='auto';document.getElementById('canvas').style.touchAction='none';
    const style=document.createElement('style');style.textContent=`
      #rs-touch-menu{position:fixed;inset:0;z-index:50;background:#12251f;color:#f1efdf;overflow:auto;touch-action:pan-y;font:16px system-ui;padding:calc(12px + env(safe-area-inset-top)) calc(16px + env(safe-area-inset-right)) calc(78px + env(safe-area-inset-bottom)) calc(16px + env(safe-area-inset-left));box-sizing:border-box}
      #rs-touch-menu[hidden],#rs-touch-toolbar[hidden],#rs-touch-stick[hidden],#rs-touch-hud[hidden]{display:none!important}
      #rs-touch-menu h1{font-size:22px;margin:4px 0 12px}#rs-touch-menu p{white-space:pre-wrap;line-height:1.5;margin:10px 0}
      #rs-touch-menu button,#rs-touch-menu select,#rs-touch-menu input,#rs-touch-toolbar button{font:inherit;min-height:44px;border-radius:8px;border:1px solid #859c75;background:#263f34;color:#f6f3e2;padding:8px;box-sizing:border-box}
      #rs-touch-menu button:disabled{opacity:.4}#rs-touch-menu button:focus-visible{outline:3px solid #ffd36a}
      #rs-touch-menu label{display:flex;gap:12px;align-items:center;margin:12px 0;flex-wrap:wrap}#rs-touch-menu select{max-width:100%;flex:1;min-width:180px}#rs-touch-menu input{max-width:180px}
      .rs-mobile-buttons{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:12px 0}
      .rs-mobile-board{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin:12px 0}.rs-mobile-board button{font-size:12px!important;min-height:56px;overflow-wrap:anywhere}
      #rs-touch-toolbar{position:fixed;right:calc(12px + env(safe-area-inset-right));bottom:calc(12px + env(safe-area-inset-bottom));z-index:70;display:flex;gap:8px;color:#f6f3e2;font:15px system-ui}
      #rs-touch-toolbar[data-battle=true]{top:calc(8px + env(safe-area-inset-top));bottom:auto}#rs-touch-toolbar button{box-shadow:0 2px 6px #0008}
      #rs-touch-stick{position:fixed;left:calc(16px + env(safe-area-inset-left));bottom:calc(16px + env(safe-area-inset-bottom));width:124px;height:124px;z-index:60;border-radius:50%;border:2px solid #d3e3bda0;background:#1c322c88;touch-action:none;user-select:none;-webkit-user-select:none}
      #rs-touch-stick span{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:50%;background:#e8efcaaa;border:2px solid #f0f5dd;pointer-events:none}
      #rs-touch-hud{position:fixed;left:calc(8px + env(safe-area-inset-left));top:calc(8px + env(safe-area-inset-top));z-index:60;max-width:calc(100vw - 200px);padding:6px;background:#12251fcc;color:#f1efdf;white-space:pre-wrap;font:14px system-ui;pointer-events:none}
      #rs-touch-stick small{position:absolute;bottom:5px;width:100%;text-align:center;color:#fff;font:12px system-ui;pointer-events:none}
    `;document.head.append(style);
    document.querySelector('meta[name=viewport]')?.setAttribute('content','width=device-width, initial-scale=1, viewport-fit=cover');
    menu=document.createElement('section');menu.id='rs-touch-menu';menu.setAttribute('aria-label','タッチ操作メニュー');menu.hidden=true;
    toolbar=document.createElement('nav');toolbar.id='rs-touch-toolbar';toolbar.setAttribute('aria-label','スマホ操作');toolbar.hidden=true;
    const pause=button('一時停止',()=>{reset();send({type:'pause'});});pause.dataset.role='pause';
    const back=button('戻る',()=>send({type:'back'}));back.dataset.role='back';
    fullscreen=button('全画面',async()=>{
      try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen();screen.orientation?.lock?.('landscape').catch(()=>{});}else fullscreen.textContent='横向きで操作';}
      catch{fullscreen.textContent='横向きで操作';}
    });
    toolbar.append(pause,back,fullscreen);
    stick=document.createElement('div');stick.id='rs-touch-stick';stick.setAttribute('role','application');stick.setAttribute('aria-label','移動スティック');stick.hidden=true;
    knob=document.createElement('span');const caption=document.createElement('small');caption.textContent='移動';stick.append(knob,caption);
    const move=e=>{if(e.pointerId!==pointer)return;const dx=(e.clientX-origin.x)/44,dy=(e.clientY-origin.y)/44,length=Math.hypot(dx,dy);const x=length>1?dx/length:dx,y=length>1?dy/length:dy;knob.style.transform=`translate(calc(-50% + ${x*44}px),calc(-50% + ${y*44}px))`;const dead=.12;send({type:'move',x:length<dead?0:x,y:length<dead?0:y});e.preventDefault();};
    stick.onpointerdown=e=>{if(pointer!==null)return;pointer=e.pointerId;pointerActive=true;const r=stick.getBoundingClientRect();origin={x:r.left+r.width/2,y:r.top+r.height/2};stick.setPointerCapture(e.pointerId);move(e);};
    stick.onpointermove=move;stick.onpointerup=e=>{if(e.pointerId===pointer)reset();};stick.onpointercancel=reset;stick.onlostpointercapture=reset;
    mobileHud=document.createElement('div');mobileHud.id='rs-touch-hud';mobileHud.hidden=true;document.body.append(menu,toolbar,stick,mobileHud);
    addEventListener('blur',()=>{reset();send({type:'blur'});});document.addEventListener('visibilitychange',()=>{if(document.hidden){reset();send({type:'blur'});}});
    document.addEventListener('fullscreenchange',()=>{reset();fullscreen.textContent=document.fullscreenElement?'全画面終了':'全画面';});
    new MutationObserver(()=>{const blocked=!!document.getElementById('rs-analysis');if(blocked)reset();if(state)window.rsRenderMobile(JSON.stringify(state));}).observe(document.body,{childList:true});
  };
  window.rsRenderMobile = encoded => {
    state=JSON.parse(encoded);if(!menu)return;
    const blocked=!!document.getElementById('rs-analysis');
    toolbar.hidden=blocked||!window.rsTouchEnabled;
    const battle=state.mode==='battle';toolbar.dataset.battle=String(battle);mobileHud.hidden=!window.rsTouchEnabled||!battle||blocked;mobileHud.textContent=state.status||'';
    toolbar.querySelector('[data-role=pause]').hidden=!battle;
    toolbar.querySelector('[data-role=back]').hidden=battle||state.mode==='web_gate'||['show_upgrades','show_awakening','show_unique','show_pending_reward','show_save_error'].includes(state.menu);
    stick.hidden=!window.rsTouchEnabled||!battle||state.frozen||blocked;
    if(!battle&&pointerActive)reset();
    menu.hidden=!window.rsTouchEnabled||battle||!state.panel;
    if(menu.hidden)return;
    const next=JSON.stringify(state);if(next===signature)return;signature=next;
    // Preserve a select/number edit until its own change event completes.
    if(menu.contains(document.activeElement)&&['SELECT','INPUT'].includes(document.activeElement.tagName))return;
    const scroll=menu.scrollTop,oldPanel=menu.dataset.panel;menu.dataset.panel=String(state.panel);menu.replaceChildren();
    const title=document.createElement('h1');title.textContent=state.title||'リングサバイバーズ';menu.append(title);
    if(state.mode==='web_gate'){
      const tip=document.createElement('p');tip.textContent='横向きでのプレイがおすすめです。左下のスティックで移動、攻撃は自動です。';menu.append(tip,button('タップして開始',()=>send({type:'start'})));return;
    }
    const texts=document.createElement('details'),summary=document.createElement('summary');summary.textContent='説明・現在の能力を表示';texts.append(summary);
    for(const text of state.texts){const p=document.createElement('p');p.textContent=text.replace(/\[\/?(?:color[^\]]*|b)\]/g,'');texts.append(p);}menu.append(texts);
    if(state.graph){
      const graph=state.graph,colors=['#f0d778','#7ed5ff','#f0a7da','#99e4b3','#ffab73','#bdb0ff','#d3e3ee'];
      const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 600 240');svg.setAttribute('role','img');svg.setAttribute('aria-label','スキル別1分DPS推移');svg.style.cssText='width:100%;background:#071913;margin:12px 0';
      const add=(kind,attrs,text)=>{const el=document.createElementNS(ns,kind);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);if(text)el.textContent=text;svg.append(el);};
      const max=Math.max(1,...graph.buckets.flatMap(b=>graph.ids.map(id=>b.sources[id]?.DPS||0)));
      const px=t=>45+Math.min(1,t/Math.max(1,graph.end))*520,py=v=>205-v/max*175;
      for(let i=0;i<=4;i++){const y=205-i*175/4;add('line',{x1:45,x2:565,y1:y,y2:y,stroke:'#496259'});add('text',{x:2,y:y+5,fill:'#e4edde','font-size':12},(max*i/4).toFixed(1));}
      graph.ids.forEach((id,i)=>{let points=[];for(const b of graph.buckets){const v=b.sources[id]?.DPS;if(v==null){if(points.length)add('polyline',{points:points.join(' '),fill:'none',stroke:colors[i%7],'stroke-width':2});points=[];continue;}points.push(`${px(b.end_game_time)},${py(v)}`);add('circle',{cx:px(b.end_game_time),cy:py(v),r:3,fill:colors[i%7]});}if(points.length)add('polyline',{points:points.join(' '),fill:'none',stroke:colors[i%7],'stroke-width':2});});
      add('text',{x:45,y:232,fill:'#e4edde','font-size':12},'0秒');add('text',{x:510,y:232,fill:'#e4edde','font-size':12},`${Math.round(graph.end)}秒`);menu.append(svg);
      const legend=document.createElement('p');graph.ids.forEach((id,i)=>{const span=document.createElement('span');span.style.color=colors[i%7];span.textContent=`● ${graph.names[id]||id}  `;legend.append(span);});menu.append(legend);
      for(const b of graph.buckets){const detail=document.createElement('details'),title=document.createElement('summary');title.textContent=`${Math.round(b.start_game_time)}〜${Math.round(b.end_game_time)}秒 / Lv${b.player_level_at_start}→${b.player_level_at_end}`;detail.append(title);const p=document.createElement('p');p.textContent=graph.ids.map(id=>`${graph.names[id]||id}: ${b.sources[id]?.DPS==null?'未取得':b.sources[id].DPS.toFixed(2)} DPS`).join('\n');detail.append(p);menu.append(detail);}
    }
    const call=(control,value)=>send({type:'control',panel:state.panel,id:control.id,value});
    const board=document.createElement('div');board.className='rs-mobile-board';
    const actions=document.createElement('div');actions.className='rs-mobile-buttons';
    for(const c of state.controls){
      if(c.kind==='select'){
        const label=document.createElement('label');label.textContent=c.text;const select=document.createElement('select');select.setAttribute('aria-label',c.text);
        for(const o of c.options){const option=document.createElement('option');option.textContent=o.text;option.value=o.value;option.disabled=o.disabled;select.append(option);}select.value=c.value;
        select.onchange=()=>{call(c,Number(select.value));select.blur();signature='';};label.append(select);menu.append(label);
      }else if(c.kind==='range'){
        const label=document.createElement('label');label.textContent=c.text;const input=document.createElement('input');input.type='number';input.min=c.min;input.max=c.max;input.step=c.step;input.value=c.value;input.setAttribute('aria-label',c.text);input.onchange=()=>{call(c,Number(input.value));input.blur();signature='';};label.append(input);menu.append(label);
      }else{
        const b=button(c.text,()=>call(c));b.disabled=c.disabled;b.dataset.controlId=c.id;
        if(c.kind==='slot'){b.style.gridColumn=c.column+1;b.style.gridRow=c.row+1;if(c.key===state.slot_selected)b.style.outline='2px solid #ffd36a';board.append(b);}else actions.append(b);
      }
    }
    if(board.childElementCount){menu.append(board);const remove=button('選択した枠のリングを外す',()=>send({type:'unequip'}));remove.disabled=!state.unequip;menu.append(remove);}
    menu.append(actions);menu.scrollTop=oldPanel===String(state.panel)?scroll:0;
  };
  const update = () => {
    const forced=new URLSearchParams(location.search).get('touch')==='1';window.rsTouchEnabled=media.matches||forced;
    if(!window.rsTouchEnabled){reset();if(menu)menu.hidden=true;if(toolbar)toolbar.hidden=true;if(stick)stick.hidden=true;if(mobileHud)mobileHud.hidden=true;}
    signature='';if(state)window.rsRenderMobile(JSON.stringify(state));
  };
  document.addEventListener('DOMContentLoaded',()=>{create();update();});media.addEventListener('change',update);addEventListener('resize',()=>{reset();update();});
})();
