export class vs{
    static shader=/* glsl */`
	in vec3 position;

	uniform mat4 modelMatrix;
	uniform mat4 modelViewMatrix;
	uniform mat4 projectionMatrix;
	uniform vec3 cameraPos;

	out vec3 vOrigin;
	out vec3 vDirection;

	void main() {
		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

		vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;//modelMatrix???
		//vOrigin是光线上的某个点? //计算相机在体积数据坐标系中的位置 vOrigin,以确定从相机视角观察体积数据时光线的起始点。
		vDirection = position - vOrigin;//光线方向
		

		gl_Position = projectionMatrix * mvPosition;
	}
`
}