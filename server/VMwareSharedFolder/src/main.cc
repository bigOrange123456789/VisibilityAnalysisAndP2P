#include "SceneInfo.h"
#include "Correspond.h"

using namespace std;

int main(){

    SceneInfo* scene = new SceneInfo();
	scene->init();

    // scene->printInfomation();

    Correspond* server = new Correspond();
	server->setUp(scene);

}