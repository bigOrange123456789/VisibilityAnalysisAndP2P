import os
import json
# 指定旧json目录路径
directory = './result'
new_directory = 'configVVD-model8.json'

new_json = {}
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
# 遍历目录下所有JSON文件
min=9999999
max=-999999
for filename in os.listdir(directory):
    if filename.endswith('.json'):
        filepath = os.path.join(directory, filename)
        with open(filepath) as f:
            json_data = json.load(f)
            position = {}
            position['all'] = {}
            position[str(1+1)]=test(json_data[0])
            position[str(1+0)]=test(json_data[1])

            position[str(1+3)]=test(json_data[2])
            position[str(1+2)]=test(json_data[3])

            position[str(1+5)]=test(json_data[4])
            position[str(1+4)]=test(json_data[5])
            # for direction0 in range(6):
            #     position[str(direction0+1)]=test(json_data[direction0])
            new_json[filename.split('.json')[0]] = position
            z=filename.split('.json')[0].split(",")[2]
            z=int(z)
            if z<min:min=z
            if z>max:max=z
        f.close()
print("max",max)
print("min",min)
#降低精度
def coarseVVD(vvd):
        for vid in vvd:
            for direction in vvd[vid]:
                for cid in vvd[vid][direction]:
                    d=vvd[vid][direction][cid]
                    vvd[vid][direction][cid]=float('{:.3e}'.format(d))
        return vvd
new_json=coarseVVD(new_json)
# 将数据写入到 JSON 文件中
with open(new_directory, 'w') as f:
    json.dump(new_json, f)
    f.close()