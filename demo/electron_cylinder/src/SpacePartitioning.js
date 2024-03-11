import {
    Box3,
    Box3Helper,
    BufferAttribute,
    BufferGeometryEx,
    Group,
    InstancedMeshEx,
    Matrix4,
    MeshEx,
    Scene,
    Triangle,
    Vector3
} from "../three/build/three.module";
import {
    BoxBufferGeometry,
    Color,
    FileLoader, InstancedMesh,
    LoadingManager,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial, SphereBufferGeometry
} from "../three/build/three";
import {ZipLoader} from "../ziploader";
import {GLTFLoaderEx} from "../three/examples/jsm/loaders/GLTFLoaderEx";
import {GLTFExporter} from "../three/examples/jsm/exporters/GLTFExporter";
import {OBJExporter} from "../three/examples/jsm/exporters/OBJExporter";

var instanceBoxList = new Array(275809)
var instanceSphereList = new Array(275809)
var treeInfo = {}
const max_size = 150

export class SpacePartitioning{
    constructor(){
        this.units = null
        this.sceneBox = new Box3(
            new Vector3(-21.000001953125,-92.80279687499947,-4501),
            new Vector3(5872.5,107.40167187500043,18.3919921875))
        var mat = [0.001, 0, 0, 0, 0, 2.220446049250313e-19, -0.001, 0, 0, 0.001, 2.220446049250313e-19, 0, 0, 0, 0, 1]
        this.matrixWorld = new Matrix4().set(
            mat[0],mat[4],mat[8],mat[12],
            mat[1],mat[5],mat[9],mat[13],
            mat[2],mat[6],mat[10],mat[14],
            mat[3],mat[7],mat[11],mat[15])
        this.times = 19

        this.matrixList = new Array(275809)
        this.occluderList = new Array(275809)
        this.meshList = new Array(275809)

        // 测试组件
        this.instanceGroup = new Group()
        this.instanceGroup.scale.set(0.001,0.001,0.001)
        this.instanceGroup.rotation.set(-Math.PI/2,0,0)
        window.scene.add(this.instanceGroup)

        // var self = this
        // new FileLoader().load("assets/info/sceneGraph.json",(json)=>{
        //     let sceneGraph = JSON.parse(json)
        //     // console.log(sceneGraph)
        //     // self.judgeNeighbor(sceneGraph)
        //
        //     // let sceneBox = new Box3(new Vector3(), new Vector3())
        //     // for(let i=0; i<sceneGraph.length; i++){
        //     //     let region = sceneGraph[i]
        //     //     let pos = new Vector3(region.center[0],region.center[1],region.center[2])
        //     //     // let cube_geo = new BoxBufferGeometry(30,30,30)
        //     //     let cube_geo = new SphereBufferGeometry(300)
        //     //     let cube_mat = new MeshBasicMaterial({color:0xff0000})
        //     //     let cube_mesh = new Mesh(cube_geo,cube_mat)
        //     //     cube_mesh.position.copy(pos)
        //     //     window.scene.add(cube_mesh)
        //     //     for(let j=0; j<region.children.length; j++){
        //     //         let firstLevelUnit = region.children[j]
        //     //         let unitBox = firstLevelUnit.nodeBox
        //     //         unitBox = new Box3(
        //     //             new Vector3(unitBox[0][0], unitBox[0][1], unitBox[0][2]),
        //     //             new Vector3(unitBox[1][0], unitBox[1][1], unitBox[1][2]))
        //     //         sceneBox.union(unitBox)
        //     //         // window.scene.add(new Box3Helper(unitBox))
        //     //     }
        //     // }
        //     // console.log(sceneBox)
        //     // // window.scene.add(new Box3Helper(sceneBox))
        //     // sceneBox = select_box
        //     // let countX = 200
        //     // let countY = 25
        //     // let countZ = 160
        //     // let offsetX = (sceneBox.max.x-sceneBox.min.x)/countX
        //     // let offsetY = (sceneBox.max.y-sceneBox.min.y)/countY
        //     // let offsetZ = (sceneBox.max.z-sceneBox.min.z)/countZ
        //     // console.log(offsetX,offsetY,offsetZ)
        //     // let cube_geo = new BoxBufferGeometry(2,2,2)
        //     // let cube_mat = new MeshBasicMaterial({color:0xff0000})
        //     // let instanceCount = countX*countY*countZ
        //     // let instanceCube = new InstancedMesh(cube_geo,cube_mat,instanceCount)
        //     // let index = 0
        //     // for(let i=0; i<countX; i++){
        //     //     for(let j=0; j<countY; j++){
        //     //         for(let k=0; k<countZ; k++){
        //     //             let pos = new Vector3(sceneBox.min.x+i*offsetX,sceneBox.min.y+j*offsetY,sceneBox.min.z+k*offsetZ)
        //     //             let matrix = new Matrix4().setPosition(pos)
        //     //             instanceCube.setMatrixAt(index,matrix)
        //     //             index++
        //     //         }
        //     //     }
        //     // }
        //     // window.scene.add(instanceCube)
        // })

        // this.loadInfo()
        this.loadNeighbor(1);

        window.test=()=>{
            for(var key in treeInfo){
                var box = treeInfo[key].box
                window.scene.add(new Box3Helper(new Box3(
                    new Vector3(box[0][0],box[0][1],box[0][2]),
                    new Vector3(box[1][0],box[1][1],box[1][2])
                )))
            }
        }
    }
    loadInfo(){
        var self = this
        new FileLoader().load("./assets/task-huayi-ecs/structdesc.json",(json1)=>{
            let struct_desc = JSON.parse(json1)
            new FileLoader().load("./assets/task-huayi-ecs/smatrix.json",(json2)=>{
                let matrix_desc = JSON.parse(json2)
                let ind = 0
                let sum = 0
                for(let i=0; i<struct_desc.length; i++)
                    for(let j=0; j<struct_desc[i].length; j++){
                        self.matrixList[ind++] = matrix_desc[struct_desc[i][j].n].it
                        sum += matrix_desc[struct_desc[i][j].n].it.length+1
                    }
                // console.log(ind)
                // console.log(sum)
                self.loadUnit(0)
            })
        })

        var load_check = setInterval(function(){
            var number = 0
            for(let i=0; i<self.meshList.length; i++){
                if(self.meshList[i])
                    number++
            }
            if(number===self.meshList.length){
                console.log("加载完成")
                // console.log(instanceBoxList)
                // self.buildTree()
                // self.addModelToScene()
                // self.exportGLTF()
                // self.exportOBJ()
                // new FileLoader().load("assets/info/sceneGraph.json",(json)=> {
                //     let sceneGraph = JSON.parse(json)
                //     self.judgeNeighbor(sceneGraph)
                // })
                clearInterval(load_check)
            } else {
                var percentage = (number/self.meshList.length*100).toFixed(2)
                console.log(percentage+"%")
            }
        },2000)
    }
    loadUnit(index){
        if(index===920) return
        var self = this
        new GLTFLoaderEx().load("./assets/task-huayi-ecs/task-huayi-ecs_output"+index+".gltf", (gltf)=>{
            var meshes = gltf.scene.children[0].children
            var boxes = {}
            for(let i=0; i<meshes.length; i++){
                self.meshList[Number(meshes[i].name)] = meshes[i]
                meshes[i].geometry.computeBoundingBox()
                boxes[meshes[i].name] = meshes[i].geometry.boundingBox
            }
            // download(boxes,"boundingBox"+index+".json")

            self.readModel(meshes)
            self.loadUnit(index+1)
        })
    }
    readModel(meshes){
        // console.log(meshes)
        // console.log(matrix)
        for(let i=0; i<meshes.length; i++){
            var mesh = meshes[i]
            var index = Number(mesh.name)
            var mats = this.matrixList[index]
            mats.push([1,0,0,0,0,1,0,0,0,0,1,0])
            // console.log(mats)
            var instance_boxes = []
            var instance_spheres = []
            mesh.geometry.computeBoundingBox()
            for(let j=0; j<mats.length; j++){
                let mat = mats[j]
                let instance_matrix = new Matrix4().set(
                    mat[0], mat[1], mat[2], mat[3],
                    mat[4], mat[5], mat[6], mat[7],
                    mat[8], mat[9], mat[10], mat[11],
                    0, 0, 0, 1)
                // instance_mesh.geometry.computeBoundingBox()
                // instance_mesh.geometry.computeBoundingSphere()
                let box = mesh.geometry.boundingBox.clone().applyMatrix4(instance_matrix).applyMatrix4(this.matrixWorld)
                instance_boxes.push(box)
                let sphere = mesh.geometry.boundingSphere.clone().applyMatrix4(instance_matrix).applyMatrix4(this.matrixWorld)
                instance_spheres.push(sphere)
                // this.instanceGroup.add(instance_mesh)
            }
            instanceBoxList[index] = instance_boxes
            instanceSphereList[index] = instance_spheres
        }
    }
    addModelToScene(){
        var self = this
        for(let i=0; i<50; i++){
            let index = this.units[i]
            let url = "assets/units-10.27/"+index+".zip"
            let loader = new LoadingManager()
            new Promise(function(resolve,reject){
                new ZipLoader().load(url,()=>{
                },()=>{
                    console.log("模型加载失败："+index)
                }).then((zip)=>{
                    loader.setURLModifier(zip.urlResolver)
                    resolve()
                })
            }).then(function(){
                new FileLoader(loader).load("blob:assets/units-10.27/matrix"+index+".json",json1=>{
                    let matrix = JSON.parse(json1)
                    new GLTFLoaderEx(loader).load("blob:assets/units-10.27/model"+index+".glb", (gltf)=>{
                        let meshes = gltf.scene.children[0].children
                        for(let j=0; j<meshes.length; j++){
                            let mesh = meshes[j]
                            let mats = matrix[mesh.name].it
                            mats.push([1,0,0,0,0,1,0,0,0,0,1,0])
                            let instancedMesh = new InstancedMeshEx(mesh.geometry, [mesh.material], 1, [mats.length], false)
                            instancedMesh.geometry.clearGroups()
                            instancedMesh.geometry.addGroupInstanced(0, mesh.geometry.index.array.length, 0, 0, false)
                            for(let k=0; k<mats.length; k++){
                                let mat = mats[k]
                                let instanceMatrix = new Matrix4().set(
                                    mat[0], mat[1], mat[2], mat[3],
                                    mat[4], mat[5], mat[6], mat[7],
                                    mat[8], mat[9], mat[10], mat[11],
                                    0, 0, 0, 1
                                )
                                instancedMesh.setInstanceMatrixAt(0, k, instanceMatrix)
                            }
                            instancedMesh.scale.set(0.001,0.001,0.001)
                            instancedMesh.rotation.set(-Math.PI/2,0,0)
                            // instancedMesh.visible = false
                            window.scene.add(instancedMesh)
                        }
                        // new FileLoader().load("assets/occluder/occluder"+index.toString()+".json",json2=>{
                        //     let occluder_json = JSON.parse(json2)
                        //     for(let j=0; j<occluder_json.index.length; j++){
                        //         let instancedOccluder = readList(occluder_json.index[j],occluder_json.list[j],matrix[occluder_json.index[j]].it)
                        //         instancedOccluder.scale.set(0.001,0.001,0.001)
                        //         instancedOccluder.rotation.set(-Math.PI/2,0,0)
                        //         // instancedOccluder.visible = false
                        //         // if(occluder_json.index[j]==="86") {
                        //         //     instancedOccluder.visible = true
                        //         //     console.log(86)
                        //         // }
                        //         window.scene.add(instancedOccluder)
                        //     }
                        // })
                    })
                })
            })
        }
    }
    partitionTree(){
        var times = this.times

        var node = new Node(0,this.sceneBox.min,this.sceneBox.max)
        while(times>0){
            let leftBox = getSubBox(node.box,0)
            node = new Node(node.id*2,leftBox.min,leftBox.max)
            times--
        }
        // console.log(node.box)
        var x_times = Math.round((this.sceneBox.max.x-this.sceneBox.min.x)/(node.box.max.x-node.box.min.x))
        var y_times = Math.round((this.sceneBox.max.y-this.sceneBox.min.y)/(node.box.max.y-node.box.min.y))
        var z_times = Math.round((this.sceneBox.max.z-this.sceneBox.min.z)/(node.box.max.z-node.box.min.z))
        // console.log(x_times,y_times,z_times)
        var x_length = (this.sceneBox.max.x-this.sceneBox.min.x)/x_times
        var y_length = (this.sceneBox.max.y-this.sceneBox.min.y)/y_times
        var z_length = (this.sceneBox.max.z-this.sceneBox.min.z)/z_times
        // console.log(x_length,y_length,z_length)
        var node_set = []
        for(let i=0; i<x_times; i++){
            let x_list = []
            for(let j=0; j<y_times; j++){
                let y_list = []
                for(let k=0; k<z_times; k++){
                    let min = new Vector3(
                        this.sceneBox.min.x+i*x_length,
                        this.sceneBox.min.y+j*y_length,
                        this.sceneBox.min.z+k*z_length)
                    let max = new Vector3(
                        this.sceneBox.min.x+(i+1)*x_length,
                        this.sceneBox.min.y+(j+1)*y_length,
                        this.sceneBox.min.z+(k+1)*z_length)
                    let node = new Node(i*y_times*z_times+j*z_times+k,min,max)
                    y_list.push(node)
                    // window.scene.add(new Box3Helper(new Box3(min,max)))
                }
                x_list.push(y_list)
            }
            node_set.push(x_list)
        }
        // console.log(node_set)
        return node_set
    }
    buildTree(){
        var meshList = []
        var meshSurfaceList = []
        for(let i=0; i<instanceBoxList.length; i++){
            if(instanceBoxList[i]){
                meshList.push(i)
                var surface = 0
                for(let j=0; j<instanceBoxList[i].length; j++){
                    var Size = getSize(instanceBoxList[i][j])
                    surface += (Size.x*Size.y+Size.x*Size.z+Size.y*Size.z)
                }
                meshSurfaceList.push(surface)
            }
        }
        quickSort(meshSurfaceList,meshList,0,meshList.length-1)

        this.times = 16
        var node_list1 = this.partitionTree()
        var x_times1 = node_list1.length
        var y_times1 = node_list1[0].length
        var z_times1 = node_list1[0][0].length
        var x_length1 = (this.sceneBox.max.x-this.sceneBox.min.x)/x_times1
        var y_length1 = (this.sceneBox.max.y-this.sceneBox.min.y)/y_times1
        var z_length1 = (this.sceneBox.max.z-this.sceneBox.min.z)/z_times1
        for(let m=0; m<Math.floor(meshList.length/100); m++){
            let i = meshList[m]
            for(let j=0; j<instanceBoxList[i].length; j++){
                let box = instanceBoxList[i][j]
                let x_start,x_end,y_start,y_end,z_start,z_end
                [x_start,x_end] = computeSE(box.min.x,box.max.x,this.sceneBox.min.x,x_length1,x_times1);
                [y_start,y_end] = computeSE(box.min.y,box.max.y,this.sceneBox.min.y,y_length1,y_times1);
                [z_start,z_end] = computeSE(box.min.z,box.max.z,this.sceneBox.min.z,z_length1,z_times1);
                for(let x=x_start; x<x_end; x++)
                    for(let y=y_start; y<y_end; y++)
                        for(let z=z_start; z<z_end; z++)
                            if(!node_list1[x][y][z].meshIndex.includes(i))
                                node_list1[x][y][z].meshIndex.push(i)
            }
        }

        this.times = 19
        var node_list2 = this.partitionTree()
        var x_times2 = node_list2.length
        var y_times2 = node_list2[0].length
        var z_times2 = node_list2[0][0].length
        var x_length2 = (this.sceneBox.max.x-this.sceneBox.min.x)/x_times2
        var y_length2 = (this.sceneBox.max.y-this.sceneBox.min.y)/y_times2
        var z_length2 = (this.sceneBox.max.z-this.sceneBox.min.z)/z_times2
        for(let m=Math.floor(meshList.length/100); m<Math.floor(meshList.length/10); m++){
            let i = meshList[m]
            for(let j=0; j<instanceBoxList[i].length; j++){
                let box = instanceBoxList[i][j]
                let x_start,x_end,y_start,y_end,z_start,z_end
                [x_start,x_end] = computeSE(box.min.x,box.max.x,this.sceneBox.min.x,x_length2,x_times2);
                [y_start,y_end] = computeSE(box.min.y,box.max.y,this.sceneBox.min.y,y_length2,y_times2);
                [z_start,z_end] = computeSE(box.min.z,box.max.z,this.sceneBox.min.z,z_length2,z_times2);
                for(let x=x_start; x<x_end; x++)
                    for(let y=y_start; y<y_end; y++)
                        for(let z=z_start; z<z_end; z++)
                            if(!node_list2[x][y][z].meshIndex.includes(i))
                                node_list2[x][y][z].meshIndex.push(i)
            }
        }

        this.times = 22
        var node_list3 = this.partitionTree()
        var x_times3 = node_list3.length
        var y_times3 = node_list3[0].length
        var z_times3 = node_list3[0][0].length
        var x_length3 = (this.sceneBox.max.x-this.sceneBox.min.x)/x_times3
        var y_length3 = (this.sceneBox.max.y-this.sceneBox.min.y)/y_times3
        var z_length3 = (this.sceneBox.max.z-this.sceneBox.min.z)/z_times3
        for(let m=Math.floor(meshList.length/10); m<meshList.length; m++){
            let i = meshList[m]
            for(let j=0; j<instanceBoxList[i].length; j++){
                let box = instanceBoxList[i][j]
                let x_start,x_end,y_start,y_end,z_start,z_end
                [x_start,x_end] = computeSE(box.min.x,box.max.x,this.sceneBox.min.x,x_length3,x_times3);
                [y_start,y_end] = computeSE(box.min.y,box.max.y,this.sceneBox.min.y,y_length3,y_times3);
                [z_start,z_end] = computeSE(box.min.z,box.max.z,this.sceneBox.min.z,z_length3,z_times3);
                for(let x=x_start; x<x_end; x++)
                    for(let y=y_start; y<y_end; y++)
                        for(let z=z_start; z<z_end; z++)
                            if(!node_list3[x][y][z].meshIndex.includes(i))
                                node_list3[x][y][z].meshIndex.push(i)
            }
        }

        var n1 = 0
        var n2 = 0
        var n3 = 0

        for(let i=0; i<node_list3.length; i++)
            for(let j=0; j<node_list3[i].length; j++)
                for(let k=0; k<node_list3[i][j].length; k++){
                    if(node_list3[i][j][k].meshIndex.length){
                        let pi = Math.floor(i/2)
                        let pj = Math.floor(j/2)
                        let pk = Math.floor(k/2)
                        node_list2[pi][pj][pk].children.push(node_list3[i][j][k])
                        n3++
                    }
                }

        for(let i=0; i<node_list2.length; i++)
            for(let j=0; j<node_list2[i].length; j++)
                for(let k=0; k<node_list2[i][j].length; k++){
                    if(node_list2[i][j][k].meshIndex.length || node_list2[i][j][k].children.length){
                        let pi = Math.floor(i/2)
                        let pj = Math.floor(j/2)
                        let pk = Math.floor(k/2)
                        node_list1[pi][pj][pk].children.push(node_list2[i][j][k])
                        n2++
                    }
                }

        var result = []
        for(let i=0; i<node_list1.length; i++)
            for(let j=0; j<node_list1[i].length; j++)
                for(let k=0; k<node_list1[i][j].length; k++){
                    if(node_list1[i][j][k].meshIndex.length || node_list1[i][j][k].children.length){
                        let node = node_list1[i][j][k].transformResult()
                        result.push(node)
                        n1++
                    }
                }

        // var result = {"1":{},"2":{},"3":{}}
        // var n1 = 0
        // var n2 = 0
        // var n3 = 0
        // for(let i=0; i<node_list1.length; i++)
        //     for(let j=0; j<node_list1[i].length; j++)
        //         for(let k=0; k<node_list1[i][j].length; k++)
        //             if(node_list1[i][j][k].meshIndex.length){
        //                 let node = node_list1[i][j][k]
        //                 result["1"][n1] = {
        //                     i:node.meshIndex,
        //                     b:[[node.box.min.x,node.box.min.y,node.box.min.z],[node.box.max.x,node.box.max.y,node.box.max.z]]
        //                 }
        //                 n1++
        //             }
        //
        // for(let i=0; i<node_list2.length; i++)
        //     for(let j=0; j<node_list2[i].length; j++)
        //         for(let k=0; k<node_list2[i][j].length; k++)
        //             if(node_list2[i][j][k].meshIndex.length){
        //                 let node = node_list2[i][j][k]
        //                 result["2"][n2] = {
        //                     i:node.meshIndex,
        //                     b:[[node.box.min.x,node.box.min.y,node.box.min.z],[node.box.max.x,node.box.max.y,node.box.max.z]]
        //                 }
        //                 n2++
        //             }
        //
        // for(let i=0; i<node_list3.length; i++)
        //     for(let j=0; j<node_list3[i].length; j++)
        //         for(let k=0; k<node_list3[i][j].length; k++)
        //             if(node_list3[i][j][k].meshIndex.length){
        //                 let node = node_list3[i][j][k]
        //                 result["3"][n3] = {
        //                     i:node.meshIndex,
        //                     b:[[node.box.min.x,node.box.min.y,node.box.min.z],[node.box.max.x,node.box.max.y,node.box.max.z]]
        //                 }
        //                 n3++
        //             }

        console.log(n1,n2,n3)
        console.log(result)
        download(result,"sceneGraph.json")
    }
    treeInfo(){
        ergodicTree(this.root)
        // var keys = Object.keys(treeInfo)
        // console.log(keys)
        // console.log(treeInfo)
        var index = 0
        var new_treeInfo = {}
        for(let key in treeInfo){
            new_treeInfo[index] = treeInfo[key]
            index++
        }

        download(new_treeInfo,"treeInfo.json")
        this.pack_group(new_treeInfo)

        // for(var key in treeInfo){
        //     var box = treeInfo[key].box
        //     window.scene.add(new Box3Helper(new Box3(
        //         new Vector3(box[0][0],box[0][1],box[0][2]),
        //         new Vector3(box[1][0],box[1][1],box[1][2])
        //     )))
        // }
    }
    pack_group(tree_info){
        var self = this
        var i = 0
        var keys = Object.keys(tree_info)
        console.log("tree keys:",keys.length)
        var pack_group = setInterval(function(){
            var meshIndexList = tree_info[keys[i]].mI
            var mat = {}
            var occ = {index:[],list:[]}
            var group = new Group()
            for(let j=0; j<meshIndexList.length; j++){
                mat[meshIndexList[j]] = self.matrixList[meshIndexList[j]]
                occ.index.push(meshIndexList[j])
                occ.list.push(self.occluderList[meshIndexList[j]])
                group.add(self.meshList[meshIndexList[j]].clone())
            }
            downloadPack(i,mat,occ,group)
            if(++i===keys.length){
                console.log("pack over")
                clearInterval(pack_group)
            }else if(i%10===0){
                console.log("export "+i+"/"+keys.length)
            }
        },600)
    }
    exportGLTF(){
        var export_start = 0
        var list = this.second_level_list
        var export_end = list.length
        var self = this
        var index = export_start
        var exporting = setInterval(function(){
            let scene = new Scene()
            let group = new Group()
            let object = self.meshList[Number(list[index])].clone()
            group.add(object)
            scene.add(group)
            let fileName = "model"+list[index]+".gltf"
            new GLTFExporter().parse(scene,function(result){
                let myBlob = new Blob([JSON.stringify(result)],{type:'text/plain'})
                let link = document.createElement('a')
                link.href = URL.createObjectURL(myBlob)
                link.download = fileName
                link.click()
            })
            if(++index===export_end){
                clearInterval(exporting)
                console.log("export end")
            }
        },200)
    }
    exportOBJ(){
        var export_start = 0
        var export_end = 200000
        var self = this
        var index = export_start
        var exporting = setInterval(function(){
            let group = new Group()
            let object = self.meshList[index].clone()
            group.add(object)
            let fileName = "model"+index+".obj"
            let result = new OBJExporter().parse(group)
            let blob = new Blob([result])
            let link = document.createElement('a');
            link.href = URL.createObjectURL(blob)
            link.download = fileName
            link.click()
            if(++index===export_end){
                clearInterval(exporting)
                console.log("export end")
            }
        },200)
    }
    exportSubModel(range){
        var group = new Group()
        var matrix = {}
        for(let i=0; i<instanceBoxList.length; i++){
            for(let j=0; j<instanceBoxList[i].length; j++){
                let box = instanceBoxList[i][j]
                if(range.min.x<box.min.x && range.max.x>box.max.x && range.min.z<box.min.z && range.max.z>box.max.z){
                    group.add(this.meshList[i].clone())
                    let mat = this.matrixList[i].it
                    mat.splice(mat.length-1,1)
                    matrix[i] = mat
                    break
                }
            }
        }
        var scene = new Scene()
        scene.add(group)
        let fileName = "model.gltf"
        new GLTFExporter().parse(scene,function(result){
            let myBlob = new Blob([JSON.stringify(result)],{type:'text/plain'})
            let link = document.createElement('a')
            link.href = URL.createObjectURL(myBlob)
            link.download = fileName
            link.click()
            download(matrix,"matrix.json")
        })
    }
    simplifiedOBJ2GLTF(index,list){
        if(index>=list.length) return
        var self = this
        // console.log(index)
        new FileLoader().load("./assets/simplified/model-sim"+list[index]+".obj",(text)=>{
            let line_text = text.split('\n')
            let positions = []
            let indices = []
            let first_char = line_text[0][0]
            if(first_char!=="#"){
                self.simplifiedOBJ2GLTF(index+1,list)
                return
            }
            for(let i=1; i<line_text.length; i++){
                line_text[i] = line_text[i].split(' ')
                if(line_text[i][0]==='v'){
                    positions.push(parseFloat(line_text[i][1]),parseFloat(line_text[i][2]),parseFloat(line_text[i][3]))
                }else if(line_text[i][0]==='f'){
                    indices.push(parseInt(line_text[i][1])-1,parseInt(line_text[i][2])-1,parseInt(line_text[i][3])-1)
                }
            }
            // console.log(position)
            // console.log(index)
            let geometry = new BufferGeometryEx()
            geometry.setAttribute("position",new BufferAttribute(new Float32Array(positions),3))
            geometry.setIndex(new BufferAttribute(new Uint16Array(indices),1))
            // let object = new MeshEx(geometry,self.meshList[index].material)
            let object = self.meshList[list[index]].clone()
            object.geometry = geometry
            let scene = new Scene()
            let group = new Group()
            group.add(object)
            scene.add(group)
            // console.log(self.meshList[index])
            // console.log(object)
            let fileName = "model-sim"+list[index]+".gltf"
            new GLTFExporter().parse([scene],function(result){
                let myBlob = new Blob([result],{type:'application/octet-stream'})
                let link = document.createElement('a')
                link.href = URL.createObjectURL(myBlob)
                link.download = fileName
                link.click()
                self.simplifiedOBJ2GLTF(index+1,list)
            },{binary:true})
        },()=>{},(err)=>{
            self.simplifiedOBJ2GLTF(index+1,list)
        })
    }
    exportDataVolume(index,DataVolume){
        if(index===this.meshList.length){
            console.log("over")
            download(DataVolume,"dataVolume.json")
            return
        }
        var scene = new Scene()
        scene.add(this.meshList[index].clone())
        var self = this
        new GLTFExporter().parse(scene,function(result){
            let myBlob = new Blob([JSON.stringify(result)], { type: 'text/plain' })
            DataVolume.push(myBlob.size)
            self.exportDataVolume(index+1,DataVolume)
        })
    }
    loadOccluders(index,occlusionList){
        if(index===this.units.length){
            console.log("over")
            download(occlusionList,"occlusion.json")
            return
        }else console.log(index+"/"+this.units.length)
        var self = this
        new FileLoader().load("assets/occluders/occluder"+self.units[index]+".json", (json)=>{
            let occluder_json = JSON.parse(json)
            let index_list = occluder_json.index
            let occluder_list = occluder_json.list
            for(let i=0; i<index_list.length; i++){
                let x_list = occluder_list[i].x
                let y_list = occluder_list[i].y
                let z_list = occluder_list[i].z
                let x_point = []
                for(let x=0; x<x_list.p.length; x+=2){
                    let x_vec = new Vector3(x_list.c,x_list.p[x],x_list.p[x+1])
                    x_point.push(x_vec.clone())
                }
                let y_point = []
                for(let y=0; y<y_list.p.length; y+=2){
                    let y_vec = new Vector3(y_list.p[y],y_list.c,y_list.p[y+1])
                    y_point.push(y_vec.clone())
                }
                let z_point = []
                for(let z=0; z<z_list.p.length; z+=2){
                    let z_vec = new Vector3(z_list.p[z],z_list.p[z+1],z_list.c)
                    z_point.push(z_vec.clone())
                }
                let occluder = {
                    x:{position:x_point,index:x_list.i},
                    y:{position:y_point,index:y_list.i},
                    z:{position:z_point,index:z_list.i}}
                // console.log(index_list[i])
                let area = 0
                for(let j=0; j<Object.keys(occluder).length; j++){
                    let positions = occluder[Object.keys(occluder)[j]].position
                    let indices = occluder[Object.keys(occluder)[j]].index
                    for(let k=0; k<indices.length; k+=3){
                        let triangle = new Triangle(positions[indices[k]],positions[indices[k+1]],positions[indices[k+2]])
                        area += triangle.getArea()
                    }
                }
                // console.log(area)
                occlusionList[index_list[i]] = area
            }
            self.loadOccluders(index+1,occlusionList)
        })
    }
    judgeNeighbor(sceneGraph){
        let thirdUnitCount = 0;
        for(let s=0; s<sceneGraph.length; s++){
            let subregion = sceneGraph[s];
            for(let i=0; i<subregion.children.length; i++){
                let firstUnit = subregion.children[i];
                for(let j=0; j<firstUnit.children.length; j++){
                    let secondUnit = firstUnit.children[j];
                    for(let k=0; k<secondUnit.children.length; k++){
                        let thirdUnit = secondUnit.children[k];
                        thirdUnitCount++;
                        if(thirdUnitCount<7705) continue;
                        // console.log(thirdUnit.meshIndex.length);
                        let meshIndex = firstUnit.meshIndex.concat(secondUnit.meshIndex.concat(thirdUnit.meshIndex));
                        // console.log(meshIndex.length)
                        for(let i1 = 0; i1<meshIndex.length-1; i1++){
                            for(let i2 = i1; i2<meshIndex.length; i2++){
                                let index1 = meshIndex[i1];
                                let index2 = meshIndex[i2];
                                if(index1>index2){
                                    [index1,index2] = [index2,index1];
                                }
                                let connectedList = treeInfo[index1];
                                if(Array.isArray(treeInfo[index1]) && connectedList.includes(index2)){
                                    continue;
                                }
                                let instanced_box1 = instanceBoxList[index1];
                                let instanced_box2 = instanceBoxList[index2];
                                if(judgeConnect(instanced_box1,instanced_box2)){
                                    if(Array.isArray(treeInfo[index1])){
                                        treeInfo[index1].push(index2);
                                    }else{
                                        treeInfo[index1] = [index2];
                                    }
                                }
                            }
                        }
                        console.log(thirdUnitCount);
                        download(treeInfo, "neighborInfo"+thirdUnitCount.toString()+".json");
                        // console.log(thirdUnitCount.toString()+"/"+sceneGraph.length.toString());
                        treeInfo = {};
                        // console.log(treeInfo)
                        // return;
                    }
                }
            }

        }

    }
    loadNeighbor(index){
        if(index === 9461){
            download(treeInfo, "neighborInfo.json");
            return;
        }
        var self = this;
        new FileLoader().load("assets/huayi-neighbor/neighborInfo"+index.toString()+".json", (json)=>{
            let neighborInfo = JSON.parse(json);
            // console.log(neighborInfo);
            let keyList = Object.keys(neighborInfo);
            for(let i=0; i<keyList.length; i++){
                let key = keyList[i];
                let neighborList = neighborInfo[key];
                // console.log(key, neighborList);
                for(let j=0; j<neighborList.length; j++){
                    let neighbor = neighborList[j];
                    if(neighbor === Number(key)){
                        continue;
                    }
                    if(Array.isArray(treeInfo[key])){
                        insertIntoSortedArray(treeInfo[key], neighbor);
                    }else{
                        treeInfo[key] = [neighbor];
                    }
                }
            }
            console.log(index);
            // console.log(treeInfo);
            self.loadNeighbor(index+1);
        });
    }
}

class Node{
    constructor(id,min,max){
        this.id = id
        this.meshIndex = []
        this.meshMatrices = []
        this.children = []
        this.box = new Box3(min,max)
        this.center = new Vector3((min.x+max.x)/2,(min.y+max.y)/2,(min.z+max.z)/2)
        this.radius = max.clone().sub(min).length()/2
        this.leftNode = null
        this.rightNode = null
    }
    addData(index){
        this.meshIndex.push(index)
    }
    splitNode(){
        for(let i=max_size; i<this.meshIndex.length; i++){
            var instanceBox = instanceBoxList[this.meshIndex[i]]
            var leftBox = getSubBox(this.box,0)
            var rightBox = getSubBox(this.box,1)
            var leftIntersect = getSize(instanceBox.clone().intersect(leftBox))
            var rightIntersect = getSize(instanceBox.clone().intersect(rightBox))
            var leftIntersectV = leftIntersect.x*leftIntersect.y*leftIntersect.z
            var rightIntersectV = rightIntersect.x*rightIntersect.y*rightIntersect.z
            if(leftIntersectV>rightIntersectV){
                if(!this.leftNode) this.createLeftNode(leftBox)
                this.leftNode.addData(this.meshIndex[i])
            }else if(leftIntersectV<rightIntersectV){
                if(!this.rightNode) this.createRightNode(rightBox)
                this.rightNode.addData(this.meshIndex[i])
            }else{
                if(Math.random()<0.5){
                    if(!this.leftNode) this.createLeftNode(leftBox)
                    this.leftNode.addData(this.meshIndex[i])
                }else{
                    if(!this.rightNode) this.createRightNode(rightBox)
                    this.rightNode.addData(this.meshIndex[i])
                }
            }
        }
        this.meshIndex.splice(max_size)
        if(this.leftNode) this.leftNode.matchBox()
        if(this.rightNode) this.rightNode.matchBox()
    }
    fillJudge(){
        return this.meshIndex.length>max_size
    }
    createLeftNode(box){
        this.leftNode = new Node(this.id*2,box.min,box.max)
    }
    createRightNode(box){
        this.rightNode = new Node(this.id*2+1,box.min,box.max)
    }
    matchBox(){
        // console.log(this.id,this.meshIndex.length)
        var boxes = []
        for(let i=0; i<this.meshIndex.length; i++)
            boxes.push(instanceBoxList[this.meshIndex[i]])
        this.box = getBoundingBox(boxes)
        if(this.fillJudge())
            this.splitNode()
    }
    containPoint(pos){
        return this.box.containsPoint(pos)
    }
    transformResult(){
        let result = {
            meshIndex:this.meshIndex,
            nodeBox:[[this.box.min.x,this.box.min.y,this.box.min.z],[this.box.max.x,this.box.max.y,this.box.max.z]],
            children:[]
        }
        for(let i=0; i<this.children.length; i++)
            result.children.push(this.children[i].transformResult())

        return result
    }
}

function getSize(box){
    return {
        x:box.max.x-box.min.x,
        y:box.max.y-box.min.y,
        z:box.max.z-box.min.z
    }
}

function getSubBox(box,LR){
    var boxAxis = getSize(box)
    var center = new Vector3((box.min.x+box.max.x)/2,(box.min.y+box.max.y)/2,(box.min.z+box.max.z)/2)
    if(!LR){//0-left
        if(boxAxis.x>=boxAxis.y && boxAxis.x>=boxAxis.z){//x最长
            return new Box3(box.min,new Vector3(center.x,box.max.y,box.max.z))
        }else if(boxAxis.y>=boxAxis.x && boxAxis.y>=boxAxis.z){//y最长
            return new Box3(box.min,new Vector3(box.max.x,center.y,box.max.z))
        }else{//z最长
            return new Box3(box.min,new Vector3(box.max.x,box.max.y,center.z))
        }
    }else{//1-right
        if(boxAxis.x>=boxAxis.y && boxAxis.x>=boxAxis.z){//x最长
            return new Box3(new Vector3(center.x,box.min.y,box.min.z),box.max)
        }else if(boxAxis.y>=boxAxis.x && boxAxis.y>=boxAxis.z){//y最长
            return new Box3(new Vector3(box.min.x,center.y,box.min.z),box.max)
        }else{//z最长
            return new Box3(new Vector3(box.min.x,box.min.y,center.z),box.max)
        }
    }
}

function getBoundingBox(boxes){
    var boundingBox = boxes[0].clone()
    for(let i=1; i<boxes.length; i++){
        boundingBox.min.min(boxes[i].min)
        boundingBox.max.max(boxes[i].max)
    }
    return boundingBox
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

function insertIntoSortedArray(arr, num) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (arr[mid] === num) {
            // arr.splice(mid, 0, num); // 如果找到相等的值，在该位置插入
            return arr;
        } else if (arr[mid] < num) {
            left = mid + 1; // 目标值在右半部分
        } else {
            right = mid - 1; // 目标值在左半部分
        }
    }

    // 如果未找到相等的值，插入到合适的位置
    arr.splice(left, 0, num);
    return arr;
}

function computeSE(min,max,scene_min,scene_length,times){
    var start = Math.max(Math.floor((min-scene_min)/scene_length),0)
    var end = Math.min(Math.ceil((max-scene_min)/scene_length),times)
    return [start,end]
}

function ergodicTree(node){
    treeInfo[node.id] = {
        mI:node.meshIndex,
        box:[[node.box.min.x,node.box.min.y,node.box.min.z],[node.box.max.x,node.box.max.y,node.box.max.z]]
    }
    if(node.leftNode) ergodicTree(node.leftNode)
    if(node.rightNode) ergodicTree(node.rightNode)
}

function download(data,name){
    var myBlob=new Blob([JSON.stringify(data)], { type: 'text/plain' })
    let link = document.createElement('a')
    link.href = URL.createObjectURL(myBlob)
    link.download = name
    link.click()
}

function downloadPack(index,mat,occ,group){
    var file_index = index.toString()

    setTimeout(function(){
        download(mat,"matrix"+file_index+".json")
    },0)
    setTimeout(function(){
        download(occ,"occluder"+file_index+".json")
    },100)
    setTimeout(function(){
        var scene = new Scene()
        scene.add(group)
        var fileName = "model"+file_index+".gltf"
        new GLTFExporter().parse(scene,function(result){
            var myBlob=new Blob([JSON.stringify(result)], { type: 'text/plain' })
            let link = document.createElement('a')
            link.href = URL.createObjectURL(myBlob)
            link.download = fileName
            link.click()
        })
    },300)
}

function readList(index,occ_list,matrices) {
    var x_list = occ_list.x
    var y_list = occ_list.y
    var z_list = occ_list.z
    var x_point = []
    for (let x = 0; x < x_list.p.length; x += 2) {
        var x_vec = new Vector3(x_list.c, x_list.p[x], x_list.p[x + 1])
        x_point.push(x_vec.clone())
    }
    var y_point = []
    for (let y = 0; y < y_list.p.length; y += 2) {
        var y_vec = new Vector3(y_list.p[y], y_list.c, y_list.p[y + 1])
        y_point.push(y_vec.clone())
    }
    var z_point = []
    for (let z = 0; z < z_list.p.length; z += 2) {
        var z_vec = new Vector3(z_list.p[z], z_list.p[z + 1], z_list.c)
        z_point.push(z_vec.clone())
    }
    var occluder = {
        x: {position: x_point, index: x_list.i},
        y: {position: y_point, index: y_list.i},
        z: {position: z_point, index: z_list.i},
        c: occ_list.c
    }
    return instanceOccluder(occluder, matrices)
}

function instanceOccluder(occluder,matrix){
    var axis = ['x','y','z']
    var new_position = []
    var new_index = []
    for(let a=0; a<axis.length; a++){
        var index = occluder[axis[a]].index
        var length = new_position.length/3
        for(let i=0; i<index.length; i++)
            new_index.push(index[i]+length)
        var position = occluder[axis[a]].position
        for(let p=0; p<position.length; p++){
            new_position.push(position[p].x)
            new_position.push(position[p].y)
            new_position.push(position[p].z)
        }
    }
    var bufGeo = new BufferGeometryEx()
    new_position = new Float32Array(new_position)
    new_index = new Uint16Array(new_index)
    var attribute1 = new BufferAttribute(new_position,3)
    var attribute2 = new BufferAttribute(new_index,1)
    bufGeo.attributes.position = attribute1
    bufGeo.index = attribute2
    // bufGeo.computeFaceNormals()
    bufGeo.computeVertexNormals()
    // console.log(bufGeo)
    var mesh = new Mesh(bufGeo,new MeshStandardMaterial({color:new Color(occluder.c[0],occluder.c[1],occluder.c[2]),side:2}))

    var instancedMesh = new InstancedMeshEx(mesh.geometry, [mesh.material.clone()], 1, [matrix.length], false)
    instancedMesh.geometry.clearGroups()
    instancedMesh.geometry.addGroupInstanced(0, bufGeo.index.array.length, 0, 0, false)
    for(let i=0; i<matrix.length; i++){
        var mat = matrix[i]
        var instanceMatrix = new Matrix4().set(
            mat[0], mat[1], mat[2], mat[3],
            mat[4], mat[5], mat[6], mat[7],
            mat[8], mat[9], mat[10], mat[11],
            0, 0, 0, 1)
        instancedMesh.setInstanceMatrixAt(0, i, instanceMatrix)
    }
    return instancedMesh
}

function judgeConnect(instanced_box1, instanced_box2){
    for(let i=0; i<instanced_box1.length; i++){
        let box1 = instanced_box1[i];
        for(let j=0; j<instanced_box2.length; j++){
            let box2 = instanced_box2[j];
            if(boxConnected(box1, box2)){
                return true;
            }
        }
    }
    return false;
}

function boxConnected(box1, box2){
    return !(box2.max.x < box1.min.x || box2.min.x > box1.max.x ||
        box2.max.y < box1.min.y || box2.min.y > box1.max.y ||
        box2.max.z < box1.min.z || box2.min.z > box1.max.z);
}
