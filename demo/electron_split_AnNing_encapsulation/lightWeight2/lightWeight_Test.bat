set sceneName=HG14
set insertPath=electron_split_AnNing_encapsulation\lightWeight2
set root_dir=%cd%\..\..\..\
set inpath=%root_dir%dist\assets\models\%sceneName%.zip
set outpath=%root_dir%dist\assets\models
cd ..\..\..\
node %cd%\demo\%insertPath%\updatePackage.js %insertPath% %sceneName%

node %cd%\demo\%insertPath%\move.js %root_dir%\assets\models\%sceneName%_output/full/%sceneName%_output.zip %inpath%
npx electron . %inpath% %outpath%
pause