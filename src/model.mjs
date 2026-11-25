export function fraction(n,d=1n){if(d===0n)throw Error('Zero denominator.');if(d<0n){n=-n;d=-d;}let a=n<0n?-n:n,b=d;while(b)[a,b]=[b,a%b];return {n:n/(a||1n),d:d/(a||1n)};}
export const add=(a,b)=>fraction(a.n*b.d+b.n*a.d,a.d*b.d);
export const sub=(a,b)=>fraction(a.n*b.d-b.n*a.d,a.d*b.d);
export const eq=(a,b)=>a.n*b.d===b.n*a.d;
export const value=a=>Number(a.n)/Number(a.d);
export const exact=a=>a.n+'/'+a.d;
export function decimal(a,places=3){const sign=a.n<0n?'-':'',n=a.n<0n?-a.n:a.n,m=10n**BigInt(places),v=(n*m*2n+a.d)/(2n*a.d),whole=v/m,part=(v%m).toString().padStart(places,'0').replace(/0+$/,'');return sign+whole+(part?'.'+part:'');}
export function mm(s,label='Measurement'){if(typeof s!=='string'||! /^(0|[1-9]\d{0,3})(\.\d{1,2})?$/.test(s))throw Error(label+' must be millimeters with at most two decimal places (no spaces).');const [a,b='']=s.split('.');return BigInt(a)*100n+BigInt(b.padEnd(2,'0'));}
export function integer(s,min,max,label){if(!['string','number'].includes(typeof s))throw Error(label+' must be a whole number.');if(typeof s==='string'&&!/^(0|[1-9]\d*)$/.test(s))throw Error(label+' must be a whole number.');const n=typeof s==='number'?s:Number(s);if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(label+' must be '+min+' to '+max+'.');return n;}
const keys=(o,k)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join('|')===k.slice().sort().join('|');
export function validate(p){
 if(!keys(p,['schema','title','length','count','first','last','anchors','paper'])||p.schema!=='placketline/1')throw Error('Unsupported project schema.');
 if(typeof p.title!=='string'||p.title.length<1||p.title.length>60||!/^[\x20-\x7e]+$/.test(p.title))throw Error('Title must be 1 to 60 printable ASCII characters.');
 const length=mm(p.length,'Band length'),first=mm(p.first,'First center'),last=mm(p.last,'Last center');
 if(length<100n||length>200000n)throw Error('Band length must be 1 to 2000 mm.');
 if(first<0n||last>length||first>=last)throw Error('First and last centers must increase and stay inside the band.');
 const count=integer(p.count,2,50,'Button count');
 if(!Array.isArray(p.anchors)||p.anchors.length>count-2)throw Error('Too many interior anchors.');
 if(!['A4','Letter'].includes(p.paper))throw Error('Choose A4 or Letter paper.');
 const anchors=p.anchors.map(a=>{if(!keys(a,['button','at']))throw Error('Invalid anchor fields.');return {button:integer(a.button,2,count-1,'Anchor button'),at:a.at};});
 let previous={button:1,tick:first};for(const a of anchors){const tick=mm(a.at,'Anchor position');if(a.button<=previous.button||tick<=previous.tick||tick>=last)throw Error('Anchors must be listed in increasing button and position order, strictly between the endpoints.');previous={button:a.button,tick};}
 return {schema:p.schema,title:p.title,length:p.length,count,first:p.first,last:p.last,anchors,paper:p.paper};
}
export function anchorText(s,count){if(!s.trim())return [];if(s.length>2000)throw Error('Anchor list is too long.');return s.split(/\r?\n/).filter(l=>l.trim()).map((l,i)=>{const parts=l.split(',').map(x=>x.trim());if(parts.length!==2)throw Error('Anchor line '+(i+1)+' needs button number, position in mm.');return {button:integer(parts[0],2,count-1,'Anchor button'),at:parts[1]};});}
export function projectFromText(s){if(typeof s!=='string'||new TextEncoder().encode(s).length>20000)throw Error('Project exceeds 20,000 UTF-8 bytes.');return validate(JSON.parse(s));}
