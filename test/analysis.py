import json
import os
import pandas as pd
if __name__ == "__main__":#用于测试    
    def getRedundance(path_pre):
        file_list=os.listdir(path_pre)
        sum=0
        for name in file_list:
            file=json.load(open(path_pre+name, 'r'))
            redun=(file["count_pack_p2p"]+file["count_pack_server"]
                   -file["count_mesh_p2p"]-file["count_mesh_server"])/(
                file["count_pack_p2p"]+ file["count_pack_server"])
            sum+=redun
        return str(100*sum/len(file_list))+"%"
    def getDelay(path_pre):
        file_list=os.listdir(path_pre)
        sum=0
        for name in file_list:
            file=json.load(open(path_pre+name, 'r'))
            sum+=file["loadDelay"]["ave"]
        return sum/len(file_list)
    def getNotUsed(path_pre):
        file_list=os.listdir(path_pre)
        sum=0
        for name in file_list:
            file=json.load(open(path_pre+name, 'r'))
            nu=(file["count_mesh_p2p_NotUsed"]+file["count_mesh_server_NotUsed"])/(
                file["count_mesh_p2p"]+file["count_mesh_server"])
            sum+=nu
        return str(100*sum/len(file_list))+"%"
    def getFPS(path_pre):
        file_list=os.listdir(path_pre)
        sum=0
        for name in file_list:
            file=json.load(open(path_pre+name, 'r'))
            sum+=(file["frameCount"]/file["testTime"])
        return sum/len(file_list)
    def f(path0):
        file_list=os.listdir(path0)
        result={}
        for name in file_list:
            result[name]=getDelay(path0+name+"/")
        return result
    def save(tag,arr):
        df = pd.DataFrame(arr, columns=tag)
        df.to_excel('data/test.xlsx', index=False)
    
    # data1= f("data/group2/")
    # tag=[]
    # arr=[]

    # arr0=[]
    # for i in range(10):
    #     id=str(i+1)
    #     tag.append(id)
    #     arr0.append(data1[id])
    # arr.append(arr0)

    # df = pd.DataFrame(arr, columns=tag)
    # df.to_excel('data/test.xlsx', index=False)

    tag=["","加载延迟","加载后未使用","重复加载","FPS"]
    arr=[]


    for path in ["group1","group2","group3","group4","group5","noP2P"]:
        arr0=[
            path,
            getDelay("data/"+path+"/"),
            getNotUsed("data/"+path+"/"),
            getRedundance("data/"+path+"/"),
            getFPS("data/"+path+"/"),
        ]
        arr.append(arr0)
    save(tag,arr)


    

