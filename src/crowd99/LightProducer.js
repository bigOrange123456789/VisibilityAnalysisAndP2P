import * as THREE from "three";
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
class LightProducer{
    constructor(scene,camera){
        this.camera=camera
        this.object=new THREE.Object3D()
        scene.add(this.object)
        this.objectMove=new THREE.Object3D()
        this.object.add(this.objectMove)
        this.targetList=[]
        this.init(scene)//this.test()
        this.add_lensflares()

        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)
        setTimeout(()=>{
            scene.add(this.getSpotGroup())
        },3000)
    }
    animate(){
        this.setPos(this.camera.position)
        requestAnimationFrame(this.animate)
    }
    add_lensflares(){
        const textureFlare3 = new THREE.TextureLoader().load( 'assets/textures/lensflare/lensflare0_alpha.png' );
        const lensflare = new Lensflare();
        const s0=1
        lensflare.addElement( new LensflareElement( textureFlare3, 500*s0, 0, new THREE.Color(1,0,0) ) );
		lensflare.addElement( new LensflareElement( textureFlare3, 60*s0, 0.6 ) );
		lensflare.addElement( new LensflareElement( textureFlare3, 70*s0, 0.7 ) );
		lensflare.addElement( new LensflareElement( textureFlare3, 120*s0, 0.9 ) );
        lensflare.position.set(61, 17, -169)
        window.lensflare=lensflare
        this.objectMove.add(lensflare)

        const lensflare2 = new Lensflare();
        lensflare2.addElement( new LensflareElement( textureFlare3, 1500*s0, 0, new THREE.Color(0,0,0.1) ) );
        lensflare2.position.set( -255,  32,  176)
        this.object.add(lensflare2)
        window.lensflare2=lensflare2
    }
    setPos(position){
        // this.light.position.set(position.x,position.y,position.z)
        // this.scene.position.set(position.x,position.y,position.z)
        this.objectMove.position.set(position.x,position.y,position.z)
    }
    init(scene){
        this.scene=scene
        const ambient = new THREE.AmbientLight( 0xffffff ,0.05);//new THREE.AmbientLight( 0xffffff ,.8);
        this.ambient=ambient
        // scene.add( ambient );
        

    }
    getSpotGroup(){
        const light=new THREE.Object3D()
        for(let i=0;i<3;i++){
            light.add(this.getSpotLight())
        }
        return light
    }
    getSpotLight(){
        const spotLight = new THREE.SpotLight( 
            Math.floor(0xffffff*Math.random()),//0xffffff,
            10,//10 ,// intensity
            10000,
            Math.PI*(Math.random()*5+4.5)/60,
            0,
            0,
            );
        if(Math.random()>0.3){
            spotLight.color.r=1-spotLight.color.g
        }else if(Math.random()>0.5){
            spotLight.color.r=1-spotLight.color.b
        }else{
            spotLight.color.g=1-spotLight.color.b
        }
        spotLight.position.set(0,50,0)
        // console.log("spotLight",spotLight)
        // spotLight.castShadow = true
        this.scene.add(spotLight.target)
        const speed=0.006*(1.5*Math.random()+0.2)

        const tool=new THREE.Object3D();
        tool.rotation.y=Math.random()*100
        const x=80*(Math.random()+0.01);
        const y=-0.1;
        const z=80*(Math.random()+0.01);
        setInterval(()=>{
            tool.rotation.y+=speed
            tool.updateMatrix();
            const e=tool.matrix.elements
            const x2=x*e[0]+y*e[4]+z*e[8]
            const y2=x*e[1]+y*e[5]+z*e[9]
            const z2=x*e[2]+y*e[6]+z*e[10]
            // console.log()
            spotLight.target.position.set(x2,y2,z2)

        },0)

// color - (optional) hexadecimal color of the light. Default is 0xffffff (white).
// intensity - (optional) numeric value of the light's strength/intensity. Default is 1.
// distance - Maximum range of the light. Default is 0 (no limit).
// angle - Maximum angle of light dispersion from its direction whose upper bound is Math.PI/2.
// penumbra - Percent of the spotlight cone that is attenuated due to penumbra. Takes values between zero and 1. Default is zero.
// decay - The amount the light dims along the distance of the light.
        return spotLight
    }
}
export { LightProducer }