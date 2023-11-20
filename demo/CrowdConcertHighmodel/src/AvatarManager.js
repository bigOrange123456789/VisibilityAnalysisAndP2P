//高质量
import { CrowdManager } from '../../../lib/crowd/CrowdManager.js'
import conifg_woman     from '../../../config/avatar/sceneConifg_woman0.json'
//低质量
// import { CrowdManager } from '../../../lib/crowd_sim/CrowdManager.js'
// // import conifg_woman     from '../../../config/avatar/sceneConfig_man_linzhou.json'
// import conifg_woman     from '../../../config/avatar/sceneConfig_man_linzhou2.json'

// import { Template } from '../../../lib/crowd/Template_sim.js'
// const CrowdManager=Template
// import conifg_woman     from '../../../config/avatar/sceneConfig_man_linzhou2.json'

// import conifg_woman     from '../../config/avatar/sceneConifg_man02.json'
// import conifg_tree     from '../../config/avatar/tree.json'

import * as THREE from "three"
class Test{
    constructor(avatar){
        this.avatar=avatar
        window.t=this
    }
    init(){
        const i5=this.avatar.crowd
        window.i5=i5
        i5.setScale(0,[10,10,10]);
        window.f=(i,j,k)=>{i5.setPartType(0,'body',i);i5.setPartType(0,'coat',j);i5.setPartType(0,'trousers',k);i5.update();}
        window.f(0,0,0)
        i5.setPartType(0,'hair',0)
        window.camera.position.set(-40.316744366725,  8,  37.8613180818328)
        window.camera.rotation.set(-0.6503317661947894, -0.876727763380061,  -0.5291184829295812)
        const self=this
        const show=(obj)=>{
            obj.visible=true
            if(obj.children)
            for(let i=0;i<obj.children.length;i++){
                show(obj.children[i])
            }
        }
        this.i5=this.avatar.crowd
        // this.i4=this.i5.children[0]
        // this.i3=this.i4.children[0]
        // this.i2=this.i3.children[0]
        this.set5=()=>{
            show(self.i5)
        }
        this.set4=(i0)=>{
            const a=self.i5
            self.i4=a.children[i0]
            for(let i=0;i<a.children.length;i++)a.children[i].visible=(i==i0);
            show(a.children[i0])
        }
        this.set3=(i0)=>{
            const a=self.i4
            self.i3=a.children[i0]
            for(let i=0;i<a.children.length;i++)a.children[i].visible=(i==i0);
            show(a.children[i0])
        }
        this.set2=(i0)=>{
            const a=self.i3
            self.i2=a.children[i0]
            for(let i=0;i<a.children.length;i++)a.children[i].visible=(i==i0);
            show(a.children[i0])
        }
        // this.set4(0)
        this.setMaterial=(i5)=>{
            for(let i4 of i5.children)
                for(let i3 of i4.children)
                    for(let i2 of i3.children)
                        i2.material.side=2;
        }
        this.setMaterial(i5)
        // this.set3(0)
        // this.set2(0)

        // window.i5=
    }
}
export class AvatarManager {
    constructor(scene, camera,posConfig) {
        const self=this
        this.posConfig=posConfig
        // return
        window.scene=scene
        this.scene = scene
        this.camera = camera
        this.assets = {}//为了防止资源重复加载，相同路径的资源只加载一次
        const materialLoaderType=conifg_woman[0].materialLoaderType?conifg_woman[0].materialLoaderType:"glb_material"
        // window.avatar=new CrowdManager(scene, camera,this.initPos_avatar(),this.getConfig_avatar(),"glb_material",
        // window.avatar=new CrowdManager(scene, camera,new Array(10*100*100),this.#getConfig_avatar_sim2(),materialLoaderType,
        window.avatar=new CrowdManager(scene, camera,new Array(10*100*100),this.#getConfig_avatar(),materialLoaderType,
        (crowd,c,scenes)=>{
            function r(arr){
                const randomIndex = Math.floor(Math.random() * arr.length)
                return arr[randomIndex]
            }
            
            for (var i00 = 0; i00 < crowd.count; i00++) {
                if(i00<8*100*100){//if(true){//
                   let j=self.#getPosRot_9e(i00,0)
                //    console.log(i00,j)
                   crowd.setPosition(i00,j.pos)
                   crowd.setRotation(i00,j.rot)
                }
               if(true){// if(Math.random()>0.3){//
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
                //if(i00<8*100*100)
                if(self.#getPosRot_9e(i00,0).ani==-1&&Math.random()>0.5){
                    crowd.setAnimation(
                        i00,
                        r(c.walkAnimationList),
                        Math.random()*10000
                    )
                    crowd.setMoveMaxLength(
                        i00,
                        (0.5+Math.random())*10
                    )
                }
                
                crowd.setSpeed(i00, 1+8*Math.random())
                crowd.setBodyScale(i00,[
                    (Math.random()-0.5)/1.5,
                    (Math.random()-0.5)/1.5,
                    (Math.random()-0.5)/1.5,
                    (Math.random()-0.5)/1.5,
                ])
                const kkk=32
                crowd.setTexture(i00, [
                    Math.floor(Math.random()*kkk),
                    Math.floor(Math.random()*kkk),
                    Math.floor(Math.random()*kkk),
                    Math.floor(Math.random()*kkk)
                ])
                // crowd.setScale(i00, [
                //     -900,
                //     -900*(1-0.2+0.2*Math.random()),
                //     900])
                const s0=1-0.2+0.2*Math.random()
                crowd.setScale(i00, [
                    s0,
                    1-0.3+0.3*Math.random(),
                    s0,
                ])
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
                            material.metalness=0.15//0.45*Math.random()//1
                            // material.roughness-=0.5
                            // material.color.r=material.color.g=material.color.b=1
                            if(material.color.r+material.color.g+material.color.b>2.1){
                                material.color.r/=2
                                material.color.g/=2
                                material.color.b/=2
                            }
                            if(material.color.r+material.color.g+material.color.b>1.1){
                                material.color.r/=2
                                material.color.g/=2
                                material.color.b/=2
                            }
                            material.envMapIntensity=1
                            material.emissiveIntensity=1
                            material.lightMapIntensity=1
                            material.roughness=0.25//0.4+0.55*Math.random()
                        }else if(meshType=="shoes"){
                            material.metalness=1
                            material.roughness=0.5
                        }
                    }
                })
            }
            crowd.update()
        })
        window.t=new Test(window.avatar)
        // window.tree=new CrowdManager(scene, camera,this.initPos_tree(),this.getConfig_tree(),"glb_material")
    }
    #getConfig_avatar(){
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
    #getConfig_avatar_sim2(){
        const config=conifg_woman
        for(let i=0;i<config.length;i++){
            let c1=config[i]
            c1.scale=1//2
            
            
            
            const lodConut=7//21
            const countAll=100*100*10//2500*2*10
            const distanceAll=200*0.8*0.25*2*1.5//*0.5//300
            c1.lod_distance=[ ]
            c1.lod_geometry=[ 18,13,8,6,5,4,3]//length==lodConut+1
            c1.lod_avatarCount=[ ]
            let r_pre=0
            for(let j=0;j<lodConut;j++){
                const r=Math.pow((j+1)/lodConut,1)*distanceAll
                c1.lod_distance.push(r)
                // c1.lod_geometry.push((lodConut-j)*4-4)
                // const n=countAll*[Math.pow(r,2)-Math.pow(r_pre,2)]/Math.pow(distanceAll,2)
                r_pre=r
                c1.lod_avatarCount.push(100*100*10)//(Math.ceil(n))
            }
            c1.lod_avatarCount=[
                100*100*1,
                100*100*2,
                100*100*3,
                100*100*5,
                100*100*10,
                100*100*10,
                100*100*10,
            ]
            for(let i=0;i<c1.lod_distance.length;i++){
                c1.lod_distance[i]*=c1.scale
            }
            // console.log(c1)
            for(let j=0;j<c1.lod_visible.length;j++){
                for(let tag in c1.lod_visible[j]){
                    c1.lod_visible[j][tag]=lodConut
                }
            }
            c1.lod_distance[c1.lod_distance.length-2]*=3*2*2
            c1.lod_distance[c1.lod_distance.length-1]*=4*3*3
        }
        config[0]["lod_visible"]=[
            {
                "CloW_A_body_geo": 4,
                "CloW_A_kuzi_geo": 5,
                "CloW_A_shangyi_geo": 5,
                "CloW_A_waitao_geo1": 4,

                "CloW_A_xiezi_geo": 2,
                "CloW_E_eyeLeft_geo02": 2,
                "CloW_E_eyeRight_geo01": 2,
                "eyelash": 2,
                "hair": 3,
                "head": 5
            },
            {
                "hair":3,
                "body2":4,
                "qipao22":5,
                "waitao1": 5
            },
            {
                "CloW_C_body_geo1":4,
                "CloW_C_qunzi_geo3456":5,
                "CloW_C_shangyi_geo":5,
                "hair":3
            }
        ]
        config[0].useInstancedBuffer={
            //type,itemSize
            // textureType:[Uint8Array,4],//null,
            bodyScale:false,//null,//
            moveMaxLength:false,
            
            // speed:[Float32Array,1],
            // animationIndex:[Uint8Array,1],
            // animationStartTime:[Float32Array,1],
    
            obesity:false,//[Float32Array,1],//
        }
        // console.log(config)
        return config[0]
    }
    #getPosRot_e(i0,modelType) {
        this.modelList=conifg_woman
        var c = [//分组情况
            4*1250,//496,   //运动
            15 * 182,     //大看台1
            21 * 182,     //大看台2
            20 * 60,   //小看台1
            17 * 60,   //小看台2
            300,        //弧形看台1 （从小看台到大看台旁边的顺序排列）
            240,         //弧形看台2 
            192,         //弧形看台3
            152,    //弧形看台6
            217,    //弧形看台5
        ]
        if (i0 < c[0]) {//运动
            i0/=4
            var col_count = 25
            var row_count = 50
            var i = i0 % col_count
            var j = Math.floor(i0 / col_count)
            var position = [
                2 * (1.8 * i + 1.5 * Math.random() - col_count / 2 - 20 + 11),
                0,
                2 * (1.8 * j + 1.5 * Math.random() - row_count / 2 - 25 + 5),
            ]
            var rotation = [0, Math.PI * 2 * Math.random(), 0]

            let animationTypeIndex = Math.floor(Math.random() * this.modelList[modelType].walkAnimationList.length);
            var animationType = -1//this.modelList[modelType].walkAnimationList[animationTypeIndex];
            var speed = speed = Math.random() * 7 + 4;
            var startTime = 1000 * Math.random();
        }
        else {
            let animationTypeIndex = Math.floor(Math.random() * this.modelList[modelType].standAnimationList.length);
            var animationType = this.modelList[modelType].standAnimationList[animationTypeIndex];
            var speed = Math.random() * 7 + 4;
            var startTime = 1000 * Math.random();
            
            if (i0 < c[0] + c[1]) {//大看台1
                i0 -= c[0]
                var row_count = 182
                var row = i0 % row_count
                var col = Math.floor(i0 / row_count) + 1
                var position = [
                    1.5 * -31 - 1.5 * (col) * 1.9,
                    1.28 * col,//
                    0.82 * row - 75,
                ]
                var rotation = [0, -Math.PI * 0.5 + Math.PI, 0]
            }
            else if (i0 < c[0] + c[1] + c[2]) {//大看台2
                i0 -= (c[0] + c[1])
                var row_count = 182
                var row = i0 % row_count
                var col = Math.floor(i0 / row_count) + 1
                var position = [
                    1.5 * 31 + 1.5 * col * 1.9,
                    1.28 * col,
                    0.82 * row - 75,
                ]
                var rotation = [0, Math.PI * 0.5 + Math.PI, 0]
            }
            else if (i0 < c[0] + c[1] + c[2] + c[3]) {//小看台1
                i0 -= (c[0] + c[1] + c[2])
                var row_count = 60
                var row = i0 % row_count
                var col = Math.floor(i0 / row_count)
                if (col > 12) col += 4
                var position = [
                    1. * row - 30,//1.5*(row*0.25-50)*2.01+73,
                    1.28 * col,
                    -99 - 1.5 * col * 1.9,
                ]
                var rotation = [0, -Math.PI + Math.PI, 0]
            } else if (i0 < c[0] + c[1] + c[2] + c[3] + c[4]) {//小看台2
                i0 -= (c[0] + c[1] + c[2] + c[3])
                var row_count = 60
                var row = i0 % row_count
                var col = Math.floor(i0 / row_count)
                if (col > 0) col += 3
                if (col > 12) col += 4
                var position = [
                    1. * row - 30,//1.5*(row*0.25-50)*2.01+73,
                    1.28 * col,
                    99 + 1.5 * col * 1.9
                ]
                var rotation = [0, 0 + Math.PI, 0]
                // var position=[-1000,-1000,-1000]
            } else if (i0 < c[0] + c[1] + c[2] + c[3] + c[4] + c[5]) {//弧形看台1 （从小看台到大看台旁边的顺序排列）
                i0 -= (c[0] + c[1] + c[2] + c[3] + c[4])
                if (i0 < 2) this.row_index = 0; // 重置行数
                var col_index = i0 - Math.floor((0 + this.row_index) * (this.row_index + 1) / 2);
                if (col_index > this.row_index) {
                    this.row_index++;
                    col_index -= this.row_index;
                }
                var position = [
                    1. * col_index + 30,
                    1.28 * this.row_index + 1.28,
                    99 + 1.5 * this.row_index * 1.9 - col_index * 0.25
                ]
                var rotation = [0, 0, 0] // 还需调整方向，目前尚未调整
            } else if (i0 < c[0] + c[1] + c[2] + c[3] + c[4] + c[5] + c[6]) { //弧形看台2
                i0 -= (c[0] + c[1] + c[2] + c[3] + c[4] + c[5]);
                if (i0 < 2) {
                    this.row_index = 0; // 重置行数
                    this.sum_count = 0;
                    this.row_count = 3;
                }
                var col_index = i0 - this.sum_count;
                if (col_index > this.row_count) {
                    this.row_index++;
                    col_index -= this.row_count;
                    this.sum_count += this.row_count;
                    if (this.row_index % 3 === 0) this.row_count += 2;
                }
                var position = [
                    1. * col_index + 31 + this.row_index,
                    1.28 * this.row_index,
                    98 + 1.5 * this.row_index * 1.75 - col_index * 0.6
                ]
                var rotation = [0, 0, 0]
            } else if (i0 < c[0] + c[1] + c[2] + c[3] + c[4] + c[5] + c[6] + c[7]) {
                i0 -= (c[0] + c[1] + c[2] + c[3] + c[4] + c[5] + c[6]);
                if (i0 < 2) {
                    this.row_index = 0; // 重置行数
                    this.sum_count = 0;
                    this.row_count = 3;
                }
                var col_index = i0 - this.sum_count;
                if (col_index > this.row_count) {
                    this.row_index++;
                    col_index -= this.row_count;
                    this.sum_count += this.row_count;
                    if (this.row_index % 4 === 0) this.row_count += 2;
                }
                // console.log(i0,this.row_index,col_index,this.row_count,this.sum_count);
                var position = [
                    1. * col_index + 34.5 + this.row_index * 1.8,
                    1.28 * this.row_index,
                    95 + 1.5 * this.row_index * 1.45 - col_index
                ]
                var rotation = [0, Math.PI * 1.25, 0]
            } else if (i0 < c[0] + c[1] + c[2] + c[3] + c[4] + c[5] + c[6] + c[7] + c[8]) { //弧形看台6
                i0 -= (c[0] + c[1] + c[2] + c[3] + c[4] + c[5] + c[6] + c[7])
                if (i0 < 1) {
                    this.row_index = 8; // 重置行数
                    this.sum_count = 0;
                    this.row_count = 8;
                }
                var col_index = i0 - this.sum_count;
                if (col_index > this.row_count) {
                    this.row_index++;
                    col_index -= this.row_count;
                    this.sum_count += this.row_count;
                    if (this.row_index % 4 === 0) this.row_count += 1;
                }
                // console.log(i0,this.row_index,col_index,this.row_count,this.sum_count);
                var position = [
                    1.5 * 31 + 1.5 * this.row_index * 1.9,
                    1.28 * this.row_index,
                    0.82 * col_index + 75,
                ]
                var rotation = [0, Math.PI * 0.5 + Math.PI, 0]
            } else if (i0 < c[0] + c[1] + c[2] + c[3] + c[4] + c[5] + c[6] + c[7] + c[8] + c[9]) { //弧形看台5
                i0 -= (c[0] + c[1] + c[2] + c[3] + c[4] + c[5] + c[6] + c[7] + c[8])
                if (i0 < 1) {
                    this.row_index = 8; // 重置行数
                    this.sum_count = 0;
                    this.row_count = 9;
                }
                var col_index = i0 - this.sum_count;
                if (col_index > this.row_count) {
                    this.row_index++;
                    col_index -= this.row_count;
                    this.sum_count += this.row_count;
                    this.row_count += 1;
                }
                // console.log(i0,this.row_index,col_index,this.row_count,this.sum_count);
                var position = [
                    1.5 * 30 + 1.5 * this.row_index * 1.9 - 0.3 * col_index,
                    1.28 * this.row_index,
                    0.82 * col_index + 79 + this.row_count * 0.5,
                ]
                var rotation = [0, Math.PI * 0.5 + Math.PI, 0]
            }
            else {
                var position = [
                    0, 0, 0
                ]
                var rotation = [0, 0, 0]
            }
        }
        rotation[1]+=Math.PI
        return { pos: position, rot: rotation, ani: animationType, speed: speed, startTime: startTime }
    }
    #getPosRot_9e(i0, modelType) {
        //88984,2,44492

        var PosRot = this.#getPosRot_e(parseInt(i0 / 8), modelType)
        var j0 = i0 % 8;
        let k = 0.67;
        PosRot.pos[0] += (k * parseInt(j0 / 2))-1
        PosRot.pos[2] += ((k-0.3) * (j0 % 2))
        return PosRot
    }


}