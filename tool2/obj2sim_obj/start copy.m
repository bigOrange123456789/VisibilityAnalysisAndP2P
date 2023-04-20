clc
addpath('src');
addpath('lib/jsonlab-master');

pathIn="F:/gitHubRepositories/vk-precompute-main/model7/obj/"
pathOut="F:/gitHubRepositories/vk-precompute-main/model7/obj_sim/"

RawFile = dir(pathIn); %提取所有文件
AllFile = RawFile([RawFile.isdir]==0);

hWaitbar = waitbar(0, 'simplify,wait...', 'CreateCancelBtn', 'delete(gcbf)');
for i = 1:size(AllFile,1)
    name=AllFile(i).name;
    list=strsplit(name,'.obj');
    if size(list,2)==2
        compT = i/size(AllFile,1);
        waitbar(compT, hWaitbar, [num2str( round( compT , 4) * 100),'%']);
        name=list(1);
        mesh=Mesh(strcat(pathIn,name));
        
        
        if mesh.nf()>100
            %mesh.simplify(100/mesh.nf());
            %mesh=QEMJson(mesh).simplification(100/mesh.nf());
            mesh=QEMJson(mesh).simplification_face(100);
        end
        %{%}
        
        mesh.download2(strcat(pathOut,name));
    end
end
close(hWaitbar);