path_in="../../../dist/assets/textures/"
path_out="../../../dist/assets/textures_sim1/"
compress_ratio=0.1
from os import listdir
from PIL import Image

def reset_image(file_name):#(img, compress_ratio):
    img=Image.open(path_in+file_name)
    (width, height) = img.size
    new_width = int(width * compress_ratio)
    new_height = int(height * compress_ratio)
    img_new = img.resize(
        size=(new_width, new_height)
    )
    img_new.save(path_out+file_name)

arr=listdir("../../../dist/assets/textures/")
for name in arr:
    print(name)
    reset_image(name)

