import JSZip from 'jszip';
export const extractJSZip = async (file) => {
    const zip = new JSZip();
    const extractedFiles = await zip.loadAsync(file);
    return Object.values(extractedFiles.files);
}
