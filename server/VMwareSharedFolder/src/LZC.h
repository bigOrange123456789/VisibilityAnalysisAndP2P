// #ifndef SCENE_INFO_H
// #define SCENE_INFO_H

// #include <iostream>
// #include <string>
// #include <vector>
// #include <ctime>
// #include <unordered_set>
// #include <glad/glad.h>
// #include <GLFW/glfw3.h>
// #include <glm/glm.hpp>
// #include <glm/gtc/matrix_transform.hpp>
// #include <glm/gtc/type_ptr.hpp>
// #include "opengl/shader.h"
// #include "opengl/module.h"
// #include "opengl/occluder_loader.h"
// #include "opengl/instanced_mesh.h"

// #define SCREEN_WIDTH 1024
// #define SCREEN_HEIGHT 1024

// struct SceneUnit
// {
//     int* meshIndex;
//     int meshCount;
//     Box unitBox;
//     SceneUnit** children;
//     int childrenCount;

//     SceneUnit(){}
//     SceneUnit(nlohmann::json unit_info)
//     {
//         meshCount = unit_info.contains("meshIndex") ? unit_info["meshIndex"].size() : 0;
//         meshIndex = new int [meshCount];
//         for(unsigned int i=0; i<meshCount; i++){
//             meshIndex[i] = (int)unit_info["meshIndex"][i];
//         }

//         if(unit_info.contains("nodeBox")){
//             nlohmann::json box = unit_info["nodeBox"];
//             unitBox = Box(
//                 glm::vec3((float)box[0][0],(float)box[0][1],(float)box[0][2]),
//                 glm::vec3((float)box[1][0],(float)box[1][1],(float)box[1][2])
//             );
//         }

//         childrenCount = unit_info.contains("children") ? unit_info["children"].size() : 0;
//         children = new SceneUnit* [childrenCount];
//         for(unsigned int i=0; i<childrenCount; i++){
//             children[i] = new SceneUnit(unit_info["children"][i]);
//         }
//     }
// };

class LZC
{
public:
    // glm::mat4 matrixWorld;

    void init();
    // void printInfomation();

    // vector<int> subregionCulling(Frustum& frustum);
    // vector<vector<int>> occlusionCulling(Frustum& frustum, nlohmann::json PVS);

// private:

    // int* instanceOffset;
    // int* instanceSize;

    // Sphere** sphereInfo;
    // Box** boxInfo;

    // float* contribInfo;
    // InstancedMesh** instancedMeshes;

    // vector<glm::vec3> centerPoints;
    // vector<SceneUnit*> sceneVoxels;
    // unordered_set<int> occluderSet;

    // GLFWwindow* window;
    // Shader myShader;
};
void LZC::init()
{
    //字符串  
	const char* str =
		"{\"name\":\"shuiyixin\",\"age\":\"21\",\"sex\":\"man\"}";
	
    // Json::Reader reader;
	// Json::Value root;
 
	// //从字符串中读取数据  
	// if (reader.parse(str, root))
	// {
	// 	string name = root["name"].asString();
	// 	int age = root["nomen"].asInt();
	// 	string sex = root["sex"].asString();
	// 	cout << name + "," << age << "," << sex <<  endl;
	// }
}


// void LZC::printInfomation()
// {
//     int index = 1000;
//     cout<<"index:"<<index<<endl;
//     cout<<instanceSize[index]<<"  "<<instanceOffset[index]<<endl;
//     for(int i=0; i<instanceSize[index]; i++){
//         cout<<"  "<<i<<"  ";
//         printSphere(*sphereInfo[instanceOffset[index]+i]);
//     }
//     cout<<endl;
// }

// vector<int> LZC::subregionCulling(Frustum& frustum)
// {
//     vector<pair<SceneUnit*,float>> firstUnitPair, secondUnitPair, thirdUnitPair;
//     for(unsigned int i=0; i<sceneVoxels.size(); i++){
//         SceneUnit* firstLevelUnit = sceneVoxels[i];
//         Box unitBox = firstLevelUnit->unitBox;
//         float distance = frustum.distanceToPoint(unitBox.getCenter())/getWeight(frustum.projectPoint(unitBox.getCenter()),0.8);
//         if(frustum.intersectBox(unitBox)){
//             firstUnitPair.push_back(pair<SceneUnit*,float>(firstLevelUnit,distance));
//             for(unsigned int j=0; j<firstLevelUnit->childrenCount; j++){
//                 SceneUnit* secondLevelUnit = firstLevelUnit->children[j];
//                 Box unitBox = secondLevelUnit->unitBox;
//                 float distance = frustum.distanceToPoint(unitBox.getCenter())/getWeight(frustum.projectPoint(unitBox.getCenter()),0.8);
//                 if(distance<4000 && frustum.intersectBox(unitBox)){
//                     secondUnitPair.push_back(pair<SceneUnit*,float>(secondLevelUnit,distance));
//                     for(unsigned int k=0; k<secondLevelUnit->childrenCount; k++){
//                         SceneUnit* thirdLevelUnit = secondLevelUnit->children[k];
//                         Box unitBox = thirdLevelUnit->unitBox;
//                         float distance = frustum.distanceToPoint(unitBox.getCenter())/getWeight(frustum.projectPoint(unitBox.getCenter()),0.8);
//                         if(distance<2000 && frustum.intersectBox(unitBox)){
//                             thirdUnitPair.push_back(pair<SceneUnit*,float>(thirdLevelUnit,distance));
//                         }
//                     }
//                 }
//             }
//         }
//     }

//     sort(begin(firstUnitPair), end(firstUnitPair), [&](const auto& a, const auto& b){ return a.second < b.second; });
//     sort(begin(secondUnitPair), end(secondUnitPair), [&](const auto& a, const auto& b){ return a.second < b.second; });
//     sort(begin(thirdUnitPair), end(thirdUnitPair), [&](const auto& a, const auto& b){ return a.second < b.second; });

//     vector<pair<int,float>> loadMap;
//     unordered_set<int> componentMap;

//     int firstComponentCount = 0;
//     for(int i=0; i<firstUnitPair.size(); i++){
//         SceneUnit* unit = firstUnitPair[i].first;
//         for(int j=0; j<unit->meshCount; j++){
//             int index = unit->meshIndex[j];
//             if(componentMap.count(index)) continue;
//             else componentMap.insert(index);
//             float contrib = 0;
//             float minDis = frustum.distanceToPoint(sphereInfo[instanceOffset[index]]->center);
//             for(unsigned int k=0; k<instanceSize[index] && contrib<100; k++){
//                 float dis = frustum.distanceToPoint(sphereInfo[instanceOffset[index]+k]->center);
//                 minDis = min(dis,minDis);
//                 float cont = contribInfo[index] / (dis*dis) * getWeight(frustum.projectPoint(sphereInfo[instanceOffset[index]+k]->center), 0.4);
//                 if(cont>0.2 && frustum.intersectSphere(sphereInfo[instanceOffset[index]+k])){
//                     contrib += cont;
//                 }
//             }
//             if(contrib>1.2){
//                 loadMap.push_back(pair<int,float>(index,contrib));
//                 firstComponentCount++;
//             }
//         }
//     }

//     int secondComponentCount = 0;
//     for(int i=0; i<secondUnitPair.size(); i++){
//         SceneUnit* unit = secondUnitPair[i].first;
//         for(int j=0; j<unit->meshCount; j++){
//             int index = unit->meshIndex[j];
//             if(componentMap.count(index)) continue;
//             else componentMap.insert(index);
//             float contrib = 0;
//             float minDis = frustum.distanceToPoint(sphereInfo[instanceOffset[index]]->center);
//             for(unsigned int k=0; k<instanceSize[index] && contrib<100; k++){
//                 float dis = frustum.distanceToPoint(sphereInfo[instanceOffset[index]+k]->center);
//                 minDis = min(dis,minDis);
//                 float cont = contribInfo[index] / (dis*dis) * getWeight(frustum.projectPoint(sphereInfo[instanceOffset[index]+k]->center), 0.4);
//                 if(dis<4000 && frustum.intersectSphere(sphereInfo[instanceOffset[index]+k])){
//                     contrib += cont;
//                 }
//             }
//             if(contrib>1.2){
//                 loadMap.push_back(pair<int,float>(index,contrib));
//                 secondComponentCount++;
//             }
//         }
//         if(secondComponentCount>3072) break;
//     }

//     int thirdComponentCount = 0;
//     for(int i=0; i<thirdUnitPair.size(); i++){
//         SceneUnit* unit = thirdUnitPair[i].first;
//         for(int j=0; j<unit->meshCount; j++){
//             int index = unit->meshIndex[j];
//             if(componentMap.count(index)) continue;
//             else componentMap.insert(index);
//             float contrib = 0;
//             float minDis = frustum.distanceToPoint(sphereInfo[instanceOffset[index]]->center);
//             for(unsigned int k=0; k<instanceSize[index] && contrib<100; k++){
//                 float dis = frustum.distanceToPoint(sphereInfo[instanceOffset[index]+k]->center);
//                 minDis = min(dis,minDis);
//                 float cont = contribInfo[index] / (dis*dis) * getWeight(frustum.projectPoint(sphereInfo[instanceOffset[index]+k]->center), 0.4);
//                 if(dis<2000 && frustum.intersectSphere(sphereInfo[instanceOffset[index]+k])){
//                     contrib += cont;
//                 }
//             }
//             if(contrib>1.2){
//                 loadMap.push_back(pair<int,float>(index,contrib));
//                 thirdComponentCount++;
//             }
//         }
//         if(thirdComponentCount>3072) break;
//     }

//     sort(begin(loadMap), end(loadMap), [&](const auto& a, const auto& b){ return a.second > b.second; });

//     vector<int> loadList;
//     for(unsigned int i=0; i<loadMap.size(); i++){
//         loadList.push_back(loadMap[i].first);
//     }

//     // cout<<"frustum culling result: "<<loadList.size()<<" = "<<firstComponentCount<<" + "<<secondComponentCount<<" + "<<thirdComponentCount<<endl;

//     return loadList;
// }

// vector<vector<int>> LZC::occlusionCulling(Frustum& frustum, nlohmann::json PVS)
// {
//     return {PVS, {}};

//     vector<int> visibleList;
//     vector<int> invisibleList;

//     const int occluderComponentCount = 50;
//     unordered_set<int> occluderSetForFrame;
//     for(int i=0; i<PVS.size(); i++){
//         int index = PVS[i];
//         if(occluderSet.count(index)){
//             visibleList.push_back(index);
//             occluderSetForFrame.insert(index);
//         }
//         if(visibleList.size()>=50)
//             break;
//     }

//     const int Width = SCREEN_WIDTH, Height = SCREEN_HEIGHT;

//     myShader.use();
//     myShader.setMat4("projection", frustum.getProjectMatrix());
//     myShader.setMat4("model", matrixWorld);

//     glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
//     glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);

//     for(unsigned int n=0; n<visibleList.size(); n++){
//         int index = visibleList[n];
//         instancedMeshes[index]->Draw(myShader);
//     }

//     int bufferSize = Width * Height;
//     float* pixels = (float*) malloc(sizeof(float)*bufferSize);
//     memset(pixels, 1.0f, sizeof(float)*bufferSize);
//     glReadPixels(0, 0, Width, Height, GL_DEPTH_COMPONENT, GL_FLOAT, pixels);

//     float** hierarchicalZBuffer = new float*[11];
//     hierarchicalZBuffer[0] = pixels;
//     hierarchicalZBuffer[1] = (float*) malloc(sizeof(float)*bufferSize/4);
//     hierarchicalZBuffer[2] = (float*) malloc(sizeof(float)*bufferSize/16);
//     hierarchicalZBuffer[3] = (float*) malloc(sizeof(float)*bufferSize/64);
//     hierarchicalZBuffer[4] = (float*) malloc(sizeof(float)*bufferSize/256);
//     hierarchicalZBuffer[5] = (float*) malloc(sizeof(float)*bufferSize/1024);
//     hierarchicalZBuffer[6] = (float*) malloc(sizeof(float)*bufferSize/4096);
//     hierarchicalZBuffer[7] = (float*) malloc(sizeof(float)*bufferSize/16384);
//     hierarchicalZBuffer[8] = (float*) malloc(sizeof(float)*bufferSize/65536);
//     hierarchicalZBuffer[9] = (float*) malloc(sizeof(float)*bufferSize/262144);
//     hierarchicalZBuffer[10] = (float*) malloc(sizeof(float)*bufferSize/1048576);
//     int w = 1024, h = 1024;
//     for(int hier=1; hier<11; hier++){
//         w /= 2; h /= 2;
//         for(int i=0; i<w; i++){
//             for(int j=0; j<h; j++){
//                 float maxDepth = max(0.0f, hierarchicalZBuffer[hier-1][2*i+2*j*w*2]);
//                 maxDepth = max(maxDepth, hierarchicalZBuffer[hier-1][2*i+1+2*j*w*2]);
//                 maxDepth = max(maxDepth, hierarchicalZBuffer[hier-1][2*i+(2*j+1)*w*2]);
//                 maxDepth = max(maxDepth, hierarchicalZBuffer[hier-1][2*i+1+(2*j+1)*w*2]);
//                 hierarchicalZBuffer[hier][i+j*w] = maxDepth;
//             }
//         }
//     }

//     vector<int> pow2 = {1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1};
//     for(int i=0; i<PVS.size(); i++){
//         int index = PVS[i];
//         if(occluderSetForFrame.count(index)){
//             continue;
//         }
//         bool visibility = false;
//         for(unsigned int j=0; j<instanceSize[index]; j++){
//             Box* box = boxInfo[instanceOffset[index]+j];
//             if(frustum.intersectBox(box)){
//                 float length = box->getRadius();
//                 int hier = log2(length*1024)-1;
//                 hier = max(0, min(10, hier));
//                 vector<glm::vec3> vertexes = box->getVertexes();
//                 for(int k=0; k<vertexes.size(); k++){
//                     glm::vec3 testVec = vertexes[k];
//                     glm::vec3 projVec = frustum.projectPoint(testVec);
//                     int x = (projVec.x+1.0)/2.0*pow2[hier], y = (projVec.y+1.0)/2.0*pow2[hier];
//                     if(x>=0 && x<pow2[hier] && y>=0 && y<pow2[hier]){
//                         float zBufferDepth = hierarchicalZBuffer[hier][x+y*pow2[hier]];
//                         if(projVec.z<zBufferDepth){
//                             visibility = true;
//                             break;
//                         }
//                     }
//                 }
//             }
//             if(visibility){
//                 break;
//             }
//         }
//         if(visibility){
//             visibleList.push_back(index);
//         }else{
//             invisibleList.push_back(index);
//         }
//     }

//     for(int i=0; i<11; i++) free(hierarchicalZBuffer[i]);
//     delete(hierarchicalZBuffer);

//     return {visibleList, invisibleList};
// }

// #endif
