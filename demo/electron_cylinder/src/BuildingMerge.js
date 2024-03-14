import { Engine3D } from './main.js'
// import { Classification } from './parametric/Classification.js'
const { ipcRenderer } = require("electron");
export class Building{
    path='../../dist/assets/models/'
    constructor(){   
        this.paramCube={}
        this.paramCylinder={}
        this.numPack=920
        const self=this
        this.loadInfo(()=>{
            self.load(0) 
        })
              
    }
    loadInfo(finish){//获取matrixList
        var self = this
        const FileLoader=Engine3D.THREE.FileLoader
        console.log("开始加载structdesc.json!")
        new FileLoader().load(self.path+"huayi_matrix/structdesc.json",(json1)=>{
            let struct_desc = JSON.parse(json1)
            console.log("开始加载smatrix.json!")
            new FileLoader().load(self.path+"huayi_matrix/smatrix.json",(json2)=>{
                let matrix_desc = JSON.parse(json2)
                let ind = 0
                self.matrixList=[]
                for(let i=0; i<struct_desc.length; i++)
                    for(let j=0; j<struct_desc[i].length; j++){
                        self.matrixList[ind++] = matrix_desc[struct_desc[i][j].n].it
                    }
                if(finish)finish()//self.loadUnit(0)
            })
        })
    }
    load(index){
        const path=this.path+"huayi/task-huayi-ecs_output"+index+".gltf"
        const self=this
        const loader = new Engine3D.GLTFLoader();
        loader.load(path, function (gltf) {
            console.log(gltf,"gltf")
            gltf.scene.traverse(o=>{
                if(o instanceof Engine3D.THREE.Mesh){
                    //// 开始获取矩阵 ////
                    const index = Number(o.name)
                    const mats = self.matrixList[index]
                    mats.push([1,0,0,0,0,1,0,0,0,0,1,0])
                    const instanceList = []
                    for(let j=0; j<mats.length; j++){
                        let mat = mats[j]
                        let instance_matrix = new Engine3D.THREE.Matrix4().set(
                            mat[0], mat[1], mat[2], mat[3],
                            mat[4], mat[5], mat[6], mat[7],
                            mat[8], mat[9], mat[10], mat[11],
                            0, 0, 0, 1)
                        instanceList.push(instance_matrix)
                    }
                    //// 完成获取矩阵 ////
                    const code=new Engine3D.Classification(o,instanceList).code
                    if(code){
                        // console.log(o.name,code.type)
                        const sim=code2sim(code)
                        if(code.type=="cube")
                            self.paramCube[o.name]=sim//code//.matrix[0]
                        if(code.type=="cylinder")
                            self.paramCylinder[o.name]=sim//code//.matrix[0]
                        function code2sim(code){
                            const sim=[
                                code.color[0],
                                code.color[1],
                                code.color[2]
                            ]
                            const ms=code.matrix
                            for(let i=0;i<ms.length;i++){
                                for(let j=0;j<ms[i].length;j++){
                                    let value=ms[i][j]
                                    if(Math.floor(value)!=value&&
                                    10*Math.floor(value)!=10*value&&
                                    100*Math.floor(value)!=100*value&&
                                    1000*Math.floor(value)!=1000*value
                                    ){
                                        value=parseFloat(value.toFixed(4))
                                    }
                                    sim.push(value)
                                }
                            }
                            return sim
                        }
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
        console.log("任务结束!")
        if(false)
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