function extractFiveWordsMax(contentTree) {
  let wordsExtracted = 0;
  let result = [];

  // Iterate through content_tree
  contentTree.forEach((node) => {
    // Check if node has text content
    if (node._type === "p" && node.children.length > 0) {
      // Iterate through children to find text node
      node.children.forEach((childId) => {
        const childNode = contentTree.find((n) => n.id === childId);
        if (
          childNode &&
          childNode._type === "" &&
          childNode.text.trim() !== ""
        ) {
          // Split text into words and add up to 5 words to result
          const words = childNode.text.trim().split(/\s+/);
          result.push(...words.slice(0, 5 - wordsExtracted));
          wordsExtracted += words.length;
          if (wordsExtracted >= 5) return result; // Exit early if 5 words are extracted
        }
      });
    }
  });

  return result;
}
export default extractFiveWordsMax;
