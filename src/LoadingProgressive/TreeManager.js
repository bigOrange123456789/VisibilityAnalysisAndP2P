import content from '../../config/TreeGeneration/all.json';

import * as THREE from "three";
import { TreeBuilder } from "./TreeBuilder";

export class TreeManager {
  constructor(scene) {
    this.object=new THREE.Object3D()
    scene.add(this.object)
    this.TreeBuilder=TreeBuilder
  }
  init(posConfig){
    this.posConfig=posConfig
    this.pos=this.initPos()
    this.content = this.getContent()
    this.param=this.getParam(content[0])
    window.param=this.param
    
    this.builder = new TreeBuilder()
    this.updateTree()
  }
  getContent(){
    for(let i of content){
      if(!i.seed)i.seed="随机种子"
    }
    return content
  }
  initPos(){
    this.poslist=[]
    const list=[
        171
    ]
    for(let cid of list){
        const arr=this.posConfig[cid+""]
        for(let i=0;i<arr.length/2;i++){
            const x=arr[2*i  ]//+(2*Math.random()-1)*25
            const y=5.5
            const z=arr[2*i+1]//+(2*Math.random()-1)*25
            this.poslist.push([x,y,z])
        }
    }
    return this.poslist
  }
  getParam(obj){
    const self=this
    const handler = {// 拦截器函数
      set(target, property, value) {
        const flag=obj[property]!==value
        const result=Reflect.set(target, property, value)
        if(flag)self.updateTree()
        return result
      },
    }
    return new Proxy(obj, handler);
  }
  setSeed(seed){
    function encodeUtf8(text) {
      const code = encodeURIComponent(text);
      let bytes = 0
      for (var i = 0; i < code.length; i++) {
          const c = code.charAt(i);
          if (c === '%') {
              const hex = code.charAt(i + 1) + code.charAt(i + 2);
              const hexVal = parseInt(hex, 16);
              bytes+=hexVal
              i += 2;
          } else bytes+=(c.charCodeAt(0));
      }
      return bytes;
    }
    Math.seed0 = encodeUtf8(seed)
    Math.random = ()=>{
        Math.seed0 = (Math.seed0 * 9301 + 49297) % 233280;
        return Math.seed0 / 233280  
    };
  }
  updateLeaves(){
    if(this.object.children.length>0){
      const tree=this.object.children[0]
      if(tree.children.length>0){
        tree.children[0].visible=this.param.showLeaves
      }
    }
  }
  updateTree(){
    this.setSeed(this.param.seed)
    const builder=this.builder
    for(let i of this.object.children)this.object.remove(i)
    builder.clearMesh()
    builder.init(this.param, true);
    const skeleton = builder.buildSkeleton();
    const singleTree = builder.buildTree(skeleton);
    singleTree.children.forEach((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    });
    this.instance(singleTree)
    this.object.add(singleTree)
    this.updateLeaves()
  }
  instance1(singleTree){
    const meshList=[
      singleTree.children[0],
      singleTree.children[1]
    ]
    const instance_info=[]
    for(let x=0;x<20;x++)
    for(let z=0;z<20;z++){
      const i=(x-10)*50+(2*Math.random()-1)*25
      const j=5.5
      const k=(z-10)*50+(2*Math.random()-1)*25
      const a=0.5*Math.random()+0.5
      const b=0.5*Math.random()+0.5
      const c=0.5*Math.random()+0.5
      
        var mat4 = new THREE.Matrix4().fromArray( [
          a,0,0,0,
          0,b,0,0,
          0,0,c,0,
          i,j,k,1
        ] )
        instance_info.push(mat4)
    }
    for(let mesh0 of meshList){
      const mesh=new THREE.InstancedMesh(
        mesh0.geometry,
        mesh0.material,
        instance_info.length
      )
      for(let i=0;i<instance_info.length;i++){
          mesh.setMatrixAt(
              i,
              instance_info[i]
          )
      }
      mesh0.visible=false//position.y+=8
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      singleTree.add(mesh)
    }
    console.log(singleTree,"singleTree")
  }
  instance(singleTree){
    const meshList=[
      singleTree.children[0],
      singleTree.children[1]
    ]
    const instance_info=[]
    for(let p of this.pos){
      const i=p[0]
      const j=p[1]
      const k=p[2]
      const a=0.5*Math.random()+0.5
      const b=0.5*Math.random()+0.5
      const c=0.5*Math.random()+0.5
      
        var mat4 = new THREE.Matrix4().fromArray( [
          a,0,0,0,
          0,b,0,0,
          0,0,c,0,
          i,j,k,1
        ] )
        instance_info.push(mat4)
    }
    for(let mesh0 of meshList){
      const mesh=new THREE.InstancedMesh(
        mesh0.geometry,
        mesh0.material,
        instance_info.length
      )
      for(let i=0;i<instance_info.length;i++){
          mesh.setMatrixAt(
              i,
              instance_info[i]
          )
      }
      mesh0.visible=false//position.y+=8
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      singleTree.add(mesh)
    }
    console.log(singleTree,"singleTree")
  }
  saveJson(data,name){
    if(!data)data=this.param
    if(!name)name="tree.json"
    const jsonData = JSON.stringify(data)
    const myBlob = new Blob([jsonData], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(myBlob)
    link.download = name
    link.click()
  } 
  test(){
    const saveJson=this.saveJson
    const self=this
    window.saveJson=()=>{
      saveJson(self.content,"all.json")
      const s=i=>{saveJson(self.content[i],i+".json")}
      let i0=0
      setInterval(()=>{
        if(i0<11)s(i0)
        i0++
      },1000)
    }
  }
  buildtree(species) {
    const treeObj = this.getTreeBySpecies(species);
    this.param=treeObj 
    this.updateTree()
    console.log(this.object.children[0].children);
  }
  getTreeBySpecies(name) {
    for(let i=0;i<this.content.length;i++)
      if(this.content[i].name==name)return this.content[i]
  }
}
