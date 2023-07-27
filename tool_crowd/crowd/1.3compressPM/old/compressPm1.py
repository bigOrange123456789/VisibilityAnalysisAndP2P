import json
import os
from tqdm import tqdm
import numpy as np
import struct

def remove(dir_path):
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


# 将list转化为Float16二进制
def listToBin16(data):
    data_bin = []
    for item in data:
        b = struct.pack('<e', float(item))
        data_bin.append(b)
    return data_bin


def floatToBin32(data):
    b = struct.pack('<f', float(data))
    return b


# 保存二进制文件
def storeBin(path, data):
    with open(path, 'wb') as f:
        for item in data:
            f.write(item)


# 将图像保存为二进制
def saveImgBin(head, img, img2, img3, path):
    # print(head)
    data = []
    for e in head:
        data.append(struct.pack('<I', e))
    # data.append(struct.pack('<I',head[1]))
    # data.append(struct.pack('<I',head[2]))
    data += listToBin32(
        np.array(img).reshape(-1)
    )
    data += listToBin32(
        np.array(img2).reshape(-1)
    )
    data += listToBin32(
        np.array(img3).reshape(-1)
    )
    storeBin(path, data)


def process(index):
    name = str(index)+".json.pack.json"
    inpath = "in/"+name
    outpath="out/"
    
    print("输入数据路径:", inpath)
    file = open(inpath)
    result = json.load(file)
    
    fileName=name.split(".json.pack.json")[0]
    os.mkdir(outpath+fileName)
    for meshname, value in result.items():
        # listSim是啥不明白
        if len(value) > 0 and meshname != 'listSim' and meshname != 'names':
            array1 = []
            array2 = []  # 表示faceRe
            array3 = []  # 表示face
            array2length = 0
            array3length = 0
            if type(value)==type({}):
                value=[[value]]
            for i in value[0]:
                # 处理array1
                array1.append(i['aI'])
                array1.append(i['bI'])
                array1.append(i['aPos'][0])
                array1.append(i['aPos'][1])
                array1.append(i['aPos'][2])

                array1.append(i['bPos'][0])
                array1.append(i['bPos'][1])
                array1.append(i['bPos'][2])

                array1.append(i['cPos'][0])
                array1.append(i['cPos'][1])
                array1.append(i['cPos'][2])

                array1.append(i['aUV'][0])
                array1.append(i['aUV'][1])

                array1.append(i['aSkinWeight'][0])
                array1.append(i['aSkinWeight'][1])
                array1.append(i['aSkinWeight'][2])
                array1.append(i['aSkinWeight'][3])

                array1.append(i['aSkinIndex'][0])
                array1.append(i['aSkinIndex'][1])
                array1.append(i['aSkinIndex'][2])
                array1.append(i['aSkinIndex'][3])

                array1.append(i['bUV'][0])
                array1.append(i['bUV'][1])

                array1.append(i['bSkinWeight'][0])
                array1.append(i['bSkinWeight'][1])
                array1.append(i['bSkinWeight'][2])
                array1.append(i['bSkinWeight'][3])

                array1.append(i['bSkinIndex'][0])
                array1.append(i['bSkinIndex'][1])
                array1.append(i['bSkinIndex'][2])
                array1.append(i['bSkinIndex'][3])

                array1.append(array2length)
                array1.append(array3length)

                if isinstance(i['faceRe'],list):
                    array2length += len(i['faceRe'])
                    array1.append(len(i['faceRe']))
                    for face in i['faceRe']:
                        array2.append(face)
                elif isinstance(i['faceRe'],int):
                    array2length += 1
                    array1.append(1)
                    array2.append(i['faceRe'])
                    
                if isinstance(i['face']['x'], list):
                    array3length += len(i['face']['x']) * 4
                    array1.append(len(i['face']['x']))
                    for index in range(len(i['face']['x'])):
                        array3.append(i['face']['x'][index])
                        array3.append(i['face']['y'][index])
                        array3.append(i['face']['z'][index])
                        array3.append(i['face']['d'][index])
                elif isinstance(i['face']['x'], int):
                    array3length += 4
                    array1.append(1)
                    array3.append(i['face']['x'])
                    array3.append(i['face']['y'])
                    array3.append(i['face']['z'])
                    array3.append(i['face']['d'])
            # print(array1, array2, array3)
            
            saveImgBin(
                [
                    len(value[0]), # 这个mesh中变化的个数
                    len(array1), #array1长度
                    array2length,
                    array3length
                ],
                array1,
                array2,
                array3,
                outpath+fileName+"/"+meshname+'.bin'
            )

if __name__ == "__main__":
    remove("out/")
    # os.mkdir("out/")
    for i in range(19):
        process(i+1)
    # process(19)
