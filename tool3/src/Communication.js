import * as THREE from 'three'
import { StateCode } from "./network/StateCode"
export class Communication{
    constructor(camera,rtxgiNetwork,ui,light,models){
        this.camera=camera
        this.rtxgiNetwork=rtxgiNetwork
        this.ui=ui
        this.light=light

        this.updateProbe = false;

        //syncClientCameraToServer
        this.lastCameraPos = new THREE.Vector3();
        this.lastCameraRot = new THREE.Vector3();
        this.lastCameraUp
        
        //updateIndirectMaterial
        this.waitFrame=150.0;
        this.totalTime = 0.0;
        this.stopUpdate = false;

        //syncClientPointLightToServer
        this.plightIndex = 0;

        //syncClientVolumeDescToServer
        this.sendIdFinish=false

        const self=this
        const animate=()=>{
              /*volume desc async*/
            if(rtxgiNetwork.ready() &&!this.sendIdFinish){
                // this.syncClientVolumeDescToServer();
                this.sendIdFinish=true
            }
    
            if(rtxgiNetwork != undefined 
              &&rtxgiNetwork.ready()){
                self.syncClientCameraToServer()
                self.syncClientDirectionalLightToServer()
                self.syncClientPointLightToServer()
                self.syncClientSpotLightToServer()
            }
            this.updateIndirectMaterial(models)
            requestAnimationFrame(animate); 
        };animate()
    }
    send(data){
        var jsonStr = JSON.stringify(data);
        var enc = new TextEncoder();
        var jsonUint8 = enc.encode(jsonStr);
        var msg = new Uint8Array(jsonUint8.length);
        msg.set(jsonUint8, 0);
        const rtxgiNetwork=this.rtxgiNetwork
        if(rtxgiNetwork != undefined && rtxgiNetwork.ready())
            rtxgiNetwork.C2SSocket.send(msg);
    }
    updateIndirectMaterial(models){
        const rtxgiNetwork=this.rtxgiNetwork
        if(this.updateProbe){//保证光照探针的刷新频率不会过高
            this.totalTime = 0.0;
            this.stopUpdate = false;
          }else{
              this.totalTime += 1.0;
              if(this.totalTime > this.waitFrame)
              {
                this.syncClientAttachServerStop();
                this.stopUpdate = true;
              }
          }
          
          /*update irradiance and distance*/
        //   if(rtxgiNetwork.IrradianceTex != null && 
        //   rtxgiNetwork.DistanceTex != null && !this.stopUpdate)
          {
            for (var i = 0; i < models.length; i++) {
              const irradianceLoader = rtxgiNetwork.IrradianceTex;
              models[i].indirectMaterial.probeIrradianceUpdate(irradianceLoader) ;
            //   const probeDistanceLoader = rtxgiNetwork.DistanceTex;
            //   models[i].indirectMaterial.uniforms.probeDistance.value = probeDistanceLoader;
            //   console.log({
            //     probeDistanceLoader:probeDistanceLoader,
            //     irradianceLoader:irradianceLoader
            //   })
            }
              
              this.updateProbe = false;//探针更新完成
              this.stopUpdate = false;
          }
    }
    syncClientAttachServerStop()//让服务器停止发送信息
    {
        return
        const rtxgiNetwork=this.rtxgiNetwork
        let volumeDescReqJson = 
        {
            type: StateCode.C2S_RTXGI_StopUpdate,
            sceneId: rtxgiNetwork.sceneId
        };
        this.send(volumeDescReqJson);
    }
    syncClientCameraToServer(){
        const camera=this.camera
        const rtxgiNetwork=this.rtxgiNetwork
        var cameraMatrix = new THREE.Matrix4();
        cameraMatrix.makeRotationFromQuaternion(camera.quaternion);
        /*camera forward*/
        let cameraForward = new THREE.Vector3();
        cameraForward.x = -cameraMatrix.elements[8];
        cameraForward.y = -cameraMatrix.elements[9];
        cameraForward.z = -cameraMatrix.elements[10];
        let cameraRight = new THREE.Vector3();
        cameraRight.x = cameraMatrix.elements[0];
        cameraRight.y = cameraMatrix.elements[1];
        cameraRight.z = cameraMatrix.elements[2];
        let cameraUp = new THREE.Vector3();
        cameraUp.x = cameraMatrix.elements[4];
        cameraUp.y = cameraMatrix.elements[5];
        cameraUp.z = cameraMatrix.elements[6];
        /*check last data*/
        if(camera.position.equals(this.lastCameraPos)
            && cameraForward.equals(this.lastCameraRot)&&
        cameraUp.equals(this.lastCameraUp))
        return;

        /*camera update*/
        let cameraJson = 
        {
            type: StateCode.C2S_RTXGI_Camera,
            sceneId: rtxgiNetwork.sceneId,
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
            
            rightx: cameraRight.x,
            righty: cameraRight.y,
            rightz: cameraRight.z,
            
            upx: cameraUp.x,
            upy: cameraUp.y,
            upz: cameraUp.z,
            
            rtx: cameraForward.x,
            rty: cameraForward.y,
            rtz: cameraForward.z
        };
        this.lastCameraPos = camera.position;
        this.lastCameraRot = cameraForward;
        this.lastCameraUp = cameraUp;
        
        this.send(cameraJson);
    }
    syncClientDirectionalLightToServer(){
        const rtxgiNetwork=this.rtxgiNetwork
        const ui=this.ui
        const light=this.light
        if(!ui.dlightChange)
            return;
        
        /*direction change or not*/
        let lightForwardVec = new THREE.Vector3();
        lightForwardVec.copy(light.directionalLightGroup[0].target.position);
        let lightForward = lightForwardVec.sub(light.directionalLightGroup[0].position).normalize();
        let lightPower = light.directionalLightGroup[0].intensity;
        let lightColor = light.directionalLightGroup[0].color;
        /*data json str*/
        let lightJson = 
        {
            type: StateCode.C2S_RTXGI_DirectionalLight,
            sceneId: rtxgiNetwork.sceneId,
            x: lightForward.x,
            y: lightForward.y,
            z: lightForward.z,
            power: lightPower,
            colorr: lightColor.r,
            colorg:lightColor.g,
            colorb:lightColor.b
            
        };
        this.send(lightJson)
    }
    syncClientPointLightToServer(){
        const rtxgiNetwork=this.rtxgiNetwork
        const ui=this.ui
        const light=this.light
        if(!ui.plightChange)
            return;
        
        let lightColor = light.pointLightGroup[this.plightIndex].color;
        let lightPower = light.pointLightGroup[this.plightIndex].power;
        let lightPosition = light.pointLightGroup[this.plightIndex].position;
        let lightDistance = light.pointLightGroup[this.plightIndex].distance;
        /*data json str*/
        let lightJson = 
        {
            type: StateCode.C2S_RTXGI_PointLight,
            sceneId: rtxgiNetwork.sceneId,
            index: this.plightIndex,
            x: lightPosition.x,
            y: lightPosition.y,
            z: lightPosition.z,
            power: lightPower,
            colorr: lightColor.r,
            colorg:lightColor.g,
            colorb:lightColor.b,
            distance: lightDistance
        };
        this.send(lightJson)
    }
    syncClientSpotLightToServer(){
        const rtxgiNetwork=this.rtxgiNetwork
        const ui=this.ui
        const light=this.light
        if(!ui.slightChange)
            return;
        
        let lightForwardVec = new THREE.Vector3();
        lightForwardVec.copy(light.spotLightGroup[slightIndex].target.position);
        let lightForward = lightForwardVec.sub(light.spotLightGroup[slightIndex].position).normalize();
        let lightColor = light.spotLightGroup[slightIndex].color;
        let lightPower = light.spotLightGroup[slightIndex].power;
        let lightPosition = light.spotLightGroup[slightIndex].position;
        let lightDistance = light.spotLightGroup[slightIndex].distance;
        let lightAngle = light.spotLightGroup[slightIndex].angle;
        let lightPenumbra = light.spotLightGroup[slightIndex].penumbra;
        /*data json str*/
        let lightJson = 
        {
            type: StateCode.C2S_RTXGI_SpotLight,
            sceneId: rtxgiNetwork.sceneId,
            index: slightIndex,
            x: lightPosition.x,
            y: lightPosition.y,
            z: lightPosition.z,
            dx: lightForward.x,
            dy: lightForward.y,
            dz: lightForward.z,
            power: lightPower,
            colorr: lightColor.r,
            colorg:lightColor.g,
            colorb:lightColor.b,
            distance: lightDistance,
            angle: lightAngle,
            penumbra: lightPenumbra
        };
        this.send(lightJson);
    }
    syncClientVolumeDescToServer()
    {
        alert(123)
        const rtxgiNetwork=this.rtxgiNetwork
        let volumeDescReqJson = 
        {
            type: StateCode.C2S_RTXGI_VolumeDesc,
            sceneId: rtxgiNetwork.sceneId
        };
        this.send(volumeDescReqJson)
    }

    
}