classdef Mesh < handle
    %MESH  :  3D�������
    %�̳�handel������ڶ����ڲ��޸Ķ��������
    properties
        flag0%����
        V%��  nv*3
        E%��  ne*3
        F%��  nf*3
        NV%���㷨��
        NF%ƽ�淨��
        file_name%�ļ�����
        matrix0%���������н��еı任
        
        print%���� ������º��Ƿ��Ի��Ƴ���
        voxel_size%���ط����С

        listF %为了和MeshJson的格式保持一致
        
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
        function recordAdd(o,a,b,aPos,bPos,cPos)%为了与meshjson的格式保持一致
        end
        function o = Mesh(file_name)

            
            o.file_name=file_name;
            o.matrix0=eye(4);
            [o.V,o.F] = o.read(file_name);
            o.mergeVertex();
            o.computeNormal();%��������ƽ��ķ���
            o.computeEdge();
            o.computeRimV();
            o.print=0;%��չʾÿ��������µĽ��
            o.voxel_size=min(o.box("size"))/10;
            %��ʼ��¼����Ҫ��ĵ�
            o.flag0=zeros(o.nv(),1);
            for i=1:o.nv()  %o.V=V0;
                if o.V(i,1)<-0.4
                    o.flag0(i,1)=1;
                end
            end
            o.listF=1:o.nf();%为了和MeshJson的格式保持一致

            %��ɼ�¼����Ҫ��ĵ�
            
        end
        function o = Mesh0(file_name)
            o.file_name=file_name;
            o.matrix0=eye(4);
            [o.V,o.F] = o.read(file_name);
            %o.mergeVertex();
            o.computeNormal();%��������ƽ��ķ���
            o.computeEdge();
            o.print=0;%��չʾÿ��������µĽ��
            o.voxel_size=min(o.box("size"))/10;
        end
        function [list3]=mergeVertex(o)
            v1=o.V;
            f1=o.F;
            
            list=zeros(size(v1,1),1);
            for i = 1:size(v1,1)
                list(i)=i;
            end
            
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
        function download2(o,path)
            o.write(path,o.V,o.F);
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
            o.V=(o.m34*mat*(V2'))';
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
            V2=[o.V';ones(o.nv,1)']';%nv*4
            
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
            myQEM=QEM();
            o=myQEM.simplification(o,r);
            if o.print==1
                o.draw();
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
                    a = a';
                end
                if size(a,1)<3 && size(a,2)==3
                    a = a';
                end
                if size(a,1)<=3 && size(a,2)>=3 && sum(abs(a(:,3)))==0
                    % for flat triangles
                    a = a';
                end
                if size(a,1)<vmin ||  size(a,1)>vmax
                    error('face or vertex is not of correct size');
                end
            end
            %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        end%��������
        function computeEdge(o)
            TR = triangulation(o.F,o.V);%���������ʷ֣�����������������
            o.E = edges(TR);%�������бߵĶ�������  ne*2
        end
        function rectifyindex(o)
            %���Ϊ�յĶ���
            %RECTIFYINDEX Summary of this function goes here
            
            
            num_of_NaN=zeros(o.nv(),1);
            sum=0;
            for i=1:o.nv()
                if isnan(o.V(i,1)) % Ϊ�� NaN
                    sum=sum+1;
                end
                num_of_NaN(i)=sum;
            end
            
            recF=zeros(o.nf(),3);%������������䣬�������ڶ�����ı䣬������Ķ���������Ҫ�޸�
            for i=1:o.nf()
                for j=1:3
                    recF(i,j)=o.F(i,j)-num_of_NaN(o.F(i,j));
                end
            end
            
            recV=zeros(o.nv-sum,3);%�ܸ���-Ϊ�յĸ���
            j=1;
            for i=1:o.nv()
                if ~isnan(o.V(i,1))
                    recV(j,:)=o.V(i,:);
                    j=j+1;
                end
            end
            o.V=recV;
            o.F=recF;
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
