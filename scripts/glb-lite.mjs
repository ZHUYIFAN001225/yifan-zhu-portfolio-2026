// A small glTF 2.0 (.glb) reader for the models Blender exports here: node hierarchy with TRS, triangle meshes with
// POSITION / NORMAL / TEXCOORD_0 + indices, metal-rough materials with an embedded base-colour texture. Nothing else.
import * as THREE from '../assets/v3/lib/three/three.module.min.js';

const COMP = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

export async function loadGLB(url, { envMap = null, envMapIntensity = 1, onMaterial = null, maxTex = 0, aniso = 8 } = {}) {
  const buf = await (await fetch(url)).arrayBuffer();
  const dv = new DataView(buf);
  if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('not a glb: ' + url);
  let off = 12, json = null, bin = null;
  while (off < buf.byteLength) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true); off += 8;
    if (type === 0x4E4F534A) json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, off, len)));
    else if (type === 0x004E4942) bin = buf.slice(off, off + len);
    off += len;
  }
  const g = json;
  const view = i => { const v = g.bufferViews[i]; return { bytes: new Uint8Array(bin, v.byteOffset || 0, v.byteLength), stride: v.byteStride || 0, offset: v.byteOffset || 0 }; };
  const accessor = i => {
    const a = g.accessors[i], T = COMP[a.componentType], n = SIZE[a.type], v = g.bufferViews[a.bufferView];
    const start = (v.byteOffset || 0) + (a.byteOffset || 0);
    if (v.byteStride && v.byteStride !== n * T.BYTES_PER_ELEMENT) { // interleaved: copy out
      const out = new T(a.count * n), src = new DataView(bin);
      for (let k = 0; k < a.count; k++) for (let c = 0; c < n; c++) out[k * n + c] = T === Float32Array ? src.getFloat32(start + k * v.byteStride + c * 4, true) : T === Uint16Array ? src.getUint16(start + k * v.byteStride + c * 2, true) : T === Uint32Array ? src.getUint32(start + k * v.byteStride + c * 4, true) : src.getUint8(start + k * v.byteStride + c);
      return new THREE.BufferAttribute(out, n, a.normalized || false);
    }
    return new THREE.BufferAttribute(new T(bin, start, a.count * n), n, a.normalized || false);
  };
  const texCache = new Map();
  const texture = async ti => {
    if (texCache.has(ti)) return texCache.get(ti);
    const t = g.textures[ti], im = g.images[t.source], bv = view(im.bufferView);
    const blob = new Blob([bv.bytes], { type: im.mimeType || 'image/png' }), url = URL.createObjectURL(blob);
    let img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    URL.revokeObjectURL(url);
    // phones: a smaller copy goes to the GPU (a 4096² texture and its mipmaps alone is ~90 MB of video memory)
    if (maxTex && Math.max(img.width, img.height) > maxTex) { const k = maxTex / Math.max(img.width, img.height), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, c.width, c.height); img.src = ''; img = c; }
    const tex = new THREE.Texture(img); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = aniso; tex.needsUpdate = true;
    const s = g.samplers?.[t.sampler]; if (s) { tex.wrapS = s.wrapS === 33071 ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping; tex.wrapT = s.wrapT === 33071 ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping; }
    texCache.set(ti, tex); return tex;
  };
  const matCache = new Map();
  const material = async mi => {
    if (mi == null) return new THREE.MeshStandardMaterial({ color: 0xcccccc });
    if (matCache.has(mi)) return matCache.get(mi);
    const m = g.materials[mi], p = m.pbrMetallicRoughness || {};
    const mat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color().setRGB(...(p.baseColorFactor || [1, 1, 1]).slice(0, 3), THREE.LinearSRGBColorSpace), metalness: p.metallicFactor ?? 1, roughness: p.roughnessFactor ?? 1, side: m.doubleSided ? THREE.DoubleSide : THREE.FrontSide });
    if (p.baseColorTexture) mat.map = await texture(p.baseColorTexture.index);
    const cc = m.extensions?.KHR_materials_clearcoat; if (cc) { mat.clearcoat = cc.clearcoatFactor ?? 0; mat.clearcoatRoughness = cc.clearcoatRoughnessFactor ?? 0; }
    if (envMap) { mat.envMap = envMap; mat.envMapIntensity = envMapIntensity; }
    mat.name = m.name || ''; onMaterial?.(mat); matCache.set(mi, mat); return mat;
  };
  const mesh = async mi => {
    const group = new THREE.Group();
    for (const prim of g.meshes[mi].primitives) {
      const geo = new THREE.BufferGeometry();
      for (const [k, v] of Object.entries(prim.attributes)) { const name = { POSITION: 'position', NORMAL: 'normal', TEXCOORD_0: 'uv', TEXCOORD_1: 'uv1', TEXCOORD_2: 'uv2', TEXCOORD_3: 'uv3', COLOR_0: 'color' }[k]; if (name) geo.setAttribute(name, accessor(v)); }
      if (prim.indices != null) geo.setIndex(accessor(prim.indices));
      if (!geo.attributes.normal) geo.computeVertexNormals();
      const o = new THREE.Mesh(geo, await material(prim.material)); o.castShadow = true; o.receiveShadow = true; group.add(o);
    }
    return group;
  };
  const node = async ni => {
    const n = g.nodes[ni], o = n.mesh != null ? await mesh(n.mesh) : new THREE.Group(); o.name = n.name || '';
    if (n.matrix) o.applyMatrix4(new THREE.Matrix4().fromArray(n.matrix));
    else { if (n.translation) o.position.fromArray(n.translation); if (n.rotation) o.quaternion.fromArray(n.rotation); if (n.scale) o.scale.fromArray(n.scale); }
    for (const c of n.children || []) o.add(await node(c));
    return o;
  };
  const root = new THREE.Group(); root.name = url.split('/').pop();
  for (const ni of g.scenes[g.scene || 0].nodes) root.add(await node(ni));
  return root;
}
