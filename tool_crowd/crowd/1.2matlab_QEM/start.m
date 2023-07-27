
addpath('src');
addpath('lib/jsonlab-master');
number=20;
min=0.5;
step=(1-min)/(number-1);
for i =1:19
    disp(i)
    ratio=min+(i-1)*step;    %压缩比
    savePath=strcat('manA',string(i),'_sav.json'); 
    main(ratio,savePath);
end

function main(ratio,savePath)
    data_list = loadjson('manA20.json');
    cell0=fieldnames(data_list);
    model_result=struct();
    for i = 1:size(cell0,1)
        c=cell0(i);
        name=cell2mat(c);
        disp(name);
        data=getfield(data_list,name);
        mesh=MeshJson(data);
        mesh.simplify(ratio);
        json0=mesh.getJson();
        model_result=setfield(model_result,name,json0);
    end
    str=savejson('',model_result);
    file=fopen(savePath,'w+');
    fprintf(file,'%s',str);
end
