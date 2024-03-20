import {
    BoxBufferGeometry,
    CylinderBufferGeometry,
    CylinderGeometry,
    InstancedMesh,
    MeshBasicMaterial,
    MeshStandardMaterial
} from "three";
import * as THREE from "three";

export function CylinderModeling(paramList){
    const geometry = new CylinderGeometry(1,1,2,4);
    const instanced_mesh = new InstancedMesh(geometry, new MeshStandardMaterial({color:0xff0000}), paramList.length);
    for(let i=0; i<paramList.length; i++){
        let m = paramList[i];
        let mat4 = new THREE.Matrix4().set(
            m[0], m[3], m[6], m[9],
            m[1], m[4], m[7], m[10],
            m[2], m[5], m[8], m[11],
            0, 0, 0, 1);
        instanced_mesh.setMatrixAt(i, mat4);
    }
    return instanced_mesh;
}

export function CubeModeling(paramList){
    const geometry = new BoxBufferGeometry(1,1,1);
    const instanced_mesh = new InstancedMesh(geometry, new MeshStandardMaterial({color:0xff0000}), paramList.length);
    for(let i=0; i<paramList.length; i++){
        let m = paramList[i];
        let mat4 = new THREE.Matrix4().set(
            m[0], m[3], m[6], m[9],
            m[1], m[4], m[7], m[10],
            m[2], m[5], m[8], m[11],
            0, 0, 0, 1);
        instanced_mesh.setMatrixAt(i, mat4);
    }
    return instanced_mesh;
}

export class paramEvaluator{
    constructor(){
        this.cylinderMap = {}
        this.boundingBoxMap = {}

        new THREE.FileLoader().load("./assets/cube.json", (json)=>{
            this.cylinderMap = JSON.parse(json)
            // console.log(this.cylinderMap)
            this.loadBoundingBox(0)
        })
    }
    loadBoundingBox(id){
        if(id>919){
            this.evaluateAccuracy()
            return
        }else{
            // console.log(id, "/", 919)
        }
        new THREE.FileLoader().load("./assets/boundingBox/boundingBox"+id.toString()+".json", (json)=>{
            let boundingBoxes = JSON.parse(json)
            // console.log(boundingBoxes)
            this.boundingBoxMap = Object.assign(this.boundingBoxMap, boundingBoxes)
            this.loadBoundingBox(id+1)
        })
    }
    evaluateAccuracy(){
        const geometry = new BoxBufferGeometry(1,1,1);
        geometry.computeBoundingBox()
        const baseBox = geometry.boundingBox
        let list = {}
        let cylinderList = Object.keys(this.cylinderMap)
        console.log(cylinderList.length)
        for(let i=0; i<cylinderList.length; i++){
            let k = cylinderList[i]
            let m = this.cylinderMap[k]
            let mat = new THREE.Matrix4().set(
                m[0], m[3], m[6], m[9],
                m[1], m[4], m[7], m[10],
                m[2], m[5], m[8], m[11],
                0, 0, 0, 1)
            let paramBox = baseBox.clone().applyMatrix4(mat)
            let componBox = this.boundingBoxMap[k]
            if(paramBox.max.clone().sub(componBox.max).length()<10 && paramBox.min.clone().sub(componBox.min).length()<10){
                list[k] = this.cylinderMap[k]
            }
        }
        console.log(JSON.stringify(list))
    }
}
