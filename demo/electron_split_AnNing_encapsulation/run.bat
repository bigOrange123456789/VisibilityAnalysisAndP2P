set current_dir=%~dp0

set sceneName=Test
set sceneID=project_%sceneName%
call activate base
python ./lightWeight/init.py ../dist/assets/%sceneID%

set root_dir=%cd%/../../
set inpath=%root_dir%assets/data/%sceneName%.zip
set outpath=%root_dir%dist/assets/%sceneID%/temp
cd ../../
npx electron . %inpath% %outpath%
echo End all


echo parcel %current_dir%release/index.html
parcel %current_dir%release/index.html
