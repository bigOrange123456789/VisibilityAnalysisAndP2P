const t=+1.00*Math.PI
export class Map {
    #xMax=+80
    #xMin=-80
    #y   =49
    #zMax=45+25
    #zMin=-75
    #rowNum=32//5
    #colNum=24+5//5
    #voxelSize=5
    #destination=[19,28]//终点 r,c


    #gridWeightOrigin=[]
    #gridWeight=
            [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,20,19,19,19,19,19,19,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,20,19,18,18,18,18,18,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,17,19,18,17,17,17,17,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,16,16,0,0,16,16,16,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,15,15,0,0,15,15,15,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,14,0,14,14,14,0,0,0,0,0,0],[0,0,0,0,28,28,0,0,0,0,0,0,0,0,0,0,0,13,13,13,13,13,13,0,0,0,0,0,0],[0,0,0,0,27,27,0,0,0,0,0,0,0,0,0,0,0,13,12,12,12,12,12,0,0,0,0,0,0],[0,0,0,0,26,26,0,0,0,0,0,0,0,0,0,0,0,14,12,11,11,11,11,0,0,0,0,0,0],[0,0,0,0,25,25,0,0,0,0,0,0,0,0,0,0,0,13,13,11,10,10,10,0,0,0,0,0,0],[0,0,0,0,25,24,0,0,0,0,0,0,0,0,0,0,0,12,12,0,0,9,9,0,0,0,0,0,0],[0,0,0,0,25,24,23,22,21,20,19,18,17,16,15,14,0,12,11,0,0,8,0,0,5,4,3,3,3],[0,0,0,0,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,2],[0,0,0,0,25,24,0,0,0,0,0,0,0,0,0,0,13,12,11,10,0,0,7,6,5,4,3,2,1],[0,0,0,0,25,25,0,0,0,0,0,0,0,0,0,0,0,12,11,11,0,0,0,0,0,4,3,2,2],[0,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,12,12,12,12,13,14,0,0,4,3,3,3],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,13,0,0,13,14,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,14,14,0,0,14,14,15,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,15,15,15,15,15,15,15,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,16,16,16,16,16,16,16,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,17,17,17,17,17,17,17,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]

    constructor() {
        this.#rowNum=this.#gridWeight.length
        this.#colNum=this.#gridWeight[0].length
    }
    #nextIndexList=[
        [-1,+0,+1.00*Math.PI],
        [+0,-1,+0.50*Math.PI],
        [+1,+0,+0.00*Math.PI],
        [+0,+1,-0.50*Math.PI],
        [+1,-1,+0.25*Math.PI],
        [-1,+1,-0.75*Math.PI],
        // [-1,+0,t],
        // [+0,-1,t],
        // [+1,+0,t],
        // [+0,+1,t],
        // [+1,-1,t],
        // [-1,+1,t],
    ]
    updateWeight(){
        this.#gridWeight=[]
        for(let i=0;i<this.#gridWeightOrigin.length;i++){
            this.#gridWeight.push([])
            for(let j=0;j<this.#gridWeightOrigin[i].length;j++){
                this.#gridWeight[i].push(
                    this.#gridWeightOrigin[i][j]
                )
            }
        }
    }
    #nextstep(i,j){//pos是一个三维坐标，e是一个数值   
        if(i==this.#destination[0]&&j==this.#destination[j])return null  
        let directionNext=-1
        let weightMin = Infinity
        for(let direction=0;direction<this.#nextIndexList.length;direction++){
            const n=this.#nextIndexList[direction]
            const x2=i+n[0]
            const y2=j+n[1]
            if(
                0<x2&&x2<this.#rowNum&&
                0<y2&&y2<this.#colNum
            ){
                const w=this.#gridWeight[x2][y2]
                if(w!==0){
                    if(w<weightMin){
                        weightMin=w
                        directionNext=direction
                    }
                }
            }
        }
        // console.log(directionNext,"directionNext")
        if(directionNext==-1)return null
        else return directionNext
    }
    nextStatus(x,z){
        // if(Math.round(x/4)*4)
        // console.log(x,z)
        const i=this.#xz2ij(x,z)[0]
        const j=this.#xz2ij(x,z)[1]
        const last=[
            [15,70],
        ]
        for(let k=0;k<20;k++)last.push([19+4*k,69])

        if(i==19&&j==28){
            return {
                "pos":[15,70],//last[0],
                "rot":0
            }
        } 
        for(let k=0;k<last.length;k++)
            if(i==this.#xz2ij(last[k][0],last[k][1])[0]&&j==this.#xz2ij(last[k][0],last[k][1])[1])
                if(k==last.length-1){
                    // console.log("finish")
                    return null
                }else {
                    // console.log(k,[19+4*1,69],this.#xz2ij(19+4*1,69))//k=2
                    return {
                        "pos":last[k+1],
                        "rot":0
                    }
                }
        const directionNext=this.#nextstep(i,j)
        if(directionNext==null){
            //14.862568724779067, y: 47.99051400000003, z: 69.44020109461212
            //27.454177076573615, y: 47.726389632824954, z: 68.78004045295364
            //57.599010829233976, y: 31.194099128076676, z: 68.40629058084721
            //x++
            return null//运动结束（到达终点 或寻路出错）
        }
        const i2=i+this.#nextIndexList[directionNext][0]
        const j2=j+this.#nextIndexList[directionNext][1]
        // this.#gridWeight[i2][j2]=0
        return {
            "pos":this.#ij2xz(i2,j2),
            "rot":this.#nextIndexList[directionNext][2]
        }
    }
    #xz2ij(x,z){
        return [
            Math.round( (x-this.#xMin)/this.#voxelSize ),
            Math.round( (z-this.#zMin)/this.#voxelSize ),
        ]
    }
    #ij2xz(i,j){
        return[
            this.#xMin+(i+0.5*(Math.random()-0.5))*this.#voxelSize,
            this.#zMin+(j+0.5*(Math.random()-0.5))*this.#voxelSize
        ]
    }




}