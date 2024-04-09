set sceneName=Test
set sceneID=project_%sceneName%
call activate base
python ./init.py ../../../dist/assets/%sceneID%

set root_dir=%cd%/../../../
set inpath=%root_dir%assets/data/%sceneName%.zip
set outpath=%root_dir%dist/assets/%sceneID%/temp
cd ../../../
npx electron . %inpath% %outpath%

pause