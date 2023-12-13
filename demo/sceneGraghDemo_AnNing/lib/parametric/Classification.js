import {CoderDecoder}from"./CoderDecoder"
window.CylinderParam={}
export class Classification{
    param={
        pos:{x:null,y:null,z:null},
        direction:null,
        h_half:null,
        r:null
    }//x,y,z,forward,h/2,r
    isCylinder=false
    isCube=false
    constructor(mesh, matrixList){//(x,y,z)、方向(012)、h/2、r
        this.mesh=mesh
        this.matrixList=matrixList
        this._init()
        this._judgeCylinder()
        if(this.isCylinder)this.param=this.getParam()
        if(this.isCylinder)this.test()
    }
    test(){
        this._parse()
    }
    _init(){
        const mesh=this.mesh
        const geometry=mesh.geometry
        geometry.computeVertexNormals()
        geometry.computeBoundingBox()
        const pos   =geometry.attributes.position.array
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
        this.param.scale=[scale.x,scale.y,scale.z]
        if(scale.x==0)scale.x=1
        if(scale.y==0)scale.y=1
        if(scale.z==0)scale.z=1
        if(scale.x==0||scale.y==0||scale.z==0)alert("圆柱检测异常")
        const center={
            x:(box_max[0]+box_min[0])/2,
            y:(box_max[1]+box_min[1])/2,
            z:(box_max[2]+box_min[2])/2,
        }
        this.param.pos=center
        
        
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

    threshold1=0.2//70//100//50
    _hasAxis(){
        let distance=0
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
                // Math.pow(1-x,2)+
                // Math.pow(1-y,2)+
                // Math.pow(1-z,2)
            distance+=Math.min(xd,yd,zd)
            distanceX+=xd
            distanceY+=yd
            distanceZ+=zd
        }
        if(Math.min(distanceX,distanceY,distanceZ)==distanceX){
            this.param.direction=0
            this.param.h_half=this.param.scale[0]
            this.param.r=(this.param.scale[1]+this.param.scale[2])/2
        }else if(Math.min(distanceX,distanceY,distanceZ)==distanceY){
            this.param.direction=1
            this.param.h_half=this.param.scale[1]
            this.param.r=(this.param.scale[0]+this.param.scale[2])/2
        }else if(Math.min(distanceX,distanceY,distanceZ)==distanceZ){
            this.param.direction=2
            this.param.h_half=this.param.scale[2]
            this.param.r=(this.param.scale[0]+this.param.scale[1])/2
        }
        this.isCube=
            (distanceX+distanceY+distanceZ)/(this.positions.length*3)<this.threshold1
        
        // console.log((distanceX+distanceY+distanceZ)/this.positions.length<this.threshold1,this.cube)
        // console.log(
        //     (distanceX+distanceY+distanceZ)/this.positions.length<this.threshold1
        // )
        // this.axis=//判断出来轴的方向
        distance/=this.positions.length
        // console.log(Math.round(distance*1000))
        // if(distance>=this.threshold1)alert("错误")
        const flag=distance<this.threshold1
        // console.log(distance<this.threshold1,distance,this.threshold1)
        return flag
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
    threshold2=1.8/100//4//4//0.2
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
        const flag=errorSumPercentage<this.threshold2
        // console.log(errorSumPercentage<this.threshold2,errorSumPercentage,this.threshold2)
        return flag
    }

    _judgeCylinder(){
        this.isCylinder=this.positions.length>0&&this._hasAxis()&&this._atSphere()
    }

    getParam(){
        const p=new CoderDecoder.encoder(this.matrixList,this.param)
        window.CylinderParam[this.mesh.name]=p
        return p
    }
    static downloadParam(){
        // const str=JSON.stringify(window.CylinderParam , null, "\t")
        const str=JSON.stringify(window.CylinderParam)
        var link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href = URL.createObjectURL(new Blob([str], { type: 'text/plain' }));
        link.download ="CylinderParam"+window.iii+".json";
        link.click();
    }
    _parse(){//将参数解析为圆柱
        this.mesh2=new CoderDecoder.decoder(this.param)//mesh
    }
}
window.downloadJson=Classification.downloadParam
//无法处理的构件：700
//典范构件:740