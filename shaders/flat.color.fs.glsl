//Raul Ramirez CST 325
precision mediump float;

uniform vec3 uLightPosition;
uniform sampler2D uTexture;
uniform float uAlpha;

varying vec2 vTexcoords;
void main(void){
    
    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;
    gl_FragColor = vec4(albedo,uAlpha);





}