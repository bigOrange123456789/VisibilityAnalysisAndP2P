import numpy as np
import json
import math
class Clustering:#目前使用欧式距离
    def __init__(self):
        print()
    def kMeans(self,dataSet, step):
        data=np.array(dataSet)
        k= int(np.shape(dataSet)[0]/step)#质心个数
        centers = data[ (np.array(range(k))*step).tolist(),:]             #np.mat(np.zeros((k, n)))#用于存储所有质心
        for i in range(500): # 首先利用广播机制计算每个样本到簇中心的距离，之后根据最小距离重新归类
            classifications = np.argmin(
                self.computeDistance7(data,centers), 
                axis=1
            )#计算每个元素最近的质心
            new_centers = np.array([data[classifications == j, :].mean(axis=0) for j in range(k)])# 对每个新的簇计算簇中心
            if (new_centers == centers).all():break# 簇中心不再移动的话，结束循环
            else: centers = new_centers
        return  centers.tolist(), classifications[:, None].tolist()#return  centers.tolist(), classifications.tolist()
    @staticmethod
    def computeDistance(data,centers):
        return ((data[:, :, None] - centers.T[None, :, :])**2).sum(axis=1)
    @staticmethod
    def computeDistance2(data,centers):#center的半径是平均值会比较好吗？
        # data
        return ((data[:, :, None] - centers.T[None, :, :])**2).sum(axis=1)**0.5
    @staticmethod
    def computeDistance3(data,centers):#center的半径是平均值会比较好吗？
        data_r=data[:,3]
        data=data[:,0:3]
        centers_r=centers[:,3]
        centers=centers[:,0:3]
        # data
        return ((data[:, :, None] - centers.T[None, :, :])**2).sum(axis=1)**0.5
    @staticmethod
    def computeDistance4(data,centers):#center的半径是平均值会比较好吗？
        data_r=data[:,3]
        data=data[:,0:3]
        centers_r=centers[:,3]
        centers=centers[:,0:3]
        
        distanceEuclidean=((data[:, :, None] - centers.T[None, :, :])**2).sum(axis=1)**0.5
        r_add=data_r[:,  None] + centers_r.T[None,  :]
        distanceEuclidean_subR=distanceEuclidean-r_add
        return distanceEuclidean_subR
    @staticmethod
    def computeDistance5(data,centers):#center的半径是平均值会比较好吗？
        data_r=data[:,3]
        data=data[:,0:3]
        centers_r=centers[:,3]
        centers=centers[:,0:3]
        
        distanceEuclidean=((data[:, :, None] - centers.T[None, :, :])**2).sum(axis=1)**0.5
        distanceEuclidean_subR=distanceEuclidean-data_r[:,  None] - centers_r.T[None,  :]
        distanceEuclidean_subR[distanceEuclidean_subR < 0] = 0

        return distanceEuclidean_subR
    @staticmethod
    def computeDistance6(data,centers):#center的半径是平均值会比较好吗？
        data_r=data[:,3]
        data=data[:,0:3]
        centers_r=centers[:,3]
        centers=centers[:,0:3]
        
        distanceEuclidean=((data[:, :, None] - centers.T[None, :, :])**2).sum(axis=1)**0.5
        distanceEuclidean_subR=distanceEuclidean-data_r[:,  None] - centers_r.T[None,  :]
        distanceEuclidean_subR[distanceEuclidean_subR < 0] = 0
 
        volume1=(data_r**3)#*math.pi*4/3
        volume2=(centers_r**3)#*math.pi*4/3
        volume=volume1[:,None]+volume2[None,:]
        return np.divide(
            distanceEuclidean_subR,
            volume
        )
    @staticmethod
    def computeDistance7(data,centers):#center的半径是平均值会比较好吗？
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
    def test2(self):
        data=[
            [0,0,0,1],
            [0,0,0,2]
        ]
        centers=[
            [1,0,0,1],
            [2,0,0,0]
        ]
        data=np.array(data)
        centers=np.array(centers)
        # distance=self.computeDistance2(data,centers)
        print(
            self.computeDistance(data,centers)
        )
        print(
            self.computeDistance2(data,centers)
        )
        print(
            self.computeDistance3(data,centers)
        )
        print(
            self.computeDistance4(data,centers)
        )
        print(
            self.computeDistance5(data,centers)
        )
        print(
            self.computeDistance6(data,centers)
        )
    def test(self):
        dataSet1=[
                [1],
                [2.1],
                [1.2],
                [2.2],
                [3.1],
                [3.2],
            ]
        dataSet2=[
                [1],
                [2.1],
                [1],
                [2.2],
                [3.1],
                [3.2],
            ]
        centers,classifications=self.kMeans(
            dataSet1,
            2
        )
        print("centers\n",centers)
        print("classifications\n",classifications)
    @staticmethod
    def loadJson(path):
        return json.load(open(path))
    def start(self):
        bounding_all=self.loadJson("bounding_sph.json")
        for i in range(len(bounding_all)):
            bounding_all[i]=self.getInstancedBounding(bounding_all[i])
        _,classifications=self.kMeans(bounding_all, 10)
        classifications=np.array(classifications).flatten()
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
    Clustering().start()
    