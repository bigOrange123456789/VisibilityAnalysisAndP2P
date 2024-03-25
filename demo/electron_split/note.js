//npm install electron
const { ipcRenderer } = require('electron');

var helpStr = 'start command:myapp.exe inputpath path_to_zip_file.zip outputdir path_to_output_folder config path_to_config_file.json';
var args = ipcRenderer.sendSync('getCommandLineArgs', helpStr);

ipcRenderer.send('quit', "modelPath or outputPath not exist!");//异步
ipcRenderer.send('quit', "modelPath not exist!");//异步

ipcRenderer.send("downloadJSON", "json str");

ipcRenderer.send("debug", 'str');

ipcRenderer.send('saveBin', binDataString);

new GLTFExporter().parse(scene, async function (result) {
    await ipcRenderer.invoke("exportGltf", JSON.stringify(result));
    if (index === export_end) 
      ipcRenderer.send("quit", "export end");
    else 
        ;// next(index+1);
});
