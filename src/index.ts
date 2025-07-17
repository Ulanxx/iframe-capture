import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export interface IframeCaptureOptions {
  width?: number;
  height?: number;
  scale?: number;
  backgroundColor?: string;
  logging?: boolean;
  allowTaint?: boolean;
  useCORS?: boolean;
  waitTime?: number;
}

export interface IframeCaptureResult {
  canvas: HTMLCanvasElement;
  dataURL: string;
  blob: Blob;
}

class IframeCapture {
  /**
   * 日志输出
   */
  log(message: string) {
    const logArea = document.getElementById("log");
    const time = new Date().toLocaleTimeString();
    if (logArea) {
      logArea.innerHTML += `<br>[${time}] ${message}`;
      logArea.scrollTop = logArea.scrollHeight;
    }
    // 控制台输出
    console.log(message);
  }

  /**
   * 截取 iframe 内容为图片
   */
  async captureIframe(
    iframe: HTMLIFrameElement,
    options: IframeCaptureOptions = {}
  ): Promise<IframeCaptureResult> {
    const {
      width = 1920,
      height = 1080,
      scale = 3,
      backgroundColor = "#ffffff",
      logging = false,
      allowTaint = true,
      useCORS = true,
      waitTime = 1000,
    } = options;

    if (logging) {
      this.log(`开始截取 iframe... (${width}x${height}, scale: ${scale})`);
    }

    let canAccessIframe = false;
    let iframeDoc: Document | null = null;
    try {
      iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document || null;
      if (iframeDoc) {
        // 尝试访问 document 以检测跨域
        // @ts-ignore
        void iframeDoc.domain;
        canAccessIframe = true;
        if (logging) this.log("可以访问iframe内容，使用直接截取方案");
      }
    } catch (error: any) {
      canAccessIframe = false;
      if (logging)
        this.log(`无法访问iframe内容，检测到跨域限制: ${error.message}`);
    }

    let canvas: HTMLCanvasElement;

    if (canAccessIframe && iframeDoc) {
      // 方案1: 直接截取iframe内容
      try {
        // 等待iframe内容完全渲染
        if (iframeDoc.readyState !== "complete") {
          await new Promise<void>((resolve) => {
            const checkReady = () => {
              if (iframeDoc && iframeDoc.readyState === "complete") {
                resolve();
              } else {
                setTimeout(checkReady, 100);
              }
            };
            checkReady();
          });
        }
        // 额外等待确保内容渲染完成
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        const iframeBody = iframeDoc.body || iframeDoc.documentElement;
        if (!iframeBody) {
          throw new Error("iframe 内容为空");
        }
        // 强制设置宽高，防止截图被截断
        iframeBody.style.width = `${width}px`;
        iframeBody.style.height = `${height}px`;
        canvas = await html2canvas(iframeBody, {
          allowTaint,
          useCORS,
          backgroundColor,
          scale,
          logging,
          width,
          height,
          scrollX: 0,
          scrollY: 0,
        });
        if (logging) this.log("直接截取iframe内容成功");
      } catch (error: any) {
        if (logging) this.log(`直接截取失败，尝试备用方案: ${error.message}`);
        canvas = await this.useFallbackCapture(iframe, options);
      }
    } else {
      // 方案2: 跨域情况下的备用方案
      if (logging) this.log("使用跨域备用方案");
      canvas = await this.useFallbackCapture(iframe, options);
    }

    const dataURL = canvas.toDataURL("image/png");
    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b as Blob), "image/png");
    });
    if (logging) this.log("截图完成！");
    return { canvas, dataURL, blob };
  }

  /**
   * 备用方案：直接截取iframe元素或使用临时容器
   */
  async useFallbackCapture(
    iframe: HTMLIFrameElement,
    options: IframeCaptureOptions = {}
  ): Promise<HTMLCanvasElement> {
    const {
      width = 1920,
      height = 1080,
      scale = 2,
      backgroundColor = "#ffffff",
      allowTaint = true,
      useCORS = true,
      waitTime = 1000,
    } = options;
    // 等待iframe加载完成
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    this.log("使用备用方案：直接截取iframe元素");
    try {
      const canvas = await html2canvas(iframe, {
        allowTaint,
        useCORS,
        backgroundColor,
        scale,
        logging: false,
        width,
        height,
      });
      this.log("直接截取iframe元素成功");
      return canvas;
    } catch (error: any) {
      this.log(`直接截取iframe元素失败，尝试容器方案: ${error.message}`);
      return await this.useContainerCapture(iframe, options);
    }
  }

  /**
   * 备用方案：将iframe克隆到临时容器后截图
   */
  async useContainerCapture(
    iframe: HTMLIFrameElement,
    options: IframeCaptureOptions = {}
  ): Promise<HTMLCanvasElement> {
    const {
      width = 1920,
      height = 1080,
      scale = 2,
      backgroundColor = "#ffffff",
      allowTaint = true,
      useCORS = true,
      waitTime = 1000,
    } = options;
    // 创建临时容器
    const tempDiv = document.createElement("div");
    tempDiv.style.width = `${width}px`;
    tempDiv.style.height = `${height}px`;
    tempDiv.style.backgroundColor = backgroundColor;
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "-9999px";
    tempDiv.style.overflow = "hidden";
    tempDiv.style.border = "none";
    tempDiv.style.zIndex = "-1";
    tempDiv.setAttribute("data-iframe-capture-temp", "true");
    // 克隆iframe元素
    const iframeClone = iframe.cloneNode(true) as HTMLIFrameElement;
    iframeClone.style.width = "100%";
    iframeClone.style.height = "100%";
    iframeClone.style.border = "none";
    tempDiv.appendChild(iframeClone);
    // 添加到DOM中
    document.body.appendChild(tempDiv);
    this.log("创建临时容器，等待渲染...");
    // 等待渲染
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    try {
      // 截取临时容器
      const canvas = await html2canvas(tempDiv, {
        allowTaint,
        useCORS,
        backgroundColor,
        scale,
        logging: false,
        width,
        height,
      });
      this.log("容器截取成功");
      return canvas;
    } finally {
      // 清理临时元素
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
    }
  }

  /**
   * 导出为PDF
   */
  async captureIframeToPDF(
    iframe: HTMLIFrameElement,
    filename: string = "capture.pdf",
    options: IframeCaptureOptions = {}
  ): Promise<void> {
    const { width = 1920, height = 1080, scale = 3 } = options;
    const { dataURL } = await this.captureIframe(iframe, { ...options, scale });
    const realWidth = width * scale;
    const realHeight = height * scale;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      precision: 32,
      putOnlyUsedFonts: false,
      floatPrecision: 32,
      format: [realWidth, realHeight],
    });
    pdf.addImage(dataURL, "PNG", 0, 0, realWidth, realHeight);
    pdf.save(filename);
    this.log(`PDF 生成完成: ${filename}`);
  }

  /**
   * 导出为图片
   */
  async captureIframeToImage(
    iframe: HTMLIFrameElement,
    filename: string = "capture.jpg",
    options: IframeCaptureOptions = {}
  ): Promise<void> {
    const { blob } = await this.captureIframe(iframe, options);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.log(`图片下载完成: ${filename}`);
  }

  /**
   * 清理所有临时容器
   */
  cleanupIframeCaptureTemp(): void {
    const tempElements = document.querySelectorAll(
      '[data-iframe-capture-temp="true"]'
    );
    tempElements.forEach((el) => {
      if (document.body.contains(el)) {
        document.body.removeChild(el);
      }
    });
  }
}

export { IframeCapture };
