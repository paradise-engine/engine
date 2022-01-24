precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform float u_lightness;

void hue_prime_red(in float green, in float blue, in float chroma, out float hue_prime) {
    hue_prime = (green - blue) / chroma;
    if(green < blue) {
        hue_prime = hue_prime + 6.0;
    }
}

void hue_prime_green(in float blue, in float red, in float chroma, out float hue_prime) {
    hue_prime = ((blue - red) / chroma) + 2.0;
}

void hue_prime_blue(in float red, in float green, in float chroma, out float hue_prime) {
    hue_prime = ((red - green) / chroma) + 4.0;
}

void calc_hue(in float r, in float g, in float b, in float max_comp, in float chroma, out float hue) {
    hue = 0.0;

    if(chroma != 0.0) {
        float hue_prime = 0.0;
        if(max_comp == r) {
            hue_prime_red(g, b, chroma, hue_prime);
        } else {
            if(max_comp == g) {
                hue_prime_green(b, r, chroma, hue_prime);
            } else {
                hue_prime_blue(r, g, chroma, hue_prime);
            }
        }

        hue = hue_prime * 60.0;
    }
}

void calc_lightness(in float max_comp, in float min_comp, out float lightness) {
    lightness = (max_comp + min_comp) / 2.0;
}

void calc_saturation(in float lightness, in float chroma, in float max_comp, in float min_comp, out float saturation) {
    if(chroma == 0.0) {
        saturation = 0.0;
    } else {
        if(lightness > 0.5) {
            saturation = chroma / (2.0 - max_comp - min_comp);
        } else {
            saturation = chroma / (max_comp + min_comp);
        }
    }
}

void rgb_to_hsl(in vec3 rgb, out vec3 hsl) {
    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;

    float max_comp = max(r, max(g, b));
    float min_comp = min(r, min(g, b));
    float chroma = max_comp - min_comp;

    float hue = 0.0;
    float saturation = 0.0;
    float lightness = 0.0;
    calc_hue(r, g, b, max_comp, chroma, hue);
    calc_lightness(max_comp, min_comp, lightness);
    calc_saturation(lightness, chroma, max_comp, min_comp, saturation);

    hsl.x = hue;
    hsl.y = saturation;
    hsl.z = chroma;
}

void hue_to_comp(in float p, in float q, in float t, out float comp) {
    if(t < 0.0) {
        t = t + 1.0;
    }

    if(t > 1.0) {
        t = t - 1.0;
    }

    if(t < (1.0 / 6.0)) {
        comp = p + (q - p) * 6.0 * t;
        return;
    }

    if(t < (1.0 / 2.0)) {
        comp = q;
        return;
    }

    if(t < (2.0 / 3.0)) {
        comp = p + (q - p) * ((2.0 / 3.0) - t) * 6.0;
        return;
    }

    comp = p;
}

void hsl_to_rgb(in vec3 hsl, out vec3 rgb) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;

    if(s == 0.0) {
        rgb.r = l;
        rgb.g = l;
        rgb.b = l;
    } else {
        float q = 0.0;
        if(l < 0.5) {
            q = l * (1.0 + s);
        } else {
            q = l + s - (l * s);
        }

        float p = 2.0 * l - q;

        hue_to_comp(p, q, h + (1.0 / 3.0), rgb.r);
        hue_to_comp(p, q, h, rgb.g);
        hue_to_comp(p, q, h - (1.0 / 3.0), rgb.b);
    }
}

void main() {
    vec4 tex_color = texture2D(u_texture, v_texcoord);

    if(u_lightness == 1.0) {
        gl_FragColor = tex_color;
        return;
    }

    if(tex_color.a == 0.0) {
        gl_FragColor = tex_color;
        return;
    }

    vec3 hsl = vec3(0.0, 0.0, 0.0);
    rgb_to_hsl(tex_color.rgb, hsl);
    hsl.z = hsl.z * u_lightness;

    vec3 rgb = vec3(0.0, 0.0, 0.0);
    hsl_to_rgb(hsl, rgb);

    gl_FragColor = vec4(rgb.r, rgb.g, rgb.b, tex_color.a);
}