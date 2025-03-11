/**
 * Shader helper functions for Three.js materials
 */

import * as THREE from 'three'

/**
 * Configures the material shader with custom vertex rotation and alpha calculations
 * @param {THREE.Material} material - The material to configure
 * @param {number} index - The index of the page in the carousel
 */
export const configureMaterialShader = (material, index) => {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = { value: 0 }
    shader.uniforms.progress = { value: -10 - index * 1.75 } // Set initial progress based on starting position

    // Inject custom varying declarations and functions at the top of vertex shader
    shader.vertexShader = `
      uniform float time;
      uniform float progress;
      varying vec3 vPosition;

      vec3 rotateX(vec3 pos, float angle) {
        float c = cos(angle);
        float s = sin(angle);
        float y = pos.y * c - pos.z * s;
        float z = pos.y * s + pos.z * c;
        return vec3(pos.x, y, z);
      }

      vec3 rotateY(vec3 pos, float angle) {
        float c = cos(angle);
        float s = sin(angle);
        float x = pos.x * c - pos.z * s;
        float z = pos.x * s + pos.z * c;
        return vec3(x, pos.y, z);
      }

      vec3 rotateZ(vec3 pos, float angle) {
        float c = cos(angle);
        float s = sin(angle);
        float x = pos.x * c - pos.y * s;
        float y = pos.x * s + pos.y * c;
        return vec3(x, y, pos.z);
      }
    ` + shader.vertexShader

    // Inject code at the end of the main function in vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      'void main() {'
    )

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vPosition = position;
      
      // Apply rotation based on progress
      float rotationAmount = smoothstep(-10.0, 0.0, progress) * 3.14159 * 0.5;
      transformed = rotateY(transformed, rotationAmount);
      `
    )

    // Inject fragment shader modifications for alpha
    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      `
      uniform float progress;
      varying vec3 vPosition;
      void main() {
      `
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
      `
      // Calculate alpha based on progress
      float alpha = diffuseColor.a;
      if (progress < -9.0) {
        // Fade in at the start
        alpha *= smoothstep(-15.0, -9.0, progress);
      } else if (progress > 0.9) {
        // Fade out when completing rotation
        alpha *= 1.0 - smoothstep(0.9, 1.0, progress);
      }
      
      gl_FragColor = vec4(outgoingLight, alpha);
      `
    )

    // Add this material to our shader materials for animation
    material.userData.shader = shader
  }
}