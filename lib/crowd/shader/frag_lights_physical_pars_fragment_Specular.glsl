uniform float brightness_specular;
float PHBeckmann( float NdotH , float roughness ){//余弦 , 粗糙度 //针对皮肤的高光项 //Beckmann分布函数预处理以便生成速查纹理
	roughness = max(roughness,0.01);//roughness要大于0.01
        float alpha = acos( NdotH );
        float ta = tan(alpha);
        float m = roughness * roughness ;
        float val = 1.0 / ( m * pow(NdotH,4.0) ) * exp( -(ta*ta)/ m );
        return val;//与roughness正相关 与alpha负相关 
}
float fresnelReflectance( vec3 H, vec3 V, float F0 )//半程方向 视线方向 常数
{
        float base = 1.0 - dot( V, H );  
        float exponential = pow( base, 5.0 );
        return exponential + F0 * ( 1.0 - exponential );//菲涅尔方程（Fresnel equations）
}
void RE_Direct_Physical_Specular( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
        RE_Direct_Physical( directLight, geometry, material, reflectedLight ) ;
        float dotNL = dot( geometry.normal, directLight.direction ); //法向量与入射方向夹角的余弦值 //漫反射强度
        if(dotNL > 0.0){ //如果存在漫反射
            vec3 h =  directLight.direction + geometry.viewDir ; // Unnormalized half-way vector  //半程方向
            vec3 H = normalize( h ); //单位化
            float dotNH = dot( geometry.normal , H ); //法线与半程方向夹角的余弦 //镜面反射强度
            float PH = PHBeckmann( dotNH , roughness );//针对皮肤的高光项
            float F = fresnelReflectance( H,geometry.viewDir,0.028 );//针对皮肤的高光项?
            float frSpec = max( PH * F / dot(h,h) , 0.0 );
            reflectedLight.directSpecular +=  dotNL * brightness_specular * frSpec * directLight.color ;//添加高光
        }
}
#define RE_Direct_Physical_Scattering RE_Direct_Physical_Specular
