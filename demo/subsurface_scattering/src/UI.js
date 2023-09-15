import * as THREE from "three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'//dat.gui.module.js';
export class UI{
    constructor(buiding) {
        const self=this
        this.gui = new GUI({ title: 'Thickness Control' });
        self.init(buiding)
    }
    init(buiding){
        const sssMaterialList=buiding.sssMaterialList
        const gui = this.gui
        gui.add( {"模型":"头部"}, '模型', [
            "头部",
            "兔子",
        ] ).onChange( value => {
            buiding.useModel(value)
        } )
        this.add(
            gui,
            [
                // ["thicknessDistortion",  0.01,   1,  0.01    ],
                // ["thicknessAmbient",     0.01,   5,  0.05    ],
                // ["thicknessAttenuation", 0.01,   5,  0.05    ],
                // ["thicknessPower",       0.01,   16, 0.1     ],
                // ["thicknessScale",       0.01,   50, 0.1     ],
                ["thicknessAttenuation", 0.01,   5,  0.05    ,"sss强度"],

                ["thicknessPower",       0.01,   16, 0.1     ],
                ["thicknessScale",       0.01,   50, 0.1     ],
                ["thicknessDistortion",  0.01,   1,  0.01    ],
                ["thicknessAmbient",     0.01,   5,  0.05    ],
                
            ],
            sssMaterialList
        )
        gui.addColor( 
            {
                "thicknessColor":new THREE.Color().setRGB(
                    sssMaterialList[0].uniforms["thicknessColor"].value.x,
                    sssMaterialList[0].uniforms["thicknessColor"].value.y,
                    sssMaterialList[0].uniforms["thicknessColor"].value.z
                )
            }, 
            'thicknessColor' 
        ).onChange(value=>{
            for(let i=0;i<sssMaterialList.length;i++){
                const uniforms=sssMaterialList[i].uniforms
                uniforms["thicknessColor"].value.x=value.r
                uniforms["thicknessColor"].value.y=value.g
                uniforms["thicknessColor"].value.z=value.b
            }
            
        })

    }
    add(gui,d,objList){
        for(let d0 of d){
            const id  =d0[0]
            const min0 =d0[1]
            const max0 =d0[2]
            const step0=d0[3]
            const name=d0.length<5?id:d0[4]
            const param={}
            param[name]=objList[0].uniforms[id].value
            gui.add( param, name ).min( min0 ).max( max0 ).step( step0 ).onChange( value=> {
                for(let i=0;i<objList.length;i++){
                    objList[i].uniforms[id].value = value
                }//obj[ id].value = value
            } )
        }
    }
}