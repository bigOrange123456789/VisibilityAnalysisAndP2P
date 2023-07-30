
from FeatureAll import FeatureAll
class VisibleArea: #所有视点,每个视点的可见特征
    def __init__(self,loader_ceiling,loader_addSphere_list):
        self.componentIdMax=loader_ceiling.componentIdMax-2
        self.data=loader_ceiling.data
        dim0=1+loader_ceiling.componentIdMax-2
        dim1=1+loader_addSphere_list[0].componentIdMax
        f1=FeatureAll(loader_addSphere_list[0]).toSplice(dim0,dim1-dim0)
        for i in range(len(loader_addSphere_list)-1):
            f_temp=FeatureAll(loader_addSphere_list[i+1]).toSplice(dim0,dim1-dim0)
            f1=FeatureAll.add(f1,f_temp)
        f1=f1.toSgn()
        # self.list={}
        # for vid in f1.featureAll:
        #     n=0
        #     d=f1.featureAll[vid]
        #     print(d)
        #     for i in range(len(d)):
        #         n=n+d[i]*(2**i)
        #     self.list[vid]=str(n)
        
        # self.list2={}
        # for vid in f1.featureAll:
        #     n={}
        #     d=f1.featureAll[vid]
        #     for i in range(len(d)):
        #         if d[i]==1:
        #             n[i]=1
        #     self.list2[vid]=n
        
        self.list3={}
        for vid in f1.featureAll:
            n=[]
            d=f1.featureAll[vid]
            # print(d)
            for i in range(len(d)):
                if d[i]==1:
                    n.append(i)
            self.list3[vid]=n
        
        self.list=self.list3
  

