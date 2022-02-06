document.addEventListener("DOMContentLoaded", () => {
  const { open } = createFullscreenSlideshow(images, { background: "linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%)", fontColor: "#333" });
  
  const clickHandler = (item, index) => open(index);
  
  createMasonryGallery('.content', images, { cursorPointer: true }, clickHandler);
});