#include "SceneInfo.h"

using namespace std;

int main(){
    SceneInfo* scene = new SceneInfo();
	scene->init();
    Box sceneBox = scene->getSceneBox();

    printBox(sceneBox);

    int CountX = 100;
    int CountY = 5;
    int CountZ = 100;
    float dx = (sceneBox.Max.x-sceneBox.Min.x)/CountX;
    float dy = (sceneBox.Max.y-sceneBox.Min.y)/CountY;
    float dz = (sceneBox.Max.z-sceneBox.Min.z)/CountZ;

    for(int i=0; i<CountX; i++){
        
    }
}