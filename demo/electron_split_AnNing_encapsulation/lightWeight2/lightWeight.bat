set sceneName=Test_new
set insertPath=electron_split_AnNing_encapsulation\lightWeight2
set root_dir=%cd%\..\..\..\
set inpath=%root_dir%dist\assets\models\%sceneName%.zip
set outpath=%root_dir%dist\assets\models
cd ..\..\..\
node %cd%\demo\%insertPath%\updatePackage.js %insertPath%
npx electron . %inpath% %outpath%