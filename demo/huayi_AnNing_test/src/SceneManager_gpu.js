import * as THREE from "three";
import {
    BoxGeometry,
    Color,
    GeometryBase, InstancedMesh,
    LitMaterial,
    Matrix4, matrixRotate,
    MeshRenderer,
    Object3D, UnLitMaterial,
    Vector3,
    VertexAttributeName
} from "@orillusion/core";

export class SceneManager{
    constructor(scene, camera){
        this.scene = scene
        this.camera = camera

        // this.instanceGroup = new THREE.Group()
        // this.instanceGroup.scale.set(0.001,0.001,0.001)
        // this.instanceGroup.rotation.set(-Math.PI/2,0,0)
        // this.scene.add(this.instanceGroup)

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
        this.pre_camera_position = new Vector3()

        this.mesText1 = createElementText(20,0)
        this.mesText2 = createElementText(20,25)
        this.mesText3 = createElementText(20,50)
        this.mesText4 = createElementText(20,75)
        this.mesText5 = createElementText(20,100)

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
            // console.log(e.data);
            ///////////改动的部分--开始///////////
            if(e.code){
                console.log("flag: 105")
                return
            }
            ///////////改动的部分--结束///////////

            let index = e.data.index;
            let pos = this.loadingModelList.indexOf(index);
            if(pos!==-1) this.loadingModelList.splice(pos,1);
            if(!this.loadedModelList.includes(index))
                this.loadedModelList.push(index)

            let geometry = new GeometryBase();
            if(e.data.indices) geometry.setIndices(e.data.indices);
            if(e.data.normal) geometry.setAttribute(VertexAttributeName.normal, e.data.normal);
            geometry.setAttribute(VertexAttributeName.position, e.data.vertices);
            geometry.addSubGeometry({
                indexStart: 0,
                indexCount: e.data.indices.length,
                vertexStart: 0,
                vertexCount: e.data.vertices.length,
                firstStart: 0,
                index: 0,
                topology: 0
            });

            let geometry_simp = null;
            this.addInsModel(e.data.index, e.data.matrix, geometry, geometry_simp, e.data.color);
        };
    }
    animate(){
        let position = new Vector3(this.camera.object3D.localPosition.x, this.camera.object3D.localPosition.y, this.camera.object3D.localPosition.z)
        // console.log(position)
        this.httping = false
        if (position !== this.pre_camera_position && !this.httping) {
            this.httping = true
            // this.sceneCulling()
        }
        // let start_time = performance.now();
        // this.setVisibility()
        this.processLoadList(this.toLoadModelList)
        // console.log("cost: ", performance.now()-start_time, "ms");
        // this.manageCaches()

        requestAnimationFrame(this.animate)
    }
    preLoadViewPoint(id){
        console.log("pre-culling")
        let res = this.preLoadList[id]
        // console.log(res)
        if(this.httping) this.httpblock = true
        // this.httping = false
        this.processSVS(res)
        this.pre_camera_position = new Vector3(this.camera.object3D.localPosition.x, this.camera.object3D.localPosition.y, this.camera.object3D.localPosition.z)
    }
    sceneCulling(){
        // let frustumMat = new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse)
        let cameraPosition = new Vector3(this.camera.object3D.localPosition.x, this.camera.object3D.localPosition.y, this.camera.object3D.localPosition.z)
        let projectMatrix = this.camera.projectionMatrix;
        let worldMatrix = this.camera.transform.worldMatrix.clone();
        worldMatrix.invers33()
        // console.log(projectMatrix)
        // console.log(worldMatrix)
        // let frustumMat = new Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.)
        let mat = new Matrix4().multiplyMatrices(projectMatrix, worldMatrix);
        // console.log(mat)
        let frustum_data = JSON.stringify({
            mat: mat.rawData,
            pos: cameraPosition,
            wid: document.documentElement.clientWidth,
            hei: document.documentElement.clientHeight,
            dir: this.camera.getWorldDirection(),
            typ: 0
        })
        // console.log(document.documentElement.clientWidth,document.documentElement.clientHeight)
        this.pre_camera_position = cameraPosition;

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
            let index = to_load_list[i];
            this.toLoadModelList.splice(this.toLoadModelList.indexOf(index),1);
            this.loadingModelList.push(index);
        }
        this.worker.postMessage(to_load_list);
    }
    addInsModel(index, matrix, geometry, geometry_simp, base_color){
        if(this.mesh_map[index]) return;

        matrix.push([1,0,0,0,0,1,0,0,0,0,1,0])
        let matrix4List = []
        for(let i=0; i<matrix.length; i++){
            let mat = matrix[i];
            matrix4List.push(new Matrix4().copyFrom({
                rawData: [
                    mat[0], mat[4], mat[8], 0,
                    mat[1], mat[5], mat[9], 0,
                    mat[2], mat[6], mat[10], 0,
                    mat[3], mat[7], mat[11], 1
                ]
            }));
        }
        // console.log(matrix4List)

        let material = new UnLitMaterial();
        material.baseColor = new Color(base_color.r, base_color.g, base_color.b, 1);

        let instance_mesh = processMesh(geometry, material, matrix4List)
        // instance_mesh.visible = !!this.visibleSet[index]
        instance_mesh.scaleX = 0.001;
        instance_mesh.scaleY = 0.001;
        instance_mesh.scaleZ = 0.001;
        instance_mesh.rotationX = -90;
        this.scene.addChild(instance_mesh);
        this.mesh_map[index] = instance_mesh

        // let vertices = geometry.getAttribute(VertexAttributeName.position).data;
        // let min = new Vector3();
        // let max = new Vector3();
        // for(let i=0; i<vertices.length; i+=3){
        //     let x = vertices[i], y = vertices[i+1], z = vertices[i+2];
        //     if(min.x>x||min.x===0) min.x = x;
        //     if(min.y>y||min.y===0) min.y = y;
        //     if(min.z>z||min.z===0) min.z = z;
        //     if(max.x<x||max.x===0) max.x = x;
        //     if(max.y<y||max.y===0) max.y = y;
        //     if(max.z<z||max.z===0) max.z = z;
        // }
        // let x_length = max.x-min.x, y_length = max.y-min.y, z_length = max.z-min.z;
        // let center = new Vector3().subVectors(
        //     min.clone().add(max).multiplyScalar(0.5).multiplyScalar(0.001),
        //     new Vector3(2025.7,0,-2167.1))
        //
        // let geo_box = new BoxGeometry(x_length, y_length, z_length);
        // let ins_box = new InstancedMesh(geo_box, material, 1);
        // let transformMatrix = new Matrix4();
        // // let rand = Math.random()
        // // matrixRotate(rand * Math.PI / 2, new Vector3(0, 1, 0), transformMatrix)
        // // transformMatrix.translate(new Vector3(Math.random() * 200000 - 100000, Math.random() * 200000 - 100000, Math.random() * 200000 - 100000))
        // ins_box.setMatrixAt(0, transformMatrix);
        // ins_box.x = center.x;
        // ins_box.y = center.y;
        // ins_box.z = center.z;
        // ins_box.scaleX = 0.001;
        // ins_box.scaleY = 0.001;
        // ins_box.scaleZ = 0.001;
        // this.scene.addChild(ins_box);
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
    // const instancedMesh = new THREE.InstancedMesh(geometry, material, matrixList.length)
    // if(!geometry.index) return instancedMesh
    // for(let i=0; i<matrixList.length; i++){
    //     let instanceMatrix = matrixList[i]
    //     instancedMesh.setMatrixAt(i, instanceMatrix)
    // }
    // return instancedMesh
    let instancedMesh = new InstancedMesh(geometry, material, matrixList.length);
    for (let i = 0; i < matrixList.length; i++) {
        instancedMesh.setMatrixAt(i, matrixList[i]);
    }
    return instancedMesh;
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
