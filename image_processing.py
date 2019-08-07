import shutil
import sys
import os
import re
from skimage import io
from skimage.color import rgb2gray
import pandas as pd
from skimage.external.tifffile import imsave
import numpy as np
import random
import subprocess

def extract_roi_zip_2(input_file, output_file, tmp_dir="/tmp/pos", javapath="."):
	if os.path.isdir(tmp_dir):
		shutil.rmtree(tmp_dir)
	os.mkdir(tmp_dir)	
	if not input_file.endswith("zip"):
		print("input file must be a zip file")
		sys.exit(0)

	cmd = "unzip -q"
	#if overwrite:
	#	cmd += " -o"
	cmd += " %s -d %s" % (input_file, tmp_dir)
	subprocess.call(cmd, shell=True)
	
	for f in os.listdir(tmp_dir):
		if os.path.isfile(os.path.join(tmp_dir, f)) and f.endswith(".roi"):
			f1 = os.path.join(tmp_dir, f)
			f2 = f1.rsplit(".roi", 1)[0] + ".txt"
			cmd = "java -classpath \"%s:%s/ij.jar\" ReaderROI %s > %s" % (javapath, javapath, f1, f2)
			subprocess.call(cmd, shell=True)

	list_outfile = []
	for f in os.listdir(tmp_dir):
		if os.path.isfile(os.path.join(tmp_dir, f)) and f.endswith(".txt"):
			list_outfile.append(f)
	
	list_outfile.sort()
	fw = open("%s" % output_file, "w")
	for i in range(len(list_outfile)):
		f = open(os.path.join(tmp_dir, list_outfile[i]))
		for l in f:
			l = l.rstrip("\n")
			ll = l.split(" ")
			fw.write("%d\t%s\t%s\n" % (i+1, ll[0], ll[1]))
		f.close()
	fw.close()

def extract_roi_zip(input_file, output_file, tmp_dir="/tmp/pos", javapath="."):
	if os.path.isdir(tmp_dir):
		shutil.rmtree(tmp_dir)
	os.mkdir(tmp_dir)	
	if not input_file.endswith("zip"):
		print("input file must be a zip file")
		sys.exit(0)

	cmd = "unzip -q"
	cmd += " %s -d %s" % (input_file, tmp_dir)
	subprocess.call(cmd, shell=True)
	
	list_infile = []
	for f in os.listdir(tmp_dir):
		if os.path.isfile(os.path.join(tmp_dir, f)) and f.endswith(".roi"):
			list_infile.append(f)
	list_infile.sort()

	fw = open("%s/filelist" % tmp_dir, "w")
	for t_file in list_infile:
		f1 = os.path.join(tmp_dir, t_file)
		fw.write(f1 + "\n")
	fw.close()

	dir_path = os.path.dirname(os.path.realpath(output_file))
	if not os.path.isdir(dir_path):
		os.mkdir(dir_path)

	cmd = "java -classpath \"%s:%s/ij.jar\" ReaderROIList %s > %s" % (javapath, javapath, tmp_dir + "/filelist", output_file)
	subprocess.call(cmd, shell=True)

def decouple_tiff(input_file, prefix="Pos"):
	cmd = "convert %s -set comment testing %s.%%d.tif" % (input_file, prefix)
	subprocess.call(cmd, shell=True)

def subset_cell_index(field, FD=[]):
	if FD==[]:
		print("Error")
		sys.exit(0)
	set_FD = set(FD)
	m = []
	for i in range(field.shape[0]):
		if field[i] in set_FD:
			m.append(i)
	return np.array(m)

def rotate_base(timage, size=2048):
	timage2 = np.empty(timage.shape, dtype=timage.dtype)
	print(timage.shape, timage.dtype)
	'''
	for ix in range(2048):
		for iy in range(2048):
			print(ix, iy, timage[0,ix,iy,:], timage[1,ix,iy,:])
	'''
	for i in range(timage.shape[0]):
		for j in range(timage.shape[1]):
			this_x = i
			this_y = j * -1
			new_x = this_y + (size-1)
			new_y = this_x
			#print(i, j, new_x, new_y)
			timage2[i,j] = timage[new_x, new_y]
	return timage2

def rotate(input_file, output_file, size=2048):
	timage = io.imread(input_file)
	timage2 = rotate_base(timage, size=size)
	io.imsave(output_file, timage2)

def rotate_coordinate(all_coord, size=2048):
	new_coord = []
	for x,y in all_coord:
		this_x = x
		this_y = y * -1
		new_x = this_y + size - 1
		new_y = this_x
		new_coord.append((new_x, new_y))
	return new_coord

def rotate_coordinate_one(x,y, size=2048):
	this_x = x
	this_y = y * -1
	new_x = this_y + size - 1
	new_y = this_x
	return (new_x, new_y)

def stitch_coord(Xcen, field, offset):
	Xcen_new = np.empty((Xcen.shape), dtype="float32")
	for i in range(Xcen.shape[0]):
		x = Xcen[i][0]
		y = Xcen[i][1]	
		pos = field[i]
		final_x = x + offset[pos][0]
		final_y = y + offset[pos][1]
		Xcen_new[i,:] = [final_x, final_y]
	return Xcen_new

def stitch_coord_one(x, y, pos, offset):
	final_x = x + offset[pos][0]
	final_y = y + offset[pos][1]
	return (final_x, final_y)

def stitch_image(timage_by_field, offset, outfile="Pos.joined.tif", order=[], size=2048):
	tt_x = max([offset[p][0] for p in offset]) + size
	tt_y = max([offset[p][1] for p in offset]) + size
	print("Stitched image size", tt_x, tt_y)
	imm = np.zeros((tt_y, tt_x), dtype="uint16")
	if order==[]:
		order = sorted(offset.keys())
	for pos in order:
		for k in range(size):
			for l in range(size):
				imm[k+offset[pos][1], l+offset[pos][0]] = timage_by_field[pos][k,l]
	io.imsave(outfile, imm)

def read_offset(n):
	offset = {}
	f = open(n)
	for l in f:
		l = l.rstrip("\n")
		ll = l.split("\t")
		field1 = int(ll[0].split(".")[0].split("Pos")[1])
		field2 = int(ll[1].split(".")[0].split("Pos")[1])
		s1 = ll[0].split(".")[1]
		s2 = ll[1].split(".")[1]
		if not (s1=="x" and s2=="y"):
			print("Error", l)
			break
		if not field1==field2:
			print("Error", l)
			break
		off_x, off_y = 0,0
		offset[field1] = (off_x, off_y)
		#if ("Pos" not in ll[2]) and ("Pos" not in ll[3]):	
		#	offset[field1] = (int(ll[2]), int(ll[3]))

		if "Pos" not in ll[2]:
			off_x = int(ll[2])
			offset[field1] = (off_x, off_y)
		if "Pos" not in ll[3]:
			off_y = int(ll[3])
			offset[field1] = (off_x, off_y)

		if "Pos" in ll[2]:
			ll[2] = ll[2].replace(" ", "")
			if "+" in ll[2]:
				llx = ll[2].split("+")
				if len(llx)!=2:
					print("there should be only two operands")
					break
				if llx[0].startswith("Pos"):
					fieldx = int(llx[0].split(".")[0].split("Pos")[1])
					off_x = offset[fieldx][0] + int(llx[1])
				elif llx[1].startswith("Pos"):
					fieldx = int(llx[1].split(".")[0].split("Pos")[1])
					off_x = int(llx[0]) + offset[fieldx][0]
			elif "-" in ll[2]:
				llx = ll[2].split("-")
				if len(llx)!=2:
					print("there should be only two operands")
					break
				if llx[0].startswith("Pos"):
					fieldx = int(llx[0].split(".")[0].split("Pos")[1])
					off_x = offset[fieldx][0] - int(llx[1])
				elif llx[1].startswith("Pos"):
					fieldx = int(llx[1].split(".")[0].split("Pos")[1])
					off_x = int(llx[0]) - offset[fieldx][0]
			elif "*" in ll[2] or "/" in ll[2]:
				print("multiplication and division not supported")
				break
			offset[field1] = (off_x, off_y)

		if "Pos" in ll[3]:
			ll[3] = ll[3].replace(" ", "")
			if "+" in ll[3]:
				llx = ll[3].split("+")
				if len(llx)!=2:
					print("there should be only two operands")
					break
				if llx[0].startswith("Pos"):
					fieldy = int(llx[0].split(".")[0].split("Pos")[1])
					off_y = offset[fieldy][1] + int(llx[1])
				elif llx[1].startswith("Pos"):
					fieldy = int(llx[1].split(".")[0].split("Pos")[1])
					off_y = int(llx[0]) + offset[fieldy][1]
			elif "-" in ll[3]:
				llx = ll[3].split("-")
				if len(llx)!=2:
					print("there should be only two operands")
					break
				if llx[0].startswith("Pos"):
					fieldy = int(llx[0].split(".")[0].split("Pos")[1])
					off_y = offset[fieldy][1] - int(llx[1])
				elif llx[1].startswith("Pos"):
					fieldy = int(llx[1].split(".")[0].split("Pos")[1])
					off_y = int(llx[0]) - offset[fieldy][1]
			elif "*" in ll[3] or "/" in ll[3]:
				print("multiplication and division not supported")
				break
			offset[field1] = (off_x, off_y)
	return offset

def tile(input_file, output_dir, prefix, zoom=6, verbose=False, overwrite=True):
	if overwrite:
		if os.path.isdir(output_dir):
			shutil.rmtree(output_dir)
			os.mkdir(output_dir)

	png_input_file = input_file.rsplit(".", 1)[0] + ".png"
	cmd = "convert %s %s" % (input_file, png_input_file)
	subprocess.call(cmd, shell=True)

	cmd = "tileup --in %s --output-dir %s --prefix %s --auto-zoom=%d" % (png_input_file, \
	output_dir, prefix, zoom)
	if verbose:
		cmd += " --verbose"
	subprocess.call(cmd, shell=True)
	os.chdir(output_dir)
	for i in range(zoom):
		ij = 20 - i
		new_ij = zoom - i - 1
		os.rename(str(ij), str(new_ij))
	os.chdir("..")

def multilayer_explorer_expression(mat, output_dir, num_genes_per_file=100):
	genes = [g for g in mat.index]
	random.shuffle(genes)

	length = len(genes)
	num_files = int(length / num_genes_per_file)
	if length % num_genes_per_file>0:
		num_files += 1

	n = int(length / num_files)
	rem = length % num_files
	if rem>0:
		n+=1

	gene_to_id = {}
	by_id = {}
	c = 0
	for i in range(num_files):
		by_id.setdefault(i, [])
		for j in range(n):
			if c == length: break
			by_id[i].append(genes[c])
			gene_to_id[genes[c]] = i
			c+=1

	if not os.path.isdir(output_dir):
		os.mkdir(output_dir)

	fw = open("%s/gene.map" % output_dir, "w")
	for i in by_id:
		for g in by_id[i]:
			fw.write("%d\t%s\n" % (i, g))
	fw.close()

	for i in by_id:
		mat_sub = mat.loc[by_id[i]]
		mat_sub.to_csv("%s/expr.%d.txt" % (output_dir, i), sep="\t", header=False, float_format="%.2f")
	
