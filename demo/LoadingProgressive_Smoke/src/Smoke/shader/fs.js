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
	uniform sampler3D map;//我愿称之为三维曲面的表面高度增强图。

	uniform float threshold;
	uniform float range;//虚化区域的大小 高度浮动范围
	uniform float opacity;
	uniform float steps;//采样步数
	uniform float frame;//方便后面添加动态效果

	vec2 hitBox( vec3 orig, vec3 dir ) {   //计算光线与方盒的交点
		vec3 box_min = vec3( - 0.5 );//一个轴对称包围盒 Axis-Aligned Bounding Box
		vec3 box_max = vec3( 0.5 );
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

	void main(){
		vec3 rayDir = normalize( vDirection );   //将像素点对应的光线方向进行单位化
		vec2 bounds = hitBox( vOrigin, rayDir ); //计算光线的入射方向和出射方向

		bounds.x = max( bounds.x, 0.0 );	//如果视点在云雾对象内部

		vec3 p = vOrigin + bounds.x * rayDir; //射线的入射位置
		float delta = 1./steps;

		vec4 ac = vec4( base, 0.0 );//云雾对象的基颜色

		for ( float t = bounds.x; t < bounds.y; t += delta ) {//从入射时间到出射时间之间等距离取多个点

			float d = sample1( p + 0.5 );//局部增强长度

			d = smoothstep( threshold - range, threshold + range, d ) * opacity;

			float col = shading( p + 0.5 ) * 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;//作用类似法向量？ 影响漫反射亮度

			ac.rgb += ( 1.0 - ac.a ) * d * col;//反射的光线变多

			ac.a += ( 1.0 - ac.a ) * d;//阻光度增加

			if ( ac.a >= 0.95 ) break;//阻光度过高就可以暂停了

			p += rayDir * delta;//更新光线位置

		}

		color = ac;

		if ( color.a == 0.0 ) discard;//如果不透明就不处理这个像素

	}
`;
}