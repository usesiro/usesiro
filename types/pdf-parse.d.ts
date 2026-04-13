declare module 'pdf-parse' {
    function PDFParse(dataBuffer: Buffer, options?: any): Promise<any>;
    export default PDFParse;
}
