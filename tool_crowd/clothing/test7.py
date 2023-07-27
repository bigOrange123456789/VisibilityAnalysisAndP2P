print("version 7.52")
needsave=False
import json
import numpy as np


import sys 
sys.path.append("objPreocess") 
from Mesh import Mesh
body = Mesh('model/woman_origin.obj')
clothing= Mesh('model/Dress1.obj')


vertex0=body.vertex

print("1.每个clothing顶点找出距离最近的5个body点")
distance=[]
for i in range(len(clothing.vertex)):#遍历OBJ顶点
        v=clothing.vertex[i]
        d0=[]
        for j in range(len(body.vertex)):
            w=body.vertex[j]
            d0.append( (v[0]-w[0])**2+(v[1]-w[1])**2+(v[2]-w[2])**2 )
        distance.append(d0)

nearest_index=[]#最近点的索引
nearest_distance=[]
for list in distance:
    arg=np.argsort(list)[0:5]#获取最近的5个特征点的索引
    index0=arg.tolist()
    distance0=[]
    for i in index0:
        distance0.append(list[i]) 
    nearest_index.append(index0)
    nearest_distance.append(distance0)
if needsave:
  with open("nearest_index.json",'w') as file_obj:
    json.dump(nearest_index,file_obj)

print("nearest_index",type(nearest_index),np.array(nearest_index).shape)
print("nearest_distance",type(nearest_distance),np.array(nearest_distance).shape)

print("2.计算权重和偏移量")
nearest_weight=[]
c_b=[]
for i in range(len(nearest_index)): 
    n=nearest_index[i]
    p1=np.array(body.vertex[ n[0] ])
    p2=np.array(body.vertex[ n[1] ])
    p3=np.array(body.vertex[ n[2] ])
    p4=np.array(body.vertex[ n[3] ])
    p5=np.array(body.vertex[ n[4] ])
    d=nearest_distance[i]
    d1=2./5.-d[0]/(d[0]+d[1]+d[2]+d[3]+d[4])  
    d2=2./5.-d[1]/(d[0]+d[1]+d[2]+d[3]+d[4])  
    d3=2./5.-d[2]/(d[0]+d[1]+d[2]+d[3]+d[4])  
    d4=2./5.-d[3]/(d[0]+d[1]+d[2]+d[3]+d[4])  
    d5=2./5.-d[4]/(d[0]+d[1]+d[2]+d[3]+d[4])  
    # print("d1+d2+d3+d4+d5",d1+d2+d3+d4+d5)
    nearest_weight.append([
        d1,d2,d3,d4,d5
    ])
    p_body=np.array(d1*p1+d2*p2+d3*p3+d4*p4+d5*p5)
    p_cloth=np.array(clothing.vertex[ i ])
    c_b.append((p_cloth-p_body).tolist())

if needsave:
  with open("nearest_weight.json",'w') as file_obj:
    json.dump(nearest_weight,file_obj)
  with open("c_b.json",'w') as file_obj2:
    json.dump(c_b,file_obj2)

print("3.加载新的身体")
body2 = Mesh('model/ape_meshlab.obj')
print("body",np.array(body.vertex).shape)
print("body2",np.array(body2.vertex).shape)

print("4.给出形变后服装模型")
cloth_vertex_new=[]
for i in range(len(nearest_index)): 
    n=nearest_index[i]
    p1=np.array(body2.vertex[ n[0] ])
    p2=np.array(body2.vertex[ n[1] ])
    p3=np.array(body2.vertex[ n[2] ])
    p4=np.array(body2.vertex[ n[3] ])
    p5=np.array(body2.vertex[ n[4] ])
    # p1=np.array(body.vertex[ n[0] ])
    # p2=np.array(body.vertex[ n[1] ])
    # p3=np.array(body.vertex[ n[2] ])
    # p4=np.array(body.vertex[ n[3] ])
    # p5=np.array(body.vertex[ n[4] ])
    d=nearest_weight[i]

    p_body2=np.array(d[0]*p1+d[1]*p2+d[2]*p3+d[3]*p4+d[4]*p5)
    p_cloth2=c_b[i]+p_body2
    # print("d[0]+d[1]+d[2]+d[3]+d[4]",d[0]+d[1]+d[2]+d[3]+d[4])
    # print("c_b[i]",c_b[i])
    # print("p_body2",p_body2)
    # print("p_cloth2.tolist()",p_cloth2.tolist())
    # print("clothing.vertex[i]",clothing.vertex[i])
    # exit(0)
    clothing.vertex[i]=p_cloth2.tolist()

clothing.updateVertex()
clothing.download("clothing2.obj")