#include "SceneInfo.h"
#include "LZC.h"
#include "Correspond.h"

using namespace std;

int main(){
    LZC* lzc = new LZC();
    lzc->init("./dist/config.json");

    SceneInfo* scene = new SceneInfo();
	scene->init(lzc->config->sceneName);

    // scene->printInfomation();

    Correspond* server = new Correspond();
	server->setUp(scene,lzc->config->port);

}