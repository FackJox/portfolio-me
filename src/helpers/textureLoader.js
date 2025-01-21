import { TextureLoader } from 'three';
import { SRGBColorSpace } from 'three';

// Texture path helpers
export const getTexturePath = (magazine, page) => `/textures/${magazine}/${page}.png`
export const getRoughnessPath = () => '/textures/book-cover-roughness.png'

class TextureCache {
  constructor() {
    this.textureLoader = new TextureLoader();
    this.textures = new Map();
    this.loadingPromises = new Map();
  }

  async loadTexture(path) {
    // If texture is already loaded, return it
    if (this.textures.has(path)) {
      return this.textures.get(path);
    }

    // If texture is currently loading, return the existing promise
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path);
    }

    // Create new loading promise
    const loadingPromise = new Promise((resolve, reject) => {
      this.textureLoader.load(
        path,
        (texture) => {
          texture.colorSpace = SRGBColorSpace;
          this.textures.set(path, texture);
          this.loadingPromises.delete(path);
          resolve(texture);
        },
        undefined,
        (error) => {
          this.loadingPromises.delete(path);
          reject(error);
        }
      );
    });

    this.loadingPromises.set(path, loadingPromise);
    return loadingPromise;
  }

  async preloadTextures(paths) {
    return Promise.all(paths.map(path => this.loadTexture(path)));
  }
}

export const textureCache = new TextureCache(); 