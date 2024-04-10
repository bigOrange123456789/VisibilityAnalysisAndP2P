import * as THREE_EX from "../three.js-r129";//import * as THREE_EX from "./electron/threejs/three.module.ex.js"
import { GLTFLoaderEx } from '../three.js-r129/examples/jsm/loaders/GLTFLoaderEx.js';//import { GLTFLoaderEx } from './electron/threejs/GLTFLoaderEx.js'//

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
import{WaterController}from'./threejs/WaterController.js'

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
import {VCG}from'./VCG/VCG.js'

import{MapLoader}from"./MapLoader.js"
import { Classification } from './parametric/Classification.js'
import { CoderDecoder }   from './parametric/CoderDecoder'

import { Shaders }   from './shaders/Shaders.js'

export class Engine3D{
    static versionId="10.31;03:33"
    static THREE_EX=THREE_EX
    static GLTFLoaderEx=GLTFLoaderEx

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
    static WaterController=WaterController

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
    static VCG=VCG


    static MapLoader=MapLoader

    static Classification=Classification
    static CoderDecoder=CoderDecoder

    static Shaders=Shaders


    static loadJson(path,cb){
        // console.log(path)
        var xhr = new XMLHttpRequest()
        xhr.open('GET', path, true)
        xhr.send()
        xhr.onreadystatechange = ()=> {
            if (xhr.readyState == 4 && xhr.status == 200) {
                try {
                    var json_data = JSON.parse(xhr.responseText)
                    cb(json_data)
                } catch(e) {
                    console.log("error",path,e)
                }
                
            }
        }
        xhr.onerror=(err)=>{
            console.log("error(loadJson)",path,err)
        }
    }

}