# from ViewpointList import ViewpointList
from Loader import Loader
from PVD import PVD
from Blocking import Blocking
from ExtractorWall import ExtractorWall
from VisibleArea   import VisibleArea
import sys
import json
class Main: #所有视点,每个视点的可见特征
    def __init__(self,config):
        id=config["id"]
        loader0=Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id),id)
        loader0.saveVVD()
        loader_addSphere_list=[
            Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id)+"_1",id),
            Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id)+"_shifting",id),
            Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id)+"_rand0",id),
            Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id)+"_rand1",id),
            Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id)+"_rand2",id),
            Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id)+"_rand3",id),
            Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id)+"_rand4",id),
            Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id)+"_rand5",id),
            Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id)+"_rand6",id),
            Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id)+"_rand7",id),
            Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id)+"_rand8",id)
        ]
        print("len(loader_addSphere_list)",len(loader_addSphere_list))
        loader_ceiling=Loader("F:/gitHubRepositories/vk-precompute-main/output"+str(id)+"_2",id)
        iswall=ExtractorWall(
            loader_ceiling,
            [loader_addSphere_list[0] ,loader_addSphere_list[0] ],
            config['getwall']
        ).iswall
        loader0.c_all["src"]["Building_new"]["iswall"]=iswall
        isdoor=loader0.c_all["src"]["Building_new"]["isdoor"]
        loader0.savePVD(PVD(
            loader0,
            loader_ceiling,
            iswall,
            isdoor))
        loader0.c_all["src"]["Building_new"]["blocking"]=Blocking(
            loader_ceiling,
            loader_addSphere_list,
        ).result
        visibleArea=VisibleArea(loader_ceiling,loader_addSphere_list).list
        json.dump(
            visibleArea, 
            open("../dist/assets/VisibleArea.json",'w'))
        loader0.configCSave()                
    def blocking(self):
        v_feature_list=[]
        v_feature_list_tag={}
        v_feature_list_tag_inv={}
        i=0
        for vid in self.featureAllB:
            feature=self.featureAllB[vid]
            # pos=vid.split(",")
            # for j in range(3):
            #     feature.append(float(pos[j])*0.01)
            for j in range(len(feature)):
                # if feature[j]==0:
                #     feature[j]=-1000
                if feature[j]==0:
                    feature[j]=0
                else:
                    feature[j]=1
            # print(feature)
            v_feature_list.append(feature)
            v_feature_list_tag[vid]=i
            v_feature_list_tag_inv[i]=vid
            i=i+1
        feature_all={}
        
        id=0
        for f0 in v_feature_list:
            name=''.join(str(i) for i in f0)
            if not name in feature_all:
                feature_all[name]=id
                id=id+1
        # print("feature_all",feature_all)
        result={}
        print("len(v_feature_list)",len(v_feature_list))
        for i in range(len(v_feature_list)):
            f0=v_feature_list[i]
            vid=v_feature_list_tag_inv[i]
            name=''.join(str(i0) for i0 in f0)
            result[vid]=feature_all[name]
            # if feature_all[name]!=1:print(name)
        # self.c["blocking"]=result
        return result   
            
    def getKernelView(self,feature_all1,feature_all2):
        block2Kernel={}
        for vID in self.block:
            blockID=str(self.block[vID])
            # print(blockID,type(blockID))
            block2Kernel[blockID]=None
        for blockID in block2Kernel:
            entropyMax=0
            for vID in self.block:
                if str(self.block[vID])==blockID:
                    entropy=0.5*self.entropy(feature_all1[vID])+0.5*self.entropy(feature_all2[vID])#+self.entropy(feature_all3[vID])
                    if entropy>entropyMax:
                        entropyMax=entropy
                        block2Kernel[blockID]=vID
        self.block2Kernel=block2Kernel
        print("block2Kernel:",block2Kernel)
        return block2Kernel
    
    def entropy(self,feature):
        probabilities=[]
        sum=0
        for d in feature:
            if d>0:
                sum+=d
                probabilities.append(d)
        for i in range(len(probabilities)):
            probabilities[i]/=sum
        import math
        entropy = 0
        for p in probabilities:
            entropy += -p * math.log2(p)
        return entropy
    def getKVCG(self,featureAll):
        i=0
        featureList=[]
        for blockId in self.block2Kernel:
            kv=self.block2Kernel[blockId]
            print("id:",blockId,"\tposition:",kv)#print(i,blockId,kv)
            featureList.append(featureAll[kv])
            i=i+1
        from sklearn.metrics.pairwise import cosine_similarity
        similarity=cosine_similarity(featureList)
        print("similarity:\n",similarity)
        from tabulate import tabulate
        print(tabulate(similarity))
        return similarity
if __name__ == "__main__":#用于测试
    config=json.load(open(sys.argv[1], 'r'))
    Main(config)