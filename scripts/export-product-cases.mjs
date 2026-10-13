import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {homedir} from 'node:os';
import {productCases,caseLabels,evidenceSlots} from './product-case-data.mjs';
await fs.mkdir('tmp/pdfs',{recursive:true});
await fs.writeFile('tmp/pdfs/product-cases.json',JSON.stringify({productCases,caseLabels,evidenceSlots}));
const bundledPython=path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
const python=process.env.PORTFOLIO_PYTHON||(existsSync(bundledPython)?bundledPython:'python');
const result=spawnSync(python,['scripts/export-product-cases.py'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
await fs.mkdir('assets/v3/case-pdfs',{recursive:true});
for(const c of productCases)for(const lang of ['EN','ZH']){
  const name=`${c.pdf}-${lang}.pdf`;
  await fs.copyFile(`output/pdf/${name}`,`assets/v3/case-pdfs/${name}`);
}
console.log('Four case PDFs updated from scripts/product-case-data.mjs.');
