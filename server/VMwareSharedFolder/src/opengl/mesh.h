#ifndef MESH_H
#define MESH_H

#include <string>
#include <vector>
#include <glad/glad.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include "module.h"

using namespace std;

class Mesh {
public:
    // mesh Data
    vector<Vertex> vertices;
    vector<unsigned int> indices;
    vector<Texture> textures;
    Material material;
    unsigned int amount;
    unsigned int VAO;
    unsigned int VBO, EBO;

    // constructor
    Mesh(){}

    Mesh(vector<Vertex> vertices, vector<unsigned int> indices, vector<Texture> textures, Material material)
    {
        this->vertices = vertices;
        this->indices = indices;
        this->textures = textures;
        this->material = material;
        // cout<<"vertices size:"<<vertices.size()<<endl;
        // cout<<"indices size :"<<indices.size()<<endl;
        // cout<<"textures size:"<<textures.size()<<endl;

        // now that we have all the required data, set the vertex buffers and its attribute pointers.
        // setupMesh();
    }

    // initializes all the buffer objects/arrays
    void setupMesh()
    {
        // create buffers/arrays
        glGenVertexArrays(1, &VAO);
        glGenBuffers(1, &VBO);
        glGenBuffers(1, &EBO);

        glBindVertexArray(VAO);
        // load data into vertex buffers
        glBindBuffer(GL_ARRAY_BUFFER, VBO);
        // A great thing about structs is that their memory layout is sequential for all its items.
        // The effect is that we can simply pass a pointer to the struct and it translates perfectly to a glm::vec3/2 array which
        // again translates to 3/2 floats which translates to a byte array.
        glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(Vertex), &vertices[0], GL_STATIC_DRAW);  

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices.size() * sizeof(unsigned int), &indices[0], GL_STATIC_DRAW);

        // set the vertex attribute pointers
        // vertex Positions
        glEnableVertexAttribArray(0);	
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)0);
        // vertex normals
        glEnableVertexAttribArray(1);	
        glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, Normal));
        // vertex texture coords
        glEnableVertexAttribArray(2);	
        glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, TexCoords));
        // // vertex tangent
        // glEnableVertexAttribArray(3);
        // glVertexAttribPointer(3, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, Tangent));
        // // vertex bitangent
        // glEnableVertexAttribArray(4);
        // glVertexAttribPointer(4, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, Bitangent));
		// // ids
		// glEnableVertexAttribArray(5);
		// glVertexAttribIPointer(5, 4, GL_INT, sizeof(Vertex), (void*)offsetof(Vertex, m_BoneIDs));
		// // weights
		// glEnableVertexAttribArray(6);
		// glVertexAttribPointer(6, 4, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, m_Weights));
        
        glBindVertexArray(0);
    }

    // render the mesh
    void Draw(Shader &shader)
    {
        // bind appropriate textures
        unsigned int diffuseNr  = 1;
        unsigned int specularNr = 1;
        unsigned int normalNr   = 1;
        unsigned int heightNr   = 1;
        for(unsigned int i = 0; i < textures.size(); i++)
        {
            glActiveTexture(GL_TEXTURE0 + i); // active proper texture unit before binding
            // retrieve texture number (the N in diffuse_textureN)
            string number;
            string name = textures[i].type;
            if(name == "texture_diffuse")
                number = std::to_string(diffuseNr++);
            else if(name == "texture_specular")
                number = std::to_string(specularNr++); // transfer unsigned int to string
            else if(name == "texture_normal")
                number = std::to_string(normalNr++); // transfer unsigned int to string
             else if(name == "texture_height")
                number = std::to_string(heightNr++); // transfer unsigned int to string

            // now set the sampler to the correct texture unit
            glUniform1i(glGetUniformLocation(shader.ID, (name + number).c_str()), i);
            // and finally bind the texture
            glBindTexture(GL_TEXTURE_2D, textures[i].id);
        }
        
        if(textures.size() == 0)
        {
            // printVec4(material.Kd);
            shader.setVec4("material", material.Kd);
        }
        
        
        // draw mesh
        glBindVertexArray(VAO);
        glDrawElements(GL_TRIANGLES, static_cast<unsigned int>(indices.size()), GL_UNSIGNED_INT, 0);
        glBindVertexArray(0);

        // always good practice to set everything back to defaults once configured.
        glActiveTexture(GL_TEXTURE0);
    }

    Box computeBoudningBox()
    {
        Box box;
        box.setFromVertex(vertices);
        // cout<<"min: "<<box.Min.x<<" "<<box.Min.y<<" "<<box.Min.z<<endl;
        // cout<<"max: "<<box.Max.x<<" "<<box.Max.y<<" "<<box.Max.z<<endl;
        return box;
    }

    Sphere computeBoudningSphere()
    {
        glm::vec3 center = this->computeBoudningBox().getCenter();
        float radius = 0;
        for(unsigned int i=0; i<vertices.size(); i++)
        {
            float length = glm::length(vertices[i].Position - center);
            if(length>radius) radius = length;
        }
        return Sphere(center, radius);
    }

    float getTrianglesArea()
    {
        float area = 0;
        for(unsigned int i=0; i<indices.size(); i+=3){
            glm::vec3 p1 = vertices[indices[i]].Position;
            glm::vec3 p2 = vertices[indices[i+1]].Position;
            glm::vec3 p3 = vertices[indices[i+2]].Position;
            glm::vec3 v1 = p3-p1;
            glm::vec3 v2 = p1-p2;
            area += glm::length(glm::cross(v1,v2))*0.5;
        }
        return area;
    }
};
#endif