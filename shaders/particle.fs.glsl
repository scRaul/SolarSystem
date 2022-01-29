//Raul Ramirez CST 325

precision mediump float;

uniform sampler2D uTexture;

varying vec4 vColor;

void main(void) {
    vec4 texColor = texture2D(uTexture, gl_PointCoord);
    gl_FragColor = texColor * vColor;
    // gl_FragColor = vec4(debug.x, debug.y, 0.0, 1.0);
    // gl_FragColor = vec4(gl_PointCoord.x, gl_PointCoord.y, 0.0, 1.0);
}
