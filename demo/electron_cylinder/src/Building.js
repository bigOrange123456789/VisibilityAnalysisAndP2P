import { Engine3D } from './main.js'
// import { Classification } from './parametric/Classification.js'
const { ipcRenderer } = require("electron");
export class Building{
    path='../../dist/assets/models/huayi/'
    constructor(){   
        this.paramCube={}
        this.paramCylinder={}
        this.numPack=920
        this.load(0)       
    }
    load(index){
        const path=this.path+"task-huayi-ecs_output"+index+".gltf"
        const self=this
        const loader = new Engine3D.GLTFLoader();
        loader.load(path, function (gltf) {
            console.log(gltf,"gltf")
            gltf.scene.traverse(o=>{
                if(o instanceof Engine3D.THREE.Mesh){
                    const code=new Engine3D.Classification(o,[]).code
                    if(code){
                        // console.log(o.name,code.type)
                        if(code.type=="cube")
                            self.paramCube[o.name]=code.matrix[0]
                        if(code.type=="cylinder")
                            self.paramCylinder[o.name]=code.matrix[0]
                    }
                }
            })
            console.log(index)
            index++
            if(index>=self.numPack)self.finish()
            else self.load(index)
        }, undefined, function (error) {
            console.error(error);
        });
    }
    finish(){
        this.save("cube",    this.paramCube)
        this.save("cylinder",this.paramCylinder)
        ipcRenderer.send('quit', "finish!");//异步
    }
    save(name,data){
        const fileData = JSON.stringify({
            name: name+".json",
            data: JSON.stringify(data),
        });
        ipcRenderer.send("downloadJSON", fileData);
    }

}