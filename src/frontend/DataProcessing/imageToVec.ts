export function convertToBlobLink(imageData) {
  const imageContent = new Uint8Array(imageData);
  const image = URL.createObjectURL(
    new Blob([imageContent?.buffer], { type: "image/png" }),
  );
  return image;
}
