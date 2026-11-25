import {validate,mm,fraction,sub,eq,value,exact,decimal} from './model.mjs';
export function layout(input){
 const project=validate(input),length=mm(project.length),anchors=[{button:1,at:project.first},...project.anchors,{button:project.count,at:project.last}];
 const positions=[],sections=[];
 for(let s=0;s<anchors.length-1;s++){
  const a=anchors[s],b=anchors[s+1],lo=mm(a.at),hi=mm(b.at),intervals=b.button-a.button,gap=fraction(hi-lo,BigInt(intervals)*100n);
  sections.push({from:a.button,to:b.button,gap});
  for(let k=s?1:0;k<=intervals;k++){
   const button=a.button+k,at=fraction(lo*BigInt(intervals)+(hi-lo)*BigInt(k),BigInt(intervals)*100n);
   positions.push({button,at,fromBottom:sub(fraction(length,100n),at),pinned:anchors.some(x=>x.button===button)});
  }
 }
 const gaps=positions.slice(1).map((p,i)=>sub(p.at,positions[i].at)),min=gaps.reduce((a,b)=>value(a)<value(b)?a:b),max=gaps.reduce((a,b)=>value(a)>value(b)?a:b);
 const tiles=tileBand(Number(length)/100);
 const result={project,positions,sections,gaps,minGap:min,maxGap:max,tiles,labelsSuppressed:value(min)<5};
 audit(result);return result;
}
export function tileBand(length){if(!Number.isFinite(length)||length<1||length>2000)throw Error('Invalid tile length.');const n=Math.max(1,Math.ceil((length-200)/190)+1);return Array.from({length:n},(_,i)=>({page:i+1,start:i*190,end:Math.min(length,i*190+200)}));}
export function audit(r){
 const p=validate(r.project),expected=[{button:1,at:p.first},...p.anchors,{button:p.count,at:p.last}];
 if(r.positions.length!==p.count)throw Error('Wrong position count.');
 for(let i=0;i<p.count;i++){
  const row=r.positions[i];if(row.button!==i+1||row.at.n<0n||row.at.d<=0n||!eq(row.fromBottom,sub(fraction(mm(p.length),100n),row.at)))throw Error('Invalid position receipt.');
  if(i&&sub(row.at,r.positions[i-1].at).n<=0n)throw Error('Centers are not ordered.');
 }
 for(const a of expected)if(!eq(r.positions[a.button-1].at,fraction(mm(a.at),100n)))throw Error('Pinned center moved.');
 for(let j=1;j<expected.length;j++){const a=expected[j-1],b=expected[j];for(let i=a.button;i<b.button;i++){const actual=sub(r.positions[i].at,r.positions[i-1].at);if(!eq(actual,fraction(mm(b.at)-mm(a.at),BigInt(b.button-a.button)*100n)))throw Error('Uneven section.');}}
 const length=Number(mm(p.length))/100,t=tileBand(length);
 if(JSON.stringify(r.tiles)!==JSON.stringify(t))throw Error('Tile coverage changed.');
 return true;
}
export function receipt(r){audit(r);return {schema:'placketline-receipt/1',project:r.project,units:'mm',rounding:'display is half-up to 3 decimals; exact fractions and PDF geometry are not based on those rounded strings',positions:r.positions.map(p=>({button:p.button,fromTopExact:exact(p.at),fromTop:decimal(p.at),fromBottomExact:exact(p.fromBottom),fromBottom:decimal(p.fromBottom),pinned:p.pinned})),sections:r.sections.map(s=>({from:s.from,to:s.to,gapExact:exact(s.gap),gap:decimal(s.gap)})),tiles:r.tiles,labelsSuppressed:r.labelsSuppressed,scope:'Button centers only. Physical printing and sewing must be checked; no hole length, fit, strength or gaping guarantee.'};}
