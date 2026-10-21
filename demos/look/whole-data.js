(() => {
  const d=window.LOOK_DATA;
  d.categoryNames.Outfit='穿搭';d.categoryNames.Accessories='配饰';
  d.categories.push('Outfit','Accessories');
  d.professionals.push(
    {id:'p9',name:'Amy Chen',role:'Hair Stylist',categories:['Hair'],photo:'hair-3',salon:'Amy Studio',address:'41 Woodlands Road',area:'West End',distance:1.9,rating:'4.9',reviews:126,bio:'喜欢柔和层次与自然纹理。先理解你想表达的感觉，再一起确认可以实现的方案。',services:[{name:'Layered Cut & Style',price:55,duration:60,description:'层次修剪与日常造型'},{name:'Colour & Style',price:85,duration:120}]},
    {id:'p10',name:'Noah Fraser',role:'Barber',categories:['Hair'],photo:'hair-4',salon:'Noah Grooming',address:'8 Argyle Street',area:'Finnieston',distance:2.3,rating:'4.8',reviews:74,bio:'注重轮廓、纹理和日常打理，也提供个人造型建议。',services:[{name:'Cut & Texture',price:40,duration:45},{name:'Cut & Grooming',price:55,duration:75}]}
  );
  const samples=[
    ['h8','Hair','hair-7','Soft Layered Wolf Cut','p9',55,60,['Wolf Cut','Layered','Soft','Dark Brown','Medium Length']],
    ['h9','Hair','hair-3','Butterfly Layers','p9',55,60,['Butterfly','Layered','Soft','Brown']],
    ['h10','Hair','hair-5','Copper Balayage','p9',85,120,['Balayage','Copper','Layered']],
    ['h11','Hair','hair-6','Curtain Bangs','p10',40,45,['Curtain Bangs','Layered','Dark Brown']],
    ['h12','Hair','hair-4','Clean Textured Cut','p10',40,45,['Texture','Clean','Short']],
    ['h13','Hair','hair-3','Korean Soft Perm','p10',55,75,['Korean','Perm','Soft']],
    ['t1','Outfit','styling-2','干净白衬衫','p6',49,0,['Clean','White','Minimal','Neutral']],
    ['t2','Outfit','styling-1','黑色日常上衣','p6',35,0,['Dark Minimal','Black','Minimal']],
    ['t3','Outfit','styling-3','轻松针织上衣','p6',59,0,['Korean Casual','Soft','Neutral']],
    ['bt1','Outfit','styling-2','利落黑色长裤','p6',65,0,['Black','Minimal','Office']],
    ['bt2','Outfit','styling-3','宽松日常裤装','p6',55,0,['Korean Casual','Oversized','Neutral']],
    ['sh1','Outfit','styling-2','黑色简约鞋履','p6',79,0,['Black','Minimal','Structured']],
    ['sh2','Outfit','styling-4','轻盈活动鞋履','p6',89,0,['Soft','Event','Neutral']],
    ['ac1','Accessories','styling-1','银色细节 · 日常配饰','p6',28,0,['Silver','Minimal','Clean']],
    ['ac2','Accessories','styling-4','柔和金色配饰','p6',35,0,['Gold','Soft','Event']],
    ['in1','Hair','hair-6','Soft layered hairstyle',null,0,60,['Layered','Soft','Dark Brown']],
    ['in2','Makeup','makeup-2','Cool Tone Soft Glam',null,0,60,['Cool Tone','Soft Glam','Clean']],
    ['co1','Nails','nails-5','我的日常法式','p2',38,60,['French','Nude','Minimal']]
  ];
  for(const [id,category,asset,title,pro,price,duration,tags] of samples)d.looks.push({id,category,photo:'assets/'+asset+'.jpg',title,pro,price,duration,tags,ratio:1.35,description:'演示造型参考，可与专业人士沟通细节。',sourceType:id.startsWith('in')?'inspiration':id==='co1'?'community':category==='Outfit'||category==='Accessories'?'inspiration':'creator',username:id==='co1'?'ella.styles':undefined,taggedPro:id==='co1'?'p2':undefined,slot:{t1:'Top',t2:'Top',t3:'Top',bt1:'Bottom',bt2:'Bottom',sh1:'Shoes',sh2:'Shoes',ac1:'Accessories',ac2:'Accessories'}[id]});
  for(const [i,p] of d.professionals.entries()){p.area=p.area||['City Centre','West End','Merchant City','Park','Partick','City Centre','Finnieston','West End'][i%8];p.verified=true;p.completedCount=64+i*19;p.homeBased=p.id==='p8';}
  for(const l of d.looks){l.sourceType=l.sourceType||'creator';l.colour=l.tags.find(t=>/Brown|Black|White|Copper|Silver|Gold|粉|棕|色/.test(t))||'Neutral';l.technique=l.category==='Nails'?(l.tags.includes('Chrome')?'Chrome':'French'):l.category==='Hair'?(l.tags.includes('Balayage')?'Colour':l.tags.includes('Perm')?'Perm':'Haircut'):'Styling';}
})();
