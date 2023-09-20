from Viewpoint import Viewpoint
import os
import json
class Loader: #所有视点,每个视点的可见特征
    def __init__(self,path_pre_in,id):
        self.id=id
        self.data=self.initData(path_pre_in)
        self.c_all=self.configCLoad()
        self.data=self.removeRedundancy()
        print("initComponentIdMax")
        self.componentIdMax=self.initComponentIdMax()
        self.componentDeAve=self.initComponentVisibilityAve()
    def initData(self,path_pre_in):
        # path_pre_in="F:/gitHubRepositories/vk-precompute-main/output"+str(id)#+"_new"
        # if len(path_pre_in.split("_new"))==2:print("load2")
        # else:print("load")
        file_list=os.listdir(path_pre_in)
        database={}
        i=0
        for file_name in file_list:
            i+=1
            print("loading:",float('{:.3e}'.format(100*i/len(file_list))),"%\t",i,end="\r")
            path=path_pre_in+"/"+file_name
            v=Viewpoint()
            # print(path,len(path_pre_in.split("_new")),path_pre_in.split("_new"))
            if len(path_pre_in.split("_new"))   ==2:v.load2(path)#v.load(path)
            if len(path_pre_in.split("_anNing"))==2:v.load3(path)
            else                                   :v.load(path)
            # v.getEntropy()
            v.path=path
            database[v.name]=v
            # print("\t\t\t\t\tv.name",v.name)
        return database#database的冗余去除
    def repeat8(self):
        print("repeat8 start")
        def mul(obj,k):
            obj2=Viewpoint()
            for direction in obj.data:
                obj2.data[direction]={}
                for cid in obj.data[direction]:
                    if obj.data[direction][cid]>4*3.14/(6*400):
                        obj2.data[direction][cid]=obj.data[direction][cid]*k 
            return obj2
        c=self.c_all["src"]["Building_new"]["createSphere"]
        step=[c["x"][2],c["y"][2],c["z"][2]]
        a=1.
        dx=round(step[0]*a)
        dy=round(step[1]*a)
        dz=round(step[2]*a)
        data2={}
        for vid in self.data:
            data2[vid]=mul(self.data[vid],0.92)
            arr=vid.split(",")
            x0=int(arr[0])
            y0=int(arr[1])
            z0=int(arr[2])
            for x in[x0-dx,x0+dx]:
                for y in[y0-dy,y0+dy]:
                    for z in[z0-dz,z0+dz]:
                        name=str(x)+","+str(y)+","+str(z)
                        data2[name]=mul(self.data[vid],0.01)#self.data[vid]
        self.data=data2
        print("repeat8 end")
    def pos2pos(self,arr):
        x=int(arr[0])
        y=int(float(arr[1]))
        z=int(arr[2])
        c=self.c_all["src"]["Building_new"]["createSphere"]
        min =[c["x"][0],c["y"][0],c["z"][0]]#areaInf.min
        step=[c["x"][2],c["y"][2],c["z"][2]]#areaInf.step
        max =[c["x"][1],c["y"][1],c["z"][1]]##areaInf.max
        # print("x,y,z",x,y,z)
        # print("min,step,max:",min,step,max)
        if x>max[0] or y>max[1] or z>max[2] or x<min[0] or y<min[1] or z<min[2]:
            if x>max[0]:x=max[0]
            if y>max[1]:y=max[1]
            if z>max[2]:z=max[2]
            if x<min[0]:x=min[0]
            if y<min[1]:y=min[1]
            if z<min[2]:z=min[2]
        # print("x,y,z",x,y,z)
        dl=step
        # print("dl",dl)
        if dl[0]==0:xi=0
        else       :xi=round((x-min[0])/dl[0])
        if dl[1]==0:yi=0
        else       :yi=round((y-min[1])/dl[1])
        if dl[2]==0:zi=0
        else       :zi=round((z-min[2])/dl[2])
        # print("xi,yi,zi",xi,yi,zi)
        x2=min[0]+step[0]*xi,
        y2=min[1]+step[1]*yi,
        z2=min[2]+step[2]*zi,
        # print("x2[0],y2[0],z2[0]",x2[0],y2[0],z2[0])
        # exit(0)
        return str(x2[0])+","+str(y2[0])+","+str(z2[0])
    def removeRedundancy(self):
        def rang(i,end,step):
            arr=[]
            while i<=end:
                arr.append(i)
                i+=step
            return arr
        database2={}
        c=self.c_all["src"]["Building_new"]["createSphere"]
        for x in rang(c["x"][0],c["x"][1],c["x"][2]):
            for y in rang(c["y"][0],c["y"][1],c["y"][2]):
                for z in rang(c["z"][0],c["z"][1],c["z"][2]):
                    name=str(x)+","+str(y)+","+str(z)
                    database2[name]=[]#database[name]
        i=0
        for vid in self.data:
            # print("\n",i)
            i+=1
            # if i==10:exit(0)
            vid2=self.pos2pos(vid.split(","))
            database2[vid2].append(self.data[vid])

        j=0
        for vid in database2:
            j+=1
            print("removeRedundancy",float('{:.3e}'.format(100*j/i)),"%\t",j,"\t",i,end="\r")
            database2[vid]=Viewpoint.merge(database2[vid])
        print()
        return database2
    def removeRedundancyOld(self):
        database=self.data
        def rang(i,end,step):
            arr=[]
            while i<=end:
                arr.append(i)
                i+=step
            return arr
        database2={}
        c=self.c_all["src"]["Building_new"]["createSphere"]
        for x in rang(c["x"][0],c["x"][1],c["x"][2]):
            for y in rang(c["y"][0],c["y"][1],c["y"][2]):
                for z in rang(c["z"][0],c["z"][1],c["z"][2]):
                    name=str(x)+","+str(y)+","+str(z)
                    database2[name]=database[name]
        return database2
    def initComponentIdMax(self):
        idMax=-1
        for viewpoint in self.data:
            d=self.data[viewpoint].data["all"]
            for cid in d:
                if int(cid)>idMax:idMax=int(cid)
        return idMax
    def initComponentVisibilityAve(self):#获取构件可见度的平均值
        cvAve=[]
        for cid in range(self.componentIdMax+1):
            print("initComponentVisibilityAve",float('{:.3e}'.format(100*cid/(self.componentIdMax+1))),"%\t",cid,end="\r")
            sum=0
            number=0
            for vid in self.data:
                d=self.data[vid].data["all"]
                if str(cid) in d:
                    sum=sum+d[str(cid)]
                    number=number+1
            if number==0:cvAve.append(0)
            else        :cvAve.append(sum/number)
        print()
        return cvAve
    def configCLoad(self):
        path="../config/config"+str(self.id)+".json"
        self.c_all=json.load(open(path, 'r'))
        self.c=self.c_all["src"]["Building_new"]#["createSphere"]
        return self.c_all
    def configCSave(self):
        self.coarseIsdoor()
        self.coarseIswall()
        self.c_all["src"]["Building_new"]=self.c
        path="../config/config"+str(self.id)+".json"
        json.dump(self.c_all, open("../config/config.json", 'w'))
        json.dump(self.c_all, open(path, 'w'), indent=4 )
    def saveVVD(self):
        print("saveVVD")
        vvd={}
        for vid in self.data:
            vvd[vid]=self.data[vid].data
        vvd=self.coarseVVD(vvd)
        json.dump(vvd,open( "../dist/assets/configVVD.json",'w'))
    def savePVD(self,pvd):
        vvd=json.load(open("../dist/assets/configVVD.json", 'r'))
        f=pvd.f.featureAll
        for vid in f:
            pvd0={}
            for cid in range(self.componentIdMax+1):
                if not f[vid][cid]==0:
                    pvd0[cid]=f[vid][cid]
            vvd[vid]["pvd"]=pvd0
        json.dump(vvd,open( "../dist/assets/configVVD.json",'w'))
    def coarseVVD(self,vvd):
        print("coarseVVD start")
        for vid in vvd:
            for direction in vvd[vid]:
                for cid in vvd[vid][direction]:
                    d=vvd[vid][direction][cid]
                    vvd[vid][direction][cid]=float('{:.3e}'.format(d))
        print("coarseVVD end")
        return vvd
    def coarseIsdoor(self):
        isdoor=self.c_all["src"]["Building_new"]["isdoor"]
        for cid in isdoor:
            if type(isdoor[cid])==type(True):
                if isdoor[cid]:isdoor[cid]=1
                else          :isdoor[cid]=0
    def coarseIswall(self):
        iswall=self.c_all["src"]["Building_new"]["iswall"]
        for cid in iswall:
            if iswall[cid]:iswall[cid]=1
            else          :iswall[cid]=0


        