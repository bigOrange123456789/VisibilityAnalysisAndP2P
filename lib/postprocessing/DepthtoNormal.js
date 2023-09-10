
var DepthtoNormal = {
	uniforms: {
		'tDiffuse': { value: null },
		'u_Near': { value: 1 },
		'u_Far': { value: 100 },
		'u_Fov': { value: 2 },
		'u_WindowWidth': { value: null },
		'u_WindowHeight': { value: null },
	},
	vertexShader: /* glsl */`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }`,
	fragmentShader: /* glsl */`
	varying vec2 vUv;
	uniform sampler2D tDiffuse;
uniform float u_Near;
uniform float u_Far;
uniform float u_Fov;
uniform float u_WindowWidth;
uniform float u_WindowHeight;
float ViewSpaceZFromDepth(float d)
{
	d = d * 2.0 - 1.0;
    return (2.0 * u_Near * u_Far) / (u_Far + u_Near - d * (u_Far - u_Near)); 
}

vec3 UVToViewSpace(vec2 uv, float z)
{
	uv = uv * 2.0 - 1.0;
	uv.x = uv.x  * u_WindowWidth / u_WindowHeight  * z ;
	uv.y = uv.y   * z ;
	return vec3(uv, -z);
}

vec3 GetViewPos(vec2 uv)
{
	float z = ViewSpaceZFromDepth(texture(tDiffuse, uv).r);
	return UVToViewSpace(uv, z);
}
float Length2(vec3 V)
{
	return dot(V,V);
}

vec3 MinDiff(vec3 P, vec3 Pr, vec3 Pl)
{
    vec3 V1 = Pr - P;
    vec3 V2 = P - Pl;
    return (Length2(V1) < Length2(V2)) ? V1 : V2;
}
vec3 poss(vec2 offset)
{
	return vec3((vUv+offset), texture(tDiffuse, vUv+offset).r);
}
void main()
{
	float xOffset = 1.0/(u_WindowWidth-1.0);
	float yOffset = 1.0/(u_WindowHeight-1.0);
	vec3 P =  vec3(vUv,texture(tDiffuse, vUv).r);
	vec3 Pl = poss(vec2(-xOffset,0));
	vec3 Pr = poss(vec2(xOffset,0));
	vec3 Pu = poss(vec2(0,yOffset));
	vec3 Pd = poss(vec2(0,-yOffset));
	vec3 leftDir = MinDiff(P, Pr, Pl);
    vec3 upDir = MinDiff(P, Pu, Pd);
	vec3 Nomal = normalize(cross(leftDir,upDir));
	gl_FragColor=vec4(Nomal,1.0);
	//gl_FragColor=vec4(abs(vec3(normalize(P).g))*100000.0,1.0);
	//gl_FragColor = vec4(vec3(ViewSpaceZFromDepth(texture(tDiffuse, vUv).r))/50.0, 1.0f);
//	Color_ = vec4(GetViewPos(v2f_TexCoords), 1.0f);
}`
};
var GodRayShader = {
	uniforms: {
		'tDiffuse': { value: null },
		'decay': { value: 0.97 },
		'density': { value: 0.5 },
		'weight': { value: 0.05 },
		'iTime': { value: 0 },
		'SAMPLES':{value:24}
	},
	vertexShader:`
	varying vec2 vUv;
    void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
	`,
	fragmentShader:/* glsl */`
		uniform float SAMPLES;
		uniform float iTime;
		varying vec2 vUv;
		uniform sampler2D tDiffuse;
		
    // Falloff, as we radiate outwards.
    uniform float decay;
    // Controls the sample density, which in turn, controls the sample spread.
    uniform float density;
    // Sample weight. Decays as we radiate outwards.
    uniform float weight;
		// 2x1 hash. Used to jitter the samples.
		float hash(vec2 p) { return fract(sin(dot(p, vec2(41, 289))) * 45758.5453); }


// Light offset.
//
// I realized, after a while, that determining the correct light position doesn't help, since 
// radial blur doesn't really look right unless its focus point is within the screen boundaries, 
// whereas the light is often out of frame. Therefore, I decided to go for something that at 
// least gives the feel of following the light. In this case, I normalized the light position 
// and rotated it in unison with the camera rotation. Hacky, for sure, but who's checking? :)
vec3 lOff() {

    vec2 u = sin(vec2(1.57, 0) - iTime / 2.);
    mat2 a = mat2(u, -u.y, u.x);

    vec3 l = normalize(vec3(1.5, 1., -0.5));
			l.xz = a * l.xz;
			l.xy = a * l.xy;

			return l;

		}



void main(){

	// Screen coordinates.
	vec2 uv = vUv;

    // Radial blur factors.
    //

    // Light offset. Kind of fake. See above.
    vec3 l = lOff();
	float _weight=weight;
    // Offset texture position (uv - .5), offset again by the fake light movement.
    // It's used to set the blur direction (a direction vector of sorts), and is used
    // later to center the spotlight.
    //
    // The range is centered on zero, which allows the accumulation to spread out in
    // all directions. Ie; It's radial.
    vec2 tuv = uv - .5 - l.xy * .45;

    // Dividing the direction vector above by the sample number and a density factor
    // which controls how far the blur spreads out. Higher density means a greater
    // blur radius.
    vec2 dTuv = tuv * density / SAMPLES;

    // Grabbing a portion of the initial texture sample. Higher numbers will make the
    // scene a little clearer, but I'm going for a bit of abstraction.
    vec4 col = texture2D(tDiffuse, uv.xy) * 0.25;

// Jittering, to get rid of banding. Vitally important when accumulating discontinuous
// samples, especially when only a few layers are being used.
uv += dTuv * (hash(uv.xy + fract(iTime)) * 2. - 1.);

// The radial blur loop. Take a texture sample, move a little in the direction of
// the radial direction vector (dTuv) then take another, slightly less weighted,
// sample, add it to the total, then repeat the process until done
vec4 base=texture2D(tDiffuse,vUv);
for (float i = 0.; i < SAMPLES; i++) {

	uv -= dTuv;

	col += texture2D(tDiffuse, uv) * _weight;
	_weight *= decay;

}
gl_FragColor=base+(max(col,base)-base)*(vUv.y)*vec4(1.0,1.0,0.8,1.0);
//gl_FragColor=max(col,texture2D(tDiffuse,vUv));
// Multiplying the final color with a spotlight centered on the focal point of the radial
// blur. It's a nice finishing touch... that Passion came up with. If it's a good idea,
// it didn't come from me. :)
col *= (1. - dot(tuv, tuv) * .75);
//gl_FragColor=col;
// Smoothstepping the final color, just to bring it out a bit, then applying some
// loose gamma correction.
//gl_FragColor = sqrt(smoothstep(0., 1., col));

    // Bypassing the radial blur to show the raymarched scene on its own.
    //fragColor = sqrt(texture(iChannel0, fragCoord.xy / iResolution.xy));
}

	`
}

export { DepthtoNormal, GodRayShader };
