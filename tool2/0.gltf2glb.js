
const path1="F:/gitHubRepositories/VisibilityAnalysisAndP2P/dist/assets/space8GLTF/"
const path2="F:/gitHubRepositories/VisibilityAnalysisAndP2P/dist/assets/space8GLB/"
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const gltfPipeline = require('gltf-pipeline');
const fsExtra = require('fs-extra');

function process(index){
    const inputFile  = path1+index+'.gltf';
    const outputFile = path2+index+'.glb';

    
    
    const gltfToGlb = gltfPipeline.gltfToGlb;
    const gltf = fsExtra.readJsonSync(inputFile);
    gltfToGlb(gltf)
        .then(function(results) {
            fsExtra.writeFileSync(outputFile, results.glb);
        }).catch(function(err) {
            console.error('Error:', err);
        });
    
}
let index=0
const number=8437
const interval=setInterval(()=>{
    process(index)
    console.log(index)
    index++
    if(index==number)clearInterval(interval)
},500)

