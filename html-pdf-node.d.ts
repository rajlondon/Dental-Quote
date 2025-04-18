declare module 'html-pdf-node' {
  interface PdfOptions {
    format?: string;
    width?: string | number;
    height?: string | number;
    path?: string;
    scale?: number;
    margin?: {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    };
    printBackground?: boolean;
    landscape?: boolean;
    pageRanges?: string;
    headerTemplate?: string;
    footerTemplate?: string;
    displayHeaderFooter?: boolean;
    preferCSSPageSize?: boolean;
  }

  interface FileOptions {
    url?: string;
    content?: string;
    path?: string;
  }

  function generatePdf(file: FileOptions, options: PdfOptions): Promise<Buffer>;
  
  export { generatePdf };
  export default { generatePdf };
}