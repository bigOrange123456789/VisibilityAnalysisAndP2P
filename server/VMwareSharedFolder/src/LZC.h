#ifndef LZC_INFO_H
#define LZC_INFO_H

#include <iostream>
#include <string>
struct Config0{
    string sceneName;
    int port;
    Config0(){}
    Config0(nlohmann::json info)
    {
        port = info["port"];//8080;
        sceneName = info["sceneName"];//"project01";
    }
};

class LZC
{
public:
    Config0* config;
    void init(string path);
};
void LZC::init(string path)
{
    // string path = "dist/test.json";//"assets/";
    std::cout << "path(test):" << path << std::endl;
    nlohmann::json config_info = readJsonFile(path);
    config = new Config0(config_info);//Config* c=new Config(config_info);
    // std::cout << "sceneName :" << config->sceneName << std::endl;
    // std::cout << "port :" << config->port << std::endl;
}

#endif