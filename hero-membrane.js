(() => {
    'use strict';
    const hero = document.getElementById('welcome');
    const canvas = document.getElementById('membrane-canvas');
    if (!hero || !canvas) return;
    const button = document.getElementById('membrane-pause');
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const query = new URLSearchParams(location.search);
    const name = document.querySelector('.membrane-name');
    const textCanvas = document.createElement('canvas');
    const textContext = textCanvas.getContext('2d', {willReadFrequently:true});
    const maxPixels=4_000_000;
    let lastHit=null;
    let gl, scene, sheet, copy, pick, quad, grid, sceneTexture, textTexture, materialTexture, framebuffer, pickBuffer, indices;
    const hitPixel=new Uint8Array(4);
    let titleLight=[-100,-100],titleHover=0;
    let width = 1, height = 1, designHeight = 1, pixelRatio = 1, mobile = false;
    let time = 0, raf = 0, last = 0, visible = true, frames = 0, fps = 0, frameTimes = [];
    let reduced = preference.matches || query.get('motion') === 'reduce';
    let paused = reduced, pointer = [.65,.45], target = [...pointer], velocity = [0,0];
    let pressure = 0, pull = 0, pullVelocity = 0, ready = false, debug = 0, frameListener = null;
    const vertexQuad = `attribute vec2 a_position; varying vec2 v_uv;
        void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
    const lightField = `
        float pool(vec2 p,vec2 c,vec2 r){vec2 d=(p-c)/r;return exp(-dot(d,d)*2.);}
        vec3 atmosphere(vec2 p,float t){
            vec2 q=p+vec2(sin(p.y*7.+t*.12),cos(p.x*6.-t*.10))*.042;
            q+=vec2(sin(p.x*15.+p.y*8.+t*.08),cos(p.x*9.-p.y*11.-t*.07))*.016;
            vec3 c=vec3(.993,.997,1.);
            float a=pool(q,vec2(.76+.06*sin(t*.09),.09+.045*cos(t*.11)),vec2(.47,.36));
            c=mix(c,vec3(.65,.68,1.),a*.57);
            float b=pool(q,vec2(.70+.07*cos(t*.13),.26+.07*sin(t*.10)),vec2(.20,.22));
            c=mix(c,vec3(.42,.44,1.),b*(.76+.11*sin(t*.17)));
            float lilac=pool(q,vec2(.65+.055*sin(t*.12),.68+.06*cos(t*.08)),vec2(.24,.28));
            c=mix(c,vec3(.61,.49,.97),lilac*(.60+.12*cos(t*.13)));
            float pink=pool(q,vec2(.82+.045*cos(t*.1),.66+.12*sin(t*.09)),vec2(.15,.25));
            c=mix(c,vec3(.98,.77,.94),pink*.59);
            float cyan=pool(q,vec2(.51+.09*cos(t*.08),.87+.08*sin(t*.11)),vec2(.34,.32));
            c=mix(c,vec3(.67,.89,1.),cyan*.42);
            c=mix(c,vec3(.80,.94,1.),pool(q,vec2(.34,.23),vec2(.32,.24))*.32);
            c=mix(c,vec3(1.,.90,.97),pool(q,vec2(.93,.02),vec2(.22,.22))*.45);
            c=mix(c,vec3(1.,.82,.97),pool(q,vec2(.79+.05*sin(t*.14),.24),vec2(.15,.09))*.30);
            c=mix(c,vec3(.69,.91,1.),pool(q,vec2(.57,.43+.05*cos(t*.1)),vec2(.17,.18))*.19);
            c=mix(c,vec3(.80,.94,1.),pool(q,vec2(.98,.46+.04*sin(t*.08)),vec2(.25,.25))*.60);
            float light=pool(q,vec2(.39+.035*sin(t*.09),.53),vec2(.32,.24));
            return mix(c,vec3(1.),light*.45);
        }`;
    const fragmentScene = `precision highp float;varying vec2 v_uv;
        uniform vec2 u_size;uniform float u_design;uniform float u_time;uniform sampler2D u_text;
        uniform vec2 u_titleLight;uniform float u_titleHover;
        ${lightField}
        void main(){
            vec2 uv=vec2(v_uv.x,1.-v_uv.y);vec2 p=uv*vec2(1.,u_size.y/u_design);
            vec3 color=atmosphere(p,u_time);
            float type=texture2D(u_text,uv).a;
            vec3 ink=mix(vec3(.44,.42,.98),vec3(.56,.68,1.),smoothstep(.2,.65,p.y)*.60+p.x*.62);
            float glow=exp(-dot(uv*u_size-u_titleLight,uv*u_size-u_titleLight)/2600.)*u_titleHover;
            ink=mix(ink,vec3(.69,.77,1.),glow*.48);
            gl_FragColor=vec4(mix(color,ink,type),type);
        }`;
    const vertexSheet = `precision highp float;
        attribute vec2 a_position;varying vec2 v_uv;varying vec2 v_material;varying vec3 v_normal;varying vec3 v_position;
        uniform vec2 u_size;uniform float u_design;uniform float u_time;uniform float u_mobile;
        uniform vec2 u_pointer;uniform vec2 u_velocity;uniform float u_pull;
        uniform vec2 u_pick;uniform vec2 u_pickScale;
        vec2 bezier(vec2 a,vec2 b,vec2 c,vec2 d,float t){float s=1.-t;return s*s*s*a+3.*s*s*t*b+3.*s*t*t*c+t*t*t*d;}
        vec2 restPosition(vec2 uv){
            float u=uv.x,v=uv.y;
            vec2 A=vec2(.59,.12),B=vec2(1.12,-.055),C=vec2(.265,.655),D=vec2(1.11,.945);
            vec2 top=bezier(A,vec2(.73,.12),vec2(.88,.27),B,u);
            vec2 bottom=bezier(C,vec2(.46,.67),vec2(.85,.88),D,u);
            vec2 shoulder=vec2(.365,.345);
            vec2 left=v<.5?bezier(A,vec2(.48,.116),vec2(.365,.21),shoulder,v*2.):bezier(shoulder,vec2(.37,.475),vec2(.27,.603),C,(v-.5)*2.);
            vec2 right=mix(B,D,v);right.x-=.276*exp(-pow((v-.55)/.18,2.));
            vec2 bilinear=mix(mix(A,B,u),mix(C,D,u),v);
            return mix(top,bottom,v)+mix(left,right,u)-bilinear;
        }
        vec3 surface(vec2 uv){
            float u=uv.x,v=uv.y,t=u_time;
            vec2 p=restPosition(uv);
            // Unfold only the lower-left / lower-middle; keep the material coordinates intact.
            p.y+=.040*pow(v,3.)*(1.-smoothstep(.40,.94,u));
            float breathe=sin(t*.34+v*2.1)-sin(v*2.1);
            p.x+=.032*breathe*pow(1.-u,2.)*sin(3.14159*v);
            p.y+=.018*sin(t*.25+u*4.)*sin(3.14159*v)*sin(3.14159*u);
            p.x+=.008*sin(t*.21+v*6.)*sin(3.14159*u);
            // Narrow screens keep the same open sheet, lower and farther right.
            p=mix(p,vec2((p.x-.38)*1.38+.42,p.y*.76+.22),u_mobile);
            float z=.16*sin(3.14159*u)*sin(3.14159*v);
            z+=.062*sin(u*5.+v*3.+t*.22)*sin(3.14159*v);
            z-=.11*pow(u,4.)*sin(3.14159*v);
            float fold=v-(.29+.24*u-.045*sin(u*5.+t*.13));
            z+=.105*exp(-pow(fold/.105,2.))*sin(3.14159*u);
            float lower=v-(.79-.12*u+.06*sin(u*4.+t*.15));
            z-=.080*exp(-pow(lower/.075,2.))*sin(3.14159*u);
            float aspect=u_size.x/u_design;
            vec2 d=(p-u_pointer)*vec2(aspect,1.);
            float influence=exp(-dot(d,d)/.038);
            p+=influence*u_pull*(d*-.12/vec2(aspect,1.)+u_velocity*.020);
            z-=.16*influence*u_pull;
            z+=.012*sin(length(d)*48.-t*1.8)*exp(-length(d)*5.)*u_pull;
            return vec3(p.x*aspect,p.y,z);
        }
        void main(){
            v_uv=a_position;v_material=restPosition(a_position);
            vec3 p=surface(a_position);
            vec3 du=surface(a_position+vec2(.001,0.))-surface(a_position-vec2(.001,0.));
            vec3 dv=surface(a_position+vec2(0.,.001))-surface(a_position-vec2(0.,.001));
            v_normal=normalize(cross(du,dv));v_position=p;
            vec2 screen=vec2(p.x*u_design/u_size.x,p.y*u_design/u_size.y);
            gl_Position=vec4(screen.x*2.-1.,1.-screen.y*2.,0.,1.);
            gl_Position.xy=(gl_Position.xy-u_pick)*u_pickScale;
        }`;
    const fragmentSheet = `#extension GL_OES_standard_derivatives : enable
        precision highp float;varying vec2 v_uv;varying vec2 v_material;varying vec3 v_normal;varying vec3 v_position;
        uniform vec2 u_size;uniform vec2 u_buffer;uniform float u_design;uniform float u_time;uniform float u_debug;uniform float u_mobile;
        uniform sampler2D u_scene;uniform sampler2D u_material;
        ${lightField}
        void main(){
            vec2 screen=gl_FragCoord.xy/u_buffer;
            vec3 n=normalize(v_normal);if(n.z<0.)n=-n;
            float edge=min(min(v_uv.x,1.-v_uv.x),min(v_uv.y,1.-v_uv.y));
            float edgePx=edge/max(fwidth(edge),.00001);
            float rim=1.-smoothstep(.65,2.5,edgePx);
            float halo=exp(-edge*115.);
            float fresnel=pow(1.-abs(n.z),2.6);
            vec2 refraction=n.xy*vec2(u_design/u_size.x,-u_design/u_size.y)*(.020+.023*fresnel);
            refraction*=mix(1.,.55,u_mobile);
            vec4 refracted=texture2D(u_scene,screen+refraction);
            vec3 base=refracted.rgb;
            // All three scene samples are clipped by this very same deformed mesh.
            base.r=texture2D(u_scene,screen+refraction*1.075).r;
            base.b=texture2D(u_scene,screen+refraction*.925).b;
            vec3 ambient=atmosphere(vec2(v_position.x*u_design/u_size.x,v_position.y)+n.xy*.32,u_time);
            // The clean plate contributes optical detail in material coordinates.
            // It stretches with the mesh; it never supplies or masks the name.
            vec2 drift=.004*vec2(sin(u_time*.19+v_uv.y*7.),cos(u_time*.16+v_uv.x*6.))*sin(3.14159*v_uv.x)*sin(3.14159*v_uv.y);
            vec3 plate=texture2D(u_material,v_material+drift).rgb;
            vec3 changingLight=atmosphere(v_material,u_time)-atmosphere(v_material,0.);
            plate=clamp(plate+changingLight*.78,0.,1.);
            vec3 color=mix(ambient,plate,.90);
            color=mix(color,base,refracted.a);
            float pearlReflection=smoothstep(.88,.99,dot(plate,vec3(.2126,.7152,.0722)));
            color=mix(color,plate,refracted.a*(.065+pearlReflection*.42));
            float spectral=.5+.5*sin(v_position.z*33.+v_uv.x*4.-v_uv.y*5.+u_time*.10);
            vec3 pearl=mix(vec3(.70,.86,1.),vec3(.97,.77,.96),spectral);
            vec3 light=normalize(vec3(-.36,-.62,1.));
            float shine=pow(max(dot(n,light),0.),38.);
            float second=pow(max(dot(n,normalize(vec3(.7,.32,1.))),0.),32.);
            color=mix(color,vec3(1.),shine*.09+second*.07);
            vec3 reflected=reflect(vec3(0.,0.,-1.),n);
            float window1=exp(-pow((reflected.x*.6+reflected.y*.8-.18)/.105,2.));
            float window2=exp(-pow((reflected.x*.8-reflected.y*.5+.20)/.060,2.));
            float window3=exp(-pow((reflected.x*.6+reflected.y*.8-.33)/.12,2.));
            color=mix(color,vec3(.75,.76,1.),window3*.045);
            color=mix(color,pearl,window2*.055);
            color=mix(color,vec3(1.),window1*.16+window2*.10);
            color=mix(color,pearl,fresnel*.12+halo*.10);
            float fold=v_uv.y-(.29+.24*v_uv.x-.045*sin(v_uv.x*5.+u_time*.13));
            float foldLight=exp(-pow(fold/.032,2.))*(.35+.3*sin(v_uv.x*3.+.6));
            float lower=v_uv.y-(.79-.12*v_uv.x+.06*sin(v_uv.x*4.+u_time*.15));
            float lowerLight=exp(-pow(lower/.027,2.))*(.48+.30*sin(v_uv.x*5.));
            color=mix(color,vec3(1.),foldLight*.12+lowerLight*.10);
            color=mix(color,pearl,exp(-pow((lower-.04)/.05,2.))*.055);
            color=mix(color,vec3(1.),exp(-edge*70.)*.23);
            float stripes=pow(.5+.5*cos(v_uv.y*245.+1.1*sin(v_uv.x*7.-u_time*.18)),24.);
            float phase=.5+.5*cos(v_uv.y*8.+v_uv.x*3.+u_time*.15);
            float fan=exp(-pow((v_uv.y-.54)/.24,2.))*smoothstep(.08,.63,v_uv.x);
            color=mix(color,vec3(.99,1.,1.),stripes*fan*(.065+.065*phase));
            color=mix(color,pearl,halo*.13);
            vec3 edgeColor=mix(vec3(.42,.43,.99),vec3(.99,.97,1.),.52+.48*sin(v_uv.y*23.+v_uv.x*16.+u_time*.15));
            color=mix(color,edgeColor,rim*.30);
            if(u_debug>1.5)color=vec3(1.,0.,1.);
            else if(u_debug>0.5)color=mix(base,vec3(.1,.7,.5),.65);
            gl_FragColor=vec4(color,1.);
        }`;
    const fragmentCopy = `precision mediump float;varying vec2 v_uv;uniform sampler2D u_scene;
        void main(){gl_FragColor=vec4(texture2D(u_scene,v_uv).rgb,1.);}`;

    function makeProgram(vs,fs,names) {
        const p=gl.createProgram();
        for(const [type,source] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]) {
            const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
            if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));
            gl.attachShader(p,s);gl.deleteShader(s);
        }
        gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
        return {p,position:gl.getAttribLocation(p,'a_position'),u:Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(p,'u_'+n)]))};
    }
    function texture(unit) {
        const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;
    }
    function setup(material) {
        if(query.get('renderer')==='fallback')throw new Error('Static view requested');
        gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
        if(!gl || !gl.getExtension('OES_standard_derivatives'))throw new Error('WebGL derivatives unavailable');
        scene=makeProgram(vertexQuad,fragmentScene,['size','design','time','text','titleLight','titleHover']);
        const surfaceUniforms=['size','design','time','mobile','pointer','velocity','pull','pick','pickScale'];
        sheet=makeProgram(vertexSheet,fragmentSheet,[...surfaceUniforms,'buffer','scene','material','debug']);
        // A one-pixel pass uses the EXACT same deformed vertices as the visible film.
        pick=makeProgram(vertexSheet,'precision mediump float;void main(){gl_FragColor=vec4(1.);}',surfaceUniforms);
        copy=makeProgram(vertexQuad,fragmentCopy,['scene']);
        quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
        const positions=[],triangles=[],cols=120,rows=88;
        for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++)positions.push(x/cols,y/rows);
        for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const i=y*(cols+1)+x;triangles.push(i,i+1,i+cols+1,i+1,i+cols+2,i+cols+1);}
        grid=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,grid);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);
        indices=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(triangles),gl.STATIC_DRAW);indices.count=triangles.length;
        sceneTexture=texture(0);textTexture=texture(1);materialTexture=texture(2);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,material);
        framebuffer=gl.createFramebuffer();
        texture(3);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
        pickBuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,pickBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,gl.getParameter(gl.TEXTURE_BINDING_2D),0);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);
        ready=true;hero.classList.add('membrane-ready');
    }
    function bind(p,buffer) {
        gl.useProgram(p.p);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(p.position);gl.vertexAttribPointer(p.position,2,gl.FLOAT,false,0,0);
    }
    function paintText() {
        const density=Math.min(devicePixelRatio||1,2,Math.sqrt(maxPixels/(width*height)));
        textCanvas.width=Math.round(width*density);textCanvas.height=Math.round(height*density);
        textContext.setTransform(density,0,0,density,0,0);textContext.clearRect(0,0,width,height);textContext.fillStyle='white';
        const origin=canvas.getBoundingClientRect(),style=getComputedStyle(name),size=parseFloat(style.fontSize);
        textContext.font=`${style.fontStyle} ${style.fontWeight} ${size}px ${style.fontFamily}`;textContext.textBaseline='alphabetic';
        const spacing=parseFloat(style.letterSpacing)||0;
        for(const line of name.querySelectorAll('span')) {
            const r=line.getBoundingClientRect();
            const metrics=textContext.measureText(line.textContent);
            const asc=metrics.fontBoundingBoxAscent||size*.8,desc=metrics.fontBoundingBoxDescent||size*.2;
            const baseline=r.top-origin.top+(r.height-asc-desc)/2+asc;
            let x=0;textContext.save();textContext.translate(r.left-origin.left,baseline);
            const transform=getComputedStyle(line).transform;
            if(transform!=='none'){const matrix=new DOMMatrixReadOnly(transform);textContext.scale(matrix.a,matrix.d);}
            for(const letter of line.textContent){textContext.fillText(letter,x,0);x+=textContext.measureText(letter).width+spacing;}textContext.restore();
        }
        gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,textTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,textCanvas);
    }
    function resize() {
        if(!ready)return;
        const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;designHeight=hero.clientHeight/.9;mobile=width<600;
        pixelRatio=Math.min(devicePixelRatio||1,mobile?1.15:1.4,Math.sqrt(maxPixels/(width*height)));frameTimes=[];
        bufferSize();paintText();draw();schedule();
    }
    function bufferSize() {
        canvas.width=Math.round(width*pixelRatio);canvas.height=Math.round(height*pixelRatio);
        gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,sceneTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,canvas.width,canvas.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
        gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,sceneTexture,0);
        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('Scene framebuffer incomplete');
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);
    }
    const perf=query.has('perf')?{drawMs:0,pickMs:0,picks:0,intervals:[]}:null;
    if(perf)setInterval(()=>{hero.dataset.perf=JSON.stringify({...perf,frames,time,buffer:[canvas.width,canvas.height],visible,hidden:document.hidden,running:moving()});},1000);
    function draw() {
        const started=perf?performance.now():0;
        if(!ready)return;
        gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);bind(scene,quad);
        gl.uniform2f(scene.u.size,width,height);gl.uniform1f(scene.u.design,designHeight);gl.uniform1f(scene.u.time,time);gl.uniform1i(scene.u.text,1);
        gl.uniform2fv(scene.u.titleLight,titleLight);gl.uniform1f(scene.u.titleHover,titleHover);
        gl.drawArrays(gl.TRIANGLES,0,6);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);bind(copy,quad);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,sceneTexture);gl.uniform1i(copy.u.scene,0);gl.drawArrays(gl.TRIANGLES,0,6);
        bind(sheet,grid);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);
        surfaceUniforms(sheet);gl.uniform2f(sheet.u.pick,0,0);gl.uniform2f(sheet.u.pickScale,1,1);
        gl.uniform2f(sheet.u.buffer,canvas.width,canvas.height);gl.uniform1f(sheet.u.debug,debug);gl.uniform1i(sheet.u.scene,0);gl.uniform1i(sheet.u.material,2);
        gl.drawElements(gl.TRIANGLES,indices.count,gl.UNSIGNED_SHORT,0);
        if(perf)perf.drawMs+=performance.now()-started;
        frames++;if(!moving())canvas.dispatchEvent(new Event('surfacechange'));if(frameListener)frameListener(canvas);
    }
    function surfaceUniforms(program){
        gl.uniform2f(program.u.size,width,height);gl.uniform1f(program.u.design,designHeight);gl.uniform1f(program.u.time,time);
        gl.uniform1f(program.u.mobile,mobile?1:0);gl.uniform2fv(program.u.pointer,pointer);gl.uniform2fv(program.u.velocity,velocity);gl.uniform1f(program.u.pull,pull);
    }
    window.membraneSurface={
        get animating(){return moving();},
        sample(clientX,clientY){
            if(!ready)return {inside:false,title:false};
            const rect=canvas.getBoundingClientRect(),x=clientX-rect.left,y=clientY-rect.top;
            if(x<0||y<0||x>=width||y>=height)return {inside:false,title:false};
            // A stationary pointer needs a new exact hit only after the surface changes.
            if(lastHit&&lastHit.frame===frames&&lastHit.x===x&&lastHit.y===y)return lastHit.value;
            const started=perf?performance.now():0;
            gl.bindFramebuffer(gl.FRAMEBUFFER,pickBuffer);gl.viewport(0,0,1,1);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
            bind(pick,grid);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);surfaceUniforms(pick);
            gl.uniform2f(pick.u.pick,x/width*2-1,1-y/height*2);gl.uniform2f(pick.u.pickScale,canvas.width,canvas.height);
            gl.drawElements(gl.TRIANGLES,indices.count,gl.UNSIGNED_SHORT,0);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,hitPixel);
            gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);
            if(perf){perf.picks++;perf.pickMs+=performance.now()-started;}
            const tx=Math.floor(x/width*textCanvas.width),ty=Math.floor(y/height*textCanvas.height);
            const value={inside:hitPixel[0]>127,title:textContext.getImageData(tx,ty,1,1).data[3]>40};
            lastHit={frame:frames,x,y,value};return value;
        },
        highlight(clientX,clientY,active){
            const rect=canvas.getBoundingClientRect(),next=[clientX-rect.left,clientY-rect.top];
            if(titleHover===Number(active)&&(!active||(next[0]===titleLight[0]&&next[1]===titleLight[1])))return;
            titleLight=next;titleHover=Number(active);if(!moving())draw();
        }
    };
    function moving(){return ready && !paused && !reduced && visible && !document.hidden;}
    function schedule(){if(moving()&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}}
    function tick(now) {
        raf=0;if(!moving())return;
        if(now-last<(mobile?30:15)){raf=requestAnimationFrame(tick);return;}
        const elapsed=now-last,dt=Math.min(.045,elapsed/1000);last=now;time+=dt;
        // Critically damped pointer position; underdamped surface tension leaves a small recoil.
        for(let i=0;i<2;i++){const old=pointer[i];pointer[i]+=(target[i]-pointer[i])*(1-Math.exp(-dt*8));velocity[i]=(pointer[i]-old)/dt;}
        const acceleration=(pressure-pull)*30-pullVelocity*6.5;
        pullVelocity+=acceleration*dt;pull+=pullVelocity*dt;
        if(pressure===0&&Math.abs(pull)+Math.abs(pullVelocity)<.0002){pull=0;pullVelocity=0;}
        if(perf){perf.intervals.push(elapsed);if(perf.intervals.length>600)perf.intervals.shift();}
        draw();frameTimes.push(elapsed);if(frameTimes.length>100)frameTimes.shift();
        if(frames%60===0){const avg=frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length;fps=Math.round(1000/avg);if(frameTimes.length===100&&avg>(mobile?45:28)&&pixelRatio>.8){pixelRatio=Math.max(.8,pixelRatio*.86);bufferSize();frameTimes=[];}}
        raf=requestAnimationFrame(tick);
    }
    function stop(){if(raf)cancelAnimationFrame(raf);raf=0;}
    function syncButton(){button.textContent=reduced?'Change light phase':paused?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(paused||reduced));}
    function setReduced(value){reduced=value;paused=value;pressure=0;pull=0;pullVelocity=0;stop();syncButton();draw();schedule();}
    function point(event){
        if(!moving() || event.target.closest('a,button'))return;
        if(event.pointerType==='touch'&&!event.buttons)return;
        const r=canvas.getBoundingClientRect();target=[(event.clientX-r.left)/width,(event.clientY-r.top)/designHeight];pressure=1;
    }
    function release(){pressure=0;}
    hero.addEventListener('pointermove',point);hero.addEventListener('pointerdown',point);hero.addEventListener('pointerleave',release);
    hero.addEventListener('pointerup',e=>{if(e.pointerType==='touch')release();});hero.addEventListener('pointercancel',release);
    document.querySelector('header').addEventListener('pointerenter',release);
    button.addEventListener('click',()=>{if(reduced){time+=4;draw();return;}paused=!paused;stop();syncButton();draw();schedule();});
    preference.addEventListener('change',e=>setReduced(e.matches));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule();if(perf)hero.dataset.visibility=JSON.stringify({hidden:document.hidden,frames,time,at:performance.now()});});
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else stop();},{threshold:.02}).observe(hero);
    new ResizeObserver(resize).observe(hero);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});
    function fallback(){
        stop();ready=false;hero.classList.remove('membrane-ready');canvas.hidden=true;button.hidden=true;
        hero.dataset.renderer='static';
        // The HTML name, roles and navigation are the baseline even without graphics support.
    }
    async function init(){
        const material=new Image();material.src='image/hero-membrane-material.png';
        await Promise.all([document.fonts.load('800 100px "PP Neue Machina"'),material.decode()]);
        setup(material);resize();syncButton();hero.dataset.renderer='webgl';
        if(query.has('review'))window.gloriaMembrane={
            canvas,hero,getState:()=>({time,frames,fps,paused,reduced,pull,pullVelocity,pointer:[...pointer],pressure,buffer:[canvas.width,canvas.height],running:moving()}),
            freeze(t=0){paused=true;stop();time=t;pressure=0;pull=0;pullVelocity=0;draw();syncButton();},
            play(){paused=false;syncButton();schedule();},
            point(x,y){target=[x,y];pressure=1;},leave:release,
            reduce:setReduced,mask(value){debug=value?1:0;draw();},
            onFrame(callback){frameListener=callback;},draw,
            coverageCheck(){
                const savedDebug=debug,savedPaused=paused;paused=true;stop();debug=0;draw();
                const count=canvas.width*canvas.height*4,normal=new Uint8Array(count),base=new Uint8Array(count),mask=new Uint8Array(count);
                gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,normal);
                gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,base);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
                debug=2;draw();gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,mask);
                const text=textContext.getImageData(0,0,textCanvas.width,textCanvas.height).data;
                let outside=0,changedOutside=0,coveredText=0,uncoveredText=0,changedCoveredText=0;
                for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
                    const i=(y*canvas.width+x)*4,isCovered=mask[i]===255&&mask[i+1]===0&&mask[i+2]===255;
                    const changed=Math.max(Math.abs(normal[i]-base[i]),Math.abs(normal[i+1]-base[i+1]),Math.abs(normal[i+2]-base[i+2]))>2;
                    const tx=Math.min(textCanvas.width-1,Math.floor(x/canvas.width*textCanvas.width));
                    const ty=Math.min(textCanvas.height-1,Math.floor((1-(y+.5)/canvas.height)*textCanvas.height));
                    const isText=text[(ty*textCanvas.width+tx)*4+3]>180;
                    if(!isCovered){outside++;if(changed)changedOutside++;if(isText)uncoveredText++;}
                    else if(isText){coveredText++;if(changed)changedCoveredText++;}
                }
                debug=savedDebug;paused=savedPaused;draw();schedule();
                return {phase:time,pull,buffer:[canvas.width,canvas.height],outside,changedOutside,coveredText,uncoveredText,changedCoveredText};
            },
            cleanFrame(callback){const saved=textCanvas;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,textTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(4));draw();callback(canvas);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,textTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,saved);draw();}
        };
        schedule();
    }
    init().catch(error=>{if(query.get('renderer')!=='fallback')console.warn('Membrane static view:',error.message);fallback();});
})();
