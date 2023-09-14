export class Culling{//遮挡剔除和视锥剔除
    v//可见度计算工具
    camera
    meshes
    #prePoint2=""
    constructor(param){
        this.v=param.visibility
        this.camera=param.visibility.camera
        this.meshes=param.visibility.meshes

        const scope=this
		const c=this.camera
		function setInterval0(){
            requestAnimationFrame(setInterval0)
			var point0=c.position.x+","+c.position.y+","+c.position.z
                    +c.rotation.x+","+c.rotation.y+","+c.rotation.z
            if(scope.#prePoint2!==point0){//如果视点发生了移动或旋转
                    scope.#showOnlyEvs()
                    scope.#prePoint2=point0
			}
        }setInterval0()
    }
    update(){
        this.#prePoint2=""
    }
    #showOnlyEvsOld(){//用于渲染
        const posIndex=this.v.getPosIndex()[3]
        const visualList0=this.v.visualList[posIndex]
        if(visualList0){
            const d=this.v.getDirection()
            for(let i=0;i<this.v.componentNum;i++)
            if(this.meshes[i]){
                const vd1=i in visualList0["1"]?visualList0["1"][i]:0
                const vd2=i in visualList0["2"]?visualList0["2"][i]:0
                const vd3=i in visualList0["3"]?visualList0["3"][i]:0
                const vd4=i in visualList0["4"]?visualList0["4"][i]:0
                const vd5=i in visualList0["5"]?visualList0["5"][i]:0
                const vd6=i in visualList0["6"]?visualList0["6"][i]:0
                this.v.vd[i]=vd1*d[0]+vd2*d[1]+vd3*d[2]+vd4*d[3]+vd5*d[4]+vd6*d[5]
                if(this.meshes[i].lod){
                    for(let j=0;j<this.meshes[i].lod.length;j++)    
                        this.meshes[i].lod[j].visible=false
                    if(this.v.vd[i]>Math.PI/(40))this.meshes[i].lod[1].visible=true//this.meshes[i].lod[0].visible=true
                    else if(this.v.vd[i]>0)         this.meshes[i].lod[0].visible=true
                }else{
                    this.meshes[i].visible= this.vd[i]>0
                }
                this.meshes[i].used=true//这个mesh被使用了
            } 
            window.visibleArea={}
            if(visualList0["a"])
                for(let i=0;i<visualList0["a"].length;i++){
                    window.visibleArea[visualList0["a"][i]]=true
                }
        }
    }
    #showOnlyEvs(){//用于渲染
        const posIndex=this.v.getPosIndex()[3]
        const visualList0=this.v.visualList[posIndex]
        if(visualList0){
            for(let i=0;i<this.v.componentNum;i++)
            if(this.meshes[i]){
                this.meshes[i].lod[1].visible=this.meshes[i].lod[0].visible=false
                for(let direction=1;direction<=6;direction++){
                    if(i in visualList0[direction]){
                        this.meshes[i].lod[1].visible=true
                        break
                    }
                }
                this.meshes[i].used=true//这个mesh被使用了
            } 
            if(true){//loadingoverall中的结果可视化，性能开销不大
                window.visibleArea={}
                if(visualList0["a"])
                    for(let i=0;i<visualList0["a"].length;i++)
                        window.visibleArea[visualList0["a"][i]]=true
            }
        }
    }
}