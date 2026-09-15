'use strict';
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const enabled = () => root.dataset.motion !== 'off' && !reduced.matches;
  const records = [];
  let introDone = !root.classList.contains('opening-running');
  let pending = false;
  const clamp = n => Math.max(0, Math.min(1, n));
  // Each element has one entrance owner and a separate hover plane.
  document.querySelectorAll('.section-heading,.needs-explorer,.service,.journey-tabs,.journey-panel,.metrics-strip,.engagement-heading,.team-card,.engagement-card,.founder-profile,.outcomes article,.mandates,.numbers-band article,.contact-copy,#enquiry-form,blockquote').forEach(element => {
    const hoverable = element.matches('.service,.team-card,.engagement-card,.founder-profile,.outcomes article,.mandates');
    const shell = document.createElement('div'); shell.className = 'motion-shell';
    shell.classList.add(element.matches('.team-card,.engagement-card') ? 'portrait-motion' : 'text-motion');
    const enter = document.createElement('div'); enter.className = 'motion-enter';
    const plane = document.createElement('div'); plane.className = hoverable ? 'motion-hover' : 'motion-content';
    element.before(shell); shell.append(enter); enter.append(plane); plane.append(element);
    const record = {shell, enter, plane, element, played:false, animation:null, hoverFrame:0}; records.push(record);
    record.reset = () => { cancelAnimationFrame(record.hoverFrame); record.hoverFrame=0; shell.classList.remove('hovered');plane.style.removeProperty('--rx');plane.style.removeProperty('--ry'); };
    if (hoverable) {
      shell.addEventListener('pointermove', event => {
        if (!enabled() || !fine.matches || event.pointerType !== 'mouse' || shell.classList.contains('moving') || shell.matches(':focus-within')) return;
        const x = event.clientX, y = event.clientY;
        cancelAnimationFrame(record.hoverFrame);
        record.hoverFrame = requestAnimationFrame(() => {
          const rect=shell.getBoundingClientRect(); // Stable, untransformed parent.
          const px=clamp((x-rect.left)/rect.width),py=clamp((y-rect.top)/rect.height);
          const tilt=element.matches('.team-card,.engagement-card') ? 5 : 0;
          plane.style.setProperty('--rx',`${(.5-py)*tilt}deg`);plane.style.setProperty('--ry',`${(px-.5)*tilt}deg`);
          plane.style.setProperty('--px',`${px*100}%`);plane.style.setProperty('--py',`${py*100}%`);shell.classList.add('hovered');
        });
      });
      shell.addEventListener('pointerleave',record.reset);shell.addEventListener('pointercancel',record.reset);
    }
    shell.addEventListener('focusin',()=>{record.animation?.cancel();shell.classList.remove('moving');record.played=true;record.reset();});
  });
  const feather=document.querySelector('.floating-feather');
  const stage=document.querySelector('.feather-stage');
  const sections=[...document.querySelectorAll('main section[id]')];
  const navLinks=[...document.querySelectorAll('#main-nav a')];
  const progress=document.querySelector('.reading-progress');
  const back=document.querySelector('.back-to-top');
  const tabs=document.querySelector('.journey-tabs');
  const rail=document.createElement('div');rail.className='journey-progress';rail.setAttribute('aria-hidden','true');
  const fill=document.createElement('span');rail.append(fill);tabs.after(rail);
  function journey(){const buttons=[...tabs.querySelectorAll('button')];const i=buttons.findIndex(b=>b.getAttribute('aria-selected')==='true');fill.style.transform=`scaleX(${(i+1)/buttons.length})`;}
  tabs.addEventListener('tabchange',journey);journey();
  function update(){
    pending=false;
    const h=innerHeight,w=innerWidth,mobile=w<=760;
    const sectionRects=sections.map(el=>({el,rect:el.getBoundingClientRect()}));
    const measurements=records.map(r=>({r,rect:r.shell.getBoundingClientRect(),visible:r.element.getClientRects().length>0}));
    const sr=stage.getBoundingClientRect(),fw=feather.offsetWidth,fh=feather.offsetHeight;
    const total=Math.max(1,document.documentElement.scrollHeight-h),p=clamp(scrollY/total);
    progress.style.transform=`scaleX(${p})`;back.hidden=scrollY<450;
    let active=sectionRects[0];for(const section of sectionRects)if(section.rect.top<h*.4)active=section;
    navLinks.forEach(a=>{if(active&&a.hash==='#'+active.el.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    sectionRects.forEach(({el,rect})=>el.style.setProperty('--chapter-progress',enabled()?clamp((h*.7-rect.top)/Math.max(1,rect.height*.5)):1));
    // Position measured from a stable stage; never from the transformed feather.
    const startX=sr.left+(sr.width-fw)/2,startY=sr.top+(sr.height-fh)/2;
    const blend=enabled()?clamp(scrollY/(h*.8)):0;
    const routeX=mobile?w-fw*.63:(w-fw)*(.5+.46*Math.cos(p*Math.PI*3));
    const routeY=(h-fh)*.4+Math.sin(p*Math.PI*4)*(mobile?12:45);
    feather.style.transform=`translate3d(${startX*(1-blend)+routeX*blend}px,${startY*(1-blend)+routeY*blend}px,0) rotate(${-10+blend*Math.sin(p*Math.PI*4)*20}deg)`;
    feather.style.opacity=String(!enabled()&&sr.bottom<0?0:(1-blend)*.95+blend*(active?.el.id==='contact'?.1:(mobile?.16:.26)));feather.classList.add('ready');
    if(!introDone)return;
    let stagger=0;
    measurements.forEach(({r,rect,visible})=>{
      // Reveal once per page load; never reset when scrolling away.
      if(!visible || rect.bottom< -160 || rect.top>h+160){return;}
      if(r.played||rect.top>h*.77||rect.bottom<90||rect.height===0)return;
      r.played=true;
      if(!enabled()||!r.enter.animate||r.shell.matches(':focus-within'))return;
      r.animation?.cancel();r.reset();r.shell.classList.add('moving');
      const heading = r.element.matches('.section-heading');
      const from = heading ? 'translateY(26px)' : (mobile ? 'translateY(22px)' : 'perspective(1200px) translateY(38px) rotateX(5deg)');
      const to = heading || mobile ? 'translateY(0)' : 'perspective(1200px) translateY(0) rotateX(0deg)';
      r.animation = r.enter.animate([{transform:from},{transform:to}], {
        duration:mobile?750:1100, delay:Math.min(stagger++,3)*90,
        easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'
      });
      r.animation.onfinish=()=>r.shell.classList.remove('moving');r.animation.oncancel=()=>r.shell.classList.remove('moving');
    });
  }
  function queue(){if(!pending){pending=true;requestAnimationFrame(update);}}
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);document.addEventListener('toggle',queue,true);
  if('ResizeObserver'in window)new ResizeObserver(queue).observe(document.body);
  back.addEventListener('click',()=>{document.querySelector('.brand').focus({preventScroll:true});scrollTo({top:0,behavior:enabled()?'smooth':'instant'});});
  const opening=document.querySelector('#brand-opening');
  let timer, finished=false, exiting=false;
  const introAnimations=[];
  function introAnimate(el,frames,options){if(!el?.animate)return null;const animation=el.animate(frames,options);introAnimations.push(animation);return animation;}
  function finishIntro(withTrail=false){
    if(finished)return;finished=true;clearTimeout(timer);clearTimeout(window.introDeadline);
    introAnimations.forEach(a=>a.cancel());
    const focused=opening?.contains(document.activeElement);
    opening?.remove();root.classList.remove('opening-running');introDone=true;
    if(focused)document.querySelector('.brand').focus({preventScroll:true});queue();
    if(withTrail&&enabled()){
      const hero=document.querySelector('.hero');const trail=document.createElement('span');
      trail.className='opening-hero-trail';trail.setAttribute('aria-hidden','true');hero.append(trail);
      const a=trail.animate([{transform:'scaleX(0)',opacity:0},{transform:'scaleX(.5)',opacity:1,offset:.45},{transform:'scaleX(1)',opacity:0}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'});
      a.onfinish=()=>trail.remove();setTimeout(()=>trail.remove(),1300);
    }
  }
  function exitIntro(){
    if(finished||exiting)return;exiting=true;
    if(!enabled()||!opening?.animate){finishIntro();return;}
    opening.style.cssText='display:grid;position:fixed;inset:0;z-index:10000;place-items:center;overflow:hidden;isolation:isolate;background:radial-gradient(ellipse at 50% 38%,rgba(156,119,41,.12),transparent 55%),#080a0c';
    const edge=document.createElement('span');edge.className='opening-exit-trail';edge.setAttribute('aria-hidden','true');opening.append(edge);
    root.classList.remove('opening-running');
    introAnimate(opening.querySelector('.opening-feather'),[{transform:'translateY(0) rotate(0deg)'},{transform:'translateY(-28px) rotate(-7deg)'}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
    introAnimate(opening.querySelector('.opening-composition'),[{opacity:1},{opacity:0}],{duration:500,easing:'ease-in',fill:'forwards'});
    const exit=introAnimate(opening,[{clipPath:'inset(0)'},{clipPath:'inset(0 0 100% 0)'}],{duration:900,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});
    introAnimate(edge,[{top:'100%',opacity:0},{opacity:1,offset:.15},{top:'0%',opacity:0}],{duration:900,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});
    exit.onfinish=()=>finishIntro(true);
  }
  if(introDone){opening?.remove();}else{
    timer=setTimeout(exitIntro,2100);
    opening.querySelector('.opening-skip').addEventListener('click',()=>finishIntro());
    document.addEventListener('keydown',e=>{if(!finished&&(e.key==='Escape'||e.key==='Tab'))finishIntro();});
  }
  document.addEventListener('introfinished',()=>finishIntro());
  addEventListener('pagehide',()=>finishIntro());
  function preference(){if(!enabled()){finishIntro();records.forEach(r=>{r.animation?.cancel();r.reset();});}queue();}
  new MutationObserver(preference).observe(root,{attributes:true,attributeFilter:['data-motion']});reduced.addEventListener('change',preference);fine.addEventListener('change',()=>records.forEach(r=>r.reset()));
  update();
})();
