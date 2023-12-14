import {
    InstancedMesh,
    Mesh,
    LoadingManager,
    Matrix4, 
    MeshBasicMaterial,
    Raycaster,Vector2,
    CylinderGeometry,
    Object3D,
    Group
} from "three";
import{Parameter}from"./Parameter"
const materialTest = new MeshBasicMaterial( {color: 0xff0000} ) 
// import{CoderDecoder1}from"./CoderDecoder1"
export class CoderDecoder{
    constructor(){}
    static encoder(matrixList_,param){
        return CoderDecoder.encoder12(matrixList_,param)
    }
    static decoder(list2){
        return CoderDecoder.decoder12(list2)
    }
    static encoder12(matrixList_,param){
        const list16=CoderDecoder.encoder16(matrixList_,param)
        const list12=[]
        for(let i=0;i<list16.length;i++){
            const e=list16[i]
            list12.push([
                e[ 0],e[ 1],e[ 2],//0,//e[ 3],
                e[ 4],e[ 5],e[ 6],//0,//e[ 7],
                e[ 8],e[ 9],e[10],//0,//e[11],
                e[12],e[13],e[14],//1,//e[15],
            ])
        }
        return list12
    }
    static decoder12(list2){
        const geometry = new CylinderGeometry( 1, 1, 2, 4 )
        const mesh = new InstancedMesh( geometry, materialTest ,list2.length);
        for(let i=0;i<list2.length;i++){
            const e=list2[i]
            const matrix = new Matrix4(); 
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
    static encoder16(matrixList_,param){
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
        
        const obj_matrix=CoderDecoder.paramToMat(param)

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
            matrix.multiply (obj_matrix)
            const e=matrix.elements
            // list2.push(matrix.elements)
            list2.push([
                e[ 0],e[ 1],e[ 2],0,//e[ 3],
                e[ 4],e[ 5],e[ 6],0,//e[ 7],
                e[ 8],e[ 9],e[10],0,//e[11],
                e[12],e[13],e[14],1,//e[15],
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
        matrix0.multiply (obj_matrix)
        // return matrix0//const matrix0=encoderMat(matrixList_,param)
        const e=matrix0.elements
        // list2.push(matrix0.elements)
        list2.push([
            e[ 0],e[ 1],e[ 2],0,//e[ 3],
            e[ 4],e[ 5],e[ 6],0,//e[ 7],
            e[ 8],e[ 9],e[10],0,//e[11],
            e[12],e[13],e[14],1,//e[15],
        ])
        return list2
    }
    static decoder16(list2){
        const geometry = new CylinderGeometry( 1, 1, 2, 4 )
        const mesh = new InstancedMesh( geometry, materialTest ,list2.length);
        for(let i=0;i<list2.length;i++){
            const e=list2[i]
            const matrix = new Matrix4(); 
            matrix.set(
                e[ 0],e[ 1],e[ 2],e[ 3],
                e[ 4],e[ 5],e[ 6],e[ 7],
                e[ 8],e[ 9],e[10],e[11],
                e[12],e[13],e[14],e[15],
            )
            // matrix.set(
            //     e[ 0],e[ 1],e[ 2],0,//e[ 3],
            //     e[ 3],e[ 4],e[ 5],0,//e[ 7],
            //     e[ 6],e[ 7],e[ 8],0,//e[11],
            //     e[ 9],e[10],e[11],1//e[15],
            //  )
            matrix.transpose ()
            mesh.setMatrixAt(i,matrix)
        }
        return mesh
    }
    static paramToMat(param){
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
        return obj.matrix
    }
    static encoderParam(matrixList_,param){
        const listParam=[]
        const list=CoderDecoder.encoder16(matrixList_,param)
        // console.log(param.pos,"param2")
        for(let i=0;i<list.length;i++){
            const geometry = new CylinderGeometry( 1, 1, 2, 4 )
            const mesh = new Mesh( geometry, materialTest);
            const m=list[i]
            const array=mesh.geometry.attributes.position.array
            for(let j=0;j<array.length/3;j++){
                let x=array[3*j+0]
                let y=array[3*j+1]
                let z=array[3*j+2]
                // console.log(x,y,z,m)
                for(let k=0;k<3;k++)
                    array[3*j+k]=m[4*0+k]*x+m[4*1+k]*y+m[4*2+k]*z+m[4*3+k]
            }
            // console.log(array)
            // CoderDecoder.encoder16(matrixList_,param)
            let code=new Parameter(mesh,param.type).param
            // if(code.type=="cylinder")
            {
                code={
                    pos:code.pos,
                    direction:code.direction,
                    h_half:code.h_half,
                    r:code.r,
                }
            }
            // console.log("code",code)
            listParam.push(code)
        }
        // console.log(param,listParam[0])
        return listParam
    }
    static decoderParam(listParam){
        const group=new Group()
        for(let d=0;d<listParam.length;d++){
            const param=listParam[d]
            const geometry = new CylinderGeometry( 1, 1, 2, 4 )
            const mesh = new Mesh( geometry, materialTest);
            const matrix=CoderDecoder.paramToMat(param)//.elements
            mesh.applyMatrix4(matrix)
            group.add(mesh)
        }
        return group
        //geometry.attributes.position.array
    }
}

