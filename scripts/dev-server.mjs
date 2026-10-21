import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { renderPortfolio } from './render-portfolio.mjs';

await renderPortfolio();
const root=process.cwd(),port=Number(process.env.PORT||4176);
const types={'.pdf':'application/pdf','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.json':'application/json; charset=utf-8','.ico':'image/x-icon','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)&&!req.url.startsWith('/__demo/booking/api/')){res.writeHead(405);return res.end();}
    const url=new URL(req.url,'http://localhost');
    // Local demos are served through this origin (/__demo/...), so the case pages can
    // embed them even in browsers that block other localhost ports inside frames.
    const upstream={beauty:'http://127.0.0.1:4181',booking:'http://127.0.0.1:4173'};
    const localDemos={beauty:'/__demo/beauty/',booking:'/__demo/booking/',bookingAdmin:'/__demo/booking/admin.html'};
    if(url.pathname==='/__local-demos.json'){
      const available={};
      await Promise.all(Object.entries({beauty:'beauty',booking:'booking',bookingAdmin:'booking'}).map(async([key,app])=>{try{const check=await fetch(upstream[app]+'/',{signal:AbortSignal.timeout(700)});if(check.ok)available[key]=localDemos[key];}catch{}}));
      res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify(available));
    }
    const demo=/^\/__demo\/(beauty|booking)(\/.*)?$/.exec(url.pathname);
    if(demo){
      if(!demo[2]){res.writeHead(302,{Location:`/__demo/${demo[1]}/`});return res.end();}
      const prefix=`/__demo/${demo[1]}`,target=upstream[demo[1]];
      const headers={...req.headers,host:new URL(target).host};delete headers.origin;delete headers.referer;delete headers['accept-encoding'];
      const body=['GET','HEAD'].includes(req.method)?undefined:await new Promise(r=>{const c=[];req.on('data',d=>c.push(d));req.on('end',()=>r(Buffer.concat(c)));});
      try{
        const up=await fetch(target+demo[2]+url.search,{method:req.method,headers,body,redirect:'manual'});
        const type=up.headers.get('content-type')||'';let out=Buffer.from(await up.arrayBuffer());
        // The booking prototype uses root-relative URLs; keep them inside the demo prefix.
        if(demo[1]==='booking'&&/text\/html|javascript/.test(type))out=Buffer.from(out.toString('utf8').replace(/(["'`])\/(api\/|style\.css|client\.js|admin\.html|admin-client\.js|admin-legacy\.html)/g,`$1${prefix}/$2`));
        // Inside a frame, the booking prototype's refresh-on-focus re-renders during the first tap.
        // Ignore a focus that comes straight from a tap; the fix belongs in the prototype itself.
        if(demo[1]==='booking'&&/text\/html/.test(type))out=Buffer.from(out.toString('utf8').replace('<head>','<head><script>(()=>{let tap=0;document.addEventListener("pointerdown",()=>{tap=Date.now()},true);const add=window.addEventListener;window.addEventListener=function(type,fn,opts){if(this===window&&type==="focus"){return add.call(this,type,function(e){if(Date.now()-tap<1000)return;return fn.call(this,e)},opts)}return add.call(this,type,fn,opts)}})();</script>'));
        res.writeHead(up.status,{'Content-Type':type||'application/octet-stream','Cache-Control':'no-store'});return res.end(req.method==='HEAD'?undefined:out);
      }catch{res.writeHead(502,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Demo service is not running. Start it with npm run demos.');}
    }
    const name=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
    // Preview only public pages/assets, never Git data, backups or local research.
    if(name.split(/[\\/]/).some(p=>p.startsWith('.')||p==='..')||name.includes('\\')||name==='package.json'||name==='vercel.json'||name==='netlify.toml'){
      res.writeHead(404);return res.end('Not found');
    }
    let file=path.resolve(root,name);
    if(!file.startsWith(root+path.sep)){res.writeHead(404);return res.end('Not found');}
    if(!path.extname(file)&&fs.existsSync(file+'.html'))file+='.html';
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    const stat=await fs.promises.stat(file);
    if(!stat.isFile()||!types[path.extname(file)]){res.writeHead(404);return res.end('Not found');}
    const headers={'Content-Type':types[path.extname(file)],'Accept-Ranges':'bytes','Cache-Control':'no-cache'};
    let start=0,end=stat.size-1,status=200;
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}
      if(!match[1])start=Math.max(0,stat.size-Number(match[2]));
      else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
      if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}
      status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
    }
    headers['Content-Length']=end-start+1;
    res.writeHead(status,headers);
    if(req.method==='HEAD')return res.end();
    const stream=fs.createReadStream(file,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
  }catch{if(!res.headersSent)res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Portfolio V3: http://127.0.0.1:${port} (local only)`)).on('error',error=>{
  console.error(error.code==='EADDRINUSE'?`Port ${port} is already in use. The preview may already be running at http://127.0.0.1:${port}.`:error.message);
  process.exitCode=1;
});
