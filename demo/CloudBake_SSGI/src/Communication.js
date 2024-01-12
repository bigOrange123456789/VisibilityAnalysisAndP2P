import * as THREE from 'three'
import { StateCode } from "./network/StateCode"
import { RTXGINetwork } from './network/RTXGINetwork';
export class Communication extends RTXGINetwork{
    constructor(camera,ui,light,texture){
        super()
        this.texture=texture
        this.sceneId = window.location.href.split('/').pop()

        this.updateProbe = false;
        this.askRtxAo = false;//当前视锥无变化、不需要更新AO

        //syncClientCameraToServer
        this.lastCameraPos = new THREE.Vector3();
        this.lastCameraRot = new THREE.Vector3();
        this.lastCameraUp
        
        //updateIndirectMaterial
        this.waitFrame=150.0;
        this.totalTime = 0.0;
        this.askAoTime = 0.0;
        this.stopUpdate = false;

        //syncClientPointLightToServer
        this.plightIndex = 0;
        this.onready=()=>{console.log(11)}

        this.camera=camera
        this.ui=ui
        this.light=light

        const self=this
        let asyncScene=false
        const animate=()=>{
            if(self.ready() &&!self.isDescTouch){
                self.syncClientVolumeDescToServer();//与服务器建立连接
            }
            // /*init threejs evi*/
            if(self.isDescTouch && !asyncScene)
            {
                self.onready()
                asyncScene = true;
            }

            if(self.isDescTouch && asyncScene&&self.ready()){//将当前状态告知服务器
                self.syncClientCameraToServer()
                self.syncClientDirectionalLightToServer()
                self.syncClientPointLightToServer()
                self.syncClientSpotLightToServer()
            }
            this.updateIndirectMaterial(texture)//获取服务器的光追结果
            requestAnimationFrame(animate); 
        };animate()
        setInterval(()=>{
            if(self.isDescTouch && asyncScene&&self.ready()){//将当前状态告知服务器
                self.syncClientCameraToServer_test()
            }
        },500)
    }
    send(data){
        var jsonStr = JSON.stringify(data);
        var jsonUint8 = new TextEncoder().encode(jsonStr);
        var msg = new Uint8Array(jsonUint8.length);
        msg.set(jsonUint8, 0);
        if(this.ready())this.C2SSocket.send(msg);
    }
    updateIndirectMaterial(texture){//每一帧执行一次
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
        texture.probeIrradiance.value=irradianceLoader //IndirectMaterial.prototype.probeIrradiance0//null 
		texture.probeDistance.value=probeDistanceLoader// probeDistance: { type: 't', value: null },
              
        this.updateProbe = false;//探针更新完成
        this.stopUpdate = false;
        
        // update rtxao
        // if(this.askRtxAo){//当视锥变化的时候停用AO
        //     this.askAoTime = 0.0;
        //     texture.useRtao.value = false;
        //     this.askRtxAo = false;
        // }else{
        //     this.askAoTime += 1.0;
        //     if(this.askAoTime > 5.0){//当视锥固定4帧后再启动AO
        //         texture.useRtao.value = true;
        //     }
        // }
        // rtao
        if(rtxgiNetwork.RtaoTex != null)
        {
            // if(rtxgiNetwork.usedRtao)
            texture.rtaoBufferd.value=rtxgiNetwork.RtaoTex;
        }
    }
    syncClientAttachServerStop()//让服务器停止发送信息
    {
        this.send({
            type: StateCode.C2S_RTXGI_StopUpdate,
            sceneId: this.sceneId
        })
    }
    syncClientCameraToServer_test(){
        // console.log("update state")
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

            width: this.texture.screenWidth.value,//window.innerWidth,//新版新增
            height: this.texture.screenHeight.value,//window.innerHeight//新版新增
        };        
        this.send(cameraJson);
    }
    countResidencyFrame=0//驻留的帧数
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

            width: this.texture.screenWidth.value,//window.innerWidth,//新版新增
            height: this.texture.screenHeight.value,//window.innerHeight//新版新增
        };
        
        /*check last data*/
        if(
            camera.position.equals(this.lastCameraPos)&& 
            cameraForward.equals(this.lastCameraRot)&&
            cameraUp.equals(this.lastCameraUp)&&
            this.lastW==this.texture.screenWidth.value&&
            this.lastH==this.texture.screenHeight.value
        ){
            // if(this.countResidencyFrame<1){//刚开始驻留
            if(
                this.countResidencyFrame==0
                ||this.countResidencyFrame==2
                ||this.countResidencyFrame==4
                ||this.countResidencyFrame==8
            ){//刚开始驻留
                // console.log("update state 0",this.countResidencyFrame)
                this.send(cameraJson);
                this.askRtxAo = true;//相机状态有变化，接下来需要更新AO数据
            }
            this.countResidencyFrame++
        }else{//正在移动
            this.countResidencyFrame=0//前端时间不曾驻留
        }
        this.texture.useRtao.value = this.countResidencyFrame>8&&this.texture.useRtao.value0;
        this.lastCameraPos = camera.position;
        this.lastCameraRot = cameraForward;
        this.lastCameraUp = cameraUp;
        this.lastW=this.texture.screenWidth.value
        this.lastH=this.texture.screenHeight.value
    }
    syncClientDirectionalLightToServer(){
        const rtxgiNetwork=this
        const ui=this.ui
        const light=this.light
        if(!ui||!ui.dlightChange)
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