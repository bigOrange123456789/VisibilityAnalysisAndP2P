// import sceneConifg from '../config/sceneConifg_0.json'
// import sceneConifg from '../config/sceneConifg_man02.json'
// import sceneConifg from '../config/sceneConifg_man_B.json'

// import sceneConifg from '../config/sceneConifg_woman0.json'
const sceneConifg=[
    { 
        "path": [
            "assets/sim/woman01/"
        ],

        "pathTexture":[
            "./assets/textures_sim1/woman01/"
        ],
        "meshType":[
            {

                "CloW_A_body_geo": "coat",
                "CloW_A_kuzi_geo": "trousers",
                "CloW_A_shangyi_geo": "coat",
                "CloW_A_waitao_geo1": "coat",
                "CloW_A_xiezi_geo": "xiezi",
                "CloW_E_eyeLeft_geo02": "eye",
                "CloW_E_eyeRight_geo01": "eye",
                "eyelash": "eyelash",
                "hair": "hair",
                "head": "head",
                "teeth": null
            }
        ],
        "lod_visible": [
            {
                "CloW_A_kuzi_geo": 5,
                "CloW_A_shangyi_geo": 4,
                "head":4,

                "CloW_A_body_geo": 3,
                
                
                "CloW_A_waitao_geo1": 3,

                "CloW_A_xiezi_geo": 3,
                "CloW_E_eyeLeft_geo02": 2,
                "CloW_E_eyeRight_geo01": 2,
                "eyelash": 2,
                "hair": 3
                
            }
        ],
        "useColorTag": [
            "CloW_A_kuzi_geo",
            "CloW_A_shangyi_geo",
            "CloW_A_waitao_geo1",
            "CloW_A_xiezi_geo"
        ],
        

        "walkAnimationList": [
            5,8
        ],
        "sitAnimationList": [
            
        ],
        "standAnimationList": [
            0,1,2,3,4,6,7,9,10,11,12
        ],
        "pathAnima":  "assets/animation_woman0.bin" ,


        "lod_distance":[ 5,   15,   30,    60,  100 ],
        "lod_geometry":    [ 20,  15,   1,    0,   0  ],
        "lod_avatarCount": [ 200, 900, 3240,  8800, 12600]
    }
]
class modelMessage {
    constructor(opt) {
        for(const i in opt)
            this[i]=opt[i]

        this.ModelCount = opt.modelCount;
        this.pathTextureConfig=opt.pathTextureConfig;
        this.PosRotCount = 0;
        this.posRotList = [];
        this.animtionTypes = [];
        //modelIndex//
    }
    setPosRotList(PosRot) {
        if (this.PosRotCount < this.ModelCount) {
            this.posRotList.push(PosRot);
            this.PosRotCount += 1;
            return true;
        }
        else return false;
    }
}

export class modelManager {
    constructor() {//lod减少后至多加载5个模型
        this.arr=[0]//[3,5]//[1,3,5,6]//[1,5]//[0,1,2,3,4,5,6,7,8]//[1,3,4,5]
        this.pathModelName="sim.glb"
        this.pathLodGeoName="LOD/"
        this.pathTextureConfig="texture_names.json"

        this.modelList = [];
        this.modelIndex = 0;
        this.sumModelCount = 0;
        this.row_index = 0; //在梯形看台中计算当前人物所在看台行数(貌似含义和小看台中正好相反)
        this.sum_count = 0; //当前row_index前面行的人数总和
        this.row_count = 0; //当前行的可放置人数


        this.init();
        
    }

    addModel(opt) {
        // console.log(opt["path"],opt["lod_visible"])
        // opt["pathModel"] =opt['path']+this.pathModelName
        // opt["pathLodGeo"]=opt['path']+this.pathLodGeoName
        // opt["pathTextureConfig"]=opt['path']+this.pathTextureConfig
        // console.log(opt)

        const path=opt["path"]
        opt["pathModel"] =[]
        opt["pathLodGeo"]=[]
        opt["pathTextureConfig"]=[]
        for(let i=0;i<path.length;i++){
            const path0=path[i]
            opt["pathModel"].push( path0+this.pathModelName)
            opt["pathLodGeo"].push( path0+this.pathLodGeoName)
            opt["pathTextureConfig"].push( path0+this.pathTextureConfig)
        }
        // console.log(opt,opt["pathTexture"])
        // alert(opt["pathTexture"])
        var modelmessage = new modelMessage(opt);
        this.modelList.push(modelmessage);
        this.modelIndex += 1;
        this.sumModelCount += opt.modelCount;
    }

    getQueryString(name) {
        if (window.location.href.split('?').length == 1) {
            return "all"
        }
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        let url = window.location.href.split('?')[1].match(reg);
        console.log("url", url)
        if (url != null) {
            let id=decodeURI(url[2])
            window.id=id
          return id//decodeURI() 函数可对 encodeURI() 函数编码过的 URI 进行解码。
        } else {
          return "all"
        }
    }

    init() {
        // console.log(JSON.stringify(data, null, 4))
        // let index = this.getQueryString("id")
        // if (index == "all") {
        //     let arr = this.arr//[5,3,4]//[1,3,4,5]
        //     for (let i = 0; i < arr.length; i++) {
        //         let config = sceneConifg[arr[i]]
        //         config.modelCount = Math.floor( (8 * (11123) / arr.length)  )
        //         // config.modelCount = Math.floor( ((11123) / arr.length)  )
        //         // config.modelCount = Math.floor( ( (11123) / arr.length)  )
        //         this.addModel(config)
        //     }
        // } else {
        //     index = parseInt(index)
        //     // console.log(index)
        //     sceneConifg[index].modelCount = 8 * (11123)
        //     // data[index].modelCount =  (5123)
        //     // data[index].modelCount =  (11123)
        //     this.addModel(sceneConifg[index])
        // }

        for (let i = 0; i < sceneConifg.length; i++) {
            let config = sceneConifg[i]
            config.modelCount = Math.floor( (8 * (11123) / sceneConifg.length)  )
            // config.modelCount = Math.floor( ((11123) / arr.length)  )
            // config.modelCount = Math.floor( ( (11123) / arr.length)  )
            this.addModel(config)
        }
    }

    getPosRot_e(i0,modelType) {
        var c = [//分组情况
            1250,//496,   //运动
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
            var animationType = this.modelList[modelType].walkAnimationList[animationTypeIndex];
            var speed = speed = Math.random() * 7 + 4;
            var startTime = 1000 * Math.random();
        }
        else {
            let animationTypeIndex = Math.floor(Math.random() * this.modelList[modelType].standAnimationList.length);
            var animationType = this.modelList[modelType].standAnimationList[animationTypeIndex];
            var speed = Math.random() * 7 + 4;
            var startTime = 1000 * Math.random();
            //this.modelList[modelType].animtionTypes.push(this.modelList[modelType].standAnimationList[animationTypeIndex]);

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
        return { pos: position, rot: rotation, ani: animationType, speed: speed, startTime: startTime }
    }
    getPosRot_9e(i0, modelType) {

        // return this.getPosRot_e(i0,modelType)

        // var PosRot = this.getPosRot_e(parseInt(i0 / 9), modelType)
        // var j0 = i0 % 9;
        // let k = 0.25;
        // PosRot.pos[0] += (k * parseInt(j0 / 3))
        // PosRot.pos[2] += (k * (j0 % 3))
        // return PosRot

        var PosRot = this.getPosRot_e(parseInt(i0 / 8), modelType)
        var j0 = i0 % 8;
        let k = 0.67;
        PosRot.pos[0] += (k * parseInt(j0 / 2))-1
        PosRot.pos[2] += ((k-0.3) * (j0 % 2))
        return PosRot
    }
}
