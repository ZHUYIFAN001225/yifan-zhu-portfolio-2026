window.LOOK_DATA = (() => {
  const categories = ['For you','Hair','Nails','Makeup','Skin','Lashes','Brows','Styling','Beauty'];
  const categoryNames = {Hair:'发型',Nails:'美甲',Makeup:'妆容',Skin:'皮肤护理',Lashes:'睫毛',Brows:'眉毛',Styling:'个人造型',Beauty:'综合美容'};
  const professionals = [
    {id:'p1',name:'Alex Morgan',role:'Hair Stylist',categories:['Hair'],photo:'hair-2',salon:'Studio Common',address:'24 West George Street',distance:1.2,rating:'4.9',reviews:86,bio:'偏爱自然的层次、柔和的线条和好打理的发型。每一次改变，都从了解你的生活方式开始。',services:[{name:'剪发与日常造型',price:45,duration:60},{name:'Balayage 染发',price:95,duration:150},{name:'剪发 + 染发',price:125,duration:180}]},
    {id:'p2',name:'Mia Chen',role:'Nail Artist',categories:['Nails'],photo:'makeup-1',salon:'Mia Nail Atelier',address:'18 Byres Road',distance:0.8,rating:'4.9',reviews:124,bio:'从精致法式到镜面光泽，为每一双手找到恰到好处的细节。喜欢干净线条，也喜欢一点小惊喜。',services:[{name:'法式凝胶美甲',price:38,duration:60},{name:'Chrome 镜面美甲',price:48,duration:75},{name:'设计款美甲',price:58,duration:90}]},
    {id:'p3',name:'Sophie Wilson',role:'Makeup Artist',categories:['Makeup','Styling'],photo:'makeup-2',salon:'Sophie Beauty Studio',address:'36 Bath Street',distance:2.1,rating:'4.8',reviews:63,bio:'自然光泽与柔和妆感，让你在重要时刻依然像自己。提供日常、活动与新娘妆容服务。',services:[{name:'自然日常妆',price:55,duration:60},{name:'活动妆容 Soft Glam',price:75,duration:90},{name:'新娘妆容咨询',price:110,duration:120}]},
    {id:'p4',name:'Emma Reid',role:'Skin Specialist',categories:['Skin','Beauty'],photo:'makeup-4',salon:'The Quiet Room',address:'12 Park Terrace',distance:1.6,rating:'4.9',reviews:72,bio:'在安静的空间里，给肌肤一点休息的时间。根据你的肤质与日常习惯，制定适合的护理方案。',services:[{name:'补水面部护理',price:65,duration:60},{name:'深层清洁护理',price:70,duration:75},{name:'肌肤咨询',price:25,duration:30}]},
    {id:'p5',name:'Isla Brown',role:'Lash & Brow Artist',categories:['Lashes','Brows'],photo:'lashes-1',salon:'Arch & Lash',address:'9 Great Western Road',distance:0.6,rating:'4.9',reviews:95,bio:'用细腻的眉形与自然卷翘，衬托你原本的五官。专注睫毛提升与眉毛塑形。',services:[{name:'自然睫毛提升',price:42,duration:60},{name:'眉毛塑形与染色',price:28,duration:40},{name:'眉毛定型 Brow Lamination',price:38,duration:50}]},
    {id:'p6',name:'Grace Lee',role:'Personal Stylist',categories:['Styling','Makeup'],photo:'styling-1',salon:'Grace Studio',address:'45 Buchanan Street',distance:2.7,rating:'4.8',reviews:41,bio:'让衣橱更简单，让表达更清晰。以日常需求为起点，为你找到舒适又有个人特色的搭配。',services:[{name:'个人造型咨询',price:80,duration:90},{name:'衣橱搭配规划',price:120,duration:120},{name:'活动整体造型',price:150,duration:150}]},
    {id:'p7',name:'Oliver James',role:'Colour Specialist',categories:['Hair'],photo:'hair-4',salon:'Form Hair Studio',address:'72 Argyle Street',distance:3.4,rating:'4.9',reviews:108,bio:'擅长把颜色融入发型，用自然渐变与柔和挑染，创造随光线变化的层次感。',services:[{name:'短发修剪',price:40,duration:45},{name:'自然挑染',price:85,duration:120},{name:'全头染色',price:75,duration:120}]},
    {id:'p8',name:'Yuna Park',role:'Nail Artist',categories:['Nails','Brows'],photo:'makeup-4',salon:'Yuna Beauty Room',address:'15 Sauchiehall Street',distance:1.8,rating:'4.9',reviews:57,bio:'用透明感、细节和微妙的色彩，让日常美甲多一点温柔。专注极简与韩系设计。',services:[{name:'透明感凝胶美甲',price:35,duration:60},{name:'精致法式美甲',price:40,duration:60},{name:'镜面光泽美甲',price:45,duration:75}]}
  ];
  const rows = [
    ['h1','Hair','hair-2','法式松弛感短发','p1',45,60,['短发','Bob','自然','层次','French','Clean'],1.36],
    ['n1','Nails','nails-1','银色镜面 · 极简法式','p2',48,75,['Chrome','法式','极简','银色','Minimal','French'],1.12],
    ['m1','Makeup','makeup-1','像天生好气色的自然妆','p3',55,60,['自然','日常','Natural','Soft Glam','Clean'],1.33],
    ['h2','Hair','hair-1','奶茶色渐变 Bob','p7',85,120,['短发','Bob','Balayage','奶茶色','层次','日系'],1.54],
    ['n2','Nails','nails-2','珍珠光泽 · 温柔法式','p8',40,60,['珍珠','法式','自然','Chrome','French','Soft'],1.23],
    ['s1','Styling','styling-2','白衬衫的日常新解','p6',80,90,['极简','通勤','Minimal','自然','Clean'],1.48],
    ['h3','Hair','hair-3','轻盈层次 · 暖棕挑染','p1',95,150,['短发','Bob','自然','Balayage','暖棕','层次'],1.26],
    ['sk1','Skin','skin-1','给肌肤一小时的休息','p4',65,60,['补水','Facial','Hydration','自然','护理'],1.06],
    ['n3','Nails','nails-3','金色边缘的小心思','p2',58,90,['金色','Chrome','法式','French','Design'],1.37],
    ['l1','Lashes','lashes-1','自然卷翘 · 素颜也有神','p5',42,60,['自然','Lash Lift','Natural','睫毛','卷翘'],1.17],
    ['m2','Makeup','makeup-2','清透水光 · Soft Glam','p3',75,90,['水光','自然','Soft Glam','Clean','活动'],1.46],
    ['h4','Hair','hair-4','利落线条 · 渐变短发','p7',75,120,['短发','Bob','Balayage','极简','Clean','直发'],1.29],
    ['n4','Nails','nails-4','粉色与银色的平衡','p8',45,75,['粉色','银色','Chrome','法式','Minimal'],1.31],
    ['s2','Styling','styling-1','黑白之间 · 简单刚好','p6',80,90,['极简','黑白','Minimal','Clean','通勤'],1.61],
    ['b1','Brows','brows-2','原生感眉形 · 轻盈有序','p5',38,50,['眉毛','Brow Lamination','自然','Natural','Clean'],1.03],
    ['h5','Hair','hair-5','暖调渐变 · 柔和轮廓','p1',95,150,['短发','Bob','Balayage','自然','暖棕','日系'],1.43],
    ['sk2','Skin','skin-2','深层清洁 · 慢下来','p4',70,75,['清洁','Facial','护理','Clean','补水'],1.15],
    ['n5','Nails','nails-5','微光法式 · 日常精致','p2',38,60,['粉色','法式','French','自然','Chrome'],1.24],
    ['m3','Makeup','makeup-4','干净底妆 · 少即是多','p3',55,60,['自然','Natural','Clean','极简','日常'],1.28],
    ['h6','Hair','hair-6','面部轮廓里的温柔线条','p7',40,45,['短发','Bob','层次','自然','日系','直发'],1.49],
    ['l2','Lashes','lashes-2','精致睫毛与轻盈眉形','p5',42,60,['睫毛','Lash Lift','自然','Natural','Brows'],.94],
    ['n6','Nails','nails-6','裸粉色 · 透亮镜面','p8',45,75,['粉色','Chrome','自然','Soft','French'],1.31],
    ['s3','Styling','styling-3','轻松出门 · 通勤胶囊','p6',120,120,['通勤','衣橱','Capsule','极简','Minimal'],1.51],
    ['h7','Hair','hair-7','空气感纹理 · 柔和波浪','p1',45,60,['短发','Bob','波浪','自然','层次','日系'],1.31],
    ['sk3','Skin','skin-3','柔和护理 · 找回水润','p4',65,60,['补水','Hydration','Facial','护理','Soft'],1.05],
    ['l3','Lashes','lashes-3','轻柔卷翘 · 睫毛提升','p5',42,60,['睫毛','Lash Lift','自然','Natural','卷翘'],1.36],
    ['s4','Styling','styling-4','为重要时刻穿得像自己','p6',150,150,['活动','极简','黑白','Minimal','Event'],1.41],
    ['b2','Brows','lashes-2','眉毛定型 · 自然生长感','p5',28,40,['眉毛','Brow','自然','Natural','Clean'],1.16],
    ['be1','Beauty','skin-3','午后焕新 · 美容护理','p4',65,60,['护理','放松','自然','Beauty','Facial'],1.26]
  ];
  const descriptions = {
    Hair:'柔和的轮廓与自然的层次，让发型在日常里也轻松好看。预约前可以与造型师确认发质、长度和颜色方案。',
    Nails:'干净的形状、细腻的光泽和刚刚好的细节。可以根据你的甲型、长度和日常习惯调整设计。',
    Makeup:'保留个人特色，用细腻妆感衬托气色。妆容的色调和浓度可以根据肤色、场合与喜好沟通调整。',
    Skin:'给自己留出一段安静的护理时间。专业人士会先了解肌肤状态，再与你确认适合的护理内容。',
    Lashes:'自然卷翘，让眼神更明亮。服务前会确认睫毛状况和你偏好的卷翘程度。',
    Brows:'顺着原生眉毛的方向整理线条，保留自然质感。眉形与颜色会根据五官和喜好确认。',
    Styling:'从日常生活和个人喜好出发，探索舒服又适合自己的整体造型。',
    Beauty:'一段属于自己的护理时间。与专业人士一起选择适合你的美容服务。'
  };
  const looks = rows.map(([id,category,photo,title,pro,price,duration,tags,ratio],index)=>({id,category,photo:'assets/'+photo+'.jpg',title,pro,price,duration,tags,ratio,description:descriptions[category],today:index%3===0,source:photo}));
  return {categories,categoryNames,professionals,looks};
})();
