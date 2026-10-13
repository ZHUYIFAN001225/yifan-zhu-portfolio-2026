// Local-only review harness. Reads the two existing projects without modifying them.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
const config=JSON.parse(fs.readFileSync('.codex-tmp/v3/local-projects.json','utf8'));
const require=createRequire(import.meta.url);
const publicFiles=new Set(['index.html','app.js','data.js','whole-data.js','logic.js','member.js','avatar.js','whole.js','styles.css','pinterest.css','member.css','whole.css','avatar.css']);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const beauty=http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html';
    if(name.split(/[\\/]/).some(s=>s.startsWith('.')||s==='..')||name.includes('\\')||(!publicFiles.has(name)&&!name.startsWith('assets/'))){res.writeHead(404);return res.end();}
    const file=path.resolve(config.beauty,name),root=path.resolve(config.beauty);
    if(!file.startsWith(root+path.sep)||!types[path.extname(file)]){res.writeHead(404);return res.end();}
    const bytes=await fs.promises.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store','X-Robots-Tag':'noindex','Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404);res.end();}
});
const {createPreviewServer}=require(path.join(config.bookingReview||config.booking,'dist/preview/server.js'));
const booking=createPreviewServer({enableAdminDemo:true}).server;
for(const [server,port,label] of [[beauty,4181,'LOOK Beauty Marketplace'],[booking,4173,'Glasgow Booking']]){
  server.on('error',error=>{console.error(`${label}: ${error.message}`);beauty.close();booking.close();process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>console.log(`${label}: http://127.0.0.1:${port} — simulated local data only`));
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{beauty.close();booking.close();});
