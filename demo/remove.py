import os
def getfiles():
    filenames=os.listdir(r'./')
    for path in filenames:
        if not os.path.isfile(path):
            if os.path.exists(path+"/index.js"):
                os.remove(path+"/index.js")