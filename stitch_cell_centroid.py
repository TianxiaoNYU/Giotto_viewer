import sys
import math
import numpy as np
import scipy
import scipy.stats
from scipy.stats import zscore
from scipy.spatial.distance import euclidean, squareform, pdist
import pandas as pd
from scipy.cluster.vq import kmeans2
import image_processing

def read_cell_type(n):
	f = open(n)
	m = {}
	pt = 1
	for l in f:
		l = l.rstrip("\n").split(" ")
		cl = int(l[0])
		m[pt] = cl
		pt+=1
	f.close()
	ma = np.arange(len(m)+1)
	ma[0] = -1
	for k in m:
		ma[int(k)] = m[k]
	return ma

def norm_centroid(cent):
	scale_factor = 2000/4
	cent[:,0] = (cent[:,0] - float(1000)) / float(500)
	cent[:,1] = (cent[:,1] - float(-1000)) / float(500)
	return cent

def read_centroid(n):
	f = open(n)
	f.readline()
	num_cell = 0
	for l in f:
		l = l.rstrip("\n")
		num_cell+=1
	f.close()
	Xcen = np.empty((num_cell, 2), dtype="float32")
	field = np.empty((num_cell), dtype="int32")

	f = open(n)
	f.readline()
	ind = 0
	for l in f:
		l = l.rstrip("\n")
		ll = l.split(",")
		Xcen[ind,:] = [float(ll[-2]), float(ll[-1])]
		field[ind] = int(ll[0])
		ind+=1
	f.close()
	return Xcen, field

if __name__=="__main__":
	Xcen, field = read_centroid("../Cell_centroids.csv")
	Xcen2 = np.empty(Xcen.shape, dtype="float32")
	for i in range(Xcen.shape[0]):
		this_x = Xcen[i,0]
		this_y = Xcen[i,1] * -1.0
		new_x = this_y + (2048 - 1.0)
		new_y = this_x
		Xcen2[i,:] = [new_x, new_y]
	Xcen = Xcen2

	'''
	offset = {}
	offset[0] = (0,2048)
	offset[1] = (2048, 2048)
	offset[2] = (offset[1][0]+2048, 2048)
	offset[3] = (offset[2][0]+2048, 2048)
	offset[4] = (offset[3][0]+675, 0)
	'''
	offset = image_processing.read_offset("offset.txt")

	for i in range(Xcen.shape[0]):
		t_field = field[i]
		if t_field>=5: continue
		final_x = Xcen[i,0] + offset[t_field][0]
		final_y = Xcen[i,1] + offset[t_field][1]
		sys.stdout.write("%d,%d,%.1f,%.1f\n" % (i+1, 100, final_x, final_y))
