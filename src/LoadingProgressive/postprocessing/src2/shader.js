class Shader{
    constructor(){
    }
    static ao_compose(){
        // ./ao/AOEffect.js
        return /* wgsl */`
        uniform sampler2D inputTexture;
        uniform sampler2D depthTexture;
        uniform float power;
        uniform vec3 color;
        
        void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
            float unpackedDepth = textureLod(depthTexture, uv, 0.).r;
        
            float ao = unpackedDepth > 0.9999 ? 1.0 : textureLod(inputTexture, uv, 0.0).a;
            ao = pow(ao, power);
        
            vec3 aoColor = mix(color, vec3(1.), ao);
        
            aoColor *= inputColor.rgb;
        
            outputColor = vec4(aoColor, inputColor.a);
        }
        `
    }
    static basic(){
        return /* wgsl */`
        varying vec2 vUv;
        void main() {
            vUv = position.xy * 0.5 + 0.5;
            gl_Position = vec4(position.xy, 1.0, 1.0);
        }
        `
    }
    static sampleBlueNoise(){
        return /* wgsl */`
        const float g = 1.6180339887498948482;
        const float a1 = 1.0 / g;

        // reference: https://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences/
        float r1(float n) {
            // 7th harmonious number
            return fract(1.1127756842787055 + a1 * n);
        }

        const vec4 hn = vec4(0.618033988749895, 0.3247179572447458, 0.2207440846057596, 0.1673039782614187);

        vec4 sampleBlueNoise(sampler2D texture, int seed, vec2 repeat, vec2 texSize) {
            vec2 size = vUv * texSize;
            vec2 blueNoiseSize = texSize / repeat;
            float blueNoiseIndex = floor(floor(size.y / blueNoiseSize.y) * repeat.x) + floor(size.x / blueNoiseSize.x);

            // get the offset of this pixel's blue noise tile
            // int blueNoiseTileOffset = int(r1(blueNoiseIndex + 1.0) * 65536.);

            vec2 blueNoiseUv = vUv * repeat;

            // fetch blue noise for this pixel
            vec4 blueNoise = textureLod(texture, blueNoiseUv, 0.);

            // animate blue noise
            if (seed != 0) {
                blueNoise = fract(blueNoise + hn * float(seed));

                blueNoise.r = (blueNoise.r > 0.5 ? 1.0 - blueNoise.r : blueNoise.r) * 2.0;
                blueNoise.g = (blueNoise.g > 0.5 ? 1.0 - blueNoise.g : blueNoise.g) * 2.0;
                blueNoise.b = (blueNoise.b > 0.5 ? 1.0 - blueNoise.b : blueNoise.b) * 2.0;
                blueNoise.a = (blueNoise.a > 0.5 ? 1.0 - blueNoise.a : blueNoise.a) * 2.0;
            }

            return blueNoise;
        }
        `
    }
    static hbao_utils(){
        return /* wgsl */`
        #include <sampleBlueNoise>

        uniform sampler2D normalTexture;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform mat4 projectionMatrixInverse;
        uniform mat4 cameraMatrixWorld;
        
        // source: https://github.com/mrdoob/three.js/blob/342946c8392639028da439b6dc0597e58209c696/examples/js/shaders/SAOShader.js#L123
        float getViewZ(const float depth) {
        #ifdef PERSPECTIVE_CAMERA
            return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
        #else
            return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
        #endif
        }
        
        // source: https://github.com/N8python/ssao/blob/master/EffectShader.js#L52
        vec3 getWorldPos(const float depth, const vec2 coord) {
            float z = depth * 2.0 - 1.0;
            vec4 clipSpacePosition = vec4(coord * 2.0 - 1.0, z, 1.0);
            vec4 viewSpacePosition = projectionMatrixInverse * clipSpacePosition;
        
            // Perspective division
            vec4 worldSpacePosition = cameraMatrixWorld * viewSpacePosition;
            worldSpacePosition.xyz /= worldSpacePosition.w;
        
            return worldSpacePosition.xyz;
        }
        
        vec3 slerp(const vec3 a, const vec3 b, const float t) {
            float cosAngle = dot(a, b);
            float angle = acos(cosAngle);
        
            if (abs(angle) < 0.001) {
                return mix(a, b, t);
            }
        
            float sinAngle = sin(angle);
            float t1 = sin((1.0 - t) * angle) / sinAngle;
            float t2 = sin(t * angle) / sinAngle;
        
            return (a * t1) + (b * t2);
        }
        
        vec3 computeWorldNormal() {
            vec2 size = vec2(textureSize(depthTexture, 0));
            ivec2 p = ivec2(vUv * size);
            float c0 = texelFetch(depthTexture, p, 0).x;
            float l2 = texelFetch(depthTexture, p - ivec2(2, 0), 0).x;
            float l1 = texelFetch(depthTexture, p - ivec2(1, 0), 0).x;
            float r1 = texelFetch(depthTexture, p + ivec2(1, 0), 0).x;
            float r2 = texelFetch(depthTexture, p + ivec2(2, 0), 0).x;
            float b2 = texelFetch(depthTexture, p - ivec2(0, 2), 0).x;
            float b1 = texelFetch(depthTexture, p - ivec2(0, 1), 0).x;
            float t1 = texelFetch(depthTexture, p + ivec2(0, 1), 0).x;
            float t2 = texelFetch(depthTexture, p + ivec2(0, 2), 0).x;
            float dl = abs((2.0 * l1 - l2) - c0);
            float dr = abs((2.0 * r1 - r2) - c0);
            float db = abs((2.0 * b1 - b2) - c0);
            float dt = abs((2.0 * t1 - t2) - c0);
            vec3 ce = getWorldPos(c0, vUv).xyz;
            vec3 dpdx = (dl < dr) ? ce - getWorldPos(l1, (vUv - vec2(1.0 / size.x, 0.0))).xyz
                                  : -ce + getWorldPos(r1, (vUv + vec2(1.0 / size.x, 0.0))).xyz;
            vec3 dpdy = (db < dt) ? ce - getWorldPos(b1, (vUv - vec2(0.0, 1.0 / size.y))).xyz
                                  : -ce + getWorldPos(t1, (vUv + vec2(0.0, 1.0 / size.y))).xyz;
            return normalize(cross(dpdx, dpdy));
        }
        
        vec3 getWorldNormal(const vec2 uv) {
        #ifdef useNormalTexture
            vec3 worldNormal = unpackRGBToNormal(textureLod(normalTexture, uv, 0.).rgb);
        
            worldNormal = (vec4(worldNormal, 1.) * viewMatrix).xyz;  // view-space to world-space
            return normalize(worldNormal);
        #else
            return computeWorldNormal();  // compute world normal from depth
        #endif
        }
        
        #define PI 3.14159265358979323846264338327950288
        
        // source: https://www.shadertoy.com/view/cll3R4
        vec3 cosineSampleHemisphere(const vec3 n, const vec2 u) {
            float r = sqrt(u.x);
            float theta = 2.0 * PI * u.y;
        
            vec3 b = normalize(cross(n, vec3(0.0, 1.0, 1.0)));
            vec3 t = cross(b, n);
        
            return normalize(r * sin(theta) * b + sqrt(1.0 - u.x) * n + r * cos(theta) * t);
        }        
        `
    }
    static hbao(){
        return /* wgsl */`
        varying vec2 vUv;

        uniform sampler2D depthTexture;
        
        uniform mat4 projectionViewMatrix;
        uniform int frame;
        
        uniform sampler2D blueNoiseTexture;
        uniform vec2 blueNoiseRepeat;
        uniform vec2 texSize;
        
        uniform float aoDistance;
        uniform float distancePower;
        uniform float bias;
        uniform float thickness;
        
        #include <packing>
        // HBAO Utils
        #include <hbao_utils>
        
        float getOcclusion(const vec3 cameraPosition, const vec3 worldPos, const vec3 worldNormal, const float depth, const int seed, inout float totalWeight) {
            vec4 blueNoise = sampleBlueNoise(blueNoiseTexture, seed, blueNoiseRepeat, texSize);
        
            vec3 sampleWorldDir = cosineSampleHemisphere(worldNormal, blueNoise.rg);
        
            vec3 sampleWorldPos = worldPos + aoDistance * pow(blueNoise.b, distancePower + 1.0) * sampleWorldDir;
        
            // Project the sample position to screen space
            vec4 sampleUv = projectionViewMatrix * vec4(sampleWorldPos, 1.);
            sampleUv.xy /= sampleUv.w;
            sampleUv.xy = sampleUv.xy * 0.5 + 0.5;
        
            // Get the depth of the sample position
            float sampleDepth = textureLod(depthTexture, sampleUv.xy, 0.0).r;
        
            // Compute the horizon line
            float deltaDepth = depth - sampleDepth;
        
            // distance based bias
            float d = distance(sampleWorldPos, cameraPosition);
            deltaDepth *= 0.001 * d * d;
        
            float th = thickness * 0.01;
        
            float theta = dot(worldNormal, sampleWorldDir);
            totalWeight += theta;
        
            if (deltaDepth < th) {
                float horizon = sampleDepth + deltaDepth * bias * 1000.;
        
                float occlusion = max(0.0, horizon - depth) * theta;
        
                float m = max(0., 1. - deltaDepth / th);
                occlusion = 10. * occlusion * m / d;
        
                occlusion = sqrt(occlusion);
                return occlusion;
            }
        
            return 0.;
        }
        
        void main() {
            float depth = textureLod(depthTexture, vUv, 0.0).r;
        
            // filter out background
            if (depth == 1.0) {
                discard;
                return;
            }
        
            vec4 cameraPosition = cameraMatrixWorld * vec4(0.0, 0.0, 0.0, 1.0);
        
            vec3 worldPos = getWorldPos(depth, vUv);
            vec3 worldNormal = getWorldNormal(vUv);
        
            float ao = 0.0, totalWeight = 0.0;
        
            for (int i = 0; i < spp; i++) {
                int seed = i;
        #ifdef animatedNoise
                seed += frame;
        #endif
        
                float occlusion = getOcclusion(cameraPosition.xyz, worldPos, worldNormal, depth, seed, totalWeight);
                ao += occlusion;
            }
        
            if (totalWeight > 0.) ao /= totalWeight;
        
            // clamp ao to [0, 1]
            ao = clamp(1. - ao, 0., 1.);
        
            gl_FragColor = vec4(worldNormal, ao);
        }
        `
    }
    static motion_blur(){
        return /* wgsl */`
        uniform sampler2D inputTexture;
        uniform sampler2D velocityTexture;
        uniform sampler2D blueNoiseTexture;
        uniform ivec2 blueNoiseSize;
        uniform vec2 texSize;
        uniform float intensity;
        uniform float jitter;
        
        uniform float deltaTime;
        uniform int frame;
        
        // source: https://www.shadertoy.com/view/wltcRS
        
        // internal RNG state
        uvec4 s0, s1;
        ivec2 pixel;
        
        void rng_initialize(vec2 p, int frame) {
            pixel = ivec2(p);
        
            // white noise seed
            s0 = uvec4(p, uint(frame), uint(p.x) + uint(p.y));
        
            // blue noise seed
            s1 = uvec4(frame, frame * 15843, frame * 31 + 4566, frame * 2345 + 58585);
        }
        
        // https://www.pcg-random.org/
        void pcg4d(inout uvec4 v) {
            v = v * 1664525u + 1013904223u;
            v.x += v.y * v.w;
            v.y += v.z * v.x;
            v.z += v.x * v.y;
            v.w += v.y * v.z;
            v = v ^ (v >> 16u);
            v.x += v.y * v.w;
            v.y += v.z * v.x;
            v.z += v.x * v.y;
            v.w += v.y * v.z;
        }
        
        // random blue noise sampling pos
        ivec2 shift2() {
            pcg4d(s1);
            return (pixel + ivec2(s1.xy % 0x0fffffffu)) % blueNoiseSize;
        }
        
        void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
            vec4 velocity = textureLod(velocityTexture, vUv, 0.0);
        
            if (dot(velocity.xyz, velocity.xyz) == 0.0) {
                outputColor = inputColor;
                return;
            }
        
            velocity.xy *= intensity;
        
            rng_initialize(vUv * texSize, frame);
        
            vec2 blueNoise = texelFetch(blueNoiseTexture, shift2(), 0).rg - 0.5;
        
            vec2 jitterOffset = jitter * velocity.xy * blueNoise;
        
            float frameSpeed = (1. / 100.) / deltaTime;
        
            // UVs will be centered around the target pixel (see http://john-chapman-graphics.blogspot.com/2013/01/per-object-motion-blur.html)
            vec2 startUv = vUv + (jitterOffset - velocity.xy * 0.5) * frameSpeed;
            vec2 endUv = vUv + (jitterOffset + velocity.xy * 0.5) * frameSpeed;
        
            startUv = max(vec2(0.), startUv);
            endUv = min(vec2(1.), endUv);
        
            vec3 motionBlurredColor;
            for (float i = 0.0; i <= samplesFloat; i++) {
                vec2 reprojectedUv = mix(startUv, endUv, i / samplesFloat);
                vec3 neighborColor = textureLod(inputTexture, reprojectedUv, 0.0).rgb;
        
                motionBlurredColor += neighborColor;
            }
        
            motionBlurredColor /= samplesFloat;
        
            outputColor = vec4(motionBlurredColor, inputColor.a);
        }
        `
    }
    static poissionDenoise(){
        return /* wgsl */`
        varying vec2 vUv;

        uniform sampler2D inputTexture;
        uniform sampler2D depthTexture;
        uniform sampler2D normalTexture;
        uniform mat4 projectionMatrixInverse;
        uniform mat4 cameraMatrixWorld;
        uniform float lumaPhi;
        uniform float depthPhi;
        uniform float normalPhi;
        uniform sampler2D blueNoiseTexture;
        uniform vec2 blueNoiseRepeat;
        uniform int index;
        uniform vec2 resolution;
        
        #include <common>
        #include <sampleBlueNoise>
        
        vec3 getWorldPos(float depth, vec2 coord) {
            float z = depth * 2.0 - 1.0;
            vec4 clipSpacePosition = vec4(coord * 2.0 - 1.0, z, 1.0);
            vec4 viewSpacePosition = projectionMatrixInverse * clipSpacePosition;
        
            // Perspective division
            vec4 worldSpacePosition = cameraMatrixWorld * viewSpacePosition;
            worldSpacePosition.xyz /= worldSpacePosition.w;
            return worldSpacePosition.xyz;
        }
        
        #define luminance(a) dot(vec3(0.2125, 0.7154, 0.0721), a)
        
        vec3 getNormal(vec2 uv, vec4 texel) {
        #ifdef NORMAL_IN_RGB
            // in case the normal is stored in the RGB channels of the texture
            return texel.rgb;
        #else
            return normalize(textureLod(normalTexture, uv, 0.).xyz * 2.0 - 1.0);
        #endif
        }
        
        float distToPlane(const vec3 worldPos, const vec3 neighborWorldPos, const vec3 worldNormal) {
            vec3 toCurrent = worldPos - neighborWorldPos;
            float distToPlane = abs(dot(toCurrent, worldNormal));
        
            return distToPlane;
        }
        
        void main() {
            vec4 depthTexel = textureLod(depthTexture, vUv, 0.);
        
            if (depthTexel.r == 1.0 || dot(depthTexel.rgb, depthTexel.rgb) == 0.) {
                discard;
                return;
            }
        
            vec4 texel = textureLod(inputTexture, vUv, 0.0);
        
            vec3 normal = getNormal(vUv, texel);
        
        #ifdef NORMAL_IN_RGB
            float denoised = texel.a;
            float center = texel.a;
        #else
            vec3 denoised = texel.rgb;
            float center = texel.rgb;
        #endif
        
            float depth = depthTexel.x;
            vec3 worldPos = getWorldPos(depth, vUv);
        
            float totalWeight = 1.0;
        
            vec4 blueNoise = sampleBlueNoise(blueNoiseTexture, 0, blueNoiseRepeat, resolution);
            float angle = blueNoise[index];
        
            float s = sin(angle), c = cos(angle);
        
            mat2 rotationMatrix = mat2(c, -s, s, c);
        
            for (int i = 0; i < samples; i++) {
                vec2 offset = rotationMatrix * poissonDisk[i];
                vec2 neighborUv = vUv + offset;
        
                vec4 neighborTexel = textureLod(inputTexture, neighborUv, 0.0);
        
                vec3 neighborNormal = getNormal(neighborUv, neighborTexel);
                float neighborColor = neighborTexel.a;
        
                float sampleDepth = textureLod(depthTexture, neighborUv, 0.0).x;
        
                vec3 worldPosSample = getWorldPos(sampleDepth, neighborUv);
                float tangentPlaneDist = abs(dot(worldPos - worldPosSample, normal));
        
                float normalDiff = dot(normal, neighborNormal);
                float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
        
        #ifdef NORMAL_IN_RGB
                float lumaDiff = abs(neighborColor - center);
        #else
                float lumaDiff = abs(luminance(neighborColor) - luminance(center));
        #endif
                float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
        
                float depthDiff = 1. - distToPlane(worldPos, worldPosSample, normal);
                float depthSimilarity = max(depthDiff / depthPhi, 0.);
        
                float w = lumaSimilarity * depthSimilarity * normalSimilarity;
        
                denoised += w * neighborColor;
                totalWeight += w;
            }
        
            if (totalWeight > 0.) denoised /= totalWeight;
        
        #ifdef NORMAL_IN_RGB
            gl_FragColor = vec4(normal, denoised);
        #else
            gl_FragColor = vec4(denoised, 1.);
        #endif
        }
        `
    }
    static ssao(){
        return /* wgsl */`
        varying vec2 vUv;

        uniform sampler2D depthTexture;
        uniform sampler2D normalTexture;
        uniform mat4 projectionViewMatrix;
        uniform mat4 cameraMatrixWorld;
        
        uniform sampler2D blueNoiseTexture;
        uniform vec2 blueNoiseRepeat;
        uniform vec2 texSize;
        uniform mat4 projectionMatrixInverse;
        
        uniform float aoDistance;
        uniform float distancePower;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform int frame;
        
        uniform vec3[spp] samples;
        uniform float[spp] samplesR;
        
        #include <common>
        #include <packing>
        #include <sampleBlueNoise>
        
        // source: https://github.com/N8python/ssao/blob/master/EffectShader.js#L52
        vec3 getWorldPos(const float depth, const vec2 coord) {
            float z = depth * 2.0 - 1.0;
            vec4 clipSpacePosition = vec4(coord * 2.0 - 1.0, z, 1.0);
            vec4 viewSpacePosition = projectionMatrixInverse * clipSpacePosition;
        
            // Perspective division
            vec4 worldSpacePosition = cameraMatrixWorld * viewSpacePosition;
            worldSpacePosition.xyz /= worldSpacePosition.w;
        
            return worldSpacePosition.xyz;
        }
        
        vec3 computeNormal(vec3 worldPos, vec2 vUv) {
            vec2 size = vec2(textureSize(depthTexture, 0));
            ivec2 p = ivec2(vUv * size);
            float c0 = texelFetch(depthTexture, p, 0).x;
            float l2 = texelFetch(depthTexture, p - ivec2(2, 0), 0).x;
            float l1 = texelFetch(depthTexture, p - ivec2(1, 0), 0).x;
            float r1 = texelFetch(depthTexture, p + ivec2(1, 0), 0).x;
            float r2 = texelFetch(depthTexture, p + ivec2(2, 0), 0).x;
            float b2 = texelFetch(depthTexture, p - ivec2(0, 2), 0).x;
            float b1 = texelFetch(depthTexture, p - ivec2(0, 1), 0).x;
            float t1 = texelFetch(depthTexture, p + ivec2(0, 1), 0).x;
            float t2 = texelFetch(depthTexture, p + ivec2(0, 2), 0).x;
            float dl = abs((2.0 * l1 - l2) - c0);
            float dr = abs((2.0 * r1 - r2) - c0);
            float db = abs((2.0 * b1 - b2) - c0);
            float dt = abs((2.0 * t1 - t2) - c0);
            vec3 ce = getWorldPos(c0, vUv).xyz;
            vec3 dpdx = (dl < dr) ? ce - getWorldPos(l1, (vUv - vec2(1.0 / size.x, 0.0))).xyz
                                  : -ce + getWorldPos(r1, (vUv + vec2(1.0 / size.x, 0.0))).xyz;
            vec3 dpdy = (db < dt) ? ce - getWorldPos(b1, (vUv - vec2(0.0, 1.0 / size.y))).xyz
                                  : -ce + getWorldPos(t1, (vUv + vec2(0.0, 1.0 / size.y))).xyz;
            return normalize(cross(dpdx, dpdy));
        }
        
        highp float linearize_depth(highp float d, highp float zNear, highp float zFar) {
            highp float z_n = 2.0 * d - 1.0;
            return 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));
        }
        
        void main() {
            float depth = textureLod(depthTexture, vUv, 0.).x;
        
            // filter out background
            if (depth == 1.0) {
                discard;
                return;
            }
        
            vec3 worldPos = getWorldPos(depth, vUv);
            vec3 normal = computeNormal(worldPos, vUv);
        
        #ifdef animatedNoise
            int seed = frame;
        #else
            int seed = 0;
        #endif
        
            vec4 noise = sampleBlueNoise(blueNoiseTexture, seed, blueNoiseRepeat, texSize);
        
            vec3 randomVec = normalize(noise.rgb * 2.0 - 1.0);
            vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));
            vec3 bitangent = cross(normal, tangent);
            mat3 tbn = mat3(tangent, bitangent, normal);
        
            float occluded = 0.0;
            float totalWeight = 0.0;
        
            vec3 samplePos;
        
            float sppF = float(spp);
        
            for (float i = 0.0; i < sppF; i++) {
                vec3 sampleDirection = tbn * samples[int(i)];
        
                // make sure sample direction is in the same hemisphere as the normal
                if (dot(sampleDirection, normal) < 0.0) sampleDirection *= -1.0;
        
                float moveAmt = samplesR[int(mod(i + noise.a * sppF, sppF))];
                samplePos = worldPos + aoDistance * moveAmt * sampleDirection;
        
                vec4 offset = projectionViewMatrix * vec4(samplePos, 1.0);
                offset.xyz /= offset.w;
                offset.xyz = offset.xyz * 0.5 + 0.5;
        
                float sampleDepth = textureLod(depthTexture, offset.xy, 0.0).x;
        
                float distSample = linearize_depth(sampleDepth, cameraNear, cameraFar);
                float distWorld = linearize_depth(offset.z, cameraNear, cameraFar);
        
                float rangeCheck = smoothstep(0.0, 1.0, aoDistance / (aoDistance * abs(distSample - distWorld)));
                rangeCheck = pow(rangeCheck, distancePower);
                float weight = dot(sampleDirection, normal);
        
                occluded += rangeCheck * weight * (distSample < distWorld ? 1.0 : 0.0);
                totalWeight += weight;
            }
        
            float occ = clamp(1.0 - occluded / totalWeight, 0.0, 1.0);
            gl_FragColor = vec4(normal, occ);
        }
        `
    }
    static ssgi_compose(){
        return /* wgsl */`
        uniform sampler2D inputTexture;
        uniform sampler2D sceneTexture;
        uniform sampler2D depthTexture;
        uniform int toneMapping;
        
        #include <tonemapping_pars_fragment>
        
        #pragma tonemapping_pars_fragment
        
        void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
            vec4 depthTexel = textureLod(depthTexture, uv, 0.);
            vec3 ssgiClr;
        
            if (dot(depthTexel.rgb, depthTexel.rgb) == 0.) {
                ssgiClr = textureLod(sceneTexture, uv, 0.).rgb;
            } else {
                ssgiClr = textureLod(inputTexture, uv, 0.).rgb;
        
                switch (toneMapping) {
                    case 1:
                        ssgiClr = LinearToneMapping(ssgiClr);
                        break;
        
                    case 2:
                        ssgiClr = ReinhardToneMapping(ssgiClr);
                        break;
        
                    case 3:
                        ssgiClr = OptimizedCineonToneMapping(ssgiClr);
                        break;
        
                    case 4:
                        ssgiClr = ACESFilmicToneMapping(ssgiClr);
                        break;
        
                    case 5:
                        ssgiClr = CustomToneMapping(ssgiClr);
                        break;
                }
        
                ssgiClr *= toneMappingExposure;
            }
        
            outputColor = vec4(ssgiClr, 1.0);
        }
        `
    }
    static denoise_compose(){
        return /* wgsl */`
        vec3 viewNormal = (vec4(normal, 0.) * cameraMatrixWorld).xyz;

        roughness *= roughness;
        
        // view-space position of the current texel
        vec3 viewPos = getViewPosition(depth);
        vec3 viewDir = normalize(viewPos);
        
        vec3 T, B;
        
        vec3 n = viewNormal;  // view-space normal
        vec3 v = viewDir;     // incoming vector
        
        // convert view dir and view normal to world-space
        vec3 V = (vec4(v, 0.) * viewMatrix).xyz;  // invert view dir
        vec3 N = normal;
        
        Onb(N, T, B);
        
        V = ToLocal(T, B, N, V);
        
        // seems to approximate Fresnel very well
        vec3 H = SampleGGXVNDF(V, roughness, roughness, 0.25, 0.25);
        if (H.z < 0.0) H = -H;
        
        vec3 l = normalize(reflect(-V, H));
        l = ToWorld(T, B, N, l);
        
        // convert reflected vector back to view-space
        l = (vec4(l, 1.) * cameraMatrixWorld).xyz;
        l = normalize(l);
        
        if (dot(viewNormal, l) < 0.) l = -l;
        
        vec3 h = normalize(v + l);  // half vector
        
        // try to approximate the fresnel term we get when accumulating over multiple frames
        float VoH = max(EPSILON, dot(v, h));
        VoH = pow(VoH, 0.875);
        
        vec4 diffuseTexel = textureLod(diffuseTexture, vUv, 0.);
        vec3 diffuse = diffuseTexel.rgb;
        float metalness = diffuseTexel.a;
        
        // fresnel
        vec3 f0 = mix(vec3(0.04), diffuse, metalness);
        vec3 F = F_Schlick(f0, VoH);
        
        vec3 directLight = textureLod(directLightTexture, vUv, 0.).rgb;
        
        #ifdef ssgi
        vec3 diffuseLightingColor = denoisedColor[0];
        vec3 diffuseComponent = diffuse * (1. - metalness) * (1. - F) * diffuseLightingColor;
        
        vec3 specularLightingColor = denoisedColor[1];
        vec3 specularComponent = specularLightingColor * F;
        
        denoisedColor[0] = diffuseComponent + specularComponent;
        #endif
        
        #ifdef ssdgi
        vec3 diffuseLightingColor = denoisedColor[0];
        vec3 diffuseComponent = diffuse * (1. - metalness) * (1. - F) * diffuseLightingColor;
        
        denoisedColor[0] = diffuseComponent;
        #endif
        
        #ifdef ssr
        vec3 specularLightingColor = denoisedColor[0];
        vec3 specularComponent = specularLightingColor * F;
        
        denoisedColor[0] = specularComponent;
        #endif
        
        #ifdef useDirectLight
        denoisedColor[0] += directLight;
        #endif
        
        `
    }
    static denoise_compose_functions(){
        return /* wgsl */`
        uniform sampler2D diffuseTexture;
        uniform sampler2D directLightTexture;
        
        // source: https://github.com/mrdoob/three.js/blob/dev/examples/js/shaders/SSAOShader.js
        vec3 getViewPosition(const float depth) {
            float clipW = projectionMatrix[2][3] * depth + projectionMatrix[3][3];
            vec4 clipPosition = vec4((vec3(vUv, depth) - 0.5) * 2.0, 1.0);
            clipPosition *= clipW;
            return (projectionMatrixInverse * clipPosition).xyz;
        }
        
        vec3 F_Schlick(const vec3 f0, const float theta) {
            return f0 + (1. - f0) * pow(1.0 - theta, 5.);
        }
        
        vec3 SampleGGXVNDF(const vec3 V, const float ax, const float ay, const float r1, const float r2) {
            vec3 Vh = normalize(vec3(ax * V.x, ay * V.y, V.z));
        
            float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
            vec3 T1 = lensq > 0. ? vec3(-Vh.y, Vh.x, 0.) * inversesqrt(lensq) : vec3(1., 0., 0.);
            vec3 T2 = cross(Vh, T1);
        
            float r = sqrt(r1);
            float phi = 2.0 * PI * r2;
            float t1 = r * cos(phi);
            float t2 = r * sin(phi);
            float s = 0.5 * (1.0 + Vh.z);
            t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;
        
            vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;
        
            return normalize(vec3(ax * Nh.x, ay * Nh.y, max(0.0, Nh.z)));
        }
        
        void Onb(const vec3 N, inout vec3 T, inout vec3 B) {
            vec3 up = abs(N.z) < 0.9999999 ? vec3(0, 0, 1) : vec3(1, 0, 0);
            T = normalize(cross(up, N));
            B = cross(N, T);
        }
        
        vec3 ToLocal(const vec3 X, const vec3 Y, const vec3 Z, const vec3 V) {
            return vec3(dot(V, X), dot(V, Y), dot(V, Z));
        }
        
        vec3 ToWorld(const vec3 X, const vec3 Y, const vec3 Z, const vec3 V) {
            return V.x * X + V.y * Y + V.z * Z;
        }
        `
    }
    static temporal_reproject(){
        return /* wgsl */`
        varying vec2 vUv;

        uniform sampler2D velocityTexture;
        
        uniform sampler2D depthTexture;
        uniform sampler2D lastDepthTexture;
        
        uniform float blend;
        uniform float neighborhoodClampIntensity;
        uniform bool constantBlend;
        uniform bool fullAccumulate;
        uniform vec2 invTexSize;
        
        uniform mat4 projectionMatrix;
        uniform mat4 projectionMatrixInverse;
        uniform mat4 cameraMatrixWorld;
        uniform vec3 cameraPos;
        uniform mat4 prevViewMatrix;
        uniform mat4 prevCameraMatrixWorld;
        uniform mat4 prevProjectionMatrix;
        uniform mat4 prevProjectionMatrixInverse;
        
        uniform bool reset;
        uniform float delta;
        
        #define EPSILON 0.00001
        
        #include <packing>
        #include <reproject>
        
        void main() {
            getDepthAndDilatedUVOffset(depthTexture, vUv, depth, dilatedDepth, depthTexel);
        
            if (dot(depthTexel.rgb, depthTexel.rgb) == 0.0) {
        #ifdef neighborhoodClamp
            #pragma unroll_loop_start
                for (int i = 0; i < textureCount; i++) {
                    gOutput[i] = textureLod(inputTexture[i], vUv, 0.0);
                }
            #pragma unroll_loop_end
        #else
                discard;
        #endif
                return;
            }
        
            vec2 dilatedUv = vUv + dilatedUvOffset;
            edgeStrength = computeEdgeStrength(depth, invTexSize);
        
            vec4 inputTexel[textureCount];
            vec4 accumulatedTexel[textureCount];
            bool textureSampledThisFrame[textureCount];
        
        #pragma unroll_loop_start
            for (int i = 0; i < textureCount; i++) {
                inputTexel[i] = textureLod(inputTexture[i], vUv, 0.0);
        
                doColorTransform[i] = luminance(inputTexel[i].rgb) > 0.0;
        
                textureSampledThisFrame[i] = inputTexel[i].r >= 0.;
        
                if (textureSampledThisFrame[i]) {
                    transformColor(inputTexel[i].rgb);
                } else {
                    inputTexel[i].rgb = vec3(0.0);
                }
        
                texIndex++;
            }
        #pragma unroll_loop_end
        
            texIndex = 0;
        
            velocityTexel = textureLod(velocityTexture, vUv, 0.0);
            didMove = dot(velocityTexel.xy, velocityTexel.xy) > 0.000000001;
        
        #ifdef dilation
            vec2 octahedronEncodedNormal = textureLod(velocityTexture, dilatedUv, 0.0).ba;
        #else
            vec2 octahedronEncodedNormal = velocityTexel.ba;
        #endif
        
            vec3 worldNormal = Decode(octahedronEncodedNormal);
            vec3 worldPos = screenSpaceToWorldSpace(vUv, depth, cameraMatrixWorld, projectionMatrixInverse);
        
            vec2 reprojectedUvDiffuse = vec2(-10.0);
            vec2 reprojectedUvSpecular[textureCount];
            vec2 reprojectedUv;
            bool reprojectHitPoint;
        
        #pragma unroll_loop_start
            for (int i = 0; i < textureCount; i++) {
                reprojectHitPoint = reprojectSpecular[i] && inputTexel[i].a > 0.0;
        
                // specular (hit point reprojection)
                if (reprojectHitPoint) {
                    reprojectedUvSpecular[i] = getReprojectedUV(depth, worldPos, worldNormal, inputTexel[i].a);
                } else {
                    // init to -1 to signify that reprojection failed
                    reprojectedUvSpecular[i] = vec2(-1.0);
                }
        
                // diffuse (reprojection using velocity)
                if (reprojectedUvDiffuse.x == -10.0 && reprojectedUvSpecular[i].x < 0.0) {
                    reprojectedUvDiffuse = getReprojectedUV(depth, worldPos, worldNormal, 0.0);
                }
        
                // choose which UV coordinates to use for reprojecion
                reprojectedUv = reprojectedUvSpecular[i].x >= 0.0 ? reprojectedUvSpecular[i] : reprojectedUvDiffuse;
        
                // check if any reprojection was successful
                if (reprojectedUv.x < 0.0) {  // invalid UV
                    // reprojection was not successful -> reset to the input texel
                    accumulatedTexel[i] = vec4(inputTexel[i].rgb, 0.0);
                } else {
                    accumulatedTexel[i] = sampleReprojectedTexture(accumulatedTexture[i], reprojectedUv);
        
                    transformColor(accumulatedTexel[i].rgb);
        
                    if (textureSampledThisFrame[i]) {
                        accumulatedTexel[i].a++;  // add one more frame
        
                        if (neighborhoodClamp[i]) {
                            vec3 clampedColor = accumulatedTexel[i].rgb;
                            clampNeighborhood(inputTexture[i], clampedColor, inputTexel[i].rgb);
        
                            accumulatedTexel[i].rgb = mix(accumulatedTexel[i].rgb, clampedColor, neighborhoodClampIntensity);
                        }
                    } else {
                        inputTexel[i].rgb = accumulatedTexel[i].rgb;
                    }
                }
        
                texIndex++;
            }
        #pragma unroll_loop_end
        
            texIndex = 0;
        
            float m = 1. - delta / (1. / 60.);
            float fpsAdjustedBlend = blend + max(0., (1. - blend) * m);
        
            float maxValue = (fullAccumulate && !didMove) ? 1.0 : fpsAdjustedBlend;
        
            vec3 outputColor;
            float temporalReprojectMix;
        
        #pragma unroll_loop_start
            for (int i = 0; i < textureCount; i++) {
                if (constantBlend) {
                    temporalReprojectMix = accumulatedTexel[i].a == 0.0 ? 0.0 : fpsAdjustedBlend;
                } else {
                    temporalReprojectMix = fpsAdjustedBlend;
        
                    if (reset) accumulatedTexel[i].a = 0.0;
        
                    temporalReprojectMix = min(1. - 1. / (accumulatedTexel[i].a + 1.0), maxValue);
                }
        
                outputColor = mix(inputTexel[i].rgb, accumulatedTexel[i].rgb, temporalReprojectMix);
                undoColorTransform(outputColor);
        
                gOutput[i] = vec4(outputColor, accumulatedTexel[i].a);
        
                texIndex++;
            }
        #pragma unroll_loop_end
        
        // the user's shader to compose a final outputColor from the inputTexel and accumulatedTexel
        #ifdef useTemporalReprojectCustomComposeShader
            temporalReprojectCustomComposeShader
        #endif
        }
        `
    }
    static reproject(){
        return /* wgsl */`
        vec4 velocityTexel;
        float dilatedDepth;
        vec2 dilatedUvOffset;
        int texIndex;
        bool didMove;
        
        vec4 depthTexel;
        float depth;
        float edgeStrength;
        
        #define luminance(a) dot(vec3(0.2125, 0.7154, 0.0721), a)
        
        vec3 screenSpaceToWorldSpace(const vec2 uv, const float depth, mat4 curMatrixWorld, const mat4 projMatrixInverse) {
            vec4 ndc = vec4(
                (uv.x - 0.5) * 2.0,
                (uv.y - 0.5) * 2.0,
                (depth - 0.5) * 2.0,
                1.0);
        
            vec4 clip = projMatrixInverse * ndc;
            vec4 view = curMatrixWorld * (clip / clip.w);
        
            return view.xyz;
        }
        
        vec2 viewSpaceToScreenSpace(const vec3 position, const mat4 projMatrix) {
            vec4 projectedCoord = projMatrix * vec4(position, 1.0);
            projectedCoord.xy /= projectedCoord.w;
            // [-1, 1] --> [0, 1] (NDC to screen position)
            projectedCoord.xy = projectedCoord.xy * 0.5 + 0.5;
        
            return projectedCoord.xy;
        }
        
        bool doColorTransform[textureCount];
        
        #ifdef logTransform
        // idea from: https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/
        void transformColor(inout vec3 color) {
            if (!doColorTransform[texIndex]) return;
            float lum = luminance(color);
        
            float diff = min(1.0, lum - 0.99);
            if (diff > 0.0) {
                color = vec3(diff * 0.1);
                return;
            }
        
            color = log(max(color, vec3(EPSILON)));
        }
        
        void undoColorTransform(inout vec3 color) {
            if (!doColorTransform[texIndex]) return;
        
            color = exp(color);
        }
        #else
            #define transformColor
            #define undoColorTransform
        #endif
        
        void getNeighborhoodAABB(const sampler2D tex, inout vec3 minNeighborColor, inout vec3 maxNeighborColor) {
            for (int x = -neighborhoodClampRadius; x <= neighborhoodClampRadius; x++) {
                for (int y = -neighborhoodClampRadius; y <= neighborhoodClampRadius; y++) {
                    if (x != 0 || y != 0) {
                        vec2 offset = vec2(x, y) * invTexSize;
                        vec2 neighborUv = vUv + offset;
        
                        vec4 neighborTexel = textureLod(tex, neighborUv, 0.0);
                        transformColor(neighborTexel.rgb);
        
                        minNeighborColor = min(neighborTexel.rgb, minNeighborColor);
                        maxNeighborColor = max(neighborTexel.rgb, maxNeighborColor);
                    }
                }
            }
        }
        
        void clampNeighborhood(const sampler2D tex, inout vec3 color, const vec3 inputColor) {
            vec3 minNeighborColor = inputColor;
            vec3 maxNeighborColor = inputColor;
        
            getNeighborhoodAABB(tex, minNeighborColor, maxNeighborColor);
        
            color = clamp(color, minNeighborColor, maxNeighborColor);
        }
        
        #ifdef dilation
        void getDilatedDepthUVOffset(const sampler2D tex, const vec2 centerUv, out float depth, out float dilatedDepth, out vec4 closestDepthTexel) {
            float closestDepth = 0.0;
        
            for (int x = -1; x <= 1; x++) {
                for (int y = -1; y <= 1; y++) {
                    vec2 offset = vec2(x, y) * invTexSize;
                    vec2 neighborUv = centerUv + offset;
        
                    vec4 neighborDepthTexel = textureLod(tex, neighborUv, 0.0);
                    float neighborDepth = unpackRGBAToDepth(neighborDepthTexel);
        
                    if (x == 0 && y == 0) depth = neighborDepth;
        
                    if (neighborDepth > closestDepth) {
                        closestDepth = neighborDepth;
                        closestDepthTexel = neighborDepthTexel;
                        dilatedUvOffset = offset;
                    }
                }
            }
        
            dilatedDepth = closestDepth;
        }
        #endif
        
        void getDepthAndDilatedUVOffset(sampler2D depthTex, vec2 uv, out float depth, out float dilatedDepth, out vec4 depthTexel) {
        #ifdef dilation
            getDilatedDepthUVOffset(depthTex, uv, depth, dilatedDepth, depthTexel);
        #else
            depthTexel = textureLod(depthTex, uv, 0.);
            depth = unpackRGBAToDepth(depthTexel);
            dilatedDepth = depth;
        #endif
        }
        
        bool planeDistanceDisocclusionCheck(const vec3 worldPos, const vec3 lastWorldPos, const vec3 worldNormal, const float worldDistFactor) {
            if (abs(dot(worldNormal, worldPos)) == 0.0) return false;
        
            vec3 toCurrent = worldPos - lastWorldPos;
            float distToPlane = abs(dot(toCurrent, worldNormal));
        
            return distToPlane > depthDistance * worldDistFactor;
        }
        
        bool worldDistanceDisocclusionCheck(const vec3 worldPos, const vec3 lastWorldPos, const float worldDistFactor) {
            return distance(worldPos, lastWorldPos) > worldDistance * worldDistFactor;
        }
        
        bool validateReprojectedUV(const vec2 reprojectedUv, const vec3 worldPos, const vec3 worldNormal) {
            if (reprojectedUv.x > 1.0 || reprojectedUv.x < 0.0 || reprojectedUv.y > 1.0 || reprojectedUv.y < 0.0) return false;
        
            vec3 dilatedWorldPos = worldPos;
            vec3 lastWorldPos;
            float dilatedLastDepth, lastDepth;
            vec4 lastDepthTexel;
            vec2 dilatedReprojectedUv;
        
        #ifdef dilation
            // by default the worldPos is not dilated as it would otherwise mess up reprojecting hit points in the method "reprojectHitPoint"
            dilatedWorldPos = screenSpaceToWorldSpace(vUv + dilatedUvOffset, dilatedDepth, cameraMatrixWorld, projectionMatrixInverse);
        
            getDepthAndDilatedUVOffset(lastDepthTexture, reprojectedUv, lastDepth, dilatedLastDepth, lastDepthTexel);
        
            dilatedReprojectedUv = reprojectedUv + dilatedUvOffset;
        #else
            lastDepthTexel = textureLod(lastDepthTexture, reprojectedUv, 0.);
            lastDepth = unpackRGBAToDepth(lastDepthTexel);
            dilatedLastDepth = lastDepth;
        
            dilatedReprojectedUv = reprojectedUv;
        #endif
        
            lastWorldPos = screenSpaceToWorldSpace(dilatedReprojectedUv, dilatedLastDepth, prevCameraMatrixWorld, prevProjectionMatrixInverse);
        
            float worldDistFactor = clamp((50.0 + distance(dilatedWorldPos, cameraPos)) / 100., 0.25, 1.);
        
            if (worldDistanceDisocclusionCheck(dilatedWorldPos, lastWorldPos, worldDistFactor)) return false;
        
            return !planeDistanceDisocclusionCheck(dilatedWorldPos, lastWorldPos, worldNormal, worldDistFactor);
        }
        
        vec2 reprojectHitPoint(const vec3 rayOrig, const float rayLength, const float depth) {
            vec3 cameraRay = normalize(rayOrig - cameraPos);
            float cameraRayLength = distance(rayOrig, cameraPos);
        
            vec3 parallaxHitPoint = cameraPos + cameraRay * (cameraRayLength + rayLength);
        
            vec4 reprojectedParallaxHitPoint = prevViewMatrix * vec4(parallaxHitPoint, 1.0);
            vec2 hitPointUv = viewSpaceToScreenSpace(reprojectedParallaxHitPoint.xyz, prevProjectionMatrix);
        
            return hitPointUv;
        }
        
        vec2 getReprojectedUV(const float depth, const vec3 worldPos, const vec3 worldNormal, const float rayLength) {
            // hit point reprojection
            if (rayLength != 0.0) {
                vec2 reprojectedUv = reprojectHitPoint(worldPos, rayLength, depth);
        
                if (validateReprojectedUV(reprojectedUv, worldPos, worldNormal)) {
                    return reprojectedUv;
                }
        
                return vec2(-1.);
            }
        
            // reprojection using motion vectors
            vec2 reprojectedUv = vUv - velocityTexel.rg;
        
            if (validateReprojectedUV(reprojectedUv, worldPos, worldNormal)) {
                return reprojectedUv;
            }
        
            // invalid reprojection
            return vec2(-1.);
        }
        
        vec4 SampleTextureCatmullRom(const sampler2D tex, const vec2 uv, const vec2 texSize) {
            // We're going to sample a a 4x4 grid of texels surrounding the target UV coordinate. We'll do this by rounding
            // down the sample location to get the exact center of our "starting" texel. The starting texel will be at
            // location [1, 1] in the grid, where [0, 0] is the top left corner.
            vec2 samplePos = uv * texSize;
            vec2 texPos1 = floor(samplePos - 0.5f) + 0.5f;
        
            // Compute the fractional offset from our starting texel to our original sample location, which we'll
            // feed into the Catmull-Rom spline function to get our filter weights.
            vec2 f = samplePos - texPos1;
        
            // Compute the Catmull-Rom weights using the fractional offset that we calculated earlier.
            // These equations are pre-expanded based on our knowledge of where the texels will be located,
            // which lets us avoid having to evaluate a piece-wise function.
            vec2 w0 = f * (-0.5f + f * (1.0f - 0.5f * f));
            vec2 w1 = 1.0f + f * f * (-2.5f + 1.5f * f);
            vec2 w2 = f * (0.5f + f * (2.0f - 1.5f * f));
            vec2 w3 = f * f * (-0.5f + 0.5f * f);
        
            // Work out weighting factors and sampling offsets that will let us use bilinear filtering to
            // simultaneously evaluate the middle 2 samples from the 4x4 grid.
            vec2 w12 = w1 + w2;
            vec2 offset12 = w2 / (w1 + w2);
        
            // Compute the final UV coordinates we'll use for sampling the texture
            vec2 texPos0 = texPos1 - 1.;
            vec2 texPos3 = texPos1 + 2.;
            vec2 texPos12 = texPos1 + offset12;
        
            texPos0 /= texSize;
            texPos3 /= texSize;
            texPos12 /= texSize;
        
            vec4 result = vec4(0.0);
            result += textureLod(tex, vec2(texPos0.x, texPos0.y), 0.0f) * w0.x * w0.y;
            result += textureLod(tex, vec2(texPos12.x, texPos0.y), 0.0f) * w12.x * w0.y;
            result += textureLod(tex, vec2(texPos3.x, texPos0.y), 0.0f) * w3.x * w0.y;
            result += textureLod(tex, vec2(texPos0.x, texPos12.y), 0.0f) * w0.x * w12.y;
            result += textureLod(tex, vec2(texPos12.x, texPos12.y), 0.0f) * w12.x * w12.y;
            result += textureLod(tex, vec2(texPos3.x, texPos12.y), 0.0f) * w3.x * w12.y;
            result += textureLod(tex, vec2(texPos0.x, texPos3.y), 0.0f) * w0.x * w3.y;
            result += textureLod(tex, vec2(texPos12.x, texPos3.y), 0.0f) * w12.x * w3.y;
            result += textureLod(tex, vec2(texPos3.x, texPos3.y), 0.0f) * w3.x * w3.y;
        
            result = max(result, vec4(0.));
        
            return result;
        }
        
        // source: https://www.shadertoy.com/view/stSfW1
        vec2 sampleBlocky(vec2 p) {
            vec2 d = vec2(dFdx(p.x), dFdy(p.y)) / invTexSize;
            p /= invTexSize;
            vec2 fA = p - 0.5 * d, iA = floor(fA);
            vec2 fB = p + 0.5 * d, iB = floor(fB);
            return (iA + (iB - iA) * (fB - iB) / d + 0.5) * invTexSize;
        }
        
        float computeEdgeStrength(float unpackedDepth, vec2 texelSize) {
            // Compute the depth gradients in the x and y directions using central differences
            float depthX = unpackRGBAToDepth(textureLod(depthTexture, vUv + vec2(texelSize.x, 0.0), 0.0)) -
                           unpackRGBAToDepth(textureLod(depthTexture, vUv - vec2(texelSize.x, 0.0), 0.0));
        
            float depthY = unpackRGBAToDepth(textureLod(depthTexture, vUv + vec2(0.0, texelSize.y), 0.0)) -
                           unpackRGBAToDepth(textureLod(depthTexture, vUv - vec2(0.0, texelSize.y), 0.0));
        
            // Calculate the gradient magnitude
            float gradientMagnitude = sqrt(depthX * depthX + depthY * depthY);
        
            // Calculate the edge strength
            float edgeStrength = min(100000. * gradientMagnitude / (unpackedDepth + 0.001), 1.);
        
            return edgeStrength * edgeStrength;
        }
        
        float computeEdgeStrengthFast(float unpackedDepth) {
            float depthX = dFdx(unpackedDepth);
            float depthY = dFdy(unpackedDepth);
        
            // Compute the edge strength as the magnitude of the gradient
            float edgeStrength = depthX * depthX + depthY * depthY;
        
            return min(1., pow(pow(edgeStrength, 0.25) * 500., 4.));
        }
        
        vec4 sampleReprojectedTexture(const sampler2D tex, const vec2 reprojectedUv) {
            vec4 catmull = SampleTextureCatmullRom(tex, reprojectedUv, 1.0 / invTexSize);
            vec4 blocky = SampleTextureCatmullRom(tex, sampleBlocky(reprojectedUv), 1.0 / invTexSize);
        
            vec4 reprojectedTexel = mix(catmull, blocky, edgeStrength);
            reprojectedTexel.a = min(catmull.a, blocky.a);
        
            return reprojectedTexel;
        }
        
        // source: https://knarkowicz.wordpress.com/2014/04/16/octahedron-normal-vector-encoding/
        vec2 OctWrap(vec2 v) {
            vec2 w = 1.0 - abs(v.yx);
            if (v.x < 0.0) w.x = -w.x;
            if (v.y < 0.0) w.y = -w.y;
            return w;
        }
        
        vec2 Encode(vec3 n) {
            n /= (abs(n.x) + abs(n.y) + abs(n.z));
            n.xy = n.z > 0.0 ? n.xy : OctWrap(n.xy);
            n.xy = n.xy * 0.5 + 0.5;
            return n.xy;
        }
        
        // source: https://knarkowicz.wordpress.com/2014/04/16/octahedron-normal-vector-encoding/
        vec3 Decode(vec2 f) {
            f = f * 2.0 - 1.0;
        
            // https://twitter.com/Stubbesaurus/status/937994790553227264
            vec3 n = vec3(f.x, f.y, 1.0 - abs(f.x) - abs(f.y));
            float t = max(-n.z, 0.0);
            n.x += n.x >= 0.0 ? -t : t;
            n.y += n.y >= 0.0 ? -t : t;
            return normalize(n);
        }
        `
    }
    static traa_compose(){
        return /* wgsl */`
        uniform sampler2D inputTexture;

        void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
            vec4 accumulatedTexel = textureLod(inputTexture, vUv, 0.);
        
            outputColor = vec4(accumulatedTexel.rgb, 1.);
        }
        `
    }
    static t(){
        return /* wgsl */`
        v
        `
    }
    static t(){
        return /* wgsl */`
        v
        `
    }
    static t(){
        return /* wgsl */`
        v
        `
    }
    static t(){
        return /* wgsl */`
        v
        `
    }

}
export { Shader }