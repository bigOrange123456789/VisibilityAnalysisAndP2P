classdef QEM < handle
    properties
        %mesh
        QVex %4*4*nv  顶点的矩阵
        QEdge%4*4*ne  边的矩阵
        cost % ne*3 
        v    %4*3*ne  顶点坐标
    end
    methods
        function o= QEM()
        end
        function mesh=simplification(o,mesh,percent )
            o.pretreatment(mesh);
            %开始坍塌%坍塌后的空洞推测是由于“多网格”/“重合点”引起的
            for iii = 1:(1-percent)*mesh.nv()%每次删除一个顶点(一条边/一个三角面)
                [min_cost, vidx] = min(o.cost,[],2);%返回包含每一行的最小值的列向量
                % min_cost:ne*1   vidx:ne*1
                
                [~, k] = min(min_cost);%获取代价最小的边序号
                mesh=o.deleteEdge(k,mesh, vidx);
                
            end
            mesh.rectifyindex();
            
        end%simplification
        function pretreatment(o,mesh)
            N=mesh.NF;
            nv = mesh.nv(); % 顶点个数
            %计算平面方程
            p=getPlane(mesh.V,mesh.F,N);
            function p=getPlane(V,F,N)%所有的平面，n*4
                %p = [N, -sum(N .* V(F(:,1),:), 2)];
                v0=V(F(:,1),:);
                d=sum(v0.*N,2);
                p=[N,-d];%每一行对应一个平面
            end
            
            %计算三角面的矩阵
            QFace = getQFace(p);%面数个4*4的矩阵，size为4*4*n
            function QFace=getQFace(p)
                %bsxfun(@times, permute(p, [2,3,1]), permute(p, [3,2,1]))
                %p的维度是 n*4=n*4*1
                p1=permute(p, [2,3,1]);%4*1*n
                p2=permute(p, [3,2,1]);%1*4*n
                QFace=bsxfun(@times,p1,p2);%4*4*n
            end
            
            %1.计算顶点的矩阵Q
            o.QVex=getQ(mesh.F,QFace,nv);%4*4*nv
            function Q=getQ(F,QFace,nv)
                Q = zeros(4,4,nv);%每个顶点都对应一个4*4的矩阵
                nf = size(F,1);%三角面个数
                for i = 1:nf%遍历三角面
                    for j = 1:3%遍历三角面的顶点
                        v_indx=F(i,j);%获取三角面上的顶点序号
                        Q(:,:,v_indx) = Q(:,:,v_indx) + QFace(:,:,i);%顶点的矩阵等于所有所处三角面的矩阵和
                    end
                end
            end
            
            %2.计算每个边矩阵
            %E=getE(mesh.F,mesh.V);%获取所有边
            ne = size(mesh.E,1);
            o.QEdge = getQEdge(o.QVex,mesh.E);%边矩阵的合理性在于两个端点折叠后的位置相同，计算出所有的边矩阵
            %QEdge:4*4*ne
            function QEdge=getQEdge(Q,E)% compute Q1+Q2 for each pair
                %QEdge = Q(:,:,E(:,1)) + Q(:,:,E(:,2))
                e1=E(:,1);% ne*2 -> ne*1
                e2=E(:,2);
                QEdge = Q(:,:,e1) + Q(:,:,e2);% Q:4*4*nv -> QEdge:4*4*ne
            end
            
            %3.计算每个边的代价
            [o.cost,o.v]=getcost(o,mesh.V,mesh.E,ne,o.QEdge);
            %cost:ne*3 v:4*3*ne
            function [cost,v]=getcost(o,V,E,ne,QEdge)% a simple scheme: select either v1, v2 or (v1+v2)/2
                %v:4*3*ne (坐标+1)*（3个点）*（边数）
                v=getv(V,E,ne);%4*3*ne
                function v=getv(V,E,ne)
                    v1 = getv_4(V,E,ne,1);%4*1*ne
                    v2 = getv_4(V,E,ne,2);
                    function v_4=getv_4(V,E,ne,col)
                        %v1 = permute([V(E(:,1),:),ones(ne,1)], [2,3,1]);%获取边的另一个端点位置
                        %v2 = permute([V(E(:,2),:),ones(ne,1)], [2,3,1]);%获取边的另一个端点位置
                        vertex_index=E(:,col);%边的第一列数据 ne*1
                        vertex_pos=V(vertex_index,:);% V:nv*3 -> vertex_pos:ne*3
                        v_4 = permute([vertex_pos,ones(ne,1)], [2,3,1]);%ne*4*1 ->4*1*ne %获取边的一个端点位置
                    end
                    vm = 0.5 .* (v1 + v2);%获取边的中点位置
                    v = [v1, v2, vm]; % 4*1*ne -> 4*3*ne
                end
                
                cost = zeros(ne,3);%用于记录每条边的代价
                cost(:,1)=o.get_costi(v(:,1,:),QEdge);% ne*1
                cost(:,2)=o.get_costi(v(:,2,:),QEdge);
                cost(:,3)=o.get_costi(v(:,3,:),QEdge);
                
                
                %{
                for i=1:ne
                    if i==1
                        %display(cost(i,1))
                    end
                    if V(E(i,1),1)>0 %如果x>0 代价加100
                        cost(i,1)=cost(i,1)+100;
                        cost(i,2)=cost(i,2)+100;
                        cost(i,3)=cost(i,3)+100;
                    end
                end
                %}
                
            end
            
        end%pretreatment
        function mesh=deleteEdge(o,k,mesh, vidx)
            %k是待删除的边的序号
            e = mesh.E(k,:);%获取边对应的两个顶点
            
            % update position for v1
            mesh.V(e(1),:) = o.v(1:3, vidx(k), k)';%一个顶点坍塌到指定位置
            mesh.V(e(2),:) = NaN;%删除另一个顶点
            
            % update Q for v1  %更新代价矩阵，这里的代价之后似乎重新计算了
            o.QVex(:,:,e(1)) = o.QVex(:,:,e(1)) + o.QVex(:,:,e(2));%e(1)的代价为之前两个点的代价之和
            o.QVex(:,:,e(2)) = NaN;%e(2)的代价为空
            
            %更新三角面
            mesh.F(mesh.F == e(2)) = e(1);%e1、e2都是具体数值 %三角面中e2的索引现在都指向e1
            f_remove = sum(diff(sort(mesh.F,2),[],2) == 0, 2) > 0;%如果三角面中有两个相同的点就应当移除
            mesh.F(f_remove,:) = [];%需要移除的平面置为空
            
            %删除去除的边和与该边相关的信息 collapse and delete edge and related edge information
            mesh.E(mesh.E == e(2)) = e(1);%边中e2的索引现在都指向e1
            mesh.E(k,:) = [];%k是代价最小的边序号，置为空
            o.cost(k,:) = [];%修改边的代价信息
            o.QEdge(:,:,k) = [];%删除边对应的矩阵
            o.v(:,:,k) = [];%v的每行对应一条边
            
            %删除重复的边和与该边相关的信息 delete duplicate edge and related edge information
            [mesh.E,ia] = unique(sort(mesh.E,2), 'rows'); %E:ne*2 获取独一的行（边）
            o.cost = o.cost(ia,:);
            o.QEdge = o.QEdge(:,:,ia);%QEdge:4*4*ne
            o.v = o.v(:,:,ia);
            %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
            % pairs involving v1
            pair = sum(mesh.E == e(1), 2) > 0;%与e1相关的边的序号
            npair = sum(pair);%与e1相关的边的个数
            
            
            % updata edge information
            o.QEdge(:,:,pair) = o.QVex(:,:,mesh.E(pair,1)) + o.QVex(:,:,mesh.E(pair,2));
            %QEdge:4*4*ne  pair:n*1
            
            
            pair_v1 = permute([mesh.V(mesh.E(pair,1),:),ones(npair,1)], [2,3,1]);
            pair_v2 = permute([mesh.V(mesh.E(pair,2),:),ones(npair,1)], [2,3,1]);
            %pair_v2:3*1*n       V(E(pair,2),:))--n*3
            %pair_v2:3*1*1       V(E(pair,2),:))--1*3
            pair_vm = 0.5 .* (pair_v1 + pair_v2);
            o.v(:,:,pair) = [pair_v1, pair_v2, pair_vm];
            
            
            %更新所有与e1相关的边的代价
            o.cost(pair,1) =o.get_costi(pair_v1,o.QEdge(:,:,pair));
            o.cost(pair,2) =o.get_costi(pair_v2,o.QEdge(:,:,pair));
            o.cost(pair,3) =o.get_costi(pair_vm,o.QEdge(:,:,pair));
            % cost(pair,1) =sum(squeeze(sum(bsxfun(@times,pair_v1,QEdge(:,:,pair)),1)).*squeeze(pair_v1),1)';
        end%deleteEdge
    end% methods
    methods(Static)
        function costi=get_costi(vi,QEdge)
            costi=QEM.get_costi0(vi,QEdge);
        end
        function costi=get_costi1(vi,QEdge)
            %输入  vi:4*1*ne    QEdge:4*4*ne
            %输出  costi：ne*1
            %统一使用边矩阵？，感觉不是很合理
            bsx=bsxfun(@times,QEdge,vi); %{QEdge:4*4*ne   vi:4*1*ne } -> 4*4*ne
            
            s=sum(bsx,1);               % 4*4*ne -> 1*4*ne
            s=permute(s, [2,1,3]);%!!!!!!!!!!!!!!!!!解决了BUG
            costi=sum(squeeze(s).*squeeze(vi),1)';
            %           s:1*4*ne  vi:4*1*ne
            % ne*1 = {  1*4*ne ,  4*1*ne  }'
            %坐标z>=0的点删除代价加大
            
            for i=1:size(vi,3) %  vi:4*1*ne
                if vi(3,1,i)>=0  %z>=-1
                    costi(i)=costi(i)*10000000;%最前面
                elseif vi(3,1,i)>=-1  %z>=0
                    costi(i)=costi(i)*1000;%中间
                end
            end
        end
        function costi=get_costi0(vi,QEdge)
            %输入  vi:4*1*ne    QEdge:4*4*ne
            %输出  costi：ne*1
            %统一使用边矩阵？，感觉不是很合理
            bsx=bsxfun(@times,QEdge,vi); %{QEdge:4*4*ne   vi:4*1*ne } -> 4*4*ne
            
            s=sum(bsx,1);               % 4*4*ne -> 1*4*ne
            s=permute(s, [2,1,3]);%!!!!!!!!!!!!!!!!!解决了BUG
            costi=sum(squeeze(s).*squeeze(vi),1)';
            %           s:1*4*ne  vi:4*1*ne
            % ne*1 = {  1*4*ne ,  4*1*ne  }'
        end
    end%methods(Static)
end%class

