uniform vec2 mouse;

varying vec2 vUv;
varying vec3 peye;

void main() {
    vUv = uv;

    vec4 mp = modelMatrix * vec4(position, 1.0);

    vec3 camPos = vec3(cameraPosition.x + mouse.x, cameraPosition.y - mouse.y, cameraPosition.z);
    peye = normalize(mp.xyz - camPos.xyz);

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}