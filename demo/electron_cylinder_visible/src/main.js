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
    // if(h1)h1.innerHTML="version:"+Engine3D.versionId
    const config=config_gkd// getParam('scene')=="haiNing0"?config_haiNing0:
    new Engine3D.Param(config)
    // new StartGPU(document.body,config.useGPU)
    new Start(document.body)
    // import { Building } from './Building.js'
    // new Engine3D.StartSampling(document.body,config,Building)
// })

export {Engine3D}