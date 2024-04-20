#include "LZC.h"
#include "SceneInfo.h"
#include "Correspond.h"

using namespace std;

int main(){
    // LZC* lzc = new LZC();
    // lzc->init();

    SceneInfo* scene = new SceneInfo();
	scene->init();

    // scene->printInfomation();

    Correspond* server = new Correspond();
	server->setUp(scene);

}