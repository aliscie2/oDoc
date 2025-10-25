export function convertToBlobLink(imageData: Uint8Array) {
  if (imageData.length === 0 ) return null;
  const imageContent = new Uint8Array(imageData);
  const image = URL.createObjectURL(
    new Blob([imageContent?.buffer], { type: "image/png" }),
  );
  return image;
}
