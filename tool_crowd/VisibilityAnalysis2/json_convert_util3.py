import os
import json
# 指定旧json目录路径
directory = './data/KaiLiNan_new'
new_directory = './data/result.json'

new_json = {}
# 遍历目录下所有JSON文件
# min=9999999
# max=-999999
def test(d):
    if d==None:
        return {}
    d2={}
    for i in d:
        i2=i.split(",")[0]
        d2[i2]=0
    for i in d:
        i2=i.split(",")[0]
        d2[i2]+=d[i]
    return d2
i=0
for filename in os.listdir(directory):
    if filename.endswith('.json') and not filename=="config.json":
        i=i+1
        filepath = os.path.join(directory, filename)
        print(i,"\t",filename,end="\r")
        with open(filepath) as f:
            json_data = json.load(f)
            # print(json_data[1])
            position = {}
            position['all'] = {}
            if False:#龙胡志远的代码
                position[str(1+1)]=test(json_data[0])
                position[str(1+0)]=test(json_data[1])

                position[str(1+3)]=test(json_data[2])
                position[str(1+2)]=test(json_data[3])

                position[str(1+5)]=test(json_data[4])
                position[str(1+4)]=test(json_data[5])
            else:
                position[str(1)]=test(json_data[str(1)])
                position[str(2)]=test(json_data[str(2)])

                position[str(3)]=test(json_data[str(3)])
                position[str(4)]=test(json_data[str(4)])

                position[str(5)]=test(json_data[str(5)])
                position[str(6)]=test(json_data[str(6)])
            # for direction0 in range(6):
            #     position[str(direction0+1)]=test(json_data[direction0])
            new_json[filename.split('.json')[0]] = position
            # z=filename.split('.json')[0].split(",")[2]
            # z=int(z)
            # if z<min:min=z
            # if z>max:max=z
        f.close()
# print("max",max)
# print("min",min)
#合并邻居

def mergeNeibor(data):
    config=json.load(open("config.json"))
    c=config["src"]["Building_new"]["createSphere"]
#降低精度
def coarseVVD(vvd):
        for vid in vvd:
            for direction in vvd[vid]:
                for cid in vvd[vid][direction]:
                    d=vvd[vid][direction][cid]
                    # vvd[vid][direction][cid]=float('{:.3e}'.format(d))
                    vvd[vid][direction][cid]=float('{:.2e}'.format(d))
        return vvd
new_json=coarseVVD(new_json)


# 将数据写入到 JSON 文件中
with open(new_directory, 'w') as f:
    json.dump(new_json, f)
    f.close()
