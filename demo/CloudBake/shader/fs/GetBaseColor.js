console.log("indirect fs version:2023.11.24_16:38")
export const GetBaseColor =/* glsl */`
    uniform vec3 originColor;
    uniform bool useMap;
    uniform sampler2D colorMap;
    uniform bool useEmissiveMap;
    uniform sampler2D emissiveMap;
	vec4 GetBaseColor()
    {
        vec4 baseColor = vec4(originColor,0.);
        if(useMap)
            baseColor = texture2DLodEXT(colorMap,vuv, 0.f);        
        if(useEmissiveMap)
            baseColor.rgb += texture2DLodEXT(emissiveMap,vuv, 0.f).rgb;
        return baseColor;
    }
`