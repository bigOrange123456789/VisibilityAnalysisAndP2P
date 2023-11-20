import {Param}from"./Param.js"
//start.js
import { StartSampling } from './StartSampling/StartSampling.js'
//main.js
import { PlayerControl } from './playerControl/PlayerControl.js'
import { MoveManager } from './playerControl/MoveManager.js'
import { SkyController  } from './threejs/SkyController'


import { UnrealBloom } from './postprocessing/UnrealBloom.js'
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
import{MiniMap}from"./ui/MiniMap.js"
import{PathLine}from"./ui/PathLine.js"

import { BuildMaterial } from './Building/BuildMaterial.js'
// import { Pretreatment } from './Building/Pretreatment.js'
import { Tool } from './Building/Tool.js'

import {PathPlanning}from'./VCG/PathPlanning.js'

import{MapLoader}from"./MapLoader.js"

export class Engine3D{
    static versionId="10.31;03:33"
    static Param=Param
    //start.js
    static StartSampling=StartSampling

    //main.js
    static PlayerControl=PlayerControl
    static MoveManager=MoveManager
    static SkyController=SkyController

    static UnrealBloom=UnrealBloom

    //build.js
    static Visibility=Visibility
    static P2P=P2P
    static Detection=Detection
    static IndirectMaterial=IndirectMaterial
    static Loader=Loader 

    //avatarManager.js
    static Instanced5Object=Instanced5Object

    //panel.js
    static MiniMap=MiniMap
    static MyUI=MyUI
    static PathLine=PathLine

    static Building={
        BuildMaterial:BuildMaterial,
        // Pretreatment:Pretreatment,
        Tool:Tool
    }

    static PathPlanning=PathPlanning


    static MapLoader=MapLoader

}