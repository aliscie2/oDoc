export function convertToBlobLink(imageData: Uint8Array | number[] | string) {
  if (typeof imageData === 'string') return imageData;
  
  // If empty or null/undefined, return null
  if (!imageData || imageData.length === 0) return null;
  
  // Convert number[] to Uint8Array if needed
  const imageContent = imageData instanceof Uint8Array 
    ? imageData 
    : new Uint8Array(imageData);
  
  const image = URL.createObjectURL(
    new Blob([imageContent.buffer], { type: "image/png" }),
  );
  return image;
}
