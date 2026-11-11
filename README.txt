Kin Bali Massage 网站 — 上线说明
================================

文件夹内容
- index.html        首页（电脑版 + 手机版自动切换，820px 以下显示手机版）
- treatments.html   Treatments 目录页
- assets/           图片、视频、音效、背景音乐、字体、CSS、JS

这是纯静态网站，不需要数据库或后台，任何静态主机都能放。
注意：整个文件夹要一起上传，保持 assets 文件夹结构不变。

最简单的上线方法（Netlify，免费）
1. 打开 https://app.netlify.com/drop 并登录。
2. 把整个 kinbali-site 文件夹（不是 zip）拖进网页里。
3. 等 1 分钟，会得到一个 xxx.netlify.app 网址，可先打开检查。
4. 绑定自己的域名：Site configuration → Domain management → Add a domain，
   输入 kinbali.com.my，按页面提示去域名商那里改 DNS。
5. 之后要更新网站：Deploys → 把新文件夹再拖进去即可。

其他方式
- Vercel / Cloudflare Pages：新建项目 → 上传文件夹，同样直接可用。
- 现有主机（cPanel 等）：把文件夹里的所有内容上传到 public_html。
  若现有网站是 WordPress，请先请主机商/开发者备份旧站，再替换。

上线前请检查
- App Store / Google Play 按钮目前是占位，还没有链接到真实商店页面。
- 页脚 Terms of Use / Privacy Policy 目前没有链接页面。
- "中文" 切换按钮目前没有中文版本页面。
- Google Maps / Waze 按钮使用搜索链接（按分店名搜索），如有精确地址链接可替换。
- 背景音乐：浏览器规定，访客第一次点击/触碰页面后才会开始播放。
- Treatments 页面的 hover 视频 + 音效只在电脑版；手机版是滑到卡片时自动播放视频（无音效）。

WhatsApp 号码
- Forest City   +60 12-847 8080
- Eco Botanic 2 +60 18-228 6655
- Nusa Sentral  +60 12-758 6655
