/* ===== v6：单细胞 —— Marker 气泡图、细胞比例图 ===== */
Object.assign(I18N,{
"上传测序公司或论文给的表格，一分钟出发表级火山图、热图、PCA、富集气泡图等 10 种图。数据只在你的浏览器里处理，不会上传到任何服务器。":["Drop in the table from your sequencing provider or a paper and get publication-ready volcano plots, heatmaps, PCA, enrichment bubble plots and more (10 plot types) in a minute. Your data is processed only in your browser and never uploaded.","受託解析会社や論文の表をドロップするだけで、ボルケーノプロット・ヒートマップ・PCA・エンリッチメント図など 10 種類の論文用グラフを1分で作成。データはブラウザ内だけで処理され、サーバーには送信されません。"],
"单细胞气泡图":["scRNA dot plot","scRNA ドットプロット"],
"细胞比例图":["Cell proportions","細胞構成比"],
"1. Marker 基因表":["1. Marker gene table","1. マーカー遺伝子表"],
"Seurat FindAllMarkers、Scanpy rank_genes_groups 的结果，或 DotPlot()$data":["Seurat FindAllMarkers, Scanpy rank_genes_groups, or DotPlot()$data","Seurat FindAllMarkers・Scanpy rank_genes_groups の結果、または DotPlot()$data"],
"cluster / 细胞类型列":["Cluster / cell type column","クラスター／細胞種の列"],
"基因列":["Gene column","遺伝子の列"],
"颜色列":["Colour column","色の列"],
"大小列（表达比例）":["Size column (fraction expressing)","サイズの列（発現割合）"],
"校正 P 值列":["Adjusted P column","補正 P 値の列"],
"2. 选哪些基因":["2. Which genes","2. 表示する遺伝子"],
"每个 cluster 取前 N 个（按 log2FC）":["Top N per cluster (by log2FC)","クラスターごとの上位 N（log2FC 順）"],
"P 值阈值":["P cutoff","P 値の閾値"],
"或者直接指定基因（留空则自动选）":["Or list genes yourself (leave empty to pick automatically)","遺伝子を直接指定（空欄なら自動選択）"],
"每行一个基因，或用逗号、空格分隔":["One gene per line, or separated by commas/spaces","1 行に 1 遺伝子、またはカンマ・スペース区切り"],
"3. 外观":["3. Appearance","3. 外観"],
"基因放在":["Genes on","遺伝子の配置"],
"横轴（Seurat 默认）":["x axis (Seurat default)","横軸（Seurat 既定）"],
"纵轴":["y axis","縦軸"],
"配色方案":["Colour scheme","配色"],
"灰→红":["Grey → red","グレー→赤"],
"灰→蓝":["Grey → blue","グレー→青"],
"蓝→白→红":["Blue → white → red","青→白→赤"],
"图标题（可留空）":["Title (optional)","タイトル（空欄可）"],
"字号":["Font size","文字サイズ"],
"基因名用斜体":["Italic gene names","遺伝子名を斜体に"],
"导出 SVG（矢量）":["Export SVG (vector)","SVG で書き出し（ベクター）"],
"导出 PNG（高清）":["Export PNG (high-res)","PNG で書き出し（高解像度）"],
"导出作图数据":["Export plot data","作図データを書き出し"],
"表达比例":["Fraction expressing","発現割合"],
"没识别到 cluster 列或基因列，请在下面手动选择":["Couldn't detect the cluster or gene column; please pick them below","クラスター列または遺伝子列を認識できません。下で手動で選んでください"],
"没有满足条件的基因，试试放宽 P 值阈值":["No genes pass the filter; try a looser P cutoff","条件を満たす遺伝子がありません。P 値の閾値を緩めてください"],
"<b>{0}</b> 个基因":["<b>{0}</b> genes","遺伝子 <b>{0}</b> 個"],
"<b>{0}</b> 个 cluster":["<b>{0}</b> clusters","クラスター <b>{0}</b> 個"],
"Marker 表只记录了每个基因在它是 marker 的 cluster 里的数值，所以其他位置是空的。想要完整气泡图，可以导出 Seurat 的 DotPlot(obj, features)$data 再上传。":["A marker table only has values where a gene is a marker, so other cells stay empty. For a full dot plot, export Seurat's DotPlot(obj, features)$data and upload it.","マーカー表には各遺伝子がマーカーとなるクラスターの値しかないため、他の位置は空になります。完全なドットプロットには Seurat の DotPlot(obj, features)$data を書き出してアップロードしてください。"],
"1. 细胞数表":["1. Cell count table","1. 細胞数の表"],
"两种都行：样本 × 细胞类型的细胞数表，或每行一个细胞的 meta.data":["Either a sample × cell type count table, or meta.data with one row per cell","サンプル × 細胞種の細胞数表、または 1 行 1 細胞の meta.data のどちらでも可"],
"样本列":["Sample column","サンプルの列"],
"细胞类型列":["Cell type column","細胞種の列"],
"表格方向":["Table orientation","表の向き"],
"每行是一个样本":["Each row is a sample","各行が 1 サンプル"],
"每行是一种细胞":["Each row is a cell type","各行が 1 細胞種"],
"2. 显示方式":["2. Display","2. 表示"],
"纵轴":["y axis","縦軸"],
"百分比":["Percentage","割合（%）"],
"细胞数":["Cell count","細胞数"],
"柱子方向":["Bar direction","棒の向き"],
"竖着":["Vertical","縦"],
"横着":["Horizontal","横"],
"在柱子上标百分比（≥5%）":["Label percentages on bars (≥5%)","棒に割合を表示（5% 以上）"],
"细胞类型按总数排序":["Sort cell types by total","細胞種を総数順に並べる"],
"宽度":["Width","幅"],
"细胞比例 (%)":["Cell proportion (%)","細胞の割合 (%)"],
"细胞类型":["Cell type","細胞種"],
"<b>{0}</b> 个样本":["<b>{0}</b> samples","<b>{0}</b> サンプル"],
"<b>{0}</b> 种细胞":["<b>{0}</b> cell types","細胞種 <b>{0}</b> 種"],
"共 <b>{0}</b> 个细胞":["<b>{0}</b> cells in total","合計 <b>{0}</b> 細胞"],
"已按每行一个细胞统计：{0} 个细胞":["Counted as one row per cell: {0} cells","1 行 1 細胞として集計：{0} 細胞"],
"按分组合并（可选）":["Combine samples by group (optional)","グループでまとめる（任意）"],
"不合并":["Don't combine","まとめない"],
"没有找到细胞数":["No cell counts found","細胞数が見つかりません"],
"表格里需要至少一列文字（样本或细胞类型）和数值列":["The table needs at least one text column (sample or cell type) plus numeric columns","サンプルまたは細胞種の文字列の列と、数値の列が必要です"]});

/* ---------- 界面 ---------- */
(function(){
 const nav=document.querySelector("nav.tabs");
 nav.insertAdjacentHTML("beforeend",'<button class="tab" data-t="dot">单细胞气泡图</button><button class="tab" data-t="prop">细胞比例图</button>');
 const exp=p=>`<div class="exp"><button class="btn pri" id="${p}SvgB">导出 SVG（矢量）</button><button class="btn" id="${p}PngB">导出 PNG（高清）</button><button class="btn" id="${p}CsvB">导出作图数据</button></div><div class="msg" id="${p}ExMsg"></div>`;
 const fig=p=>`<section class="figbox"><div class="sheet" id="${p}Sheet"></div><div class="stats" id="${p}Stats"></div>${exp(p)}</section>`;
 const last=document.getElementById("P-enrich");
 last.insertAdjacentHTML("afterend",`
<main class="wrap" id="P-dot" hidden>${fig("dt")}
<section class="ctl">
<div class="pan"><h2>1. Marker 基因表</h2>
<div class="drop" id="dtDrop">点击或拖入文件<br>Seurat FindAllMarkers、Scanpy rank_genes_groups 的结果，或 DotPlot()$data</div>
<input type="file" id="dtFile" accept=".xlsx,.xls,.csv,.tsv,.txt,.gz" hidden>
<div class="msg" id="dtMsg"></div>
<div id="dtSheetBox" hidden><label for="dtSh">工作表</label><select id="dtSh"></select></div>
<div class="row"><div><label for="dtCl">cluster / 细胞类型列</label><select id="dtCl"></select></div><div><label for="dtG">基因列</label><select id="dtG"></select></div></div>
<div class="row"><div><label for="dtF">颜色列</label><select id="dtF"></select></div><div><label for="dtPc">大小列（表达比例）</label><select id="dtPc"></select></div></div>
<label for="dtP">校正 P 值列</label><select id="dtP"></select>
</div>
<div class="pan"><h2>2. 选哪些基因</h2>
<div class="row"><div><label for="dtN">每个 cluster 取前 N 个（按 log2FC）</label><input type="number" id="dtN" value="4" min="1" max="30"></div><div><label for="dtPt">P 值阈值</label><input type="number" id="dtPt" value="0.05" step="0.01" min="0" max="1"></div></div>
<label for="dtGenes">或者直接指定基因（留空则自动选）</label><textarea id="dtGenes" placeholder="每行一个基因，或用逗号、空格分隔"></textarea>
<div class="msg" id="dtGMsg"></div>
</div>
<div class="pan"><h2>3. 外观</h2>
<div class="row"><div><label for="dtOr">基因放在</label><select id="dtOr"><option value="x">横轴（Seurat 默认）</option><option value="y">纵轴</option></select></div>
<div><label for="dtPal">配色方案</label><select id="dtPal"><option value="0">灰→红</option><option value="1">灰→蓝</option><option value="2">蓝→白→红</option></select></div></div>
<label for="dtTtl">图标题（可留空）</label><input type="text" id="dtTtl" value="">
<div class="row"><div><label for="dtFs">字号</label><input type="number" id="dtFs" value="12" min="8" max="22"></div><div><label class="chk" style="margin-top:22px"><input type="checkbox" id="dtIt" checked>基因名用斜体</label></div></div>
</div>
<div class="slot" data-s="pVote"></div>
</section></main>
<main class="wrap" id="P-prop" hidden>${fig("pp")}
<section class="ctl">
<div class="pan"><h2>1. 细胞数表</h2>
<div class="drop" id="ppDrop">点击或拖入文件<br>两种都行：样本 × 细胞类型的细胞数表，或每行一个细胞的 meta.data</div>
<input type="file" id="ppFile" accept=".xlsx,.xls,.csv,.tsv,.txt,.gz" hidden>
<div class="msg" id="ppMsg"></div>
<div id="ppSheetBox" hidden><label for="ppSh">工作表</label><select id="ppSh"></select></div>
<div id="ppLongBox" hidden><div class="row"><div><label for="ppS">样本列</label><select id="ppS"></select></div><div><label for="ppC">细胞类型列</label><select id="ppC"></select></div></div><label for="ppG">按分组合并（可选）</label><select id="ppG"></select></div>
<div id="ppWideBox"><label for="ppTr">表格方向</label><select id="ppTr"><option value="s">每行是一个样本</option><option value="c">每行是一种细胞</option></select></div>
</div>
<div class="pan"><h2>2. 显示方式</h2>
<div class="row"><div><label for="ppY">纵轴</label><select id="ppY"><option value="pct">百分比</option><option value="n">细胞数</option></select></div>
<div><label for="ppOr">柱子方向</label><select id="ppOr"><option value="v">竖着</option><option value="h">横着</option></select></div></div>
<label class="chk"><input type="checkbox" id="ppLab" checked>在柱子上标百分比（≥5%）</label>
<label class="chk"><input type="checkbox" id="ppSort">细胞类型按总数排序</label>
<label for="ppPal">配色方案</label><select id="ppPal"><option value="0">期刊风（NPG）</option><option value="1">柔和</option><option value="2">色盲友好</option></select>
<label for="ppTtl">图标题（可留空）</label><input type="text" id="ppTtl" value="">
<div class="row"><div><label for="ppW">宽度</label><select id="ppW"><option value="480">480</option><option value="600" selected>600</option><option value="760">760</option></select></div><div><label for="ppFs">字号</label><input type="number" id="ppFs" value="12" min="8" max="22"></div></div>
</div>
<div class="slot" data-s="pVote"></div>
</section></main>`);
 TABS.push("dot","prop");
 for(const b of nav.querySelectorAll('.tab[data-t="dot"],.tab[data-t="prop"]'))b.onclick=()=>{try{location.hash=b.dataset.t}catch(_){}show(b.dataset.t);track("tab",{t:b.dataset.t})};
})();

/* ---------- 单细胞气泡图 ---------- */
const DT={head:[],rows:[]};let DTR=null;
function capSvg(id){const s=$(id).querySelector("svg");if(s){s.style.maxWidth=Math.round(+s.getAttribute("width")*1.35)+"px";s.style.margin="0 auto"}}
const DPAL=[["#e8e8e8","#fcbba1","#fb6a4a","#cb181d","#67000d"],["#e8e8e8","#c6dbef","#6baed6","#2171b5","#08306b"],["#2166ac","#92c5de","#f7f7f7","#f4a582","#b2182b"]];
const scFind=(h,res,ex)=>{for(const re of res){const i=h.findIndex((x,k)=>re.test(String(x).trim())&&!(ex||[]).includes(k));if(i>=0)return i}return-1};
const CL_RE=[/^(cell[\s_.]?types?|cell[\s_.]?type[\s_.]?annotation|annotation|cell[\s_.]?label|major[\s_.]?celltype|predicted\.id)$/i,/^(cluster|clusters|ident|id|group|seurat_clusters)$/i,/cell.?type|annot/i,/cluster|ident/i];
function dtDemo(){const r=seeded(23),M={"T cell":["CD3D","CD3E","IL7R","CCR7","LEF1"],"NK":["GNLY","NKG7","GZMB","PRF1","KLRD1"],"B cell":["MS4A1","CD79A","CD79B","BANK1","CD19"],"CD14 Mono":["CD14","LYZ","S100A8","S100A9","FCN1"],"FCGR3A Mono":["FCGR3A","MS4A7","LST1","AIF1","CDKN1C"],"DC":["FCER1A","CST3","CLEC10A","CD1C","HLA-DQA1"],"Platelet":["PPBP","PF4","GP9","ITGA2B","TUBB1"]};
 const share={"DC":["LYZ","AIF1","LST1"],"FCGR3A Mono":["CST3","LYZ"],"CD14 Mono":["CST3","AIF1"],"NK":["CD3D"],"T cell":["NKG7"]};
 const rows=[];for(const [c,gs] of Object.entries(M)){gs.forEach((g,i)=>{const fc=3.6-i*0.45+r()*0.6,p1=0.98-i*0.07-r()*0.08,p=Math.pow(10,-(40+r()*200));rows.push([g,c,fc.toFixed(3),p1.toFixed(3),(r()*0.12).toFixed(3),p.toExponential(2)])});
  for(const g of share[c]||[])rows.push([g,c,(0.6+r()*1.2).toFixed(3),(0.45+r()*0.4).toFixed(3),(0.3+r()*0.3).toFixed(3),Math.pow(10,-(5+r()*40)).toExponential(2)])}
 dtSet({head:["gene","cluster","avg_log2FC","pct.1","pct.2","p_val_adj"],rows});DT.demo=true;setMsg("dtMsg",TT("当前为示例数据（模拟生成）"));$("dtSheetBox").hidden=true}
function dtSet(t){DT.head=t.head;DT.rows=t.rows;const h=t.head.map(String),opt=h.map((x,i)=>`<option value="${i}">${esc(x)}</option>`).join(""),none=`<option value="">—</option>`;
 let g=scFind(h,[/^(features\.plot|names)$/i,/^(gene[\s_.]?name|symbol|gene[\s_.]?symbol|feature|features)$/i,/^(gene|genes)$/i]);
 let cl=scFind(h,CL_RE,[g]);if(g<0)g=guessGene(h,[cl]);
 const f=scFind(h,[/^avg\.exp\.scaled$/i,/^(avg_log2fc|avg_logfc|logfoldchanges|log2fc|logfc|log2foldchange|avg\.exp)$/i,/log2?f|fold/i]);
 const pc=scFind(h,[/^(pct\.1|pct\.exp|pct_nz_group|pct1|pct\.in|pct_in|percent|pct)$/i,/pct|percent/i]);
 const p=scFind(h,[/^(p_val_adj|pvals_adj|padj|p\.adj|fdr|qval|q_value)$/i,/adj|fdr/i]);
 $("dtCl").innerHTML=none+opt;$("dtG").innerHTML=none+opt;$("dtF").innerHTML=opt;$("dtPc").innerHTML=none+opt;$("dtP").innerHTML=none+opt;
 $("dtCl").value=cl>=0?String(cl):"";$("dtG").value=g>=0?String(g):"";$("dtF").value=String(Math.max(f,0));$("dtPc").value=pc>=0?String(pc):"";$("dtP").value=p>=0?String(p):"";
 dtDraw()}
async function dtRead(f){setMsg("dtMsg",TT("正在读取 {0} …",f.name));DT.demo=false;
 try{const T=await readAny(f);setupSheets("dtSheetBox","dtSh",T,t=>{dtSet(t);setMsg("dtMsg",TT("已载入 {0}，{1} 行",T.name,t.rows.length))},s=>(scFind(s.head,CL_RE)>=0)+(scFind(s.head,[/pct|log2?fc|logfold|avg\.exp/i])>=0));track("upload",{tool:"scdot"})}
 catch(e){setMsg("dtMsg",e.message||TT("读取失败"),"err")}}
function dtCompute(){const cv=$("dtCl").value,gv=$("dtG").value;if(cv===""||gv==="")return{err:TT("没识别到 cluster 列或基因列，请在下面手动选择")};
 const ci=+cv,gi=+gv,fi=+$("dtF").value,pci=$("dtPc").value===""?-1:+$("dtPc").value,pi=$("dtP").value===""?-1:+$("dtP").value,thr=+$("dtPt").value||1,N=Math.max(1,+$("dtN").value||4);
 const fname=DT.head[fi]||"",isFC=/fc|fold/i.test(fname)&&!/avg\.exp/i.test(fname);
 const recs=[];for(const r of DT.rows){const c=String(r[ci]??"").trim(),g=String(r[gi]??"").trim(),v=parseFloat(r[fi]);if(!c||!g||!isFinite(v))continue;
  const pct=pci>=0?parseFloat(r[pci]):NaN,p=pi>=0?parseFloat(r[pi]):NaN;recs.push({c,g,v,pct,p})}
 let pmax=0;for(const d of recs)if(isFinite(d.pct)&&d.pct>pmax)pmax=d.pct;const k100=pmax>1.5?100:1;for(const d of recs)d.pct=isFinite(d.pct)?d.pct/k100:NaN;
 let cls=[...new Set(recs.map(d=>d.c))];if(cls.every(c=>/^-?\d+$/.test(c)))cls.sort((a,b)=>a-b);
 const want=$("dtGenes").value.split(/[\s,，;；]+/).filter(Boolean);let genes=[],miss=[];const owner=new Map();
 if(want.length){const have=new Map();for(const d of recs)if(!have.has(d.g.toLowerCase()))have.set(d.g.toLowerCase(),d.g);for(const w of want){const g=have.get(w.toLowerCase());if(g){if(!genes.includes(g))genes.push(g)}else miss.push(w)}}
 else if(pi>=0||isFC){for(const c of cls){const top=recs.filter(d=>d.c===c&&(pi<0||!(d.p>thr))&&(!isFC||d.v>0)).sort((a,b)=>b.v-a.v);let n=0;for(const d of top){if(n>=N)break;if(!owner.has(d.g)){owner.set(d.g,c);genes.push(d.g);n++}}}}
 else{for(const d of recs)if(!genes.includes(d.g))genes.push(d.g);genes=genes.slice(0,80)}
 setMsg("dtGMsg",miss.length?TT("没找到：{0}",miss.join(TT("、"))):"",miss.length?"err":"");
 if(!genes.length)return{err:TT("没有满足条件的基因，试试放宽 P 值阈值")};
 const gs=new Set(genes),cell=new Map();for(const d of recs)if(gs.has(d.g)){const k=d.g+"\u0001"+d.c,o=cell.get(k);if(!o||Math.abs(d.v)>Math.abs(o.v))cell.set(k,d)}
 const sparse=cell.size<genes.length*cls.length*0.6;
 return{cls,genes,cell,fname,pname:pci>=0?DT.head[pci]:"",hasPct:pci>=0,sparse,div:+$("dtPal").value===2||[...cell.values()].some(d=>d.v<0)&&/scaled/i.test(fname)}}
function dtSvg(){if(!DTR||DTR.err)return null;const {cls,genes,cell,fname,hasPct}=DTR,fs=+$("dtFs").value||12,it=$("dtIt").checked,title=$("dtTtl").value.trim(),gx=$("dtOr").value==="x";
 let pal=DPAL[+$("dtPal").value];const vals=[...cell.values()].map(d=>d.v);let v0=Math.min(...vals),v1=Math.max(...vals);
 const div=+$("dtPal").value===2;if(div){const m=Math.max(Math.abs(v0),Math.abs(v1))||1;v0=-m;v1=m}if(v1-v0<1e-9)v1=v0+1;
 const col=v=>ramp(pal,(v-v0)/(v1-v0));
 const step=Math.max(fs*1.55,16),rMax=step*0.44,rad=p=>!hasPct||!isFinite(p)?rMax*0.75:Math.max(0.8,rMax*Math.sqrt(Math.max(0,Math.min(1,p))));
 const X=gx?genes:cls,Y=gx?cls:genes,xit=gx&&it,yit=!gx&&it;
 const yLab=Math.max(...Y.map(s=>tw(s,fs,yit)))+10,xLab=Math.max(...X.map(s=>tw(s,fs,xit)))*0.75+14;
 const legW=Math.max(120,tw(fname,fs)+20,tw(TT("表达比例"),fs)+20);
 const L=yLab+6,T=(title?fs*2.6:10),pw=X.length*step,ph=Y.length*step,W=Math.ceil(L+pw+20+legW),H=Math.ceil(Math.max(T+ph+xLab+6,T+fs*2+90+fs*2+(hasPct?4*(rMax*2+6):0)+20));
 let o=svgOpen(W,H,fs);
 if(title)o+=`<text x="${(L+pw/2).toFixed(1)}" y="${fs*1.7}" text-anchor="middle" font-size="${fs*1.25}" font-weight="bold" fill="#111">${esc(title)}</text>`;
 o+=`<g stroke="#eee">`;X.forEach((_,i)=>{const x=L+(i+0.5)*step;o+=`<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${T}" y2="${T+ph}"/>`});Y.forEach((_,j)=>{const y=T+(j+0.5)*step;o+=`<line x1="${L}" x2="${L+pw}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/>`});o+=`</g>`;
 X.forEach((xv,i)=>Y.forEach((yv,j)=>{const g=gx?xv:yv,c=gx?yv:xv,d=cell.get(g+"\u0001"+c);if(!d)return;
  o+=`<circle cx="${(L+(i+0.5)*step).toFixed(1)}" cy="${(T+(j+0.5)*step).toFixed(1)}" r="${rad(d.pct).toFixed(2)}" fill="${col(d.v)}" stroke="#555" stroke-width="0.4"/>`}));
 o+=`<rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="none" stroke="#222"/>`;
 Y.forEach((s,j)=>{o+=`<text x="${L-6}" y="${(T+(j+0.5)*step+fs*0.35).toFixed(1)}" text-anchor="end" fill="#111"${yit?' font-style="italic"':""}>${esc(s)}</text>`});
 X.forEach((s,i)=>{const x=L+(i+0.5)*step;o+=`<text transform="translate(${(x+fs*0.3).toFixed(1)} ${T+ph+8}) rotate(45)" fill="#111"${xit?' font-style="italic"':""}>${esc(s)}</text>`});
 const lx=L+pw+20;let ly=T+fs;o+=`<text x="${lx}" y="${ly}" fill="#111" font-weight="bold">${esc(fname)}</text>`;ly+=8;
 const st=pal.map((c,i)=>`<stop offset="${i/(pal.length-1)}" stop-color="${c}"/>`).join("");
 o+=`<defs><linearGradient id="dtg" x1="0" y1="1" x2="0" y2="0">${st}</linearGradient></defs><rect x="${lx}" y="${ly}" width="12" height="90" fill="url(#dtg)" stroke="#999" stroke-width="0.5"/>`;
 o+=`<text x="${lx+17}" y="${ly+fs*0.35}" fill="#222">${fmt(v1)}</text><text x="${lx+17}" y="${ly+45+fs*0.35}" fill="#222">${fmt((v0+v1)/2)}</text><text x="${lx+17}" y="${ly+90+fs*0.35}" fill="#222">${fmt(v0)}</text>`;ly+=90+fs*2.2;
 if(hasPct){o+=`<text x="${lx}" y="${ly}" fill="#111" font-weight="bold">${esc(TT("表达比例"))}</text>`;ly+=4;
  for(const p of [0.25,0.5,0.75,1]){const rr=rad(p);ly+=rMax*2+6;o+=`<circle cx="${lx+rMax}" cy="${(ly-rMax).toFixed(1)}" r="${rr.toFixed(2)}" fill="#bbb" stroke="#555" stroke-width="0.4"/><text x="${lx+rMax*2+8}" y="${(ly-rMax+fs*0.35).toFixed(1)}" fill="#222">${p*100}%</text>`}}
 return o+"</svg>"}
function dtDraw(){if(!DT.rows.length){blank("dt","");return}DTR=dtCompute();if(DTR.err){blank("dt",DTR.err);return}
 $("dtSheet").innerHTML=dtSvg();capSvg("dtSheet");$("dtStats").innerHTML=`<span>${TT("<b>{0}</b> 个基因",DTR.genes.length)}</span><span>${TT("<b>{0}</b> 个 cluster",DTR.cls.length)}</span>`+(DTR.sparse&&!DT.demo?`<span>${esc(TT("Marker 表只记录了每个基因在它是 marker 的 cluster 里的数值，所以其他位置是空的。想要完整气泡图，可以导出 Seurat 的 DotPlot(obj, features)$data 再上传。"))}</span>`:"")}
for(const id of ["dtCl","dtG","dtF","dtPc","dtP","dtOr","dtPal","dtIt"])$(id).onchange=dtDraw;
for(const id of ["dtN","dtPt","dtGenes","dtTtl","dtFs"])$(id).oninput=dtDraw;
bindDrop("dtDrop","dtFile",dtRead);
bindExp("dt","scRNA_dotplot",()=>dtSvg(),()=>{if(!DTR||DTR.err)return null;const rows=[];for(const g of DTR.genes)for(const c of DTR.cls){const d=DTR.cell.get(g+"\u0001"+c);if(d)rows.push([csvq(g),csvq(c),d.v,isFinite(d.pct)?d.pct:""].join(","))}return"gene,cluster,"+csvq(DTR.fname)+",fraction\n"+rows.join("\n")});

/* ---------- 细胞比例图 ---------- */
const PP={head:[],rows:[]};let PPR=null;
const PPAL=[["#E64B35","#4DBBD5","#00A087","#3C5488","#F39B7F","#8491B4","#91D1C2","#DC0000","#7E6148","#B09C85","#FFDC91","#EE4C97","#6F99AD","#BC3C29","#0072B5","#20854E"],["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f","#a6cee3","#b2df8a","#fdbf6f","#cab2d6"],["#0072B2","#E69F00","#009E73","#CC79A7","#56B4E9","#D55E00","#F0E442","#000000","#999999","#882255","#44AA99","#117733","#332288","#DDCC77","#AA4499","#88CCEE"]];
const SMP_RE=[/^(sample|samples|orig\.ident|sample[\s_.]?id|donor|patient|condition|group|treatment|batch|library)$/i,/sample|orig|donor|patient|condition|group/i];
function ppDemo(){const r=seeded(31),ct=["T cell","NK","B cell","CD14 Mono","FCGR3A Mono","DC","Platelet"],base=[0.42,0.1,0.14,0.2,0.06,0.03,0.02],tr=[0.3,0.12,0.12,0.3,0.1,0.04,0.02];
 const rows=["Ctrl_1","Ctrl_2","Ctrl_3","Treat_1","Treat_2","Treat_3"].map((s,i)=>{const b=i<3?base:tr,n=2500+Math.round(r()*2500);return[s,...b.map(f=>String(Math.round(n*f*(0.85+r()*0.3))))]});
 ppSet({head:["sample"].concat(ct),rows});PP.demo=true;setMsg("ppMsg",TT("当前为示例数据（模拟生成）"));$("ppSheetBox").hidden=true}
function ppSet(t){PP.head=t.head.map(String);PP.rows=t.rows;const h=PP.head,S0=t.rows.slice(0,300);
 const num=h.map((_,i)=>S0.filter(r=>isNum(r[i])).length>=S0.length*0.9),cat=h.map((_,i)=>!num[i]&&new Set(t.rows.slice(0,5000).map(r=>String(r[i]))).size<=200);
 const nNum=num.filter(Boolean).length,nCat=cat.filter(Boolean).length;
 PP.long=t.rows.length>60&&nCat>=2&&(nNum<2||t.rows.length>500);
 $("ppLongBox").hidden=!PP.long;$("ppWideBox").hidden=PP.long;
 if(PP.long){const opt=h.map((x,i)=>cat[i]?`<option value="${i}">${esc(x)}</option>`:"").join("");$("ppS").innerHTML=opt;$("ppC").innerHTML=opt;$("ppG").innerHTML=`<option value="">${esc(TT("不合并"))}</option>`+opt;$("ppG").value="";
  const ci=scFind(h,CL_RE),si=scFind(h,SMP_RE,[ci]);const cats=h.map((_,i)=>i).filter(i=>cat[i]);
  $("ppC").value=String(ci>=0&&cat[ci]?ci:cats[cats.length-1]);$("ppS").value=String(si>=0&&cat[si]?si:cats.find(i=>String(i)!==$("ppC").value));}
 else $("ppTr").value=CL_RE.some(re=>re.test(h[0].trim()))?"c":"s";
 ppDraw()}
async function ppRead(f){setMsg("ppMsg",TT("正在读取 {0} …",f.name));PP.demo=false;
 try{const T=await readAny(f);setupSheets("ppSheetBox","ppSh",T,t=>{ppSet(t);setMsg("ppMsg",PP.long?TT("已按每行一个细胞统计：{0} 个细胞",t.rows.length):TT("已载入 {0}，{1} 行",T.name,t.rows.length))});track("upload",{tool:"scprop"})}
 catch(e){setMsg("ppMsg",e.message||TT("读取失败"),"err")}}
function ppCompute(){const h=PP.head;let smp=[],ct=[],M=new Map();const add=(s,c,n)=>{if(!M.has(s)){M.set(s,new Map());smp.push(s)}if(!ct.includes(c))ct.push(c);const m=M.get(s);m.set(c,(m.get(c)||0)+n)};
 if(PP.long){const si=$("ppG").value!==""?+$("ppG").value:+$("ppS").value,ci=+$("ppC").value;for(const r of PP.rows){const s=String(r[si]??"").trim(),c=String(r[ci]??"").trim();if(s&&c)add(s,c,1)}}
 else{const S0=PP.rows.slice(0,300),lab=h.findIndex((_,i)=>S0.filter(r=>!isNum(r[i])).length>=S0.length*0.6);if(lab<0)return{err:TT("表格里需要至少一列文字（样本或细胞类型）和数值列")};
  const nc=h.map((_,i)=>i).filter(i=>i!==lab&&S0.filter(r=>isNum(r[i])).length>=S0.length*0.9&&!/^(total|sum|all|合计|总计)$/i.test(h[i].trim()));
  if(!nc.length)return{err:TT("表格里需要至少一列文字（样本或细胞类型）和数值列")};
  const tr=$("ppTr").value==="c";for(const r of PP.rows){const a=String(r[lab]??"").trim();if(!a||/^(total|sum|all|合计|总计)$/i.test(a))continue;for(const i of nc){const v=parseFloat(r[i]);if(!isFinite(v))continue;tr?add(h[i],a,v):add(a,h[i],v)}}}
 if(!smp.length||!ct.length)return{err:TT("没有找到细胞数")};
 const tot=new Map(ct.map(c=>[c,smp.reduce((a,s)=>a+(M.get(s).get(c)||0),0)]));
 if(ct.every(c=>/^-?\d+$/.test(c)))ct.sort((a,b)=>a-b);if($("ppSort").checked)ct.sort((a,b)=>tot.get(b)-tot.get(a));
 const st=new Map(smp.map(s=>[s,ct.reduce((a,c)=>a+(M.get(s).get(c)||0),0)]));
 return{smp,ct,M,st,all:[...st.values()].reduce((a,b)=>a+b,0)}}
function ppSvg(){if(!PPR||PPR.err)return null;const {smp,ct,M,st}=PPR,pct=$("ppY").value==="pct",hz=$("ppOr").value==="h",W=+$("ppW").value,fs=+$("ppFs").value||12,title=$("ppTtl").value.trim(),lab=$("ppLab").checked,pal=PPAL[+$("ppPal").value];
 const col=k=>k<pal.length?pal[k]:lerp(pal[k%pal.length],"#ffffff",0.45);
 const val=(s,c)=>{const n=M.get(s).get(c)||0;return pct?(st.get(s)?n/st.get(s)*100:0):n};
 const vmax=pct?100:Math.max(...smp.map(s=>st.get(s)))||1,yt=pct?[0,25,50,75,100]:ticks(0,vmax,5),top=pct?100:Math.max(vmax,yt[yt.length-1]);
 const legW=Math.max(...ct.map(c=>tw(c,fs)+26),tw(TT("细胞类型"),fs)+10)+10,T=(title?fs*2.6:10)+6;
 const sLab=Math.max(...smp.map(s=>tw(s,fs)));let o,H;
 const axT=pct?TT("细胞比例 (%)"):TT("细胞数"),fp=v=>v>=10?v.toFixed(0):v.toFixed(1);
 if(!hz){const rot=sLab>Math.min(70,(W-legW-80)/smp.length*0.9),B=rot?sLab*0.72+18:fs+14,L=fs*4.2,pw=W-L-legW-16,ph=Math.max(220,Math.min(420,W*0.62));H=T+ph+B+fs*0.8;
  const bw=pw/smp.length,w=Math.min(bw*0.72,70),Y=v=>T+ph-v/top*ph;o=svgOpen(W,H,fs);
  for(const v of yt)o+=`<line x1="${L}" x2="${L+pw}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="#eee"/><line x1="${L-4}" x2="${L}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="#222"/><text x="${L-7}" y="${(Y(v)+fs*0.35).toFixed(1)}" text-anchor="end" fill="#222">${fmt(v)}</text>`;
  smp.forEach((s,i)=>{const x=L+bw*(i+0.5);let acc=0;ct.forEach((c,k)=>{const v=val(s,c);if(v<=0)return;const y1=Y(acc),y2=Y(acc+v);acc+=v;
    o+=`<rect x="${(x-w/2).toFixed(1)}" y="${y2.toFixed(1)}" width="${w.toFixed(1)}" height="${(y1-y2).toFixed(2)}" fill="${col(k)}" stroke="#fff" stroke-width="0.5"/>`;
    const pv=st.get(s)?(M.get(s).get(c)||0)/st.get(s)*100:0;if(lab&&pv>=5&&y1-y2>=fs*1.05&&w>=fs*1.8)o+=`<text x="${x.toFixed(1)}" y="${((y1+y2)/2+fs*0.32).toFixed(1)}" text-anchor="middle" font-size="${(fs*0.82).toFixed(1)}" fill="${dark(col(k))?"#fff":"#222"}">${fp(pv)}%</text>`});
   o+=rot?`<text transform="translate(${(x-fs*0.2).toFixed(1)} ${T+ph+fs*0.9}) rotate(40)" fill="#111">${esc(s)}</text>`:`<text x="${x.toFixed(1)}" y="${T+ph+fs+6}" text-anchor="middle" fill="#111">${esc(s)}</text>`});
  o+=`<path d="M${L} ${T}V${T+ph}H${L+pw}" stroke="#222" fill="none"/><text transform="translate(${fs*1.2} ${T+ph/2}) rotate(-90)" text-anchor="middle" fill="#111">${esc(axT)}</text>`}
 else{const L=sLab+14,rowH=Math.max(fs*1.9,22),pw=W-L-legW-20,ph=rowH*smp.length;H=T+ph+fs*3.6;
  const X=v=>L+v/top*pw,h=rowH*0.72;o=svgOpen(W,H,fs);
  for(const v of yt)o+=`<line x1="${X(v).toFixed(1)}" x2="${X(v).toFixed(1)}" y1="${T}" y2="${T+ph}" stroke="#eee"/><line x1="${X(v).toFixed(1)}" x2="${X(v).toFixed(1)}" y1="${T+ph}" y2="${T+ph+4}" stroke="#222"/><text x="${X(v).toFixed(1)}" y="${T+ph+fs+6}" text-anchor="middle" fill="#222">${fmt(v)}</text>`;
  smp.forEach((s,i)=>{const y=T+rowH*(i+0.5);let acc=0;ct.forEach((c,k)=>{const v=val(s,c);if(v<=0)return;const x1=X(acc),x2=X(acc+v);acc+=v;
    o+=`<rect x="${x1.toFixed(1)}" y="${(y-h/2).toFixed(1)}" width="${(x2-x1).toFixed(2)}" height="${h.toFixed(1)}" fill="${col(k)}" stroke="#fff" stroke-width="0.5"/>`;
    const pv=st.get(s)?(M.get(s).get(c)||0)/st.get(s)*100:0,tx=fp(pv)+"%";if(lab&&pv>=5&&x2-x1>=tw(tx,fs*0.82)+4)o+=`<text x="${((x1+x2)/2).toFixed(1)}" y="${(y+fs*0.3).toFixed(1)}" text-anchor="middle" font-size="${(fs*0.82).toFixed(1)}" fill="${dark(col(k))?"#fff":"#222"}">${tx}</text>`});
   o+=`<text x="${L-6}" y="${(y+fs*0.35).toFixed(1)}" text-anchor="end" fill="#111">${esc(s)}</text>`});
  o+=`<path d="M${L} ${T}V${T+ph}H${L+pw}" stroke="#222" fill="none"/><text x="${L+pw/2}" y="${T+ph+fs*2.9}" text-anchor="middle" fill="#111">${esc(axT)}</text>`}
 if(title)o+=`<text x="${(W-legW)/2}" y="${fs*1.7}" text-anchor="middle" font-size="${fs*1.25}" font-weight="bold" fill="#111">${esc(title)}</text>`;
 const lx=W-legW;let ly=T+fs;o+=`<text x="${lx}" y="${ly}" fill="#111" font-weight="bold">${esc(TT("细胞类型"))}</text>`;ly+=6;
 ct.forEach((c,k)=>{ly+=fs+6;o+=`<rect x="${lx}" y="${ly-fs*0.82}" width="12" height="12" fill="${col(k)}"/><text x="${lx+18}" y="${ly}" fill="#222">${esc(c)}</text>`});
 if(ly+12>H){const nh=Math.ceil(ly+12);o=o.replace(`viewBox="0 0 ${W} ${Math.ceil(H)}" width="${W}" height="${Math.ceil(H)}"`,`viewBox="0 0 ${W} ${nh}" width="${W}" height="${nh}"`).replace(`<rect width="${W}" height="${Math.ceil(H)}" fill="#fff"/>`,`<rect width="${W}" height="${nh}" fill="#fff"/>`)}
 return o+"</svg>"}
function ppDraw(){if(!PP.rows.length){blank("pp","");return}PPR=ppCompute();if(PPR.err){blank("pp",PPR.err);return}
 $("ppSheet").innerHTML=ppSvg();capSvg("ppSheet");$("ppStats").innerHTML=`<span>${TT("<b>{0}</b> 个样本",PPR.smp.length)}</span><span>${TT("<b>{0}</b> 种细胞",PPR.ct.length)}</span><span>${TT("共 <b>{0}</b> 个细胞",Math.round(PPR.all).toLocaleString())}</span>`}
for(const id of ["ppS","ppC","ppG","ppTr","ppY","ppOr","ppLab","ppSort","ppPal","ppW"])$(id).onchange=ppDraw;
for(const id of ["ppTtl","ppFs"])$(id).oninput=ppDraw;
bindDrop("ppDrop","ppFile",ppRead);
bindExp("pp","cell_proportion",()=>ppSvg(),()=>{if(!PPR||PPR.err)return null;const {smp,ct,M,st}=PPR;return"sample,"+ct.map(csvq).join(",")+",total\n"+smp.map(s=>[csvq(s),...ct.map(c=>{const n=M.get(s).get(c)||0;return $("ppY").value==="pct"?(st.get(s)?(n/st.get(s)*100).toFixed(3):0):n}),st.get(s)].join(",")).join("\n")});

/* ---------- 接入 ---------- */
DRAW.dot=()=>dtDraw();DRAW.prop=()=>ppDraw();
for(const b of document.querySelectorAll(".lang button"))b.addEventListener("click",()=>{const dm=TT("当前为示例数据（模拟生成）");if(DT.demo)setMsg("dtMsg",dm);if(PP.demo)setMsg("ppMsg",dm);const g0=$("ppG").options[0];if(g0)g0.textContent=TT("不合并");if(["dot","prop"].includes(CUR))DRAW[CUR]()});
dtDemo();ppDemo();applyStatic();rv();
if(["dot","prop"].includes(location.hash.slice(1)))show(location.hash.slice(1));
