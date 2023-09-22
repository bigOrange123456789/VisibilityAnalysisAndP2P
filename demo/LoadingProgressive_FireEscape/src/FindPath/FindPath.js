import { Map } from './Map.js'
export class FindPath {
    #startMove=false
    #statusPre=[]
    #statusNext=[]   
    #stepNum=30
    #stepi=0
    #i5//Instaced5Object
    #rf="eachFrame"
    constructor(i5) {
        // i5=window.avatar.crowd
        this.#i5=i5
        this.map=new Map()

        this.#statusPre =[]
        for(let i=0;i<this.#i5.count;i++){
            const pos = this.#i5.getPosition(i)
            const rot = [0,this.#i5.getRotation(i)[1],0]
            this.#statusPre.push({
                pos:pos,rot:rot
            })
        }
        this.#statusNext=this.#statusPre

        this.#init()
        this.#update()
        this.start()
    }
    #init(){
        this.#statusPre =this.#statusNext
        this.#statusNext=[]
        let countNull=0
        for(let i=0;i<this.#i5.count;i++){
            const pos = this.#statusPre[i].pos
            const rot = this.#statusPre[i].rot
            // rot[1]-=Math.PI
            let pos2=pos
            let rot2=rot
            const next = this.map.nextStatus(pos[0],pos[2])
            // console.log("next",next)
            if(next){
                pos2=[
                    next.pos[0],
                    pos[1],
                    next.pos[1]
                ]
                rot2=[
                    rot[0],
                    next.rot-Math.PI/2,
                    rot[2],
                ]
            }else{
                countNull++//统计计算寻路的人数
            }
            this.#statusNext.push({
                pos:pos2,rot:rot2
            })

            
        }
    }
    start(){
        if(this.#startMove)return
        else this.#startMove=true
        for(let i=0;i<this.#i5.count;i++){
            this.#i5.setAnimation(
                i,5,Math.random()*10000
            )
        }          

        const self=this
        const loop=()=>{
            self.#update()
            if(typeof this.#rf=="string"){//rf=="eachFrame"
                requestAnimationFrame(() => {loop()})
            }else{
                setTimeout(()=>{loop()},rf)//每rf毫秒更新一次
            } 
        }
        loop()
    }
    #update(){
        if(!window.escapeFlag)return
        if(this.#stepi==this.#stepNum+1){
            this.#stepi=0
            this.#init()
        }
        const k=this.#stepi/this.#stepNum
        for(let i=0;i<this.#i5.count;i++){
            
            const statusPre=this.#statusPre[i]
            const statusNext=this.#statusNext[i]
            // console.log("statusPre",statusPre.pos,"statusNext",statusNext.pos)
            const pos=[
                statusPre.pos[0]+(statusNext.pos[0]-statusPre.pos[0])*k,
                statusPre.pos[1]+(statusNext.pos[1]-statusPre.pos[1])*k,
                statusPre.pos[2]+(statusNext.pos[2]-statusPre.pos[2])*k
            ]
            let dr=(statusNext.rot[1]-statusPre.rot[1])

            if(dr<=-Math.PI)dr+=2*Math.PI
            if(dr>=Math.PI)dr-=2*Math.PI
            
            const rot=[
                statusPre.rot[0],
                statusPre.rot[1]+dr*Math.pow(k+0.00000001,0.4),//+Math.PI/2,
                statusPre.rot[2],
            ]
            this.#i5.setPosition(i,pos)
            this.#i5.setRotation(i,rot)
            if(i==0&&window.followFlag){
                const camera=window.camera
                camera.position.x=pos[0]
                camera.position.z=pos[2]-4
                camera.lookAt(pos[0],camera.position.y-0.5,pos[2])
            }
        }
        // if(k!==0)
        this.#i5.update()
        this.#stepi++
    }
}