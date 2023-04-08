import numpy as np
from FeatureAll import FeatureAll
class Blocking: 
    def __init__(self,loader_ceiling,loader_addSphere_list):
        dim0=1+loader_ceiling.componentIdMax-2
        dim1=1+loader_addSphere_list[0].componentIdMax
        f1=FeatureAll(loader_addSphere_list[0]).toSplice(dim0,dim1-dim0)
        for i in range(len(loader_addSphere_list)-1):
            f_temp=FeatureAll(loader_addSphere_list[i+1]).toSplice(dim0,dim1-dim0)
            f1=FeatureAll.mul(f1,f_temp)
        f1=f1.toPow(0.5)

        # print()
        # self.block=self.blocking2(
        #     10#config["blocking"]["k"]
        # )

        # for i in range(dim1-dim0):
        #     name=vid2name[i]
        #     d=f1.featureAll[name][i]
        #     print(name,d)


        v_feature_list=[]
        v_feature_list_tag_inv={}
        i=0
        for vid in f1.featureAll:
            v_feature_list.append(f1.featureAll[vid])
            v_feature_list_tag_inv[i]=vid
            i=i+1
        self.result=self.blocking2(40,v_feature_list,v_feature_list_tag_inv)
        return

        def rang(i,end,step):
            arr=[]
            while i<=end:
                arr.append(i)
                i+=step
            return arr
        c=loader_ceiling.c_all["src"]["Building_new"]["createSphere"]
        name2vid={}
        vid2name={}
        i=0
        # x=c['x'][0]
        # while x<=c['x'][1]:
        #     y=c['y'][0]
        #     while y<=c['y'][1]:
        #         z=c['z'][0]
        #         while z<=c['z'][1]:
        #             # print(x,y,z)
        #             name=str(x)+","+str(y)+","+str(z)
        #             vid2name[i]=name
        #             name2vid[name]=i
        #             i=i+1
        #             z=z+c['z'][2]
        #         y=y+c['y'][2]
        #     x=x+c['x'][2]
        for x in rang(c["x"][0],c["x"][1],c["x"][2]):
            for y in rang(c["y"][0],c["y"][1],c["y"][2]):
                for z in rang(c["z"][0],c["z"][1],c["z"][2]):
                    name=str(x)+","+str(y)+","+str(z)
                    vid2name[i]=name
                    name2vid[name]=i
                    i=i+1
        
        distance=[]
        for name in f1.featureAll:
            vid=name2vid[name]
            distance.append(f1.featureAll[name])
        labels=self.blocking3(distance,40)
        self.result={}
        for vid in range(len(labels)):
            name=vid2name[vid]
            self.result[name]=labels[vid]


    def getFeature(self):
        v_feature_list=[]
        v_feature_list_tag={}
        v_feature_list_tag_inv={}
        i=0
        for vid in self.featureAllA:
            feature=[]
            featureA=self.featureAllA[vid]
            featureB=self.featureAllB[vid]
            for j in range(len(featureA)):
                a=featureA[j]
                feature.append(a)
            for j in range(len(featureB)):
                b=featureB[j]
                if not b==0:b=1
                feature.append(b)
            for j in range(3):
                pos=int(vid.split(",")[j])
                feature.append(pos/100)

            v_feature_list.append(feature)
            v_feature_list_tag[vid]=i
            v_feature_list_tag_inv[i]=vid
            i=i+1
        return v_feature_list
    def blocking2(self,k,v_feature_list,v_feature_list_tag_inv):
        def dis(data,centers):
            # return ((data[:, :, None] - centers.T[None, :, :])**2).sum(axis=1)
            n=data.shape[0]
            k=centers.shape[0]
            distance = np.zeros((n, k))
            for i in range(n):
                for j in range(k):
                    # 求欧几里得距离的平方
                    dis = np.sum(np.square(data[i] - centers[j]))
                    distance[i][j] = dis
            return distance
        def dis2(data,centers):#重合度，是否为0
            n=data.shape[0]
            k=centers.shape[0]
            distance = np.zeros((n, k))
            for i in range(n):
                for j in range(k):
                    # 求欧几里得距离的平方
                    sum1=0
                    sum2=0
                    sim=0
                    for k in range(data[i].shape[0]):
                        if not data[i][k]==0:
                            sum1+=1
                        if not centers[i][k]==0:
                            sum2+=1
                        if not data[i][k]==0 and not centers[i][k]==0:
                            sim+=1
                    dis=1-sim/(sum1,sum2)
                    distance[i][j] = dis
            return distance
        def getCenter(data,classifications,k):
            # return np.array([data[classifications == j, :].mean(axis=0) for j in range(k)])
            new_centers = []
            for j in range(k):
                class_data = data[classifications == j, :]
                if class_data.shape[0]==0:
                    new_centers.append(data[0,:])
                    continue
                class_mean = np.zeros(data.shape[1])
                count = 0
                for i in range(class_data.shape[0]):
                    class_mean += class_data[i, :]
                    count += 1
                if count > 0:
                    class_mean /= count
                new_centers.append(class_mean)
            return np.array(new_centers)

    
        print("采样点的个数为:",k)
        #kmeans_with_distance(distance, k)
        dataSet=v_feature_list
        import numpy as np
        data=np.array(dataSet)
        #k= 7#int(np.shape(dataSet)[0]/step)#质心个数
        step=int(np.shape(dataSet)[0]/k)
        centers = data[ (np.array(range(k))*step).tolist(),:]             #np.mat(np.zeros((k, n)))#用于存储所有质心
        for i in range(4000): # 首先利用广播机制计算每个样本到簇中心的距离，之后根据最小距离重新归类
            distance=dis(data,centers)#((data[:, :, None] - centers.T[None, :, :])**2).sum(axis=1)
            classifications = np.argmin(distance, axis=1)#计算每个元素最近的质心
            new_centers = getCenter(data,classifications,k)#np.array([data[classifications == j, :].mean(axis=0) for j in range(k)])# 对每个新的簇计算簇中心
            if (new_centers == centers).all():
                print("聚类结果已经收敛")
                break# 簇中心不再移动的话，结束循环
            else: centers = new_centers
        classlist=classifications[:, None].tolist()
        result={}
        for i in range(len(classlist)):
            vid=v_feature_list_tag_inv[i]
            result[vid]=classlist[i][0]
        return result# return  centers.tolist(), classifications[:, None].tolist()#return  centers.tolist(), classifications.tolist()

    def blocking3(self,k,v_feature_list,v_feature_list_tag_inv):
        def dis0(a,b):
            return np.sqrt(np.sum(np.power(a - b, 2)))
        def dis1(a,b):#1-重叠度
            sum1=0
            sum2=0
            sim=0
            for k in range(a.shape[0]):
                if not a[k]==0:
                    sum1+=1
                if not b[k]==0:
                    sum2+=1
                if not a[k]==0 and not b[k]==0:
                    sim+=1
            return 1-sim/min([sum1,sum2])
        def distanceMatrix(data):
            m=np.zeros( (data.shape[0],data.shape[0]) )
            for i in range(data.shape[0]):
                for j in range(data.shape[0]):
                    a=data[i,:]
                    b=data[j,:]
                    m[i,j]=dis1(a,b)
            return m
        def kmeans_with_distance(distance, k, max_iter=100):
            n_samples, n_centroids = distance.shape

            # 随机初始化聚类中心
            centroids = np.arange(n_centroids)
            np.random.shuffle(centroids)
            centroids = centroids[:k]

            for i in range(max_iter):
                # 分配样本到聚类
                labels = np.argmin(distance[:, centroids].mean(axis=1), axis=0)

                # 更新聚类中心
                for j in range(k):
                    centroids[j] = np.mean(np.where(labels == j)[0], axis=0)

            return labels, centroids
    
        print("采样点的个数为:",k)
        dataSet=v_feature_list
        data=np.array(dataSet)
        m=distanceMatrix(data)
        labels=kmeans_with_distance(m, k)
        print("labels",labels.shape)
        classlist=labels.tolist()
        result={}
        for i in range(len(classlist)):
            vid=v_feature_list_tag_inv[i]
            result[vid]=classlist[i][0]
        return result# return  centers.tolist(), classifications[:, None].tolist()#return  centers.tolist(), classifications.tolist()

