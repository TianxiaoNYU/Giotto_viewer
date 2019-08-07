import sys
import os
import re
from skimage import io
from skimage.color import rgb2gray
from skimage.external.tifffile import imsave
import numpy as np
import pandas as pd
import image_processing
import stitch_cell_centroid
import segmentation

if __name__=="__main__":

	print("Extracting info from segmentation Roi zip...")
	for i in range(0,5):
		print("Working on position", i, "...")
		image_processing.extract_roi_zip("RoiSet_Pos%d_real.zip" % i, "roi/roi.pos%d.all.txt" % i, tmp_dir="/tmp/pos%d" % i)

	offset = image_processing.read_offset("offset.txt")

	print("Decoupling tiff...")
	for d in range(0,5):
		print("Working on position", d, "...")
		image_processing.decouple_tiff("segmentation_staining_1_MMStack_Pos%d.ome.tif" % d, prefix="Pos%d" % d)

	print("Stitching staining images...")
	for channel in [0,4,7]:
		for i in range(0,5):
			image_processing.rotate("Pos%d.%d.tif" % (i, channel), "Pos%d.%d.rotate.tif" % (i, channel))
		timage_by_field = {}
		for i in range(0,5):
			timage_by_field[i] = io.imread("Pos%d.%d.rotate.tif" % (i,channel))
		image_processing.stitch_image(timage_by_field, offset, outfile="Pos.ch%d.joined.tif" % channel)
	
	Xcen, field = stitch_cell_centroid.read_centroid("Cell_centroids.csv")
	Xcen2 = np.empty(Xcen.shape, dtype="float32")

	new_coord = image_processing.rotate_coordinate(Xcen)
	for i in range(Xcen.shape[0]):
		Xcen2[i, :] = new_coord[i]
	
	print("Stitching expression data...")
	m = image_processing.subset_cell_index(field, FD=[0,1,2,3,4])
	field, Xcen2 = field[m], Xcen2[m]
	Xcen_new = image_processing.stitch_coord(Xcen2, field, offset)
	fw = open("cell.centroid.stitched.pos.all.cells.txt", "w")
	for i in range(Xcen_new.shape[0]):
		fw.write("%d,%d,%.1f,%.1f\n" % (i+1, 100, Xcen_new[i,0], Xcen_new[i,1]))
	fw.close()

	print("Stitching segmentations...")
	all_coord = segmentation.read_segmentation("roi", field=[0,1,2,3,4])
	by_cell = {}
	cur = 0
	fw = open("roi.stitched.pos.all.cells.txt", "w")
	for pos in range(0,5):
		num_cell = max([s[0] for s in all_coord[pos]])
		for i,x,y in all_coord[pos]:
			new_x, new_y = image_processing.rotate_coordinate_one(x, y)
			final_x, final_y = image_processing.stitch_coord_one(new_x, new_y, pos, offset)
			fw.write("%d,%.1f,%.1f\n" % (i+cur, final_x, final_y))
			by_cell.setdefault(i+cur, [])
			by_cell[i+cur].append((int(final_x), int(final_y)))
		cur+=num_cell
	fw.close()

	print("Aligning segmentation to expression data...")
	fw = open("segmentation.to.cell.centroid.map.txt", "w")
	seg_keys, points = segmentation.get_centroid(by_cell)
	names = [i+1 for i in range(Xcen_new.shape[0])]
	pairs = segmentation.match(points, seg_keys, Xcen_new, names)
	for i,j,d in pairs:
		fw.write("pairs %d %d %.3f\n" % (i, j, d))
	fw.close()	

	for i in [0,4,7]:
		print("Tiling joined image of channel", i, "...")
		image_processing.tile("Pos.ch%d.joined.tif" % i, "imapr26.%d" % i, "map", zoom=6)

	print("Preparing expression for explorer...")
	mat = pd.read_table("cortex_expression_zscore.csv", sep=",", header=0, index_col=0)
	image_processing.multilayer_explorer_expression(mat, "10k.genes", num_genes_per_file=100)

