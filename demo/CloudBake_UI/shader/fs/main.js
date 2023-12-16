console.log("indirect fs version:2023.11.24_17:03")
//因此对于点P只需要单独在对他进行一次MVP矩阵变化（注意这里的投影矩阵和视角矩阵都是光源视角下），
//然后用它的xy分量作为uv坐标去深度纹理中采样即可获得点C（注意由于变化之后的顶点一定是
import {getIrradianceColor} from"./getIrradianceColor.js"
export const main =
/* glsl */`
    vec3 lerp(vec3 a, vec3 b, vec3 c)
    {
        float lerpx = a.x + (b.x - a.x) * c.x;
        float lerpy = a.y + (b.y - a.y) * c.y;
        float lerpz = a.z + (b.z - a.z) * c.z;
        return vec3(lerpx, lerpy, lerpz);
    }

`+
getIrradianceColor+
/* glsl */`
    uniform bool dGI;
    uniform float exposure;
    uniform bool tonemapping;
    uniform bool gamma;

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

    uniform float screenWidth;
    uniform float screenHeight;
    uniform sampler2D GBufferd;
    
    const float sigma = 2.0f;
	void main(void)
    {
		vec2 _screenPosition = gl_FragCoord.xy/vec2(screenWidth,screenHeight);//当前像素的位置
        vec3 result = texture(GBufferd,_screenPosition).rgb;//当前像素的直接光着色结果    

        if(dGI)
            result += getIrradianceColor();
        
		result *= sigma;
		result *= exposure;//2.
		
		if(tonemapping)
			result = ACESFilm(result);

		if(gamma)// Gamma correct
			result = LinearToSRGB(result);
			
		gl_FragColor = vec4(result,1.0f);
    }
`
// console.log("main",main)