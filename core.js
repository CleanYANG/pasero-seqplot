let CUR="volcano";
const FONT='Arial, Helvetica, sans-serif';
const track=(e,d)=>{try{if(window.umami)window.umami.track(e,d);if(window.va)window.va("event",{name:e,data:d||{}})}catch(_){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const isNum=v=>{const s=String(v??"").trim();return s!==""&&isFinite(+s)};
const BADNAME=new Set(["","na","nan","-","false","none","null","#n/a"]);
const mctx=document.createElement("canvas").getContext("2d");
function tw(t,fs,it){mctx.font=(it?"italic ":"")+fs+"px "+FONT;return mctx.measureText(t).width}
function ticks(a,b,n){const s=(b-a)/n,p=10**Math.floor(Math.log10(s)),m=s/p,st=(m<1.5?1:m<3?2:m<7?5:10)*p,o=[];for(let v=Math.ceil(a/st)*st;v<=b+1e-9;v+=st)o.push(+v.toFixed(10));return o}
const fdate=()=>new Date().toISOString().slice(0,10);

/* ================= 通用：读文件 ================= */
function splitLine(l,d){
 if(d==="\t")return l.split("\t").map(s=>s.trim().replace(/^"|"$/g,""));
 const o=[];let c="",q=false;for(const ch of l){if(ch==='"')q=!q;else if(ch===d&&!q){o.push(c.trim());c=""}else c+=ch}o.push(c.trim());return o;
}
function parseText(t){
 const L=t.replace(/^\ufeff/,"").replace(/\r/g,"").split("\n").filter(l=>l.trim());
 const s=L.slice(0,5).join("\n"),d=(s.match(/\t/g)||[]).length>=(s.match(/,/g)||[]).length?"\t":",";
 return L.map(l=>splitLine(l,d));
}
function loadXLSX(){
 const src=["https://registry.npmmirror.com/xlsx/0.18.5/files/dist/xlsx.full.min.js","https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js","https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js"];
 return new Promise((ok,no)=>{if(window.XLSX)return ok();let k=0;
  const next=()=>{if(k>=src.length)return no(new Error(TT("无法加载 Excel 解析组件，请把文件另存为 CSV 再上传")));const s=document.createElement("script");s.src=src[k++];s.onload=()=>window.XLSX?ok():next();s.onerror=next;document.head.appendChild(s)};next()})}
/* 找表头：跳过表格上方的标题、说明行 */
function headerize(A){
 let hi=0;
 for(let i=0;i<Math.min(30,A.length-1);i++){
  const r=A[i],ne=r.filter(v=>String(v).trim()!=="").length,nn=r.filter(isNum).length,nx=(A[i+1]||[]).filter(isNum).length;
  if(ne>=3&&nn<=ne/3&&nx>=2){hi=i;break}
 }
 let head=A[hi].map(v=>String(v).trim());const rows=A.slice(hi+1).filter(r=>r.some(v=>String(v).trim()!==""));
 if(rows[0]&&head.length===rows[0].length-1)head=["gene"].concat(head);
 head=head.map((h,i)=>h||(i===0?"gene":"列"+(i+1)));
 return{head,rows,skipped:hi};
}
async function readAny(f){
 let name=f.name,buf=await f.arrayBuffer();
 if(/\.gz$/i.test(name)){
  if(!window.DecompressionStream)throw new Error(TT("浏览器版本太旧，无法解压 .gz，请先解压再上传"));
  buf=await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();name=name.replace(/\.gz$/i,"");
 }
 const u=new Uint8Array(buf.slice(0,4)),bin=(u[0]===0x50&&u[1]===0x4b)||(u[0]===0xd0&&u[1]===0xcf);
 let raw=[];
 if(bin){await loadXLSX();const wb=XLSX.read(buf,{type:"array"});
  raw=wb.SheetNames.map(n=>({name:n,A:XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:true,defval:""}).map(r=>r.map(v=>String(v)))}));
 }else raw=[{name:name,A:parseText(new TextDecoder().decode(buf))}];
 const sheets=raw.filter(s=>s.A.length>=3).map(s=>Object.assign({name:s.name},headerize(s.A))).filter(s=>s.rows.length>=3);
 if(!sheets.length)throw new Error(TT("文件里没有读到足够的数据行"));
 return{name:f.name,sheets};
}
/* 合并多个工作表（例如上调、下调分开放的差异表） */
function mergeSheets(sh){
 const H=sh[0].head,key=s=>s.trim().toLowerCase(),rows=[];let ok=true;
 for(const s of sh){
  const map=H.map((h,j)=>{const k=s.head.findIndex(x=>key(x)===key(h)&&key(h)!=="");return k>=0?k:(j<s.head.length&&(/^(gene|列\d+)$/.test(h)||/^(gene|列\d+)$/.test(s.head[j]))?j:-1)});
  if(map.filter(k=>k>=0).length<H.length*0.6)ok=false;
  for(const r of s.rows)rows.push(map.map(k=>k>=0?r[k]:""));
 }
 return ok?{head:H,rows}:null;
}
function setupSheets(boxId,selId,T,onPick,score){
 const sel=$(selId),sh=T.sheets,m=sh.length>1?mergeSheets(sh):null;
 sel.innerHTML=(m?`<option value="all">${esc(TT("合并全部 {0} 个表（{1} 行）",sh.length,m.rows.length))}</option>`:"")+sh.map((s,i)=>`<option value="${i}">${esc(TT("{0}（{1} 行）",s.name,s.rows.length))}</option>`).join("");
 $(boxId).hidden=sh.length<2;
 sel.onchange=()=>{const v=sel.value;onPick(v==="all"?m:sh[+v])};
 let best=0;if(!m&&score&&sh.length>1){let bs=-1;sh.forEach((s,i)=>{const v=score(s);if(v>bs){bs=v;best=i}})}
 sel.value=m?"all":String(best);sel.onchange();
}
function guessGene(head,ex){
 const f=re=>head.findIndex((h,i)=>re.test(h)&&!(ex||[]).includes(i));
 let g=f(/^(gene[\s_.]*name|symbol|gene[\s_.]*symbol|external[\s_.]*gene[\s_.]*name)$/i);
 if(g<0)g=f(/symbol|gene[\s_.]*name/i);if(g<0)g=f(/^(gene|gene[\s_.]*id|geneid|id|name)$/i);if(g<0)g=0;return g;
}
function fallbackIdCol(head,g){let fb=head.findIndex((h,i)=>i!==g&&/^(gene[\s_.]*id|geneid|id|ensembl(_id)?|gene)$/i.test(h));if(fb<0)fb=g===0?-1:0;return fb}
function geneName(r,g,fb){let n=String(r[g]??"").trim();if(BADNAME.has(n.toLowerCase())&&fb>=0)n=String(r[fb]??"").trim();return BADNAME.has(n.toLowerCase())?"":n}
function findP(head){
 const f=re=>head.findIndex(h=>re.test(h));
 let p=f(/^(padj|p\.adj|adj\.p\.val|fdr|q[\s_.-]*value|qvalue|p[\s_.]*adj(usted)?)$/i);if(p<0)p=f(/padj|adj|fdr|q[\s_.-]*val/i);if(p<0)p=f(/^(p[\s_.-]*value|pvalue|p\.value|pval|p)$/i);if(p<0)p=f(/p.?val/i);return p;
}
function findFC(head){
 const f=re=>head.findIndex(h=>re.test(h));
 let fc=f(/^(log2[\s_.]*fold[\s_.]*change|log2[\s_.]*fc|log2\(fc\)|logfc|log2fc|log2_fc)$/i);if(fc<0)fc=f(/log2.*(fc|fold)|logfc/i);return fc;
}
function bindDrop(dropId,fileId,cb){const dz=$(dropId),fi=$(fileId);
 dz.onclick=()=>fi.click();fi.onchange=()=>{fi.files[0]&&cb(fi.files[0]);fi.value=""};
 dz.ondragover=e=>{e.preventDefault();dz.classList.add("on")};dz.ondragleave=()=>dz.classList.remove("on");
 dz.ondrop=e=>{e.preventDefault();dz.classList.remove("on");const f=e.dataTransfer.files[0];if(f)cb(f)};}
function setMsg(id,t,c){const m=$(id);m.className="msg"+(c?" "+c:"");m.textContent=t}
async function save(msgId,name,blob){
 try{
  if(window.claude&&window.claude.use){const dl=await window.claude.use("downloads");if(dl){await dl.save({filename:name,data:blob});setMsg(msgId,TT("已导出 {0}",name));return}}
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);setMsg(msgId,TT("已导出 {0}",name));
 }catch(e){if(e&&e.code==="declined"){setMsg(msgId,TT("已取消导出"));return}setMsg(msgId,TT("导出失败：{0}",(e&&e.message)||TT("当前环境不支持下载")),"err")}
}
function exportPng(msgId,svgStr,name){
 const W=+svgStr.match(/width="([\d.]+)"/)[1],H=+svgStr.match(/height="([\d.]+)"/)[1],k=4,img=new Image(),u=URL.createObjectURL(new Blob([svgStr],{type:"image/svg+xml"}));
 img.onload=()=>{const c=document.createElement("canvas");c.width=W*k;c.height=H*k;const x=c.getContext("2d");x.scale(k,k);x.drawImage(img,0,0,W,H);URL.revokeObjectURL(u);c.toBlob(b=>save(msgId,name,b),"image/png")};
 img.onerror=()=>setMsg(msgId,TT("PNG 生成失败，请改用 SVG"),"err");img.src=u;
}
const csvq=v=>/[",\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':String(v);
function seeded(seed){return()=>(seed=(seed*16807)%2147483647)/2147483647}

/* ================= 火山图 ================= */
const PAL=[["#d6404e","#3b6fb6","#c4c4c4"],["#E64B35","#4DBBD5","#c9c9c9"],["#D55E00","#0072B2","#bdbdbd"],["#e8857a","#7fa7d6","#d6d6d6"]];
const S={head:[],rows:[],pts:[],sig:[]};
function vDemo(){
 const r=seeded(7),nrm=()=>Math.sqrt(-2*Math.log(r()+1e-12))*Math.cos(2*Math.PI*r());
 const named=["Cxcl10","Isg15","Ifit1","Rsad2","Oasl1","Irf7","Stat1","Mx1","Ccl5","Gbp2","Il6","Saa3","Lcn2","Cd74","H2-Aa","Ly6a","Serpina3n","Timp1","Socs3","Fos","Egr1","Junb","Cyp2e1","Cyp7a1","Hmgcs1","Fasn","Scd1","Elovl6","Acaca","Insig1","Ldlr","Pcsk9","Sqle","Hmgcr","Mup1","Apoa4","Cidea","Ucp1","Pparg","Ppargc1a"];
 const rows=[];
 for(let i=0;i<9000;i++){
  let fc=nrm()*0.45,z=Math.abs(fc)*3+Math.abs(nrm())*0.6;
  if(i<named.length){fc=(i<20?1:-1)*(1.4+r()*2.6);z=4+r()*9+Math.abs(fc)}
  else if(r()<0.06){fc=(r()<0.55?1:-1)*(0.8+r()*2.6);z=1+r()*7+Math.abs(fc)}
  const p=Math.min(1,10**-z);
  rows.push([i<named.length?named[i]:"Gene"+String(i).padStart(5,"0"),Math.exp(1.5+r()*8+Math.min(z,6)*0.25).toFixed(2),fc.toFixed(4),p.toExponential(3),Math.min(1,p*3).toExponential(3)]);
 }
 vSet({head:["gene_name","baseMean","log2FoldChange","pvalue","padj"],rows});S.demo=true;setMsg("vMsg",TT("当前为示例数据（模拟生成）"));$("vSheetBox").hidden=true;
}
function vSet(t){
 S.head=t.head;S.rows=t.rows;const h=t.head;
 const g=guessGene(h),fc=findFC(h),p=findP(h);
 for(const [id,v] of [["cG",g],["cF",fc],["cP",p]]){$(id).innerHTML=(id==="cG"?"":`<option value="">—</option>`)+h.map((x,i)=>`<option value="${i}">${esc(x)}</option>`).join("");$(id).value=v>=0?String(v):id==="cG"?"0":""}
 S.miss=fc<0||p<0;maSetup();vBuild();
}
async function vRead(f){
 setMsg("vMsg",TT("正在读取 {0} …",f.name));
 S.demo=false;try{const T=await readAny(f);setupSheets("vSheetBox","vSh",T,t=>{vSet(t);vNote(T)},s=>((findFC(s.head)>=0)+(findP(s.head)>=0))*1e7);track("upload",{tool:"volcano"})}
 catch(e){setMsg("vMsg",e.message||TT("读取失败"),"err")}
}
function vNote(T){
 const n=S.rows.length;let t=TT("已载入 {0}，{1} 行",T.name,n);const sep=LANG==="en"?". ":"。";
 if(S.miss){setMsg("vMsg",t+sep+TT("没找到 log2FC 或 P 值列：这可能是表达矩阵而不是差异分析结果。表达矩阵请用「热图」；如果列名比较特殊，请在下面手动选择。"),"err");return}
 const sig=S.pts.filter(d=>d.p<0.05).length;
 if(S.pts.length&&sig/S.pts.length>0.95)setMsg("vMsg",t+sep+TT("注意：这个表几乎只包含显著基因，图上不会有灰色的不显著点。完整的火山图需要包含全部基因的结果表。"),"warn");
 else setMsg("vMsg",t);
}
function vBuild(){
 const g=+$("cG").value,fi=+$("cF").value,pi=+$("cP").value,fb=fallbackIdCol(S.head,g);
 const pts=[];let minP=1;
 if($("cF").value===""||$("cP").value===""){S.pts=[];vDraw();return}
 const am=maCol();
 for(const r of S.rows){const fc=parseFloat(r[fi]),p=parseFloat(r[pi]);if(!isFinite(fc)||!isFinite(p)||p<0||p>1)continue;if(p>0&&p<minP)minP=p;pts.push({g:geneName(r,g,fb)||"?",fc,p,a:am(r)})}
 for(const d of pts)d.y=-Math.log10(d.p>0?d.p:minP/10);
 S.pts=pts;vDraw();
}
function vClassify(){
 const tF=+$("tF").value||0,tP=+$("tP").value||0.05;
 for(const d of S.pts)d.c=(d.p<tP&&Math.abs(d.fc)>=tF)?(d.fc>0?"u":"d"):"n";
 S.sig=S.pts.filter(d=>d.c!=="n").sort((a,b)=>a.p-b.p||Math.abs(b.fc)-Math.abs(a.fc));
 return{tF,tP};
}
function placeLabels(lb,L,T,pw,ph,r){
 for(let k=0;k<300;k++){let mv=0;
  for(let i=0;i<lb.length;i++){const a=lb[i];
   for(let j=i+1;j<lb.length;j++){const b=lb[j],dx=b.x-a.x,dy=b.y-a.y,ox=(a.w+b.w)/2+2-Math.abs(dx),oy=(a.h+b.h)/2+1-Math.abs(dy);
    if(ox>0&&oy>0){mv=1;if(oy<ox){const s=(dy>=0?1:-1)*oy/2;a.y-=s;b.y+=s}else{const s=(dx>=0?1:-1)*ox/2;a.x-=s;b.x+=s}}}
   for(const q of lb){const ox=a.w/2+r+1-Math.abs(q.px-a.x),oy=a.h/2+r+1-Math.abs(q.py-a.y);if(ox>0&&oy>0){mv=1;a.y+=(a.y<q.py?-1:1)*Math.min(oy,2)}}
   a.x=Math.min(Math.max(a.x,L+a.w/2+2),L+pw-a.w/2-2);a.y=Math.min(Math.max(a.y,T+a.h/2+2),T+ph-a.h/2-2)}
  if(!mv)break}
}
function labelSvg(lb,r,lf,it,fill){let o="";
 for(const a of lb){
  const ex=Math.min(Math.max(a.px,a.x-a.w/2),a.x+a.w/2),ey=Math.min(Math.max(a.py,a.y-a.h/2),a.y+a.h/2);
  if(Math.hypot(ex-a.px,ey-a.py)>r+3)o+=`<line x1="${a.px.toFixed(1)}" y1="${a.py.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#555" stroke-width="0.7"/>`;
  o+=`<circle cx="${a.px.toFixed(1)}" cy="${a.py.toFixed(1)}" r="${r+0.6}" fill="${fill(a)}" stroke="#111" stroke-width="0.8"/>`;
  o+=`<text x="${a.x.toFixed(1)}" y="${(a.y+lf*0.35).toFixed(1)}" text-anchor="middle" font-size="${lf}"${it?' font-style="italic"':""} fill="#111" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">${esc(a.t)}</text>`}
 return o;
}
function vSvg(mode){
 const ma=mode==="ma";const {tF,tP}=vClassify();
 const P=ma?S.pts.filter(d=>isFinite(d.a)):S.pts;
 const [W,H]=$("sz").value.split("x").map(Number),fs=+$("fs").value||13,it=$("ital").checked;
 const col={u:$("cU").value,d:$("cD").value,n:$("cN").value},r=+$("ps").value,op=+$("op").value,title=$("ttl").value.trim();
 const T=(title?fs*2.2:0)+fs*2+10,L=fs*4.2,R=16,B=fs*3.6,pw=W-L-R,ph=H-T-B;
 const gx=ma?d=>d.a:d=>d.fc,gy=ma?d=>d.fc:d=>d.y;
 let x0,x1,y0,y1;
 if(ma){let a0=Infinity,a1=-Infinity,ym=1.5;for(const d of P){if(d.a<a0)a0=d.a;if(d.a>a1)a1=d.a;if(Math.abs(d.fc)>ym)ym=Math.abs(d.fc)}if(!isFinite(a0)){a0=0;a1=1}const pad=(a1-a0)*0.04||0.5;x0=a0-pad;x1=a1+pad;y0=-ym*1.06;y1=ym*1.06}
 else{let xm=1.5,ym=2;for(const d of P){if(Math.abs(d.fc)>xm)xm=Math.abs(d.fc);if(d.y>ym)ym=d.y}x0=-xm*1.06;x1=xm*1.06;y0=0;y1=ym*1.06}
 const X=v=>L+(v-x0)/(x1-x0)*pw,Y=v=>T+ph-(v-y0)/(y1-y0)*ph;
 let o=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}" font-size="${fs}"><rect width="${W}" height="${H}" fill="#fff"/>`;
 if(title)o+=`<text x="${L+pw/2}" y="${fs*1.6}" text-anchor="middle" font-size="${fs*1.25}" font-weight="bold" fill="#111">${esc(title)}</text>`;
 const sig=P.filter(d=>d.c!=="n"),nU=sig.filter(d=>d.c==="u").length,nD=sig.length-nU,nN=P.length-sig.length;
 let lx=L;const ly=T-fs*0.9;
 for(const [k,t] of [["u",TT("上调 {0}",nU)],["d",TT("下调 {0}",nD)],["n",TT("不显著 {0}",nN)]]){o+=`<circle cx="${lx+5}" cy="${ly-fs*0.35}" r="5" fill="${col[k]}"/><text x="${lx+14}" y="${ly}" fill="#222">${t}</text>`;lx+=24+tw(t,fs)}
 const xt=ticks(x0,x1,W<500?5:8),yt=ticks(y0,y1,6);
 o+=`<g stroke="#eee" stroke-width="1">`;for(const v of xt)o+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${T+ph}"/>`;for(const v of yt)o+=`<line x1="${L}" x2="${L+pw}" y1="${Y(v)}" y2="${Y(v)}"/>`;o+=`</g>`;
 const ds=`stroke="#888" stroke-dasharray="4 4" stroke-width="1"`;
 if($("lines").checked){
  if(ma){o+=`<line x1="${L}" x2="${L+pw}" y1="${Y(0)}" y2="${Y(0)}" stroke="#666" stroke-width="1"/>`;if(tF>0)for(const v of [tF,-tF])o+=`<line x1="${L}" x2="${L+pw}" y1="${Y(v)}" y2="${Y(v)}" ${ds}/>`}
  else{const yl=-Math.log10(tP);o+=`<line x1="${X(-tF)}" x2="${X(-tF)}" y1="${T}" y2="${T+ph}" ${ds}/><line x1="${X(tF)}" x2="${X(tF)}" y1="${T}" y2="${T+ph}" ${ds}/>`;if(yl<y1)o+=`<line x1="${L}" x2="${L+pw}" y1="${Y(yl)}" y2="${Y(yl)}" ${ds}/>`}}
 for(const k of ["n","d","u"]){o+=`<g fill="${col[k]}" fill-opacity="${op}">`;for(const d of P)if(d.c===k)o+=`<circle cx="${X(gx(d)).toFixed(1)}" cy="${Y(gy(d)).toFixed(1)}" r="${r}"/>`;o+="</g>"}
 o+=`<rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="none" stroke="#222" stroke-width="1"/>`;
 for(const v of xt)o+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T+ph}" y2="${T+ph+4}" stroke="#222"/><text x="${X(v)}" y="${T+ph+fs+6}" text-anchor="middle" fill="#222">${v}</text>`;
 for(const v of yt)o+=`<line x1="${L-4}" x2="${L}" y1="${Y(v)}" y2="${Y(v)}" stroke="#222"/><text x="${L-7}" y="${Y(v)+fs*0.35}" text-anchor="end" fill="#222">${v}</text>`;
 const sub=n=>`<tspan baseline-shift="sub" font-size="${fs*0.75}">${n}</tspan>`;
 const xl=ma?(S.alog?esc(S.aname):`log${sub(2)}(${esc(S.aname)} + 1)`):`log${sub(2)} Fold Change`;
 const yl=ma?`log${sub(2)} Fold Change`:`-log${sub(10)}(${esc(S.head[+$("cP").value]||"P")})`;
 o+=`<text x="${L+pw/2}" y="${H-fs*0.7}" text-anchor="middle" fill="#111">${xl}</text>`;
 o+=`<text transform="translate(${fs*1.2} ${T+ph/2}) rotate(-90)" text-anchor="middle" fill="#111">${yl}</text>`;
 const want=$("genes").value.split(/[\s,，;；]+/).filter(Boolean),wl=new Set(want.map(s=>s.toLowerCase()));
 const pick=new Map();sig.sort((a,b)=>a.p-b.p||Math.abs(b.fc)-Math.abs(a.fc)).slice(0,Math.max(0,+$("topN").value||0)).forEach(d=>pick.set(d.g,d));
 const found=new Set();for(const d of P){const k=d.g.toLowerCase();if(wl.has(k)){found.add(k);if(!pick.has(d.g))pick.set(d.g,d)}}
 const miss=want.filter(s=>!found.has(s.toLowerCase()));setMsg("geneMsg",miss.length?TT("没找到：{0}",miss.join(TT("、"))):"",miss.length?"err":"");
 const lf=fs*0.92,lb=[...pick.values()].map(d=>{const w=tw(d.g,lf,it)+4,h=lf*1.2,px=X(gx(d)),py=Y(gy(d)),right=ma?true:d.fc>=0;return{d,t:d.g,px,py,w,h,x:px+(right?w/2+8:-w/2-8),y:py-h}});
 placeLabels(lb,L,T,pw,ph,r);o+=labelSvg(lb,r,lf,it,a=>col[a.d.c]);
 S.counts={nU,nD,nN,n:P.length};
 return o+"</svg>";
}
let vraf=0;function deDraw(){const ma=CUR==="ma",sh=ma?"maSheet":"vSheet",st=ma?"maStats":"vStats";cancelAnimationFrame(vraf);vraf=requestAnimationFrame(()=>{
 if(!S.pts.length||(ma&&!S.pts.some(d=>isFinite(d.a)))){$(sh).innerHTML='<p style="color:#666;padding:40px;text-align:center">'+esc(TT(ma?"没有平均表达量：请在「MA 图设置」里选择平均表达列":"选中的列里没有可画的数值，请检查 log2FC 列和 P 值列"))+'</p>';$(st).innerHTML="";return}
 $(sh).innerHTML=vSvg(ma?"ma":"volcano");const c=S.counts;
 $(st).innerHTML=`<span>${TT("共 <b>{0}</b> 个基因",c.n)}</span><span style="color:${$("cU").value}">${TT("上调 <b>{0}</b>",c.nU)}</span><span style="color:${$("cD").value}">${TT("下调 <b>{0}</b>",c.nD)}</span><span>|log2FC| ≥ ${esc($("tF").value)}${LANG==="en"?", ":"，"}P &lt; ${esc($("tP").value)}</span>`})}
const vDraw=deDraw;
$("vSvg").onclick=()=>{save("vExMsg","volcano_"+fdate()+".svg",new Blob([vSvg("volcano")],{type:"image/svg+xml"}));track("export",{f:"svg",tool:"volcano"})};
$("vPng").onclick=()=>{exportPng("vExMsg",vSvg("volcano"),"volcano_"+fdate()+".png");track("export",{f:"png",tool:"volcano"})};
$("vCsv").onclick=()=>{vClassify();const t="gene,log2FC,p,direction\n"+S.sig.map(d=>[csvq(d.g),d.fc,d.p,d.c==="u"?"up":"down"].join(",")).join("\n");
 save("vExMsg","DEG_filtered_"+fdate()+".csv",new Blob(["\ufeff"+t],{type:"text/csv"}));track("export",{f:"csv",tool:"volcano"})};
function setPal(i){const p=PAL[i];$("cU").value=p[0];$("cD").value=p[1];$("cN").value=p[2]}
$("pal").onchange=()=>{setPal(+$("pal").value);vDraw()};
for(const id of ["cG","cF","cP"])$(id).onchange=vBuild;
for(const id of ["tF","tP","topN","genes","ttl","fs","ps","op","cU","cD","cN"])$(id).oninput=vDraw;
for(const id of ["lines","ital","sz"])$(id).onchange=vDraw;
bindDrop("vDrop","vFile",vRead);

/* ================= 热图 ================= */
const HPAL=[["#3b6fb6","#ffffff","#d6404e"],["#1d3557","#f7f4ee","#c8371e"],["#5e3c99","#f7f7f7","#e66101"],["#2ca02c","#000000","#d62728"]];
const GCOL=["#4C72B0","#DD8452","#55A868","#C44E52","#8172B3","#937860","#DA8BC3","#8C8C8C","#CCB974","#64B5CD"];
const Hs={head:[],rows:[],smp:[],res:null};
const NOTSAMPLE=/(^|[\s_.-])(chr|chrom|start|end|strand|length|len|pvalue|p\.?val\w*|padj|fdr|q[\s_.-]?val\w*|log\w*fc|log2\w*|log\w*cpm|fold\w*|fc|basemean|lfcse|stat|max_expression_value|expression_samples|significance\w*|gc|exon\w*|width|position)($|[\s_.(-])/i;
function hDemo(){
 const r=seeded(11),nrm=()=>Math.sqrt(-2*Math.log(r()+1e-12))*Math.cos(2*Math.PI*r());
 const S6=["Ctrl_1","Ctrl_2","Ctrl_3","Treat_1","Treat_2","Treat_3"],named=["Sox9","Amh","Dmrt1","Wt1","Cyp17a1","Star","Hsd3b1","Insl3","Lhcgr","Cyp11a1","Stra8","Sycp3","Ddx4","Dazl","Piwil1","Tnp1","Prm1","Prm2","Acrv1","Zpbp"];
 const rows=[];
 for(let i=0;i<3000;i++){
  const base=Math.exp(2+r()*7),de=i<60?(i%2?1:-1)*(0.8+r()*2):0,b2=r()<0.3?nrm()*0.6:0;
  rows.push([i<named.length?named[i]:"Gene"+String(i).padStart(4,"0")].concat(S6.map((s,j)=>{const f=Math.exp((j>=3?de:0)*0.69+(j%3===0?b2:0)+nrm()*0.12);return String(Math.round(base*f))})));
 }
 hSet({head:["gene_name"].concat(S6),rows});Hs.demo=true;setMsg("hMsg",TT("当前为示例数据（模拟生成）"));$("hSheetBox").hidden=true;
}
function groupsFor(names){
 const strong=n=>{const s=n.replace(/^(fpkm|tpm|rpkm|cpm|counts?|read[_.\s-]?counts?|norm\w*)[\s_.-]+/i,"").replace(/[\s_.-]+(ERR|SRR|DRR|GSM)\d+$/i,"");
  if(/[\s_.-]+(rep|r|#)?0*\d{1,3}$/i.test(s))return[s.replace(/[\s_.-]+(rep|r|#)?0*\d{1,3}$/i,""),1];
  if(/rep\d{1,3}$/i.test(s))return[s.replace(/rep\d{1,3}$/i,""),1];return[s,0]};
 const st=names.map(strong),strongSet=new Set(st.filter(x=>x[1]).map(x=>x[0].toLowerCase()));
 const weak=st.map(([g,ok])=>!ok&&/[a-z]\d{1,3}$/i.test(g)&&!strongSet.has(g.toLowerCase())?g.replace(/\d{1,3}$/,""):null);
 const cnt={};weak.forEach(w=>{if(w)cnt[w.toLowerCase()]=(cnt[w.toLowerCase()]||0)+1});
 return st.map(([g],i)=>(weak[i]&&cnt[weak[i].toLowerCase()]>=2?weak[i]:g)||names[i])}
const groupOf=n=>groupsFor([n])[0];
const NOTSAMPLE_EXACT=/^(t|b|z|count|counts|%|rank|nes|size|cluster|score|pct|aveexpr|setsize|enrichmentscore|pct\.?[12]|p_val(_adj)?|avg_log2fc|avg_logfc|list ?total|pop ?hits|pop ?total|bonferroni|benjamini|fold ?enrichment|correlation|.*gene ?number.*|.*reads?|.*bases?|q20.*|q30.*|gc.*|error.*|.*mapped.*|.*mapping.*|.*ratio.*|.*%.*|.*_id|id)$/i;
const notSample=h=>NOTSAMPLE.test(h)||NOTSAMPLE_EXACT.test(h.trim())||/^-?[\d.]+([eE][+-]?\d+)?$/.test(h.trim());

function matScore(s){const sample=s.rows.slice(0,60);let n=0;s.head.forEach((h,i)=>{if(!notSample(h)&&sample.filter(r=>isNum(r[i])).length>=sample.length*0.9)n++});return n>=2?Math.min(n,60):0}
function hSet(t){
 Hs.head=t.head;Hs.rows=t.rows;const h=t.head,g=guessGene(h);
 $("hG").innerHTML=h.map((x,i)=>`<option value="${i}">${esc(x)}</option>`).join("");$("hG").value=g;
 const sample=Hs.rows.slice(0,300),num=h.map((x,i)=>i!==g&&sample.filter(r=>isNum(r[i])).length>=sample.length*0.9);
 let cand=h.map((x,i)=>i).filter(i=>num[i]&&!notSample(h[i]));
 const pref=cand.filter(i=>/^(fpkm|tpm|rpkm|cpm)/i.test(h[i]));if(pref.length>=2)cand=pref;
 const nums=h.map((x,i)=>i).filter(i=>num[i]),gs=groupsFor(cand.map(i=>h[i])),gmap={};cand.forEach((i,k)=>gmap[i]=gs[k]);
 Hs.smp=nums.map(i=>({i,name:h[i],num:true,on:cand.includes(i),group:gmap[i]||groupOf(h[i])}));
 hSmpUI();
 Hs.pcol=findP(h);
 const o=$("hSel").querySelector('[value="sig"]');o.disabled=Hs.pcol<0;if(Hs.pcol<0&&$("hSel").value==="sig")$("hSel").value="var";
 hBuild();
}
function hSmpUI(){
 $("hSmp").innerHTML=Hs.smp.map((s,k)=>`<div><input type="checkbox" data-k="${k}" ${s.on?"checked":""} aria-label="${esc(s.name)}"><span title="${esc(s.name)}">${esc(s.name)}</span><input type="text" data-g="${k}" value="${esc(s.group)}" aria-label="${esc(s.name)} group"></div>`).join("")||'<div style="display:block;color:var(--mut)">'+esc(TT("没有找到数值列"))+'</div>';
}
$("hSmp").onchange=e=>{const k=e.target.dataset.k;if(k!==undefined){Hs.smp[+k].on=e.target.checked;hBuild()}};
$("hSmp").oninput=e=>{const k=e.target.dataset.g;if(k!==undefined){Hs.smp[+k].group=e.target.value.trim()||TT("未分组");matDraw()}};
async function hRead(f){
 setMsg("hMsg",TT("正在读取 {0} …",f.name));
 Hs.demo=false;try{const T=await readAny(f);setupSheets("hSheetBox","hSh",T,t=>{hSet(t);setMsg("hMsg",TT("已载入 {0}，{1} 行",T.name,t.rows.length))},matScore);track("upload",{tool:"heatmap"})}
 catch(e){setMsg("hMsg",e.message||TT("读取失败"),"err")}
}
function hBuild(){
 const g=+$("hG").value,fb=fallbackIdCol(Hs.head,g),sm=Hs.smp.filter(s=>s.on);
 Hs.res=null;
 if(sm.length<2){Hs.all=null;matDraw(TT("至少要勾选 2 个样本列"));return}
 /* 数值类型 */
 let type=$("hType").value;
 if(type==="auto"){const vals=[];for(const r of Hs.rows.slice(0,800))for(const s of sm){const v=+r[s.i];if(isFinite(v))vals.push(v)}
  let mx=-Infinity,neg=false,allInt=true;for(const v of vals){if(v>mx)mx=v;if(v<0)neg=true;if(allInt&&!Number.isInteger(v))allInt=false}
  const cntH=/count/i.test(sm.map(s=>s.name).join(" "));
  type=neg||mx<30?"log":(allInt&&mx>500)||(cntH&&mx>100)?"counts":"norm"}
 setMsg("hTypeMsg",TT({counts:"按原始 counts 处理：先换算成 CPM，再取 log2(CPM+1)",norm:"按 FPKM/TPM 等标准化数值处理：取 log2(x+1)",log:"按已经取过 log 的数值处理，不再转换"}[type]));
 const lib=sm.map(s=>Hs.rows.reduce((a,r)=>a+(+r[s.i]||0),0));
 const all=[];const seen=new Map();
 for(const r of Hs.rows){const v=sm.map(s=>parseFloat(r[s.i]));if(v.some(x=>!isFinite(x)))continue;
  const name=geneName(r,g,fb);if(!name)continue;
  const lv=v.map((x,j)=>type==="counts"?Math.log2(x/lib[j]*1e6+1):type==="norm"?Math.log2(Math.max(x,0)+1):x);
  const mean=lv.reduce((a,b)=>a+b,0)/lv.length,vr=lv.reduce((a,b)=>a+(b-mean)**2,0)/(lv.length-1);
  const p=Hs.pcol>=0?parseFloat(r[Hs.pcol]):NaN,rec={name,lv,mean,vr,p};
  const k=name.toLowerCase();if(seen.has(k)){if(seen.get(k).mean<mean){all[all.indexOf(seen.get(k))]=rec;seen.set(k,rec)}continue}
  seen.set(k,rec);all.push(rec);
 }
 Hs.all=all;Hs.sm=sm;Hs.type=type;hPick();
}
function hPick(){
 const mode=$("hSel").value,N=Math.min(500,Math.max(2,+$("hN").value||50));
 $("hNBox").hidden=mode==="list";$("hListBox").hidden=mode!=="list";
 let sel=[],msg="",warn=false;
 if(!Hs.all){matDraw();return}
 if(mode==="var"){sel=Hs.all.filter(d=>d.mean>=1).sort((a,b)=>b.vr-a.vr).slice(0,N);msg=TT("从 {0} 个基因中按方差选出 {1} 个（已排除低表达基因）",Hs.all.length,sel.length)}
 else if(mode==="sig"){sel=Hs.all.filter(d=>isFinite(d.p)).sort((a,b)=>a.p-b.p).slice(0,N);msg=TT("按 {0} 从小到大选出 {1} 个",Hs.head[Hs.pcol],sel.length)}
 else{const want=$("hList").value.split(/[\s,，;；]+/).filter(Boolean),m=new Map(Hs.all.map(d=>[d.name.toLowerCase(),d]));sel=[];const miss=[];
  for(const w of want){const d=m.get(w.toLowerCase());if(d){if(!sel.includes(d))sel.push(d)}else miss.push(w)}
  warn=miss.length>0;msg=want.length?(TT("找到 {0} 个",sel.length)+(miss.length?TT("；没找到：{0}",miss.slice(0,20).join(TT("、"))+(miss.length>20?TT(" 等"):"")):"")):TT("请粘贴基因名");}
 setMsg("hSelMsg",msg,warn?"warn":"");
 Hs.sel=sel;matDraw();
}
/* 层次聚类：平均连锁，欧氏距离 */
function hclust(X){
 const n=X.length;if(n<2)return{order:X.map((_,i)=>i),nodes:[]};
 const N=2*n,D=new Float64Array(N*N);
 for(let i=0;i<n;i++)for(let j=0;j<i;j++){let s=0;for(let k=0;k<X[i].length;k++)s+=(X[i][k]-X[j][k])**2;D[i*N+j]=D[j*N+i]=Math.sqrt(s)}
 let act=[];for(let i=0;i<n;i++)act.push({id:i,size:1,leaf:i,h:0});
 const nodes=[];let next=n;
 while(act.length>1){
  let bi=0,bj=1,bd=Infinity;
  for(let a=0;a<act.length;a++){const ia=act[a].id*N;for(let b=a+1;b<act.length;b++){const d=D[ia+act[b].id];if(d<bd){bd=d;bi=a;bj=b}}}
  const A=act[bi],B=act[bj],id=next++;
  for(const c of act)if(c!==A&&c!==B){const d=(A.size*D[A.id*N+c.id]+B.size*D[B.id*N+c.id])/(A.size+B.size);D[id*N+c.id]=D[c.id*N+id]=d}
  const node={id,size:A.size+B.size,l:A,r:B,h:bd};nodes.push(node);
  act=act.filter(c=>c!==A&&c!==B);act.push(node);
 }
 const order=[];(function walk(c){if(c.leaf!==undefined)order.push(c.leaf);else{walk(c.l);walk(c.r)}})(act[0]);
 return{order,root:act[0]};
}
function dendro(root,pos,hmax,len,horiz,x0,y0){
 /* pos: leaf -> 中心坐标；返回 SVG 路径 */
 let d="";
 function at(c){if(c.leaf!==undefined)return{p:pos[c.leaf],h:0};const a=at(c.l),b=at(c.r),hh=c.h/hmax*len;
  if(horiz)d+=`M${x0-a.h} ${a.p}H${x0-hh}V${b.p}H${x0-b.h}`;else d+=`M${a.p} ${y0-a.h}V${y0-hh}H${b.p}V${y0-b.h}`;
  return{p:(a.p+b.p)/2,h:hh}}
 if(root&&root.h!==undefined)at(root);return d;
}
function lerp(a,b,t){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);const c=[16,8,0].map(s=>Math.round(((pa>>s)&255)*(1-t)+((pb>>s)&255)*t));return"#"+c.map(v=>v.toString(16).padStart(2,"0")).join("")}
function hColor(v,clip){const t=Math.max(-1,Math.min(1,v/clip)),lo=$("hLo").value,mid=$("hMid").value,hi=$("hHi").value;return t<0?lerp(mid,lo,-t):lerp(mid,hi,t)}
function hSvg(){
 const sel=Hs.sel||[],sm=Hs.sm;if(sel.length<2)return null;
 const scale=$("hScale").value;let clip=+$("hClip").value||2;
 let M=sel.map(d=>{if(scale==="none")return d.lv.slice();const sd=Math.sqrt(d.vr)||1;return d.lv.map(x=>(x-d.mean)/sd)});
 let mid=0;if(scale==="none"){let mn=Infinity,mx=-Infinity;for(const r of M)for(const x of r){if(x<mn)mn=x;if(x>mx)mx=x}mid=(mn+mx)/2;clip=(mx-mn)/2||1;M=M.map(r=>r.map(x=>x-mid))}
 const cr=$("hCR").checked&&sel.length>2,cc=$("hCC").checked&&sm.length>2;
 const RC=cr?hclust(M):{order:sel.map((_,i)=>i)},CC=cc?hclust(sm.map((_,j)=>M.map(r=>r[j]))):{order:sm.map((_,j)=>j)};
 const ro=RC.order,co=CC.order;
 const W=+$("hW").value,fs=+$("hFs").value||11,it=$("hItal").checked,title=$("hTtl").value.trim();
 const names=$("hNames").checked&&sel.length<=120;
 const groups=[...new Set(sm.map(s=>s.group))];
 const dW=cr?46:0,lblW=names?Math.max(...sel.map(d=>tw(d.name,fs,it)))+8:0,legW=Math.max(70,...groups.map(g=>tw(g,fs)+26))+10;
 const L=8+dW,gw=W-L-lblW-legW-8,cw=gw/sm.length;
 const ch=names?Math.max(fs+3,10):Math.max(2,Math.min(12,420/sel.length));
 const cdH=cc?36:0,T=(title?fs*2.4:6)+cdH,gbH=12,top=T+gbH+3;
 const colLblH=Math.max(...sm.map(s=>tw(s.name,fs)))*0.75+12,lh0=Math.min(110,Math.max(60,ch*sel.length*0.4)),legEnd=top+fs+6+lh0+fs*1.6+6+groups.length*(fs+5)+10,H=Math.max(top+ch*sel.length+colLblH+8,legEnd);
 let o=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Math.ceil(H)}" width="${W}" height="${Math.ceil(H)}" font-family="${FONT}" font-size="${fs}"><rect width="${W}" height="${Math.ceil(H)}" fill="#fff"/>`;
 if(title)o+=`<text x="${L+gw/2}" y="${fs*1.6}" text-anchor="middle" font-size="${fs*1.25}" font-weight="bold" fill="#111">${esc(title)}</text>`;
 /* 分组色条 */
 co.forEach((j,x)=>{o+=`<rect x="${(L+x*cw).toFixed(2)}" y="${T}" width="${(cw+0.3).toFixed(2)}" height="${gbH}" fill="${GCOL[groups.indexOf(sm[j].group)%GCOL.length]}"/>`});
 /* 格子 */
 ro.forEach((i,y)=>co.forEach((j,x)=>{o+=`<rect x="${(L+x*cw).toFixed(2)}" y="${(top+y*ch).toFixed(2)}" width="${(cw+0.3).toFixed(2)}" height="${(ch+0.3).toFixed(2)}" fill="${hColor(M[i][j],clip)}"/>`}));
 o+=`<rect x="${L}" y="${top}" width="${gw.toFixed(2)}" height="${(ch*sel.length).toFixed(2)}" fill="none" stroke="#444" stroke-width="0.6"/>`;
 /* 树状图 */
 if(cr){const pos={};ro.forEach((i,y)=>pos[i]=top+(y+0.5)*ch);o+=`<path d="${dendro(RC.root,pos,RC.root.h||1,dW-6,true,L-3,0)}" fill="none" stroke="#333" stroke-width="0.7"/>`}
 if(cc){const pos={};co.forEach((j,x)=>pos[j]=L+(x+0.5)*cw);o+=`<path d="${dendro(CC.root,pos,CC.root.h||1,cdH-6,false,0,T-3)}" fill="none" stroke="#333" stroke-width="0.7"/>`}
 /* 行名、列名 */
 if(names)ro.forEach((i,y)=>{o+=`<text x="${L+gw+4}" y="${(top+(y+0.5)*ch+fs*0.35).toFixed(2)}" fill="#111"${it?' font-style="italic"':""}>${esc(sel[i].name)}</text>`});
 const yb=top+ch*sel.length+6;
 co.forEach((j,x)=>{const cx=L+(x+0.5)*cw;o+=`<text transform="translate(${cx.toFixed(2)} ${yb}) rotate(45)" fill="#111">${esc(sm[j].name)}</text>`});
 /* 图例 */
 const lx=W-legW+6;let ly=top;
 o+=`<text x="${lx}" y="${ly+fs}" fill="#111" font-weight="bold">${scale==="row"?"Z-score":TT("log2 表达")}</text>`;ly+=fs+6;
 const lh=Math.min(110,Math.max(60,ch*sel.length*0.4));
 o+=`<defs><linearGradient id="hg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${$("hLo").value}"/><stop offset="0.5" stop-color="${$("hMid").value}"/><stop offset="1" stop-color="${$("hHi").value}"/></linearGradient></defs>`;
 o+=`<rect x="${lx}" y="${ly}" width="12" height="${lh}" fill="url(#hg)" stroke="#999" stroke-width="0.5"/>`;
 const lab=v=>scale==="row"?String(v):(v+mid).toFixed(1);
 [[clip,0],[0,0.5],[-clip,1]].forEach(([v,t])=>{o+=`<text x="${lx+17}" y="${(ly+t*lh+fs*0.35).toFixed(1)}" fill="#222">${lab(scale==="row"?v:v)}</text>`});
 ly+=lh+fs*1.6;
 o+=`<text x="${lx}" y="${ly}" fill="#111" font-weight="bold">${TT("分组")}</text>`;ly+=6;
 groups.forEach((g,k)=>{ly+=fs+5;o+=`<rect x="${lx}" y="${ly-fs*0.8}" width="11" height="11" fill="${GCOL[k%GCOL.length]}"/><text x="${lx+16}" y="${ly}" fill="#222">${esc(g)}</text>`});
 Hs.out={ro,co,M,mid,scale};
 return o+"</svg>";
}
let hraf=0;function hDraw(err){cancelAnimationFrame(hraf);hraf=requestAnimationFrame(()=>{
 const s=err?null:hSvg();
 if(!s){$("hSheet").innerHTML=`<p style="color:#666;padding:40px;text-align:center">${esc(err||TT("至少需要 2 个基因才能画热图"))}</p>`;$("hStats").innerHTML="";return}
 $("hSheet").innerHTML=s;
 const groups=[...new Set(Hs.sm.map(x=>x.group))];
 $("hStats").innerHTML=`<span>${TT("<b>{0}</b> 个基因",Hs.sel.length)}</span><span>${TT("<b>{0}</b> 个样本",Hs.sm.length)}</span><span>${TT("{0} 个分组：{1}",groups.length,esc(groups.join(TT("、"))))}</span>`})}
$("hSvg").onclick=()=>{const s=hSvg();if(s)save("hExMsg","heatmap_"+fdate()+".svg",new Blob([s],{type:"image/svg+xml"}));track("export",{f:"svg",tool:"heatmap"})};
$("hPng").onclick=()=>{const s=hSvg();if(s)exportPng("hExMsg",s,"heatmap_"+fdate()+".png");track("export",{f:"png",tool:"heatmap"})};
$("hCsv").onclick=()=>{if(!Hs.out)return;const {ro,co,M,mid,scale}=Hs.out;
 const t="gene,"+co.map(j=>csvq(Hs.sm[j].name)).join(",")+"\n"+ro.map(i=>csvq(Hs.sel[i].name)+","+co.map(j=>(M[i][j]+(scale==="row"?0:mid)).toFixed(4)).join(",")).join("\n");
 save("hExMsg","heatmap_matrix_"+fdate()+".csv",new Blob(["\ufeff"+t],{type:"text/csv"}));track("export",{f:"csv",tool:"heatmap"})};
function setHPal(i){const p=HPAL[i];$("hLo").value=p[0];$("hMid").value=p[1];$("hHi").value=p[2]}
$("hPal").onchange=()=>{setHPal(+$("hPal").value);hDraw()};
$("hG").onchange=hBuild;$("hType").onchange=hBuild;
$("hSel").onchange=hPick;$("hN").oninput=hPick;$("hList").oninput=hPick;
for(const id of ["hClip","hTtl","hFs","hLo","hMid","hHi"])$(id).oninput=()=>hDraw();
for(const id of ["hScale","hCR","hCC","hNames","hItal","hW"])$(id).onchange=()=>hDraw();
bindDrop("hDrop","hFile",hRead);

/* ================= 标签页与投票 ================= */
const VOTES=["GSEA 图","从表达矩阵直接做差异分析","直接输入基因列表做 GO/KEGG 富集","小提琴图","弦图 / 网络图","生存曲线"];
let voted={};try{voted=JSON.parse(localStorage.getItem("vv")||"{}")}catch(_){}
function rv(){for(const el of document.querySelectorAll(".vote"))el.innerHTML=VOTES.map(v=>`<button class="btn${voted[v]?" on":""}" data-v="${v}">${voted[v]?"✓ ":""}${esc(TT(v))}</button>`).join("")}
for(const el of document.querySelectorAll(".vote"))el.onclick=e=>{const b=e.target.closest("button");if(!b)return;const v=b.dataset.v;voted[v]=!voted[v];if(voted[v])track("vote",{chart:v});try{localStorage.setItem("vv",JSON.stringify(voted))}catch(_){}rv()};
$("xhsGo").onclick=()=>track("xhs_click");
$("igGo").onclick=()=>track("ig_click");
$("xhsCopy").onclick=async()=>{try{await navigator.clipboard.writeText("629311186");setMsg("xhsMsg",TT("已复制，去小红书搜索就能找到"));track("xhs_copy")}catch(_){setMsg("xhsMsg",TT("复制失败，请手动记下号码"),"err")}};
function setLang(l){LANG=l;try{localStorage.setItem("lang",l)}catch(_){}applyStatic();rv();
 const dm=TT("当前为示例数据（模拟生成）");if(S.demo)setMsg("vMsg",dm);if(Hs.demo)setMsg("hMsg",dm);
 if(E.demo)setMsg("eMsg",dm);if(VN_DEMO)setMsg("vnMsg",dm);if($("eCat").options[0])$("eCat").options[0].textContent=TT("全部");
 if(S.head.length)maSetup(true);if(S.pts.length)vBuild();if(Hs.rows.length)hBuild();if(["venn","enrich"].includes(CUR))DRAW[CUR]();track("lang",{l})}
for(const b of document.querySelectorAll(".lang button"))b.onclick=()=>setLang(b.dataset.l);