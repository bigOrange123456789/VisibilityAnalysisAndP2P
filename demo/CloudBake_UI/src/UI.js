import * as dat from 'dat.gui'
import * as THREE from 'three'
import { ControlEdit } from '../../../lib/playerControl/ControlEdit.js';
export class UI{
    constructor(param){
        this.dlightChange = false;
        this.plightChange = false;
        this.slightChange = false;
        this.test(param)

    }
    test(param){
        const materialTest=new THREE.MeshBasicMaterial({ color: 0xffffff ,transparent:true,opacity:0.1})
        const camera=param.camera
        const renderer=param.renderer
        const scene=param.scene
        const orbitControl=param.orbitControl
        const boxlist=[]
        
        const flag_pointLight = new THREE.Mesh( 
            new THREE.SphereGeometry( 0.5, 16, 8 ), 
            materialTest
        )
        flag_pointLight.castShadow = false;
        flag_pointLight.receiveShadow = false;
        this.flag_pointLight=flag_pointLight
        this.flag_pointLight.toFlag=()=>{
            const l=flag_pointLight.l
            const f=flag_pointLight
            console.log(l,f)
            if(l){
                f.position.set(l.position.x,l.position.z,l.position.z)
                // f.postion.set(l.rotation.x,l.rotation.z,l.rotation.z)
            }
        }
        this.flag_pointLight.toLight=()=>{
            const l=flag_pointLight.l
            const f=flag_pointLight
            if(l){
                l.position.set(f.position.x,f.position.z,f.position.z)
                // l.postion.set(f.rotation.x,f.rotation.z,f.rotation.z)
            }
        }
        window.flag_pointLight=flag_pointLight
        boxlist.push(this.flag_pointLight)

        const flag_directionalLight = new THREE.Mesh( 
            new THREE.BoxGeometry( 0.5,0.5,0.5 ), 
            materialTest
        )
        flag_directionalLight.castShadow = false;
        flag_directionalLight.receiveShadow = false;
        this.flag_directionalLight=flag_directionalLight
        this.flag_directionalLight.toFlag=()=>{
            const l=flag_directionalLight.l
            const f=flag_directionalLight
            if(l){
                f.position.set(l.position.x,l.position.z,l.position.z)
                f.rotation.set(l.rotation.x,l.rotation.z,l.rotation.z)
            }
        }
        this.flag_directionalLight.toLight=()=>{
            const l=flag_directionalLight.l
            const f=flag_directionalLight
            if(l){
                l.position.set(f.position.x,f.position.z,f.position.z)
                l.rotation.set(f.rotation.x,f.rotation.z,f.rotation.z)
            }
        }
        window.flag_directionalLight=flag_directionalLight
        // flag_directionalLight.visible=false
        boxlist.push(this.flag_directionalLight)

        for(let i=0;i<boxlist.length;i++){
            scene.add(boxlist[i])
        }
        
        const self=this
        if(true)this.controlEditor=new ControlEdit(
            camera,
            renderer,
            boxlist,
            orbitControl,
            obj=>{
                // console.log(1,obj)
            },
            obj=>{
                // console.log(2,obj)
                self.flag_pointLight.toLight()
                self.plightChange = true;
                // self.flag_directionalLight.toLight()
                // self.dlightChange = true;
                
            },
        )
    }
    init(rtxgiNetwork,directionalLightGroup,pointLightGroup,spotLightGroup,models) {
        var plightIndex = 0;
        var slightIndex = 0;
        const self=this
        //声明一个保存需求修改的相关数据的对象
        const gui = {
          /*DirectionalLight*/
          平行光颜色: '#ffffff',
          平行光强度: 4, //灯光强度
          平行光方向X: -0.792,
          平行光方向Y: 0.0,
          平行光方向Z: 0.309,
          平行光阴影: true,
          平行光启用: true,
          dirlightRadius:3.5,
          dirlightSamples:25,
          '控制方式':{"水平移动":"horizontal","竖直移动":"vertical","旋转":"rotation"},
          
          /*Point Light*/
          pLightSite:{
          },
          点光源颜色: '#ffffff',
          点光源强度: 4,
          点光源位置X: 0,
          点光源位置Y: 3,
          点光源位置Z: 0,
          点光源距离: 10,
          点光源阴影: true,
          点光启用: true,
          
          /*Spot Light*/
          sLightSite: {},
          聚光源颜色: '#ffffff',
          聚光源强度: 4,
          聚光源位置X: 0,
          聚光源位置Y: 3,
          聚光源位置Z: 0,
          聚光源方向X: 0,
          聚光源方向Y: 3,
          聚光源方向Z: 0,
          聚光源距离: 10,
          聚光源角度: 1.5,
          聚光源半衰角: 0.5,
          聚光源阴影: true,
          聚光启用: true,
          
          DDGI启用: true,
        }
      
        var datGui = new dat.GUI();
        /*control*/
        datGui.addFolder('可视化控制')
        .add(gui,'控制方式',{"水平移动":"horizontal","竖直移动":"vertical","旋转":"rotation"})
        .onChange(function(e){//{"水平移动":"horizontal","竖直移动":"vertical","旋转":"rotation"}
          // console.log(e)
          const c=self.controlEditor
          c.type=e
          //type="horizontal"//"rotation"//"vertical" 
        });
        /*directional light*/
        if(rtxgiNetwork.directionalLightCt == 1)
        {
          
          setTimeout(()=>{
            self.flag_directionalLight.l=directionalLightGroup[0]
            self.flag_directionalLight.toFlag()
            console.log(self.flag_directionalLight)
            self.flag_pointLight.l      =pointLightGroup[0]
            self.flag_pointLight.toFlag()
            console.log("启动完成")
          },1000)
          var directionFolder = datGui.addFolder('平行光');
          /*color*/
          directionFolder
          .addColor(gui, '平行光颜色')
          .onChange(function(e)
          {
              directionalLightGroup[0].color = new THREE.Color(e);
              self.dlightChange = true;
          });
          /*power*/
          directionFolder
          .add(gui, '平行光强度', 0.0, 30.0)
          .step(0.1)
          .onChange(function(e) {
              directionalLightGroup[0].intensity = e
              self.dlightChange = true;
          });
          /*direction*/
          directionFolder
          .add(gui, '平行光方向X', -1.0, 1.0)
          .step(0.02)
          .onChange(function(e) {
            directionalLightGroup[0].target.position.x =
            directionalLightGroup[0].position.x + e;
            self.dlightChange = true;self.flag_directionalLight.toFlag();
          });
          directionFolder
          .add(gui, '平行光方向Y', -1.0, -0.5)
          .step(0.02)
          .onChange(function(e) {
            directionalLightGroup[0].target.position.y = 
            directionalLightGroup[0].position.y + e;
            self.dlightChange = true;self.flag_directionalLight.toFlag();
          });
          directionFolder
          .add(gui, '平行光方向Z', -1.0, 1.0)
          .step(0.02)
          .onChange(function(e) {
            directionalLightGroup[0].target.position.z = 
            directionalLightGroup[0].position.z + e;
            self.dlightChange = true;self.flag_directionalLight.toFlag();
          });
          /*shadow*/
          directionFolder
          .add(gui, '平行光阴影')
          .onChange(function(e) {
              directionalLightGroup[0].castShadow = e
          });
        //   /*control*/
        //   directionFolder
        //   .add(gui,'可视化控制',{"水平移动":"horizontal","竖直移动":"vertical","旋转":"rotation"})
        //   .onChange(function(e){//{"水平移动":"horizontal","竖直移动":"vertical","旋转":"rotation"}
        //     // console.log(e)
        //     const c=self.controlEditor
        //     c.type=e
        //     //type="horizontal"//"rotation"//"vertical" 
        //   });
          /*visible*/
          directionFolder
          .add(gui, '平行光启用')
          .onChange(function(e) {
              directionalLightGroup[0].visible = e
          });
        }
        
        /*pointLight*/
        if(rtxgiNetwork.pointLightCt > 0){
          let plightHistory = {};
          for(let i = 0; i < rtxgiNetwork.pointLightCt; i++){
              let plightKey = "点光源" + i;
              plightHistory[plightKey] = i;
          }
          let plightFolder = datGui.addFolder('点光源');
          /*setting*/
          plightFolder
          .add(gui,'pLightSite',plightHistory)
          .onChange(function(e){
              plightIndex = parseInt(e);
              {
                  gui["点光源颜色"] = pointLightGroup[plightIndex].color;
                  gui["点光源强度"] = pointLightGroup[plightIndex].power;
                  gui["点光源位置X"] = pointLightGroup[plightIndex].position.x;
                  gui["点光源位置Y"] = pointLightGroup[plightIndex].position.y ;
                  gui["点光源位置Z"] = pointLightGroup[plightIndex].position.z;
                  gui["点光源距离"] = pointLightGroup[plightIndex].distance;
                  datGui.updateDisplay();
              }
          });
          /*color*/
          plightFolder
          .addColor(gui,'点光源颜色')
          .onChange(function(e){
              if(typeof(e) == "string")
              {
                  pointLightGroup[plightIndex].color = new THREE.Color(e);
              }else if(typeof(e) == "object")
              {
                  var color = new THREE.Color
                  (e.r / 255.0,e.g /255.0,e.b / 255.0);
                  pointLightGroup[plightIndex].color = color;
              }
              
              self.plightChange = true;
          });
          /*power*/
          plightFolder
          .add(gui,'点光源强度',0.0, 30.0)
          .step(0.1)
          .onChange(function(e){
              pointLightGroup[plightIndex].power = e;
              self.plightChange = true;
          });
          /*position*/
          plightFolder
          .add(gui,'点光源位置X',-100.0, 100.0)
          .step(0.01)
          .onChange(function(e){
              pointLightGroup[plightIndex].position.x = e;
              self.plightChange = true;
          });
          plightFolder
          .add(gui,'点光源位置Y',-100.0, 100.0)
          .step(0.01)
          .onChange(function(e){
              pointLightGroup[plightIndex].position.y = e;
              self.plightChange = true;
          });
          plightFolder
          .add(gui,'点光源位置Z',-100.0, 100.0)
          .step(0.01)
          .onChange(function(e){
              pointLightGroup[plightIndex].position.z = e;
              self.plightChange = true;
          });
          /*radius or distance*/
          plightFolder
          .add(gui,'点光源距离',0.0, 20.0)
          .step(0.1)
          .onChange(function(e){
              pointLightGroup[plightIndex].distance = e;
              self.plightChange = true;
          });
          plightFolder
          .add(gui, '点光源阴影')
          .onChange(function(e) {
              pointLightGroup[plightIndex].castShadow = e;
          });
          plightFolder
          .add(gui, '点光启用')
          .onChange(function(e) {
              pointLightGroup[plightIndex].visible = e;
          });
        }
        
        let shadowFolder = datGui.addFolder('软阴影');
        shadowFolder
        .add( gui, 'dirlightRadius' ,0,20,0.1).name( 'radius' ).onChange( function ( value ) {
            for(let i=0;i<directionalLightGroup.length;i++)
                directionalLightGroup[i].shadow.radius = value;
            for(let i=0;i<pointLightGroup.length;i++)
                pointLightGroup[i].shadow.radius = value;
        } );
        shadowFolder
        .add( gui, 'dirlightSamples', 5, 30, 1 ).name( 'samples' ).onChange( function ( value ) {
            for(let i=0;i<directionalLightGroup.length;i++)
                directionalLightGroup[i].shadow.blurSamples = value;
            for(let i=0;i<pointLightGroup.length;i++)
                pointLightGroup[i].shadow.blurSamples = value;
        } );

        /*spot light*/
        if(rtxgiNetwork.spotLightCt > 0){
          let slightHistory = {};
          for(let i = 0; i < rtxgiNetwork.spotLightCt; i++){
              let slightKey = "聚光源" + i;
              slightHistory[slightKey] = i;
          }
          let slightFolder = datGui.addFolder('聚光源');
          /*setting*/
          slightFolder
          .add(gui,'sLightSite',slightHistory)
          .onChange(function(e){
              slightIndex = parseInt(e);
              {
                  gui["聚光源颜色"] = spotLightGroup[slightIndex].color;
                  gui["聚光源强度"] = spotLightGroup[slightIndex].power;
                  gui["聚光源位置X"] = spotLightGroup[slightIndex].position.x;
                  gui["聚光源位置Y"] = spotLightGroup[slightIndex].position.y;
                  gui["聚光源位置Z"] = spotLightGroup[slightIndex].position.z;
                  let lightForwardVec = new THREE.Vector3();
                  lightForwardVec.copy(spotLightGroup[slightIndex].target.position);
                  let lightForward = lightForwardVec.sub(spotLightGroup[slightIndex].position).normalize();
                  gui["聚光源方向X"] = lightForward.x;
                  gui["聚光源方向Y"] = lightForward.y;
                  gui["聚光源方向Z"] = lightForward.z;
                  gui["聚光源距离"] = spotLightGroup[slightIndex].distance;
                  gui["聚光源角度"] = spotLightGroup[slightIndex].angle;
                  gui["聚光源半衰角"] = spotLightGroup[slightIndex].penumbra;
                  datGui.updateDisplay();
              }
          });
          /*color*/
          slightFolder
          .addColor(gui,'聚光源颜色')
          .onChange(function(e){
              spotLightGroup[slightIndex].color = e;
              self.slightChange = true;
          });
          /*power*/
          slightFolder
          .add(gui,'聚光源强度',0.0, 30.0)
          .step(0.1)
          .onChange(function(e){
              spotLightGroup[slightIndex].power = e;
              self.slightChange = true;
          });
          /*position*/
          slightFolder
          .add(gui,'聚光源位置X',-100.0, 100.0)
          .step(0.2)
          .onChange(function(e){
              spotLightGroup[slightIndex].position.x = e;
              self.slightChange = true;
          });
          slightFolder
          .add(gui,'聚光源位置Y',-100.0, 100.0)
          .step(0.2)
          .onChange(function(e){
              spotLightGroup[slightIndex].position.y = e;
              self.slightChange = true;
          });
          slightFolder
          .add(gui,'聚光源位置Z',-100.0, 100.0)
          .step(0.2)
          .onChange(function(e){
              spotLightGroup[slightIndex].position.z = e;
              self.slightChange = true;
          });
          /*direction*/
          slightFolder
          .add(gui,'聚光源方向X',-1.0, 1.0)
          .step(0.01)
          .onChange(function(e){
              spotLightGroup[slightIndex].target.position.x =
              spotLightGroup[slightIndex].position.x + e;
              self.slightChange = true;
          });
          slightFolder
          .add(gui,'聚光源方向Y',-1.0, 1.0)
          .step(0.01)
          .onChange(function(e){
              spotLightGroup[slightIndex].target.position.y =
              spotLightGroup[slightIndex].position.y + e;
              self.plightChange = true;
          });
          slightFolder
          .add(gui,'聚光源方向Z',-1.0, 1.0)
          .step(0.01)
          .onChange(function(e){
              spotLightGroup[slightIndex].target.position.z =
              spotLightGroup[slightIndex].position.z + e;
              self.slightChange = true;
          });
          /*radius or distance*/
          slightFolder
          .add(gui,'聚光源距离',0.0, 20.0)
          .step(0.1)
          .onChange(function(e){
              spotLightGroup[slightIndex].distance = e;
              self.slightChange = true;
          });
          /*angle*/
          slightFolder
          .add(gui,'聚光源角度',0.0, Math.PI/2)
          .step(0.02)
          .onChange(function(e){
              spotLightGroup[slightIndex].angle = e;
              slightChange = true;
          });
          /**/
          slightFolder
          .add(gui,'聚光源半衰角',0.0, 1.0)
          .step(0.02)
          .onChange(function(e){
              spotLightGroup[slightIndex].penumbra = e;
              self.slightChange = true;
          });
          slightFolder
          .add(gui, '聚光源阴影')
          .onChange(function(e) {
              spotLightGroup[slightIndex].castShadow = e;
          });
          slightFolder
          .add(gui, '聚光启用')
          .onChange(function(e) {
              spotLightGroup[slightIndex].visible = e;
          });
        }
        
        
        /*diffuse on/off*/
        var indirectFolder = datGui.addFolder('间接光');
        indirectFolder.add(gui, 'DDGI启用').onChange(function(e) {
          for (var i = 0; i < models.length; i++) {
              models[i].indirectMaterial.uniforms.dGI.value = e
          }
        });
       
      }
}