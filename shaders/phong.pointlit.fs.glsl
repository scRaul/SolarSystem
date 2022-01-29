//Raul Ramirez CST 325

precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;
uniform sampler2D vTexture;
uniform float uAlpha;


varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;


void main(void) {  
    // todo - diffuse contribution
    // 1. normalize the light direction and store in a separate variable
    vec3 lightNormal = normalize(uLightPosition - vWorldPosition);

    // 2. normalize the world normal and store in a separate variable
    vec3 worldNormal = normalize(vWorldNormal);
    // 3. calculate the lambert term
    float lambert = max(dot(worldNormal,lightNormal),0.0);

    // todo - specular contribution
    // 1. in world space, calculate the direction from the surface point to the eye (normalized)
    vec3 eyeDir = normalize((uCameraPosition - vWorldPosition));
    // 2. in world space, calculate the reflection vector (normalized)
    vec3 refl = normalize(((2.0 * lambert) * worldNormal ) - lightNormal);
    // 3. calculate the phong term
    float phong = pow(max(dot(refl,eyeDir),0.1), 64.0)  ;

    // todo - combine
    // 1. apply light and material interaction for diffuse value by using the texture color as the material
    // 2. apply light and material interaction for phong, assume phong material color is (0.3, 0.3, 0.3)
   
    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;
   // vec3 night = texture2D(vTexture,vTexcoords).rgb;

    

    vec3 finalColor = albedo * lambert;
  

    gl_FragColor = vec4(finalColor,uAlpha);
}
