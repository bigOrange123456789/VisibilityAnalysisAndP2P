export const GetBaseColor =/* glsl */`
    uniform vec3 originColor;
    uniform bool useMap;
    uniform sampler2D colorMap;
    uniform bool useEmissiveMap;
    uniform sampler2D emissiveMap;

    varying vec2 vuv;
    
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