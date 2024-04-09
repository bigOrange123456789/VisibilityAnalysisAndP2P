set sceneName=Test_new
set sceneID=project_%sceneName%

set root_dir=%cd%\..\..\..\
set inpath=%root_dir%assets\data\%sceneName%.zip
set outpath=%root_dir%dist\assets\models\%sceneID%
cd ..\..\..\
npx electron . %inpath% %outpath%

pause