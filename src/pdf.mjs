import {value,decimal} from './model.mjs';
import {audit} from './layout.mjs';
const PT=72/25.4;
const num=x=>Number(x.toFixed(6)).toString();
const literal=s=>s.replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)');
export function markingPDF(r){
 audit(r);const width=r.project.paper==='A4'?210:215.9,height=r.project.paper==='A4'?297:279.4,pages=[];
 for(const tile of r.tiles){
  const ops=['0 G','0 g','0.4 w'],y=global=>35+global-tile.start;
  const line=(x1,y1,x2,y2)=>ops.push([x1*PT,(height-y1)*PT].map(num).join(' ')+' m '+[x2*PT,(height-y2)*PT].map(num).join(' ')+' l S');
  const text=(x,y,s,size=10)=>ops.push('BT /F1 '+size+' Tf 1 0 0 1 '+num(x*PT)+' '+num((height-y)*PT)+' Tm ('+literal(s)+') Tj ET');
  text(20,15,r.project.title,14);text(20,23,'Placketline | '+r.project.paper+' | page '+tile.page+' / '+r.tiles.length+' | centers only',10);
  line(25,35,25,y(tile.end));line(85,35,85,y(tile.end));line(55,35,55,y(tile.end));
  for(let at=Math.ceil(tile.start/5)*5;at<=tile.end;at+=5){const major=at%10===0;line(35,y(at),major?42:39,y(at));if(major)text(26,y(at)+1,at+'',8);}
  const joins=[];if(tile.page>1)joins.push(tile.start,tile.start+10);if(tile.page<r.tiles.length)joins.push(tile.start+190,tile.start+200);
  for(const at of joins){line(25,y(at),85,y(at));text(87,y(at)+1,'join '+at,8);}
  for(const p of r.positions){const at=value(p.at);if(at<tile.start||at>tile.end)continue;line(49,y(at),61,y(at));line(55,y(at)-1.5,55,y(at)+1.5);if(!r.labelsSuppressed)text(63,y(at)+1,'B'+p.button+(p.pinned?' *':''),9);}
  text(105,69,'100 mm calibration bar',10);line(105,75,205,75);line(105,73,105,77);line(205,73,205,77);
  text(119,91,'100 mm',10);text(119,96,'vertical check',9);line(110,100,110,200);line(108,100,112,100);line(108,200,112,200);
  const notes=['PRINT AT 100% / ACTUAL SIZE.','Disable fit, shrink and duplex.','Measure BOTH calibration bars.','Reject printouts if either is off.','','Cut along the two strip edges.','Join adjacent pages by matching','both labeled join lines exactly.','Each shared run overlaps 10 mm.','Align centerlines; tape flat.','','Numbers at left: global mm.','Crosses: button centers only.','B label: button number.','Star: pinned center.'];
  notes.forEach((s,i)=>text(105,215+i*3.8,s,9));
  // These compact notes occupy the right column; the strip remains clear.
  text(20,248,'Band '+r.project.length+' mm | range '+tile.start+' to '+tile.end+' mm | cut edges 60 mm apart',9);
  text(20,254,r.labelsSuppressed?'Dense centers: all crosses drawn; B labels suppressed. Use the complete position table.':'Confirm the assembled length and every center with a ruler before marking fabric.',9);
  text(20,260,'Centers are not buttonhole starts/ends. Follow your pattern and test on scrap fabric.',9);
  pages.push(ops.join('\n'));
 }
 // All source strings are printable ASCII, so character offsets equal PDF byte offsets.
 const objects=['<< /Type /Catalog /Pages 2 0 R >>',null,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'],kids=[];
 for(const content of pages){const id=objects.length+1,kid=id;objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+num(width*PT)+' '+num(height*PT)+'] /Resources << /Font << /F1 3 0 R >> >> /Contents '+(id+1)+' 0 R >>');objects.push('<< /Length '+content.length+' >>\nstream\n'+content+'\nendstream');kids.push(kid+' 0 R');}
 objects[1]='<< /Type /Pages /Count '+kids.length+' /Kids ['+kids.join(' ')+'] >>';let s='%PDF-1.4\n',offsets=[0];
 objects.forEach((obj,i)=>{offsets.push(s.length);s+=(i+1)+' 0 obj\n'+obj+'\nendobj\n';});const xref=s.length;s+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';for(const n of offsets.slice(1))s+=String(n).padStart(10,'0')+' 00000 n \n';
 s+='trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n';return new TextEncoder().encode(s);
}
