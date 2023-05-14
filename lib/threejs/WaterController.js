import * as THREE from "three";
import {Water} from "three/examples/jsm/objects/Water";
export class WaterController{
    constructor(mesh){
        this.water=this.initWater(mesh)
        const self=this
        // const animate=()=>{
        //     // const sun=window.sun?window.sun:new THREE.Vector3(-200,800,-600)
        //     const sun=new THREE.Vector3(-200,800,-600)
        //     requestAnimationFrame(animate)
        //     self.water.material.uniforms['sunDirection'].value.copy(sun).normalize()
        //     self.water.material.uniforms['time'].value += 1.0/120.0
        // };animate()
    }
    initWater(mesh){
        return new Water(mesh.geometry,{
            textureWidth: 512,
            textureHeight: 512,
            // waterNormals: new THREE.TextureLoader().load('assets/waternormals.jpg',function(texture){
            //     texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            // }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: false
        })
    }
    
}