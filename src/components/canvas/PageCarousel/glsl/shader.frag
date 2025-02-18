uniform float time;
uniform float progress;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;

void main() {
	vec3 color = texture2D(uTexture, vUv).rgb;
	float alpha = smoothstep(-0.7, 0.0, vPosition.z);
	gl_FragColor = vec4(color, alpha);
}