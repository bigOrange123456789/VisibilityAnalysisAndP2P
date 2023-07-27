path_in="../../../dist/assets/textures/"
path_out="../../../dist/assets/"
name="CloW_A_hair_BaseColor_old.png"

from PIL import Image

def reset_image(file_name):#(img, compress_ratio):
    img=Image.open(path_in+file_name)
    (width, height) = img.size



    img_array = img.load()
    for x in range(0,width):
        for y in range(0,height):
            rgb = img_array[x,y]
            r = rgb[0]
            g = rgb[1]
            b = rgb[2]
            a = rgb[3]
            if r+g+b>250 or a<254:
                # img_array[x, y] = (225, 0, 0, 255)
                img_array[x, y] = (0, 0, 0, 0)

    
    # img_new = img.resize(
    #     size=(width, height)
    # )
    # img_new.save(path_out+file_name)
    img.save(path_out+file_name)



reset_image(name)

