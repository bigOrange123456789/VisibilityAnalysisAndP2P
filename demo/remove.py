import os
filenames=os.listdir(r'./')
for path in filenames:
    if not os.path.isfile(path):
        print(path+"/index.js",os.path.exists(path+"/index.js"))
        if os.path.exists(path+"/index.js"):
            os.remove(path+"/index.js")