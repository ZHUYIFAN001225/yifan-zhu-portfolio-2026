// Shared rules for this local prototype. Coordinates are illustrative area centres.
(() => {
 'use strict';
 const areas=[
  {id:'centre',label:'City Centre',lat:55.861,lng:-4.252,postcodes:['G1','G2']},
  {id:'west',label:'West End',lat:55.875,lng:-4.293,postcodes:['G12','G20']},
  {id:'finnieston',label:'Finnieston',lat:55.864,lng:-4.282,postcodes:['G3']},
  {id:'partick',label:'Partick',lat:55.872,lng:-4.307,postcodes:['G11','G14']},
  {id:'merchant',label:'Merchant City',lat:55.858,lng:-4.243,postcodes:['G4','G40']},
  {id:'south',label:'Southside',lat:55.833,lng:-4.277,postcodes:['G5','G41','G42','G43']},
  {id:'east',label:'East End',lat:55.858,lng:-4.205,postcodes:['G31','G32']},
  {id:'southwest',label:'Govan',lat:55.858,lng:-4.312,postcodes:['G51','G52']}
 ];
 const radiusOptions=[1,3,5,10], kmPerMile=1.609344;
 const demoNow='2026-10-07T08:00:00+01:00';
 function londonDate(now=demoNow){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now)),v=Object.fromEntries(parts.map(p=>[p.type,p.value]));return `${v.year}-${v.month}-${v.day}`;}
 function londonTimestamp(date,time){const guess=Date.parse(date+'T'+time+':00Z');if(!Number.isFinite(guess))return NaN;const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(guess)),v=Object.fromEntries(parts.map(p=>[p.type,p.value]));const shown=Date.UTC(Number(v.year),Number(v.month)-1,Number(v.day),Number(v.hour),Number(v.minute));return guess-(shown-guess);}
 function location(area=areas[0],radiusMiles=3){return {areaId:area.id,label:area.label,lat:area.lat,lng:area.lng,source:'area',radiusMiles:radiusOptions.includes(Number(radiusMiles))?Number(radiusMiles):3};}
 function resolvePlace(text){const input=String(text).trim().toUpperCase().replace(/\s+/g,' ');if(input==='GLASGOW')return areas[0];const district=input.match(/^(G\d{1,2})(?:\s?\d[A-Z]{2})?$/)?.[1];return areas.find(a=>a.postcodes.includes(district)||a.label.toUpperCase()===input);}
 function distanceMiles(a,b){if(!a||!b||![a.lat,a.lng,b.lat,b.lng].every(Number.isFinite))return Infinity;const rad=x=>x*Math.PI/180,dl=rad(b.lat-a.lat),dn=rad(b.lng-a.lng),h=Math.sin(dl/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dn/2)**2;return 3958.7613*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));}
 function withinPilot(point){return point&&Number.isFinite(point.lat)&&Number.isFinite(point.lng)&&point.lat>=55.80&&point.lat<=55.92&&point.lng>=-4.40&&point.lng<=-4.10;}
 function nearby(p,place){return p.city==='Glasgow'&&p.verified&&p.bookingEnabled!==false&&distanceMiles(place,p.geo)<=place.radiusMiles;}
 function overlap(start,duration,otherStart,otherDuration,buffer=0){return start<otherStart+otherDuration+buffer&&start+duration+buffer>otherStart;}
 function minutes(time){return /^\d{2}:\d{2}$/.test(time)?Number(time.slice(0,2))*60+Number(time.slice(3)):NaN;}
 function clientConflict(records,id,date,time,duration,except){const start=minutes(time);return records.some(b=>b.id!==except&&b.date===date&&['pending','confirmed','rescheduled','completed'].includes(b.status)&&overlap(start,duration,minutes(b.time),b.duration,b.proId===id?0:30));}
 function serviceIndex(ref,menus,work){if(!menus.length)return -1;if(ref.sourceType==='creator'&&ref.pro&&ref.pro===work?.pro){const bound=ref.serviceIndex;if(Number.isInteger(bound)&&bound>=0&&bound<menus.length&&menus[bound])return bound;const exact=menus.findIndex(s=>s.price===ref.price&&s.duration===ref.duration);if(exact>=0)return exact;}const pattern=ref.technique==='Colour'||ref.tags?.some(t=>/balayage|copper|colour/i.test(t))?/colour|color|染|挑染/i:ref.technique==='Perm'?/perm|烫/i:ref.technique==='Chrome'||ref.tags?.includes('Chrome')?/chrome|mirror|镜面|光泽/i:ref.category==='Nails'?/french|法式|凝胶|gel/i:ref.category==='Makeup'?/makeup|glam|妆/i:['Outfit','Accessories','Styling'].includes(ref.category)?/styling|造型|搭配/i:/cut|style|剪/i;const matched=menus.findIndex(s=>pattern.test(s.name));if(matched>=0)return matched;const exact=menus.findIndex(s=>s.price===work?.price&&s.duration===work?.duration);return exact>=0?exact:0;}
 function cancellation(order,now=demoNow){const hours=(londonTimestamp(order.date,order.time)-Date.parse(now))/3600000,paid=order.deposit||0;const early=order.status==='pending'||hours>=(order.cancellationHours??24),retained=early?0:Math.min(10,paid);return {early,refund:paid-retained,retained};}
 function analysis(list){const colours=list.map(x=>x.look.colour).filter(c=>c&&c!=='Neutral'),tags=list.flatMap(x=>x.look.tags||[]),neutral=colours.every(c=>/black|white|brown|nude|灰|黑|白|棕/i.test(c));return [neutral?'Neutral palette':'Mixed colour palette',`${list.length} / 7 elements selected`,tags.includes('Silver')?'Silver accents':tags.includes('Gold')?'Gold accents':'Compare textures and proportions'];}
 window.LOOK_LOGIC={areas,radiusOptions,kmPerMile,demoNow,londonDate,londonTimestamp,location,resolvePlace,distanceMiles,withinPilot,nearby,overlap,minutes,clientConflict,serviceIndex,cancellation,analysis};
 for(const p of window.LOOK_DATA.professionals){const area=areas.find(a=>a.label===p.area)||areas[0];p.city='Glasgow';p.geo={lat:area.lat,lng:area.lng};p.bookingEnabled=true;p.cancellationHours=24;}
})();
