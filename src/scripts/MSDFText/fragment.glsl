uniform float uAlpha;
uniform vec3 color;
uniform sampler2D msdfMap;
uniform sampler2D normalMap;
uniform sampler2D matcapMap;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float normalScale;
uniform float normalDisplacement;
uniform float stroke;
uniform bool outline;

varying vec2 vUv;
varying vec3 peye;

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

vec2 matcap(vec3 eye, vec3 normal) {
  vec3 reflected = reflect(eye, normal);
  float m = 2.8284271247461903 * sqrt( reflected.z+1.0 );
  return reflected.xy / m + 0.5;
}

float opOnion( in float sdf, in float thickness ) {
    return thickness - abs(sdf);
}

void main() {
    vec2 screenCoords = gl_FragCoord.xy / resolution;
    vec3 normal = texture2D(normalMap, screenCoords).rgb * normalScale;

    vec3 sample = texture2D(msdfMap, vUv + normal.rg * normalDisplacement * 0.01).rgb;
    float sigDist = median(sample.r, sample.g, sample.b) - 0.5;

    if(outline) {
      sigDist = opOnion(sigDist, stroke * 0.01);
    }

    float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);

    vec2 uv = clamp(matcap(peye, normal*0.5), -1.0, 1.0);
    vec3 matcapColor = texture2D(matcapMap, uv).rgb;

    gl_FragColor = vec4(matcapColor, alpha);
}