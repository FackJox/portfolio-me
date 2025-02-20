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
        return vec3(pos.x, pos.y*c - pos.z*s, pos.y*s + pos.z*c);
      }

      ${shader.vertexShader}
    `

    // Replace begin_vertex chunk with our transformations
    const vertexTransformations = `
      vec3 transformed = position;
      transformed.y += progress;
      float rotationAngle = cos(smoothstep(-2., 2., transformed.y) * 3.141592653589793238);
      transformed = rotateX(transformed, rotationAngle);
      vPosition = transformed;

      // Rotate the normal using the same transformation
      objectNormal = rotateX(objectNormal, rotationAngle);
    `

    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', vertexTransformations)

    // Add our custom alpha calculation after all lighting calculations
    shader.fragmentShader = `
      varying vec3 vPosition;
      ${shader.fragmentShader}
    `.replace(
      '#include <dithering_fragment>',
      `
      #include <dithering_fragment>
      float customAlpha = smoothstep(-0.7, 0.0, vPosition.z);
      gl_FragColor.a *= customAlpha;
      `,
    )

    material.userData.shader = shader
  }

  // Ensure material updates properly
  material.needsUpdate = true
}
