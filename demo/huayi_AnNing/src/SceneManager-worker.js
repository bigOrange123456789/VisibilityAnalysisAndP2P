import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {ZipLoader} from "./myLib/ziploader";
import {CubeModeling, CylinderModeling} from "./myLib/parmetricModeling";
import{Classification} from "./parametric/Classification";
export class SceneManager{
    constructor(renderer, scene, camera){
        this.renderer = renderer
        this.scene = scene
        this.camera = camera

        this.instanceGroup = new THREE.Group()
        this.instanceGroup.scale.set(0.001,0.001,0.001)
        this.instanceGroup.rotation.set(-Math.PI/2,0,0)
        this.scene.add(this.instanceGroup)

        this.visibleSet = {}

        this.FVS = []
        this.SVS = []
        this.PVS = []

        this.loadingModelList = []
        this.toLoadModelList = []
        this.loadedModelList = []

        this.mesh_simp_map = {}
        this.mesh_map = {}
        this.bounding_sph = {}

        this.loaded_mesh_interest = {}
        this.loaded_mesh_invisible_time = {}
        this.loaded_mesh_limit = 2500

        this.preLoadList = null

        this.loadlimit = 200
        this.httping = true
        this.httpblock = false  // 当视点构件列表正在加载时，屏蔽一次之前的可见集计算结果
        // this.pre_camera_position = this.camera.position.clone()
        this.pre_camera_position = new THREE.Vector3()
        this.closeComponentsCount = 800

        this.mesText1 = createElementText(20,0)
        this.mesText2 = createElementText(20,25)
        this.mesText3 = createElementText(20,50)
        this.mesText4 = createElementText(20,75)
        this.mesText5 = createElementText(20,100)
        this.mesText6 = createElementText(20,125)

        // 192.168.114.129
        // 47.103.21.207
        this.server_ip = "ws://47.116.5.3:3006/"
        this.ws = null

        window.info=(p)=>{
            // console.log(this.loadingModelList)
            // console.log(this.toLoadModelList)
            // console.log(this.loadedModelList)
        }

        this.startConnect()
    }
    startConnect(){
        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)

        var self = this
        new THREE.FileLoader().load("assets/preLoadList.json",(json)=>{
            self.preLoadList = JSON.parse(json)
            // for(let i=0; i<self.preLoadList.length; i++){
            //     self.preLoadList[i] = [self.preLoadList[i][0], []]
            // }
            // console.log(self.preLoadList)
            self.preLoadViewPoint(0)
        })

        this.ws = new WebSocket(this.server_ip)
        this.ws.onopen = (evt) => {
            self.httping = false
            console.log("websocket connect succeed")
        }
        this.ws.onclose = (evt) => {
            window.alert(" Unable to connect to server. ")
        }
        this.ws.onmessage = (evt) => {
            let res = JSON.parse(evt.data)
                if(res["typ"]===0){
                    self.receiveFrustumRes(res);
                }else if(res["typ"]===1){
                    self.receiveOcclusionRes(res);
                }
        };

        // worker多线程
        this.worker = new Worker("./myLib/worker.js");
        this.worker.onmessage = (e)=>{
            console.log(e.data);
            ///////////改动的部分--开始///////////
            if(e.code){
                console.log("flag: 101")
                return
            }
            ///////////改动的部分--结束///////////

            let index = e.data.index;
            let pos = this.loadingModelList.indexOf(index);
            if(pos!==-1) this.loadingModelList.splice(pos,1);
            if(!this.loadedModelList.includes(index))
                this.loadedModelList.push(index)

            let geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(e.data.vertices,3));
            if(e.data.indices) geometry.setIndex(new THREE.BufferAttribute(e.data.indices,1));
            geometry.computeVertexNormals();
            let geometry_simp = null;
            if(e.data.vertices_simp){
                geometry_simp = new THREE.BufferGeometry();
                geometry_simp.setAttribute('position', new THREE.BufferAttribute(e.data.vertices_simp,3));
                geometry_simp.setIndex(new THREE.BufferAttribute(e.data.indices_simp,1));
            }
            this.addInsModel(e.data.index, e.data.matrix, geometry, geometry_simp, e.data.color);
        };
    }
    animate(){
        if (!this.camera.position.equals(this.pre_camera_position) && !this.httping) {
            this.httping = true
            this.sceneCulling()
        }
        // let start_time = performance.now();
        this.setVisibility()
        this.processLoadList(this.toLoadModelList)
        // console.log("cost: ", performance.now()-start_time, "ms");
        this.manageCaches()

        this.renderer.clear()
        this.renderer.render(this.scene,this.camera)

        requestAnimationFrame(this.animate)
    }
    preLoadViewPoint(id){
        console.log("pre-culling")
        let res = this.preLoadList[id]
        // console.log(res)
        if(this.httping) this.httpblock = true
        // this.httping = false
        this.processSVS(res)
        this.pre_camera_position = this.camera.position.clone()
    }
    sceneCulling(){
        let frustumMat = new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse)
        let frustum_data = JSON.stringify({
            mat:frustumMat.elements,
            pos:this.camera.position,
            wid:document.documentElement.clientWidth,
            hei:document.documentElement.clientHeight,
            dir:getCameraDirection(this.camera),
            typ:0
        })
        // console.log(document.documentElement.clientWidth,document.documentElement.clientHeight)
        this.pre_camera_position = this.camera.position.clone()

        {
            // console.log("send")
            this.ws.send(frustum_data)
        }
    }
    setVisibility(){
        // var start_time = performance.now()
        const weight_line = 0.000000002
        var vis_mesh = 0, vis_mesh_simp = 0, invis_mesh = 0, invis_mesh_simp = 0
        var fvs_progress = 0, svs_progress = 0, pvs_progress = 0;
        var frustum = getFrustum(this.camera)
        for(let i=0; i<this.loadedModelList.length; i++){
            let index = this.loadedModelList[i]
            if(this.visibleSet[index]){   // 可见
                if(this.mesh_map[index] && this.mesh_simp_map[index]){
                    let weight = 0
                    let dis_min = this.camera.position.clone().sub(this.bounding_sph[index][0].center).length()
                    for(let j=0; j<this.bounding_sph[index].length && weight<weight_line; j++){
                        let dis = this.camera.position.clone().sub(this.bounding_sph[index][j].center).length()
                        if(dis<dis_min) dis_min = dis
                        let wei = this.bounding_sph[index][j].radius / dis
                        if(frustum.intersectsSphere(this.bounding_sph[index][j]))
                            weight += wei
                    }
                    if(weight>weight_line || dis_min<50){
                        this.mesh_map[index].visible = true
                        this.mesh_simp_map[index].visible = false
                        vis_mesh++
                        invis_mesh_simp++
                    }else{
                        this.mesh_map[index].visible = false
                        this.mesh_simp_map[index].visible = true
                        invis_mesh++
                        vis_mesh_simp++
                    }
                    this.loaded_mesh_invisible_time[index] = 0;
                }else if(this.mesh_map[index]){
                    this.mesh_map[index].visible = true
                    vis_mesh++
                    this.loaded_mesh_invisible_time[index] = 0;
                }

                // if(this.mesh_map[index]){
                //     this.mesh_map[index].visible = true
                //     vis_mesh++
                // }
            }
            else{                      // 不可见
                if(this.mesh_map[index]){
                    this.mesh_map[index].visible = false
                    this.loaded_mesh_invisible_time[index] += 1;
                }
                if(this.mesh_simp_map[index]){
                    this.mesh_simp_map[index].visible = false
                }
            }
            if(this.FVS.includes(index)){
                fvs_progress++
            }
            if(this.SVS.includes(index)){
                svs_progress++
            }
            if(this.PVS.includes(index)){
                pvs_progress++
            }
        }
        if(this.FVS.length===0) this.mesText1.innerText = "FVS: 100.00%"
        else this.mesText1.innerText = "FVS: "+(fvs_progress/this.FVS.length*100).toFixed(2)+"%"
        if(this.SVS.length===0) this.mesText2.innerText = "SVS: 100.00%"
        else this.mesText2.innerText = "EVS: "+(svs_progress/this.SVS.length*100).toFixed(2)+"%"
        if(this.PVS.length===0) this.mesText3.innerText = "PVS: 100.00%"
        else this.mesText3.innerText = "PVS: "+(pvs_progress/this.PVS.length*100).toFixed(2)+"%"

        this.mesText4.innerText = "Visible Meshes:  "+(vis_mesh+vis_mesh_simp)
        this.mesText5.innerText = "Loaded Meshes:  "+this.loadedModelList.length
        this.mesText6.innerText = "Triangles: "+Math.round(this.renderer.info.render.triangles)

        // var cost = (performance.now()-start_time).toFixed(0)
        // console.log("cost ",cost,"ms")
    }
    receiveFrustumRes(res){
        // console.log("frustum culling")
        if(this.httpblock){
            this.httping = false
            this.httpblock = false
            return
        }
        let frustumPVS_data = {
            mat:new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse).elements,
            pos:this.camera.position,
            wid:document.documentElement.clientWidth,
            hei:document.documentElement.clientHeight,
            dir:getCameraDirection(this.camera),
            PVS:res["res"],
            typ:1
        }
        if(positionMatch(res["pos"], this.camera.position)){ // 如果相机没有改变，进行遮挡剔除
            this.ws.send(JSON.stringify(frustumPVS_data))
        }else{                                              // 如果相机改变了，再来一次视锥剔除
            delete frustumPVS_data["PVS"]
            frustumPVS_data["typ"] = 0
            this.ws.send(JSON.stringify(frustumPVS_data))
            this.pre_camera_position = this.camera.position.clone()
        }
        this.processFVS(res["res"])
    }
    receiveOcclusionRes(res){
        // console.log("occlusion culling")
        if(this.httpblock){
            this.httping = false
            this.httpblock = false
            return
        }
        if(positionMatch(res["pos"], this.camera.position)){
            this.httping = false
            this.processSVS(res["res"])
        }else{
            let frustumPVS_data = {
                mat:new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse).elements,
                pos:this.camera.position,
                wid:document.documentElement.clientWidth,
                hei:document.documentElement.clientHeight,
                dir:getCameraDirection(this.camera),
                typ:0
            }
            this.ws.send(JSON.stringify(frustumPVS_data))
            this.pre_camera_position = this.camera.position.clone()
        }
    }
    processFVS(FVS){
        this.FVS = FVS
        if(window.autoMoving)
            this.visibleSet = {}
        for(let i=0; i<FVS.length; i++){
            this.visibleSet[FVS[i]] = true;
        }

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
        this.visibleSet = {}
        for(let i=0; i<SVS.length; i++){
            this.visibleSet[SVS[i]] = true;
        }

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
        this.toLoadModelList = [...load_list, ...pon_load_list]
        if(load_list.length)
            this.processLoadList(load_list)
    }
    processLoadList(load_list){
        if(this.loadingModelList.length>this.loadlimit) return;
        var to_load_list = []
        for(let i=0; i<load_list.length; i++){
            let ind = load_list[i]
            if(i<this.loadlimit && !this.loadingModelList.includes(ind)){
                to_load_list.push(ind)
            }
        }
        for(let i=0; i<to_load_list.length; i++){
            // this.loadModelZip(to_load_list[i])
            let index = to_load_list[i];
            this.toLoadModelList.splice(this.toLoadModelList.indexOf(index),1);
            this.loadingModelList.push(index);
        }
        this.worker.postMessage(to_load_list);
    }
    loadModelZip(index){
        // this.toLoadModelList.splice(this.toLoadModelList.indexOf(index),1)
        // this.loadingModelList.push(index)
        var self = this
        var url = "assets/components/"+index+".zip"
        var loader = new THREE.LoadingManager()
        new Promise(function(resolve,reject){
            new ZipLoader().load(url,()=>{
            },()=>{
                console.log("model加载失败："+index)
            }).then((zip)=>{
                // let pos = self.loadingModelList.indexOf(index)
                // if(pos===-1) return;
                // self.loadingModelList.splice(pos,1)
                // if(!self.loadedModelList.includes(index))
                //     self.loadedModelList.push(index)

                loader.setURLModifier(zip.urlResolver)
                resolve({
                    matrices:zip.find("json"),
                    models:zip.find("glb")
                })
            })
        }).then(function(zipContent){
            new THREE.FileLoader(loader).load(zipContent.matrices[0],(json)=>{
                let matrix = JSON.parse(json)
                if(zipContent.models.length===1){
                    new GLTFLoader(loader).load(zipContent.models[0], (gltf)=>{
                        let mesh = gltf.scene.children[0].children[0]
                        self.addInsModel(index,matrix,mesh,null)
                    })
                }else{
                    new GLTFLoader(loader).load(zipContent.models[1], (gltf)=>{
                        let mesh = gltf.scene.children[0].children[0]
                        new GLTFLoader(loader).load(zipContent.models[0], (gltf)=>{
                            let mesh_simp = gltf.scene.children[0].children[0]
                            self.addInsModel(index,matrix,mesh,mesh_simp)
                        })
                    })
                }
            })
        })
    }
    addInsModel(index, matrix, geometry, geometry_simp, base_color){
        if(this.mesh_map[index]) return;

        matrix.push([1,0,0,0,0,1,0,0,0,0,1,0])
        let matrix4List = []
        for(let j=0; j<matrix.length; j++){
            let mat = matrix[j];
            matrix4List.push(new THREE.Matrix4().set(
                mat[0], mat[1], mat[2], mat[3],
                mat[4], mat[5], mat[6], mat[7],
                mat[8], mat[9], mat[10], mat[11],
                0, 0, 0, 1)
            );
        }

        let material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(base_color.r, base_color.g, base_color.b),
            emissive: new THREE.Color(base_color.r*0.5, base_color.g*0.5, base_color.b*0.5),
            roughness: 0.6,
            metalness: 0.6
        });
        // let color = [material.color.r, material.color.g, material.color.b];
        // material.emissive = new THREE.Color(color[0]*0.5, color[1]*0.5, color[2]*0.5);
        // material.roughness = 0.6;
        // material.metalness = 0.6;
        ///////////改动的部分--开始///////////
        console.log(111)
        let classification = new Classification(new THREE.Mesh(geometry, material),[])
        if(classification.mesh2){
            geometry     =classification.mesh2.geometry
            geometry_simp=classification.mesh2.geometry
            material=new THREE.MeshBasicMaterial()
            material.color.r=0//color[0]
            material.color.g=1//color[1]
            material.color.b=0//color[2]
        }else{
            material=new THREE.MeshBasicMaterial()
            material.color.r=1//color[0]
            material.color.g=0//color[1]
            material.color.b=0//color[2]
        }
        ///////////改动的部分--结束///////////

        let instance_mesh = processMesh(geometry, material, matrix4List)
        instance_mesh.visible = !!this.visibleSet[index]
        this.instanceGroup.add(instance_mesh)
        this.mesh_map[index] = instance_mesh

        if(geometry_simp){
            this.mesh_map[index].visible = false
            let instance_mesh_simp = processMesh(geometry_simp, material, matrix4List)
            this.instanceGroup.add(instance_mesh_simp)
            this.mesh_simp_map[index] = instance_mesh_simp
        }

        instance_mesh.updateWorldMatrix(false,false)
        instance_mesh.geometry.computeBoundingSphere()
        let sphere = instance_mesh.geometry.boundingSphere
        let spheres = []
        for(let i=0; i<matrix4List.length; i++){
            spheres.push(sphere.clone().applyMatrix4(matrix4List[i]).applyMatrix4(instance_mesh.matrixWorld))
        }
        this.bounding_sph[index] = spheres

        geometry.computeBoundingBox()
        let box = geometry.boundingBox.clone().applyMatrix4(this.instanceGroup.matrixWorld)
        let xl = box.max.x-box.min.x
        let yl = box.max.y-box.min.y
        let zl = box.max.z-box.min.z
        this.loaded_mesh_interest[index] = xl*yl+xl*zl+yl*zl * matrix.length
        this.loaded_mesh_invisible_time[index] = 0
    }
    manageCaches(){// 新增函数
        let model_list = [];
        let clear_degree_list = [];
        for(let i=0; i<this.loadedModelList.length; i++){
            let index = this.loadedModelList[i];
            if(this.mesh_map[index] && this.loaded_mesh_invisible_time[index] && !this.PVS.includes(index)){
                model_list.push(index);
                clear_degree_list.push(this.loaded_mesh_interest[index]/this.loaded_mesh_invisible_time[index]);
            }
        }
        quickSort(clear_degree_list,model_list,0,model_list.length-1);
        let del_count = 0;
        for(let i=this.loaded_mesh_limit; i<model_list.length; i++){
            if(i<0) continue;
            let index = model_list[i];
            this.mesh_map[index].visible = false;
            this.instanceGroup.remove(this.mesh_map[index]);
            disposeInsMesh(this.mesh_map[index]);
            delete this.mesh_map[index];
            if(this.mesh_simp_map[index]){
                this.mesh_simp_map[index].visible = false;
                this.instanceGroup.remove(this.mesh_simp_map[index]);
                disposeInsMesh(this.mesh_simp_map[index]);
                delete this.mesh_simp_map[index];
            }
            delete this.bounding_sph[index];
            delete this.loaded_mesh_interest[index];
            delete this.loaded_mesh_invisible_time[index];
            this.loadedModelList.splice(this.loadedModelList.indexOf(index),1);
            del_count++;
            // console.log("del",index);
        }
        // if(del_count) console.log("delete count:",del_count);
    }
}

function getFrustum(camera){
    let frustum = new THREE.Frustum()
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse))
    return frustum
}

function disposeInsMesh(instanceMesh){
    if(!instanceMesh) return
    instanceMesh.geometry.clearGroups()
    instanceMesh.geometry.dispose()
    instanceMesh.material.dispose()
    for(let key in instanceMesh)
        delete instanceMesh[key]
}

function processMesh(geometry, material, matrixList){
    const instancedMesh = new THREE.InstancedMesh(geometry, material, matrixList.length)
    if(!geometry.index) return instancedMesh
    for(let i=0; i<matrixList.length; i++){
        let instanceMatrix = matrixList[i]
        instancedMesh.setMatrixAt(i, instanceMatrix)
    }
    return instancedMesh
}

function createElementText(left,top){
    let element = document.createElement("p")
    document.body.appendChild(element)
    element.style.position = "fixed"
    element.style.left = left+"px"
    element.style.top = top+"px"
    element.style.fontSize = window.innerHeight/50+"px"
    element.style.fontWeight = "bolder"
    return element
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

function getCameraDirection(camera){
    return new THREE.Vector3(0,0,- 1).applyQuaternion(camera.quaternion).multiplyScalar(-1);
}
