export const ToLDR =/* glsl */`
    
vec3 saturate(vec3 rgb)
{
    return clamp(rgb,0.f,1.f);
}
vec3 ACESFilm(vec3 x)
{
    float a = 2.51f;
    float b = 0.03f;
    float c = 2.43f;
    float d = 0.59f;
    float e = 0.14f;
    return saturate((x*(a*x + b)) / (x*(c*x + d) + e));
}

vec3 LessThan(vec3 f, float value)
{
    return vec3(
        (f.x < value) ? 1.f : 0.f,
        (f.y < value) ? 1.f : 0.f,
        (f.z < value) ? 1.f : 0.f
    );
}
vec3 LinearToSRGB(vec3 rgb)
{
    rgb = clamp(rgb, 0.f, 1.f);
    return lerp(
        pow(rgb * 1.055f, vec3(1.f / 2.4f)) - 0.055f,
        rgb * 12.92f,
        LessThan(rgb, 0.0031308f)
    );
}

    uniform bool tonemapping;
    uniform bool gamma;
    uniform float exposure;
    const float sigma = 2.0f;
	vec4 ToLDR(vec3 result)
    {
        result *= sigma;
		result *= exposure;//2.
		
		if(tonemapping)//Tone Mapping从一个大的范围映射到了较小的范围
			result = ACESFilm(result);

		if(gamma)// Gamma correct从[0,1]映射到[0,1],
			result = LinearToSRGB(result);
        return vec4(result,1.0f);
    }
`