import * as THREE from "three"
import { Engine3D } from './main.js'
export class Building{
    test(){
        this.load_new(0)
    }
    showPos(m){
                    m.geometry.computeVertexNormals()
                    m.geometry.computeBoundingBox()
                    const pos=m.geometry.attributes.position.array
                    console.log(123)
                    const normal=m.geometry.attributes.normal.array
                    for(var i=0;i<pos.length/3;i++){
                        const cube = new THREE.Mesh( 
                            new THREE.BoxGeometry( 0.1, 0.1, 0.1 ), 
                            new THREE.MeshBasicMaterial( {color: 0x00ffff} )
                        );
                        // cube.scale.set(0.1,0.1,0.1)

                        cube.position.set(
                            pos[3*i+0],
                            pos[3*i+1],
                            pos[3*i+2],
                        )
                        const n=[
                            normal[3*i+0],
                            normal[3*i+1],
                            normal[3*i+2]
                        ]
                        // if(n[0]!=0&&n[1]!=0&&n[2]!=0)
                        this.parentGroup.add(cube)
                    }
    }
    load_new(index){
        // this.path='../../dist/assets/models/huayi/'
        this.path='./assets/models/'
        // const path=this.path+"huayi/task-huayi-ecs_output"+index+".gltf"
        const path="./assets/models/home.glb"
        const self=this
        const loader = 
            new Engine3D.Loader.GLTFLoader();//new Engine3D.Loader(self.config.path,self.config.crossOriginSocket,true)
        console.log("path",path)
        loader.load(path, function (gltf) {
            console.log(gltf,"gltf")
            // return
            // return
            gltf.scene.traverse(m=>{
                if(m instanceof THREE.Mesh){//&&m.name=="Mesh_15"){//
                    // console.log(m.name,m.name.split("Cylinder").length)
                    var flag=(m.name.split("Cylinder").length<2)
                    var name=m.name
                    // m.visible=false
                    const classification=new Engine3D.Classification(m,[])
                    const code=classification.code                    
                    let o=new THREE.Mesh(
                        m.geometry,
                        //new THREE.MeshDepthMaterial()
                        // new THREE.MeshStandardMaterial()
                        m.material
                        // new THREE.LineBasicMaterial( {
                        //     color: 0xffffff,
                        //     linewidth: 1,
                        //     linecap: 'round', //ignored by WebGLRenderer
                        //     linejoin:  'round' //ignored by WebGLRenderer
                        // } )
                        // new THREE.MeshLambertMaterial()
                    )
                    // o.material.wireframe  = true;
                    if(code){
                        o=classification.mesh2
                        // o.visible=false
                    }else{
                        // o.visible=false
                    }
                    o.position.set(
                        m.position.x,
                        m.position.y,
                        m.position.z
                    )
                    o.rotation.set(
                        m.rotation.x,
                        m.rotation.y,
                        m.rotation.z
                    )
                    o.scale.set(
                        m.scale.x,
                        m.scale.y,
                        m.scale.z
                    )
                    //m.parent.add(o)
                    o.material.color.r=0
                    if(code){
                        // console.log(code.type,o)
                        // console.log(o.name,code.type)
                        //if(false)
                        if(code.type=="cube"){
                            // o.material.color.r=0
                            // o.material.color.g=1
                            // o.material.color.b=0


                            // o.material.color.r=1
                            // o.material.color.g=0
                            // o.material.color.b=0
                            // o.visible=false
                        }
                    //         self.paramCube[o.name]=code.matrix[0]
                        //if(false)
                        if(code.type=="cylinder"){
                            // if(flag)console.log(m.name)
                            //console.log(o,o.matrixWorld)
                            o.material.color.r=1
                            o.material.color.g=0
                            o.material.color.b=0
                            o.type=code.type
                            // o.visible=false
                        }
                        // o=new THREE.Mesh(
                        //     o.geometry,
                        //     new THREE.MeshDepthMaterial()
                        //     //new THREE.MeshStandardMaterial()
                        // )
                        // o.visible=false
                    //         self.paramCylinder[o.name]=code.matrix[0]
                    }else{
                        // if(false)
                        {
                            // o.material.color.r=1
                            // o.material.color.g=0
                            // o.material.color.b=0
                        }
                        
                        // o.visible=false
                    }
                    // console.log(o)
                    // self.parentGroup.add(o)
                    // self.showPos(o)
                    // if(flag)
                    self.parentGroup.add(o)
                    window.start001=()=>{
                        const data={
                            cylinder:[],
                            viewMatrix:         window.camera.matrixWorldInverse.elements,
                            projectionMatrix:   window.camera.projectionMatrix.elements,
                        }
                        const arr=self.parentGroup.children
                        for(let i=0;i<arr.length;i++){
                            const mesh=arr[i]
                            if(mesh.type=='cylinder'){
                                console.log(mesh.name,mesh.matrixWorld.elements)
                                data.cylinder.push(
                                    mesh.matrixWorld.elements
                                )
                            }
                        }

                        let str=JSON.stringify(data)
                        var link = document.createElement('a');
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.href = URL.createObjectURL(new Blob([str], { type: 'text/plain' }));
                        link.download ="mvp.json";
                        link.click();
                    }
                }
            })
            // self.parentGroup.add(gltf.scene)
            console.log(index)
            index++
            // if(index>=self.numPack)self.finish()
            // else self.load(index)
        }, undefined, function (error) {
            console.error(error);
        });
    }
    constructor(scene,camera,csm,cb,sampling){
        
        
        document.getElementById("LoadProgress").innerHTML=""
    

        this.parentGroup = new THREE.Group()
        
        this.test()

        scene.add(this.parentGroup)
        if(false){
            this.parentGroup.scale.set(0.01,0.01,0.01)
            camera.position.set(
                -10026.998046875,
                22722.0078125,
                25003,
            )
            camera.position.set(
                -100.26,
                227.22,
                250.03,
            )

            camera.position.set(-301.9959744700025,  247.22000000000003,  315.169907837892)
            camera.rotation.set(0.021169286259497242, -0.7316884518312282,  0.014144938796166663)
        }
        {
            this.parentGroup.scale.set(0.5,0.5,0.5)
            camera.position.set(-2.288170820022621,  -10,  577.4423653022196)
            camera.rotation.set(0.010765260187853488,  -0.005799514336699335,  0.00006243534264637412)
        }
        
    }
    loadJson(path,cb){
        console.log(path)
        var xhr = new XMLHttpRequest()
        xhr.open('GET', path, true)
        xhr.send()
        xhr.onreadystatechange = ()=> {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var json_data = JSON.parse(xhr.responseText)
                cb(json_data)
            }
        }
    }
}