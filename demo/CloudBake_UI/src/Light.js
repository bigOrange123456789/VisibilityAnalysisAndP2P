import * as THREE from 'three'
export class Light{
    constructor(){
      this.directionalLightGroup= []
      this.pointLightGroup=[]
      this.spotLightGroup=[]
      // this.init(rtxgiNetwork,scene)

      
    }
    init(rtxgiNetwork,scene) {
        if(rtxgiNetwork.directionalLightCt == 1)
        {
          var directionalLight = new THREE.DirectionalLight('#ffffff')
          directionalLight.position.set(0, 26.0, 0)
          directionalLight.shadow.camera.near = 0.1 //产生阴影的最近距离
          directionalLight.shadow.camera.far = 1000 //产生阴影的最远距离
          directionalLight.shadow.camera.left = -100 //产生阴影距离位置的最左边位置
          directionalLight.shadow.camera.right = 100 //最右边
          directionalLight.shadow.camera.top = 100 //最上边
          directionalLight.shadow.camera.bottom = -100 //最下面
          //这两个值决定使用多少像素生成阴影 默认512
          directionalLight.shadow.mapSize.height = 8*1024;
          directionalLight.shadow.mapSize.width = 8*1024;
          directionalLight.intensity = 4
          directionalLight.shadow.bias = -0.0005;
          directionalLight.shadow.radius=3.5,
          directionalLight.shadow.blurSamples=25,
          //告诉平行光需要开启阴影投射
          directionalLight.castShadow = true
        
          if(true){
            directionalLight.target.position.x = directionalLight.position.x + rtxgiNetwork.dLightDirection.x;
            directionalLight.target.position.y = directionalLight.position.y + rtxgiNetwork.dLightDirection.y;
            directionalLight.target.position.z = directionalLight.position.z + rtxgiNetwork.dLightDirection.z;
          }
          window.directionalLight=directionalLight
          directionalLight.position.set( -0.484151390183456,  26.43546636346798,  -0.3095244287641208)
          directionalLight.intensity=1.8
          
          scene.add(directionalLight)
          // scene.add(directionalLight.target)
        
        //   const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        //   scene.add(directionalLightHelper);
          this.directionalLightGroup.push(directionalLight);
        }
        
        /*point light*/
          for(let i = 0; i < rtxgiNetwork.pointLightCt; i++){
              let pointLight = new THREE.PointLight('#ffffff');
              let position = rtxgiNetwork.pointLightParams[i].position;
              pointLight.position.set(position.x, position.y, position.z);
              pointLight.power = 4.0;
              pointLight.distance = 10.0;
              pointLight.castShadow = true;
              pointLight.shadow.radius=3.5,
              pointLight.shadow.blurSamples=25,

              window.pointLight=pointLight
              pointLight.position.set(
                -0.2697829635108193+i*2,  3.6968538642054622,  0.27596807740972007
              )
              pointLight.intensity=2.3873241463784303

              scene.add(pointLight);
              // var ptHelpder = new THREE.PointLightHelper(pointLight,2.5,0xffffff);
              // scene.add(ptHelpder);
              this.pointLightGroup.push(pointLight);
          }
          window.pointLightGroup=this.pointLightGroup
        
        /*spot light*/
          for(let i = 0; i < rtxgiNetwork.spotLightCt; i++){
              let spotLight = new THREE.SpotLight('#ffffff');
              let position = rtxgiNetwork.spotLightParams[i].position;
              let angle = rtxgiNetwork.spotLightParams[i].angle;
              let penumbra = rtxgiNetwork.spotLightParams[i].penumbra;
              let direction = rtxgiNetwork.spotLightParams[i].direction;
              spotLight.position.set(position.x, position.y, position.z);
              spotLight.castShadow = true;
              let targetObj = new THREE.Object3D();
              targetObj.position.set(position.x + direction.x, position.y + direction.y,
              position.z + direction.z);
              // scene.add(targetObj);???
              spotLight.target = targetObj;
              spotLight.angle = angle;
              spotLight.penumbra = penumbra;
              spotLight.power = 4.0;
              spotLight.distance = 8.0;
              scene.add(spotLight);
              this.spotLightGroup.push(spotLight);
          }
      }
}