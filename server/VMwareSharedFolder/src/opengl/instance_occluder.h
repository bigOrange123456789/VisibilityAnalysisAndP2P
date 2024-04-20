#ifndef INSTANCE_OCCLUDER_H
#define INSTANCE_OCCLUDER_H

#include <iostream>
#include <nlohmann/json.hpp>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include "mesh.h"
#include "module.h"

using namespace std;

class Occluder{
public:
    glm::vec3* positions;
    unsigned int positionLength;
    unsigned int* indices;
    unsigned int indexLength;
    Occluder() {}
    Occluder(Mesh occluder)
    {
        positionLength = occluder.vertices.size();
        positions = new glm::vec3 [positionLength];
        for(unsigned int i=0; i<positionLength; i++){
            positions[i] = occluder.vertices[i].Position;
        }

        indexLength = occluder.indices.size();
        indices = new unsigned int [indexLength];
        for(unsigned int i=0; i<indexLength; i++){
            indices[i] = occluder.indices[i];
        }
    }
    void instantiate(glm::mat4 instance_mat)
    {

    }
    void print()
    {
        cout<<"position count: "<<positionLength<<endl;
        for(int i=0; i<positionLength; i++)
            printVec3(positions[i]);
        cout<<"index count: "<<indexLength<<endl;
        for(int i=0; i<indexLength; i++)
            cout<<indices[i]<<" ";
        cout<<endl;
    }
};

class InstanceOccluder{
public:
    Occluder* list;
    InstanceOccluder() {}
    InstanceOccluder(Mesh occluder_mesh, nlohmann::json mat_info)
    {
        Occluder ori_occluder(occluder_mesh);
        list = new Occluder [mat_info.size()];
        glm::mat4* instance_matrices = getMatrices(mat_info);
        for(unsigned int i=0; i<mat_info.size(); i++)
        {
            glm::mat4 mat = instance_matrices[i];
        }
    }
};

#endif