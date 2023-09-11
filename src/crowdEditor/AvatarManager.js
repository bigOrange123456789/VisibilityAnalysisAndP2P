import { CrowdManager } from '../../lib/crowd/CrowdManager.js'
import conifg_woman     from '../../config/avatar/sceneConifg_woman0.json'
// import conifg_woman     from '../../config/avatar/sceneConifg_man02.json'
// import conifg_tree     from '../../config/avatar/tree.json'
import { ControlEdit } from '../../lib/playerControl/ControlEdit.js';
        
import * as THREE from "three"
export class AvatarManager {
    editAble=true//false//
    constructor(scene, camera,posConfig,cb,orbitControls) {
        this.orbitControls=orbitControls
        this.renderer=renderer
        const self=this
        this.boxlist=[]
        this.posConfig=posConfig
        // return
        window.scene=scene
        this.scene = scene
        this.camera = camera
        this.assets = {}//为了防止资源重复加载，相同路径的资源只加载一次
        // this.init()
        // window.avatar=new CrowdManager(scene, camera,this.initPos_avatar(),this.getConfig_avatar(),"glb_material")
        window.avatar=new CrowdManager(scene, camera,this.initPos_avatarTest(),this.getConfig_avatar(),"glb_material",(crowd,c,scenes)=>{
            function r(arr){
                const randomIndex = Math.floor(Math.random() * arr.length)
                return arr[randomIndex]
            }
            
            for (var i00 = 0; i00 < crowd.count; i00++) {
                if(self.editAble){
                    const box = new THREE.Mesh( 
                        new THREE.BoxGeometry( 1, 2.35 ), 
                        new THREE.MeshStandardMaterial({
                            color:0,
                            transparent:true,
                            opacity:0
                        })
                    )
                    const box2=new THREE.Mesh( 
                        new THREE.BoxGeometry( 1, 0.2), 
                        new THREE.MeshStandardMaterial({
                            color:0
                        }) 
                    )
                    box2.material.color.r=0.5
                    box2.visible=false
                    // box2.scale.y=0.2
                    box2.position.y=-1.8
                    box.add(box2)
                    // box.position.y=40
                    const p=this.initPos_avatarTest()[i00]
                    box.position.set(p[0],p[1]+1.6,p[2])
                    box.name=i00
    
                    self.boxlist.push(box)
                    self.scene.add(box)
                }
                
                // const p=self.poslist[i00]
                // crowd.setPosition(i00,[
                //     p[0],//+(2*Math.random()-1)*5,
                //     p[1],
                //     p[2]//+(2*Math.random()-1)*5
                // ])
                // crowd.setRotation(i00,[0,Math.random()*30,0])
                if(true){//if(Math.random()>0.3){//
                    crowd.setAnimation(
                        i00,
                        r(c.standAnimationList),
                        Math.random()*10000
                    )
                }else{
                    crowd.setAnimation(
                        i00,
                        r(c.walkAnimationList),
                        Math.random()*10000
                    )
                    crowd.setMoveMaxLength(
                        i00,
                        (0.5+Math.random())*10
                    )
                    // crowd.setRotation(
                    //     i00,[0,0,0]
                    // )
                }
                
                crowd.setSpeed(i00, 1+8*Math.random())
                // crowd.setSpeed(i00, 0)
                crowd.setBodyScale(i00,[
                    (Math.random()-0.5)/1.5,
                    (Math.random()-0.5)/1.5,
                    (Math.random()-0.5)/1.5,
                    (Math.random()-0.5)/1.5,
                ])
                // crowd.setScale(i00, [
                //     -900,
                //     -900*(1-0.2+0.2*Math.random()),
                //     900])
                // crowd.setScale(i00, [
                //     c.scale,
                //     c.scale*(1-0.2+0.2*Math.random()),
                //     c.scale])
                // crowd.setObesity(i00, 0.8+0.4*Math.random())
                let flag=true
                if(c.constraint){
                    const i000 = Math.floor(Math.random() * c.constraint.length)
                    const constraint0=c.constraint[i000]
                    for(let partName in constraint0)
                        crowd.setPartType(i00,partName,constraint0[partName])
                    if(i000>=3)flag=false
                }
                if(flag){
                    let j=10
                    crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_kuzi_geo")
                    // crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_shangyi_geo")
                    crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_waitao_geo1")
                    crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_xiezi_geo")

                    j=-0.3
                    crowd.setColor(i00,[j*Math.random(),j*Math.random(),j*Math.random()],"qipao22")
                    crowd.setColor(i00,[j*Math.random(),j*Math.random(),j*Math.random()],"waitao1")

                    j=0.1
                    crowd.setColor(i00,[j*Math.random(),j*Math.random(),j*Math.random()],"CloW_C_qunzi_geo3456")
                    crowd.setColor(i00,[j*Math.random(),j*Math.random(),j*Math.random()],"CloW_C_shangyi_geo")

                }
                
            }
            // self.drag(self.boxlist)
            
            for(let i=0;i<scenes.length;i++){
                scenes[i].traverse(node=>{
                    if(node instanceof THREE.SkinnedMesh){
                        node.material=node.material.clone()
                        let material=node.material
                        let name=node.name
                        let meshType=c['meshType'][i][name]
                        if(meshType=='body'||meshType=='head'){
                            material.color.r-=0.6
                            material.color.g-=0.6
                            material.color.b-=0.6
                            // material.roughness=0//-=0.6
                            // material.metalness=0//+=0.2
                            // material.envMapIntensity=0
                            // material.emissiveIntensity=0
                            // material.lightMapIntensity=0
                        }else if(meshType=='hair'){
                            material.side=2
                            // material.color.r=1000;
                            material.metalness=0.5
                            material.roughness=0.5
                        }else if(meshType=="eye"){
                            material.metalness=1
                            material.roughness=0.5
                        }else if(meshType=="trousers"||meshType=="coat"){
                            material.metalness=1
                            // material.roughness-=0.5
                            material.color.r=material.color.g=material.color.b=1

                            material.envMapIntensity=1
                            material.emissiveIntensity=1
                            material.lightMapIntensity=1
                        }else if(meshType=="shoes"){
                            material.metalness=1
                            material.roughness=0.5
                        }
                    }
                })
            }
            crowd.update()
            window.crowd=crowd
            if(cb)cb()
            if(self.editAble)new ControlEdit(self.camera,self.renderer,self.boxlist,orbitControls,
                obj=>{//点击选中控制函数
                    const id=obj.name
                    if(window.avatar){
                        // obj.position.y=window.avatar.crowd.getPosition(id)[1]+1.6
                        // window.avatar.crowd.setPosition(id,[
                        //     obj.position.x,
                        //     obj.position.y-1.6,//+3.85,
                        //     obj.position.z,
                        // ])  
                        // window.avatar.crowd.update()
                        window.avatarI=id
                        const arr=self.boxlist
                        for(let i=0;i<arr.length;i++){
                            // arr[i].children[0].material.color.r=(i==id?0.5:0)
                            arr[i].children[0].visible=(i==id)
                            // console.log(arr[i].children[0].material.color)
                        }
                    }
                },
                obj=>{//移动拖拽控制函数
                    const id=obj.name
                    if(window.avatar){
                        // obj.position.y=window.avatar.crowd.getPosition(id)[1]+1.6
                        window.avatar.crowd.setPosition(id,[
                            obj.position.x,
                            obj.position.y-1.6,//+3.85,
                            obj.position.z,
                        ])  
                        window.avatar.crowd.update()
                    }
                },
            )
            // self.checkOnPanel()
        })
        // this.radiographic()
    

        // window.t=new Test(window.avatar)
        // window.tree=new CrowdManager(scene, camera,this.initPos_tree(),this.getConfig_tree(),"glb_material")
    }
    initPos_avatarTest(){
        const arr=[]
        for(let i=0;i<5;i++)
        for(let j=0;j<5;j++){
            arr.push([
                (i-2.5)*4+-273.9,
                -1.5+7.5,
                (j-2.5)*4+244.6,
            ])
        }
        return arr
    }

    getConfig_avatar(){
        const config=conifg_woman
        for(let i=0;i<config.length;i++){
            let c1=config[i]
            c1.scale=2
            
            // c1.lod_distance=[ 5000, 15000, 30000, 60000, 100000 ]
            // c1.lod_geometry=[ 20,  15,   1,    0,   0  ]
            // c1.lod_avatarCount=[ 200, 900, 3240, 8800, 12600]

            // c1.lod_distance=[ 10, 20, 40, 80, 160, 320 ]
            // c1.lod_geometry=[ 20, 15,  7,  2,   1,   0 ]
            // c1.lod_avatarCount=[ 500, 500, 500, 500, 500, 500]
            
            const lodConut=7//21
            const countAll=2500*2*10
            const distanceAll=200*0.8*0.25//300
            c1.lod_distance=[ ]
            c1.lod_geometry=[ ]
            c1.lod_avatarCount=[ ]
            let r_pre=0
            for(let j=0;j<lodConut;j++){
                const r=Math.pow((j+1)/lodConut,1.2)*distanceAll
                c1.lod_distance.push(r)
                // c1.lod_geometry.push(lodConut-j-1)
                c1.lod_geometry.push((lodConut-j)*3-3)

                const n=countAll*[Math.pow(r,2)-Math.pow(r_pre,2)]/Math.pow(distanceAll,2)
                r_pre=r
                c1.lod_avatarCount.push(Math.ceil(n))
            }
            for(let i=0;i<c1.lod_distance.length;i++){
                c1.lod_distance[i]*=c1.scale
            }
            // console.log(c1)
            for(let j=0;j<c1.lod_visible.length;j++){
                for(let tag in c1.lod_visible[j]){
                    c1.lod_visible[j][tag]=lodConut
                }
            }
            c1.lod_distance[c1.lod_distance.length-2]*=2
            c1.lod_distance[c1.lod_distance.length-1]*=4*2
        }
        // console.log(config)
        return config[0]
    }
}
