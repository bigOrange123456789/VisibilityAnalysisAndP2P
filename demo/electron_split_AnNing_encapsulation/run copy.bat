set current_dir=%~dp0

@echo off
if "%1" =="" (goto A) else (goto B) 

:A
echo Please specify the path of '.zip' file!
pause
exit

:B
call activate base
set zipPath="%1"
echo "%1"

call :extract %zipPath%
goto :eof
:extract
rem 获取到文件名称
set sceneName=%~n1

set sceneID=project_%sceneName%
call activate base
python %current_dir%lightWeight/init.py %current_dir%../../dist/assets/%sceneID%

set root_dir=%current_dir%../../
set inpath=%zipPath%
cd %current_dir%
cd ../../
set outpath=%cd%/dist/assets/%sceneID%/temp
echo outpath 
echo %outpath%
npx electron . %inpath% %outpath%
echo End all

pause
cd %current_dir%../../../
parcel %current_dir%release/index.html
