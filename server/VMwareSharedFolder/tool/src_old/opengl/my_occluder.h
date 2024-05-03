#ifndef MY_OCCLUDER_H
#define MY_OCCLUDER_H

#include <string>
#include <vector>
#include <glad/glad.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include "mesh.h"
#include "instanced_mesh.h"
#include "module.h"

using namespace std;

// const vector<string> axis{"x","y","z"};

class MyOccluder
{
public:
    // InstancedMesh instancedMesh;
    float* Positions;
    unsigned int PosLength;
    unsigned int* Indices;
    unsigned int IndLength;
    float* Matrices;
    unsigned int MatCount;

    MyOccluder() {}
    MyOccluder(string const &path)
    {
        // nlohmann::json info = readJsonFile(path);
        // nlohmann::json occ_info = info["o"];
        // nlohmann::json mat_info = info["m"];
        // mat_info.push_back({1,0,0,0,0,1,0,0,0,0,1,0});
        // Mesh occluder = rebuildOccluder(occ_info);
        // instancedMesh = InstancedMesh(occluder, mat_info.size(), getMatrices(mat_info));
    }
    MyOccluder(Mesh occluder, nlohmann::json mat_info)
    {
        // instancedMesh = InstancedMesh(occluder, mat_info.size(), getMatrices(mat_info));
        PosLength = occluder.vertices.size();
        Positions = new float [PosLength*3];
        for(unsigned int i=0; i<PosLength; i++){
            glm::vec3 vec = occluder.vertices[i].Position;
            Positions[i*3] = vec.x;
            Positions[i*3+1] = vec.y;
            Positions[i*3+2] = vec.z;
        }
        IndLength = occluder.indices.size();
        Indices = new unsigned int [IndLength];
        for(unsigned int i=0; i<IndLength; i++){
            Indices[i] = occluder.indices[i];
        }
        MatCount = mat_info.size()-1;
        Matrices = new float [MatCount*12];
        for(unsigned int i=0; i<MatCount; i++){
            for(unsigned int j=0; j<12; j++){
                Matrices[i*12+j] = mat_info[i][j];
            }
        }
    }
private:
    Mesh rebuildOccluder(nlohmann::json occluder_json)
    {
        vector<Vertex> vertices;
        vector<unsigned int> indices;
        Material material;

        for(unsigned int a=0; a<3; a++)
        {
            unsigned int length = vertices.size();
            nlohmann::json position = occluder_json[axis[a]]["p"];
            for(unsigned int i=0; i<position.size(); i+=2)
            {
                Vertex vertex;
                glm::vec3 vector;
                if(a==0){
                    vector.x = (float)occluder_json[axis[a]]["c"];
                    vector.y = (float)position[i];
                    vector.z = (float)position[i+1];
                }else if(a==1){
                    vector.x = (float)position[i];
                    vector.y = (float)occluder_json[axis[a]]["c"];
                    vector.z = (float)position[i+1];
                }else{
                    vector.x = (float)position[i];
                    vector.y = (float)position[i+1];
                    vector.z = (float)occluder_json[axis[a]]["c"];
                }
                vertex.Position = vector;
                vertices.push_back(vertex);
            }

            nlohmann::json index = occluder_json[axis[a]]["i"];
            for(unsigned int i=0; i<index.size(); i++)
            {
                indices.push_back((unsigned int)index[i] + length);
            }
        }
        
        nlohmann::json color = occluder_json["c"];
        material.Ka = glm::vec4(1.0f,1.0f,1.0f,1.0f);
        material.Kd = glm::vec4((float)color[0], (float)color[1], (float)color[2], 1.0f);
        material.Ks = glm::vec4(1.0f,1.0f,1.0f,1.0f);

        return Mesh(vertices, indices, vector<Texture>{}, material);
    }
};

#endif