# Glasgow Salon Booking — the reception counter, built and lit in Blender from the reference photograph.
# Run inside Blender 4.x/5.x (Scripting → Open → Run Script). It builds the set, renders the hero still, and exports
# each object as a .glb for the website's live 3D scene. Units: metres. Output goes next to the portfolio repo on D:.
import bpy, bmesh, math, os, random
import numpy as np
from mathutils import Vector, Euler

OUT = r"D:\我的作品集\assets\v3\desk"
MODELS = os.path.join(OUT, "models"); RENDER = os.path.join(OUT, "render")
for d in (MODELS, RENDER): os.makedirs(d, exist_ok=True)
random.seed(7)

# ---------------------------------------------------------------- reset
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
for coll in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.images, bpy.data.lights, bpy.data.cameras):
    for d in list(coll):
        if d.users == 0: coll.remove(d)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 160; scene.cycles.use_denoising = True
scene.render.resolution_x = 2592; scene.render.resolution_y = 1536; scene.render.resolution_percentage = 100
scene.render.film_transparent = False
scene.view_settings.view_transform = 'AgX' if 'AgX' in [i.identifier for i in bpy.types.ColorManagedViewSettings.bl_rna.properties['view_transform'].enum_items] else 'Filmic'
scene.view_settings.exposure = -1.15
for lk in ('AgX - Medium High Contrast', 'Medium High Contrast', 'High Contrast'):
    try: scene.view_settings.look = lk; break
    except Exception: continue
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for dt in ('OPTIX', 'CUDA'):
        try:
            prefs.compute_device_type = dt; prefs.get_devices()
            for d in prefs.devices: d.use = True
            scene.cycles.device = 'GPU'; break
        except Exception: continue
except Exception: pass

def pin(node, name, value):
    """set a Principled input by name, tolerant of version differences"""
    for n in (name,) + {'Coat Weight': ('Clearcoat',), 'Coat Roughness': ('Clearcoat Roughness',), 'Specular IOR Level': ('Specular',), 'Anisotropic': ('Anisotropy',)}.get(name, ()):
        if n in node.inputs:
            node.inputs[n].default_value = value; return

def material(name, color=(.8, .8, .8, 1), rough=.5, metal=0, coat=0, coat_rough=.1, image=None, bump=None, bump_strength=.1, aniso=0, emission=None):
    m = bpy.data.materials.new(name)
    try: m.use_nodes = True
    except Exception: pass
    nt = m.node_tree
    if nt is None: m.node_tree = bpy.data.node_groups.new(name + '_nt', 'ShaderNodeTree'); nt = m.node_tree
    bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    out = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None)
    if out is None: out = nt.nodes.new('ShaderNodeOutputMaterial')
    if bsdf is None: bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled'); nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    pin(bsdf, 'Base Color', color); pin(bsdf, 'Roughness', rough); pin(bsdf, 'Metallic', metal)
    if coat: pin(bsdf, 'Coat Weight', coat); pin(bsdf, 'Coat Roughness', coat_rough)
    if aniso: pin(bsdf, 'Anisotropic', aniso)
    if image is not None:
        tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = image; tex.location = (-400, 200)
        nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
        if name == 'wood':
            tc = nt.nodes.new('ShaderNodeTexCoord'); mpn = nt.nodes.new('ShaderNodeMapping'); mpn.inputs['Scale'].default_value = (1, 1, 1); mpn.inputs['Rotation'].default_value = (0, 0, math.radians(1.5))
            nt.links.new(tc.outputs['UV'], mpn.inputs['Vector']); nt.links.new(mpn.outputs['Vector'], tex.inputs['Vector'])
    if bump is not None:
        tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = bump; tex.location = (-600, -200)
        if name == 'wood': nt.links.new(mpn.outputs['Vector'], tex.inputs['Vector'])
        else: tex.image.colorspace_settings.name = 'Non-Color'
        b = nt.nodes.new('ShaderNodeBump'); b.inputs['Strength'].default_value = bump_strength; b.location = (-250, -200)
        nt.links.new(tex.outputs['Color'], b.inputs['Height']); nt.links.new(b.outputs['Normal'], bsdf.inputs['Normal'])
    if emission is not None:
        pin(bsdf, 'Emission Color', emission[0]); pin(bsdf, 'Emission Strength', emission[1])
    return m

def image_from_array(name, arr):
    """arr: float32 H×W×4 in 0..1 → Blender image (saved as PNG beside the models so the glb exporter can embed it)"""
    h, w = arr.shape[:2]
    img = bpy.data.images.new(name, w, h, alpha=True); img.pixels = arr[::-1].reshape(-1).tolist()
    img.filepath_raw = os.path.join(MODELS, name + '.png'); img.file_format = 'PNG'; img.save()
    return img

def smooth(obj, angle=35):
    try: bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))
    except Exception:
        try:
            bpy.ops.object.shade_smooth(); obj.data.use_auto_smooth = True; obj.data.auto_smooth_angle = math.radians(angle)
        except Exception: pass

def box(name, size, loc=(0, 0, 0), rot=(0, 0, 0), bevel=0.0, segs=3, mat=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot); o = bpy.context.object; o.name = name
    o.scale = (size[0], size[1], size[2]); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel: b = o.modifiers.new('bevel', 'BEVEL'); b.width = bevel; b.segments = segs; b.limit_method = 'ANGLE'
    if mat: o.data.materials.append(mat)
    smooth(o, 40); return o

def cylinder(name, r, depth, loc=(0, 0, 0), rot=(0, 0, 0), verts=48, r2=None, mat=None):
    if r2 is None: bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, vertices=verts, location=loc, rotation=rot)
    else: bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=depth, vertices=verts, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    if mat: o.data.materials.append(mat)
    smooth(o, 40); return o

def torus(name, R, r, loc=(0, 0, 0), rot=(0, 0, 0), mat=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=64, minor_segments=20, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    if mat: o.data.materials.append(mat)
    bpy.ops.object.shade_smooth(); return o

def curve_tube(name, pts, radius, mat=None, cyclic=False, bevel_res=6):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = bevel_res; cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts): bp.co = Vector(p); bp.handle_left_type = bp.handle_right_type = 'AUTO'
    sp.use_cyclic_u = cyclic
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o)
    if mat: o.data.materials.append(mat)
    return o

def extrude_shape(name, pts2d, thickness, mat=None, bevel=0.0):
    """a flat 2D outline (list of (x,y) in metres) extruded upward by thickness"""
    bm = bmesh.new(); vs = [bm.verts.new((x, y, 0)) for x, y in pts2d]; f = bm.faces.new(vs)
    bmesh.ops.recalc_face_normals(bm, faces=[f])
    r = bmesh.ops.extrude_face_region(bm, geom=[f]); up = [g for g in r['geom'] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, 0, thickness), verts=up)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    if bevel: b = o.modifiers.new('bevel', 'BEVEL'); b.width = bevel; b.segments = 3; b.limit_method = 'ANGLE'
    if mat: o.data.materials.append(mat)
    bpy.context.view_layer.objects.active = o; o.select_set(True); smooth(o, 40); return o

def group(name, objs, loc=(0, 0, 0), rot_z=0.0):
    e = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(e); e.location = loc; e.rotation_euler = (0, 0, rot_z)
    for o in objs: o.parent = e
    return e

# ---------------------------------------------------------------- textures (generated, so they export)
def vnoise(h, w, cells, rng):
    """smooth value noise: a random grid, bilinearly upsampled"""
    g = rng.random((cells + 1, cells + 1)).astype(np.float32)
    ys = np.linspace(0, cells, h, endpoint=False); xs = np.linspace(0, cells, w, endpoint=False)
    y0 = np.floor(ys).astype(int); x0 = np.floor(xs).astype(int); fy = (ys - y0)[:, None]; fx = (xs - x0)[None, :]
    fy = fy * fy * (3 - 2 * fy); fx = fx * fx * (3 - 2 * fx)
    a = g[y0][:, x0]; b = g[y0][:, x0 + 1]; c = g[y0 + 1][:, x0]; d = g[y0 + 1][:, x0 + 1]
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy

def wood_texture(w=2048, h=2048):
    rng = np.random.default_rng(3)
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    warp = (vnoise(h, w, 3, rng) - .5) * 110 + (vnoise(h, w, 14, rng) - .5) * 14
    rings = np.sin((y + warp) * 0.16 + x * 0.0009) * .5 + .5           # long straight-ish grain, ~40 px apart
    lines = np.clip((rings - .72) / .28, 0, 1) ** 1.3
    pores = np.clip(rng.normal(0, 1, (h, w)).astype(np.float32) * .5 - .6, 0, 1) * (vnoise(h, w, 3, rng) * .6 + .4)
    big = vnoise(h, w, 4, rng)
    base = np.array([0.80, 0.60, 0.38], np.float32)
    tone = 1.0 - lines * .34 - pores * .14 + (big - .5) * .14
    col = np.stack([base[0] * tone, base[1] * tone * (1 - lines * .06), base[2] * tone * (1 - lines * .12), np.ones_like(tone)], -1)
    bump = np.stack([1 - lines * .7 - pores * .5] * 3 + [np.ones_like(lines)], -1)
    return np.clip(col, 0, 1), np.clip(bump, 0, 1)

def mat_texture(w=2400, h=1800):
    col = np.zeros((h, w, 4), np.float32); col[..., :3] = np.array([0.08, 0.26, 0.19]); col[..., 3] = 1
    rng = np.random.default_rng(5); col[..., :3] += rng.normal(0, .012, (h, w, 1))
    m = 110; cell = 70
    for X in range(m, w - m + 1, cell): col[m:h - m, X - 1:X + 1, :3] = col[m:h - m, X - 1:X + 1, :3] * .62 + np.array([.72, .86, .78]) * .38
    for Y in range(m, h - m + 1, cell): col[Y - 1:Y + 1, m:w - m, :3] = col[Y - 1:Y + 1, m:w - m, :3] * .62 + np.array([.72, .86, .78]) * .38
    for X in range(m, w - m + 1, cell * 5): col[m:h - m, X - 2:X + 2, :3] = np.array([.82, .92, .86])
    for Y in range(m, h - m + 1, cell * 5): col[Y - 2:Y + 2, m:w - m, :3] = np.array([.82, .92, .86])
    col[m - 2:m + 2, m:w - m, :3] = col[h - m - 2:h - m + 2, m:w - m, :3] = np.array([.85, .94, .88]); col[m:h - m, m - 2:m + 2, :3] = col[m:h - m, w - m - 2:w - m + 2, :3] = np.array([.85, .94, .88])
    for X in range(m, w - m + 1, cell):  # ruler ticks
        big = ((X - m) // cell) % 5 == 0; L = 26 if big else 12
        col[m - L:m, X - 1:X + 1, :3] = np.array([.85, .94, .88]); col[h - m:h - m + L, X - 1:X + 1, :3] = np.array([.85, .94, .88])
    for Y in range(m, h - m + 1, cell):
        big = ((Y - m) // cell) % 5 == 0; L = 26 if big else 12
        col[Y - 1:Y + 1, m - L:m, :3] = np.array([.85, .94, .88]); col[Y - 1:Y + 1, w - m:w - m + L, :3] = np.array([.85, .94, .88])
    return np.clip(col, 0, 1)

def page_texture(w=1024, h=1400):
    col = np.zeros((h, w, 4), np.float32); col[..., :3] = np.array([0.90, 0.86, 0.76]); col[..., 3] = 1
    rng = np.random.default_rng(9); col[..., :3] += rng.normal(0, .006, (h, w, 1))
    for i in range(17):
        y = 190 + i * 68; col[y - 1:y + 2, 80:w - 80, :3] = np.array([.42, .52, .56])
    col[120:124, 96:420, :3] = np.array([.12, .22, .18])  # the day header, a bar where the title sits
    return np.clip(col, 0, 1)

# the wood comes from the reference photograph itself (grain lifted from it, tiled, on its own colour)
IMG_WOOD = bpy.data.images.load(os.path.join(OUT, 'ref_wood.png')); IMG_WOODB = IMG_WOOD
IMG_MAT = image_from_array('cutting_mat', mat_texture()); IMG_PAGE = image_from_array('page', page_texture())

# ---------------------------------------------------------------- materials
M = dict(
    wood=material('wood', image=IMG_WOOD, bump=IMG_WOODB, bump_strength=.18, rough=.5, coat=.04, coat_rough=.4),
    mat=material('cutting_mat', image=IMG_MAT, rough=.9),
    cover=material('cover_cloth', (.05, .13, .09, 1), rough=.8),
    paper=material('paper', image=IMG_PAGE, rough=.95),
    paper_edge=material('paper_edge', (.86, .81, .70, 1), rough=.95),
    ribbon=material('ribbon', (.75, .10, .08, 1), rough=.7),
    yellow=material('pencil_yellow', (.92, .55, .06, 1), rough=.4, coat=.5, coat_rough=.12),
    woodtip=material('pencil_wood', (.80, .66, .46, 1), rough=.8),
    graphite=material('graphite', (.08, .08, .09, 1), rough=.35, metal=.3),
    ferrule=material('ferrule', (.80, .82, .85, 1), rough=.3, metal=1),
    eraser_pink=material('eraser_pink', (.86, .45, .45, 1), rough=.85),
    steel=material('steel', (.84, .84, .84, 1), rough=.2, metal=1, aniso=.6),
    chrome=material('chrome', (.90, .91, .93, 1), rough=.08, metal=1),
    black=material('black_plastic', (.03, .035, .04, 1), rough=.35, coat=.5, coat_rough=.2),
    green_pen=material('green_pen', (.05, .22, .14, 1), rough=.3, coat=.7, coat_rough=.1),
    eraser_white=material('eraser_white', (.94, .93, .90, 1), rough=.8),
    eraser_blue=material('eraser_blue', (.12, .25, .62, 1), rough=.6),
    phone_body=material('phone_body', (.58, .60, .64, 1), rough=.3, metal=1),
    phone_glass=material('phone_glass', (.01, .012, .02, 1), rough=.08, coat=1, coat_rough=.03),
)

# procedural oak: long wavy rings + fine pores, in the reference's colours — seamless by construction
def oak_nodes(m):
    nt = m.node_tree; bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 1, 1); mp.inputs['Rotation'].default_value = (0, 0, math.radians(2))
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    warp = nt.nodes.new('ShaderNodeTexNoise'); warp.inputs['Scale'].default_value = 1.2; warp.inputs['Detail'].default_value = 3; warp.inputs['Roughness'].default_value = .55
    nt.links.new(mp.outputs['Vector'], warp.inputs['Vector'])
    wave = nt.nodes.new('ShaderNodeTexWave'); wave.wave_type = 'BANDS'; wave.inputs['Scale'].default_value = 150; wave.inputs['Distortion'].default_value = 2.2; wave.inputs['Detail'].default_value = 2; wave.inputs['Detail Scale'].default_value = 1.2; wave.inputs['Detail Roughness'].default_value = .5
    try: wave.bands_direction = 'Y'
    except Exception: pass
    nt.links.new(mp.outputs['Vector'], wave.inputs['Vector'])
    pores = nt.nodes.new('ShaderNodeTexNoise'); pores.inputs['Scale'].default_value = 420; pores.inputs['Detail'].default_value = 2; pores.inputs['Roughness'].default_value = .7
    stretch = nt.nodes.new('ShaderNodeMapping'); stretch.inputs['Scale'].default_value = (1, 14, 1)   # pores elongated along the grain
    nt.links.new(mp.outputs['Vector'], stretch.inputs['Vector']); nt.links.new(stretch.outputs['Vector'], pores.inputs['Vector'])
    big = nt.nodes.new('ShaderNodeTexNoise'); big.inputs['Scale'].default_value = .7; big.inputs['Detail'].default_value = 1
    nt.links.new(mp.outputs['Vector'], big.inputs['Vector'])
    ramp = nt.nodes.new('ShaderNodeValToRGB'); e = ramp.color_ramp.elements; e[0].position = .0; e[0].color = (.72, .50, .28, 1); e[1].position = 1.0; e[1].color = (.50, .32, .16, 1)
    e2 = ramp.color_ramp.elements.new(.6); e2.color = (.66, .45, .25, 1)
    nt.links.new(wave.outputs['Fac'], ramp.inputs['Fac'])
    mixp = nt.nodes.new('ShaderNodeMix'); mixp.data_type = 'RGBA'; mixp.blend_type = 'MULTIPLY'; mixp.inputs['Factor'].default_value = .25
    nt.links.new(ramp.outputs['Color'], mixp.inputs[6]); nt.links.new(pores.outputs['Fac'], mixp.inputs[7])
    mixb = nt.nodes.new('ShaderNodeMix'); mixb.data_type = 'RGBA'; mixb.blend_type = 'MULTIPLY'; mixb.inputs['Factor'].default_value = .22
    nt.links.new(mixp.outputs[2], mixb.inputs[6]); nt.links.new(big.outputs['Color'], mixb.inputs[7])
    nt.links.new(mixb.outputs[2], bsdf.inputs['Base Color'])
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = .08; bump.inputs['Distance'].default_value = .001
    nt.links.new(wave.outputs['Fac'], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    rr = nt.nodes.new('ShaderNodeMapRange'); rr.inputs['From Min'].default_value = 0; rr.inputs['From Max'].default_value = 1; rr.inputs['To Min'].default_value = .62; rr.inputs['To Max'].default_value = .42
    nt.links.new(wave.outputs['Fac'], rr.inputs['Value']); nt.links.new(rr.outputs['Result'], bsdf.inputs['Roughness'])

# ---------------------------------------------------------------- the set
exportables = {}
# desk
bpy.ops.mesh.primitive_plane_add(size=1.7, location=(0, 0, 0)); desk = bpy.context.object; desk.name = 'desk'; desk.data.materials.append(M['wood'])
# cutting mat 60×45 cm
bpy.ops.mesh.primitive_plane_add(size=1, location=(.09, -.05, .003), rotation=(0, 0, math.radians(3))); mat_o = bpy.context.object; mat_o.name = 'mat'; mat_o.rotation_euler.z = math.radians(5); mat_o.scale = (.60, .42, 1); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
sol = mat_o.modifiers.new('solid', 'SOLIDIFY'); sol.thickness = .003; sol.offset = -1; bv = mat_o.modifiers.new('bevel', 'BEVEL'); bv.width = .002; bv.segments = 3
mat_o.data.materials.append(M['mat']); smooth(mat_o, 40)
exportables['mat'] = [mat_o]

# notebook: cover + page blocks + top pages + ribbon
def notebook():
    objs = []
    cover = box('nb_cover', (.325, .225, .006), loc=(0, 0, .003), bevel=.002, mat=M['cover']); objs.append(cover)
    spine = box('nb_spine', (.004, .210, .008), loc=(0, 0, .0045), bevel=.0015, mat=M['cover']); objs.append(spine)
    for side in (-1, 1):
        blk = box(f'nb_block_{"l" if side < 0 else "r"}', (.146, .200, .012), loc=(side * .0745, 0, .012), bevel=.001, mat=M['paper_edge']); objs.append(blk)
        bpy.ops.mesh.primitive_plane_add(size=1, location=(side * .0745, 0, .0182)); pg = bpy.context.object; pg.name = f'nb_page_{"l" if side < 0 else "r"}'
        pg.scale = (.144, .198, 1); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        # a gentle curve towards the spine
        pg.data.materials.append(M['paper']); objs.append(pg)
        if side > 0:  # flip the uv so both pages read upright
            pass
    rib = box('nb_ribbon', (.010, .105, .0012), loc=(.108, -.035, .0192), rot=(0, 0, math.radians(-10)), bevel=.0004, mat=M['ribbon']); objs.append(rib)
    return group('notebook', objs, loc=(-.16, -.04, 0), rot_z=math.radians(11)), objs
nb, nb_objs = notebook(); exportables['notebook'] = nb_objs
bpy.context.view_layer.update()
with open(os.path.join(RENDER, 'debug.txt'), 'w') as fh:
    for o in nb_objs: bb = [o.matrix_world @ Vector(c) for c in o.bound_box]; fh.write(f"{o.name} x[{min(v.x for v in bb):.3f},{max(v.x for v in bb):.3f}] y[{min(v.y for v in bb):.3f},{max(v.y for v in bb):.3f}] z[{min(v.z for v in bb):.3f},{max(v.z for v in bb):.3f}] loc={tuple(round(c,3) for c in o.location)} scale={tuple(round(c,3) for c in o.scale)}\n")

def pencil():
    objs = []
    body = cylinder('pc_body', .0036, .165, rot=(0, math.radians(90), 0), verts=6, mat=M['yellow']); objs.append(body)
    tip = cylinder('pc_tip', .0036, .018, loc=(.0915, 0, 0), rot=(0, math.radians(90), 0), r2=.0008, verts=24, mat=M['woodtip']); objs.append(tip)
    lead = cylinder('pc_lead', .0009, .006, loc=(.1025, 0, 0), rot=(0, math.radians(90), 0), r2=.0001, verts=12, mat=M['graphite']); objs.append(lead)
    fer = cylinder('pc_ferrule', .0039, .011, loc=(-.087, 0, 0), rot=(0, math.radians(90), 0), verts=32, mat=M['ferrule']); objs.append(fer)
    er = cylinder('pc_eraser', .0037, .009, loc=(-.097, 0, 0), rot=(0, math.radians(90), 0), verts=32, mat=M['eraser_pink']); objs.append(er)
    for o in objs: o.location.z += .0038
    return group('pencil', objs, loc=(.02, .165, 0), rot_z=math.radians(-6)), objs
pc, pc_objs = pencil(); exportables['pencil'] = pc_objs

def pen():
    objs = []
    body = cylinder('pen_body', .0042, .120, rot=(0, math.radians(90), 0), verts=40, mat=M['green_pen']); objs.append(body)
    grip = cylinder('pen_grip', .0036, .028, loc=(.070, 0, 0), rot=(0, math.radians(90), 0), r2=.0025, verts=40, mat=M['steel']); objs.append(grip)
    tip = cylinder('pen_tip', .0012, .006, loc=(.087, 0, 0), rot=(0, math.radians(90), 0), r2=.0003, verts=16, mat=M['chrome']); objs.append(tip)
    cap = cylinder('pen_cap', .0044, .004, loc=(-.062, 0, 0), rot=(0, math.radians(90), 0), verts=40, mat=M['chrome']); objs.append(cap)
    clip = box('pen_clip', (.045, .004, .0015), loc=(-.040, 0, .0052), bevel=.0005, mat=M['chrome']); objs.append(clip)
    for o in objs: o.location.z += .0044
    return group('pen', objs, loc=(-.21, .215, 0), rot_z=math.radians(-19)), objs
pn, pn_objs = pen(); exportables['pen'] = pn_objs

def eraser():
    objs = []
    blk = box('er_block', (.052, .022, .013), loc=(0, 0, .0065), bevel=.0015, mat=M['eraser_white']); objs.append(blk)
    slv = box('er_sleeve', (.028, .0232, .0135), loc=(.010, 0, .00675), bevel=.001, mat=M['eraser_blue']); objs.append(slv)
    return group('eraser', objs, loc=(-.41, .05, 0), rot_z=math.radians(52)), objs
er, er_objs = eraser(); exportables['eraser'] = er_objs

def comb():
    objs = []
    back = box('comb_back', (.190, .012, .004), loc=(0, .010, .002), bevel=.001, mat=M['black']); objs.append(back)
    tooth = box('comb_tooth', (.0018, .022, .0035), loc=(-.088, -.006, .00175), bevel=.0004, mat=M['black'])
    arr = tooth.modifiers.new('array', 'ARRAY'); arr.count = 46; arr.use_relative_offset = False; arr.use_constant_offset = True; arr.constant_offset_displace = (.0039, 0, 0)
    objs.append(tooth)
    return group('comb', objs, loc=(-.08, -.255, 0), rot_z=math.radians(-7)), objs
cb, cb_objs = comb(); exportables['comb'] = cb_objs

def scissors():
    """hairdressing shears, closed: two slender blades, knurled pivot, offset shanks, rings, a tang"""
    objs = []
    def blade(name, length, flip):
        n = 24; pts = []
        for i in range(n + 1):  # top edge straight-ish, belly curved to the tip
            t = i / n; pts.append((t * length, .0085 * (1 - t) ** .6 + .0004))
        for i in range(n, -1, -1):
            t = i / n; pts.append((t * length, -(.0085 * (1 - t) ** 1.4 + .0004)))
        o = extrude_shape(name, pts, .0022, mat=M['steel'], bevel=.0004); return o
    b1 = blade('sc_blade_a', .085, False); b1.location = (0, 0, .0030)
    b2 = blade('sc_blade_b', .080, True); b2.location = (0, .0015, .0052); b2.rotation_euler.z = math.radians(1.5)
    objs += [b1, b2]
    piv = cylinder('sc_pivot', .0055, .0030, loc=(0, 0, .0078), verts=48, mat=M['chrome']); objs.append(piv)
    knurl = torus('sc_knurl', .0048, .0009, loc=(0, 0, .0084), mat=M['chrome']); objs.append(knurl)
    shankA = curve_tube('sc_shank_a', [(-.002, .002, .004), (-.030, .006, .004), (-.058, .012, .004), (-.074, .016, .004)], .0022, mat=M['steel']); objs.append(shankA)
    shankB = curve_tube('sc_shank_b', [(-.002, -.002, .0055), (-.026, -.010, .0055), (-.048, -.026, .0055), (-.061, -.036, .0055)], .0022, mat=M['steel']); objs.append(shankB)
    ringA = torus('sc_ring_a', .0105, .0024, loc=(-.085, .018, .004), mat=M['steel']); ringA.scale.y = 1.1; objs.append(ringA)
    ringB = torus('sc_ring_b', .0100, .0024, loc=(-.071, -.043, .0055), mat=M['steel']); objs.append(ringB)
    tang = curve_tube('sc_tang', [(-.081, -.047, .0055), (-.093, -.054, .0055), (-.104, -.052, .0055), (-.108, -.044, .0055)], .0018, mat=M['steel']); objs.append(tang)
    bump = cylinder('sc_bumper', .0016, .004, loc=(-.052, -.021, .0055), rot=(math.radians(90), 0, 0), verts=12, mat=M['black']); objs.append(bump)
    g_ = group('scissors', objs, loc=(.34, -.13, 0), rot_z=math.radians(151)); g_.scale = (1.25, 1.25, 1.25); return g_, objs
sc, sc_objs = scissors(); exportables['scissors'] = sc_objs

def paperclip(name, loc, rz):
    pts = [(-.021, -.006, .0007), (.018, -.006, .0007), (.022, -.002, .0007), (.022, .002, .0007), (.018, .006, .0007), (-.015, .006, .0007), (-.019, .003, .0007), (-.019, -.0015, .0007), (-.015, -.004, .0007), (.010, -.004, .0007), (.013, -.001, .0007), (.013, .0015, .0007), (.010, .0035, .0007), (-.010, .0035, .0007)]
    o = curve_tube(name, pts, .0006, mat=M['chrome'], bevel_res=4); o.location = loc; o.rotation_euler.z = rz; o.scale = (.75, .75, .75); return o
clips = [paperclip('clip_a', (-.43, -.22, 0), math.radians(20)), paperclip('clip_b', (-.41, -.26, 0), math.radians(100)), paperclip('clip_c', (-.44, -.30, 0), math.radians(-30))]
exportables['clips'] = clips

def binder():
    objs = []
    b = box('bd_body', (.032, .014, .013), loc=(0, 0, .0065), bevel=.0008, mat=M['black']); objs.append(b)
    for sg in (1, -1):
        w = curve_tube(f'bd_wire_{sg}', [(-.011, sg * .006, .013), (-.011, sg * .016, .022), (.011, sg * .016, .022), (.011, sg * .006, .013)], .0007, mat=M['chrome']); objs.append(w)
    return group('binder', objs, loc=(-.46, -.17, 0), rot_z=math.radians(-35)), objs
bd, bd_objs = binder(); exportables['binder'] = bd_objs

# the phone (render only — the website has its own live one at this exact spot)
def phone():
    body = box('ph_body', (.0715, .1475, .0078), loc=(0, 0, .0039), bevel=.006, segs=6, mat=M['phone_body'])
    glass = box('ph_glass', (.0690, .1450, .0006), loc=(0, 0, .0081), bevel=.0005, segs=3, mat=M['phone_glass'])
    return group('phone', [body, glass], loc=(.13, -.04, 0), rot_z=math.radians(4))
ph = phone()

# ---------------------------------------------------------------- light: afternoon sun through a window with slats, soft sky fill
world = bpy.data.worlds.new('world'); scene.world = world
try: world.use_nodes = True
except Exception: pass
wn = world.node_tree
if wn is None: world.node_tree = bpy.data.node_groups.new('world_nt', 'ShaderNodeTree'); wn = world.node_tree
bg = next((n for n in wn.nodes if n.type == 'BACKGROUND'), None); wout = next((n for n in wn.nodes if n.type == 'OUTPUT_WORLD'), None)
if wout is None: wout = wn.nodes.new('ShaderNodeOutputWorld')
if bg is None: bg = wn.nodes.new('ShaderNodeBackground'); wn.links.new(bg.outputs['Background'], wout.inputs['Surface'])
sky = wn.nodes.new('ShaderNodeTexSky')
for st in ('NISHITA', 'MULTIPLE_SCATTERING', 'SINGLE_SCATTERING'):
    try: sky.sky_type = st; break
    except Exception: continue
for k, v in (('sun_elevation', math.radians(22)), ('sun_rotation', math.radians(300)), ('sun_intensity', .25), ('altitude', 0), ('sun_disc', False)):
    try: setattr(sky, k, v)
    except Exception: pass
bg.inputs['Color'].default_value = (.70, .62, .55, 1); bg.inputs['Strength'].default_value = .5
sun = bpy.data.lights.new('sun', 'AREA'); sun.energy = 1700; sun.size = .6; sun.color = (1.0, .80, .56); sun.shape = 'SQUARE'
sun_o = bpy.data.objects.new('sun', sun); bpy.context.collection.objects.link(sun_o); sun_o.location = (-1.5, 1.2, 1.7)
sun_o.rotation_euler = (Vector((0, 0, 0)) - sun_o.location).to_track_quat('-Z', 'Y').to_euler()
fill = bpy.data.lights.new('fill', 'AREA'); fill.energy = 160; fill.size = 2.5; fill.color = (.86, .90, 1.0)
fill_o = bpy.data.objects.new('fill', fill); bpy.context.collection.objects.link(fill_o); fill_o.location = (-.8, .9, 1.6); fill_o.rotation_euler = Euler((math.radians(30), 0, math.radians(-40)))
# a venetian blind between the sun and the desk: a transparent plane with opaque bands, so the sun arrives in stripes
blind = bpy.data.materials.new('blind'); blind.use_nodes = True; bn = blind.node_tree
for n in list(bn.nodes): bn.nodes.remove(n)
bout = bn.nodes.new('ShaderNodeOutputMaterial'); mixs = bn.nodes.new('ShaderNodeMixShader'); tr = bn.nodes.new('ShaderNodeBsdfTransparent'); dk = bn.nodes.new('ShaderNodeBsdfDiffuse'); dk.inputs['Color'].default_value = (0, 0, 0, 1)
wave = bn.nodes.new('ShaderNodeTexWave'); wave.inputs['Scale'].default_value = .7; wave.inputs['Distortion'].default_value = .12; wave.inputs['Detail'].default_value = 0.0
try: wave.bands_direction = 'X'
except Exception: pass
ramp = bn.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position = .28; ramp.color_ramp.elements[1].position = .52
tco = bn.nodes.new('ShaderNodeTexCoord'); mp = bn.nodes.new('ShaderNodeMapping'); mp.inputs['Rotation'].default_value = (0, 0, math.radians(80))
bn.links.new(tco.outputs['Object'], mp.inputs['Vector']); bn.links.new(mp.outputs['Vector'], wave.inputs['Vector']); bn.links.new(wave.outputs['Fac'], ramp.inputs['Fac'])
bn.links.new(ramp.outputs['Color'], mixs.inputs['Fac']); bn.links.new(tr.outputs['BSDF'], mixs.inputs[1]); bn.links.new(dk.outputs['BSDF'], mixs.inputs[2]); bn.links.new(mixs.outputs['Shader'], bout.inputs['Surface'])
# (blind plane off: the slats below do the job more predictably)
# (the old slats are kept off)
slat_mat = material('slat', (.1, .1, .1, 1))
# sunlight through a tree outside the window: a gobo plane with a leafy, irregular mask hangs between the lamp and the
# counter, and an opaque sheet keeps the direct sun off the right-hand half — that side is lit by the room only
gobo = bpy.data.materials.new('gobo'); gobo.use_nodes = True; gn = gobo.node_tree
for n in list(gn.nodes): gn.nodes.remove(n)
gout = gn.nodes.new('ShaderNodeOutputMaterial'); gmix = gn.nodes.new('ShaderNodeMixShader'); gtr = gn.nodes.new('ShaderNodeBsdfTransparent'); gdk = gn.nodes.new('ShaderNodeBsdfDiffuse'); gdk.inputs['Color'].default_value = (0, 0, 0, 1)
gco = gn.nodes.new('ShaderNodeTexCoord'); gmp = gn.nodes.new('ShaderNodeMapping'); gmp.inputs['Scale'].default_value = (1, 1, 1)
n1 = gn.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 4.2; n1.inputs['Detail'].default_value = 5; n1.inputs['Roughness'].default_value = .62; n1.inputs['Distortion'].default_value = .9
n2 = gn.nodes.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 1.4; n2.inputs['Detail'].default_value = 2
gn.links.new(gco.outputs['Object'], gmp.inputs['Vector']); gn.links.new(gmp.outputs['Vector'], n1.inputs['Vector']); gn.links.new(gmp.outputs['Vector'], n2.inputs['Vector'])
gadd = gn.nodes.new('ShaderNodeMath'); gadd.operation = 'ADD'; gn.links.new(n1.outputs['Fac'], gadd.inputs[0]); gn.links.new(n2.outputs['Fac'], gadd.inputs[1])
gr = gn.nodes.new('ShaderNodeValToRGB'); gr.color_ramp.elements[0].position = .90; gr.color_ramp.elements[1].position = 1.08   # below → leaf (dark), above → gap (light)
gn.links.new(gadd.outputs['Value'], gr.inputs['Fac'])
gn.links.new(gr.outputs['Color'], gmix.inputs['Fac']); gn.links.new(gdk.outputs['BSDF'], gmix.inputs[1]); gn.links.new(gtr.outputs['BSDF'], gmix.inputs[2]); gn.links.new(gmix.outputs['Shader'], gout.inputs['Surface'])
bpy.ops.mesh.primitive_plane_add(size=3.0, location=(-.28, .22, .34)); gb = bpy.context.object; gb.name = 'tree_gobo'; gb.data.materials.append(gobo); gb.visible_camera = False
try: gb.visible_shadow = True
except Exception: pass
# the sheet that keeps direct sun off the right half (its edge is soft because the lamp has size)
sheet = box('sun_sheet', (2.4, 3.0, .004), loc=(.92, .05, .34), rot=(0, 0, math.radians(-25)), mat=slat_mat); sheet.visible_camera = False
try: sheet.visible_shadow = True
except Exception: pass

# ---------------------------------------------------------------- camera: above, a touch forward, like the reference
cam = bpy.data.cameras.new('cam'); cam.lens = 36; cam.sensor_width = 36
cam.dof.use_dof = True; cam.dof.focus_distance = .98; cam.dof.aperture_fstop = 4.0
cam_o = bpy.data.objects.new('cam', cam); bpy.context.collection.objects.link(cam_o)
cam_o.location = (-.02, -.46, .86); cam_o.rotation_euler = Euler((math.radians(26), 0, math.radians(-4)))
scene.camera = cam_o

# ---------------------------------------------------------------- export each thing as .glb (y-up, metres; textures embedded)
for mod in ('io_scene_gltf2', 'bl_ext.blender_org.io_scene_gltf2'):
    try: bpy.ops.preferences.addon_enable(module=mod); break
    except Exception: continue
HAS_GLTF = hasattr(bpy.ops.export_scene, 'gltf') and bpy.ops.export_scene.gltf.poll() is not None
def export(name, objs):
    if not hasattr(bpy.ops.export_scene, 'gltf'): print('no glTF exporter'); return
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
        for c in o.children_recursive: c.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    kw = dict(filepath=os.path.join(MODELS, name + '.glb'), export_format='GLB', use_selection=True, export_apply=True, export_yup=True, export_materials='EXPORT')
    try: bpy.ops.export_scene.gltf(**kw, export_image_format='AUTO')
    except TypeError: bpy.ops.export_scene.gltf(**kw)
    except Exception as e: print('export failed', name, e)
for name, objs in exportables.items():
    parent = objs[0].parent
    export(name, [parent] if parent else objs)
export('desk', [desk])
bpy.ops.object.select_all(action='DESELECT')

# ---------------------------------------------------------------- grade: the light arrives from the left; the right falls off; soft vignette
def build_grade(ct, out_node):
    rl = ct.nodes.new('CompositorNodeRLayers')
    ell = ct.nodes.new('CompositorNodeEllipseMask')
    for k, v in (('x', .34), ('y', .56), ('width', 1.4), ('height', 1.2)):
        try: setattr(ell, k, v)
        except Exception:
            try: ell.inputs[k.capitalize()].default_value = v
            except Exception: pass
    blur = ct.nodes.new('CompositorNodeBlur'); blur.filter_type = 'GAUSS'
    try: blur.use_relative = True; blur.factor_x = 28; blur.factor_y = 28
    except Exception: blur.size_x = 500; blur.size_y = 500
    ct.links.new(ell.outputs['Mask'], blur.inputs['Image'])
    mr = ct.nodes.new('CompositorNodeMapRange'); mr.inputs['From Min'].default_value = 0; mr.inputs['From Max'].default_value = 1; mr.inputs['To Min'].default_value = .5; mr.inputs['To Max'].default_value = 1.06
    ct.links.new(blur.outputs['Image'], mr.inputs['Value'])
    mul = ct.nodes.new('CompositorNodeMixRGB'); mul.blend_type = 'MULTIPLY'; mul.inputs['Fac'].default_value = 1
    ct.links.new(rl.outputs['Image'], mul.inputs[1]); ct.links.new(mr.outputs['Value'], mul.inputs[2])
    ct.links.new(mul.outputs['Image'], out_node.inputs[0])
try:
    if hasattr(scene, 'compositing_node_group'):
        ng = bpy.data.node_groups.new('grade', 'CompositorNodeTree')
        try: ng.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
        except Exception: pass
        outn = ng.nodes.new('NodeGroupOutput'); build_grade(ng, outn); scene.compositing_node_group = ng
    else:
        scene.use_nodes = True; ct = scene.node_tree
        for n in list(ct.nodes): ct.nodes.remove(n)
        comp = ct.nodes.new('CompositorNodeComposite'); build_grade(ct, comp)
    scene.render.use_compositing = True
except Exception as ex: print('compositor skipped', ex)

# ---------------------------------------------------------------- render the hero still
scene.render.image_settings.file_format = 'PNG'; scene.render.filepath = os.path.join(RENDER, 'hero.png')
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'desk_scene.blend'))
print('DONE', MODELS, RENDER)
