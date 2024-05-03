#ifndef OCCLUDER_LOADER_H
#define OCCLUDER_LOADER_H

#include <string>
#include <vector>
#include <glad/glad.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include "mesh.h"
#include "module.h"

using namespace std;

const vector<string> axis{"x","y","z"};

class OccluderLoader
{
public:
    vector<int> indexList;
    vector<Mesh> meshes;

    OccluderLoader(string const &path)
    {
        nlohmann::json info = readJsonFile(path);

        loadOccluder(info);
    }

    OccluderLoader(nlohmann::json info)
    {
        loadOccluder(info);
    }

    // draws the model, and thus all its meshes
    void Draw(Shader &shader)
    {
        for(unsigned int i = 0; i < meshes.size(); i++)
            meshes[i].Draw(shader);
    }

    vector<Mesh> getResult()
    {
        return meshes;
    }

    vector<int> getList()
    {
        return indexList;
    }

private:
    void loadOccluder(nlohmann::json info)
    {
        unsigned int size = (unsigned int)info["index"].size();
        for(unsigned int i=0; i<size; i++)
        {
            // int index = (int)info["index"][i];
            int index;
            string index_string = (string)info["index"][i];
            stringstream stream;
            stream<<index_string;
            stream>>index;
            indexList.push_back(index);

            nlohmann::json occluder_json = info["list"][i];
            Mesh mesh = rebuildOccluder(occluder_json);
            meshes.push_back(mesh);
        }
    }

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
                // cout<<vector.x<<","<<vector.y<<","<<vector.z<<endl;
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
        // material.Kd = glm::vec4((float)color[0], (float)color[1], (float)color[2], 1.0f);
        material.Kd = glm::vec4(rand()%1000/(float)1000.0, rand()%1000/(float)1000.0, rand()%1000/(float)1000.0, 1.0f);
        material.Ks = glm::vec4(1.0f,1.0f,1.0f,1.0f);

        return Mesh(vertices, indices, vector<Texture>{}, material);
    }
};

#endif  // OCCLUDER_LOADER_H