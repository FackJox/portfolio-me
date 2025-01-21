import { TextureLoader } from 'three';
import { SRGBColorSpace } from 'three';

// Magazine textures to preload
export const picturesSmack = [
  "01Front",
  "02Contents",
  "03Contents",
  "04Editorial",
  "05Editorial",
  "06Graphics",
  "07Graphics",
  "08Scout",
  "09Scout",
  "10Bunker",
  "11Bunker",
  "12AI",
  "13AI",
  "14Sandro",
  "15Sandro",
  "16Tarot",
  "17Tarot",
  "18Tarot",
  "19Tarot",
  "20Events",
  "21Events",
];

export const picturesEngineer = [
  "01Front",
  "02Contents",
  "03Contents",
  "04Editorial",
  "05Editorial",
  "06DigitalTwins",
  "07DigitalTwins",
  "08DigitalTwins",
  "09DigitalTwins",
  "10WindTurbines",
  "11WindTurbines",
  "12HPC",
  "13HPC",
  "14Modelling",
  "15Modelling",
  "16Transformation",
  "17Transformation",
  "18Transformation",
  "19Transformation",
];

export const picturesVague = [
  "01Front",
  "02Contents",
  "03Contents",
  "04Editorial",
  "05Editorial",
  "06Timeline",
  "07Timeline",
  "08About",
  "09About",
  "10Contributers",
  "11Contributers",
];

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