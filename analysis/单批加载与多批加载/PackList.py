MAX=9999999
MIN=-9999999
class Pack:
    def __init__(self,config):
        self.id=config['id']
        self.size=config['size']
        self.res=config['mapResolution']
        self.vd=config['vd']
        self.time0=-1#request
        self.time1=-1#receive
        self.time2=-1#parse
        self.initTemp(-1)
    def initTemp(self,time):
        self.t=time#开始被处理的时间
        self.s=self.size#还需要处理的数据量
        self.p=False#没有被处理
    def get(self,type):
        if type=="request": d=self.time0
        elif type=="loaded":d=self.time1
        elif type=="parsed":d=self.time2
        elif type=="parsed-loaded":
            d=self.time2-self.time1
            if d<=0:d=-1
        elif type=="temp": d=self.t
        elif type=="vd":
            d=self.vd
            if d<=0:d=-1
        else:
            print("error!",type)
            exit(0)
        return d #如果d为-1表示没有初始化
class PackList:
    def __init__(self,packSize,vdList,mapSize):
        self.pack_num=len(packSize)
        self.list=[]
        for id in range( self.pack_num ):
            self.list.append(
                Pack({
                    "size":packSize[id],
                    "vd":vdList[id],
                    "mapResolution":mapSize[str(id)],
                    "id":id
                })
            )
        self.vdAll=self.sumVd()
    def traverse(self):
        return self.list#range(self.pack_num)
    def getPack(self,id):
        return self.list[id]
    def getTimeStart(self):
        min0=MAX
        for id in range(len(self.list)):
            time0=self.list[id].time0
            if (not time0==-1) and time0<min0:min0=time0
        return min0  
    def sortList(self,type):
        arr=[]
        arr2=[]
        temp={}
        for id in range(self.pack_num):
            d=self.getPack(id).get(type)
            if not d==-1:
                arr.append(d)
                arr2.append(id)
                temp[id]=len(arr)-1
        indices = sorted(arr2, key=lambda x: arr[temp[x]])
        arr.sort()
        return indices,arr#id,value
    def sumVd(self):
        s=0
        for pack in self.traverse():
            s=s+pack.vd
        return s
