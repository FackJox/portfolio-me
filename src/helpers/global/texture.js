/**
 * Texture loading utilities for 3D assets
 */

import { TextureLoader } from 'three'
import { SRGBColorSpace } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import * as THREE from 'three'

// Magazine textures to preload
export const picturesSmack = [
  '01Front',
  '02Contents',
  '03Contents',
  '04Editorial',
  '05Editorial',
  '06Graphics',
  '07Graphics',
  '08Scout',
  '09Scout',
  '10Bunker',
  '11Bunker',
  '12AI',
  '13AI',
  '14Sandro',
  '15Sandro',
  '16Tarot',
  '17Tarot',
  '18Tarot',
  '19Tarot',
  '20Events',
  '21Events',
]

export const picturesEngineer = [
  '01Front',
  '02Contents',
  '03Contents',
  '04Editorial',
  '05Editorial',
  '06DigitalTwins',
  '07DigitalTwins',
  '08DigitalTwins',
  '09DigitalTwins',
  '10WindTurbines',
  '11WindTurbines',
  '12HPC',
  '13HPC',
  '14Modelling',
  '15Modelling',
  '16Transformation',
  '17Transformation',
  '18Transformation',
  '19Transformation',
]

export const picturesVague = [
  '01Front',
  '02Contents',
  '03Contents',
  '04Editorial',
  '05Editorial',
  '06Timeline',
  '07Timeline',
  '08About',
  '09About',
  '10Contributers',
  '11Contributers',
]

// Create a texture cache for efficient loading and reuse
export const textureCache = {
  cache: {},
  
  // Load a texture with caching
  loadTexture(path) {
    return new Promise((resolve) => {
      // Check cache first
      if (this.cache[path]) {
        resolve(this.cache[path]);
        return;
      }

      // Load texture if not in cache
      const loader = new TextureLoader();
      loader.load(path, (loadedTexture) => {
        loadedTexture.colorSpace = SRGBColorSpace;
        this.cache[path] = loadedTexture;
        resolve(loadedTexture);
      });
    });
  },
  
  // Preload multiple textures at once
  preloadTextures(paths) {
    const promises = paths.map(path => this.loadTexture(path));
    return Promise.all(promises);
  }
};

// Helper function to get texture loading path based on magazine name and image name
export const getTexturePath = (magazineName, imageName) => `/textures/${magazineName}/${imageName}.png`

// Helper function to get roughness texture path
export const getRoughnessPath = () => `/textures/book-cover-roughness.png`

// Helper function to get HDR path for environment lighting
export const getHDRPath = () => `/textures/warehouse.hdr`

// HDR loader singleton for environment map
export const hdrLoader = {
  loadedHDR: null,
  loadHDR() {
    return new Promise((resolve, reject) => {
      if (this.loadedHDR) {
        resolve(this.loadedHDR);
        return;
      }

      const loader = new RGBELoader();
      const hdrPath = getHDRPath();

      loader.load(hdrPath, (hdrTexture) => {
        // Make it twice as bright
        const renderer = new THREE.WebGLRenderer();
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        this.loadedHDR = pmremGenerator.fromEquirectangular(hdrTexture).texture;
        pmremGenerator.dispose();
        renderer.dispose();
        
        resolve(this.loadedHDR);
      });
    });
  },
}

