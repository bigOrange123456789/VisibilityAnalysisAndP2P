clc
addpath('src');
addpath('lib/jsonlab-master');

main('manA20.json');

function main_test(ratio,inPath,savePath)
    avatarGroup=Group(inPath);
    avatarGroup.simplify(ratio);
    avatarGroup.path=savePath;
    avatarGroup.download();
end

function avatarGroup=main(inPath)
    
    number=20;
    min=0.01;
    step=(1-min)/(number-1);
    for i =1:19
        avatarGroup=Group(inPath);
        ratio=min+(i-1)*step;    %压缩比
        disp([i,"ratio",ratio])
        savePath=strcat('data/',string(i),'.json'); 
        avatarGroup.simplify(ratio);
        avatarGroup.path=savePath;
        avatarGroup.download();
    end    
end