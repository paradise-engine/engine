precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform float u_alpha;

void main(void)
{
   gl_FragColor = texture2D(u_texture, v_texcoord) * u_alpha;
}