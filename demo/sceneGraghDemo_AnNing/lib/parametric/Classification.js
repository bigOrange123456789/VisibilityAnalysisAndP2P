import {Parameter}from"./Parameter"
import {CoderDecoder}from"./CoderDecoder"

import {PCA}from"./PCA"
import numeric from 'numeric'
window.numeric=numeric

window.CylinderParam={}
window.downloadJson=()=>{
    // const str=JSON.stringify(window.CylinderParam , null, "\t")
    const str=JSON.stringify(window.CylinderParam)
    var link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(new Blob([str], { type: 'text/plain' }));
    link.download ="CylinderParam"+window.iii+".json";
    link.click();
}
export class Classification{
    constructor(mesh, matrixList){//(x,y,z)、方向(012)、h/2、r
        
        this.mesh=mesh
        this.matrixList=matrixList
        // this.pca=
            // new PCA(mesh)
        this._init()
        const type=this._judge()
        this.getParam(type)  
    }
    getParam(type){
        this.param=new Parameter(this.mesh,type).param
        if(this.param.type=='else')return
        // console.log("this.param",this.param)
        const code=new CoderDecoder.encoder(this.matrixList,this.param)
        window.CylinderParam[this.mesh.name]=code
        this.mesh2=new CoderDecoder.decoder(code)//mesh
    }

    _init(){
        const mesh=this.mesh
        const geometry=mesh.geometry
        geometry.computeVertexNormals()
        geometry.computeBoundingBox()
        const pos   =geometry.attributes.position.array//PCA
        const count =geometry.attributes.position.count

        const box_max=[
            -999999,-999999,-999999,
        ]
        const box_min=[
            999999,999999,999999,
        ]
        for(let i=0;i<count;i++){
            let position=[
                pos[i*3+0],
                pos[i*3+1],
                pos[i*3+2]
            ]
            for(let j=0;j<3;j++){
                if(box_max[j]<position[j])
                    box_max[j]=position[j]
                if(box_min[j]>position[j])
                    box_min[j]=position[j]
            }
        }
        const scale={
            x:(box_max[0]-box_min[0])/2,
            y:(box_max[1]-box_min[1])/2,
            z:(box_max[2]-box_min[2])/2,
        }
        this.scale=[scale.x,scale.y,scale.z]
        if(scale.x==0)scale.x=1
        if(scale.y==0)scale.y=1
        if(scale.z==0)scale.z=1
        // if(scale.x==0||scale.y==0||scale.z==0)alert("圆柱检测异常")
        const center={
            x:(box_max[0]+box_min[0])/2,
            y:(box_max[1]+box_min[1])/2,
            z:(box_max[2]+box_min[2])/2,
        }
        
        this.positions=[]
        for(let i=0;i<count;i++){
            let x=pos[i*3+0]
            let y=pos[i*3+1]
            let z=pos[i*3+2]
            this.positions.push([
                (x-center.x)/scale.x,//[-1,1]
                (y-center.y)/scale.y,
                (z-center.z)/scale.z
            ])
        }
    }

    _atCube(){
        // console.log("positions",this.positions)
        let distanceX=0
        let distanceY=0
        let distanceZ=0
        for(let i=0;i<this.positions.length;i++){
            let x=this.positions[i][0]
            let y=this.positions[i][1]
            let z=this.positions[i][2]
            let xd=Math.min(Math.abs(1-x),Math.abs(-1-x))
            let yd=Math.min(Math.abs(1-y),Math.abs(-1-y))
            let zd=Math.min(Math.abs(1-z),Math.abs(-1-z))
            if(this.scale[0]==0)xd=0;
            if(this.scale[1]==0)yd=0;
            if(this.scale[2]==0)zd=0;
            distanceX+=xd
            distanceY+=yd
            distanceZ+=zd
        }
        return [
            distanceX/this.positions.length,
            distanceY/this.positions.length,
            distanceZ/this.positions.length
        ]
    }

    _getRadius(){
        let radius=0
        for(let i=0;i<this.positions.length;i++){
            let x=this.positions[i][0]
            let y=this.positions[i][1]
            let z=this.positions[i][2]
            radius+=Math.pow(
              Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2),
              0.5  
            );
        }
        // this.axis=//判断出来轴的方向
        radius/=this.positions.length
        this.radius=radius
        return radius
    }
    _atSphere(){
        const radius=this._getRadius()
        let errorSum=0
        for(let i=0;i<this.positions.length;i++){
            let x=this.positions[i][0]
            let y=this.positions[i][1]
            let z=this.positions[i][2]
            const radius0=Math.pow(
              Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2),
              0.5  
            );
            errorSum+=Math.abs(radius-radius0)
            // console.log(
            //     // x,y,z
            //     radius,
            //     radius0,
            //     Math.abs(radius-radius0),
            // )
        }
        // console.log(errorSum/this.positions.length,"radius:",radius)
        const errorSumPercentage=(errorSum/this.positions.length)/radius
        return errorSumPercentage
        const flag=errorSumPercentage<this.threshold2
        // console.log(errorSumPercentage<this.threshold2,errorSumPercentage,this.threshold2)
        return flag
    }

    threshold1=0.2
    threshold2=1.8/100//4//4//0.2
    _judge(){
        if(this.positions.length<=0){
            return 'else'
        }

        const disCube=this._atCube()
        const atCube3=
            (disCube[0]+disCube[1]+disCube[2])/3<this.threshold1
        const atCube1=
            Math.min(disCube[0],disCube[1],disCube[2])<this.threshold1
        const atSphere=this._atSphere()<this.threshold2
        
        if(atCube3&&atSphere)return'cube'
        else if(atCube1&&atSphere)return'cylinder'
        else return'else'
    }
}
//无法处理的构件：700
//典范构件:740
//需要PCA对齐的构件：3074