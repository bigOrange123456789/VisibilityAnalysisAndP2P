export const ddgiOld_vert =/* glsl */`

precision highp float;
      
// Varying
varying vec4 vPosition;
varying vec3 vNormal;
varying vec2 vuv;

void main()
{

   vPosition = modelMatrix * vec4( position, 1.0 );//模型的局部坐标->世界坐标
   vNormal = (modelMatrix*vec4(normal,1.0f)).xyz;  //模型的局部法线->世界法线
   vNormal = normalize(vNormal);
   vuv = uv;

   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}

`