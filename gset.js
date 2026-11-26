/* 本功能新增的译文（放这里，免得动 i18n.js） */
Object.assign(I18N,{
 "1. 数据来源":["1. Data source", "1. データの入力"],
 "我有富集结果表":["I have an enrichment table", "解析結果の表がある"],
 "我只有基因列表":["I only have a gene list", "遺伝子リストだけある"],
 "基因列表（换行、逗号或空格分隔）":["Gene list (one per line, or separated by commas/spaces)", "遺伝子リスト（改行・カンマ・スペース区切り）"],
 "基因集":["Gene sets", "遺伝子セット"],
 "GO 生物过程（BP）":["GO Biological Process (BP)", "GO 生物学的プロセス（BP）"],
 "GO 分子功能（MF）":["GO Molecular Function (MF)", "GO 分子機能（MF）"],
 "GO 细胞组分（CC）":["GO Cellular Component (CC)", "GO 細胞内局在（CC）"],
 "Reactome 通路":["Reactome pathways", "Reactome パスウェイ"],
 "GO 全部（BP+MF+CC）":["GO all (BP+MF+CC)", "GO すべて（BP+MF+CC）"],
 "通路至少命中几个基因":["Min. genes hit per term", "1 項目あたりの最小ヒット数"],
 "开始富集":["Run enrichment", "解析を実行"],
 "填入示例基因":["Load example genes", "サンプル遺伝子を入れる"],
 "请至少粘贴 3 个基因":["Please paste at least 3 genes", "遺伝子を 3 個以上貼り付けてください"],
 "正在载入基因集并计算 …":["Loading gene sets and computing …", "遺伝子セットを読み込んで計算中 …"],
 "基因集文件加载失败，请检查网络后重试":["Could not load the gene set file. Check your connection and try again.", "遺伝子セットファイルを読み込めませんでした。接続を確認して再試行してください。"],
 "基因集下载失败，请检查网络后重试":["Could not download the gene set. Check your connection and try again.", "遺伝子セットをダウンロードできませんでした。接続を確認して再試行してください。"],
 "浏览器版本太旧，无法解压基因集文件":["Your browser is too old to unpack the gene set file", "ブラウザのバージョンが古く、遺伝子セットを展開できません"],
 "没有富集到任何通路":["No enriched terms", "該当する項目はありません"],
 "没有富集到任何通路：可能是基因名没对上，或命中数门槛太高":["No terms were enriched: the gene names may not match, or the minimum-hit threshold is too high", "項目が得られませんでした：遺伝子名が一致していないか、最小ヒット数が高すぎる可能性があります"],
 "{0} 个基因里 {1} 个有注释 · 检验了 {2} 条通路 · FDR<0.05 的有 {3} 条":["{1} of {0} genes are annotated · {2} terms tested · {3} with FDR < 0.05", "{0} 個中 {1} 個に注釈あり · {2} 項目を検定 · FDR<0.05 は {3} 項目"],
 "计算失败":["Calculation failed", "計算に失敗しました"],
 "超几何检验 + BH 校正，背景是该基因集里所有有注释的基因。基因名不区分大小写；小鼠基因（如 Arg1）会按大写匹配人类同源基因，少数名字不同的会漏掉。基因列表不会上传，计算全在你的浏览器里完成。":["Hypergeometric test with BH correction; the background is every annotated gene in the chosen gene set. Gene names are case-insensitive: mouse symbols (e.g. Arg1) are matched to their human orthologues in upper case, so the few genes named differently will be missed. Your gene list is never uploaded — everything runs in your browser.", "超幾何検定と BH 補正を使います。背景は選んだ遺伝子セットに注釈のある全遺伝子です。遺伝子名は大文字小文字を区別しません：マウスの遺伝子（例：Arg1）は大文字に変換してヒトのオーソログに対応させるため、名前が異なる一部の遺伝子は外れます。遺伝子リストはアップロードされず、計算はすべてブラウザ内で行われます。"],
 "上传测序公司或论文给的表格，一分钟出发表级火山图、热图、PCA、富集气泡图等 10 种图；只有一串基因名也能直接做 GO / Reactome 富集。数据只在你的浏览器里处理，不会上传到任何服务器。":["Drop in the table from your sequencing provider or a paper and get publication-ready volcano plots, heatmaps, PCA, enrichment bubble plots and 6 more in about a minute. A plain list of gene names is enough to run GO / Reactome enrichment on its own. Everything is processed in your browser — nothing is uploaded to any server.", "シーケンス会社や論文の表をドロップするだけで、ボルケーノプロット・ヒートマップ・PCA・エンリッチメントバブルプロットなど 10 種類の図が 1 分で作れます。遺伝子名のリストだけでも GO / Reactome のエンリッチメント解析ができます。データはすべてブラウザ内で処理され、サーバーには送信されません。"]
});
/* ================= 基因列表 → GO / 通路富集（全部在浏览器里算） ================= */
const GSETS=[
 {k:"go_bp_hs",o:"BP",n:"GO 生物过程（BP）",lib:"GO_Biological_Process_2025"},
 {k:"go_mf_hs",o:"MF",n:"GO 分子功能（MF）",lib:"GO_Molecular_Function_2025"},
 {k:"go_cc_hs",o:"CC",n:"GO 细胞组分（CC）",lib:"GO_Cellular_Component_2025"},
 {k:"reactome_hs",o:"Reactome",n:"Reactome 通路",lib:"Reactome_Pathways_2024"}
];
const GOALL=["go_bp_hs","go_mf_hs","go_cc_hs"];
const GSCACHE={},GSCACHEV="pasero-gs-v1";
function gsFinish(d){
 if(d.v===2)for(const t of d.t){let p=0;t[2]=t[2].split(".").map(s=>(p+=parseInt(s,36)))}
 d.idx=new Map(d.g.map((s,i)=>[s,i]));
 return d;
}
/* 把 Enrichr 的 GMT 文本转成紧凑结构 */
function gsFromGmt(txt,meta){
 const terms=[];
 for(const line of txt.split("\n")){
  if(!line.trim())continue;
  const p=line.split("\t"),raw=p[0].trim();
  const gs=[];for(let i=1;i<p.length;i++){const g=p[i].split(",")[0].trim().toUpperCase();if(g)gs.push(g)}
  if(gs.length<5||gs.length>2000)continue;
  const m=raw.match(/^(.*?)\s*\((GO:\d+)\)\s*$/);
  terms.push([m?m[1]:raw, m?m[2]:"", [...new Set(gs)]]);
 }
 const uni=[...new Set(terms.flatMap(t=>t[2]))].sort(),ix=new Map(uni.map((s,i)=>[s,i]));
 return {v:1,name:meta.n,src:"Enrichr",g:uni,t:terms.map(t=>[t[0],t[1],t[2].map(g=>ix.get(g)).sort((a,b)=>a-b)])};
}
async function gsLoad(meta){
 const key=meta.k;
 if(GSCACHE[key])return GSCACHE[key];
 let box=null;
 try{box=await caches.open(GSCACHEV)}catch(_){}
 if(box){const hit=await box.match("gs/"+key);
  if(hit){try{return GSCACHE[key]=gsFinish(await hit.json())}catch(_){}}}
 let d=null;
 /* ① 本站自带的副本（有就用，快） */
 try{
  const r=await fetch("gs/"+key+".json.gz");
  if(r.ok){
   const buf=await r.arrayBuffer(),u=new Uint8Array(buf.slice(0,2));
   let txt;
   if(u[0]===0x1f&&u[1]===0x8b){
    if(!window.DecompressionStream)throw new Error(TT("浏览器版本太旧，无法解压基因集文件"));
    txt=await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
   }else txt=new TextDecoder().decode(buf);
   d=JSON.parse(txt);
  }
 }catch(_){}
 /* ② 回退：直接向 Enrichr 取 */
 if(!d){
  let txt;
  try{
   const r=await fetch("https://maayanlab.cloud/Enrichr/geneSetLibrary?mode=text&libraryName="+meta.lib);
   if(!r.ok)throw 0;
   txt=await r.text();
  }catch(_){throw new Error(TT("基因集下载失败，请检查网络后重试"))}
  if(!txt||txt.length<1000)throw new Error(TT("基因集下载失败，请检查网络后重试"));
  d=gsFromGmt(txt,meta);
 }
 if(box){try{await box.put("gs/"+key,new Response(JSON.stringify(d)))}catch(_){}}
 return GSCACHE[key]=gsFinish(d);
}
/* 超几何分布右尾：population N，成功 K，抽 n，命中至少 k */
let LF=null;
function logFact(n){
 if(!LF||LF.length<=n){const a=new Float64Array(n+1);const st=LF?LF.length:1;if(LF)a.set(LF);else a[0]=0;
  for(let i=Math.max(1,st);i<=n;i++)a[i]=a[i-1]+Math.log(i);LF=a}
 return LF[n];
}
function hyperUpper(k,K,n,N){
 if(k<=0)return 1;
 const hi=Math.min(K,n),lo=Math.max(k,n-(N-K));
 if(lo>hi)return 0;
 logFact(N);
 const base=LF[N]-LF[n]-LF[N-n];let s=0;
 for(let i=lo;i<=hi;i++){
  const lp=(LF[K]-LF[i]-LF[K-i])+(LF[N-K]-LF[n-i]-LF[N-K-n+i])-base;
  s+=Math.exp(lp);
 }
 return Math.min(1,Math.max(0,s));
}
function bh(ps){
 const m=ps.length,o=ps.map((p,i)=>[p,i]).sort((a,b)=>a[0]-b[0]),q=new Array(m);
 let prev=1;
 for(let r=m-1;r>=0;r--){const v=Math.min(prev,o[r][0]*m/(r+1));q[o[r][1]]=v;prev=v}
 return q;
}
function gsGenes(){
 return [...new Set($("egList").value.split(/[\s,，;；\t]+/).map(s=>s.trim().toUpperCase()).filter(Boolean))];
}
async function gsRun(){
 const want=gsGenes();
 if(want.length<3){setMsg("egMsg",TT("请至少粘贴 3 个基因"),"err");return}
 const pick=$("egDb").value,sets=pick==="all"?GSETS.filter(s=>GOALL.includes(s.k)):GSETS.filter(s=>s.k===pick);
 const minK=Math.max(1,+$("egMin").value||2);
 setMsg("egMsg",TT("正在载入基因集并计算 …"));
 $("egGo").disabled=true;
 try{
  const libs=[];for(const s of sets)libs.push([s,await gsLoad(s)]);
  const head=["ONTOLOGY","ID","Description","GeneRatio","BgRatio","pvalue","p.adjust","FoldEnrichment","Count","geneID"];
  const rows=[],ps=[];let hitAny=new Set();
  for(const [meta,d] of libs){
   const N=d.g.length;
   const inList=[];for(const g of want){const i=d.idx.get(g);if(i!==undefined)inList.push(i)}
   const n=inList.length;if(n<3)continue;
   inList.forEach(i=>hitAny.add(d.g[i]));
   const mark=new Uint8Array(N);inList.forEach(i=>mark[i]=1);
   for(const [name,id,gl] of d.t){
    const K=gl.length;let k=0;const hits=[];
    for(const i of gl)if(mark[i]){k++;hits.push(d.g[i])}
    if(k<minK)continue;
    const p=hyperUpper(k,K,n,N);
    const fe=(k/n)/(K/N);
    rows.push([meta.o,id,name,k+"/"+n,K+"/"+N,p.toExponential(3),"",fe.toFixed(3),String(k),hits.join("/")]);
    ps.push(p);
   }
  }
  if(!rows.length){setMsg("egMsg",TT("没有富集到任何通路：可能是基因名没对上，或命中数门槛太高"),"err");E.rows=[];blank("en",TT("没有富集到任何通路"));$("egGo").disabled=false;return}
  const q=bh(ps);rows.forEach((r,i)=>r[6]=q[i].toExponential(3));
  rows.sort((a,b)=>parseFloat(a[5])-parseFloat(b[5]));
  if(sets.length<2){head.shift();rows.forEach(r=>r.shift())}
  E.demo=false;eSet({head,rows});
  const sig=q.filter(v=>v<0.05).length;
  setMsg("egMsg",TT("{0} 个基因里 {1} 个有注释 · 检验了 {2} 条通路 · FDR<0.05 的有 {3} 条",want.length,hitAny.size,rows.length,sig),sig?"":"warn");
  $("eMsg").textContent="";
  track("enrich_run",{db:pick,n:want.length});
 }catch(e){setMsg("egMsg",(e&&e.message)||TT("计算失败"),"err")}
 $("egGo").disabled=false;
}
function gsMode(m){
 $("eModeFile").hidden=m!=="file";$("eModeList").hidden=m!=="list";
 for(const b of document.querySelectorAll("#eMode button"))b.classList.toggle("on",b.dataset.m===m);
}
(function(){
 const box=$("eMode");if(!box)return;
 box.onclick=e=>{const b=e.target.closest("button");if(b)gsMode(b.dataset.m)};
 $("egGo").onclick=gsRun;
 $("egDemo").onclick=()=>{$("egList").value=["TP53","MDM2","CDKN1A","BAX","BBC3","CASP3","CASP9","APAF1","BCL2","BCL2L1","ATM","CHEK2","RB1","E2F1","CCNE1","CDK2","CDK4","CCND1","MYC","FOS","JUN","EGFR","KRAS","BRAF","MAPK1","MAPK3","AKT1","PTEN","PIK3CA","MTOR","STAT3","IL6","TNF","NFKB1","RELA","IKBKB","TRAF2","FADD","CASP8","BID"].join("\n");gsMode("list")};
 gsMode("file");
})();

/* 这项已经做好了，从投票列表里去掉 */
(function(){const i=VOTES.indexOf("直接输入基因列表做 GO/KEGG 富集");if(i>=0){VOTES.splice(i,1);rv()}
 if(typeof LANG!=="undefined"&&LANG!=="zh")applyStatic();})();
