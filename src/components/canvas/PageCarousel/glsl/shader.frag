uniform float time;
uniform float progress;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
float PI = 3.141592653589793238;

#include <common>
#include <lights_pars_begin>

void main() {
	// Sample the texture color
	vec3 texColor = texture2D(uTexture, vUv).rgb;
	float alpha = smoothstep(-0.7, 0.0, vPosition.z);

	// Compute simple Lambert diffuse lighting
	vec3 normal = normalize(vNormal);
	vec3 totalDiffuse = ambientLightColor;

	#if NUM_DIR_LIGHTS > 0
		for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
			vec3 lightDir = directionalLights[i].direction;
			float diff = max(dot(normal, -lightDir), 0.0);
			totalDiffuse += directionalLights[i].color * diff;
		}
	#endif

	vec3 finalColor = texColor * totalDiffuse;

	gl_FragColor = vec4(finalColor, alpha);
}