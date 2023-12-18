import * as THREE from 'three'
import { StateCode } from "./network/StateCode"
import { RTXGINetwork } from './network/RTXGINetwork';
export class Communication extends RTXGINetwork{
    constructor(){
        super()
        this.sceneId = window.location.href.split('/').pop()

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
        this.onready=()=>{console.log(11)}
    }
    init(camera,ui,light,models){
        this.camera=camera
        this.ui=ui
        this.light=light

        const self=this
        let asyncScene=false
        const animate=()=>{
            if(self.ready() &&!self.isDescTouch){
                self.syncClientVolumeDescToServer();
            }
            // /*init threejs evi*/
            if(self.isDescTouch && !asyncScene)
            {
                self.onready()
                asyncScene = true;
            }

            if(self.isDescTouch && asyncScene&&self.ready()){
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
        var jsonUint8 = new TextEncoder().encode(jsonStr);
        var msg = new Uint8Array(jsonUint8.length);
        msg.set(jsonUint8, 0);
        if(this.ready())this.C2SSocket.send(msg);
    }
    updateIndirectMaterial(models){
        const rtxgiNetwork=this
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
        const irradianceLoader = rtxgiNetwork.IrradianceTex;
        const probeDistanceLoader = rtxgiNetwork.DistanceTex;
        // if(rtxgiNetwork.IrradianceTex.image)
        //     console.log(rtxgiNetwork.IrradianceTex.image.data)
        for (var i = 0; i < models.length; i++) {
            models[i].indirectMaterial.probeIrradianceUpdate(irradianceLoader) ;
            models[i].indirectMaterial.uniforms.probeDistance.value = probeDistanceLoader;
        }
              
        this.updateProbe = false;//探针更新完成
        this.stopUpdate = false;
          
    }
    syncClientAttachServerStop()//让服务器停止发送信息
    {
        this.send({
            type: StateCode.C2S_RTXGI_StopUpdate,
            sceneId: this.sceneId
        })
    }
    syncClientCameraToServer(){
        const camera=this.camera
        const rtxgiNetwork=this
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
            rtz: cameraForward.z,

            width: window.innerWidth,//新版新增
            height: window.innerHeight//新版新增
        };
        this.lastCameraPos = camera.position;
        this.lastCameraRot = cameraForward;
        this.lastCameraUp = cameraUp;
        
        this.send(cameraJson);
    }
    syncClientDirectionalLightToServer(){
        const rtxgiNetwork=this
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
        const rtxgiNetwork=this
        const ui=this.ui
        const light=this.light
        if(!ui.plightChange)
            return;
  
        for(
            let plightIndex=0;
            plightIndex<light.pointLightGroup.length;
            plightIndex++
            ){
            let lightColor = light.pointLightGroup[plightIndex].color;
            let lightPower = light.pointLightGroup[plightIndex].power;
            let lightPosition = light.pointLightGroup[plightIndex].position;
            let lightDistance = light.pointLightGroup[plightIndex].distance;
            /*data json str*/
            let lightJson = 
            {
                type: StateCode.C2S_RTXGI_PointLight,
                sceneId: rtxgiNetwork.sceneId,
                index: plightIndex,
                x: lightPosition.x,
                y: lightPosition.y,
                z: lightPosition.z,
                power: lightPower,
                colorr: lightColor.r,
                colorg:lightColor.g,
                colorb:lightColor.b,
                distance: lightDistance
            }
            this.send(lightJson)
        }
        
    }
    syncClientSpotLightToServer(){
        const rtxgiNetwork=this
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
    syncClientVolumeDescToServer(){//与服务器建立连接
        console.log("与服务器建立连接")
        this.send({
            type: StateCode.C2S_RTXGI_VolumeDesc,
            sceneId: this.sceneId
        })
    }    
}