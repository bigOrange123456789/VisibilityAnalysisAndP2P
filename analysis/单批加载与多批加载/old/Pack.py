class Pack:
    def __init__(self,config):
        self.packList=config['packList']
        self.size=config['size']
        self.vd=config['vd']
        self.id=config['id']
        self.time0=-1#config['time0']
        self.time1=-1#receive
        self.time2=-1#parse
        self.initTemp(-1)
    def initTemp(self,time):
        self.t=time#开始被处理的时间
        self.s=self.size#还需要处理的数据量
        self.p=False#没有被处理
# class PackList:
#     def __init__(self,packSize,vdList):
#         self.packList=[]#尽量不要让外界调用
#         self.pack_num=len(packSize)
#         for id in range( self.pack_num ):
#             self.packList.append(
#                 Pack({
#                     "size":packSize[id],
#                     "vd":vdList[id],
#                     "id":id,
#                     "packList":self.packList
#                 })
#             )
    def sortList(self,type):
        arr=[]
        arr2=[]
        temp={}
        for id in range(len(self.packList)):
            pack=self.packList[id]
            if type=="request": d=pack.time0
            elif type=="loaded":d=pack.time1
            elif type=="parsed":d=pack.time2
            # elif type=="parsed-loaded":
            #     d=pack.time2-pack.time1
            #     if d<=0:d=-1
            elif type=="temp": d=pack.t
            elif type=="vd":
                d=pack.vd
                if d<=0:d=-1
                # print(d,d<=0)
            else:
                print("error!",type)
                exit(0)
            if not d==-1:
                arr.append(d)
                arr2.append(id)
                temp[id]=len(arr)-1
        indices = sorted(arr2, key=lambda x: arr[temp[x]])
        arr.sort()
        return indices,arr#id,value
