import { Engine3D } from '../../../lib/Engine3D.js'
// import config_haiNing0 from '../config/configOP6.json';
// import config_haiNing from '../config/configOP7.json';
// import config_gkd from '../config/configOP8.json';

// import config_haiNing0 from '../../../config/build/haiNing0.json';
// import config_haiNing  from '../../../config/build/haiNing.json';
import config_gkd      from '../../../config/build/gkd.json';
// import config_gkd      from '../../../config/build/KaiLiNan.json';

// import config9 from '../../config/LoadingProgressive/configOP9.json';
import { Start } from './Start.js'
// import { StartGPU } from './StartGPU.js'
// import { StartSampling } from '../../../lib/StartSampling/StartSampling.js'

// document.addEventListener('DOMContentLoaded', () => {
    const h1=document.getElementById("versionId")
    if(h1)h1.innerHTML="version:09.21;00:39"
    const getParam=id=>{
        id=id+"="
        return window.location.search.split(id).length>1?
                window.location.search.split(id)[1].split("&")[0]:
                null
    }
    const config=
        // getParam('scene')=="haiNing0"?config_haiNing0:
        // getParam('scene')=="haiNing"?config_haiNing:config_gkd
        config_gkd
    console.log("config",config)
    config.useGPU=getParam('useGPU')?getParam('useGPU'):true
    config.main.speed       =getParam('speed')?getParam('speed'):config.main.speed
    config.main.autoMove    =getParam('autoMove')
    config.main.render      =getParam('render')
    config.Detection.backURL=getParam('backURL')
    if(getParam('list2Len'))
        config.Visibility.list2Len=parseFloat(getParam('list2Len'))
    if(getParam('testTime'))
        config.Detection.testTime=parseFloat(getParam('testTime'))
    if(getParam('maxBackDelay'))
        config.Detection.maxBackDelay=parseFloat(getParam('maxBackDelay'))
    if(getParam('backURL')!==null){//backURL需要将autoMove参数传回
        let backURL=getParam('backURL')
        const add=(tag)=>{
            const value=getParam(tag)
            if(value!==null){
                if(backURL.split('?').length>1)backURL+="&"
                else backURL+="?"
                backURL=backURL+tag+"="+value
            }
        }
        add('autoMove')
        add('userId') 
        config.Detection.backURL=backURL    
    }
    config.main.useIndirectMaterial = config.Building.useIndirectMaterial
    if(getParam('NUMBER'))
    config.Building.NUMBER=getParam('NUMBER')
    config.Building.TIME=getParam('TIME')

    window.configALL=config
    // new StartGPU(document.body,config.useGPU)
    new Start(document.body)
    // import { Building } from './Building.js'
    // new Engine3D.StartSampling(document.body,config,Building)

// })
console.log(config)

export {Engine3D}