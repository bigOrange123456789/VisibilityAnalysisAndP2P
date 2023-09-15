import content from '../config/all.json';
import * as THREE from "three";
import { TreeBuilder } from "./TreeBuilder";
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
class CustomizeTree {
  constructor(scene) {
    this.content = this.getContent()
    this.param=this.getParam(content[0])
    window.param=this.param
    this.object=new THREE.Object3D()
    this.builder = new TreeBuilder()
    scene.add(this.object)
    this.updateTree()
  }
  getContent(){
    for(let i of content){
      if(!i.seed)i.seed="随机种子"
      if(!i.showLeaves)i.showLeaves=false//true
    }
    return content
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
    this.object.add(singleTree)
    this.updateLeaves()
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
  saveGLTF(){
    const scene=new THREE.Scene()
    scene.add(this.object)
    new GLTFExporter().parse(scene,function(result){
        var myBlob=new Blob([JSON.stringify(result)], { type: 'text/plain' })
        let link = document.createElement('a')
        link.href = URL.createObjectURL(myBlob)
        link.download = "tree.gltf"
        link.click()
    })
  }
}

export { CustomizeTree };
