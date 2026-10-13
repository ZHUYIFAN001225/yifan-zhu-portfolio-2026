"""Visual recruitment cases. Editorial content is shared with the canonical website."""
from pathlib import Path
import json
from xml.sax.saxutils import escape
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT=Path(__file__).resolve().parent.parent
DATA=json.loads((ROOT/'tmp/pdfs/product-cases.json').read_text(encoding='utf-8'))
OUT=ROOT/'output/pdf'; OUT.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('Latin','C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('LatinBold','C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFont(TTFont('CJK','C:/Windows/Fonts/simhei.ttf'))
W,H=landscape(A4); M=42; INNER=W-2*M
INK='#282828'; MUTED='#66655F'; PAPER='#F6F4EF'; PANEL='#EAE8E2'; LINE='#D6D2C9'; ACCENT='#56677F'

class CasePDF:
    def __init__(self,case,lang):
        self.case=case; self.lang=lang; self.i=1 if lang=='ZH' else 0
        self.font='CJK' if self.i else 'Latin'; self.bold='CJK' if self.i else 'LatinBold'
        self.file=OUT/f"{case['pdf']}-{lang}.pdf"
        self.c=canvas.Canvas(str(self.file),pagesize=(W,H),pageCompression=1)
        self.c.setTitle(self.s(case['title'])+' | Yifan Zhu'); self.c.setAuthor('Yifan Zhu')
        self.c.setSubject('Product and UX case study - prototype, research planned')
        self.page=0
    def s(self,pair):return pair[self.i]
    def label(self,en,zh):return zh if self.i else en
    def para(self,text,x,y,w,size=11,color=INK,bold=False,leading=None,maxh=None):
        # y is the top. Paragraph performs measured line wrapping, including CJK.
        text=text.replace('\u2011','-').replace('\u2013','-').replace('\u2014','-')
        st=ParagraphStyle('case',fontName=self.bold if bold else self.font,fontSize=size,
                          leading=leading or size*1.5,textColor=HexColor(color),wordWrap='CJK' if self.i else None)
        p=Paragraph(escape(text).replace('\n','<br/>'),st)
        _,h=p.wrap(w,H)
        if maxh is not None and h>maxh+0.1:raise ValueError(f'{self.file.name} page {self.page}: text exceeds box ({h}>{maxh}): {text[:70]}')
        if y-h<46:raise ValueError(f'{self.file.name} page {self.page}: text below footer: {text[:70]}')
        p.drawOn(self.c,x,y-h)
        return y-h
    def line(self,x1,y1,x2,y2,color=LINE):
        self.c.setStrokeColor(HexColor(color));self.c.setLineWidth(.7);self.c.line(x1,y1,x2,y2)
    def box(self,x,y,w,h,color=PANEL,r=12):
        self.c.setFillColor(HexColor(color));self.c.roundRect(x,y,w,h,r,fill=1,stroke=0)
    def footer_para(self,text,x,y,w,size=8):
        st=ParagraphStyle('footer',fontName=self.font,fontSize=size,leading=10,textColor=HexColor(MUTED))
        p=Paragraph(escape(text),st);_,h=p.wrap(w,25);p.drawOn(self.c,x,y-h)
    def new(self,kicker,title):
        if self.page:self.c.showPage()
        self.page+=1;self.c.setFillColor(HexColor(PAPER));self.c.rect(0,0,W,H,fill=1,stroke=0)
        self.para('YIFAN ZHU',M,H-21,220,9,bold=True)
        self.para(self.label('PRODUCT / UX CASE STUDY','产品 / UX 案例'),W-M-220,H-21,220,8,color=MUTED)
        self.line(M,37,W-M,37)
        self.footer_para(self.label('Research-led Multidisciplinary Designer','研究驱动的跨领域设计师'),M,27,440)
        self.footer_para(f'{self.page:02d}',W-M-25,27,25)
        self.para(kicker,M,H-65,INNER,9,color=ACCENT,bold=True)
        self.para(title,M,H-88,INNER,27,bold=True,leading=32,maxh=75)
    def phone(self,s,x,top,w,maxh):
        f=ROOT/'assets/v3/products'/f"{s['file']}.{s.get('ext','jpg')}"
        with Image.open(f) as im:iw,ih=im.size
        scale=min(w/iw,maxh/ih);dw,dh=iw*scale,ih*scale
        self.c.drawImage(str(f),x+(w-dw)/2,top-dh,width=dw,height=dh,mask='auto')
        return top-dh
    def title(self,en,zh):return self.label(en,zh)
    def cover(self):
        c=self.case
        self.new(self.title('01 / PRODUCT OVERVIEW','01 / 产品概览'),self.s(c['title']))
        left=338; top=H-166
        y=self.para(self.s(c['subtitle']),M,top,left,22,bold=True,maxh=100)
        y=self.para(self.s(c['intro']),M,y-18,left,11.5,maxh=105)
        y=self.para(self.s(c['status']),M,y-22,left,10,color=ACCENT,bold=True,maxh=40)
        y=self.para(self.title('MY CONTRIBUTION','我的工作'),M,y-24,left,9,color=MUTED)
        self.para(self.s(c['role']),M,y-7,left,11,maxh=55)
        x=M+left+38
        self.box(x-12,72,W-M-x+12,H-220,PANEL,18)
        for j,file in enumerate(c['hero']):
            s=next((s for s in c['screens'] if s['file']==file),{'file':file})
            self.phone(s,x+j*176,H-166-(20 if j else 0),162,330)
        self.para(self.title('Actual prototype screens · simulated content','真实原型界面 · 内容为模拟'),x,65,W-M-x,8.5,color=MUTED,maxh=17)
    def context(self):
        c=self.case; self.new(self.title('02 / FRAMING','02 / 问题定义'),self.s(c['question']))
        top=H-178; col=(INNER-36)/2; x2=M+col+36
        y=self.para(self.s(c['context']),M,top,col,11,maxh=150)
        y=self.para(self.title('DESIGN OBJECTIVES','设计目标'),M,y-22,col,9,color=ACCENT,bold=True)
        for j,o in enumerate(c['objectives']):
            y=self.para(f'0{j+1}  '+self.s(o),M,y-12,col,11,maxh=50)
        y=top
        for a in c['audience']:
            y=self.para(self.s(a['title']),x2,y,col,14,bold=True)
            y=self.para(self.s(a['body']),x2,y-8,col,10.5,maxh=65)-22
        self.box(M,60,INNER,83)
        self.para(self.title('EVIDENCE & LIMITS','依据与边界'),M+16,131,INNER-32,9,bold=True)
        self.para(self.s(c['evidence']),M+16,111,INNER-32,9.5,maxh=47)
    def architecture(self):
        c=self.case;self.new(self.title('03 / STRUCTURE & FLOW','03 / 架构与流程'),self.title('From navigation to a complete task','从页面导航，到完整任务'))
        col=(INNER-24)/2; top=H-149
        for j,a in enumerate(c['ia']):
            x=M+j*(col+24);self.box(x,top-226,col,226)
            y=self.para(self.s(a['title']),x+18,top-18,col-36,14,bold=True)
            for v in a['levels']:
                y=self.para(self.s(v),x+18,y-16,col-36,10.5,maxh=55)
        self.para(self.s(c['iaNote']),M,top-241,INNER,9.5,color=MUTED,maxh=30)
        fy=H-446; gap=15; cw=(INNER-4*gap)/5
        for j,step in enumerate(c['journey']):
            x=M+j*(cw+gap);self.line(x,fy+8,x+cw,fy+8,ACCENT)
            y=self.para(f'0{j+1} / '+self.s(step['title']),x,fy,cw,11,bold=True,maxh=34)
            self.para(self.s(step['body']),x,y-7,cw,9.5,maxh=65)
        # Detailed recovery behaviour remains readable in the website and decision page.
    def walkthrough(self,start,end,kicker,title):
        self.new(kicker,title); top=H-148; gap=28; col=(INNER-2*gap)/3
        for j,s in enumerate(self.case['screens'][start:end]):
            x=M+j*(col+gap)
            self.phone(s,x,top,col,286)
            y=self.para(self.s(s['title']),x,top-301,col,12,bold=True,maxh=36)
            self.para(self.s(s['body']),x,y-8,col,10,maxh=80)
    def decisions(self):
        c=self.case;self.new(self.title('06 / DESIGN DECISIONS','06 / 设计决策'),self.title('The logic behind the interface','界面背后的逻辑'))
        y=H-152
        for j,d in enumerate(c['decisions']):
            self.line(M,y+10,W-M,y+10)
            self.para(f'0{j+1}',M,y,28,10,color=ACCENT)
            self.para(self.s(d['title']),M+38,y,195,16,bold=True,maxh=58)
            self.para(self.s(d['why']),M+38,y-67,195,10,maxh=55)
            x=M+258; w=INNER-258
            yy=self.para(self.title('PROTOTYPE RESPONSE','原型中的应对'),x,y,w,9,color=ACCENT,bold=True)
            yy=self.para(self.s(d['how']),x,yy-5,w,10.5,maxh=48)
            yy=self.para(self.title('NEXT VALIDATION','下一步验证'),x,yy-12,w,9,color=MUTED,bold=True)
            self.para(self.s(d['test']),x,yy-5,w,10,maxh=40)
            y-=132
    def research(self):
        c=self.case;self.new(self.title('07 / RESEARCH PLAN','07 / 调研计划'),self.title('Take the prototype into the field','把原型带到真实场景'))
        self.para(self.title('Planned activities. No interviews or field tests completed yet.','以下为计划：目前尚未完成访谈或实地测试。'),M,H-145,INNER,11,color=ACCENT,bold=True,maxh=35)
        col=(INNER-48)/3;top=H-197
        for j,r in enumerate(c['research']):
            x=M+j*(col+24);self.line(x,top+12,x+col,top+12)
            y=self.para(f'0{j+1} / '+self.s(r['title']),x,top,col,14,bold=True,maxh=45)
            self.para(self.s(r['body']),x,y-14,col,11,maxh=130)
        self.para(self.title('EVIDENCE TO ADD AFTER FIELDWORK','现场工作后补充的证据'),M,197,INNER,10,bold=True)
        for j,s in enumerate(DATA['evidenceSlots']):
            x=M+j*(col+24);self.box(x,66,col,105)
            y=self.para(self.s(s['title']),x+14,157,col-28,11,bold=True,maxh=34)
            self.para(self.s(s['help']),x+14,y-9,col-28,9.5,maxh=58)
    def release(self):
        c=self.case;self.new(self.title('08 / PROGRESS & NEXT STEPS','08 / 进度与下一步'),self.title('Prototype today. Evidence-led release next.','先形成可体验原型，再以证据推进发布。'))
        col=(INNER-36)/2;x2=M+col+36;top=H-160
        y=top
        for j,r in enumerate(c['roadmap']):
            self.line(M,y+3,M,y-55,ACCENT if j==0 else LINE)
            y=self.para(self.s(r),M+18,y,col-18,11,bold=j==0,maxh=55)-24
        y=self.para(self.title('CURRENT BOUNDARIES','当前边界'),x2,top,col,10,color=ACCENT,bold=True)
        y=self.para(self.s(c['boundary']),x2,y-14,col,11,maxh=175)
        y=self.para(self.title('TRY THE PROTOTYPE','体验原型'),x2,y-23,col,10,bold=True)
        self.para(self.s(c['demo']),x2,y-12,col,10,maxh=110)
        self.line(M,102,W-M,102)
        self.para(self.title('Local review prototype. No verified business impact is claimed. A public demo link will follow approved release.','本地审核原型，尚无经过验证的商业成效。公开 Demo 链接将在获准发布后补充。'),M,88,INNER-245,9.5,color=MUTED,maxh=37)
        self.para('zhuyifan001225@gmail.com',W-M-224,88,224,11,bold=True,maxh=20)
        self.c.linkURL('mailto:zhuyifan001225@gmail.com',(W-M-224,69,W-M,90),relative=0)
    def field_evidence(self):
        # Future entries are shared with the web. Each gets a real evidence page;
        # empty data creates no fictional photos or findings.
        for e in self.case.get('evidenceItems',[]):
            self.new(self.title('FIELD EVIDENCE / ADDED MATERIAL','现场证据 / 补充材料'),self.s(e['title']))
            y=H-156
            if e.get('image'):
                path=ROOT/e['image']
                with Image.open(path) as im:iw,ih=im.size
                scale=min(430/iw,330/ih)
                self.c.drawImage(str(path),M,y-ih*scale,width=iw*scale,height=ih*scale,mask='auto')
                self.para(self.s(e['body']),M+465,y,INNER-465,12,maxh=330)
            else:self.para(self.s(e['body']),M,y,INNER,12,maxh=330)
    def run(self):
        self.cover();self.context();self.architecture()
        self.walkthrough(0,3,self.title('04 / CORE JOURNEY','04 / 核心旅程'),self.title('Read the product without opening the demo','不打开 Demo，也能读懂产品'))
        self.walkthrough(3,6,self.title('05 / THE COMPLETE SERVICE','05 / 完整服务体验'),self.title('Beyond a single screen','从单个页面，到完整体验'))
        self.decisions();self.research();self.release();self.field_evidence()
        self.c.save();print(f'{self.file.name}: {self.page} pages')

for case in DATA['productCases']:
    for lang in ['EN','ZH']:CasePDF(case,lang).run()
