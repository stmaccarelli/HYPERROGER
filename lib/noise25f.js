// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

// STEFANO MACCARELLI:
// this one is a simplex 2D noise with a modified input vector.
// noise2d uses a vec2, so i give it a vec2 made of vec3.xy + vec3.z
// input is a vec3, and vec3.z acts as a pseudo seed
// in result it's a pseudo 3d noise, but fast as a 2D noise

/*
Template literals are string literals allowing embedded expressions. You can use multi-line strings and string interpolation features with them. They were called "template strings" in prior editions of the ES2015 / ES6 specification.
*/

var fastGLSLNoise = `

  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0;}
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0;}
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float fnoise(vec3 _v)
    {
  vec2 v = _v.xy + _v.z;
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                       -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;


    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);

    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  		+ i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 128.0 * dot(m, g);
  }
  `;
