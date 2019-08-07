import numpy as np
import sys
import os
import re
import scipy
import scipy.spatial.distance
from operator import itemgetter
from skimage import io
import cv2

def read_segmentation(roi_dir, field=[]):
	if field==[]:
		sys.stderr.write("Specify field\n")
		sys.exit(0)
	all_coord = {}
	for i in field:
		f = open("%s/roi.pos%d.all.txt" % (roi_dir, i))
		tx = []
		for l in f:
			l = l.rstrip("\n")
			ll = l.split("\t")
			tx.append((int(ll[0]), float(ll[1]), float(ll[2])))
		f.close()
		all_coord[i] = tx
	return all_coord

def read_segmentation_one(n_file, sep="\t"):
	f = open(n_file)
	tx = []
	for l in f:	
		l = l.rstrip("\n")
		ll = l.split(sep)
		tx.append((int(ll[0]), float(ll[1]), float(ll[2])))
	f.close()
	return tx

def get_centroid(seg): #seg is returned by read_segmentation
	seg_keys = sorted(list(seg.keys()))
	points = np.empty((len(seg_keys), 2), dtype="float32")
	for ik, k in enumerate(seg_keys):
		pts = np.array(seg[k])
		#print(pts)
		contour = [pts]
		M = cv2.moments(contour[0])
		cX = int(M["m10"] / M["m00"])
		cY = int(M["m01"] / M["m00"])
		points[ik, :] = [cX, cY]
	return seg_keys, points

def match(points, seg_keys, Xcen, names):
	dist = scipy.spatial.distance.cdist(points, Xcen)
	all_dist = []
	for i in range(points.shape[0]):
		for ip in range(Xcen.shape[0]):
			all_dist.append((i, ip, dist[i, ip]))
	#all_dist.sort(lambda x,y:cmp(x[2], y[2]))
	all_dist.sort(key=itemgetter(2))

	visited_i = set([])
	visited_j = set([])
	pairs = []
	for i,j,d in all_dist:
		if i in visited_i or j in visited_j:
			continue
		visited_i.add(i)
		visited_j.add(j)
		pairs.append((seg_keys[i], names[j], d))
		#print("pairs", pos, path_names[i], names[j] #, Xcen[j,:])
		#print("pairs", seg_keys[i], names[j], d #, Xcen[j,:])
	return pairs
