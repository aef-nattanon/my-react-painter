import Resizer from "react-image-file-resizer";

export const resizeFile = (file: Blob) =>
  new Promise<string>((resolve) => {
    Resizer.imageFileResizer(file, 1000, 1000, "JPEG", 100, 0, (uri) => {
      resolve(uri as string);
    });
  });

export function formatBytes(a: any, b = 2) {
  if (!+a) return "0 Bytes";
  const c = 0 > b ? 0 : b,
    d = Math.floor(Math.log(a) / Math.log(1024));
  return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
    ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"][d]
  }`;
}
export const byteSize = (str: string) => new Blob([str]).size;
