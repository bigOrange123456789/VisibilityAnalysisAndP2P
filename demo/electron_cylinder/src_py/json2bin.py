import json
import os
import struct
def remove(dir_path):
    print("Clearing folder:"+dir_path)
    import os
    # os.walk会得到dir_path下各个后代文件夹和其中的文件的三元组列表，顺序自内而外排列，如 o下有1文件夹，1下有2文件夹：[('o\1\2', [], ['a.py','b']), ('o\1', ['2'], ['c']), ('o', ['1'], [])]
    for root, dirs, files in os.walk(dir_path, topdown=False):
        #root: 各级文件夹绝对路径
        #dirs: root下一级文件夹名称列表，如 ['文件夹1','文件夹2']
        #files: root下文件名列表，如 ['文件1','文件2']
        for name in files:# 第一步：删除文件
            os.remove(os.path.join(root, name))  # 删除文件
        for name in dirs:# 第二步：删除空文件夹
            os.rmdir(os.path.join(root, name)) # 删除一个空目录
            
# 将list转化为Float32二进制
def listToBin32(data):
    data_bin = []
    for item in data:
        b = struct.pack('<f', item)
        data_bin.append(b)
    return data_bin

# 保存二进制文件
def storeBin(path, data):
    with open(path, 'wb') as f:
        for item in data:
            f.write(item)

def process(inpath,outpath):
    remove(outpath)
    print("Enter data path:", inpath,"\n")
    for root, ds, fs in os.walk(inpath):
        i=0
        for f in fs:
            i+=1
        j=0
        for f in fs:
            # print(f)
            file = open(inpath+f)
            result = json.load(file)
            data=listToBin32(result)
            storeBin(outpath+f.split(".json")[0]+".bin", data)
            j+=1
            # print("\r"+str(round(100*j/(i+1),3))+"%"+"\t:"+str(j)+"/"+str(i+1),end="")
            print(str(round(100*j/(i+1),3))+"%"+"\t:"+str(j)+"/"+str(i+1)+"\tProcessing, please wait a moment...\r",end="")
            # print(str(round(100*j/(i+1),2))+"%"+"\t:"+str(j)+"/"+str(i+1))

if __name__ == "__main__":
    process("../data/cube/",     "../data/cubeBin/")
    process("../data/cylinder/", "../data/cylinderBin/")
