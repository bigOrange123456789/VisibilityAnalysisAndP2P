import json
import os
from tqdm import tqdm
import numpy as np
import struct


# 将list转化为Float32二进制
def listToBin32(data):
    data_bin = []
    for item in data:
        b = struct.pack('<f',item)  
        data_bin.append(b)
    return data_bin

# 将list转化为Float16二进制
def listToBin16(data):
    data_bin = []
    for item in data:
        b = struct.pack('<e',float(item))
        data_bin.append(b)
    return data_bin

# 保存二进制文件
def storeBin(path,data):
    with open(path,'wb') as f:
        for item in data:
            f.write(item)

# 将图像保存为二进制
def saveImgBin(head,img,img2,path):
    data = []
    for e in head:
        data.append(struct.pack('<I',e))
    # data.append(struct.pack('<I',head[1]))
    # data.append(struct.pack('<I',head[2]))
    data += listToBin16(
        np.array(img).reshape(-1)
    )
    data += listToBin16(
        np.array(img2).reshape(-1)
    )
    storeBin(path,data)

if __name__ == "__main__":
    path="test.json"
    print("数据的路径为:",path)
    file=open(path)
    result=json.load(file)
    print("图片1的长度:",np.array(result["animation"]).reshape(-1).shape)#逆矩阵与世界矩阵
    print("图片2的长度:",np.array(result["animation2"]).reshape(-1).shape)#逆矩阵与世界矩阵的乘积

    saveImgBin(
        [
            len(result["config"]),#动画的个数
            result["config"][0],#单个动画数据的长度
            np.array(result["animation"]).reshape(-1).shape[0],#图片1的长度
            int(result["frameNumber"])
        ],
        result["animation"],
        result["animation2"],
        "animation.bin"
    )
