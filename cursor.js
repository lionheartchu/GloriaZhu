(() => {
    'use strict';
    const fine=matchMedia('(hover: hover) and (pointer: fine)');
    const reduce=matchMedia('(prefers-reduced-motion: reduce)');
    const query=new URLSearchParams(location.search);
    const canvas=document.createElement('canvas');canvas.className='optical-cursor';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const root=document.documentElement,hero=document.querySelector('.membrane-hero'),surface=document.getElementById('membrane-canvas');
    const clickSelector='a[href],button:not(:disabled),[role="button"]:not([aria-disabled="true"]),summary,[onclick],input[type="submit"],input[type="button"]';
    const textSelector='p,li,figcaption,blockquote,td,dd,dt,pre,code,input,textarea,[contenteditable="true"],.project-desc,.record-caption';
    const titleSelector='h1,h2,h3,.brand-name,.section-title,.fb-title';
    let x=-100,y=-100,ringX=x,ringY=y,radius=11,stretch=0,angle=0,film=0,dust=0;
    let visible=false,selecting=false,raf=0,last=0,lastSample=-Infinity,hovered=null,state='background',inHero=false,inSurface=false;
    let sample={inside:false,title:false},lastBox=null;
    const reduced=()=>reduce.matches||query.get('motion')==='reduce';
    function resize(){const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(innerWidth*d);canvas.height=Math.round(innerHeight*d);ctx.setTransform(d,0,0,d,0,0);lastBox=null;paint(performance.now()/1000);}
    function setHover(target,kind){
        const next=kind==='title'||kind==='link'?target:null;
        if(hovered!==next||canvas.dataset.state!==kind){
            hovered?.classList.remove('optical-title-hover','optical-link-hover');hovered=next;
            if(next)next.classList.add(kind==='title'?'optical-title-hover':'optical-link-hover');
        }
        state=kind;canvas.dataset.state=state;canvas.dataset.inside=String(sample.inside);
        root.classList.toggle('optical-cursor-active',visible&&state!=='text');
        root.classList.toggle('optical-cursor-reading',visible&&state==='text');
    }
    function classify(now){
        const element=document.elementFromPoint(x,y);
        const rect=hero?.getBoundingClientRect();inHero=!!rect&&y>=rect.top&&y<=rect.bottom&&x>=rect.left&&x<=rect.right;
        const bounds=surface?.getBoundingClientRect();inSurface=!!bounds&&y>=bounds.top&&y<=bounds.bottom&&x>=bounds.left&&x<=bounds.right;
        if(inSurface&&now-lastSample>=50){sample=window.membraneSurface?.sample(x,y)||{inside:false,title:false};lastSample=now;}
        else if(!inSurface)sample={inside:false,title:false};
        const link=element?.closest(clickSelector);
        const text=element?.closest(textSelector);
        const title=element?.closest(titleSelector);
        const selection=!getSelection()?.isCollapsed;
        if(link&&!selecting)setHover(link,'link');
        else if(selecting||text||selection)setHover(null,'text');
        else if(title||sample.title)setHover(title,'title');
        else setHover(null,sample.inside?'membrane':'background');
        canvas.dataset.x=x.toFixed(2);canvas.dataset.y=y.toFixed(2);
    }
    function paint(t){
        if(lastBox)ctx.clearRect(lastBox.x,lastBox.y,lastBox.w,lastBox.h);
        lastBox=null;if(!visible||!fine.matches||state==='text')return;
        const pad=70,left=Math.min(x,ringX)-pad,top=Math.min(y,ringY)-pad;
        lastBox={x:left,y:top,w:Math.abs(x-ringX)+pad*2,h:Math.abs(y-ringY)+pad*2};
        ctx.save();ctx.translate(ringX,ringY);ctx.rotate(angle);
        const nameHover=state==='title'&&inHero&&sample.title;
        const tint=ctx.createLinearGradient(-radius,-radius,radius,radius);
        const alpha=state==='link'?.93:state==='title'?.68:.36+film*.34;
        tint.addColorStop(0,`rgba(113,175,215,${alpha})`);
        tint.addColorStop(.38,`rgba(150,146,224,${alpha})`);
        tint.addColorStop(.63,`rgba(202,216,245,${alpha*.65})`);
        tint.addColorStop(1,`rgba(120,119,200,${alpha})`);
        ctx.strokeStyle=nameHover?'#7775be':tint;ctx.lineWidth=state==='link'?1.35:1;
        ctx.shadowColor='rgba(158,190,245,.36)';ctx.shadowBlur=nameHover?0:film*5;
        ctx.beginPath();ctx.ellipse(0,0,radius*(1+stretch),radius/(1+stretch),0,0,Math.PI*2);ctx.stroke();
        if(film>.04&&!nameHover){ctx.globalAlpha=film*.27;ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(0,0,(radius+2)*(1+stretch),(radius+2)/(1+stretch),0,-.9,1.25);ctx.stroke();}
        ctx.restore();
        // Just four slow motes, confined to the homepage atmosphere.
        if(dust>.01)for(let i=0;i<4;i++){
            const a=t*(.13+i*.025)+i*2.4,r=24+i*4+4*Math.sin(t*.55+i);
            ctx.fillStyle=`rgba(${i%2?'179,166,224':'132,176,217'},${dust*(.22+.12*Math.sin(t*.7+i))})`;
            ctx.beginPath();ctx.arc(ringX+Math.cos(a)*r,ringY+Math.sin(a)*r*.8,.85+i*.14,0,Math.PI*2);ctx.fill();
        }
        // This point uses the latest input position directly, never the lagged ring.
        ctx.beginPath();ctx.arc(x,y,2.15,0,Math.PI*2);ctx.fillStyle=nameHover?'#7775be':'#fafcff';ctx.fill();
        ctx.strokeStyle=nameHover||state==='link'?'#7775be':'rgba(111,128,190,.8)';ctx.lineWidth=.85;ctx.stroke();
    }
    function tick(now){
        raf=0;if(!visible||!fine.matches||document.hidden)return;
        const dt=Math.min(.05,(now-last)/1000||.016);last=now;classify(now);
        const quiet=reduced(),ease=quiet?1:1-Math.exp(-dt*16);
        const dx=x-ringX,dy=y-ringY;ringX+=dx*ease;ringY+=dy*ease;
        const goal=state==='link'?27:state==='title'?(inHero&&sample.title?20:23):state==='membrane'?18:11;
        radius+=(goal-radius)*ease;film+=((sample.inside?1:0)-film)*ease;
        const speed=Math.hypot(dx,dy),targetStretch=quiet?0:Math.min(.19,speed*.0035)*(sample.inside?1:.30);
        stretch+=(targetStretch-stretch)*ease;if(speed>.2)angle=Math.atan2(dy,dx);
        const dustGoal=inHero&&!quiet&&(state==='background'||state==='membrane')?1:0;dust+=(dustGoal-dust)*ease;
        paint(now/1000);
        const settling=Math.abs(dx)+Math.abs(dy)+Math.abs(goal-radius)+Math.abs(dustGoal-dust)+Math.abs((sample.inside?1:0)-film)>.025;
        if((inSurface&&!quiet&&(window.membraneSurface?.animating||dustGoal>0))||settling)raf=requestAnimationFrame(tick);
    }
    function start(){if(!raf&&visible&&fine.matches&&!document.hidden){last=performance.now();raf=requestAnimationFrame(tick);}}
    function move(px,py){
        if(!fine.matches)return;
        x=px;y=py;if(!visible){ringX=x;ringY=y;}visible=true;
        classify(performance.now());paint(performance.now()/1000);start();
    }
    function hide(){visible=false;selecting=false;sample={inside:false,title:false};setHover(null,'background');window.membraneSurface?.highlight(x,y,false);cancelAnimationFrame(raf);raf=0;paint(0);}
    document.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')move(e.clientX,e.clientY);},{passive:true});
    document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){hide();return;}selecting=state==='text';move(e.clientX,e.clientY);},{passive:true});
    document.addEventListener('pointerup',()=>{selecting=false;start();},{passive:true});
    document.addEventListener('selectionchange',start);
    document.addEventListener('pointerout',e=>{if(!e.relatedTarget)hide();});
    surface?.addEventListener('surfacechange',()=>{lastSample=-Infinity;start();});
    window.addEventListener('blur',hide);window.addEventListener('resize',()=>{resize();start();});
    window.addEventListener('scroll',()=>{lastSample=-Infinity;start();},{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
    fine.addEventListener('change',()=>{if(!fine.matches)hide();});reduce.addEventListener('change',start);
    resize();
    // Review harness can record the actual cursor canvas, including its exact dot and lagged ring.
    window.opticalCursor={canvas};
    if(query.has('review'))Object.assign(window.opticalCursor,{
        move,hide,getState:()=>({x,y,ringX,ringY,state,inside:sample.inside,inHero,visible,selecting,radius,film,dust,reduced:reduced()})
    });
})();
