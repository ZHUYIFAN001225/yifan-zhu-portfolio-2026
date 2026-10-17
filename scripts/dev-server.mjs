import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { renderPortfolio } from './render-portfolio.mjs';

await renderPortfolio();
const root=process.cwd(),port=Number(process.env.PORT||4176);
const types={'.pdf':'application/pdf','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.json':'application/json; charset=utf-8','.ico':'image/x-icon','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
    const url=new URL(req.url,'http://localhost');
    const localDemos={beauty:'http://127.0.0.1:4181/',booking:'http://127.0.0.1:4173/',bookingAdmin:'http://127.0.0.1:4173/admin.html'};
    if(url.pathname==='/__local-demos.json'){
      const available={};
      await Promise.all(Object.entries(localDemos).map(async([key,href])=>{try{const check=await fetch(href,{signal:AbortSignal.timeout(700)});if(check.ok)available[key]='/__demo/'+key;}catch{}}));
      res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify(available));
    }
    if(url.pathname.startsWith('/__demo/')){
      const href=localDemos[url.pathname.slice(8)];if(!href){res.writeHead(404);return res.end();}
      res.writeHead(302,{Location:href,'Cache-Control':'no-store'});return res.end();
    }
    const name=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
    // Preview only public pages/assets, never Git data, backups or local research.
    if(name.split(/[\\/]/).some(p=>p.startsWith('.')||p==='..')||name.includes('\\')||name==='package.json'||name==='vercel.json'||name==='netlify.toml'){
      res.writeHead(404);return res.end('Not found');
    }
    let file=path.resolve(root,name);
    if(!file.startsWith(root+path.sep)){res.writeHead(404);return res.end('Not found');}
    if(!path.extname(file)&&fs.existsSync(file+'.html'))file+='.html';
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
