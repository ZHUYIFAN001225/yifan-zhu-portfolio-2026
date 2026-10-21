(function(){
  'use strict';
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  function geometry(width,height,size){
    const model={width,height,size,zoom:1,angle:0,x:0,y:0};
    function dimensions(){return model.angle%180?{width:model.height,height:model.width}:{width:model.width,height:model.height};}
    function scale(){const d=dimensions();return Math.max(model.size/d.width,model.size/d.height)*model.zoom;}
    function constrain(){const d=dimensions(),s=scale();model.x=clamp(model.x,-Math.max(0,(d.width*s-model.size)/2),Math.max(0,(d.width*s-model.size)/2));model.y=clamp(model.y,-Math.max(0,(d.height*s-model.size)/2),Math.max(0,(d.height*s-model.size)/2));}
    function zoomAt(value,point={x:model.size/2,y:model.size/2}){const old=scale();model.zoom=clamp(value,1,4);const ratio=scale()/old;model.x=point.x-model.size/2-(point.x-model.size/2-model.x)*ratio;model.y=point.y-model.size/2-(point.y-model.size/2-model.y)*ratio;constrain();}
    function move(x,y){model.x=x;model.y=y;constrain();}
    function reset(){model.zoom=1;model.x=0;model.y=0;constrain();}
    function rotate(){model.angle=(model.angle+90)%360;reset();}
    function resize(size){const ratio=size/model.size;model.size=size;model.x*=ratio;model.y*=ratio;constrain();}
    return {model,scale,move,zoomAt,reset,rotate,resize};
  }
  window.LOOK_AVATAR_GEOMETRY=geometry;
  window.createAvatarCropper=function({toast=()=>{}}={}){
    let current=null;
    function cancel(){current?.finish(null);}
    function open(file){
      cancel();
      if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024){toast('请选择 8 MB 以内的 JPG / PNG / WebP 图片');return Promise.resolve(null);}
      return new Promise(resolve=>{
        const returnFocus=document.activeElement,route=location.hash,host=document.querySelector('.phone')||document.body;
        const root=document.createElement('section');root.className='avatar-crop-layer';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','avatar-crop-title');
        root.innerHTML=`<header class="avatar-crop-head"><button type="button" data-crop="cancel">取消</button><h2 id="avatar-crop-title">调整头像</h2><button type="button" class="avatar-crop-save" data-crop="save" disabled>完成</button></header><div class="avatar-crop-body"><p id="avatar-crop-help">拖动照片选择范围 · 双指或滑杆缩放</p><div class="avatar-crop-view" tabindex="0" role="group" aria-label="头像裁剪区域，使用方向键移动照片" aria-describedby="avatar-crop-help"><img class="avatar-crop-photo" alt="待裁剪照片" draggable="false"><div class="avatar-crop-guide" aria-hidden="true"></div><span class="avatar-crop-loading" role="status">正在读取照片…</span></div><div class="avatar-crop-controls"><label for="avatar-crop-zoom">缩放</label><input id="avatar-crop-zoom" type="range" min="1" max="4" step="0.01" value="1" disabled><output for="avatar-crop-zoom">1.0×</output></div><div class="avatar-crop-tools"><button type="button" data-crop="rotate" disabled>旋转 90°</button><button type="button" data-crop="reset" disabled>重置</button></div><div class="avatar-crop-preview"><canvas width="72" height="72" aria-label="裁剪后的圆形头像预览"></canvas><span>头像预览<small>只保留圆圈内的画面</small></span></div></div>`;
        const siblings=Array.from(host.children).map(element=>({element,inert:element.inert}));
        siblings.forEach(({element})=>element.inert=true);host.append(root);
        const view=root.querySelector('.avatar-crop-view'),image=root.querySelector('img'),slider=root.querySelector('input'),preview=root.querySelector('canvas'),loading=root.querySelector('.avatar-crop-loading');
        let url=null,shape=null,ended=false,frame=0,gesture=null;
        const points=new Map();
        function draw(canvas){
          const context=canvas.getContext('2d');if(!context)throw Error('此浏览器无法处理照片');
          const m=shape.model,ratio=canvas.width/m.size,s=shape.scale()*ratio;
          context.clearRect(0,0,canvas.width,canvas.height);context.fillStyle='#111';context.fillRect(0,0,canvas.width,canvas.height);
          context.save();context.translate(canvas.width/2+m.x*ratio,canvas.height/2+m.y*ratio);context.rotate(m.angle*Math.PI/180);context.drawImage(image,-m.width*s/2,-m.height*s/2,m.width*s,m.height*s);context.restore();
        }
        function paint(){
          frame=0;if(ended||!shape)return;
          const m=shape.model,s=shape.scale();image.style.width=m.width*s+'px';image.style.height=m.height*s+'px';image.style.left=m.size/2+m.x+'px';image.style.top=m.size/2+m.y+'px';image.style.transform=`translate(-50%,-50%) rotate(${m.angle}deg)`;
          slider.value=String(m.zoom);root.querySelector('output').textContent=m.zoom.toFixed(1)+'×';
          try{draw(preview);}catch(error){toast(error.message);finish(null);}
        }
        function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
        function localPoint(event){const rect=view.getBoundingClientRect(),size=shape.model.size;return {x:(event.clientX-rect.left)*size/(rect.width||size),y:(event.clientY-rect.top)*size/(rect.height||size)};}
        function startGesture(){
          const list=Array.from(points.values()),m=shape.model;
          if(list.length>=2){const [a,b]=list,mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};gesture={pinch:true,distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),zoom:m.zoom,anchorX:(mid.x-m.size/2-m.x)/shape.scale(),anchorY:(mid.y-m.size/2-m.y)/shape.scale()};}
          else gesture=list.length?{pinch:false,point:list[0],x:m.x,y:m.y}:null;
        }
        view.addEventListener('pointerdown',event=>{if(!shape||event.button>0||points.size>=2)return;event.preventDefault();points.set(event.pointerId,localPoint(event));view.setPointerCapture?.(event.pointerId);startGesture();});
        view.addEventListener('pointermove',event=>{
          if(!shape||!points.has(event.pointerId)||!gesture)return;event.preventDefault();points.set(event.pointerId,localPoint(event));const list=Array.from(points.values());
          if(gesture.pinch&&list.length>=2){const [a,b]=list,mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};shape.zoomAt(gesture.zoom*Math.hypot(a.x-b.x,a.y-b.y)/gesture.distance);shape.move(mid.x-shape.model.size/2-gesture.anchorX*shape.scale(),mid.y-shape.model.size/2-gesture.anchorY*shape.scale());}
          else if(!gesture.pinch){const point=list[0];shape.move(gesture.x+point.x-gesture.point.x,gesture.y+point.y-gesture.point.y);}
          schedule();
        });
        function release(event){if(!shape)return;points.delete(event.pointerId);startGesture();}
        view.addEventListener('pointerup',release);view.addEventListener('pointercancel',release);view.addEventListener('lostpointercapture',release);
        view.addEventListener('wheel',event=>{if(!shape)return;event.preventDefault();shape.zoomAt(shape.model.zoom*Math.exp(-event.deltaY*.002),localPoint(event));schedule();},{passive:false});
        view.addEventListener('keydown',event=>{if(!shape||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const step=event.shiftKey?20:5;shape.move(shape.model.x+(event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0),shape.model.y+(event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0));schedule();});
        slider.addEventListener('input',()=>{if(shape){shape.zoomAt(Number(slider.value));schedule();}});
        root.addEventListener('click',event=>{
          const button=event.target.closest('[data-crop]');if(!button)return;event.preventDefault();event.stopPropagation();
          if(button.dataset.crop==='cancel'){finish(null);return;}if(!shape)return;
          if(button.dataset.crop==='rotate'){shape.rotate();points.clear();gesture=null;schedule();}
          if(button.dataset.crop==='reset'){shape.reset();points.clear();gesture=null;schedule();}
          if(button.dataset.crop==='save'){try{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;draw(canvas);const result=canvas.toDataURL('image/jpeg',.88);if(!result.startsWith('data:image/jpeg'))throw Error('无法保存头像，请换一张照片');finish(result);}catch(error){toast(error.message);}}
        });
        function keydown(event){
          if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();finish(null);}
          if(event.key==='Tab'){event.stopPropagation();const controls=Array.from(root.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]'));const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
        }
        function resize(){if(shape){shape.resize(view.clientWidth||320);schedule();}}
        function routeChange(){finish(null);}
        window.addEventListener('keydown',keydown,true);window.addEventListener('hashchange',routeChange);window.addEventListener('resize',resize);
        function finish(result){
          if(ended)return;ended=true;cancelAnimationFrame(frame);image.onload=null;image.onerror=null;if(url)URL.revokeObjectURL(url);
          window.removeEventListener('keydown',keydown,true);window.removeEventListener('hashchange',routeChange);window.removeEventListener('resize',resize);
          root.remove();siblings.forEach(({element,inert})=>{element.inert=route!==location.hash&&['screen','bottom-nav','sticky-action'].includes(element.id)?Boolean(document.getElementById('modal-root')?.children.length):inert;});if(returnFocus?.isConnected)returnFocus.focus();if(current?.root===root)current=null;resolve(result);
        }
        current={root,finish};root.querySelector('[data-crop="cancel"]').focus();
        image.onload=()=>{if(ended)return;const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;if(!width||!height){toast('图片内容无法读取');finish(null);return;}shape=geometry(width,height,view.clientWidth||320);loading.remove();root.querySelectorAll('button,input').forEach(button=>button.disabled=false);paint();};
        image.onerror=()=>{toast('图片内容无法读取，请换一张照片');finish(null);};
        try{url=URL.createObjectURL(file);image.src=url;}catch{toast('图片读取失败');finish(null);}
      });
    }
    return {open,cancel};
  };
})();
