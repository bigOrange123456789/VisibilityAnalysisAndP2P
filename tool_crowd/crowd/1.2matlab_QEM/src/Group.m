classdef Group < handle
    properties
        children
        path %json文件的存储路径
        listSim %模型简化过程中顶点的处理次序
        names
    end
    properties(Constant,Hidden)
      m34=[1 0 0 0;0 1 0 0;0 0 1 0]
    end
    methods
        function n=nv(this)
            n=0;
            cell0=fieldnames(this.children);
            for i = 1:size(cell0,1)
                name=cell2mat(cell0(i));
                mesh=getfield(this.children,name);
                n=n+mesh.nv();
            end
        end
        function n=nf(this)
            n=0;
            cell0=fieldnames(this.children);
            for i = 1:size(cell0,1)
                name=cell2mat(cell0(i));
                mesh=getfield(this.children,name);
                n=n+mesh.nf();
            end
        end

        function this = Group(pathJson)
            this.path=pathJson;
            this.names="";
            data_list = loadjson(pathJson);
            cell0=fieldnames(data_list);
            meshId=1;
            this.children=struct();
            for i = 1:size(cell0,1)
                name=cell2mat(cell0(i));
                disp(["init",name]);
                data=getfield(data_list,name);
                mesh=MeshJson(data);
                mesh.meshId=meshId;
                %mesh.check();
                meshId=meshId+1;
                this.children=setfield(this.children,name,mesh);
                this.names=strcat(this.names,"^",name);
            end
            this.listSim=[];
        end
        
        function rectifyindex2(this)%删除那些没有被引用的顶点
            cell0=fieldnames(this.children);
            for i = 1:size(cell0,1)
                name=cell2mat(cell0(i));
                mesh=getfield(this.children,name);
                mesh.rectifyindex2();
            end
        end

        function simplify_save(this,surplus,number)
            nf0=this.nf();
            step=round( (nf0-surplus)/(number-1) );
            disp(strcat("三角面个数:",num2str(nf0) ));
            
            %% Start add waitbar
            hWaitbar = waitbar(0, 'simplify,wait...', 'CreateCancelBtn', 'delete(gcbf)');
            set(hWaitbar, 'Color', [0.9, 0.9, 0.9]);

            pack_index=1;   %当前需要输出的数据包的索引
            while true      %每次删除一个顶点(一条边/一个三角面)
                min_cost=Inf;   %正无穷
                min_name="";
                cell0=fieldnames(this.children);
                for i = 1:size(cell0,1)
                    name=cell2mat(cell0(i));
                    mesh=getfield(this.children,name);
                    if size(mesh.E,1)==0 %如果mesh对象中已经没有边了,就停止算法
                        continue;
                    end
                    cost0=mesh.myQEM.simplification_getCost();
                    if cost0<min_cost
                        min_name=name;
                        min_cost=cost0;
                    end
                end
                if min_name~=""
                    mesh=getfield(this.children,min_name);
                    mesh.myQEM.simplification_makeStep(); 
                    this.listSim(size(this.listSim,1)+1)=mesh.meshId;
                else
                    disp("压缩比太高,对象为空!");
                    break; 
                end
                
                nf=this.nf();
                compT = 1-(nf-surplus)/(nf0-surplus);
                waitbar(compT, hWaitbar, ['simplify:', num2str(round(compT, 4) * 100), '%']);
                if nf0-nf>pack_index*step
                    this.path=strcat('data2/',string(number-pack_index),'.json');
                    disp([this.path,strcat(num2str(round(compT, 4) * 100),'%'),strcat("三角面个数:",num2str(nf))]);
                    this.downloadPack();
                    if pack_index>=number-1
                        this.download2();
                        disp("finish");
                        break;
                    end
                    pack_index=pack_index+1;
                end                
            end
            close(hWaitbar);
        end

        function download(this)
            model_result=struct();
            cell0=fieldnames(this.children);
            for i = 1:size(cell0,1)
                name=cell2mat(cell0(i));
                mesh=getfield(this.children,name);
                json0=mesh.getJson();
                model_result=setfield(model_result,name,json0);
            end
            str=savejson('',model_result);
            file=fopen(this.path,'w+');
            fprintf(file,'%s',str);
            fclose(file);
        end
        function downloadPack(this)
            disp(strcat("start pack download:",this.path,".pack.json"));

            model_result=struct();
            cell0=fieldnames(this.children);
            for i = 1:size(cell0,1)
                name=cell2mat(cell0(i));
                mesh=getfield(this.children,name);
                json0=mesh.recordOutput();  %mesh.record似乎为空
                model_result=setfield(model_result,name,json0);
            end
            model_result=setfield(model_result,"listSim",this.listSim);
            model_result=setfield(model_result,"names",this.names);
            str=savejson('',model_result);
            file=fopen(strcat(this.path,".pack.json"),'w+');
            fprintf(file,'%s',str);
            fclose(file);

            disp("end pack download");
        end
        function download2(this)
            disp(strcat("start download:",this.path));
            
            this.rectifyindex2(); %%删除那些没有被引用的顶点
            model_result=struct();
            cell0=fieldnames(this.children);
            for i = 1:size(cell0,1)
                name=cell2mat(cell0(i));
                mesh=getfield(this.children,name);
                json0=mesh.getJson2();
                model_result=setfield(model_result,name,json0);
            end
            str=savejson('',model_result);
            file=fopen(this.path,'w+');
            fprintf(file,'%s',str);
            fclose(file);

            disp("end download");
        end
        

    end%methods
    methods(Hidden)
        function process(this)
        end
    end%methods(Hidden)
    methods(Static)
        function process_save(inPath,percentage,pack_number)
            avatarGroup=Group(inPath);
            if percentage<=1 %输入的是百分比
                surplus=round( percentage*avatarGroup.nf() );
            else %输入的是三角面的个数
                surplus=round( percentage );
            end
            %avatarGroup.children.mesh0.download();
            avatarGroup.simplify_save(surplus,pack_number);
        end
    end%methods(Static)
    methods(Static,Hidden)
        function test()
        end
    end%methods(Static)
end%class
