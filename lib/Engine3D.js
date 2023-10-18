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

import { BuildMaterial } from './Building/BuildMaterial.js'
// import { Pretreatment } from './Building/Pretreatment.js'
import { Tool } from './Building/Tool.js'

import {PathPlanning}from'./VCG/PathPlanning.js'
export class Engine3D{
    //start.js
    static StartSampling=StartSampling

    //main.js
    static PlayerControl=PlayerControl
    static MoveManager=MoveManager
    static SkyController=SkyController

    //build.js
    static Visibility=Visibility
    static P2P=P2P
    static Detection=Detection
    static IndirectMaterial=IndirectMaterial
    static Loader=Loader 

    //avatarManager.js
    static Instanced5Object=Instanced5Object

    //panel.js
    static MyUI=MyUI

    static Building={
        BuildMaterial:BuildMaterial,
        // Pretreatment:Pretreatment,
        Tool:Tool
    }

    static PathPlanning=PathPlanning
}