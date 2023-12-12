import {
    InstancedMesh,
    LoadingManager,
    Matrix4, 
    MeshBasicMaterial,
    Raycaster,Vector2,
    CylinderGeometry,
    Object3D
} from "three";
const materialTest = new MeshBasicMaterial( {color: 0xff0000} ) 
// import{CoderDecoder1}from"./CoderDecoder1"
export class CoderDecoder{
    constructor(){}
    static encoder(matrixList_,param){
        function matrix2arr(list){
            const list2=[]
            for(let i=0;i<list.length-1;i++){
                const m=list[i]
                let a=[]
                a=m.elements
                list2.push(a)
            }
            return list2
        }

        const list2=[]
        const matrixList=matrix2arr(matrixList_)
        
        const obj=new Object3D()
        if(param.direction==0)
            obj.rotation.set(0,0,Math.PI/2) 
        else if(param.direction==1)
            obj.rotation.set(0,0,0)
        else
            obj.rotation.set(Math.PI/2,0,0) 
        obj.position.set(param.pos.x,param.pos.y,param.pos.z)
        obj.scale.set(param.r,param.h_half,param.r)
        obj.updateMatrix ()

        for(let i=0;i<matrixList.length;i++){
            const elements=matrixList[i]
            const matrix = new Matrix4(); 
            matrix.set(
                elements[0],
                elements[1],
                elements[2],
                elements[3],

                elements[4],
                elements[5],
                elements[6],
                elements[7],

                elements[8],
                elements[9],
                elements[10],
                elements[11],

                elements[12],
                elements[13],
                elements[14],
                elements[15],
             )
            matrix.transpose ()
            matrix.multiply (obj.matrix)
            const e=matrix.elements
            // list2.push(matrix.elements)
            list2.push([
                e[ 0],e[ 1],e[ 2],//0,//e[ 3],
                e[ 4],e[ 5],e[ 6],//0,//e[ 7],
                e[ 8],e[ 9],e[10],//0,//e[11],
                e[12],e[13],e[14],//1,//e[15],
            ])
            // console.log(matrix.elements)
        }
        const matrix0=new Matrix4(); 
        matrix0.set(
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        )
        matrix0.multiply (obj.matrix)
        const e=matrix0.elements
        // list2.push(matrix0.elements)
        list2.push([
            e[ 0],e[ 1],e[ 2],//0,//e[ 3],
            e[ 4],e[ 5],e[ 6],//0,//e[ 7],
            e[ 8],e[ 9],e[10],//0,//e[11],
            e[12],e[13],e[14],//1,//e[15],
        ])
        return list2
    }
    static decoder(list2){
        const geometry = new CylinderGeometry( 1, 1, 2, 4 )
        const mesh = new InstancedMesh( geometry, materialTest ,list2.length);
        for(let i=0;i<list2.length;i++){
            const e=list2[i]
            const matrix = new Matrix4(); 
            // matrix.set(
            //     e[ 0],e[ 1],e[ 2],e[ 3],
            //     e[ 4],e[ 5],e[ 6],e[ 7],
            //     e[ 8],e[ 9],e[10],e[11],
            //     e[12],e[13],e[14],e[15],
            // )
            matrix.set(
                e[ 0],e[ 1],e[ 2],0,//e[ 3],
                e[ 3],e[ 4],e[ 5],0,//e[ 7],
                e[ 6],e[ 7],e[ 8],0,//e[11],
                e[ 9],e[10],e[11],1//e[15],
             )
            matrix.transpose ()
            mesh.setMatrixAt(i,matrix)
        }
        return mesh
    }
}

// import CylinderParam0 from './json/CylinderParam0.json'
if(false){
    // var m=new CoderDecoder.decoder(CylinderParam0)
    var m=new CoderDecoder.decoder(Object.values(CylinderParam0))
}