import {decimal,exact,value} from './model.mjs';
import {receipt,audit} from './layout.mjs';
export const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;");
export const projectJSON=r=>JSON.stringify(r.project,null,2)+'\n';
export const receiptJSON=r=>JSON.stringify(receipt(r),null,2)+'\n';
export function positionsCSV(r){audit(r);return ['button,from_top_mm,from_top_exact_mm,from_bottom_mm,from_bottom_exact_mm,pinned',...r.positions.map(p=>[p.button,decimal(p.at),exact(p.at),decimal(p.fromBottom),exact(p.fromBottom),p.pinned].join(','))].join('\r\n')+'\r\n';}
export function overviewSVG(r){
 audit(r);const length=Number(r.project.length),x=v=>40+720*v/length;
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 150" role="img" aria-labelledby="layout-graphic-title layout-graphic-desc"><title id="layout-graphic-title">Button center overview</title><desc id="layout-graphic-desc">'+escape(r.project.title)+'. Reference diagram, not actual size. All positions are listed in the table.</desc><rect width="800" height="150" fill="#f1f6fc"/><path d="M40 78H760" stroke="#273d62" stroke-width="3"/>'+r.positions.map(p=>'<path d="M'+x(value(p.at))+' 66v24" stroke="'+(p.pinned?'#7532a8':'#147365')+'" stroke-width="'+(p.pinned?4:2)+'"/>').join('')+'<text x="40" y="30" font-size="17" fill="#243a59">REFERENCE ONLY / '+escape(r.project.length)+' mm band</text><text x="40" y="125" font-size="16" fill="#243a59">0 mm</text><text x="760" y="125" text-anchor="end" font-size="16" fill="#243a59">'+escape(r.project.length)+' mm</text></svg>';
}
