# 酷辣博 - Pasero 雀角转录作图工具

线上地址：https://rnaseq.pasero.app

纯静态网页，所有计算在浏览器里完成，用户数据不上传。

## 文件
- `index.html` 页面与样式
- `i18n.js` 中 / 英 / 日 文案
- `core.js` 读表、火山图、热图
- `plots.js` MA、PCA、相关性、箱线图、韦恩图、富集气泡图
- `sc.js` 单细胞气泡图、细胞比例图
- `gset.js` 基因列表 → GO / Reactome 富集（超几何检验 + BH 校正）
- `gs/*.json.gz` 预处理好的基因集

## 基因集来源
来自 Enrichr（Ma'ayan Lab）的基因集库：
GO_Biological_Process_2025、GO_Molecular_Function_2025、GO_Cellular_Component_2025、Reactome_Pathways_2024。
原始数据分别来自 Gene Ontology Consortium 和 Reactome。

`gs/` 里是压缩后的版本：基因名统一大写，只保留 5–2000 个基因的条目，基因下标用 36 进制差分编码。
若 `gs/` 文件不可用，`gset.js` 会自动回退到直接从 Enrichr 下载。
