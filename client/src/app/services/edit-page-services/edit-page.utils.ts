export function dataURLtoBlob(dataURL: string): Blob {
    const [mimeString, byteString] = dataURL.split(',').map((part, index) => (index === 0 ? part.split(':')[1].split(';')[0] : atob(part)));
    const ab = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
        ab[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}
