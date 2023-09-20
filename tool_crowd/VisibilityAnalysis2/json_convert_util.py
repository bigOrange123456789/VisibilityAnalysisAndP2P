import os
import json

# 指定旧json目录路径
directory = './data/KaiLiNan_new'
new_directory = 'data/result.json'

new_json = {}

# 遍历目录下所有JSON文件
for filename in os.listdir(directory):
    
    if filename.endswith('.json'):
        filepath = os.path.join(directory, filename)
        with open(filepath) as f:
            json_data = json.load(f)
            position = {}
            position['all'] = {}
            direction = 0
            print(filepath)
            print("json_data",json_data)
            for item in json_data:
                position[str(direction)] = {}
                if item != None:
                    print(item)
                    for key, value in item.items():
                        if key.split(',')[0] not in position[str(direction)]:
                            position[str(direction)][key.split(',')[0]] = value
                        else:
                            position[str(direction)][key.split(',')[0]] += value
                        # b["position"]["all"][i+1] = item
                    direction = direction + 1
            new_json[filename.split('.')[0]] = position
        f.close()
# 将数据写入到 JSON 文件中
with open(new_directory, 'w') as f:
    json.dump(new_json, f)
    f.close()