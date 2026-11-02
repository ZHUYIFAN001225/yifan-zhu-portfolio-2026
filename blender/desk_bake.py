# Glasgow Salon Booking — bake the Cycles lighting of desk_scene.blend into textures (day + night), export baked glbs.
# Run inside Blender after desk_scene.py (or on its saved .blend): the website shows these textures unlit, so what the
# browser draws is what Cycles computed — soft shadows, bounce, dapple, lamp pool.
import bpy, os, math, time
OUT = r"D:\我的作品集\assets\v3\desk"; MODELS = os.path.join(OUT, "models"); BAKED = os.path.join(OUT, "baked"); os.makedirs(BAKED, exist_ok=True)
LOG = open(os.path.join(BAKED, 'bake_log.txt'), 'w', encoding='utf-8')
def log(*a):
    LOG.write(' '.join(str(x) for x in a) + '\n'); LOG.flush(); print(*a)
t0 = time.time()
# (runs on the scene already open in Blender — reopening the file from the console kills the running script)
scene = bpy.context.scene; vl = bpy.context.view_layer
scene.render.engine = 'CYCLES'; scene.cycles.samples = 96; scene.cycles.use_denoising = True
try: scene.cycles.device = 'GPU'
except Exception: pass
scene.render.use_compositing = False

EXPOSURE = 2 ** -1.15 * 0.4    # the hero render's exposure, pre-applied to the lights (×0.4 so sunlit paper stays below 1 in 8 bits;
                               # the website renders the bake at exposure 2.5 to put it back)
SIZES = {'desk': 2048, 'mat': 2048, 'notebook': 2048, 'scissors': 1024, 'pencil': 1024, 'pen': 1024, 'comb': 1024, 'eraser': 512, 'clips': 512, 'binder': 512}
O = bpy.data.objects
# a tighter still life, so one closer shot holds every prop (Blender coords; the phone stays at (.13,-.04))
MOVE = {'notebook': (-.11, -.02, None), 'pencil': (.06, .13, None), 'pen': (-.13, .16, None), 'eraser': (-.29, .10, None),
        'comb': (-.06, -.215, None), 'scissors': (.245, -.115, 110), 'binder': (.30, .12, -35)}
for k, (x, y, rz) in MOVE.items():
    O[k].location.x = x; O[k].location.y = y
    if rz is not None: O[k].rotation_euler.z = math.radians(rz)
O['scissors'].scale = (1.0, 1.0, 1.0)
for k, (x, y) in {'clip_a': (-.26, -.16), 'clip_b': (-.24, -.20), 'clip_c': (-.27, -.24)}.items(): O[k].location.x = x; O[k].location.y = y
O['mat'].location.x = .05; O['mat'].location.y = -.045; O['mat'].scale = (.5 / .6, .36 / .42, 1)
bpy.context.view_layer.update()
def kids(name): return [c for c in O[name].children_recursive if c.type in ('MESH', 'CURVE')]
GROUPS = {'desk': [O['desk']], 'mat': [O['mat']], 'notebook': kids('notebook'), 'pencil': kids('pencil'), 'pen': kids('pen'), 'eraser': kids('eraser'),
          'comb': kids('comb'), 'scissors': kids('scissors'), 'clips': [O['clip_a'], O['clip_b'], O['clip_c']], 'binder': kids('binder')}
# the phone is live in the browser: keep it (and its shadow) out of the bake
for c in [O['phone']] + list(O['phone'].children_recursive): c.hide_render = True
for o in (O['tree_gobo'], O['sun_sheet']): o.hide_render = False

def select(objs):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    vl.objects.active = objs[0]

# ---------------------------------------------------------------- prepare: real meshes, own materials, a second UV map
for g, objs in GROUPS.items():
    if all(o.type == 'MESH' and 'bake' in o.data.uv_layers for o in objs): log('already prepared', g); continue
    select(objs); bpy.ops.object.convert(target='MESH')
    for o in objs:
        for s in o.material_slots:
            if s.material: s.material = s.material.copy(); s.material.name = f'{s.material.name}__{o.name}'
        me = o.data
        if not me.uv_layers: me.uv_layers.new(name='UVMap')
        base = me.uv_layers[0]; base.active_render = True
        bake = me.uv_layers.new(name='bake'); me.uv_layers.active = bake
        # every texture lookup in the original materials must keep using the base UVs, whatever is active
        for s in o.material_slots:
            nt = s.material.node_tree if s.material else None
            if not nt: continue
            uvn = nt.nodes.new('ShaderNodeUVMap'); uvn.uv_map = base.name
            for n in list(nt.nodes):
                if n.type == 'TEX_COORD':
                    for lk in list(nt.links):
                        if lk.from_node == n and lk.from_socket.name == 'UV': nt.links.new(uvn.outputs['UV'], lk.to_socket)
                elif n.type == 'TEX_IMAGE' and not n.inputs['Vector'].is_linked: nt.links.new(uvn.outputs['UV'], n.inputs['Vector'])
    # unwrap each object on its own, then give each its own cell of the group's square (packing across objects is not
    # reliable from a script, and overlapping islands would bake over each other)
    n = len(objs); cols = math.ceil(math.sqrt(n)); rows = math.ceil(n / cols); pad = .012
    for i, o in enumerate(objs):
        select([o]); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02); bpy.ops.object.mode_set(mode='OBJECT')
        cx, cy = (i % cols) / cols, (i // cols) / rows; cw, chh = 1 / cols, 1 / rows
        for d in o.data.uv_layers['bake'].data:
            u, v = d.uv; d.uv = (cx + pad * cw + u * cw * (1 - 2 * pad), cy + pad * chh + v * chh * (1 - 2 * pad))
    log('prepared', g, len(objs), 'objects', f'{time.time()-t0:.0f}s')

# the right page is drawn by the website (handwriting); bake it as plain white so its texture is pure light
for sl in [x for p in ('nb_page_l', 'nb_page_r') for x in O[p].material_slots]:
    nt = sl.material.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    for lk in list(nt.links):
        if lk.to_node == b and lk.to_socket.name == 'Base Color': nt.links.remove(lk)
    b.inputs['Base Color'].default_value = (1, 1, 1, 1)
# ---------------------------------------------------------------- lights: day and night, with the exposure pre-applied
L = bpy.data.lights
BG = next(n for n in scene.world.node_tree.nodes if n.type == 'BACKGROUND')
day = {'sun': L['sun'].energy * EXPOSURE, 'fill': L['fill'].energy * EXPOSURE, 'world': BG.inputs['Strength'].default_value * EXPOSURE}
lamp = L.get('lamp') or L.new('lamp', 'POINT'); lamp.energy = 0; lamp.color = (1.0, .74, .46); lamp.shadow_soft_size = .06
lamp_o = O.get('lamp') or O.new('lamp', lamp)
if lamp_o.name not in bpy.context.collection.objects: bpy.context.collection.objects.link(lamp_o)
lamp_o.location = (-.46, .30, .58)
# the lampshade: a cone that keeps the light in a pool on the notebook side
GOBO0 = (O['tree_gobo'].location.copy(), O['tree_gobo'].rotation_euler.z)
def set_lights(tag):
    """day: exactly the approved look — sun through the leafy gobo, the sheet shading the right half, the room.
    day2: the same with the leaves moved a touch (as by a breeze); the website drifts between the two.
    night: the desk lamp, a little room, no sun, nothing hanging between the lamp and the desk"""
    bgs = BG.inputs['Strength']; g = O['tree_gobo']
    g.location = GOBO0[0].copy(); g.rotation_euler.z = GOBO0[1]
    if tag == 'day2': g.location.x += .014; g.location.y += .011; g.rotation_euler.z += math.radians(.9)
    g.hide_render = tag == 'night'; O['sun_sheet'].hide_render = tag == 'night'
    L['sun'].energy = 0 if tag == 'night' else day['sun']
    L['fill'].energy = day['fill'] * .14 if tag == 'night' else day['fill']
    bgs.default_value = day['world'] * .3 if tag == 'night' else day['world']
    lamp.energy = 70 * EXPOSURE if tag == 'night' else 0
lamp_o.location = (-.40, .22, .52); lamp.shadow_soft_size = .08

# ---------------------------------------------------------------- bake
scene.render.bake.use_pass_direct = True; scene.render.bake.use_pass_indirect = True
for k in ('use_pass_diffuse', 'use_pass_glossy', 'use_pass_emit'):
    try: setattr(scene.render.bake, k, True)
    except Exception: pass
try: scene.render.bake.use_pass_transmission = True
except Exception: pass
scene.render.bake.margin = 4; scene.render.bake.use_clear = True
IMG = {}
TAGS = globals().get('BAKE_TAGS', ('day', 'day2', 'night'))
def bake_group(g, objs, tag):
    S = SIZES[g]; name = f'bake_{g}_{tag}'
    img = bpy.data.images.new(name, S, S, alpha=False); img.colorspace_settings.name = 'sRGB'
    for o in objs:
        for s in o.material_slots:
            nt = s.material.node_tree
            node = next((n for n in nt.nodes if n.name == 'BAKE_TARGET'), None) or nt.nodes.new('ShaderNodeTexImage'); node.name = 'BAKE_TARGET'; node.image = img
            uvn = nt.nodes.new('ShaderNodeUVMap'); uvn.uv_map = 'bake'; nt.links.new(uvn.outputs['UV'], node.inputs['Vector'])
            nt.nodes.active = node
    select(objs)
    t = time.time()
    bpy.ops.object.bake(type='COMBINED', pass_filter={'DIRECT', 'INDIRECT', 'DIFFUSE', 'GLOSSY', 'EMIT'}, margin=4, use_clear=True, use_selected_to_active=False)
    img.filepath_raw = os.path.join(BAKED, name + '.png'); img.file_format = 'PNG'; img.save()
    IMG[(g, tag)] = img; log('baked', name, f'{time.time()-t:.0f}s')

for tag in TAGS:
    set_lights(tag)
    for g, objs in GROUPS.items(): bake_group(g, objs, tag)

# ---------------------------------------------------------------- export: each group with its day bake as the base colour
for mod in ('io_scene_gltf2', 'bl_ext.blender_org.io_scene_gltf2'):
    try: bpy.ops.preferences.addon_enable(module=mod); break
    except Exception: continue
for g, objs in GROUPS.items():
    for o in objs:
        for s in o.material_slots:
            m = s.material; nt = m.node_tree
            for n in list(nt.nodes): nt.nodes.remove(n)
            out = nt.nodes.new('ShaderNodeOutputMaterial'); bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
            bsdf.inputs['Roughness'].default_value = 1; bsdf.inputs['Metallic'].default_value = 0
            tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = IMG[(g, 'day')]; uvn = nt.nodes.new('ShaderNodeUVMap'); uvn.uv_map = 'bake'
            nt.links.new(uvn.outputs['UV'], tex.inputs['Vector']); nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color']); nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    parent = objs[0].parent; sel = [parent] if parent else objs
    select(sel)
    for o in sel:
        for c in o.children_recursive: c.select_set(True)
    kw = dict(filepath=os.path.join(BAKED, g + '.glb'), export_format='GLB', use_selection=True, export_apply=True, export_yup=True, export_materials='EXPORT')
    try: bpy.ops.export_scene.gltf(**kw, export_image_format='JPEG', export_jpeg_quality=88)
    except TypeError: bpy.ops.export_scene.gltf(**kw)
    except Exception as e: log('export failed', g, e)
    log('exported', g)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'desk_baked.blend'))
log('done', f'{time.time()-t0:.0f}s'); LOG.close()
