// Rebuild the booking source in an ignored review folder. Never write to either
// original product project or copy its database / credentials into the portfolio.
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const file='.codex-tmp/v3/local-projects.json';
const config=JSON.parse(await fs.readFile(file,'utf8'));
const review=path.resolve('.codex-tmp/v3/booking-review');
await fs.mkdir(review,{recursive:true});
for(const name of ['miniprogram','cloudfunctions','preview','tests','tsconfig.json','admin-client/preview','dist/browser']){
  await fs.mkdir(path.dirname(path.join(review,name)),{recursive:true});
  await fs.cp(path.join(config.booking,name),path.join(review,name),{recursive:true});
}
execFileSync(process.execPath,[path.join(config.booking,'node_modules/typescript/bin/tsc'),'-p',path.join(review,'tsconfig.json'),'--typeRoots',path.join(config.booking,'node_modules/@types')],{stdio:'inherit'});
config.bookingReview=review;await fs.writeFile(file,JSON.stringify(config,null,2));
console.log('Prepared isolated booking build. Original projects untouched.');
