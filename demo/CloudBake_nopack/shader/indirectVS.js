const indirectVS =/* glsl */`

precision highp float;
      
// Varying
varying vec4 vPosition;
varying vec3 vNormal;
varying vec2 vuv;

void main()
{

   vPosition = modelMatrix * vec4( position, 1.0 );
   vNormal = (modelMatrix*vec4(normal,1.0f)).xyz;
   vNormal = normalize(vNormal);
   vuv = uv;

   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}

`
export {indirectVS}