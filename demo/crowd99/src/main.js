// import config_haiNing0 from '../../config/LoadingProgressive/configOP6.json';
// import config_haiNing from '../../config/LoadingProgressive/configOP7.json';
import config_gkd from '../config/configOP8.json';

import { Start } from './Start.js'
// import { StartGPU } from './StartGPU.js'

// document.addEventListener('DOMContentLoaded', () => {
    const getParam=id=>{
        id=id+"="
        return window.location.search.split(id).length>1?
                window.location.search.split(id)[1].split("&")[0]:
                null
    }
    const config=
        // getParam('scene')=="haiNing0"?config_haiNing0:
        // getParam('scene')=="haiNing"?config_haiNing:
        // config_gkd
        config_gkd
    config.useGPU=getParam('useGPU')?getParam('useGPU'):true
    config.src.main.speed       =getParam('speed')?getParam('speed'):config.src.main.speed
    config.src.main.autoMove    =getParam('autoMove')
    config.src.main.render      =getParam('render')
    // config.src.Detection.backURL=getParam('backURL')
    window.quality=config.quality=( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) )
    //getParam('quality')
    if(getParam('list2Len'))
        config.src.Visibility.list2Len=parseFloat(getParam('list2Len'))
    if(getParam('testTime'))
        config.src.Detection.testTime=parseFloat(getParam('testTime'))
    if(getParam('maxBackDelay'))
        config.src.Detection.maxBackDelay=parseFloat(getParam('maxBackDelay'))
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
        config.src.Detection.backURL=backURL    
    }
    config.src.main.useIndirectMaterial = config.src.Building_new.useIndirectMaterial
    config.src.Building_new.NUMBER=getParam('NUMBER')
    config.src.Building_new.TIME=getParam('TIME')

    window.configALL=config
    // new StartGPU(document.body,config.useGPU)
    new Start(document.body)
// })
import { Engine3D } from '../../../lib/Engine3D.js'
export {Engine3D}