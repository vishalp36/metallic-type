const cache = new Map();

export default function loadManifest(url) {
  return new Promise(resolve => {
    const data = cache.get(url);

    if (data) {
      resolve(data);
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        cache.set(url, data);
        resolve(data);
      });
  });
}
