import numpy as np
import json
import math
class Sphere:
    def __init__(self,arr):
        self.arr=np.array(arr)
        self.number=len(arr)#实例化球的个数
        if self.number==0:
            return
        self.radius=arr[0][3]
        self.sphereMax=self.getInstancedBounding()
    def getInstancedBounding(self):
        bounding_arr=self.arr#np.array(bounding_arr)
        max=np.max(bounding_arr,axis=0)
        min=np.min(bounding_arr,axis=0)
        r=max[3]
        max=max[0:3]
        min=min[0:3]
        center=(max+min)/2
        distance=np.sqrt(np.sum(np.square(max - min))) # 欧氏距离
        return [
            center[0],
            center[1],
            center[2],
            distance/2+r
        ]
    @staticmethod
    def distance(data,centers):
        dist=np.zeros( (len(data), len(centers)) )
        for i in range(dist.shape[0]):
            for j in range(dist.shape[1]):
                dist[i][j]=Sphere.distance_center0(
                    data[i],
                    centers[j]
                )
        return dist
    @staticmethod
    def distance_center0(data0,class0):#class0是该类上次迭代的结果
        # dist=np.zeros( (len(data), len(class0)) )
        # for i in range(dist.shape[0]):
        #     for j in range(dist.shape[1]):
        #         dist[i][j]=Sphere.distance_group(
        #             data[i],
        #             class0[j]
        #         )
        arr=[]
        for i in range(len(class0)):
            arr.append(
                Sphere.distance_group(
                    data0,
                    class0[i]
                )
            )
        return np.sum(
            np.array(arr)
        )/len(arr)
    @staticmethod
    def distance_group(s1,s2):#s1是由一组球体组成的对象,s2也一样
        group1=s1.arr
        group2=s2.arr
        dist=Sphere.distance_sphere(group1,group2)
        return (
            np.sum(np.min(dist,axis=0))+
            np.sum(np.min(dist,axis=1))
        )/(
            dist.shape[0]+
            dist.shape[1]
            )
    @staticmethod
    def distance_sphere(data,centers):#[ [0,0,0,0] ]
        data_r=data[:,3]
        data=data[:,0:3]
        centers_r=centers[:,3]
        centers=centers[:,0:3]

        volume1=(data_r**3)#*math.pi*4/3
        volume2=(centers_r**3)#*math.pi*4/3
        
        r1=data_r[:,  None]
        r2=centers_r.T[None,  :]
        v1=volume1[:,None]
        v2=volume2[None,:]
        e=((data[:, :, None] - centers.T[None, :, :])**2).sum(axis=1)**0.5
        
        #dist=[v1*(e-r2)+v2*(e-r1)]/[v1+v2]
        dist=np.divide(
            v1*(e-r2)+v2*(e-r1),
            v1+v2
        )
        dist[dist < 0] = 0
        return dist
class Clustering:#目前使用欧式距离
    def __init__(self):
        self.start(10)
    def kMeans_old(self,dataSet, step):
        data=np.array(dataSet)
        k= int(np.shape(dataSet)[0]/step)#质心个数
        centers = data[ (np.array(range(k))*step).tolist(),:]             #np.mat(np.zeros((k, n)))#用于存储所有质心
        for i in range(500): # 首先利用广播机制计算每个样本到簇中心的距离，之后根据最小距离重新归类
            classifications = np.argmin(
                Sphere.distance(data,centers),#self.computeDistance7(data,centers), 
                axis=1
            )#计算每个元素最近的质心
            new_centers = np.array([data[classifications == j, :].mean(axis=0) for j in range(k)])# 对每个新的簇计算簇中心
            if (new_centers == centers).all():break# 簇中心不再移动的话，结束循环
            else: centers = new_centers
        return  centers.tolist(), classifications[:, None].tolist()#return  centers.tolist(), classifications.tolist()
    def equal(self,centers,new_centers):
        if len(centers)==len(new_centers):
                for i in range(len(centers)):
                    c1=centers[i]
                    c2=new_centers[i]
                    if len(c1)==len(c2):
                        for j in range(len(c1)):
                            if not (new_centers == centers):
                                return False
                    else:return False
        else:return False
        return True
    def getNew_centers(self,classifications,k,data):
        new_centers=[]
        for i in range(k):#每一类
            arr=[]
            for j in range(classifications.shape[0]):
                if classifications[j]==i:
                    arr.append(data[j])
            new_centers.append(arr)
        return new_centers
    def kMeans(self,dataSet, step):
        data=dataSet#np.array(dataSet)
        k= int(np.shape(dataSet)[0]/step)#质心个数
        # centers = data[ (np.array(range(k))*step).tolist(),:]             #np.mat(np.zeros((k, n)))#用于存储所有质心
        centers=[]
        for i in range(k):
            centers.append([data[i*step]])
        time=0
        for i in range(5): # 首先利用广播机制计算每个样本到簇中心的距离，之后根据最小距离重新归类
            print(i)
            time=time+1
            classifications = np.argmin(
                Sphere.distance(data,centers),#self.computeDistance7(data,centers), 
                axis=1
            )#计算每个元素最近的质心 #每个元素的类编号
            
            new_centers=self.getNew_centers(classifications,k,data)
            # new_centers = np.array([data[classifications == j, :].mean(axis=0) for j in range(k)])# 对每个新的簇计算簇中心
            if self.equal(centers,new_centers):break
            # if (new_centers == centers).all():break# 簇中心不再移动的话，结束循环
            else: centers = new_centers
        print("迭代次数:",time)
        return  centers, classifications#return  centers.tolist(), classifications.tolist()
    @staticmethod
    def loadJson(path):
        return json.load(open(path))
    def start(self,step):
        bounding_all=self.loadJson("bounding_sph.json")
        print("构件数量为:",len(bounding_all))
        for i in range(len(bounding_all)):
            bounding_all[i]=Sphere(bounding_all[i])
            # bounding_all[i]=self.getInstancedBounding(bounding_all[i])
        _,classifications=self.kMeans(bounding_all, step)
        with open('save1.json', 'w', encoding='utf-8') as file1:
            file1.write(json.dumps(classifications.tolist(), indent=2, ensure_ascii=False))
        classifications_max=np.max(classifications)
        result=[]
        for i in range(classifications_max):
            result0=[]
            for j in range(len(classifications)):
                if classifications[j]==i:
                    result0.append(j)
            if len(result0)>0:
                result.append(result0)
        print("分组数量为:",len(result))
        with open('save2.json', 'w', encoding='utf-8') as file:
            file.write(json.dumps(result, indent=2, ensure_ascii=False))

    def getInstancedBounding(self,bounding_arr):
        bounding_arr=np.array(bounding_arr)
        max=np.max(bounding_arr,axis=0)
        min=np.min(bounding_arr,axis=0)
        r=max[3]
        max=max[0:3]
        min=min[0:3]
        center=(max+min)/2
        distance=np.sqrt(np.sum(np.square(max - min))) # 欧氏距离
        return [
            center[0],
            center[1],
            center[2],
            distance/2+r
        ]

if __name__ == "__main__":#用于测试
    Clustering()
    # a=np.array([
    #     [0,1],
    #     [2,3]
    # ])
    # print(
    #     np.sum(
    #         a,
    #         axis=0
    #     )
    # )
    