import {
  Color,
  Object3D, 
  TextureLoader, 
} from "three";//'../lib/three/build/three';
import { 
  Lensflare, 
  LensflareElement 
} from '../lib/threeEx/Lensflare.js';//'three/examples/jsm/objects/Lensflare.js';//
export class Lensflares extends Object3D{
  constructor (){
    super()
    const self=this
    setTimeout(()=>{
      self.init()
    },4000)
  }
  init(){
    const textureFlare3 = new TextureLoader().load( 'assets/textures/lensflare/lensflare0_alpha.png' );
    // const textureFlare3 = new TextureLoader().load( 'assets/textures/environment/evn.jpg' );
    const lensflare = new Lensflare();
    const s0=1
    lensflare.addElement( new LensflareElement( textureFlare3, 500*s0, 0, new Color(1,0,0) ) );
    lensflare.addElement( new LensflareElement( textureFlare3, 60*s0, 0.6 ) );
    lensflare.addElement( new LensflareElement( textureFlare3, 70*s0, 0.7 ) );
    lensflare.addElement( new LensflareElement( textureFlare3, 120*s0, 0.9 ) );
    lensflare.position.set(-2472.5/2,  1080,  -1940)//lensflare.position.set(-2472.5,  1080,  1940)
    this.add(lensflare)
    window.l=lensflare.position

    const lensflare2 = new Lensflare();
    // lensflare2.addElement( new LensflareElement( textureFlare3, 0.8*1500*s0, 0, new Color(1,1,1) ) );//蓝色
    lensflare2.addElement( new LensflareElement( textureFlare3, 0.8*1500*s0, 0, new Color(0,0,0.2) ) );//蓝色
    lensflare2.position.set( -467.4527321916122,38.703807963490846,-202.37470500638548)
    this.add(lensflare2)

    //-212.5200033129467, y: -132.82417453575843, z: 275.6308365324915
    const lensflare3 = new Lensflare();
    lensflare3.addElement( new LensflareElement( textureFlare3, 0.7*1.2*1500*s0, 0, new Color(0.08,0,0) ) );//红色
    lensflare3.position.set( -584.2106193340763,  -133.29999999999995,  148.51157791272203)
    this.add(lensflare3)
    window.l3=lensflare3

    const lensflare4 = new Lensflare();
    lensflare4.addElement( new LensflareElement( textureFlare3, 2.2*1500*s0, 0, new Color(0,0.08,0) ) );//蓝色
    lensflare4.position.set( -327.5,  1.7,  609)//(  184.6163565938977,  -138.3351997874887,  1006.8290480882454)
    this.add(lensflare4) 
    
  }
}
