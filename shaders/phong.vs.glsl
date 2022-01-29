//Raul Ramirez CST 325

precision mediump float;

attribute vec3 aVertexPosition;
attribute vec3 aNormal;
attribute vec2 aTexcoords;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vTexcoords;

void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
    vWorldNormal = (uWorldMatrix * vec4(aNormal, 0.0)).xyz;
    vWorldPosition = (uWorldMatrix * vec4(aVertexPosition, 1.0)).xyz;
    vTexcoords = aTexcoords;
}