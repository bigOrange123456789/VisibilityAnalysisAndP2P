console.log("indirect fs version:2023.11.24_17:03")
import {GetDirectRadiance} from"./GetDirectRadiance.js"
import {GetIndirectRadiance} from"./GetIndirectRadiance.js"
import {ToLDR} from"./ToLDR.js"
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
GetDirectRadiance+
GetIndirectRadiance+
ToLDR+
/* glsl */`   
    uniform bool useRtao;
    uniform sampler2D rtaoBufferd;
    float getAO(vec2 _screenPosition){
        return useRtao?texture(rtaoBufferd,_screenPosition).r:1.;
    }
    
    uniform float screenWidth;
    uniform float screenHeight;
	void main(void)
    {
		vec2 _screenPosition = gl_FragCoord.xy/vec2(screenWidth,screenHeight);//当前像素的位置

        vec3 result = GetDirectRadiance(_screenPosition)+ GetIndirectRadiance();
        result*=getAO(_screenPosition);
			
		gl_FragColor = ToLDR(result);
    }
`
// console.log("main",main)