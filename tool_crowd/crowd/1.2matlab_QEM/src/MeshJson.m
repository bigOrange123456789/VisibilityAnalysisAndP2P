classdef MeshJson < handle
    properties
        flag0
        V%��  nv*3
        E%��  ne*3 
        F%��  nf*3
        NV
        NF
        file_name
        matrix0
        
        list    %去除重合的点
        list2   %去除为空的点 list是顶点id吗:是顶点id
        listF 

        uv
        skinWeight
        skinIndex
        
        print       %���� ������º��Ƿ��Ի��Ƴ���
        voxel_size  %���ط����С

        myQEM

        recV
        recF

        record
        recordSize

        meshId %由group对象设置的mesh对象编号

        rimE_flag   %标记每一条边是否在网格面的边缘
        rimV_flag   %标记每一个点是否在网格面的边缘

    end
    properties(Constant,Hidden)
      m34=[1 0 0 0;0 1 0 0;0 0 1 0]
    end
    methods
        function n=nv(o)
            n=size(o.V,1);
        end
        function n=nv2(o)
            n=size(o.recV,1);
        end
        function n=ne(o)
            n=size(o.E,1);
        end
        function n=nf(o)
            n=size(o.F,1);
        end
        function out=box(o,type)
            box0=[min(o.V);max(o.V)];
            if nargin==1
                out=box0;
            else
                if type=="max"
                    out=box0(1,:);
                elseif type=="min"
                    out=box0(2,:);
                else%size
                    out=box0(2,:)-box0(1,:);
                end
            end
        end
        function computeRimE(o)
            ne=o.ne();
            e_flag0=zeros(1,ne);
            for i =1:ne
                a=o.E(i,1);
                b=o.E(i,2);
                f=zeros(size(o.F));
                f(:)=o.F(:);
                f(f == b) = a;  %边中e2的索引现在都指向e1
                
                temp=sum(f == a, 2) ;
                e_flag=temp>1 ;
                %disp(a);
                %disp(b);
                %disp([a,b,sum(e_flag)]);
                %disp([a,b]);
                %disp(e_flag);
                %e_flag0=e_flag0+e_flag;
                e_flag0(i)=sum(temp>1)<2;
                
            end
            o.rimE_flag=e_flag0;
        end
        function computeRimV(o)
            o.computeRimE();
            nv=o.nv();
            v_flag0=zeros(1,nv);

            e_flag0=o.rimE_flag;
            ne=o.ne();
            for i =1:ne
                if e_flag0(i)==1
                    a=o.E(i,1);
                    b=o.E(i,2);
                    v_flag0(a)=1;
                    v_flag0(b)=1;
                end
            end
            o.rimV_flag=v_flag0;
        end
        function o = MeshJson(file_name)
            o.meshId=0;
            o.matrix0=eye(4);
            if class(file_name)=="string"
                addpath('lib/jsonlab-master');
                data_list = loadjson(file_name+'.json');
                data=data_list.Suzanne;
            
                o.file_name=file_name;
                %[o.V,o.F] = o.read(file_name);
            else
                data=file_name;
                o.file_name="";
            end
            
            o.V=reshape(data.position,3,[])';
            o.F=reshape(data.index,3,[])'+1;
            o.uv=reshape(data.uv,2,[])';
            o.skinWeight=reshape(data.skinWeight,4,[])';
            o.skinIndex=reshape(data.skinIndex,4,[])';  %'
            
            %{
            %%#####测试案例########
            o.V=[0,0,0; 5,6,9; 9,1,0; 1,7,9;     9,6,1; 0,8,0; 9,1,8; 9,1,6;  3,1,9 ];
            o.F=[1,2,3; 2,4,5; 2,3,5; 3,5,6;     4,5,7; 5,6,8; 5,7,8; 7,8,9];
            o.uv=[0,0; 5,6; 9,1; 1,7;     9,6; 0,8; 9,1; 9,1;  3,1 ];
            o.skinWeight=[0,0,0,0; 5,6,9,0; 9,1,0,0; 1,7,9,0;     9,6,1,0; 0,8,0,0; 9,1,8,0; 9,1,6,0;  3,1,9,0 ];
            o.skinIndex= [0,0,0,0; 5,6,9,0; 9,1,0,0; 1,7,9,0;     9,6,1,0; 0,8,0,0; 9,1,8,0; 9,1,6,0;  3,1,9,0 ];
            %%#####测试案例########
            %}

            o.listF=1:o.nf();
            o.list=o.mergeVertex();
            o.computeNormal();
            o.computeEdge();
            o.computeRimV();
            %disp(o.E);
            %error("test!")
            o.print=0;
            o.voxel_size=min(o.box("size"))/10;
            o.flag0=zeros(o.nv(),1);
            for i=1:o.nv()  %o.V=V0;
                if o.V(i,1)<-0.4
                    o.flag0(i,1)=1;
                end
            end

            o.myQEM=QEMJson(o);
            o.recordInit();
        end
        function recordInit(o)
            o.record=repmat(struct(... %每个结构体对应坍塌一条边对应的变化
                "aI",0,...          %顶点a编号
                "bI",0,...          %顶点a编号
                "aPos",[],...       %顶点a信息
                "bPos",[],...       %顶点b信息
                "cPos",[],...       %合并后的顶点信息
                "faceRe",[],...     %更新的三角面编号
                "face",struct("x",[],"y",[],"z",[],"d",[]),... %增加/删除的三角面
                "aUV",[],...
                "aSkinWeight",[],...
                "aSkinIndex",[],...
                "bUV",[],...
                "bSkinWeight",[],...
                "bSkinIndex",[]...
                ),o.nv(),1);
            o.recordSize=0;
        end
        function recordAdd(o,a,b,aPos,bPos,cPos)
            %{
            disp("[aPos,bPos]");
            disp([aPos,bPos]);
            %}

            aI=o.list(a);
            bI=o.list(b);
            o.recordSize=o.recordSize+1;
            i=o.recordSize;
            o.record(i).aI=aI;
            o.record(i).bI=bI;
            o.record(i).aPos=aPos;
            o.record(i).bPos=bPos;
            o.record(i).cPos=cPos;

            o.record(i).aUV=o.uv(aI,:);
            o.record(i).aSkinWeight=o.skinWeight(aI,:);
            o.record(i).aSkinIndex=o.skinIndex(aI,:);

            o.record(i).bUV=o.uv(bI,:);
            o.record(i).bSkinWeight=o.skinWeight(bI,:);
            o.record(i).bSkinIndex=o.skinIndex(bI,:);

            f=zeros(size(o.F));
            f(:)=o.F(:);
            f(f == b) = a;  %边中e2的索引现在都指向e1
            
            f_remove = sum(diff(sort(f,2),[],2) == 0, 2) > 0;  %如果三角面中有两个相同的点就应当移除
            for k =1:size(f_remove,1)
                if f_remove(k)
                    f0=o.F(k,:);
                    d0=o.listF(k);
                    j=size(o.record(i).face.x,2)+1;
                    
                    %{
                    if sum(size(o.record(i).face.x,2)+1)>2
                        "sum(size(o.record(i).face.x,2)+1)>2"
                        disp([aI,size(o.record(i).face.x,2)+1]);
                    end
                    %}
                    
                    o.record(i).face.x(j)=f0(1);
                    o.record(i).face.y(j)=f0(2);
                    o.record(i).face.z(j)=f0(3);
                    o.record(i).face.d(j)=d0;
                end
            end
            
            %{
            if sum(f_remove)==0
                "sum(f_remove)==0"
                [sum(f_remove),size(o.record(i).face.x,1),sum(sum(f==a,2)==2)]
                "a,b"
                [a,b]
                
                e=zeros(size(o.E));
                e(:)=o.E(:);
                e(e==b)=a;
                "sum(sum(e==a,2)==2)"
                sum(sum(e==a,2)==2)

                
                %{
                "V"
                o.V
                "F"
                o.F
                "E"
                o.E
                %}
            end
            %}

            

            updateIndex= sum(f==a,2)==1;    %三角形中现在有了a且未被删除
            updateIndexNo=sum(o.F==a,2)==1; %三角形中原本有a
            for k =1:size(updateIndex,1)
                if updateIndex(k) & ~updateIndexNo(k) %原本没有,现在有的三角形需要更新
                    j=size(o.record(i).faceRe,2)+1;
                    o.record(i).faceRe(j)=o.listF(k);
                end
            end

            %o.meshId
            %o.record(i)
            %o.record(i).face
            %{
            if o.nf()<5
                o.record(i)
                o.record(i).face
            end
            %}

        end
        function out=recordOutput(o)
            out=o.record(1:o.recordSize);
            o.recordInit();
        end
        function [list3]=mergeVertex(o)
            v1=o.V;
            f1=o.F;
            
            list=zeros(size(v1,1),1);
            for i = 1:size(v1,1)
                list(i)=i;
            end
            %{
            for i = 1:size(v1,1)
                for j = 1:i
                    a=v1(i,:);
                    b=v1(j,:);
                    if a(1)==b(1)&&a(2)==b(2)&&a(3)==b(3)
                        list(i)=j;
                        break;
                    end
                end
            end
            %}
            for i =1:o.nf() %修改顶点索引似乎会影响最后的效果
                for j =1:3
                    o.F(i,j)=list(o.F(i,j));
                end
            end

            list2=zeros(size(v1,1),1);
            index=1;
            for i = 1:size(list,1)
                count=0; %记录list中i的个数
                for j = 1:size(list,1)
                    if i==list(j)
                        count=count+1;
                    end
                end
                if count>0
                    list2(list==i)=index;
                    index=index+1;
                end
            end

            v2=zeros(index-1,3);    %index是下一个顶点的编号,index-1是顶点个数
            for i = 1:size(list,1)
                j=list2(i);
                v2(j,:)=v1(i,:);
            end
            
            f2=list2(f1);
            
            o.V=v2;
            o.F=f2;
            
            list3=zeros(index-1,1);
            for i = 1:size(list2,1)
                j=list2(i);
                list3(j)=i;
            end
        end
        function download(o)
            %inv(o.matrix0);
            o.write(o.file_name+"_save",o.V,o.F);
        end
        function data=getJson(o)
            uv0=o.uv;
            skinWeight0=o.skinWeight;
            skinIndex0=o.skinIndex;

            uv=zeros(o.nv(),2);
            skinWeight=zeros(o.nv(),4);
            skinIndex=zeros(o.nv(),4);

            for i =1:o.nv()
                j=o.list(i);
                uv(i,:)=uv0(j,:);
                skinWeight(i,:)=skinWeight0(j,:);
                skinIndex(i,:) =skinIndex0(j,:);
            end

            position=o.V';
            uv=uv';
            skinWeight=skinWeight';
            skinIndex=skinIndex';
            index=o.F'-1;
            data=struct( ... 
                'position', position(:)', ... 
                'uv', uv(:)', ... 
                'skinWeight', skinWeight(:)', ... 
                'skinIndex', skinIndex(:)', ... 
                'index',index(:)'...
            );
            %data=savejson(data);
        end
        function data=getJson2(o)
            
            uv0=o.uv;
            skinWeight0=o.skinWeight;
            skinIndex0=o.skinIndex;

            uv=zeros(o.nv2(),2);
            skinWeight=zeros(o.nv2(),4);
            skinIndex=zeros(o.nv2(),4);

            for i =1:o.nv2()
                j=o.list2(i);
                uv(i,:)=uv0(j,:);
                skinWeight(i,:)=skinWeight0(j,:);
                skinIndex(i,:) =skinIndex0(j,:);
            end

            
            index=o.recF'-1;  %o.F'-1;
            position=o.recV';   %o.V';
            uv=uv';
            skinWeight=skinWeight';
            skinIndex=skinIndex';
            
            data=struct( ... 
                'position', position(:)', ... 
                'uv', uv(:)', ... 
                'skinWeight', skinWeight(:)', ... 
                'skinIndex', skinIndex(:)', ... 
                'index',index(:)', ...
                'vId',o.list2', ... %'
                'fId',o.listF ...
            );
            %data=savejson(data);
        end
        function downloadJson(o)
            position=o.V';
            index=o.F'-1;
            data=struct( ... 
                'position', position(:)', ... 
                'index',index(:)'... 
            );
            o.savejson("test.json",data)
        end
        function savejson(o,name,data)
            str=savejson("Suzanne",data);
            file=fopen(name,'w+');
            fprintf(file,'%s',str);
        end
        function reset(o)
            o.applyMatrix(inv(o.matrix0));
        end
        function draw(o)
            clf
            trimesh(o.F, o.V(:,1), o.V(:,2), o.V(:,3),'LineWidth',1,'EdgeColor','k');
            axis equal
            %axis off %����������
            camlight
            lighting gouraud
            cameratoolbar%����һ��������
            drawnow
            o.print=1;%չʾÿ��������µĽ��
        end
        
        function applyMove(o,in1,in2,in3)
            if nargin==2
                d=in1;
            else
                d=[in1,in2,in3];
            end
            o.applyMatrix([1 0 0 d(1);0 1 0 d(2);0 0 1 d(3);0 0 0 1]);
        end
        function applyRotation(o,in1,in2,in3)
            if nargin==2
                in=in1;
            else
                in=[in1,in2,in3];
            end
            o.applyMatrix(rotx(in(1))*roty(in(2))*rotz(in(3)));
        end
        function applyScale(o,in1,in2,in3)
            if nargin==2
                s=in1;
            else
                s=[in1,in2,in3];
            end
            o.applyMatrix([s(1) 0 0;0 s(2) 0;0 0 s(3)]);
        end
        function applyMatrix1(o,mat)
            if length(mat)==3
                mat=[mat;[0 0 0]];
                mat=[mat';[0 0 0 1]]';
            end
            V0=o.V; %��¼�޸�ǰ�����
            V2=[o.V';ones(o.nv,1)']';%nv*4
            o.V=(o.m34*mat*(V2'))';%'
            %m=Mesh("man");m.draw();
            %m.applyMove(-0.4,0.44,0)
            for i=1:o.nv()  %o.V=V0;
                if o.flag0(i,1)==1
                    o.V(i,1)=V0(i,1);
                    o.V(i,2)=V0(i,2);
                    o.V(i,3)=V0(i,3);
                end
            end
            
            
            o.matrix0=mat*o.matrix0;%��¼���еı任
            if o.print==1
                o.draw();
            end
        end
        function applyMatrix(o,mat)
            if length(mat)==3
                mat=[mat;[0 0 0]];
                mat=[mat';[0 0 0 1]]';
            end
            V2=[o.V';ones(o.nv,1)']';%nv*4 %'
            
            o.V=(o.m34*mat*(V2'))';
            o.matrix0=mat*o.matrix0;%��¼���еı任
            if o.print==1
                o.draw();
            end
        end
        function normal(o)
            %��ת
            voxel=o.voxelization();
            mean0 = mean(voxel);% ������ֵ
            Z = voxel-repmat(mean0,length(voxel), 1);%��ȥ��ֵ
            covMat = Z' * Z;% covMat Э������� %r*3 3*r
            [mat,~] = eigs(covMat, 3);% Vÿһ��Ϊһ����������
            o.applyMatrix(mat');%����������
            
            %��ת
            voxel=o.voxelization();
            size(voxel)
            mean0 = mean(voxel);% ������ֵ
            Z = voxel-repmat(mean0,length(voxel), 1);%��ȥ��ֵ
            o.applyScale((sum(Z.^3)>0)*2-1);%ȡx^3����0�ķ���Ϊ������
            
            %�ƶ�
            voxel=o.voxelization();
            mean0 = mean(voxel);% ������ֵ
            mean0
            %o.applyMove(mean0.*-1);
            
            
            %����
            %voxel=o.voxelization();
            %d=sum((voxel-mean(voxel)).^2);
            %d=sum(voxel.^2);
            %o.applyScale(ones(1,3)./(d.^0.5));%���Ա�׼��
            
        end
        function vector=feature(o)
            vector=SH.getFeature(o);
        end
        function simplify(o,r)
            o=o.myQEM.simplification(o,r);
            if o.print==1
                o.draw();
            end
        end
        function check(this)
            e=this.E;
            for i =1:size(e,1)
                a=e(i,1);
                b=e(i,2);
                f=zeros(size(this.F));
                f(:)=this.F(:);
                f(f==b)=a;
                if sum(sum(f==a,2)==2)==0
                    "异常边："
                    disp([a,b,sum(sum(f==a,2)==2)])
                    
                end

            end
        end
        function check_e(this,e)
            a=e(1);
            b=e(2);
            f=zeros(size(this.F));
            f(:)=this.F(:);
            f(f==b)=a;
            if sum(sum(f==a,2)==2)==0
                "异常边："
                disp([a,b,sum(sum(f==a,2)==2)])
                
            end
        end
    end%methods
    methods(Hidden)
        function process(this)
            myQEM=QEM();
            this=myQEM.simplification(this,0.5);
            this.download();
        end
        function computeNormal(o)
            %���룺 vertex��nv*3   face:nf*3
            %�����
            % compute_normal - compute the normal of a triangulation
            %
            %   [normal,normalf] = compute_normal(vertex,face);
            %
            %   normal(i,:) is the normal at vertex i.
            %   normalf(j,:) is the normal at face j.
            
            
            [vertex,face] = check_face_vertex(o.V,o.F);
            %vertex��3*nv   face:3*nf
            
            nface = size(face,2);
            nvert = size(vertex,2);
            
            % unit normals to the faces ��λ�淨��
            normalf = crossp( vertex(:,face(2,:))-vertex(:,face(1,:)), ...
                vertex(:,face(3,:))-vertex(:,face(1,:)) );
            d = sqrt( sum(normalf.^2,1) );
            d(d<eps)=1;%eps�Ǽ�Сֵ
            normalf = normalf ./ repmat( d, 3,1 );%�淨�ߵ�λ��
            
            % unit normal to the vertex
            normal = zeros(3,nvert);%���㷨�� normal:3*nv
            for i=1:nface
                f = face(:,i);
                for j=1:3
                    normal(:,f(j)) = normal(:,f(j)) + normalf(:,i);
                end
            end
            % normalize
            d = sqrt( sum(normal.^2,1) ); d(d<eps)=1;
            normal = normal ./ repmat( d, 3,1 );
            
            % enforce that the normal are outward
            v = vertex - repmat(mean(vertex,1), 3,1);
            s = sum( v.*normal, 2 );
            if sum(s>0)<sum(s<0)
                % flip
                normal = -normal;
                normalf = -normalf;
            end
            o.NV=normal';
            o.NF=normalf';
            %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
            function z = crossp(x,y)%x,y���Կ��������ε������ߣ�z�Ǻ����Ǵ�ֱ�ķ���
                % x and y are (m,3) dimensional
                z = x;
                z(1,:) = x(2,:).*y(3,:) - x(3,:).*y(2,:);
                z(2,:) = x(3,:).*y(1,:) - x(1,:).*y(3,:);
                z(3,:) = x(1,:).*y(2,:) - x(2,:).*y(1,:);
            end
            %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
            function [vertex,face] = check_face_vertex(vertex,face)
                
                % check_face_vertex - check that vertices and faces have the correct size
                %
                %   [vertex,face] = check_face_vertex(vertex,face);
                %
                %   Copyright (c) 2007 Gabriel Peyre
                
                vertex = check_size(vertex,2,4);
                face = check_size(face,3,4);
            end
            %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
            function a = check_size(a,vmin,vmax)
                if isempty(a)
                    return;
                end
                if size(a,1)>size(a,2)
                    a = a'; %'
                end
                if size(a,1)<3 && size(a,2)==3
                    a = a';%'
                end
                if size(a,1)<=3 && size(a,2)>=3 && sum(abs(a(:,3)))==0
                    % for flat triangles
                    a = a';%'
                end
                if size(a,1)<vmin ||  size(a,1)>vmax
                    error('face or vertex is not of correct size');
                end
            end
            %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        end
        function computeEdge(o)
            TR = triangulation(o.F,o.V);    %进行三角剖分，梳理出所有三角形
            o.E = edges(TR);                %返回所有边的顶点索引  ne*2
        end
        function rectifyindex2(o)    %QEM算法会将删除的顶点设置为空,现在需要将空顶点删除           
            num_of_NaN=zeros(o.nv(),1);%生成一个list,用来记录每个顶点前方空顶点的个数
            sum=0;  % sum用于统计未被引用的顶点个数
            for i=1:o.nv()
                if isnan(o.V(i,1))  % 为空NaN => 这是一个被删除的顶点
                    sum=sum+1;
                end
                num_of_NaN(i)=sum;
            end
            
            recF=zeros(o.nf(),3);
            for i=1:o.nf() %三角面个数不变，但是由于顶点个改变，三角面的顶点索引需要修改
                for j=1:3
                    recF(i,j)=o.F(i,j)-num_of_NaN(o.F(i,j));
                end
            end
            
            recV     =zeros(o.nv()-sum,3); %总个数-为空的个数
            rimV_flag=zeros(o.nv()-sum,1); %准备更新边缘点标记
            j=1;
            for i=1:o.nv()
                if ~isnan(o.V(i,1))
                    recV(j,:)=o.V(i,:);
                    rimV_flag(j)=o.rimV_flag(i);
                    j=j+1;
                end
            end
            o.rimV_flag=rimV_flag;
            
            %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
            list_new=zeros(size(recV,1),1);
            index=1;
            for i=1:size(num_of_NaN,1)
                if ~isnan(o.V(i,1))
                    aaaa=o.list(i);
                    bbbb=list_new(index);
                    list_new(index)=o.list(i);
                    index=index+1;
                end
            end
            o.list2=list_new;
            %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

            o.recV=recV;    %o.V=recV;
            o.recF=recF;    %o.F=recF;
            
        end
        function voxel2=voxelization(o)
            box=o.box();
            box_size=box(2,:)-box(1,:);
            step=min(box_size)*o.voxel_size;%���ط����С
            if step==0
                step=1;
            end
            %box_size_step=ceil(box_size./step);
            voxel=zeros(ceil(box_size/step));%zeros(box_size_step);
            for i=1:o.nf()
                oF=o.F();
                v1=o.V(oF(i,1),:);
                v2=o.V(oF(i,2),:);
                v3=o.V(oF(i,3),:);
                voxel=addF(v1,v2,v3,voxel,box,step);
            end
            voxelSize=size(voxel);
            voxel2=zeros(sum(voxel,"all"),3);
            index=1;
            for i1=1:voxelSize(1)
                for i2=1:voxelSize(2)
                    for i3=1:voxelSize(3)
                        if voxel(i1,i2,i3)==1
                            voxel2(index,:)=[i1,i2,i3];
                            index=index+1;
                        end
                    end
                end
            end
            voxel2=voxel2.*o.voxel_size;%+repmat(box(1,:),length(voxel),1);%���ط����С
            function voxel=addF(v1,v2,v3,voxel,box,step)
                for A=0:0.2:1
                    for B=0:0.2:(1-A)
                        v=v1.*A+v2.*B+v3.*(1-A-B);
                        voxel=addV(v,voxel,box,step);
                    end
                end
            end
            function voxel=addV(v,voxel,box,step)
                v
                v=v-box(1,:);
                v=round(v./step);
                %v=v+ones(size(v));
                if v(1)==0
                    v(1)=1;
                end
                if v(2)==0
                    v(2)=1;
                end
                if v(3)==0
                    v(3)=1;
                end
                voxel(v(1),v(2),v(3))=1;
                %voxel(v(1),v(2),v(3))=1;
            end
        end
        function voxel=voxelization0(o)
            box=o.box();
            box_size=box(2,:)-box(1,:);
            step=min(box_size)*o.voxel_size;%���ط����С
            if step==0
                step=1;
            end
            %box_size_step=ceil(box_size./step);
            voxel=[];%zeros(box_size_step);
            for i=1:o.nf()
                oF=o.F();
                v1=o.V(oF(i,1),:);
                v2=o.V(oF(i,2),:);
                v3=o.V(oF(i,3),:);
                voxel=addF(v1,v2,v3,voxel,box,step);
            end
            voxel=voxel.*o.voxel_size;%+repmat(box(1,:),length(voxel),1);%���ط����С
            function voxel=addF(v1,v2,v3,voxel,box,step)
                for A=0:0.2:1
                    for B=0:0.2:(1-A)
                        v=v1.*A+v2.*B+v3.*(1-A-B);
                        voxel=addV(v,voxel,box,step);
                    end
                end
            end
            function voxel=addV(v,voxel,box,step)
                v=v-box(1,:);
                v=round(v./step);
                %v=v+ones(size(v));
                if v(1)==0
                    v(1)=1;
                end
                if v(2)==0
                    v(2)=1;
                end
                if v(3)==0
                    v(3)=1;
                end
                voxel=[voxel;[v(1),v(2),v(3)]];
                %voxel(v(1),v(2),v(3))=1;
            end
        end
        function drawVoxel(o)
            voxel=o.voxelization();
            size(voxel)
            for i=1:length(voxel)
                o.drawCube(voxel(i,:),o.voxel_size);
            end
            %shpCubeWithSphericalCavity = alphaShape(voxel(:,1),voxel(:,2),voxel(:,3));
            %figure;
            %plot(shpCubeWithSphericalCavity,'FaceAlpha',0.5);
        end
    end%methods(Hidden)
    methods(Static)
        function mat=getAffineMatrix(url1,url2)
            m1=Mesh(url1);
            m2=Mesh(url2);
            m1.normal();
            m2.normal();
            mat=(eye(4)/m2.matrix0)*m1.matrix0;
        end
        function l=distance(v1,v2)
            l1=sum(v1.^2).^0.5;
            l2=sum(v2.^2).^0.5;
            v1=v1/l1;
            v2=v2/l2;
            l=sum((v1-v2).^2)^0.5;
        end
        function [vertex,faces] = read(filename)
            vertex = [];
            faces = [];
            fid = fopen(filename+".obj");%fid��һ������0������
            s = fgetl(fid);
            while ischar(s)
                if ~isempty(s)
                    if strcmp(s(1), 'f')%����ַ�����һ���ַ�Ϊf %face
                        %  F V1 V2 V3 ...
                        %  F V1/VT1/VN1  ...
                        %  F V1//VN1  ...
                        str2=strsplit(s," ");
                        coordinate1=strsplit(cell2mat(str2(2)),"/");
                        if isempty(length(coordinate1)==1)
                            faces(end+1,:) =sscanf(s(3:end), '%d %d %d');
                        else
                            coordinate2=strsplit(cell2mat(str2(3)),"/");%length(str2num("1 "))
                            coordinate3=strsplit(cell2mat(str2(4)),"/");
                            faces(end+1,:) = [
                                str2double(coordinate1(1))
                                str2double(coordinate2(1))
                                str2double(coordinate3(1))
                                ];
                        end
                    elseif strcmp(s(1), 'v')&&strcmp(s(2), ' ')% ����ַ�����һ���ַ�Ϊ"v " %vertex
                        vertex(end+1,:) = sscanf(s(3:end), '%f %f %f');
                    end%vertex����һ�С������һ��  s�ӵ������ַ���ʼ�����һ��
                end
                s = fgetl(fid);%��ȡ��һ��
            end
            fclose(fid);
        end
        function write(filename,vertices,faces )
            fid=fopen(filename+".obj",'w');
            fid=arrPrintf(fid,vertices,'v');
            fid=arrPrintf(fid,faces,'f');
            fclose(fid);
            function fid=arrPrintf(fid,arr,head)
                [x,y]=size(arr);
                for i=1:x
                    fprintf(fid,head);
                    for j=1:y
                        fprintf(fid,' %d',arr(i,j));
                    end
                    fprintf(fid,'\n');%ÿһ�лس�\n �0�2
                end
            end
        end
        function drawCube(in,size)
            x=in(1);y=in(2);z=in(3);
            a = size;b = size;c = size;
            % 8������ֱ�Ϊ��
            % ��(0,0,0)���ڵ�4������
            % ��(a,b,c)���ڵ�4������
            V = [
                0 0 0;
                a 0 0;
                0 b 0;
                0 0 c;
                a b c;
                0 b c;
                a 0 c;
                a b 0];
            V(:,1)=V(:,1)-a/2+x;
            V(:,2)=V(:,2)-b/2+y;
            V(:,3)=V(:,3)-c/2+z;
            % 6����
            % ��(0,0,0)Ϊ�����������
            % ��(a,b,c)Ϊ�����������
            F = [1 2 7 4;1 3 6 4;1 2 8 3;
                5 8 3 6;5 7 2 8;5 6 4 7];
            hold on
            patch('Faces',F,'Vertices',V,'FaceColor','none','LineWidth',1.5);
        end
    end%methods(Static)
    methods(Static,Hidden)%���ڲ��Եķ���
        function test()
            mesh=Mesh("man_sim2");
            myQEM=QEM();
            mesh=myQEM.simplification(mesh,0.1);
            mesh.download();
        end
        function test2()
            mesh=Mesh("mesh2");
            mesh.box();
            mesh.applyMatrix([
                1 0 0 ;
                0 0 1 ;
                0 1 0 
                ]);
            voxel=mesh.voxelization();
            size(voxel);
            %sum(voxel,"all")
            mesh.normal();
            mesh.draw();
            %mesh.download();
        end
        function test3()
            %untitled
            Mesh.read("untitled");
        end
    end%methods(Static)
end%class
