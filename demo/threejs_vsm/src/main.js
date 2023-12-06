
import { Start } from './Start.js'
// import { StartGPU } from './StartGPU.js'
import { Engine3D } from '../../../lib/Engine3D.js'
// document.addEventListener('DOMContentLoaded', () => {
    const h1=document.getElementById("versionId")
    if(h1)h1.innerHTML="version:09.21;00:39"
    const getParam=id=>{
        id=id+"="
        return window.location.search.split(id).length>1?
                window.location.search.split(id)[1].split("&")[0]:
                null
    }
    const config={}
    config.useGPU=getParam('useGPU')?getParam('useGPU'):true

    window.configALL=config
    // new StartGPU(document.body,config.useGPU)
    new Start(document.body,Engine3D)
    // import { Building } from './Building.js'
    // new Engine3D.StartSampling(document.body,config,Building)

// })
// console.log(config)
export {Engine3D}