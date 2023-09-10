uniform sampler2D depth;
//varying vec2 vUv;
void main()
{
	gl_FragColor=vec4(1.0, 1.0, 1.0, 1.0);//texture2D(depth,vUv);
}
// #version 430 core

// in  vec2 vUv;
// out vec4 FragColor;

// uniform sampler2D u_DepthTexture;
// uniform sampler2D u_PositionTexture;
// uniform sampler2D u_NormalTexture;
// uniform float u_Near = 0.1;
// uniform float u_Far = 100.0;
// uniform float u_Fov;
// uniform float u_WindowWidth;
// uniform float u_WindowHeight;
// float ViewSpaceZFromDepth(float d)
// {
// 	d = d * 2.0 - 1.0;
//     return (2.0 * u_Near * u_Far) / (u_Far + u_Near - d * (u_Far - u_Near)); 
// }

// vec3 UVToViewSpace(vec2 uv, float z)
// {
// 	uv = uv * 2.0 - 1.0;
// 	uv.x = uv.x * tan(u_Fov / 2.0) * u_WindowWidth / u_WindowHeight  * z ;
// 	uv.y = uv.y * tan(u_Fov / 2.0)  * z ;
// 	return vec3(uv, -z);
// }

// vec3 GetViewPos(vec2 uv)
// {
// 	float z = ViewSpaceZFromDepth(texture(u_DepthTexture, uv).r);
// 	return UVToViewSpace(uv, z);
// }
// float Length2(vec3 V)
// {
// 	return dot(V,V);
// }

// vec3 MinDiff(vec3 P, vec3 Pr, vec3 Pl)
// {
//     vec3 V1 = Pr - P;
//     vec3 V2 = P - Pl;
//     return (Length2(V1) < Length2(V2)) ? V1 : V2;
// }
// void main()
// {
// 	float xOffset = 1.0 / u_WindowWidth;
// 	float yOffset = 1.0 / u_WindowHeight;
// 	vec3 P = GetViewPos(vUv);
// 	vec3 Pl = GetViewPos(vUv + vec2(-xOffset,0));
// 	vec3 Pr = GetViewPos(vUv + vec2(xOffset,0));
// 	vec3 Pu = GetViewPos(vUv + vec2(0,yOffset));
// 	vec3 Pd = GetViewPos(vUv + vec2(0,-yOffset));
// 	vec3 leftDir = MinDiff(P, Pr, Pl);
//     vec3 upDir = MinDiff(P, Pu, Pd);
// 	vec3 Nomal = normalize(cross(leftDir,upDir));

// 	FragColor = vec4(normalize(Nomal), 1.0f);
// //	Color_ = vec4(GetViewPos(v2f_TexCoords), 1.0f);
// }