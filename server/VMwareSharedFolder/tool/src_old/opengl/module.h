#ifndef MODULE_H
#define MODULE_H

#include <iomanip>
#include <fstream>
#include <string>
#include <vector>
#include <math.h>
#include <algorithm>
#include <nlohmann/json.hpp>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include "camera.h"

using namespace std;

#define MAX_BONE_INFLUENCE 4

struct Vertex {
    // position
    glm::vec3 Position;
    // normal
    glm::vec3 Normal;
    // texCoords
    glm::vec2 TexCoords;
    // tangent
    glm::vec3 Tangent;
    // bitangent
    glm::vec3 Bitangent;
	//bone indexes which will influence this vertex
	int m_BoneIDs[MAX_BONE_INFLUENCE];
	//weights from each bone
	float m_Weights[MAX_BONE_INFLUENCE];
};

struct Texture {
    unsigned int id;
    string type;
    string path;
};

struct Material {
	//材质颜色光照
	glm::vec4 Ka;
	//漫反射
	glm::vec4 Kd;
	//镜反射
	glm::vec4 Ks;
};

void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
    // make sure the viewport matches the new window dimensions; note that width and 
    // height will be significantly larger than specified on retina displays.
    glViewport(0, 0, width, height);
}

struct OccludedVisibleSet {
    vector<int> VisibleList;
    float FillingDegree;
    float OccludedDegree;
};

class Plane {
public:
    glm::vec3 normal;
    float distance;
    Plane(glm::vec3 nor = glm::vec3(0.0f,1.0f,0.0f), float dis = 0.0f)
    {
        normal = nor;
        distance = dis;
    }
    Plane* setComponents(float x, float y, float z, float w)
    {
        normal = glm::vec3(x, y, z);
        distance = w;
        return this;
    }
    Plane* normalize()
    {
        float inverseNormalLength = glm::length(normal);
        normal = normal / inverseNormalLength;
        distance = distance / inverseNormalLength;
        return this;
    }
    float distanceToPoint(glm::vec3 point)
    {
        return glm::dot(normal, point) + distance;
    }
};

class Box {
public:
    glm::vec3 Min;
    glm::vec3 Max;
    Box(glm::vec3 min = glm::vec3(0.0f,0.0f,0.0f), glm::vec3 max = glm::vec3(0.0f,0.0f,0.0f))
    {
        Min = min;
        Max = max;
    }
    Box(nlohmann::json box_json)
    {
        Min = glm::vec3(box_json["min"]["x"],box_json["min"]["y"],box_json["min"]["z"]);
        Max = glm::vec3(box_json["max"]["x"],box_json["max"]["y"],box_json["max"]["z"]);
    }
    Box applyMatrix4(glm::mat4 matrix)
    {
        glm::vec4 Min_n = matrix * glm::vec4(Min, 1.0f);
        glm::vec4 Max_n = matrix * glm::vec4(Max, 1.0f);
        float Min_x = Min_n.x<Max_n.x?Min_n.x:Max_n.x;
        float Min_y = Min_n.y<Max_n.y?Min_n.y:Max_n.y;
        float Min_z = Min_n.z<Max_n.z?Min_n.z:Max_n.z;
        float Max_x = Min_n.x<Max_n.x?Max_n.x:Min_n.x;
        float Max_y = Min_n.y<Max_n.y?Max_n.y:Min_n.y;
        float Max_z = Min_n.z<Max_n.z?Max_n.z:Min_n.z;
        return Box(glm::vec3(Min_x,Min_y,Min_z), glm::vec3(Max_x,Max_y,Max_z));
    }
    Box* setFromVertex(vector<Vertex> vertices)
    {
        Min = vertices[0].Position;
        Max = vertices[0].Position;
        for(unsigned int i=1; i<vertices.size(); i++)
        {
            glm::vec3 pos = vertices[i].Position;
            this->adjustBox(pos);
        }
        return this;
    }
    void adjustBox(Box box_a)
    {
        if(box_a.Min.x<Min.x) Min.x = box_a.Min.x;
        if(box_a.Min.y<Min.y) Min.y = box_a.Min.y;
        if(box_a.Min.z<Min.z) Min.z = box_a.Min.z;
        if(box_a.Max.x>Max.x) Max.x = box_a.Max.x;
        if(box_a.Max.y>Max.y) Max.y = box_a.Max.y;
        if(box_a.Max.z>Max.z) Max.z = box_a.Max.z;
    }
    void adjustBox(glm::vec3 pos)
    {
        if(pos.x<Min.x) Min.x = pos.x;
        if(pos.y<Min.y) Min.y = pos.y;
        if(pos.z<Min.z) Min.z = pos.z;
        if(pos.x>Max.x) Max.x = pos.x;
        if(pos.y>Max.y) Max.y = pos.y;
        if(pos.z>Max.z) Max.z = pos.z;
    }
    glm::vec3 getCenter()
    {
        return (Min + Max) / 2.0f;
    }
    float getRadius()
    {
        float x_length = Max.x - Min.x;
        float y_length = Max.y - Min.y;
        float z_length = Max.z - Min.z;
        return sqrt(pow(x_length,2) + pow(y_length,2) + pow(z_length,2)) / 2.0f;
    }
    float getVolume()
    {
        float x_length = Max.x - Min.x;
        float y_length = Max.y - Min.y;
        float z_length = Max.z - Min.z;
        return x_length * y_length * z_length;
    }
    float getSurfaceArea()
    {
        float x_length = Max.x - Min.x;
        float y_length = Max.y - Min.y;
        float z_length = Max.z - Min.z;
        return x_length*y_length+x_length*z_length+y_length*z_length;
    }
    vector<glm::vec3> getVertexes()
    {
        float vX[2] = {Min.x, Max.x};
        float vY[2] = {Min.y, Max.y};
        float vZ[2] = {Min.z, Max.z};
        vector<glm::vec3> vertexes;
        for(int i=0; i<2; i++)
            for(int j=0; j<2; j++)
                for(int k=0; k<2; k++)
                    vertexes.push_back(glm::vec3(vX[i],vY[j],vZ[k]));
        return vertexes;
    }
};

class Sphere {
public:
    glm::vec3 center;
    float radius;
    Sphere(glm::vec3 cen = glm::vec3(0.0f,0.0f,0.0f), float rad = 0.0f)
    {
        center = cen;
        radius = rad;
    }
    Sphere(nlohmann::json sphere_json)
    {
        center = glm::vec3((float)sphere_json["center"]["x"], (float)sphere_json["center"]["y"], (float)sphere_json["center"]["z"]);
        radius = (float)sphere_json["radius"];
    }
    Sphere applyMatrix4(glm::mat4 matrix)
    {
        glm::vec4 c = matrix * glm::vec4(center, 1.0f);
        float scaleXSq = pow(matrix[0][0],2) + pow(matrix[1][0],2) + pow(matrix[2][0],2);
        float scaleYSq = pow(matrix[0][1],2) + pow(matrix[1][1],2) + pow(matrix[2][1],2);
        float scaleZSq = pow(matrix[0][2],2) + pow(matrix[1][2],2) + pow(matrix[2][2],2);
        float r = radius * sqrt(max({scaleXSq,scaleYSq,scaleZSq}));
        return Sphere(glm::vec3(c.x, c.y, c.z), r);
    }
};

class Frustum {
private:
    int Width;
    int Height;
    glm::vec3 cameraPosition;
    glm::mat4 projectMatrix;
    Plane planes[6];

public:
    Frustum()
    {
        for(unsigned int i=0; i<6; i++)
            planes[i] = Plane();
    }
    void setFromProjectMatrixJson(nlohmann::json root)
    {
        Width = (int)root["wid"];
        Height = (int)root["hei"];

        nlohmann::json cam_pos = root["pos"];
        cameraPosition = glm::vec3((float)cam_pos["x"], (float)cam_pos["y"], (float)cam_pos["z"]);

        nlohmann::json mat = root["mat"];
        float me0 = (float)mat[0], me1 = (float)mat[1], me2 = (float)mat[2], me3 = (float)mat[3];
		float me4 = (float)mat[4], me5 = (float)mat[5], me6 = (float)mat[6], me7 = (float)mat[7];
		float me8 = (float)mat[8], me9 = (float)mat[9], me10 = (float)mat[10], me11 = (float)mat[11];
		float me12 = (float)mat[12], me13 = (float)mat[13], me14 = (float)mat[14], me15 = (float)mat[15];

        projectMatrix = glm::mat4 (
            me0,me1,me2,me3,
            me4,me5,me6,me7,
            me8,me9,me10,me11,
            me12,me13,me14,me15
        );

        planes[0].setComponents(me3-me0, me7-me4, me11-me8, me15-me12)->normalize();
        planes[1].setComponents(me3+me0, me7+me4, me11+me8, me15+me12 )->normalize();
		planes[2].setComponents(me3+me1, me7+me5, me11+me9, me15+me13 )->normalize();
		planes[3].setComponents(me3-me1, me7-me5, me11-me9, me15-me13 )->normalize();
		planes[4].setComponents(me3-me2, me7-me6, me11-me10, me15-me14 )->normalize();
		planes[5].setComponents(me3+me2, me7+me6, me11+me10, me15+me14 )->normalize();
    }
    void setFromCamera(Camera& camera, float aspect = (float)1920/1080, float near = 1.0f, float far = 5000.0f)
    {
        glm::mat4 projection = glm::perspective(glm::radians(camera.Zoom), aspect, near, far);
        glm::mat4 view = camera.GetViewMatrix();
        projectMatrix = projection * view;
        cameraPosition = camera.Position;

        float me0 = projectMatrix[0][0], me1 = projectMatrix[0][1], me2 = projectMatrix[0][2], me3 = projectMatrix[0][3];
        float me4 = projectMatrix[1][0], me5 = projectMatrix[1][1], me6 = projectMatrix[1][2], me7 = projectMatrix[1][3];
        float me8 = projectMatrix[2][0], me9 = projectMatrix[2][1], me10 = projectMatrix[2][2], me11 = projectMatrix[2][3];
        float me12 = projectMatrix[3][0], me13 = projectMatrix[3][1], me14 = projectMatrix[3][2], me15 = projectMatrix[3][3];

        planes[0].setComponents(me3-me0, me7-me4, me11-me8, me15-me12)->normalize();
        planes[1].setComponents(me3+me0, me7+me4, me11+me8, me15+me12 )->normalize();
		planes[2].setComponents(me3+me1, me7+me5, me11+me9, me15+me13 )->normalize();
		planes[3].setComponents(me3-me1, me7-me5, me11-me9, me15-me13 )->normalize();
		planes[4].setComponents(me3-me2, me7-me6, me11-me10, me15-me14 )->normalize();
		planes[5].setComponents(me3+me2, me7+me6, me11+me10, me15+me14 )->normalize();
    }
    void setScreenSize(int w, int h)
    {
        Width = w;
        Height = h;
    }
    glm::mat4 getProjectMatrix()
    {
        return projectMatrix;
    }
    int getWidth()
    {
        return Width;
    }
    int getHeight()
    {
        return Height;
    }
    float distanceToPoint(glm::vec3 point)
    {
        return glm::length(point - cameraPosition);
    }
    bool intersectBox(Box& box)
    {
        for(unsigned int i=0; i<6; i++)
        {
            Plane plane = planes[i];
            glm::vec3 point;
            point.x = plane.normal.x > 0 ? box.Max.x : box.Min.x;
            point.y = plane.normal.y > 0 ? box.Max.y : box.Min.y;
			point.z = plane.normal.z > 0 ? box.Max.z : box.Min.z;
            if(plane.distanceToPoint(point) < 0)
            {
                return false;
            }
        }
        return true;
    }
    bool intersectBox(Box* box)
    {
        for(unsigned int i=0; i<6; i++)
        {
            Plane plane = planes[i];
            glm::vec3 point;
            point.x = plane.normal.x > 0 ? box->Max.x : box->Min.x;
            point.y = plane.normal.y > 0 ? box->Max.y : box->Min.y;
			point.z = plane.normal.z > 0 ? box->Max.z : box->Min.z;
            if(plane.distanceToPoint(point) < 0)
            {
                return false;
            }
        }
        return true;
    }
    bool intersectSphere(Sphere& sphere)
    {
        for(unsigned int i=0; i<6; i++)
        {
            Plane plane = planes[i];
            if(plane.distanceToPoint(sphere.center) < -sphere.radius){
                return false;
            }
        }
        return true;
    }
    bool intersectSphere(Sphere* sphere)
    {
        for(unsigned int i=0; i<6; i++)
        {
            Plane plane = planes[i];
            if(plane.distanceToPoint(sphere->center) < -sphere->radius){
                return false;
            }
        }
        return true;
    }
    glm::vec3 projectPoint(glm::vec3 vec)
    {
        float x = vec.x, y = vec.y, z = vec.z;
        float w = 1.0f/(projectMatrix[0][3]*x + projectMatrix[1][3]*y + projectMatrix[2][3]*z + projectMatrix[3][3]);
        return glm::vec3 (
            (projectMatrix[0][0]*x + projectMatrix[1][0]*y + projectMatrix[2][0]*z + projectMatrix[3][0]) * w,
            (projectMatrix[0][1]*x + projectMatrix[1][1]*y + projectMatrix[2][1]*z + projectMatrix[3][1]) * w,
            (projectMatrix[0][2]*x + projectMatrix[1][2]*y + projectMatrix[2][2]*z + projectMatrix[3][2]) * w
        );
    }
    Plane getPlane(int index){
        return planes[index];
    }
    void getProjectMatrix(float* matrix_array){
        for(unsigned int i=0; i<4; i++)
            for(unsigned int j=0; j<4; j++)
                matrix_array[i+j*4] = projectMatrix[i][j];
    }
    void getCameraPosition(float* camera_position){
        camera_position[0] = cameraPosition.x;
        camera_position[1] = cameraPosition.y;
        camera_position[2] = cameraPosition.z;
    }
};

glm::mat4 *getMatrices(nlohmann::json mat_json)
{
    glm::mat4 *instanceMatrices = new glm::mat4[mat_json.size()];
    for(unsigned int j=0; j<mat_json.size(); j++)
    {
        nlohmann::json mat = mat_json[j];
        instanceMatrices[j] = glm::mat4(
            (float)mat[0],(float)mat[4],(float)mat[8],0.0f,
            (float)mat[1],(float)mat[5],(float)mat[9],0.0f,
            (float)mat[2],(float)mat[6],(float)mat[10],0.0f,
            (float)mat[3],(float)mat[7],(float)mat[11],1.0f
        );
    }
    return instanceMatrices;
}

float getWeight(glm::vec3 vec, float bottom)
{
    float weight = 1.0 - (1.0 - bottom) / 2.0 * (vec.x*vec.x + vec.y*vec.y);
    return weight<bottom?bottom:weight;
}

nlohmann::json readJsonFile(string fileUrl)
{
    nlohmann::json json;
    ifstream is(fileUrl);
    is>>json;
    is.close();
    return json;
}

string vectorToString(vector<int> array)
{
    string str = "[";
    for(unsigned int i=0; i<array.size(); i++)
    {
        str += to_string(array[i]);
        if(i<array.size()-1)
            str += ",";
    }
    str += "]";
    return str;
}

string vector2dToString(vector<vector<int>> table)
{
    string str = "[";
    for(unsigned int i=0; i<table.size(); i++)
    {
        str += "[";
        for(unsigned int j=0; j<table[i].size(); j++)
        {
            str += to_string(table[i][j]);
            if(j<table[i].size()-1)
                str += ",";
        }
        str += "]";
        if(i<table.size()-1)
            str += ",";
    }
    str += "]";
    return str;
}

string mat4ToString(glm::mat4 mat)
{
    string str = "[";
    for(unsigned int i=0; i<4; i++){
        for(unsigned int j=0; j<4; j++){
            str += to_string(mat[i][j]);
            if(!(i==3 && j==3)) str += ",";
        }
    }
    str += "]";
    return str;
}

void printVec3(glm::vec3 vec)
{
    cout<<"x:"<<vec.x<<" y:"<<vec.y<<" z:"<<vec.z<<endl;
}

void printVec4(glm::vec4 vec)
{
    cout<<"x:"<<vec.x<<" y:"<<vec.y<<" z:"<<vec.z<<" w:"<<vec.w<<endl;
}

void printMat4(glm::mat4 mat)
{
    for(unsigned int i=0; i<4; i++)
    {
        for(unsigned int j=0; j<4; j++)
        {
            cout<<setw(16)<<setfill(' ')<<mat[i][j];
        }
        cout<<endl;
    }
    cout<<endl;
}

void printBox(Box box)
{
    cout<<"Min: "<<box.Min.x<<" "<<box.Min.y<<" "<<box.Min.z<<endl;
    cout<<"Max: "<<box.Max.x<<" "<<box.Max.y<<" "<<box.Max.z<<endl;
    // if(box.Min.x>box.Max.x || box.Min.y>box.Max.y || box.Min.z>box.Max.z)
    // {
    //     cout<<"Min: "<<box.Min.x<<" "<<box.Min.y<<" "<<box.Min.z<<endl;
    //     cout<<"Max: "<<box.Max.x<<" "<<box.Max.y<<" "<<box.Max.z<<endl;
    // }
}

void printSphere(Sphere sphere)
{
    cout<<"center: ";
    printVec3(sphere.center);
    cout<<"radius: "<<sphere.radius<<endl;
}

void printPlane(Plane plane)
{
    cout<<"normal: ";
    printVec3(plane.normal);
    cout<<"distance: "<<plane.distance<<endl;
}

#endif