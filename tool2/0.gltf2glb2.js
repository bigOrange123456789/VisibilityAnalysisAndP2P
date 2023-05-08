
const path1="F:/gitHubRepositories/RemoteGIShare/RTXGIServer/samples/rtxgi-server/data/gltf/gkd/gkd.gltf"
const path2="F:/gitHubRepositories/RemoteGIShare/RTXGIServer/samples/rtxgi-server/data/gltf/gkd/gkd.glb"
const gltfPipeline = require('gltf-pipeline');
const fsExtra = require('fs-extra');

function process(){
    const inputFile  = path1;
    const outputFile = path2;

    
    
    const gltfToGlb = gltfPipeline.gltfToGlb;
    const gltf = fsExtra.readJsonSync(inputFile);
    gltfToGlb(gltf)
        .then(function(results) {
            fsExtra.writeFileSync(outputFile, results.glb);
        }).catch(function(err) {
            console.error('Error:', err);
        });
    
}
process()


