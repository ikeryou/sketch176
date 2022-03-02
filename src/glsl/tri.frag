uniform vec3 color;
uniform vec2 r;
uniform float alpha;
uniform float dotSize;
uniform float useDot;

varying vec2 vUv;

void main(void) {

  float a = step(vUv.x, 0.5);
  // vec3 c = color;
  // vec4 dest = vec4(c, a);
  // gl_FragColor = dest;



  vec2 pixel = gl_FragCoord.xy;
  float squareSize = dotSize * r.y;
  float squareX = floor(pixel.x / squareSize);
  float squareY = floor(pixel.y / squareSize);
  float white = fract((squareX + squareY) / 2.0) * 2.0;
  vec2 pos = vec2(fract(pixel.x / squareSize), fract(pixel.y / squareSize));
  vec2 center = vec2(0.5, 0.5);
  vec2 diff = pos - center;
  white = white * step(length(diff), 0.5);

  gl_FragColor = vec4(color, mix(a, white * a, useDot));
}
