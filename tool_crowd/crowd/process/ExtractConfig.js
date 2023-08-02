const config0=[
    { 
        "path": [
            "assets/avatar/sim/woman_test/"
        ],

        "pathTexture":[{}],
        "meshType":[{}],
        "lod_visible": [{}],
        "useColorTag": [],
        
        "walkAnimationList": [],
        "sitAnimationList": [],
        "standAnimationList": [],
        "pathAnima":  "assets/avatar/sim/woman_test/animation.bin" ,

        "lod_distance":[  ],
        "lod_geometry":    [  ],
        "lod_avatarCount": [ ]
    }
]
export class ExtractConfig {
    constructor(glb0) {
        const self=this    
        this.path =prompt("请输入前端资源路径:","assets/avatar/sim/woman_test/")
        config0[0].path=this.path
        config0[0].path=this.path+"animation.bin"
        glb0.scene.traverse(i=>{
            if(i instanceof THREE.Mesh){
                config0[0].pathTexture[0][i.name]={map:"?.jpg"}
                config0[0].meshType[0][i.name]=i.name
                config0[0].lod_visible[0][i.name]=22
            }
        })
        config0[0].walkAnimationList=Array.from(Array(glb0.animations.length)).map((e, i) => i)
        self.saveJson(config0,"config.json")
    }
    saveJson(data,name){
        const jsonData = JSON.stringify(data, undefined, 4);//JSON.stringify(data)
        const myBlob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
}
// new AvatarManager("temp/woman01.gltf")
// new AvatarManager("assets/avatar/sim/woman01/sim.glb")
// new AvatarManager("assets/avatar/sim/tree/sim.glb")
//new AvatarManager("./sim.glb")