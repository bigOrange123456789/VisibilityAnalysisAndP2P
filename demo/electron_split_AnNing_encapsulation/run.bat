set current_dir=%cd%
set root_dir=%current_dir%/../../
set inpath=%root_dir%assets/project1/bigCity.zip
set outpath=%root_dir%dist/assets/project1/temp
cd ../../
npx electron . %inpath% %outpath%
node ./lightWeight/split_compress.js