set current_dir=%cd%
set inpath=%current_dir%\dataIn\bigCity.zip
set outpath=%current_dir%\dataOut1
cd ../../
npx electron . %inpath% %outpath%