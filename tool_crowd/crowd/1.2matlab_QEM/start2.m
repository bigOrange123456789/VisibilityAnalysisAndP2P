
addpath('src');
addpath('lib/jsonlab-master');
number=20;
min=0.5;
main(1);

function main(ratio)
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
        mesh.file_name=strcat(name,string(ratio)); 
        mesh.download()
    end
end
