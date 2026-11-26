/* ===== v4：韦恩图表格上传入口与新文案 ===== */
Object.assign(I18N,{
"点击或拖入表格":["Click or drop a table","表をクリックまたはドロップ"],
"每一列是一组基因（例如论文里的差异基因列表）":["Each column is one gene list (e.g. DEG lists from a paper)","各列が 1 つの遺伝子リスト（論文の DEG リストなど）"],
"表格里没有找到基因名列":["No gene-name columns found in the table","表に遺伝子名の列が見つかりません"],
"表格列：{0}":["Table column: {0}","表の列：{0}"],
"已载入 {0}，找到 {1} 列基因名；可以在每组的「填入…」里换列":["Loaded {0}: {1} gene-name columns found. Switch columns via “Fill from…” for each list.","{0} を読み込み：遺伝子名の列が {1} 個見つかりました。各リストの「読み込み…」で列を切り替えられます。"]});
document.querySelector("#P-venn .ctl .pan .note").insertAdjacentHTML("afterend",'<div class="drop" id="vnDrop" style="padding:10px">点击或拖入表格<br>每一列是一组基因（例如论文里的差异基因列表）</div><input type="file" id="vnFile" accept=".xlsx,.xls,.csv,.tsv,.txt,.gz" hidden>');
/* ================= 共享：标签页、面板、导出 ================= */
const TABS=["volcano","ma","heatmap","pca","corr","box","venn","enrich"],MAT_T=["heatmap","pca","corr","box"];
const DRAW={volcano:()=>deDraw(),ma:()=>deDraw(),heatmap:e=>hDraw(e),pca:e=>pcDraw(e),corr:e=>crDraw(e),box:e=>bxDraw(e),venn:()=>vnDraw(),enrich:()=>enDraw()};
function show(t){if(!TABS.includes(t))t="volcano";CUR=t;
 for(const b of document.querySelectorAll(".tab"))b.classList.toggle("on",b.dataset.t===t);
 for(const x of TABS)$("P-"+x).hidden=x!==t;
 for(const sl of $("P-"+t).querySelectorAll(".slot"))sl.appendChild($(sl.dataset.s));
 DRAW[t]()}
function matDraw(err){if(MAT_T.includes(CUR))DRAW[CUR](err)}
for(const b of document.querySelectorAll(".tab"))b.onclick=()=>{try{location.hash=b.dataset.t}catch(_){}show(b.dataset.t);track("tab",{t:b.dataset.t})};
window.addEventListener("hashchange",()=>show(location.hash.slice(1)));
function blank(p,msg){$(p+"Sheet").innerHTML=`<p style="color:#666;padding:40px;text-align:center">${esc(msg)}</p>`;$(p+"Stats").innerHTML=""}
function bindExp(p,base,svgFn,csvFn){
 $(p+"SvgB").onclick=()=>{const s=svgFn();if(s){save(p+"ExMsg",base+"_"+fdate()+".svg",new Blob([s],{type:"image/svg+xml"}));track("export",{f:"svg",tool:base})}};
 $(p+"PngB").onclick=()=>{const s=svgFn();if(s){exportPng(p+"ExMsg",s,base+"_"+fdate()+".png");track("export",{f:"png",tool:base})}};
 $(p+"CsvB").onclick=()=>{const t=csvFn();if(t){save(p+"ExMsg",base+"_data_"+fdate()+".csv",new Blob(["﻿"+t],{type:"text/csv"}));track("export",{f:"csv",tool:base})}};
}
const svgOpen=(W,H,fs)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Math.ceil(H)}" width="${W}" height="${Math.ceil(H)}" font-family="${FONT}" font-size="${fs}"><rect width="${W}" height="${Math.ceil(H)}" fill="#fff"/>`;
const fmt=v=>Math.abs(v)>=1e4||(Math.abs(v)<1e-3&&v!==0)?v.toExponential(2):+v.toPrecision(4);
function ramp(st,t){t=Math.max(0,Math.min(1,t));const k=t*(st.length-1),i=Math.min(st.length-2,Math.floor(k));return lerp(st[i],st[i+1],k-i)}
function dark(hex){const v=parseInt(hex.slice(1),16);return((v>>16)*0.299+((v>>8)&255)*0.587+(v&255)*0.114)<140}
function groupsOf(sm){return[...new Set(sm.map(s=>s.group))]}
function topVar(n){let a=Hs.all.filter(d=>d.vr>0);const b=a.filter(d=>d.mean>=1);if(b.length>=Math.min(50,a.length))a=b;a=a.slice().sort((x,y)=>y.vr-x.vr);return n>0?a.slice(0,n):a}
function matReady(p){if(!Hs.all||!Hs.sm||Hs.sm.length<2){blank(p,TT("至少要勾选 2 个样本列"));return false}return true}
function legendGroups(o,groups,x,y,fs){o.s+=`<text x="${x}" y="${y}" fill="#111" font-weight="bold">${esc(TT("分组"))}</text>`;y+=6;
 groups.forEach((g,k)=>{y+=fs+5;o.s+=`<rect x="${x}" y="${y-fs*0.8}" width="11" height="11" fill="${GCOL[k%GCOL.length]}"/><text x="${x+16}" y="${y}" fill="#222">${esc(g)}</text>`});return y}

/* ================= MA 图 ================= */
const AVG_RE=/^(basemean|base[\s_.]?mean|aveexpr|ave[\s_.]?expr|logcpm|log[\s_.]?cpm|mean|average|mean[\s_.]?expr\w*|avg[\s_.]?expr\w*)$/i;
function sampleCols(h,rows,g){const sample=rows.slice(0,300);
 let c=h.map((x,i)=>i).filter(i=>i!==g&&!notSample(h[i])&&!AVG_RE.test(h[i].trim())&&sample.filter(r=>isNum(r[i])).length>=sample.length*0.9);
 const pref=c.filter(i=>/^(fpkm|tpm|rpkm|cpm)/i.test(h[i]));if(pref.length>=2)c=pref;
 const fi=+$("cF").value,pi=+$("cP").value;return c.filter(i=>i!==fi&&i!==pi)}
function maSetup(keep){const h=S.head,old=$("cA").value;S.smpCols=sampleCols(h,S.rows,+$("cG").value);const n=S.smpCols.length;
 $("cA").innerHTML=`<option value="">—</option>`+(n>=2?`<option value="smp">${esc(TT("用样本列计算平均值（{0} 列）",n))}</option>`:"")+h.map((x,i)=>`<option value="${i}">${esc(x)}</option>`).join("");
 if(keep&&old!==undefined&&[...$("cA").options].some(o=>o.value===old)){$("cA").value=old;return}
 const a=h.findIndex(x=>AVG_RE.test(x.trim()));$("cA").value=a>=0?String(a):n>=2?"smp":""}
function maCol(){const v=$("cA").value;S.alog=false;S.aname="";
 if(v==="")return()=>NaN;
 if(v==="smp"){const c=S.smpCols;S.aname=TT("平均表达量");return r=>{let s=0,n=0;for(const i of c){const x=parseFloat(r[i]);if(isFinite(x)){s+=x;n++}}return n?Math.log2(Math.max(s/n,0)+1):NaN}}
 const i=+v;S.aname=S.head[i]||"";S.alog=/log/i.test(S.aname)||/^aveexpr/i.test(S.aname)||S.rows.slice(0,500).some(r=>parseFloat(r[i])<0);
 return S.alog?r=>parseFloat(r[i]):r=>{const x=parseFloat(r[i]);return isFinite(x)&&x>=0?Math.log2(x+1):NaN}}
$("cA").onchange=vBuild;
bindExp("ma","MA_plot",()=>S.pts.some(d=>isFinite(d.a))?vSvg("ma"):null,()=>{vClassify();return"gene,log2FC,p,mean_expression,direction\n"+S.sig.map(d=>[csvq(d.g),d.fc,d.p,isFinite(d.a)?d.a.toFixed(4):"",d.c==="u"?"up":"down"].join(",")).join("\n")});

/* ================= 线性代数小工具 ================= */
function eigSym(A){const n=A.length,a=A.map(r=>r.slice()),V=a.map((_,i)=>a.map((_,j)=>i===j?1:0));
 for(let sw=0;sw<100;sw++){let off=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)off+=a[i][j]*a[i][j];if(off<1e-20)break;
  for(let p=0;p<n;p++)for(let q=p+1;q<n;q++){if(Math.abs(a[p][q])<1e-300)continue;
   const th=(a[q][q]-a[p][p])/(2*a[p][q]),t=(th>=0?1:-1)/(Math.abs(th)+Math.sqrt(th*th+1)),c=1/Math.sqrt(t*t+1),s=t*c;
   for(let k=0;k<n;k++){const x=a[k][p],y=a[k][q];a[k][p]=c*x-s*y;a[k][q]=s*x+c*y}
   for(let k=0;k<n;k++){const x=a[p][k],y=a[q][k];a[p][k]=c*x-s*y;a[q][k]=s*x+c*y}
   for(let k=0;k<n;k++){const x=V[k][p],y=V[k][q];V[k][p]=c*x-s*y;V[k][q]=s*x+c*y}}}
 const idx=[...Array(n).keys()].sort((i,j)=>a[j][j]-a[i][i]);return{val:idx.map(i=>Math.max(0,a[i][i])),vec:idx.map(i=>V.map(r=>r[i]))}}
function lgam(x){const c=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];let y=x,t=x+5.5;t-=(x+0.5)*Math.log(t);let s=1.000000000190015;for(const v of c)s+=v/++y;return-t+Math.log(2.5066282746310005*s/x)}
function betacf(a,b,x){let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;if(Math.abs(d)<1e-30)d=1e-30;d=1/d;let h=d;
 for(let m=1;m<=200;m++){const m2=2*m;let aa=m*(b-m)*x/((qam+m2)*(a+m2));d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;h*=d*c;
  aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<3e-12)break}return h}
function ibeta(a,b,x){if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(lgam(a+b)-lgam(a)-lgam(b)+a*Math.log(x)+b*Math.log(1-x));return x<(a+1)/(a+b+2)?bt*betacf(a,b,x)/a:1-bt*betacf(b,a,1-x)/b}
function welch(x,y){const n1=x.length,n2=y.length;if(n1<2||n2<2)return NaN;const m=a=>a.reduce((s,v)=>s+v,0)/a.length,va=(a,mu)=>a.reduce((s,v)=>s+(v-mu)**2,0)/(a.length-1);
 const m1=m(x),m2=m(y),v1=va(x,m1)/n1,v2=va(y,m2)/n2,se=v1+v2;if(se<=0)return m1===m2?1:0;const t=(m1-m2)/Math.sqrt(se),df=se*se/(v1*v1/(n1-1)+v2*v2/(n2-1));return ibeta(df/2,0.5,df/(df+t*t))}
const fmtP=p=>!isFinite(p)?"":p<0.001?"p < 0.001":"p = "+(p<0.01?p.toFixed(3):p.toFixed(2));

/* ================= PCA ================= */
let PC=null;
function pcCompute(){const sm=Hs.sm,n=sm.length,genes=topVar(+$("pcN").value),sc=$("pcScale").checked;
 const X=sm.map(()=>new Float64Array(genes.length));
 genes.forEach((d,j)=>{const sd=Math.sqrt(d.vr)||1;for(let i=0;i<n;i++)X[i][j]=sc?(d.lv[i]-d.mean)/sd:d.lv[i]-d.mean});
 const G=X.map(a=>X.map(b=>{let s=0;for(let k=0;k<a.length;k++)s+=a[k]*b[k];return s/(n-1)}));
 const {val,vec}=eigSym(G),tot=val.reduce((a,b)=>a+b,0)||1,k=Math.min(n-1,10);
 const scores=sm.map((_,i)=>vec.slice(0,k).map((v,c)=>v[i]*Math.sqrt(val[c]*(n-1))));
 return{k,pct:val.slice(0,k).map(v=>v/tot*100),scores,ng:genes.length}}
function pcAxes(k){for(const [id,def] of [["pcX",0],["pcY",1]]){const s=$(id),old=s.value;s.innerHTML=[...Array(k).keys()].map(i=>`<option value="${i}">PC${i+1}</option>`).join("");s.value=old!==""&&+old<k?old:String(Math.min(def,k-1))}}
function ellipse(pts){const n=pts.length;if(n<3)return null;const mx=pts.reduce((s,p)=>s+p[0],0)/n,my=pts.reduce((s,p)=>s+p[1],0)/n;
 let a=0,b=0,c=0;for(const [x,y] of pts){a+=(x-mx)**2;b+=(y-my)**2;c+=(x-mx)*(y-my)}a/=n-1;b/=n-1;c/=n-1;
 const tr=(a+b)/2,dt=Math.sqrt(((a-b)/2)**2+c*c),l1=tr+dt,l2=Math.max(tr-dt,0),th=0.5*Math.atan2(2*c,a-b),k=5.991;
 return[...Array(64).keys()].map(i=>{const t=i/64*2*Math.PI,u=Math.sqrt(k*l1)*Math.cos(t),v=Math.sqrt(k*l2)*Math.sin(t);return[mx+u*Math.cos(th)-v*Math.sin(th),my+u*Math.sin(th)+v*Math.cos(th)]})}
function pcSvg(){if(!PC)return null;const sm=Hs.sm,groups=groupsOf(sm),ix=+$("pcX").value,iy=+$("pcY").value;
 const [W,H]=$("pcSz").value.split("x").map(Number),fs=+$("pcFs").value||13,r=+$("pcPs").value,title=$("pcTtl").value.trim();
 const pts=PC.scores.map(s=>[s[ix],s[iy]]),ells=$("pcEll").checked?groups.map(g=>ellipse(pts.filter((_,i)=>sm[i].group===g))):[];
 const legW=Math.max(...groups.map(g=>tw(g,fs)+30),tw(TT("分组"),fs)+10)+14;
 const T=(title?fs*2.4:fs)+6,L=fs*4.6,B=fs*3.6,pw=W-L-legW-8,ph=H-T-B;
 let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;for(const set of [pts,...ells.filter(Boolean)])for(const [x,y] of set){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
 const px=(x1-x0)*0.08||1,py=(y1-y0)*0.08||1;x0-=px;x1+=px;y0-=py;y1+=py;
 const X=v=>L+(v-x0)/(x1-x0)*pw,Y=v=>T+ph-(v-y0)/(y1-y0)*ph;
 let o=svgOpen(W,H,fs);
 if(title)o+=`<text x="${L+pw/2}" y="${fs*1.6}" text-anchor="middle" font-size="${fs*1.25}" font-weight="bold" fill="#111">${esc(title)}</text>`;
 const xt=ticks(x0,x1,W<500?5:7),yt=ticks(y0,y1,6);
 o+=`<g stroke="#eee">`;for(const v of xt)o+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${T+ph}"/>`;for(const v of yt)o+=`<line x1="${L}" x2="${L+pw}" y1="${Y(v)}" y2="${Y(v)}"/>`;o+=`</g>`;
 if(x0<0&&x1>0)o+=`<line x1="${X(0)}" x2="${X(0)}" y1="${T}" y2="${T+ph}" stroke="#aaa" stroke-dasharray="4 4"/>`;
 if(y0<0&&y1>0)o+=`<line x1="${L}" x2="${L+pw}" y1="${Y(0)}" y2="${Y(0)}" stroke="#aaa" stroke-dasharray="4 4"/>`;
 ells.forEach((e,k)=>{if(e){const c=GCOL[k%GCOL.length];o+=`<path d="M${e.map(([x,y])=>X(x).toFixed(1)+" "+Y(y).toFixed(1)).join("L")}Z" fill="${c}" fill-opacity="0.12" stroke="${c}" stroke-width="1.2"/>`}});
 pts.forEach(([x,y],i)=>{o+=`<circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="${r}" fill="${GCOL[groups.indexOf(sm[i].group)%GCOL.length]}" stroke="#fff" stroke-width="1"/>`});
 o+=`<rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="none" stroke="#222"/>`;
 for(const v of xt)o+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T+ph}" y2="${T+ph+4}" stroke="#222"/><text x="${X(v)}" y="${T+ph+fs+6}" text-anchor="middle" fill="#222">${fmt(v)}</text>`;
 for(const v of yt)o+=`<line x1="${L-4}" x2="${L}" y1="${Y(v)}" y2="${Y(v)}" stroke="#222"/><text x="${L-7}" y="${Y(v)+fs*0.35}" text-anchor="end" fill="#222">${fmt(v)}</text>`;
 o+=`<text x="${L+pw/2}" y="${H-fs*0.7}" text-anchor="middle" fill="#111">PC${ix+1} (${PC.pct[ix].toFixed(1)}%)</text>`;
 o+=`<text transform="translate(${fs*1.2} ${T+ph/2}) rotate(-90)" text-anchor="middle" fill="#111">PC${iy+1} (${PC.pct[iy].toFixed(1)}%)</text>`;
 if($("pcLab").checked){const lf=fs*0.85,lb=pts.map(([x,y],i)=>{const w=tw(sm[i].name,lf)+4,h=lf*1.2,a=X(x),b=Y(y);return{t:sm[i].name,px:a,py:b,w,h,x:a,y:b-r-h/2-1}});
  placeLabels(lb,L,T,pw,ph,r);for(const a of lb)o+=`<text x="${a.x.toFixed(1)}" y="${(a.y+lf*0.35).toFixed(1)}" text-anchor="middle" font-size="${lf}" fill="#333" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">${esc(a.t)}</text>`}
 const ob={s:o};legendGroups(ob,groups,L+pw+18,T+fs,fs);return ob.s+"</svg>"}
function pcDraw(err){if(err){blank("pc",err);return}if(!matReady("pc"))return;
 if(Hs.sm.length<3){blank("pc",TT("PCA 至少需要 3 个样本"));return}
 PC=pcCompute();pcAxes(PC.k);if(PC.ng<2){blank("pc",TT("可用的基因太少"));return}
 $("pcSheet").innerHTML=pcSvg();
 $("pcStats").innerHTML=`<span>${TT("<b>{0}</b> 个样本",Hs.sm.length)}</span><span>${TT("用了 <b>{0}</b> 个基因",PC.ng)}</span><span>PC1 ${PC.pct[0].toFixed(1)}% · PC2 ${(PC.pct[1]||0).toFixed(1)}%</span>`}
for(const id of ["pcN","pcScale"])$(id).onchange=()=>pcDraw();
for(const id of ["pcX","pcY","pcEll","pcLab","pcSz"])$(id).onchange=()=>{if(PC)$("pcSheet").innerHTML=pcSvg()};
for(const id of ["pcPs","pcTtl","pcFs"])$(id).oninput=()=>{if(PC)$("pcSheet").innerHTML=pcSvg()};
bindExp("pc","PCA",()=>pcSvg(),()=>PC&&"sample,group,"+PC.pct.map((p,i)=>`PC${i+1} (${p.toFixed(2)}%)`).join(",")+"\n"+Hs.sm.map((s,i)=>[csvq(s.name),csvq(s.group),...PC.scores[i].map(v=>v.toFixed(5))].join(",")).join("\n"));

/* ================= 样本相关性 ================= */
let CR=null;
function rankArr(a){const idx=[...a.keys()].sort((i,j)=>a[i]-a[j]),r=new Float64Array(a.length);for(let i=0;i<idx.length;){let j=i;while(j+1<idx.length&&a[idx[j+1]]===a[idx[i]])j++;for(let k=i;k<=j;k++)r[idx[k]]=(i+j)/2+1;i=j+1}return r}
function crCompute(){const sm=Hs.sm,n=sm.length,genes=topVar(+$("crN").value),sp=$("crM").value==="spearman";
 let V=sm.map((_,i)=>Float64Array.from(genes,d=>d.lv[i]));if(sp)V=V.map(rankArr);
 const Z=V.map(v=>{const m=v.reduce((a,b)=>a+b,0)/v.length;let s=0;for(const x of v)s+=(x-m)**2;s=Math.sqrt(s)||1;return Float64Array.from(v,x=>(x-m)/s)});
 const R=Z.map(a=>Z.map(b=>{let s=0;for(let k=0;k<a.length;k++)s+=a[k]*b[k];return Math.max(-1,Math.min(1,s))}));
 const ord=$("crCl").checked&&n>2?hclust(Z.map(z=>Array.from(z))):{order:[...Array(n).keys()]};
 return{R,ord,ng:genes.length}}
const CRP=[["#ffffff","#fbd3c4","#e8857a","#c0392b","#7f1d1d"],null,["#440154","#3b528b","#21918c","#5ec962","#fde725"]];
function crColor(v,lo){const t=(v-lo)/(1-lo||1),p=+$("crPal").value;if(p===1)return t<0.5?lerp("#3b6fb6","#ffffff",t*2):lerp("#ffffff","#d6404e",(t-0.5)*2);return ramp(CRP[p],t)}
function crSvg(){if(!CR)return null;const sm=Hs.sm,n=sm.length,groups=groupsOf(sm),{R,ord}=CR,ro=ord.order;
 const W0=+$("crW").value,fs=+$("crFs").value||11,title=$("crTtl").value.trim(),cl=$("crCl").checked&&n>2&&ord.root;
 let lo=1;for(const r of R)for(const v of r)lo=Math.min(lo,v);lo=Math.floor(lo*100)/100;if(lo>=1)lo=0.99;
 const lblW=Math.max(...sm.map(s=>tw(s.name,fs)))+8,legW=Math.max(70,...groups.map(g=>tw(g,fs)+26))+10,dW=cl?40:0,gb=10;
 const L=8+dW+gb+3,cs=Math.max(8,Math.min(46,(W0-L-lblW-legW-10)/n)),T=(title?fs*2.4:8)+(cl?36:0)+gb+3,gw=cs*n,W=Math.ceil(L+gw+lblW+16+legW);
 const colLbl=Math.max(...sm.map(s=>tw(s.name,fs)))*0.75+12,H=Math.max(T+gw+colLbl+8,T+fs+6+120+fs*2+groups.length*(fs+5)+10);
 let o=svgOpen(W,H,fs);
 if(title)o+=`<text x="${L+gw/2}" y="${fs*1.6}" text-anchor="middle" font-size="${fs*1.25}" font-weight="bold" fill="#111">${esc(title)}</text>`;
 const gc=j=>GCOL[groups.indexOf(sm[j].group)%GCOL.length];
 ro.forEach((j,x)=>{o+=`<rect x="${(L+x*cs).toFixed(2)}" y="${T-gb-3}" width="${(cs+0.3).toFixed(2)}" height="${gb}" fill="${gc(j)}"/><rect x="${L-gb-3}" y="${(T+x*cs).toFixed(2)}" width="${gb}" height="${(cs+0.3).toFixed(2)}" fill="${gc(j)}"/>`});
 const showV=$("crVal").checked&&n<=16,vf=Math.min(fs*0.85,cs*0.32);
 ro.forEach((i,y)=>ro.forEach((j,x)=>{const c=crColor(R[i][j],lo);o+=`<rect x="${(L+x*cs).toFixed(2)}" y="${(T+y*cs).toFixed(2)}" width="${(cs+0.3).toFixed(2)}" height="${(cs+0.3).toFixed(2)}" fill="${c}"/>`;
  if(showV)o+=`<text x="${(L+(x+0.5)*cs).toFixed(2)}" y="${(T+(y+0.5)*cs+vf*0.35).toFixed(2)}" text-anchor="middle" font-size="${vf.toFixed(1)}" fill="${dark(c)?"#fff":"#222"}">${R[i][j].toFixed(2)}</text>`}));
 o+=`<rect x="${L}" y="${T}" width="${gw.toFixed(2)}" height="${gw.toFixed(2)}" fill="none" stroke="#444" stroke-width="0.6"/>`;
 if(cl){const pos={},pr={};ro.forEach((j,x)=>{pos[j]=L+(x+0.5)*cs;pr[j]=T+(x+0.5)*cs});
  o+=`<path d="${dendro(ord.root,pos,ord.root.h||1,30,false,0,T-gb-6)}" fill="none" stroke="#333" stroke-width="0.7"/>`;
  o+=`<path d="${dendro(ord.root,pr,ord.root.h||1,dW-6,true,L-gb-6,0)}" fill="none" stroke="#333" stroke-width="0.7"/>`}
 ro.forEach((j,y)=>{o+=`<text x="${L+gw+4}" y="${(T+(y+0.5)*cs+fs*0.35).toFixed(2)}" fill="#111">${esc(sm[j].name)}</text>`});
 ro.forEach((j,x)=>{o+=`<text transform="translate(${(L+(x+0.5)*cs).toFixed(2)} ${T+gw+6}) rotate(45)" fill="#111">${esc(sm[j].name)}</text>`});
 const lx=W-legW+6;let ly=T;const nm=$("crM").value==="spearman"?"Spearman r":"Pearson r";
 o+=`<text x="${lx}" y="${ly+fs}" fill="#111" font-weight="bold">${nm}</text>`;ly+=fs+6;
 const st=[0,0.25,0.5,0.75,1].map(t=>`<stop offset="${t}" stop-color="${crColor(1-t*(1-lo),lo)}"/>`).join("");
 o+=`<defs><linearGradient id="crg" x1="0" y1="0" x2="0" y2="1">${st}</linearGradient></defs><rect x="${lx}" y="${ly}" width="12" height="120" fill="url(#crg)" stroke="#999" stroke-width="0.5"/>`;
 [[1,0],[(1+lo)/2,0.5],[lo,1]].forEach(([v,t])=>{o+=`<text x="${lx+17}" y="${(ly+t*120+fs*0.35).toFixed(1)}" fill="#222">${v.toFixed(2)}</text>`});
 const ob={s:o};legendGroups(ob,groups,lx,ly+120+fs*1.8,fs);
 CR.lo=lo;return ob.s+"</svg>"}
function crDraw(err){if(err){blank("cr",err);return}if(!matReady("cr"))return;CR=crCompute();
 $("crSheet").innerHTML=crSvg();let mn=1,mi="";const sm=Hs.sm;
 sm.forEach((s,i)=>{const same=sm.map((t,j)=>j!==i&&t.group===s.group?CR.R[i][j]:NaN).filter(isFinite);if(same.length){const m=same.reduce((a,b)=>a+b,0)/same.length;if(m<mn){mn=m;mi=s.name}}});
 $("crStats").innerHTML=`<span>${TT("<b>{0}</b> 个样本",sm.length)}</span><span>${TT("用了 <b>{0}</b> 个基因",CR.ng)}</span>`+(mi?`<span>${TT("组内相关性最低：{0}（平均 r = {1}）",esc(mi),mn.toFixed(3))}</span>`:"")}
for(const id of ["crM","crN","crCl"])$(id).onchange=()=>crDraw();
for(const id of ["crVal","crPal","crW"])$(id).onchange=()=>{if(CR)$("crSheet").innerHTML=crSvg()};
for(const id of ["crTtl","crFs"])$(id).oninput=()=>{if(CR)$("crSheet").innerHTML=crSvg()};
bindExp("cr","sample_correlation",()=>crSvg(),()=>CR&&","+CR.ord.order.map(j=>csvq(Hs.sm[j].name)).join(",")+"\n"+CR.ord.order.map(i=>csvq(Hs.sm[i].name)+","+CR.ord.order.map(j=>CR.R[i][j].toFixed(4)).join(",")).join("\n"));

/* ================= 基因表达箱线图 ================= */
let BX=null;
function q7(s,p){const h=(s.length-1)*p,i=Math.floor(h);return s[i]+(s[Math.min(i+1,s.length-1)]-s[i])*(h-i)}
function bxData(){const sm=Hs.sm,groups=groupsOf(sm),m=new Map(Hs.all.map(d=>[d.name.toLowerCase(),d]));
 let want=$("bxG").value.split(/[\s,，;；]+/).filter(Boolean),auto=false;
 if(!want.length){want=(Hs.sel||[]).slice(0,6).map(d=>d.name);auto=true}
 const genes=[],miss=[];for(const w of want.slice(0,24)){const d=m.get(w.toLowerCase());if(d){if(!genes.includes(d))genes.push(d)}else miss.push(w)}
 setMsg("bxMsg",auto&&genes.length?TT("还没输入基因，先展示热图里的前 {0} 个",genes.length):miss.length?TT("没找到：{0}",miss.join(TT("、"))):"",miss.length&&!auto?"err":"");
 return{groups,genes,sm}}
function bxSvg(){if(!BX||!BX.genes.length)return null;const {groups,genes,sm}=BX;
 const C=Math.min(+$("bxC").value,genes.length),fs=+$("bxFs").value||11,it=$("bxIt").checked,bar=$("bxT").value==="bar",showPt=$("bxPt").checked,stat=$("bxSt").checked&&groups.length>=2,title=$("bxTtl").value.trim();
 const lw=Math.max(...groups.map(g=>tw(g,fs)))+12,rot=lw>110,gl=rot?(lw-12)*0.72+8:fs+8;
 const fw=Math.max(170,groups.length*Math.max(46,rot?46:lw)+fs*4.6),fh=200,rows=Math.ceil(genes.length/C),top=title?fs*2.6:6,cellH=fh+fs*2+gl+14;
 const W=Math.round(fw*C+10),H=top+rows*cellH;let o=svgOpen(W,H,fs);
 if(title)o+=`<text x="${W/2}" y="${fs*1.7}" text-anchor="middle" font-size="${fs*1.3}" font-weight="bold" fill="#111">${esc(title)}</text>`;
 const yl=Hs.type==="counts"?"log2(CPM + 1)":Hs.type==="norm"?TT("log2(表达量 + 1)"):TT("表达量");
 const rnd=seeded(5),csv=[];
 genes.forEach((d,gi)=>{const cx0=5+(gi%C)*fw,cy0=top+Math.floor(gi/C)*cellH,L=cx0+fs*4,R=cx0+fw-10,T=cy0+fs*2,B=T+fh,pw=R-L;
  const vals=groups.map(g=>sm.map((s,j)=>s.group===g?d.lv[j]:null).filter(v=>v!==null&&isFinite(v)));
  sm.forEach((s,j)=>csv.push([csvq(d.name),csvq(s.name),csvq(s.group),d.lv[j].toFixed(4)].join(",")));
  const ps=stat?vals.map((v,k)=>k?welch(vals[0],v):NaN):[];
  let lo=Infinity,hi=-Infinity;vals.forEach(v=>{for(const x of v){lo=Math.min(lo,x);hi=Math.max(hi,x)}});
  if(bar){vals.forEach(v=>{if(!v.length)return;const m=v.reduce((a,b)=>a+b,0)/v.length,sd=v.length>1?Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/(v.length-1)):0;hi=Math.max(hi,m+sd)});lo=Math.min(lo,0)}
  if(!isFinite(lo)){lo=0;hi=1}if(hi-lo<1e-9)hi=lo+1;
  const nst=ps.filter(isFinite).length,span=hi-lo,top2=hi+span*(0.06+0.13*nst),y0=bar?lo:lo-span*0.06;
  const Y=v=>B-(v-y0)/(top2-y0)*fh,bw=pw/groups.length,X=k=>L+bw*(k+0.5);
  o+=`<text x="${(L+R)/2}" y="${cy0+fs*1.2}" text-anchor="middle" font-weight="bold" fill="#111"${it?' font-style="italic"':""}>${esc(d.name)}</text>`;
  const yt=ticks(y0,hi,4);for(const v of yt)o+=`<line x1="${L}" x2="${R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#eee"/><line x1="${L-4}" x2="${L}" y1="${Y(v)}" y2="${Y(v)}" stroke="#222"/><text x="${L-6}" y="${Y(v)+fs*0.35}" text-anchor="end" fill="#222">${fmt(v)}</text>`;
  vals.forEach((v,k)=>{if(!v.length)return;const c=GCOL[k%GCOL.length],s=v.slice().sort((a,b)=>a-b),x=X(k),w=Math.min(bw*0.56,40);
   if(bar){const m=v.reduce((a,b)=>a+b,0)/v.length,sd=v.length>1?Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/(v.length-1)):0;
    o+=`<rect x="${x-w/2}" y="${Y(m)}" width="${w}" height="${Math.max(0,Y(y0)-Y(m))}" fill="${c}" fill-opacity="0.75" stroke="${c}"/>`;
    if(sd>0)o+=`<path d="M${x} ${Y(m+sd)}V${Y(m-sd)}M${x-w/5} ${Y(m+sd)}H${x+w/5}M${x-w/5} ${Y(m-sd)}H${x+w/5}" stroke="#222" fill="none"/>`}
   else{const q1=q7(s,0.25),q2=q7(s,0.5),q3=q7(s,0.75),iq=q3-q1,wl=s.find(z=>z>=q1-1.5*iq),wh=[...s].reverse().find(z=>z<=q3+1.5*iq);
    o+=`<path d="M${x} ${Y(wh)}V${Y(q3)}M${x} ${Y(q1)}V${Y(wl)}M${x-w/4} ${Y(wh)}H${x+w/4}M${x-w/4} ${Y(wl)}H${x+w/4}" stroke="#333" fill="none"/>`;
    o+=`<rect x="${x-w/2}" y="${Y(q3)}" width="${w}" height="${Math.max(1,Y(q1)-Y(q3))}" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="1.4"/><line x1="${x-w/2}" x2="${x+w/2}" y1="${Y(q2)}" y2="${Y(q2)}" stroke="${c}" stroke-width="2.2"/>`}
   if(showPt)for(const z of v)o+=`<circle cx="${(x+(rnd()-0.5)*w*0.6).toFixed(1)}" cy="${Y(z).toFixed(1)}" r="2.6" fill="${c}" stroke="#fff" stroke-width="0.6"/>`});
  let lv=0;ps.forEach((p,k)=>{if(!isFinite(p))return;const yy=Y(hi+span*(0.06+0.13*lv))-2;lv++;
   o+=`<path d="M${X(0)} ${yy+5}V${yy}H${X(k)}V${yy+5}" stroke="#444" fill="none"/><text x="${(X(0)+X(k))/2}" y="${yy-3}" text-anchor="middle" font-size="${fs*0.85}" fill="#222">${fmtP(p)}</text>`});
  o+=`<path d="M${L} ${T-4}V${B}H${R}" stroke="#222" fill="none"/>`;
  groups.forEach((g,k)=>{o+=rot?`<text transform="translate(${X(k)} ${B+fs*0.9}) rotate(35)" fill="#222">${esc(g)}</text>`:`<text x="${X(k)}" y="${B+fs+5}" text-anchor="middle" fill="#222">${esc(g)}</text>`});
  if(gi%C===0)o+=`<text transform="translate(${cx0+fs*1.1} ${(T+B)/2}) rotate(-90)" text-anchor="middle" fill="#111">${esc(yl)}</text>`});
 BX.csv="gene,sample,group,value\n"+csv.join("\n");return o+"</svg>"}
function bxDraw(err){if(err){blank("bx",err);return}if(!matReady("bx"))return;BX=bxData();
 if(!BX.genes.length){blank("bx",TT("请输入要画的基因"));return}
 $("bxSheet").innerHTML=bxSvg();$("bxStats").innerHTML=`<span>${TT("<b>{0}</b> 个基因",BX.genes.length)}</span><span>${TT("{0} 个分组：{1}",BX.groups.length,esc(BX.groups.join(TT("、"))))}</span>`+($("bxSt").checked&&BX.groups.length>=2?`<span>${esc(TT("Welch t 检验，每组与第一组比较，未做多重校正"))}</span>`:"")}
$("bxG").oninput=()=>bxDraw();
for(const id of ["bxT","bxPt","bxSt","bxIt","bxC"])$(id).onchange=()=>bxDraw();
for(const id of ["bxFs","bxTtl"])$(id).oninput=()=>{if(BX&&BX.genes.length)$("bxSheet").innerHTML=bxSvg()};
bindExp("bx","gene_expression",()=>bxSvg(),()=>BX&&BX.csv);

/* ================= 韦恩图 ================= */
const VPAL=[["#E64B35","#4DBBD5","#00A087"],["#e8857a","#7fa7d6","#8fcf9b"],["#D55E00","#0072B2","#009E73"]];
let VN=null;
function vnParse(k){const m=new Map();for(const w of $("vl"+k).value.split(/[\s,，;；]+/)){const t=w.trim();if(t&&!m.has(t.toLowerCase()))m.set(t.toLowerCase(),t)}return m}
function vnCompute(){const sets=["A","B","C"].map(k=>({k,name:$("vn"+k).value.trim()||k,m:vnParse(k)})).filter(s=>s.m.size);
 if(sets.length<2)return{sets,err:TT("至少需要 2 组基因")};
 const all=new Map();for(const s of sets)for(const [k,v] of s.m)if(!all.has(k))all.set(k,v);
 const reg=new Map();for(const [k,v] of all){const key=sets.map(s=>s.m.has(k)?1:0).join("");if(!reg.has(key))reg.set(key,[]);reg.get(key).push(v)}
 return{sets,all,reg}}
function vnSvg(){if(!VN||VN.err)return null;const {sets,all,reg}=VN,n=sets.length,W=+$("vnW").value,fs=+$("vnFs").value||14,title=$("vnTtl").value.trim(),pal=VPAL[+$("vnPal").value],pct=$("vnPct").checked;
 const top=title?fs*2.6:10,H=Math.round(W*(n===2?0.72:0.92))+top;let o=svgOpen(W,H,fs);
 if(title)o+=`<text x="${W/2}" y="${fs*1.7}" text-anchor="middle" font-size="${fs*1.25}" font-weight="bold" fill="#111">${esc(title)}</text>`;
 const cy0=top+(H-top)/2,r=W*(n===2?0.25:0.215),C=n===2?[[W/2-r*0.62,cy0+fs*0.6],[W/2+r*0.62,cy0+fs*0.6]]:[[W/2-r*0.6,cy0-r*0.28],[W/2+r*0.6,cy0-r*0.28],[W/2,cy0+r*0.76]];
 C.forEach(([x,y],i)=>{o+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${pal[i]}" fill-opacity="0.32" stroke="${pal[i]}" stroke-width="2"/>`});
 const O=[C.reduce((s,c)=>s+c[0],0)/n,C.reduce((s,c)=>s+c[1],0)/n],away=(p,d)=>{const dx=p[0]-O[0],dy=p[1]-O[1],l=Math.hypot(dx,dy)||1;return[p[0]+dx/l*d,p[1]+dy/l*d]};
 const pos={};
 if(n===2){pos["10"]=[C[0][0]-r*0.42,C[0][1]];pos["01"]=[C[1][0]+r*0.42,C[1][1]];pos["11"]=[W/2,C[0][1]]}
 else{pos["100"]=away(C[0],r*0.42);pos["010"]=away(C[1],r*0.42);pos["001"]=away(C[2],r*0.42);
  const mid=(i,j)=>[(C[i][0]+C[j][0])/2,(C[i][1]+C[j][1])/2];pos["110"]=away(mid(0,1),r*0.28);pos["101"]=away(mid(0,2),r*0.28);pos["011"]=away(mid(1,2),r*0.28);pos["111"]=O}
 const tot=all.size||1;
 for(const [k,[x,y]] of Object.entries(pos)){const c=(reg.get(k)||[]).length;o+=`<text x="${x.toFixed(1)}" y="${(y+fs*0.35-(pct?fs*0.5:0)).toFixed(1)}" text-anchor="middle" font-size="${fs*1.15}" font-weight="bold" fill="#111">${c}</text>`;
  if(pct)o+=`<text x="${x.toFixed(1)}" y="${(y+fs*1.15).toFixed(1)}" text-anchor="middle" font-size="${fs*0.8}" fill="#444">${(c/tot*100).toFixed(1)}%</text>`}
 sets.forEach((s,i)=>{const [x,y]=C[i];let lx,ly,an="middle";
  if(n===2){lx=x+(i?r*0.3:-r*0.3);ly=y-r-fs*0.7}else if(i<2){lx=x+(i?r*0.45:-r*0.45);ly=y-r-fs*0.6}else{lx=x;ly=y+r+fs*1.5}
  o+=`<text x="${lx}" y="${ly}" text-anchor="${an}" font-weight="bold" fill="${pal[i]}">${esc(s.name)} (${s.m.size})</text>`});
 return o+"</svg>"}
function vnDraw(){VN=vnCompute();if(VN.err){blank("vn",VN.err);return}
 $("vnSheet").innerHTML=vnSvg();const k=VN.sets.map(()=>1).join("");
 $("vnStats").innerHTML=`<span>${TT("合计 <b>{0}</b> 个不重复基因",VN.all.size)}</span><span>${TT("全部共有 <b>{0}</b> 个",(VN.reg.get(k)||[]).length)}</span>`}
for(const k of ["A","B","C"]){$("vl"+k).oninput=()=>{VN_DEMO=false;setMsg("vnMsg","");vnDraw()};$("vn"+k).oninput=vnDraw;
 $("vi"+k).onchange=()=>{const v=$("vi"+k).value;$("vi"+k).value="";if(!v)return;
  if(v.startsWith("c:")){vnFillCol(k,+v.slice(2));return}
  vClassify();
  const g=S.sig.filter(d=>v==="s"||d.c===v).map(d=>d.g);$("vl"+k).value=g.join("\n");
  $("vn"+k).value=TT({u:"上调",d:"下调",s:"差异基因"}[v]);VN_DEMO=false;setMsg("vnMsg",TT("已填入 {0} 个基因",g.length));vnDraw()}}
for(const id of ["vnPal","vnPct","vnW"])$(id).onchange=()=>{if(VN&&!VN.err)$("vnSheet").innerHTML=vnSvg()};
for(const id of ["vnTtl","vnFs"])$(id).oninput=()=>{if(VN&&!VN.err)$("vnSheet").innerHTML=vnSvg()};
bindExp("vn","venn",()=>vnSvg(),()=>{if(!VN||VN.err)return null;const h=VN.sets.map(s=>csvq(s.name));
 const rows=[];for(const [k,g] of VN.reg){const lab=VN.sets.filter((_,i)=>k[i]==="1").map(s=>s.name).join(" ∩ ")+(k.includes("0")?" only":"");for(const x of g)rows.push([csvq(x),...k.split(""),csvq(lab)].join(","))}
 return"gene,"+h.join(",")+",region\n"+rows.join("\n")});
let VN_DEMO=true,VNT=null;
function vnColVals(i){const m=new Map();for(const r of VNT.rows){const t=String(r[i]??"").trim();if(t&&!isNum(t)&&!m.has(t.toLowerCase()))m.set(t.toLowerCase(),t)}return[...m.values()]}
function vnFillCol(k,i){const g=vnColVals(i);$("vl"+k).value=g.join("\n");$("vn"+k).value=VNT.head[i]||k;VN_DEMO=false;setMsg("vnMsg",TT("已填入 {0} 个基因",g.length));vnDraw()}
async function vnRead(f){setMsg("vnMsg",TT("正在读取 {0} …",f.name));
 try{const T=await readAny(f);const score=s=>s.head.filter((h,i)=>s.rows.filter(r=>{const t=String(r[i]??"").trim();return t&&!isNum(t)}).length>=3).length;
  const sh=T.sheets.slice().sort((a,b)=>score(b)-score(a))[0];
  VNT={head:sh.head,rows:sh.rows};const cols=sh.head.map((h,i)=>i).filter(i=>vnColVals(i).length>=3);
  if(!cols.length){setMsg("vnMsg",TT("表格里没有找到基因名列"),"err");return}
  const opt=cols.map(i=>`<option value="c:${i}">${esc(TT("表格列：{0}",sh.head[i]||("#"+(i+1))))}</option>`).join("");
  for(const k of ["A","B","C"]){const s=$("vi"+k);s.querySelectorAll("option[value^='c:']").forEach(o=>o.remove());s.insertAdjacentHTML("beforeend",opt)}
  ["A","B","C"].forEach((k,j)=>{if(j<cols.length)vnFillCol(k,cols[j]);else{$("vl"+k).value="";$("vn"+k).value=k}});
  setMsg("vnMsg",TT("已载入 {0}，找到 {1} 列基因名；可以在每组的「填入…」里换列",T.name,cols.length));track("upload",{tool:"venn"});vnDraw()}
 catch(e){setMsg("vnMsg",e.message||TT("读取失败"),"err")}}
bindDrop("vnDrop","vnFile",vnRead);
function vnDemo(){const r=seeded(3),names=[];for(let i=0;i<4000;i++)names.push("Gene"+String(i).padStart(5,"0"));
 const A=names.filter(()=>r()<0.12),B=names.filter((_,i)=>A.includes(names[i])?r()<0.45:r()<0.05),Cc=names.filter((_,i)=>A.includes(names[i])||B.includes(names[i])?r()<0.3:r()<0.04);
 $("vlA").value=A.join("\n");$("vlB").value=B.join("\n");$("vlC").value=Cc.join("\n");$("vnA").value="RNA-seq";$("vnB").value="ChIP-seq";$("vnC").value="ATAC-seq";
 setMsg("vnMsg",TT("当前为示例数据（模拟生成）"))}

/* ================= 富集气泡图 ================= */
const E={head:[],rows:[]};
const EPAL=[["#3b6fb6","#9e8fc0","#d6404e"],["#440154","#3b528b","#21918c","#5ec962","#fde725"],["#3b0f70","#8c2981","#de4968","#fe9f6d","#fcfdbf"]];
function eFind(h,res,ex){for(const re of res){const i=h.findIndex((x,k)=>re.test(x.trim())&&!(ex||[]).includes(k));if(i>=0)return i}return-1}
function eNum(v){const s=String(v??"").trim();if(!s)return NaN;if(/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(s)){const [a,b]=s.split("/").map(Number);return b?a/b:NaN}return parseFloat(s.replace("%",""))}
function eCount(v){const s=String(v??"").trim();return s.includes("/")?parseFloat(s):parseFloat(s)}
function eDemo(){const r=seeded(17),T=[["GO:0007283","spermatogenesis","BP"],["GO:0007140","male meiotic nuclear division","BP"],["GO:0051321","meiotic cell cycle","BP"],["GO:0007129","homologous chromosome pairing at meiosis","BP"],["GO:0006397","mRNA processing","BP"],["GO:0000398","mRNA splicing, via spliceosome","BP"],["GO:0045087","innate immune response","BP"],["GO:0006954","inflammatory response","BP"],["GO:0007049","cell cycle","BP"],["GO:0006260","DNA replication","BP"],["GO:0006281","DNA repair","BP"],["GO:0030198","extracellular matrix organization","BP"],["GO:0000793","condensed chromosome","CC"],["GO:0000795","synaptonemal complex","CC"],["GO:0005654","nucleoplasm","CC"],["GO:0062023","collagen-containing extracellular matrix","CC"],["GO:0003682","chromatin binding","MF"],["GO:0003723","RNA binding","MF"],["GO:0008270","zinc ion binding","MF"],["GO:0005524","ATP binding","MF"]];
 const rows=T.map(([id,d,o],i)=>{const n=Math.round(8+r()*60),bg=Math.round(n*(4+r()*12)),p=Math.pow(10,-(2+r()*14)*(1-i/40));return[o,id,d,`${n}/412`,`${bg}/21033`,p.toExponential(3),Math.min(1,p*6).toExponential(3),Math.min(1,p*5).toExponential(3),String(n)]});
 eSet({head:["ONTOLOGY","ID","Description","GeneRatio","BgRatio","pvalue","p.adjust","qvalue","Count"],rows});E.demo=true;setMsg("eMsg",TT("当前为示例数据（模拟生成）"));$("eSheetBox").hidden=true}
function eSet(t){E.head=t.head;E.rows=t.rows;const h=t.head,opt=h.map((x,i)=>`<option value="${i}">${esc(x)}</option>`).join("");
 let ti=eFind(h,[/^description$/i,/^(term|term[\s_.]?name|pathway|go[\s_.]?term|kegg[\s_.]?pathway|name)$/i,/description|term|pathway/i]);
 if(ti<0)ti=h.findIndex((x,i)=>t.rows.slice(0,50).filter(r=>!isNum(r[i])&&String(r[i]).length>8).length>25);if(ti<0)ti=0;
 const pi=eFind(h,[/^(p\.adjust|padj|p[\s_.]?adj(usted)?|fdr|benjamini|adjusted[\s_.]?p[\s_.-]?value|q[\s_.-]?value|qvalue|log\(q[\s_.-]?value\))$/i,/adjust|fdr|benjamini|q.?val/i,/^(p[\s_.-]?value|pvalue|pval|logp|log\(p\))$/i,/p.?val|logp/i]);
 const ci=eFind(h,[/^(count|gene[\s_.]?count|overlap|#?genes?|hits?|#geneinGOandhitlist|interm_inlist|size)$/i,/count|overlap|hit/i],[]);
 const ca=eFind(h,[/^(ontology|category|onto|source|gs[\s_.]?category|type)$/i]);
 $("eT").innerHTML=opt;$("eT").value=ti;$("eP").innerHTML=opt;$("eP").value=Math.max(pi,0);
 $("eC").innerHTML=`<option value="">—</option>`+opt;$("eC").value=ci>=0?String(ci):"";
 const xs=[];h.forEach((x,i)=>{if(/^(generatio|gene[\s_.]?ratio|fold[\s_.]?enrichment|enrichment|rich[\s_.]?factor|richfactor|odds[\s_.]?ratio|combined[\s_.]?score|%|percent|z[\s_.]?score|count|nes)$/i.test(x.trim()))xs.push(i)});
 $("eX").innerHTML=xs.map(i=>`<option value="${i}">${esc(h[i])}</option>`).join("")+`<option value="nlp">-log10(${esc(h[Math.max(pi,0)]||"P")})</option>`+`<optgroup label="—">${opt}</optgroup>`;
 const pref=[/^gene[\s_.]?ratio$/i,/fold|enrich|rich/i,/odds/i,/^count$/i].map(re=>xs.find(i=>re.test(h[i].trim()))).find(i=>i!==undefined);$("eX").value=pref!==undefined?String(pref):"nlp";
 E.cat=ca;$("eCatBox").hidden=ca<0;
 if(ca>=0){const cats=[...new Set(t.rows.map(r=>String(r[ca]).trim()).filter(Boolean))];$("eCat").innerHTML=`<option value="">${esc(TT("全部"))}</option>`+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("")}
 enDraw()}
async function eRead(f){setMsg("eMsg",TT("正在读取 {0} …",f.name));E.demo=false;
 try{const T=await readAny(f);setupSheets("eSheetBox","eSh",T,t=>{eSet(t);setMsg("eMsg",TT("已载入 {0}，{1} 行",T.name,t.rows.length))},s=>(/term|description|pathway/i.test(s.head.join(" "))+/p.?val|adjust|fdr|benjamini|q.?val|logp/i.test(s.head.join(" ")))*1e7);track("upload",{tool:"enrich"})}
 catch(e){setMsg("eMsg",e.message||TT("读取失败"),"err")}}
let EN=null;
function enCompute(){const ti=+$("eT").value,pi=+$("eP").value,cv=$("eC").value,xv=$("eX").value,cat=$("eCat").value,ph=E.head[pi]||"",lg=/log/i.test(ph)&&!/fold/i.test(ph);
 let rows=E.rows.filter(r=>!cat||E.cat<0||String(r[E.cat]).trim()===cat).map(r=>{let p=parseFloat(r[pi]);if(lg)p=Math.pow(10,-Math.abs(p));
  const c=cv===""?NaN:eCount(r[+cv]),x=xv==="nlp"?-Math.log10(p):eNum(r[+xv]);return{t:String(r[ti]).trim().replace(/^[A-Za-z]+:?\d+[~:]\s*/,""),p,c,x}}).filter(d=>d.t&&isFinite(d.p)&&d.p>0&&isFinite(d.x));
 rows.sort((a,b)=>a.p-b.p);const N=Math.max(2,Math.min(60,+$("eN").value||15));rows=rows.slice(0,N).sort((a,b)=>b.x-a.x);
 const pn=lg?ph.replace(/^log\s*\(?\s*(.*?)\s*\)?$/i,"$1")||"P":ph;return{rows,xname:xv==="nlp"?`-log10(${pn})`:E.head[+xv]||"",pname:pn,cname:cv===""?"":E.head[+cv]}}
function enSvg(){if(!EN||!EN.rows.length)return null;const {rows,xname,pname,cname}=EN,W=+$("eW").value,fs=+$("eFs").value||12,title=$("eTtl").value.trim(),mx=+$("eLen").value||50,pal=EPAL[+$("ePal").value];
 const lab=rows.map(d=>d.t.length>mx?d.t.slice(0,mx-1)+"…":d.t),lw=Math.min(W*0.55,Math.max(...lab.map(t=>tw(t,fs)))+10);
 const rowH=Math.max(fs*1.9,18),legW=Math.max(96,tw("-log10("+pname+")",fs)+16),L=lw+8,T=(title?fs*2.6:10),pw=W-L-legW-16,ph=rowH*rows.length,H=T+ph+fs*3.8;
 let x0=Infinity,x1=-Infinity;for(const d of rows){x0=Math.min(x0,d.x);x1=Math.max(x1,d.x)}const pad=(x1-x0)*0.08||Math.abs(x1)*0.1||1;x0-=pad;x1+=pad;if(x0<0&&rows.every(d=>d.x>=0))x0=0;
 const nl=rows.map(d=>-Math.log10(d.p)),c0=Math.min(...nl),c1=Math.max(...nl),hasC=rows.some(d=>isFinite(d.c)),cs=rows.map(d=>d.c).filter(isFinite),s0=Math.min(...cs),s1=Math.max(...cs);
 const rMax=Math.min(rowH*0.48,12),rad=c=>!hasC||!isFinite(c)?rMax*0.7:s1===s0?rMax*0.7:3+(rMax-3)*Math.sqrt((c-s0)/(s1-s0)),col=v=>ramp(pal,c1===c0?1:(v-c0)/(c1-c0));
 const X=v=>L+(v-x0)/(x1-x0)*pw,Y=i=>T+rowH*(i+0.5);let o=svgOpen(W,H,fs);
 if(title)o+=`<text x="${L+pw/2}" y="${fs*1.7}" text-anchor="middle" font-size="${fs*1.25}" font-weight="bold" fill="#111">${esc(title)}</text>`;
 const xt=ticks(x0,x1,5);o+=`<g stroke="#eee">`;for(const v of xt)o+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${T+ph}"/>`;rows.forEach((_,i)=>{o+=`<line x1="${L}" x2="${L+pw}" y1="${Y(i)}" y2="${Y(i)}" stroke-dasharray="2 3"/>`});o+=`</g>`;
 rows.forEach((d,i)=>{o+=`<circle cx="${X(d.x).toFixed(1)}" cy="${Y(i).toFixed(1)}" r="${rad(d.c).toFixed(1)}" fill="${col(nl[i])}" stroke="#333" stroke-width="0.5"/>`;o+=`<text x="${L-6}" y="${Y(i)+fs*0.35}" text-anchor="end" fill="#111">${esc(lab[i])}</text>`});
 o+=`<rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="none" stroke="#222"/>`;
 for(const v of xt)o+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T+ph}" y2="${T+ph+4}" stroke="#222"/><text x="${X(v)}" y="${T+ph+fs+6}" text-anchor="middle" fill="#222">${fmt(v)}</text>`;
 o+=`<text x="${L+pw/2}" y="${T+ph+fs*2.9}" text-anchor="middle" fill="#111">${esc(xname)}</text>`;
 const lx=L+pw+16;let ly=T+fs;o+=`<text x="${lx}" y="${ly}" fill="#111" font-weight="bold">-log10(${esc(pname)})</text>`;ly+=8;
 const st=pal.map((c,i)=>`<stop offset="${i/(pal.length-1)}" stop-color="${c}"/>`).join("");
 o+=`<defs><linearGradient id="eng" x1="0" y1="1" x2="0" y2="0">${st}</linearGradient></defs><rect x="${lx}" y="${ly}" width="12" height="90" fill="url(#eng)" stroke="#999" stroke-width="0.5"/>`;
 o+=`<text x="${lx+17}" y="${ly+fs*0.35}" fill="#222">${fmt(c1)}</text><text x="${lx+17}" y="${ly+90+fs*0.35}" fill="#222">${fmt(c0)}</text>`;ly+=90+fs*2;
 if(hasC){o+=`<text x="${lx}" y="${ly}" fill="#111" font-weight="bold">${esc(cname)}</text>`;ly+=6;
  const vs=s1===s0?[s0]:[s0,Math.round((s0+s1)/2),s1];for(const v of vs){const rr=rad(v);ly+=Math.max(rr*2,fs)+4;o+=`<circle cx="${lx+rMax}" cy="${ly-rr}" r="${rr}" fill="#bbb" stroke="#333" stroke-width="0.5"/><text x="${lx+rMax*2+6}" y="${ly-rr+fs*0.35}" fill="#222">${fmt(v)}</text>`}}
 const need=ly+10;if(need>H)o=o.replace(new RegExp(`viewBox="0 0 ${W} ${Math.ceil(H)}" width="${W}" height="${Math.ceil(H)}"`),`viewBox="0 0 ${W} ${Math.ceil(need)}" width="${W}" height="${Math.ceil(need)}"`).replace(`<rect width="${W}" height="${Math.ceil(H)}" fill="#fff"/>`,`<rect width="${W}" height="${Math.ceil(need)}" fill="#fff"/>`);
 return o+"</svg>"}
function enDraw(){if(!E.rows.length){blank("en",TT("请上传富集分析结果表"));return}EN=enCompute();
 if(!EN.rows.length){blank("en",TT("选中的列里没有可画的数值，请检查通路名、P 值和横轴列"));return}
 $("enSheet").innerHTML=enSvg();$("enStats").innerHTML=`<span>${TT("显示 <b>{0}</b> 条通路",EN.rows.length)}</span><span>${TT("最显著：{0}",esc(EN.rows.slice().sort((a,b)=>a.p-b.p)[0].t))}</span>`}
for(const id of ["eT","eP","eC","eX","eCat"])$(id).onchange=enDraw;
for(const id of ["eN","eLen"])$(id).oninput=enDraw;
for(const id of ["ePal","eW"])$(id).onchange=()=>{if(EN&&EN.rows.length)$("enSheet").innerHTML=enSvg()};
for(const id of ["eTtl","eFs"])$(id).oninput=()=>{if(EN&&EN.rows.length)$("enSheet").innerHTML=enSvg()};
bindDrop("eDrop","eFile",eRead);
bindExp("en","enrichment_bubble",()=>enSvg(),()=>EN&&"term,"+csvq(EN.xname)+","+csvq(EN.cname||"count")+","+csvq(EN.pname)+"\n"+EN.rows.map(d=>[csvq(d.t),d.x,isFinite(d.c)?d.c:"",d.p].join(",")).join("\n"));

/* ===== v5：GEO RAW.tar / 多文件合并成矩阵 ===== */
Object.assign(I18N,{
"也可以拖入 GEO 的 _RAW.tar，或一次多选「每个样本一个」的文件，会自动合并成矩阵":["You can also drop a GEO _RAW.tar, or select several one-file-per-sample files at once; they are merged into a matrix automatically","GEO の _RAW.tar や、サンプルごとに分かれたファイルをまとめて選ぶと、自動で 1 つの行列に結合します"],
"正在合并 {0} 个文件 …":["Merging {0} file(s)…","{0} 個のファイルを結合中…"],
"已合并 {0} 个样本，{1} 个基因（取的数值列：{2}）":["Merged {0} samples, {1} genes (value column used: {2})","{0} サンプル・{1} 遺伝子を結合しました（使用した数値列：{2}）"],
"没有找到可以合并的表达量文件（需要至少 2 个样本）":["No mergeable expression files found (at least 2 samples needed)","結合できる発現量ファイルが見つかりません（2 サンプル以上が必要）"],
"这些文件的基因名对不上，没法合并":["Gene names in these files don't match, so they can't be merged","ファイル間で遺伝子名が一致しないため結合できません"],
"跳过 {0} 个文件：{1}":["Skipped {0} file(s): {1}","{0} 個のファイルをスキップ：{1}"],
"第 {0} 列":["column {0}","{0} 列目"],
"{0} 个文件":["{0} files","{0} 個のファイル"],
"文件里同时有 {0}，这次只用了 {1}":["The archive contains {0}; only {1} was used this time","{0} が混在しているため、今回は {1} のみ使用しました"]});
$("hFile").multiple=true;$("hFile").accept+=",.tar,.tgz";
$("hDrop").insertAdjacentHTML("beforeend",'<br><span style="font-size:12px;color:var(--mut)">也可以拖入 GEO 的 _RAW.tar，或一次多选「每个样本一个」的文件，会自动合并成矩阵</span>');
const isGz=b=>{const u=new Uint8Array(b,0,Math.min(2,b.byteLength));return u[0]===0x1f&&u[1]===0x8b};
async function gunzip(b){if(!window.DecompressionStream)throw new Error(TT("浏览器版本太旧，无法解压 .gz，请先解压再上传"));return new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()}
function untar(buf){const u=new Uint8Array(buf),td=new TextDecoder(),out=[];let o=0,ln=null;
 while(o+512<=u.length){const h=u.subarray(o,o+512);if(h.every(x=>x===0))break;
  const str=(a,b)=>td.decode(h.subarray(a,b)).split("\0")[0];let name=str(0,100);const pre=str(345,500);if(pre&&str(257,262)==="ustar")name=pre+"/"+name;
  const size=parseInt(str(124,136).trim()||"0",8)||0,type=String.fromCharCode(h[156]);o+=512;const data=buf.slice(o,o+size);o+=Math.ceil(size/512)*512;
  if(type==="L"){ln=td.decode(new Uint8Array(data)).split("\0")[0];continue}if(ln){name=ln;ln=null}
  if(type==="0"||type==="\0")out.push({name:name.split("/").pop(),buf:data})}
 return out}
function decodeAny(b){const u=new Uint8Array(b,0,Math.min(2,b.byteLength));if(u[0]===0xff&&u[1]===0xfe)return new TextDecoder("utf-16le").decode(b);if(u[0]===0xfe&&u[1]===0xff)return new TextDecoder("utf-16be").decode(b);return new TextDecoder().decode(b)}
const KIND=n=>{const m=n.toLowerCase().match(/(counts?|fpkm|rpkm|tpm|cpm)(?![a-z])/g);return m?m[m.length-1].replace(/s$/,""):""};
function smpName(fn){let s=fn.replace(/\.(gz|bz2)$/i,"");for(let k=0;k<3;k++)s=s.replace(/\.(txt|tsv|csv|tab|out|results|tabular|genes|isoforms|sf|quant|xls)$/i,"");
 s=s.replace(/^GSM\d+[_.-]*/i,"");for(let k=0;k<3;k++)s=s.replace(/[_.-]+(read[_.-]?|raw[_.-]?|gene[_.-]?)?(counts?|fpkm|rpkm|tpm|cpm|expression|expr|htseq|featurecounts|rsem|quant|abundance|genes?)$/i,"");return s||fn}
const VPREF=[/^(expected_count|est_counts|numreads|counts?|read_?counts?|raw_?counts?)$/i,/^tpm$/i,/^(fpkm|rpkm)$/i];
function oneSample(text,fn){
 const A=parseText(text).filter(r=>!/^#/.test(r[0]||""));if(A.length<20)return null;
 const hasHead=!A[0].slice(1).some(isNum),head=hasHead?A[0].map(String):A[0].map((_,i)=>i?"V"+i:"gene"),rows=hasHead?A.slice(1):A,S0=rows.slice(0,300);
 const gc=hasHead?guessGene(head):0;
 const cand=head.map((h,i)=>i).filter(i=>i!==gc&&S0.filter(r=>isNum(r[i])).length>=S0.length*0.9&&!(hasHead&&notSample(head[i])&&!VPREF.some(re=>re.test(head[i].trim()))));
 if(!cand.length)return null;
 let vc=-1;for(const re of VPREF){vc=cand.find(i=>re.test(head[i].trim()));if(vc!==undefined&&vc>=0)break;vc=-1}if(vc<0)vc=cand[cand.length-1];
 const map=new Map();for(const r of rows){const g=String(r[gc]??"").trim();if(!g||g.startsWith("__")||BADNAME.has(g.toLowerCase()))continue;const v=parseFloat(r[vc]);if(isFinite(v))map.set(g,(map.get(g)||0)+v)}
 return{map,col:hasHead?head[vc]:TT("第 {0} 列",vc+1),name:smpName(fn),kind:KIND(fn)||KIND(hasHead?head[vc]:"")}}
async function readMulti(files){
 let items=[];for(const f of files){let b=f.buf;if(/\.(tar|tgz)$|\.tar\.gz$/i.test(f.name)){if(isGz(b))b=await gunzip(b);items.push(...untar(b))}else items.push(f)}
 const skipped=[];items=items.filter(it=>{if(/\.(bw|bigwig|bam|bai|bed|bedgraph|wig|fastq|fq|h5|h5ad|loom|rds|rda|rdata|mtx|pdf|png|jpe?g|zip|xlsx?)(\.gz)?$/i.test(it.name)||!it.buf.byteLength){skipped.push(it.name);return false}return true});
 let S=[];for(const it of items){try{let b=it.buf;if(isGz(b))b=await gunzip(b);const s=oneSample(decodeAny(b),it.name);if(s&&s.map.size>=50)S.push(s);else skipped.push(it.name)}catch(_){skipped.push(it.name)}}
 const kinds={};for(const s of S)kinds[s.kind]=(kinds[s.kind]||0)+1;const ks=Object.keys(kinds);let mixed="";
 if(ks.length>1){const best=ks.sort((a,b)=>kinds[b]-kinds[a]||(a==="count"?-1:1))[0];mixed=TT("文件里同时有 {0}，这次只用了 {1}",ks.filter(Boolean).join(" / "),best||"?");S=S.filter(s=>s.kind===best)}
 if(S.length<2)throw new Error(TT("没有找到可以合并的表达量文件（需要至少 2 个样本）"));
 const seen={};for(const s of S){let n=s.name,k=2;while(seen[n.toLowerCase()])n=s.name+"_"+k++;seen[n.toLowerCase()]=1;s.name=n}
 const cnt=new Map();for(const s of S)for(const g of s.map.keys())cnt.set(g,(cnt.get(g)||0)+1);
 const keep=[];for(const [g,c] of cnt)if(c===S.length)keep.push(g);
 if(keep.length<50)throw new Error(TT("这些文件的基因名对不上，没法合并"));
 const head=["gene"].concat(S.map(s=>s.name)),rows=keep.map(g=>[g].concat(S.map(s=>String(s.map.get(g)))));
 const nm=files.length===1?files[0].name:TT("{0} 个文件",files.length);
 return{T:{name:nm,sheets:[{name:nm,head,rows}]},n:S.length,genes:keep.length,cols:[...new Set(S.map(s=>s.col))],kind:S[0].kind,skipped,mixed}}
async function hReadMany(fl){const fs=[...fl];if(fs.length===1&&!/\.(tar|tgz)$|\.tar\.gz$/i.test(fs[0].name))return hRead(fs[0]);
 setMsg("hMsg",TT("正在合并 {0} 个文件 …",fs.length));Hs.demo=false;
 try{const files=await Promise.all(fs.map(async f=>({name:f.name,buf:await f.arrayBuffer()})));const R=await readMulti(files),sep=LANG==="en"?". ":"。";
  setupSheets("hSheetBox","hSh",R.T,t=>hSet(t));
  const lab=R.kind?{count:"counts",fpkm:"FPKM",rpkm:"RPKM",tpm:"TPM",cpm:"CPM"}[R.kind]:R.cols.length<=2?R.cols.join(", "):R.cols[0]+" …";let m=TT("已合并 {0} 个样本，{1} 个基因（取的数值列：{2}）",R.n,R.genes,lab);if(R.mixed)m+=sep+R.mixed;
  if(R.skipped.length)m+=sep+TT("跳过 {0} 个文件：{1}",R.skipped.length,R.skipped.slice(0,5).join(", ")+(R.skipped.length>5?" …":""));
  setMsg("hMsg",m,R.skipped.length||R.mixed?"warn":"");track("upload",{tool:"heatmap",merged:R.n})}
 catch(e){setMsg("hMsg",e.message||TT("读取失败"),"err")}}
{const dz=$("hDrop"),fi=$("hFile");fi.onchange=()=>{if(fi.files.length)hReadMany(fi.files);fi.value=""};dz.ondrop=e=>{e.preventDefault();dz.classList.remove("on");if(e.dataTransfer.files.length)hReadMany(e.dataTransfer.files)}}

setPal(0);setHPal(0);applyStatic();rv();vDemo();hDemo();vnDemo();eDemo();show(location.hash.slice(1));
