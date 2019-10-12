import { TextureLoader, Math } from "three";
const tl = new TextureLoader();
const cache = new Map();

export default function loadTexture(url) {
  return new Promise(resolve => {
    const data = cache.get(url);

    if (data) {
      resolve(data);
    }

    tl.load(url, data => {
      if (
        !Math.isPowerOfTwo(data.image.width) ||
        !Math.isPowerOfTwo(data.image.height)
      ) {
        console.warn(`>>> "${url}" image size is not power of 2 <<<`);
      }

      cache.set(url, data);
      data.needsUpdate = true;
      resolve(data);
    });
  });
}
