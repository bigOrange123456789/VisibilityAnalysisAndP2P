#version 410 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D texture_diffuse1;
uniform vec4 material;

void main()
{
    FragColor = vec4(1.0f,1.0f,1.0f,1.0f);
}