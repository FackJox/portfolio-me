uniform float time;
uniform float progress;
uniform vec2 pixels;
// attribute vec3 normal;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
float PI = 3.141592653589793238;

vec3 rotateX(vec3 pos, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(pos.x, pos.y * c - pos.z * s, pos.y * s + pos.z * c);
}

vec3 rotateY(vec3 pos, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(pos.x * c - pos.z * s, pos.y, pos.x * s + pos.z * c);
}

void main() {
  vUv = uv;
  vec3 pos = position;

  // Apply vertical offset based on progress
  pos.y += progress;
  
  // Apply rotation based on vertical position
  float rotationAngle = cos(smoothstep(-2., 2., pos.y) * PI);
  pos = rotateX(pos, rotationAngle);
  
  vPosition = pos;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vNormal = normalize(normalMatrix * normal);
  vViewPosition = -mvPosition.xyz;
}