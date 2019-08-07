import shutil
import sys
import os
import re
import json
import numpy as np
from operator import itemgetter
import argparse
import pandas as pd
from skimage import io
import image_processing
import stitch_cell_centroid
import segmentation

if __name__=="__main__":
	parser = argparse.ArgumentParser(description="viewer-setup-step1", formatter_class=argparse.ArgumentDefaultsHelpFormatter)
	parser.add_argument("-c", "--config", dest="config", type=str, required=True)
	#parser.add_argument("-o", "--output-js", dest="output_js", type=str, required=True)
	#parser.add_argument("-p", "--output-html", dest="output_html", type=str, required=True)
	#parser.add_argument("-q", "--output-css", dest="output_css", type=str, required=True)
	args = parser.parse_args()

	f = open(args.config)
	config = json.load(f)
	f.close()

	if config["tiff_width"]!=config["tiff_height"]:
		sys.stderr.write("tiff width and tiff height is different.\n")
		sys.exit(0)

	tasks = []
	for k in config:
		if k.startswith("new_task_"):
			#t_id = k.split("new_task_")[1]
			priority = config[k]["priority"]
			tasks.append((k, priority))
	tasks.sort(key=itemgetter(1))
	#print(tasks)

	for i,j in tasks:
		if config[i]["task"]=="extract_roi_zip":
			pp = config[i]["positions"]
			for pi in pp:
				fname = config[i]["input"].replace("[POSITION]", "%s" % pi)
				oname = config[i]["output"].replace("[POSITION]", "%s" % pi)
				tfolder = config[i]["tmp"].replace("[POSITION]", "%s" % pi)
				print("Working on position", pi, "...")
				javapath = os.path.dirname(image_processing.__file__)
				image_processing.extract_roi_zip(fname, oname, tmp_dir=tfolder, javapath=javapath)
		
		elif config[i]["task"]=="decouple_tiff":
			pp = config[i]["positions"]
			for pi in pp:
				fname = config[i]["input"].replace("[POSITION]", "%s" % pi)
				oprefix = config[i]["output_prefix"].replace("[POSITION]", "%s" % pi)
				print("Decoupling tiff...")
				image_processing.decouple_tiff(fname, prefix=oprefix)

		elif config[i]["task"]=="rotate_image":
			pp = config[i]["positions"]
			ss = config[i]["stain_ids"]
			for pi in pp:
				for si in ss:
					fname = config[i]["input"].replace("[POSITION]", "%s" % pi)
					fname = fname.replace("[STAINID]", "%s" % si)
					oname = config[i]["output"].replace("[POSITION]", "%s" % pi)
					oname = oname.replace("[STAINID]", "%s" % si)
					image_processing.rotate(fname, oname)
		
		elif config[i]["task"]=="stitch_image":
			pp = config[i]["positions"]
			ss = config[i]["stain_ids"]
			offset = image_processing.read_offset(config[i]["offset"])
			for si in ss:
				oname = config[i]["output"].replace("[STAINID]", "%s" % si)
				timage_by_field = {}
				for pi in pp:
					fname = config[i]["input"].replace("[POSITION]", "%s" % pi)
					fname = fname.replace("[STAINID]", "%s" % si)
					timage_by_field[pi] = io.imread(fname)
				image_processing.stitch_image(timage_by_field, offset, outfile=oname)
	
		elif config[i]["task"]=="rotate_coord":
			Xcen, field = stitch_cell_centroid.read_centroid(config[i]["input"])
			Xcen2 = np.empty(Xcen.shape, dtype="float32")
			new_coord = image_processing.rotate_coordinate(Xcen)
			for c in range(Xcen.shape[0]):
				Xcen2[c,:] = new_coord[c]
			fw = open(config[i]["output"], "w")
			fw.write("Field of View,Cell ID,X,Y\n")
			for c in range(Xcen2.shape[0]):
				fw.write("%d,%d,%.1f,%.1f\n" % (field[c], c+1, Xcen2[c,0], Xcen2[c,1]))
			fw.close()

		elif config[i]["task"]=="stitch_coord":
			Xcen, field = stitch_cell_centroid.read_centroid(config[i]["input"])
			m = image_processing.subset_cell_index(field, FD=config[i]["positions"])
			field, Xcen = field[m], Xcen[m]
			offset = image_processing.read_offset(config[i]["offset"])
			Xcen_new = image_processing.stitch_coord(Xcen, field, offset)
			fw = open(config[i]["output"], "w")
			for c in range(Xcen_new.shape[0]):
				fw.write("%d,%d,%.1f,%.1f\n" % (c+1, 100, Xcen_new[c,0], Xcen_new[c,1]))
			fw.close()

		elif config[i]["task"]=="rotate_segmentation_roi":
			pp = config[i]["positions"]
			for pi in pp:
				fname = config[i]["input"].replace("[POSITION]", "%s" % pi)
				oname = config[i]["output"].replace("[POSITION]", "%s" % pi)
				seg = segmentation.read_segmentation_one(fname, sep=",")
				fw = open(oname, "w")
				for c,x,y in seg:
					new_x,new_y = image_processing.rotate_coordinate_one(x,y)
					fw.write("%d,%.1f,%.1f\n" % (c, new_x, new_y))
				fw.close()
		
		elif config[i]["task"]=="stitch_segmentation_roi":
			pp = config[i]["positions"]
			all_coord = {}
			for pi in pp:
				fname = config[i]["input"].replace("[POSITION]", "%s" % pi)
				all_coord[pi] = segmentation.read_segmentation_one(fname, sep=",")
			offset = image_processing.read_offset(config[i]["offset"])
			cur = 0
			fw = open(config[i]["output"], "w")
			for pi in pp:
				num_cell = max([s[0] for s in all_coord[pi]])
				for c,x,y in all_coord[pi]:
					final_x,final_y = image_processing.stitch_coord_one(x, y, pi, offset)
					fw.write("%d,%.1f,%.1f\n" % (c+cur, final_x, final_y))
				cur+=num_cell
			fw.close()

		elif config[i]["task"]=="align_segmentation_and_cell_centroid":
			fname = config[i]["input_segmentation"]
			seg = segmentation.read_segmentation_one(fname, sep=",")
			by_cell = {}
			for c,x,y in seg:
				by_cell.setdefault(c, [])
				by_cell[c].append((int(x), int(y)))	
			f = open(config[i]["input_cell_centroid"])
			num_line = 0
			for l in f:
				l = l.rstrip("\n")
				num_line+=1
			f.close()
			Xcen_new = np.empty((num_line, 2), dtype="float32")
			f = open(config[i]["input_cell_centroid"])
			ic = 0
			for l in f:
				l = l.rstrip("\n")
				ll = l.split(",")
				Xcen_new[ic,0], Xcen_new[ic,1] = float(ll[2]), float(ll[3])
				ic+=1
			f.close()
			seg_keys, points = segmentation.get_centroid(by_cell)
			names = [c+1 for c in range(Xcen_new.shape[0])]
			pairs = segmentation.match(points, seg_keys, Xcen_new, names)
			fw = open(config[i]["output"], "w")
			for c1, c2, c3 in pairs:
				fw.write("pairs %d %d %.3f\n" % (c1, c2, c3))
			fw.close()
		
		elif config[i]["task"]=="tiling_image":
			ss = config[i]["stain_ids"]
			for si in ss:
				fname = config[i]["input"].replace("[STAINID]", "%s" % si)
				odir = config[i]["output_dir"].replace("[STAINID]", "%s" % si)
				print("Tiling joined image of channel", si, "...")
				image_processing.tile(fname, odir, "map", zoom=config[i]["zoom"])
		
		elif config[i]["task"]=="prepare_gene_expression":
			mat = pd.read_csv(config[i]["input"], sep=config[i]["csv_sep"], \
			header=config[i]["csv_header"], index_col=config[i]["csv_index_col"])

			image_processing.multilayer_explorer_expression(mat, config[i]["output_dir"], \
			num_genes_per_file=config[i]["num_genes_per_file"])
