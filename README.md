# iframeCapture

一个强大的 iframe 截图工具包，支持截图、PDF 生成和图片下载。

## 安装

```bash
npm install iframeCapture
# 或
pnpm add iframeCapture
```

## 基本用法

```ts
import { IframeCapture } from "iframeCapture";

const capturer = new IframeCapture();
const iframe = document.getElementById("your-iframe-id") as HTMLIFrameElement;

// 截图并生成 PDF
capturer.captureIframeToPDF(iframe, "output.pdf");

// 截图并生成图片
capturer.captureIframeToImage(iframe, "output.jpg");
```

## API

### IframeCapture

- `captureIframe(iframe: HTMLIFrameElement, options?: IframeCaptureOptions): Promise<IframeCaptureResult>`
- `captureIframeToPDF(iframe: HTMLIFrameElement, filename?: string, options?: IframeCaptureOptions): Promise<void>`
- `captureIframeToImage(iframe: HTMLIFrameElement, filename?: string, options?: IframeCaptureOptions): Promise<void>`

### IframeCaptureOptions

- `width` 截图宽度，默认 1280
- `height` 截图高度，默认 720
- `scale` 缩放倍数，默认 2
- `backgroundColor` 背景色，默认 #ffffff
- `logging` 是否日志输出，默认 false
- `allowTaint` 是否允许跨域内容，默认 true
- `useCORS` 是否使用 CORS，默认 true
- `waitTime` 等待渲染时间，默认 1000ms

## 发布

1. 确认 dist 目录下有 index.js 和 index.d.ts
2. 更新 package.json 版本号
3. 登录 npm：`npm login`
4. 发布：`npm publish`
