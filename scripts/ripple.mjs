// Pictures on the case pages answer the pointer: moving across one sends ripples through it, like touching water.
// WebGL, one small canvas per picture, created on first hover and idle when the pointer is away.
const VS = `attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x,1.0-p.y);gl_Position=vec4(p*2.0-1.0,0.0,1.0);}`;
const FS = `precision mediump float;varying vec2 v;uniform sampler2D t;uniform vec2 res;uniform float time;
uniform vec3 drops[8];uniform vec2 cur;uniform float curA;
void main(){
  vec2 uv=v;vec2 asp=vec2(res.x/res.y,1.0);vec2 off=vec2(0.0);float light=0.0;
  for(int i=0;i<8;i++){
    float age=time-drops[i].z; if(age<0.0||age>2.2) continue;
    vec2 d=(uv-drops[i].xy)*asp; float dist=length(d);
    float r=age*0.55; float w=0.045+age*0.02;
    float ring=exp(-pow((dist-r)/w,2.0));
    float amp=ring*(1.0-age/2.2)*0.014;
    off+=normalize(d+1e-5)*amp*sin((dist-r)*90.0);
    light+=ring*(1.0-age/2.2)*0.06*cos((dist-r)*90.0);
  }
  // a soft lens under the pointer
  vec2 dc=(uv-cur)*asp; float lc=length(dc);
  float lens=exp(-lc*lc*60.0)*curA;
  off-=normalize(dc+1e-5)*lens*0.012;
  vec3 c=texture2D(t,clamp(uv+off,0.001,0.999)).rgb;
  c+=light+lens*0.04;
  gl_FragColor=vec4(c,1.0);
}`;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

function attach(img) {
  if (img.dataset.ripple || !img.complete || img.naturalWidth < 2) return;
  if (img.closest('a,button') === null) {/* fine */}
  img.dataset.ripple = '1';
  let gl, canvas, drops = [], di = 0, raf = 0, active = false, last = 0, cur = [0.5, 0.5], curA = 0, t0 = performance.now();
  let lastDrop = [0, 0, -1];
  function setup() {
    canvas = document.createElement('canvas'); canvas.className = 'rp-canvas'; canvas.setAttribute('aria-hidden', 'true');
    const cs = getComputedStyle(img);
    Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', borderRadius: cs.borderRadius, pointerEvents: 'none', opacity: '0', transition: 'opacity .35s' });
    const host = img.parentElement; if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.appendChild(canvas);
    gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false }); if (!gl) return false;
    const sh = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); } catch { return false; }
    const U = n => gl.getUniformLocation(pr, n);
    gl.u = { res: U('res'), time: U('time'), drops: U('drops'), cur: U('cur'), curA: U('curA') };
    return true;
  }
  function size() {
    const r = img.getBoundingClientRect(), dpr = Math.min(1.5, devicePixelRatio || 1);
    // keep the texture's aspect: the picture may be object-fit: cover
    const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(gl.u.res, w, h);
  }
  function frame(now) {
    raf = 0; if (!gl) return;
    size();
    const t = (now - t0) / 1000;
    gl.uniform1f(gl.u.time, t);
    const flat = new Float32Array(24); for (let i = 0; i < 8; i++) { const d = drops[i] || [0, 0, -9]; flat[i * 3] = d[0]; flat[i * 3 + 1] = d[1]; flat[i * 3 + 2] = d[2]; }
    gl.uniform3fv(gl.u.drops, flat);
    gl.uniform2f(gl.u.cur, cur[0], cur[1]); gl.uniform1f(gl.u.curA, curA);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    curA += ((active ? 1 : 0) - curA) * 0.12;
    const live = active || curA > 0.01 || drops.some(d => t - d[2] < 2.2);
    if (live) raf = requestAnimationFrame(frame); else canvas.style.opacity = '0';
  }
  function uvOf(e) { const r = img.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; }
  img.addEventListener('pointerenter', e => {
    if (!canvas && !setup()) { gl = null; return; }
    if (!gl) return; active = true; canvas.style.opacity = '1'; cur = uvOf(e); if (!raf) raf = requestAnimationFrame(frame);
  });
  img.addEventListener('pointermove', e => {
    if (!gl) return; cur = uvOf(e); const now = performance.now();
    const moved = Math.hypot(cur[0] - lastDrop[0], (cur[1] - lastDrop[1]));
    if (now - last > 90 && moved > 0.04) { drops[di % 8] = [cur[0], cur[1], (now - t0) / 1000]; di++; last = now; lastDrop = cur; }
    if (!raf) raf = requestAnimationFrame(frame);
  });
  img.addEventListener('pointerleave', () => { active = false; });
  // the canvas sits over the picture; clicks still reach the picture because the canvas ignores pointer events
}

export function rippleAll(root = document) {
  if (calm || matchMedia('(hover: none)').matches) return;
  const pics = [...root.querySelectorAll('main img, .cs-cover img')].filter(i => !i.closest('.ex-bg,.lb,.v3-card') && i.getBoundingClientRect().width > 220);
  pics.forEach(img => img.complete ? attach(img) : img.addEventListener('load', () => attach(img), { once: true }));
}
