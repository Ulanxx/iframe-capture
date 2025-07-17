# iframe-capture

一个强大的 iframe 截图工具包，支持网页截图、PDF 生成和图片下载。

## 特性

- 支持将 iframe 内容导出为图片或 PDF
- 支持自定义截图尺寸、缩放、背景色等参数
- 简单易用，TypeScript 支持
- 基于 html2canvas-pro 和 jsPDF

## 安装

```bash
npm install iframe-capture
# 或
pnpm add iframe-capture
```

## 快速上手

```ts
import { IframeCapture } from "iframe-capture";

const capturer = new IframeCapture();
const iframe = document.getElementById("your-iframe-id") as HTMLIFrameElement;

// 截图并生成 PDF
await capturer.captureIframeToPDF(iframe, "output.pdf");

// 截图并生成图片
await capturer.captureIframeToImage(iframe, "output.jpg");
```

## API 说明

### IframeCapture

- `captureIframe(iframe: HTMLIFrameElement, options?: IframeCaptureOptions): Promise<IframeCaptureResult>`
- `captureIframeToPDF(iframe: HTMLIFrameElement, filename?: string, options?: IframeCaptureOptions): Promise<void>`
- `captureIframeToImage(iframe: HTMLIFrameElement, filename?: string, options?: IframeCaptureOptions): Promise<void>`

### IframeCaptureOptions

| 参数            | 类型    | 默认值  | 说明             |
| --------------- | ------- | ------- | ---------------- |
| width           | number  | 1280    | 截图宽度         |
| height          | number  | 720     | 截图高度         |
| scale           | number  | 2       | 缩放倍数         |
| backgroundColor | string  | #ffffff | 背景色           |
| logging         | boolean | false   | 是否日志输出     |
| allowTaint      | boolean | true    | 是否允许跨域内容 |
| useCORS         | boolean | true    | 是否使用 CORS    |
| waitTime        | number  | 1000    | 等待渲染时间(ms) |

## 常见问题

- **跨域 iframe 无法截图？**  
  需要目标 iframe 支持 CORS，或设置 allowTaint 为 true，但部分浏览器安全策略可能仍有限制。

- **图片/字体未加载完成就截图？**  
  可适当增加 waitTime 参数，确保资源加载完毕。

## 贡献

欢迎提 issue 或 PR 参与贡献！

1. Fork 本仓库
2. 新建分支进行开发
3. 提交 PR

## 发布

1. 确认 dist 目录下有 index.js 和 index.d.ts
2. 更新 package.json 版本号
3. 登录 npm：`npm login`
4. 一键发布：`npm run publish:all`
