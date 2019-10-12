import loadTexture from '~/scripts/util/texture-loader';
import loadManifest from '~/scripts/util/manifest-loader';

const manifold = Object.create(Object.prototype, {
    map: {
        get: async () => {
            return await loadTexture(`public/NHaasGrotesk/NHaasGrotesk.png`);
        }
    },
    json: {
        get: async () => {
            return await loadManifest(`public/NHaasGrotesk/NHaasGrotesk-msdf.json`);
        }
    }
});

export { manifold };
