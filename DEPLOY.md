## 🚀 部署三步走
1. `git push` 后 → GitHub仓库 Settings → Pages → 选main分支 → Save
2. TVBox配置地址 = `https://raw.githubusercontent.com/longben314/music-video-aggregator/main/tvbox.json`
3. **关键**：将tvbox.json中所有`api.example.com`替换为你部署的合规后端地址
## 💡 后端扩展建议
- 用Vercel部署Serverless函数（参考：https://vercel.com/templates/node.js）
- 解析接口示例：接收?url= ，返回 { "url": "合规m3u8链接" }
