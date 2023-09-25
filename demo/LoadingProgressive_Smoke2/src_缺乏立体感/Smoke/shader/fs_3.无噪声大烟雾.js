export class fs{
    static shader=/* glsl */`
	precision highp float;
	precision highp sampler3D;

	uniform mat4 modelViewMatrix;
	uniform mat4 projectionMatrix;

	in vec3 vOrigin;
	in vec3 vDirection;

	out vec4 color;

	uniform vec3 base;
	uniform sampler3D map;//三维浓度图。

	uniform float threshold;
	uniform float range;//虚化区域的大小 高度浮动范围
	uniform float opacity;
	uniform float steps;//采样步数
	uniform float frame;//方便后面添加动态效果

	uniform float sizex;
	uniform float sizey;
	uniform float sizez;

	vec2 hitBox( vec3 orig, vec3 dir ) {   //计算光线与方盒的交点
		vec3 box_min = vec3( sizex,sizey,sizez )* - .5;//vec3( - 0.5 );//一个轴对称包围盒 Axis-Aligned Bounding Box
		vec3 box_max = vec3( sizex,sizey,sizez )* + .5;//vec3( 0.5 );
		vec3 inv_dir = 1.0 / dir;
		vec3 tmin_tmp = ( box_min - orig ) * inv_dir; //时间*方向=交点-起点
		vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
		vec3 tmin = min( tmin_tmp, tmax_tmp ); //三对平面的入射时间
		vec3 tmax = max( tmin_tmp, tmax_tmp ); //三对平面的出射时间
		float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
		float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
		return vec2( t0, t1 ); //射线的入射时间和出射时间
	}

	float sample1( vec3 p ) {//根据向量取一个随机值
		return texture( map, p ).r;
	}

	float shading( vec3 coord ) {//获取三维图片这这个位置的梯度
		float step = 0.01;//一个极小值
		return sample1( coord + vec3( - step ) ) - sample1( coord + vec3( step ) );//map在对角线方向的变化速度
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////
	float fbm_4( in vec3 x )
	{
		float f = 2.0;
		float s = 0.5;
		float a = 0.0;
		float b = 0.5;
		for( int i=min(0, int(frame)); i<4; i++ )
		{
			float n = texture( map, x ).r;//noise(x);
			a += b*n;
			b *= s;
			x = f*x;
		}
		return a;
	}
	vec3 Translate(vec3 pos, vec3 translate)
	{
		return pos -= translate;
	}
	float sdSphere( vec3 p, vec3 origin, float radius )
	{
		p = Translate(p, origin);
		return length(p)-radius;
	}
	float sdSmoothUnion( float d1, float d2, float k ) 
	{
		float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
		return mix( d2, d1, h ) - k*h*(1.0-h); 
	}
	// float QueryVolumetricDistanceField( in vec3 pos)//两个静态水滴
	// {    
	// 	float sdfValue = sdSphere(pos, vec3(-0.1), .3);
	// 	sdfValue = sdSmoothUnion(sdfValue,sdSphere(pos, vec3(0.2), .1), .5f);
	// 	// float d = sample1( p + 0.5 );
	// 	// return smoothstep( threshold - range, threshold + range, d ) * opacity;
	// 	return  sdfValue;
	// }
	// float QueryVolumetricDistanceField( in vec3 pos)//两个动态水滴
	// {    
	// 	// float sdfValue = sdSphere(pos, vec3(-0.1), .3);
	// 	// sdfValue = sdSmoothUnion(sdfValue,sdSphere(pos, vec3(0.2), .1), .5f);
	// 	float sdfValue = sdSphere(pos, vec3(-0.1,-0.1,-0.1*sin(frame)), .3);
	// 	sdfValue = sdSmoothUnion(sdfValue,sdSphere(pos, vec3(0.3*sin(frame*1.41)), .1), .5f);
	
	// 	return  sdfValue;
	// }
	// float QueryVolumetricDistanceField( in vec3 pos)//效果像是液体
	// {    
	// 	vec3 p1=vec3(-0.1,-0.1,-0.1*sin(frame));
	// 	float r1=.2;
	// 	vec3 p2=vec3(0.2*sin(frame*1.41));
	// 	float r2=.15;
	// 	vec3 p3=vec3(-0.2*sin(frame*1.41)-0.05);
	// 	float r3=.1;
	// 	vec3 p4=vec3(0.4*sin(frame*2.5),-0.4*sin(frame*2.6),0.4*sin(frame*2.7));
	// 	float r4=.01;

	// 	float sdfValue = sdSphere(pos,p1, r1);
	// 	sdfValue = sdSmoothUnion(
	// 		sdfValue,
	// 		sdSphere(pos, p2, r2), .5f
	// 	);
	// 	sdfValue = sdSmoothUnion(
	// 		sdfValue,
	// 		sdSphere(pos, p3, r3), .5f
	// 	);
	// 	sdfValue = sdSmoothUnion(
	// 		sdfValue,
	// 		sdSphere(pos, p4, r4), .5f
	// 	);
	
	// 	return  sdfValue;
	// }
	float QueryVolumetricDistanceField( in vec3 pos)//效果像是液体
	{    
		vec3 p1=vec3(-0.1,-0.1,-0.1*sin(frame));
		float r1=.2;
		vec3 p2=vec3(0.2*sin(frame*1.41));
		float r2=.15;
		vec3 p3=vec3(-0.2*sin(frame*1.41)-0.05);
		float r3=.1;
		vec3 p4=vec3(0.4*sin(frame*2.5),-0.4*sin(frame*2.6),0.4*sin(frame*2.7));
		float r4=.01;

		float sdfValue = sdSphere(pos,p1, r1);
		sdfValue = sdSmoothUnion(
			sdfValue,
			sdSphere(pos, p2, r2), .5f
		);
		sdfValue = sdSmoothUnion(
			sdfValue,
			sdSphere(pos, p3, r3), .5f
		);
		sdfValue = sdSmoothUnion(
			sdfValue,
			sdSphere(pos, p4, r4), .5f
		);
	
		return  sdfValue;
	}
	float QueryVolumetricDistanceField2( in vec3 pos,float id)//每一团烟雾都不同步
	{    
		float f=frame+id*100.;
		vec3 p1=vec3(-0.1,-0.1,-0.1*sin(f));
		float r1=.2;
		vec3 p2=vec3(0.2*sin(f*1.41));
		float r2=.15;
		vec3 p3=vec3(-0.2*sin(f*1.41)-0.05);
		float r3=.1;
		vec3 p4=vec3(0.4*sin(f*2.5),-0.4*sin(f*2.6),0.4*sin(f*2.7));
		float r4=.01;

		float sdfValue = sdSphere(pos,p1, r1);
		sdfValue = sdSmoothUnion(
			sdfValue,
			sdSphere(pos, p2, r2), .5f
		);
		sdfValue = sdSmoothUnion(
			sdfValue,
			sdSphere(pos, p3, r3), .5f
		);
		sdfValue = sdSmoothUnion(
			sdfValue,
			sdSphere(pos, p4, r4), .5f
		);
		// sdfValue = sdSmoothUnion(
		// 	sdfValue,
		// 	.2-pos.y, .5f
		// );
	
		return  sdfValue;
	}
	float IntersectVolumetric(in vec3 rayOrigin, in vec3 rayDirection, float maxT)
	{// 精度不是很重要，只需要在之前有一个不错的起点
		float precis = 0.5; 
		float t = 0.0f;//用来记录前进的距离
		for(int i=0; i<3; i++ )//for(int i=0; i<MAX_SDF_SPHERE_STEPS; i++ )
		{
			float result = QueryVolumetricDistanceField( rayOrigin+rayDirection*t);//查询SDF的值
			if( result < (precis) || t>maxT ) break;//到边缘比较近 或 前进的比较远
			t += result;//更新需要前进的距离
		}
		return ( t>=maxT ) ? -1.0 : t;//视点距离物体较近的时候谨慎一些
	}
	float BeerLambert(float absorption, float dist)// 啤酒兰伯特定律描述了穿透光的衰减
	{//absorption是一个浓度系数，dist是穿透距离
		return exp(-absorption * dist);
	}
	vec3 GetAmbientLight()
	{
		return 1.2 * vec3(0.03, 0.018, 0.018);
	}
	float GetFogDensity(vec3 position, float sdfDistance)
	{//有简化
		return sdfDistance < 0.0 ? min(abs(sdfDistance), 1.) : 0.0;
	}
	vec3 Render()
	{
		vec3 rayOrigin = vOrigin;
		vec3 rayDirection = normalize( vDirection );
		float depth = 5.0f;//LARGE_NUMBER;
		vec3 opaqueColor = vec3(0.0f);
		
		vec3 normal;
		float t;
		int materialID = 0;//INVALID_MATERIAL_ID;
		// t = IntersectOpaqueScene(rayOrigin, rayDirection, materialID, normal);//会更新materialID
		// if( materialID != INVALID_MATERIAL_ID )
		// {//在体积照明之后推迟照明计算，这样我们就可以避免对无论如何都不可见的不透明对象进行阴影跟踪
		// 	depth = t;//跳过背景区域？
		// }
		
		float volumeDepth = IntersectVolumetric(rayOrigin, rayDirection, depth);//尽可能跳过空白区域
		float opaqueVisiblity = 1.0f;//可见度的初始值，随着不断步进会不断降低
		vec3 volumetricColor = vec3(0.0f);//反射光的初始值，随着不断步进会不断增加
		// return vec3(.1f)*QueryVolumetricDistanceField(rayOrigin);
		if(1. > 0.0)//if(volumeDepth > 0.0)
		{
			const float marchSize = 0.06f;//最小步进单位 const float marchSize = 0.6f * MARCH_MULTIPLIER;
			float distanceInVolume = 0.0f;//记录设置的穿透长度
			float signedDistance = 0.0;//记录步进点的符号距离
			for(int i = 0; i < 30 ; i++)//for(int i = 0; i < MAX_VOLUME_MARCH_STEPS; i++)//光线步近的次数
			{
				volumeDepth += max(marchSize, signedDistance);//计算前进后的距离，marchSize是前进距离的最小步长
				// if(volumeDepth > depth || opaqueVisiblity < ABSORPTION_CUTOFF) break;
				if(volumeDepth > depth || opaqueVisiblity < 0.005) break;//超出最远距离 或 透明度过低
				
				vec3 position = rayOrigin + volumeDepth*rayDirection;//计算前进后的位置

				signedDistance = QueryVolumetricDistanceField(position);//查询SDF的值
				if(signedDistance < 0.0f)//如果在物体内
				{
					distanceInVolume += marchSize;//叠加穿透距离
					float previousOpaqueVisiblity = opaqueVisiblity;//记录透明度
					opaqueVisiblity *= BeerLambert(0.5 * GetFogDensity(position, signedDistance), marchSize);
					// 啤酒兰伯特定律描述了穿透光的衰减    烟雾边缘的浓度为SDF距离
					float absorptionFromMarch = previousOpaqueVisiblity - opaqueVisiblity;//透明度的变化情况
					//暂时注释掉了光照
					volumetricColor += absorptionFromMarch * vec3(0.8) * GetAmbientLight();//计算由于不透明反射回来的光
				}
			}
		}
		//注释掉了背景渲染
		return min(volumetricColor, 1.0f) + opaqueVisiblity * opaqueColor;
	}
	/////////////////////////////////////////////////////////////////////////////////////////////////
	struct Smoke{//pixel
		float id;//每一团云对应一个id
		vec3 position;
		float density;
		float grad;
	};
	float r(float a,float b){
		a+=0.5;
		return (a/b-floor(a/b))*b-0.5;
	}
	float getd(vec3 p){
		float d = sample1( p + 0.5 );
		return smoothstep( threshold - range, threshold + range, d ) * opacity;
	}
	mat3 rotateX(float angle) {
		float c = cos(angle);
		float s = sin(angle);
		return mat3(
			1.0, 0.0, 0.0,
			0.0, c,   -s,
			0.0, s,    c
		);
	}
	void setPosition(inout Smoke s,vec3 p){//输入一个位置
		float xi=floor(p.x+.5);
		float yi=floor(p.y+.5);
		float zi=floor(p.z+.5);
		s.id=xi*sizey*sizez+yi*sizez+zi;
		s.position=vec3(r(p.x,1.),r(p.y,1.),r(p.z,1.));
	}
	void setDensity(inout Smoke s){
		float time=frame+99.001*s.id;
		float a1=0.5+0.5*sin(time);
		float a2=1.-a1;
		float a3=0.5+0.5*sin(time*1.7+3.14);
		vec3 p2=s.position;
		// s.density = a1*getd(p2)+(0.9+0.1*a2)*getd(rotateX(time)*p2)+a3*getd(vec3(p2.y,p2.x,0.1));
		s.density= QueryVolumetricDistanceField(p2)+ sample1( p2 + 0.5 );;
		if(s.density>0.)s.density=0.;
		else s.density=1.;
	}
	void setGrad(inout Smoke s){
		// vec3 p=s.position;
		// s.grad=shading( p + 0.5 ) * 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;
		s.grad=0.;
	}

	void main(){
		// vec3 volumetricColor=Render();
		// color.r=volumetricColor.r;
		// color.g=volumetricColor.g;
		// color.b=volumetricColor.b;
		// color.a=1.;
		// return;

		vec3 rayDir = normalize( vDirection );   //将像素点对应的光线方向进行单位化
		vec2 bounds = hitBox( vOrigin, rayDir ); //计算光线的入射方向和出射方向

		bounds.x = max( bounds.x, 0.0 );	//如果视点在云雾对象内部

		vec3 p = vOrigin + bounds.x * rayDir; //射线的入射位置
		float delta = 1./steps;

		vec4 ac = vec4( base, 0.0 );//云雾对象的基颜色

		Smoke s;
		/////////////////////////////////////////////////////////////////////////////////////////////
		float distanceInVolume=0.;//用于叠加穿透距离
		float opaqueVisiblity=1.;//用于记录局部透明度
		float marchSize=delta;
		vec3 volumetricColor=vec3(0.);
		/////////////////////////////////////////////////////////////////////////////////////////////
		for ( float t = bounds.x; t < bounds.y; t += delta ) {//从入射时间到出射时间之间等距离取多个点
			setPosition(s,p);
			// setDensity(s);
			// setGrad(s);

			// ac.rgb += ( 1.0 - ac.a ) * s.density * s.grad;//反射的光线变多

			// ac.a += ( 1.0 - ac.a ) * s.density;//阻光度增加

			// if ( ac.a >= 0.95 ) break;//阻光度过高就可以暂停了
			
			p += rayDir * delta;//更新光线位置

			/////////////////////////////////////////////////////////////////////////////////////////////
			vec3 position=s.position;
			
			// volumeDepth += max(marchSize, signedDistance);//计算前进后的距离，marchSize是前进距离的最小步长
			// // if(volumeDepth > depth || opaqueVisiblity < ABSORPTION_CUTOFF) break;
			// if(volumeDepth > depth || opaqueVisiblity < 0.005) break;//超出最远距离 或 透明度过低
			
			// vec3 position = rayOrigin + volumeDepth*rayDirection;//计算前进后的位置

			float signedDistance = QueryVolumetricDistanceField2(position,s.id);//查询SDF的值
			if(signedDistance < 0.0f)//如果在物体内
			{
				distanceInVolume += marchSize;//叠加穿透距离
				float previousOpaqueVisiblity = opaqueVisiblity;//记录透明度
				opaqueVisiblity *= BeerLambert(10.5 * GetFogDensity(position, signedDistance), marchSize);
				// 啤酒兰伯特定律描述了穿透光的衰减    烟雾边缘的浓度为SDF距离
				float absorptionFromMarch = previousOpaqueVisiblity - opaqueVisiblity;//透明度的变化情况
				//暂时注释掉了光照
				volumetricColor+= absorptionFromMarch * vec3(0.8) ;//+=vec3(0.02);// 计算由于不透明反射回来的光
			}
			
			/////////////////////////////////////////////////////////////////////////////////////////////

		}

		/////////////////////////////////////////////////////////////////////////////////////////////
		color=vec4(volumetricColor.r);//白烟    vec4(1.-volumetricColor.r);//黑烟
		// color.a=40.*pow(color.a,3.);
		color.a*=2.;
		// if(color.a==0.)color.a=0.;
		
		// else color.a=1.;//0.5;
		/////////////////////////////////////////////////////////////////////////////////////////////
		// color = ac;
		// color.a=color.a*color.a*color.a*color.a*color.a;//color.a*=0.5;

		// if ( color.a == 0.0 ) discard;//如果不透明就不处理这个像素

	}
`;
}