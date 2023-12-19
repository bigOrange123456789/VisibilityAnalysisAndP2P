export const GetDirectRadiance =/* glsl */`
    uniform sampler2D GBufferd;
    
	vec3 GetOldColor(vec2 _screenPosition)
    {
        return  texture(GBufferd,_screenPosition).rgb;//当前像素的结果  
    }
`