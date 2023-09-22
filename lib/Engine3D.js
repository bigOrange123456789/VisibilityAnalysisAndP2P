//start.js
import { StartSampling } from './StartSampling/StartSampling.js'
//main.js
import { PlayerControl } from './playerControl/PlayerControl.js'
import { MoveManager } from './playerControl/MoveManager.js'
import { SkyController  } from './threejs/SkyController'
//build.js
import { Visibility } from './loading/Visibility.js'
import { P2P } from       './loading/P2P/P2P.js'
import { Detection } from './loading/P2P/Detection.js'
import { IndirectMaterial } from './threejs/IndirectMaterial'
import { Loader } from './loading/Loader.js'
//avatarManager.js
import { Instanced5Object } from './crowd/Instanced5Object'

//panel.js
import{MyUI} from "./ui/MyUI_sim.js"

export class Engine3D{
    static StartSampling=StartSampling

    static PlayerControl=PlayerControl
    static MoveManager=MoveManager
    static SkyController=SkyController

    static Visibility=Visibility
    static P2P=P2P
    static Detection=Detection
    static IndirectMaterial=IndirectMaterial
    static Loader=Loader 

    static Instanced5Object=Instanced5Object

    static MyUI=MyUI
    
    constructor(){}
}