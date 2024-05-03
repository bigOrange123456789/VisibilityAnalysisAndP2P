#include "SceneInfo.h"
#include "LZC.h"
#include "Correspond.h"

using namespace std;

int main(){
    LZC* lzc = new LZC();
    lzc->init("./dist/config.json");

    // SceneInfo* scene = new SceneInfo();
	// scene->init(lzc->config->sceneName);
    

    SceneInfo** sceneList = new SceneInfo* [lzc->config->sceneNameList_len];
    for(unsigned int i=0; i<lzc->config->sceneNameList_len; i++){
        std::cout << "i:" << i << ":" <<  lzc->config->sceneNameList[i] << std::endl;
        SceneInfo* scene0 = new SceneInfo();
        scene0->sceneName=lzc->config->sceneNameList[i];
	    scene0->init(lzc->config->sceneNameList[i]);//scene0->init(lzc->config->sceneNameList[i]);
        sceneList[i]=scene0;
    }
    // std::cout <<sceneList[0];

    // scene->printInfomation();

    Correspond* server = new Correspond();
	server->setUp(sceneList,lzc->config->sceneNameList_len,lzc->config->port);

}