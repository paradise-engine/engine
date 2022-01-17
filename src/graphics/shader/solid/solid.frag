precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform vec4 u_color;

void main() {
   vec4 tex_color = texture2D(u_texture, v_texcoord);
   float alpha = ceil(tex_color.a);
   gl_FragColor = vec4(u_color.r, u_color.g, u_color.b, alpha);
}