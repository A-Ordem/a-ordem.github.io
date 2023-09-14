import numpy as np
import cv2
import rasterio
from rasterio.plot import show

path = "./10_4231_R7RX991C/10_4231_R7RX991C/aviris_hyperspectral_data/19920612_AVIRIS_IndianPine_NS-line.tif"

with rasterio.open(path) as image:
    image_array = image.read()

    width = len(image_array[0])
    heigth = len(image_array[0][0])
    channel = 1
    
    fps = 20

    fourcc = cv2.VideoWriter_fourcc(*'X264')
    
    #Syntax: cv2.VideoWriter( filename, fourcc, fps, frameSize )
    video = cv2.VideoWriter('test.mp4', fourcc, float(fps), (width, heigth))

    for frame_count in range(len(image_array)):
        max = np.amax(image_array[frame_count])
        min = np.amin(image_array[frame_count])

        img = np.expand_dims(np.floor((image_array[frame_count]-min)/(max-min) * 255).astype(np.uint8).transpose() , axis=-1)

        video.write(img)
        print("{:.1f}".format(100*frame_count/len(image_array)))

    video.release()
