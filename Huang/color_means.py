#!/usr/bin/env python
# coding: utf-8

# In[24]:


import numpy as np
import cv2

def centroid_histogram(clt):
    # grab the number of different clusters and create a histogram
    # based on the number of pixels assigned to each cluster
    numLabels = np.arange(0, len(np.unique(clt.labels_)) + 1)
    (hist, _) = np.histogram(clt.labels_, bins = numLabels)

    # normalize the histogram, such that it sums to one
    hist = hist.astype("float")
    hist /= hist.sum()

    # return the histogram
    return hist

def plot_colors(hist, centroids):
    # initialize the bar chart representing the relative frequency
    # of each of the colors
    bar = np.zeros((50, 300, 3), dtype = "uint8")
    startX = 0

    # loop over the percentage of each cluster and the color of
    # each cluster
    for (percent, color) in zip(hist, centroids):
        # plot the relative percentage of each cluster
        endX = startX + (percent * 300)
        cv2.rectangle(bar, (int(startX), 0), (int(endX), 50),
            color.astype("uint8").tolist(), -1)
        startX = endX
    
    # return the bar chart
    return bar


# In[25]:


# USAGE
# python color_kmeans.py --image images/jp.png --clusters 3

# Author: Adrian Rosebrock
# Website: www.pyimagesearch.com

# import the necessary packages
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import argparse
import cv2
import utils 
# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser(description="Color K-Means")
ap.add_argument("-i", "--image", required=True, help="path to input image")
ap.add_argument("-c", "--clusters", required=True, type=int, help="# of clusters")
args = vars(ap.parse_args())
 
# load the image and convert it from BGR to RGB so that
# we can display it with matplotlib
image = cv2.imread(args["image"])
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
 
# show our image
plt.figure()
plt.axis("off")
plt.imshow(image)
 
# reshape the image to be a list of pixels
image = image.reshape((image.shape[0] * image.shape[1], 3))
 
# cluster the pixel intensities
clt = KMeans(n_clusters=args["clusters"])
clt.fit(image)
 
# build a histogram of clusters and then create a figure
# representing the number of pixels labeled to each color
hist = utils.centroid_histogram(clt)
bar = utils.plot_colors(hist, clt.cluster_centers_)
 
# show our color bar
plt.figure()
plt.axis("off")
plt.imshow(bar)
plt.show()


# In[ ]:




