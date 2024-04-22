#ifndef CORRESPOND_H
#define CORRESPOND_H

#include "SceneInfo.h"
#include "App.h"

class Correspond{
    public:
    SceneInfo* sceneInfo;

    void setUp(SceneInfo* scene,int port);
private:

};
void Correspond::setUp(SceneInfo* scene,int port){
    sceneInfo = scene;

    /* ws->getUserData returns one of these */
    struct PerSocketData {
        /* Fill with user data */
    };

    /* Keep in mind that uWS::SSLApp({options}) is the same as uWS::App() when compiled without SSL support.
     * You may swap to using uWS:App() if you don't need SSL */
    // int port=4005;
    std::cout << "Listening on port " << port << std::endl;
    uWS::App({
        /* There are example certificates in uWebSockets.js repo */
	    .key_file_name = "misc/key.pem",
	    .cert_file_name = "misc/cert.pem",
	    .passphrase = "1234"
	}).ws<PerSocketData>("/*", {
        /* Settings */
        .compression = uWS::CompressOptions(uWS::DEDICATED_COMPRESSOR_4KB | uWS::DEDICATED_DECOMPRESSOR),
        .maxPayloadLength = 100 * 1024 * 1024,
        .idleTimeout = 16,
        .maxBackpressure = 100 * 1024 * 1024,
        .closeOnBackpressureLimit = false,
        .resetIdleTimeoutOnSend = false,
        .sendPingsAutomatically = true,
        /* Handlers */
        .upgrade = nullptr,
        .open = [](auto */*ws*/) {
            /* Open event here, you may access ws->getUserData() which points to a PerSocketData struct */
            // std::cout << "open" << std::endl;
        },
        .message = [&](auto *ws, std::string_view message, uWS::OpCode opCode) {
            /* This is the opposite of what you probably want; compress if message is LARGER than 16 kb
             * the reason we do the opposite here; compress if SMALLER than 16 kb is to allow for 
             * benchmarking of large message sending without compression */
            
            nlohmann::json root = nlohmann::json::parse(message);
            if(root["typ"]==0){
                Frustum frustum;
                frustum.setFromProjectMatrixJson(root);
                auto res = this->sceneInfo->subregionCulling(frustum);
                nlohmann::json response;
                response["typ"] = 0;
                response["pos"] = root["pos"];
                response["res"] = res;
                ws->send(response.dump(), opCode, true);
            }else if(root["typ"]==1){
                Frustum frustum;
                frustum.setFromProjectMatrixJson(root);
                nlohmann::json PVS = root["PVS"];
                auto res = this->sceneInfo->occlusionCulling(frustum, PVS);
                nlohmann::json response;
                response["typ"] = 0;
                response["pos"] = root["pos"];
                response["res"] = res;
                ws->send(response.dump(), opCode, true);
            }else if(root["typ"]==-1){
                nlohmann::json response;
                response["mat"] = mat4ToString(this->sceneInfo->matrixWorld);
                ws->send(response.dump(), opCode, true);
            }
        },
        .drain = [](auto */*ws*/) {
            /* Check ws->getBufferedAmount() here */
        },
        .ping = [](auto */*ws*/, std::string_view) {
            /* Not implemented yet */
        },
        .pong = [](auto */*ws*/, std::string_view) {
            /* Not implemented yet */
        },
        .close = [](auto */*ws*/, int /*code*/, std::string_view /*message*/) {
            /* You may access ws->getUserData() here */
        }
    }).listen(port, [](auto *listen_socket) {
        if (listen_socket) {
            std::cout << "Listening ... " << std::endl;
        }
    }).run();
}

#endif
