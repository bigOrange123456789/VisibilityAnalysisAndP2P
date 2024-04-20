@REM set sceneName=ExhibitionHall
set sceneName=HG14
set insertPath=project2\modelProcessing
set root_dir=%cd%\..\..\..\
set inpath=%root_dir%dist\assets\models\%sceneName%.zip
set outpath=%root_dir%dist\assets\models
cd ..\..\..\
node %cd%\demo\%insertPath%\updatePackage.js %insertPath% %sceneName%
::"SLMConvertor/SLMConvertor.exe" -t "%cd%\demo\%insertPath%\task.json" -dir "SLMConvertor/tools/wdir" -format "Bos3"
::node %cd%\demo\%insertPath%\move.js %root_dir%\assets\models\%sceneName%_output/full/%sceneName%_output.zip %inpath%
npx electron . %inpath% %outpath%
pause