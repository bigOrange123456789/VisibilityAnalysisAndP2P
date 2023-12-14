import CylinderParam0 from '../config/CylinderParam0.json'
import CylinderParam1 from '../config/CylinderParam1.json'
import CylinderParam2 from '../config/CylinderParam2.json'
import CylinderParam3 from '../config/CylinderParam3.json'
import CylinderParam4 from '../config/CylinderParam4.json'
import CylinderParam5 from '../config/CylinderParam5.json'
let CylinderParam={}
for(let i in CylinderParam0)CylinderParam[i]=CylinderParam0[i]
for(let i in CylinderParam1)CylinderParam[i]=CylinderParam1[i]
for(let i in CylinderParam2)CylinderParam[i]=CylinderParam2[i]
for(let i in CylinderParam3)CylinderParam[i]=CylinderParam3[i]
for(let i in CylinderParam4)CylinderParam[i]=CylinderParam4[i]
for(let i in CylinderParam5)CylinderParam[i]=CylinderParam5[i]
window.CylinderParam=CylinderParam
const cylinderIdList=Object.keys(CylinderParam)
const cylinderParam=[]
for(let i=0;i<cylinderIdList.length;i++){
    const id=cylinderIdList[i]
    const list=CylinderParam[id]
    for(let j=0;j<list.length;j++){
        cylinderParam.push(list[j])
    }
}
window.cylinderParam=cylinderParam 
import {CoderDecoder}from"./parametric/CoderDecoder"

import {
    AmbientLight,
    Box3,
    Box3Helper, DirectionalLight,
    FileLoader,
    Frustum,
    Group, InstancedMesh,
    InstancedMeshEx,
    LoadingManager,
    Matrix4, Scene,
    Vector3, WebGLRenderTarget,
    MeshBasicMaterial,
    Raycaster,Vector2
} from "./threeEx/three";
import { ZipLoader } from "./ziploader";
// import { GLTFLoaderEx } from "./three/examples/jsm/loaders/GLTFLoaderEx";
import { GLTFLoaderEx } from "./threeEx/GLTFLoaderEx";
import $ from "jquery";

export class SceneManager {
    constructor() {
        this.projectName = window.projectName;
        this.scene = window.scene;
        this.camera = window.camera;
        this.instanceGroup = new Group();
        this.scene.add(this.instanceGroup);
        this.matrixWorld = null;

        this.visibleModelList = [];

        this.FVS = [];
        this.SVS = [];
        this.PVS = [];

        this.loadingModelList = [];
        this.toLoadModelList = [];
        this.loadedModelList = [];

        this.loaded_mesh = {};
        this.loaded_mesh_interest = {};
        this.loaded_mesh_invisible_time = {};

        this.loaded_mesh_limit = 2500; //缓存构件数限制
        this.loadlimit = 200;
        this.loading = false;
        this.httping = true;
        this.pre_camera_position = new Vector3();

        this.mesText1 = document.createElement("p");
        document.body.appendChild(this.mesText1);
        this.mesText1.style.position = "fixed";
        this.mesText1.style.left = 20 + "px";
        this.mesText1.style.top = 0 + "px";
        this.mesText1.style.fontSize = window.innerHeight / 60 + "px";

        this.server_ip = "ws://47.116.5.3:4001";
        console.log("?");
        
        window.instanceGroup=this.instanceGroup
        const matrix = new Matrix4(); 
        matrix.set(
            0.002251, 0, 0, 0, 0, 0.002251, 0, 0, 0, 0, 0.002251, 0, -194.090393, -121.492645, -262.077057, 1
        )
        matrix.transpose ()
        this.instanceGroup.applyMatrix4(matrix)
        
        //this.instanceGroup.add(new CoderDecoder.decoder(cylinderParam))
        // this.loadModelZip(3074)//需要PCA对齐的构件
        // this.loadModelZip(cylinderIdList[100])
        if(false){
            for(let i=0;i<1;i++){
                this.loadModelZip(cylinderIdList[i+725])
            }
        }
        if(true){
            for(let i=0;i<1000;i++){
                this.loadModelZip(cylinderIdList[i+0])
            }
            const self=this
            setTimeout(()=>{
                for(let i=0;i<1000;i++){
                    self.loadModelZip(cylinderIdList[1000+i])
                }
            },5000)
            setTimeout(()=>{
                for(let i=0;i<1000;i++){
                    self.loadModelZip(cylinderIdList[2000+i])
                }
            },2*5000)
            setTimeout(()=>{
                for(let i=0;i<1000;i++){
                    self.loadModelZip(cylinderIdList[3000+i])
                }
            },3*5000)
            setTimeout(()=>{
                for(let i=0;i<1000;i++){
                    self.loadModelZip(cylinderIdList[4000+i])
                }
            },4*5000)
            setTimeout(()=>{
                for(let i=0;i<1000;i++){
                    self.loadModelZip(cylinderIdList[5000+i])
                }
            },5*5000)
            setTimeout(()=>{
                for(let i=0;i<1000;i++){
                    self.loadModelZip(cylinderIdList[6000+i])
                }
            },6*5000)
            setTimeout(()=>{
                for(let i=0;i<1000;i++){
                    self.loadModelZip(cylinderIdList[7000+i])
                }
            },7*5000)
            setTimeout(()=>{
                for(let i=0;i<385;i++){
                    self.loadModelZip(cylinderIdList[8000+i])
                }
            },8*5000)
        }
        

        if(false){
            // this.loadModelZip(740)
            // for(let i=0;i<3;i++){
            //     this.loadModelZip(i+740)
            // }
            const iii=5
            for(let i=0;i<1000;i++){
                if(i+0+2000*iii<11492)
                this.loadModelZip(i+0+2000*iii)
            }
            const self=this
            setTimeout(()=>{
                for(let i=0;i<1000;i++){
                    if(1000+i+2000*iii<11492)
                    self.loadModelZip(1000+i+2000*iii)
                }
            },5000)
            window.iii=iii
            // setTimeout(()=>{
            //     self.test(self.instanceGroup.children)
            // },5000)
            
        }
        if(false)
            this.startConnect();
    }
    test(arr){//   self.test(self.instanceGroup.children)
        console.log("test-count2:",window.count2,arr)
        const camera=this.camera
        const raycaster = new Raycaster();
        const mouse = new Vector2();
        window.addEventListener( 'mousemove', event=>{//鼠标移动事件
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1 ;
        }, false );
        window.addEventListener('click',()=>{
                raycaster.setFromCamera( mouse, camera )
                const objects=raycaster.intersectObjects( arr )
                if(objects.length>0){
                    const object=objects[0]
                    console.log(object)
                }
                console.log(objects)
        },false)
    }
    startConnect(){
        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)

        var self = this;
        this.ws = new WebSocket(this.server_ip)
        this.ws.onopen = (evt) => {
            console.log("websocket connect succeed")
            self.ws.send(JSON.stringify({typ:-1}))
        }
        this.ws.onclose = (evt) => {
            // window.alert("暂时无法访问服务器")
        }
        this.ws.onmessage = (evt) => {
            let res = JSON.parse(evt.data)
            if(res["mat"]){
                let m = JSON.parse(res["mat"]);
                console.log(m)
                self.matrixWorld = new Matrix4().set(
                    m[0],
                    m[4],
                    m[8],
                    m[12],
                    m[1],
                    m[5],
                    m[9],
                    m[13],
                    m[2],
                    m[6],
                    m[10],
                    m[14],
                    m[3],
                    m[7],
                    m[11],
                    m[15]
                );
                self.instanceGroup.applyMatrix4(self.matrixWorld);
                self.httping = false;
            }else{
                // console.log(res)
                if(res["res"].length){
                    if(Array.isArray(res["res"][0])){
                        console.log("occlusion culling")
                        if(positionMatch(res["pos"],self.camera.position)){
                            self.httping = false
                            self.processSVS(res["res"])
                        }else{
                            let frustumPVS_data = {
                                mat:new Matrix4().multiplyMatrices(self.camera.projectionMatrix,self.camera.matrixWorldInverse).elements,
                                pos:self.camera.position,
                                wid:document.documentElement.clientWidth,
                                hei:document.documentElement.clientHeight,
                                typ:0
                            }
                            self.ws.send(JSON.stringify(frustumPVS_data))
                            self.pre_camera_position = self.camera.position.clone()
                        }
                    }else{
                        // console.log("frustum culling")
                        let frustumPVS_data = {
                            mat:new Matrix4().multiplyMatrices(self.camera.projectionMatrix,self.camera.matrixWorldInverse).elements,
                            pos:self.camera.position,
                            wid:document.documentElement.clientWidth,
                            hei:document.documentElement.clientHeight,
                            PVS:res["res"],
                            typ:1
                        }
                        if(positionMatch(res["pos"],self.camera.position)){ // 如果相机没有改变，进行遮挡剔除
                            self.ws.send(JSON.stringify(frustumPVS_data))
                            // self.httping = false
                        }else{                                              // 如果相机改变了，再来一次视锥剔除
                            delete frustumPVS_data["PVS"]
                            frustumPVS_data["typ"] = 0
                            self.ws.send(JSON.stringify(frustumPVS_data))
                            self.pre_camera_position = self.camera.position.clone()
                        }
                        self.processFVS(res["res"])
                    }
                }
            }
        };
    }
    animate() {
        if (!this.camera.position.equals(this.pre_camera_position) && !this.httping) {
            this.httping = true
            this.sceneCulling();
        }
        this.setVisibility(this.visibleModelList);
        this.processLoadList(this.toLoadModelList)
        this.manageCaches()

        requestAnimationFrame(this.animate);
    }
    sceneCulling() {
        let frustumMat = new Matrix4().multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse)
        let frustum_data = JSON.stringify({
            mat:frustumMat.elements,
            pos:this.camera.position,
            wid:document.documentElement.clientWidth,
            hei:document.documentElement.clientHeight,
            typ:0
        })
        // console.log(document.documentElement.clientWidth,document.documentElement.clientHeight)
        this.pre_camera_position = this.camera.position.clone()
        this.ws.send(frustum_data)
    }
    setVisibility(list) {
        var vis_num = 0;
        for (let i = 0; i < this.loadedModelList.length; i++) {
            let index = this.loadedModelList[i];
            if (list.includes(index)) {
                // 可见
                if (this.loaded_mesh[index]) {
                    this.loaded_mesh[index].visible = true;
                    this.loaded_mesh_invisible_time[index] = 0;
                    vis_num++;
                }
            } else {
                // 不可见
                if (this.loaded_mesh[index]) {
                    this.loaded_mesh[index].visible = false;
                    this.loaded_mesh_invisible_time[index] += 1;
                }
            }
        }
        // console.log(this.loadedModelList.length)
        this.mesText1.innerText = "构件数：" + vis_num + "/" + list.length;
    }
    processFVS(FVS){
        this.FVS = FVS
        this.visibleModelList = FVS
        let load_list = []
        for(let i=0; i<FVS.length; i++){
            if(!this.loadedModelList.includes(FVS[i])){
                load_list.push(FVS[i])
            }
        }
        for(let i=0; i<this.loadingModelList.length; i++) {
            if (!FVS.includes(this.loadingModelList[i])) {
                this.loadingModelList.splice(i, 1)
                i--
            }
        }
        // console.log("PVS new load:",load_list.length)
        this.toLoadModelList = load_list
        if(load_list.length)
            this.processLoadList(load_list)
    }
    processSVS(res){
        let SVS = res[0]
        let PVS = res[1]
        this.SVS = SVS
        this.PVS = PVS
        let FVS = [...SVS, ...PVS]
        this.FVS = FVS.slice(0,Math.floor(FVS.length/5))
        this.visibleModelList = SVS
        let load_list = []
        let pon_load_list = []
        for(let i=0; i<SVS.length; i++){
            if(!this.loadedModelList.includes(SVS[i])){
                load_list.push(SVS[i])
            }
        }
        for(let i=0; i<PVS.length; i++){
            if(!this.loadedModelList.includes(PVS[i])){
                pon_load_list.push(PVS[i])
            }
        }
        for(let i=0; i<this.loadingModelList.length; i++) {
            if (!FVS.includes(this.loadingModelList[i])) {
                this.loadingModelList.splice(i, 1)
                i--
            }
        }
        // console.log("EVS new load:",load_list.length)
        // console.log("IVS new load:",pon_load_list.length)
        this.toLoadModelList = [...load_list, ...pon_load_list]
        if(load_list.length)
            this.processLoadList(load_list)
    }
    processLoadList(load_list) {
        if(this.loadingModelList.length>this.loadlimit) return
        // console.log("loading:",this.loadingModelList.length)
        var to_load_list = []
        for(let i=0; i<load_list.length; i++){
            let ind = load_list[i]
            if(i<this.loadlimit && !this.loadingModelList.includes(ind)){
                to_load_list.push(ind)
            }
        }
        for(let i=0; i<to_load_list.length; i++){
            this.loadModelZip(to_load_list[i])
        }
    }
    loadModelZip(index) {
        this.toLoadModelList.splice(this.toLoadModelList.indexOf(index),1)
        this.loadingModelList.push(index)
        var self = this;
        var url = "assets/models/" + self.projectName + "/" + index + ".zip";
        var loader = new LoadingManager();
        new Promise(function (resolve, reject) {
            new ZipLoader()
                .load(
                    url,
                    () => {},
                    () => {
                        console.log("模型加载失败：" + url);
                        setTimeout(() => {
                            // self.loadModelZip(index);
                        }, 1000 * (0.5 * Math.random() + 1));
                    }
                )
                .then((zip) => {
                    let pos = self.loadingModelList.indexOf(index)
                    if(pos===-1) return;
                    self.loadingModelList.splice(pos,1)
                    if(!self.loadedModelList.includes(index))
                        self.loadedModelList.push(index)

                    loader.setURLModifier(zip.urlResolver);
                    resolve();
                });
        }).then(function () {
            new FileLoader(loader).load(
                "blob:assets/models/" + self.projectName + "/matrix" + index + ".json",
                (json) => {
                    var matrix = JSON.parse(json);
                    new GLTFLoaderEx(loader).load(
                        "blob:assets/models/" +
                        self.projectName +
                        "/model" +
                        index +
                        ".gltf",
                        (gltf) => {
                            var mesh = gltf.scene.children[0].children[0];
                            self.addInsModel(matrix, mesh);
                            // mesh.myIndex=index
                        }
                    );
                }
            );
        });
    }
    addInsModel(matrix, mesh) {
        let index = mesh.name;
        matrix.push([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]);
        let matrix4List = [];
        for (let j = 0; j < matrix.length; j++) {
            let mat = matrix[j];
            matrix4List.push(
                new Matrix4().set(
                    mat[0],
                    mat[1],
                    mat[2],
                    mat[3],
                    mat[4],
                    mat[5],
                    mat[6],
                    mat[7],
                    mat[8],
                    mat[9],
                    mat[10],
                    mat[11],
                    0,
                    0,
                    0,
                    1
                )
            );
        }

        // console.log(mesh.material.side)
        mesh.material.side = 2;
        let instance_mesh = processMesh(mesh, matrix4List);
        this.instanceGroup.add(instance_mesh);
        if(instance_mesh.mesh){
            this.instanceGroup.add(instance_mesh.mesh);
            console.log(instance_mesh.mesh)
        }
        
        this.loaded_mesh[index] = instance_mesh;

        mesh.geometry.computeBoundingBox()
        let box = mesh.geometry.boundingBox.clone().applyMatrix4(this.instanceGroup.matrixWorld)
        let xl = box.max.x-box.min.x;
        let yl = box.max.y-box.min.y;
        let zl = box.max.z-box.min.z;
        this.loaded_mesh_interest[index] = xl*yl+xl*zl+yl*zl * matrix.length
        this.loaded_mesh_invisible_time[index] = 0
    }
    manageCaches(){// 新增函数
        let model_list = [];
        let clear_degree_list = [];
        for(let i=0; i<this.loadedModelList.length; i++){
            let index = this.loadedModelList[i];
            if(this.loaded_mesh[index] && this.loaded_mesh_invisible_time[index] && !this.PVS.includes(index)){
                model_list.push(index);
                clear_degree_list.push(this.loaded_mesh_interest[index]/this.loaded_mesh_invisible_time[index]);
            }
        }
        quickSort(clear_degree_list,model_list,0,model_list.length-1);
        let del_count = 0;
        for(let i=this.loaded_mesh_limit; i<model_list.length; i++){
            if(i<0) continue;
            let index = model_list[i];
            this.loaded_mesh[index].visible = false;
            this.instanceGroup.remove(this.loaded_mesh[index]);
            disposeInsMesh(this.loaded_mesh[index]);
            delete this.loaded_mesh[index];
            delete this.loaded_mesh_interest[index];
            delete this.loaded_mesh_invisible_time[index];
            this.loadedModelList.splice(this.loadedModelList.indexOf(index),1);
            del_count++;
            // console.log("del",index);
        }
        // if(del_count) console.log("delete count:",del_count);
    }
}

function disposeInsMesh(instanceMesh) {
    if (!instanceMesh) return;
    instanceMesh.geometry.clearGroups();
    instanceMesh.geometry.dispose();
    instanceMesh.material[0].dispose();
    for (let key in instanceMesh) delete instanceMesh[key];
}
window.count1=0
window.count2=0

import{Classification}from"./parametric/Classification"
function processMesh(mesh, matrixList) {
    // mesh.material=new MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } );
    if(true){
        var tool=new Classification(mesh, matrixList)
        mesh.material.cflag=tool.param.type=="else"
        if(mesh.material.cflag){
            mesh.material= new MeshBasicMaterial( {color: 0xff0000} ); 
            window.count1++
        }
    }  
    // 
    
    window.count2++
        
    var instancedMesh = new InstancedMeshEx(
        mesh.geometry,
        [mesh.material],
        1,
        [matrixList.length],
        false
    );
    // instancedMesh.visible=false//mesh.material.cflag
    
    // instancedMesh.scale.set(5,5,5)
    instancedMesh.geometry.clearGroups();
    instancedMesh.geometry.addGroupInstanced(
        0,
        mesh.geometry.index.array.length,
        0,
        0,
        false
    );
    for (let i = 0; i < matrixList.length; i++) {
        var instanceMatrix = matrixList[i];
        instancedMesh.setInstanceMatrixAt(0, i, instanceMatrix);
    }
    // console.log("instancedMesh",instancedMesh)
    if(tool.mesh2){
        // instancedMesh.visible=
        // tool.mesh2.visible=tool.param.type=="cube"
        return tool.mesh2//return instancedMesh;//
    }
    return instancedMesh;
}

function quickSort(arr_1, arr_2, begin, end) {
    if(begin >= end)
        return;
    var l = begin;
    var r = end;
    var temp = arr_1[begin];
    while(l < r) {
        while(l < r && arr_1[r] <= temp)
            r --;
        while(l < r && arr_1[l] >= temp)
            l ++;
        [arr_1[l], arr_1[r]] = [arr_1[r], arr_1[l]];
        [arr_2[l], arr_2[r]] = [arr_2[r], arr_2[l]];
    }
    [arr_1[begin], arr_1[l]] = [arr_1[l], arr_1[begin]];
    [arr_2[begin], arr_2[l]] = [arr_2[l], arr_2[begin]];
    quickSort(arr_1, arr_2, begin, l - 1);
    quickSort(arr_1, arr_2, l + 1, end);
}

function positionMatch(pos,position){
    return Math.round(pos.x) === Math.round(position.x) &&
        Math.round(pos.y) === Math.round(position.y) &&
        Math.round(pos.z) === Math.round(position.z);
}
