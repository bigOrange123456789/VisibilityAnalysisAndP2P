from shutil import copyfile
from sys import exit

source = "test.png"
for i in range(400):
    target = "test/"+str(i)+".png"
    copyfile(source, target)