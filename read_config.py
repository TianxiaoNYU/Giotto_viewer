import shutil
import sys
import os
import re
import json
import read_html_template
import read_css_template
import argparse

def generate_other_functions():
	cmd = """
function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }else {
        pom.click();
    }
}
function initializeMap(elementid="map", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=4096){
    //var mapExtent = [0.0, -10240.0, 4096.0, 0.0];
    var mapExtent = [0.0, -1.0*maxBound, maxBound, 0.0];
    var mapMinZoom = minZoom;
    var mapMaxZoom = maxZoom;
    var mapMaxResolution = 1.00000;
    var mapMinResolution = Math.pow(2, mapMaxZoom) * mapMaxResolution;
    var tileExtent = [0.0, -1.0*maxBound, maxBound, 0.0];
    var crs = L.CRS.Simple;
    crs.transformation = new L.Transformation(1, -tileExtent[0], -1, tileExtent[3]);
    crs.scale = function(zoom){
        return Math.pow(2, zoom) / mapMinResolution;
    };
    crs.zoom = function(scale){
        return Math.log(scale * mapMinResolution) / Math.LN2;
    };
    var map = new L.Map(elementid, {
        preferCanvas: true, zoomControl:zoomControl, zoomSnap:zoomSnap, zoomDelta:zoomDelta,
        maxZoom: mapMaxZoom, minZoom: mapMinZoom, crs: crs
    });
    map.fitBounds([
        crs.unproject(L.point(mapExtent[2], mapExtent[3])),
        crs.unproject(L.point(mapExtent[0], mapExtent[1]))
    ]);
    L.control.zoom({position:"topright"}).addTo(map);
    return map;
}
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});
L.Control.include({
    _refocusOnMap: L.Util.falseFn
});
"""
	return cmd


def generate_tsne_map(c):
	header = """
var map%d = initializeMap(elementid="map%d", zoomControl=false, zoomSnap=0.5,
zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=%d);
""" % (c["id"], c["id"], c["maxBound"])
	
	line1 = """var t_panel_%d = new PanelTsne({name:"tsne", map:map%d, mapid:%d, annot_set:a_set,
file_tsne:"%s", load_tsne:true, default_annot:"%s", load_annot:true});
""" % (c["id"], c["id"], c["id"], c["file_tsne"], c["annot"])
	return [header, line1]

def generate_physical_map(c):
	header = """
var map%d = initializeMap(elementid="map%d", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=%d);
""" % (c["id"], c["id"], c["maxBound"])

	line1 = """var e_panel_%d = new PanelPhysical({name:"physical", dir_dapi:"%s", dir_nissl:"%s",
dir_polyA:"%s", map:map%d, mapid:%d, annot_set:a_set, default_annot:"%s", 
default_tile:"%s",
load_tile:true, load_gene_map:true, load_segmentation:true, load_annot:true, 
load_expression:true,
file_gene_map:"%s",
file_segmentation_map:"%s",
file_segmentation:"%s",
dir_gene_expression:"%s", file_gene_list:"%s"});
""" % (c["id"], c["dir_dapi"], c["dir_nissl"], c["dir_polyA"], c["id"], c["id"], \
c["annot"], c["tile"], c["gene_map"], c["segmentation_map"], c["segmentation"], \
c["dir_gene_expression"], c["gene_list"])
	return [header, line1]

def generate_physical_simple_map(c):
	header = """
var map%d = initializeMap(elementid="map%d", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=%d);
""" % (c["id"], c["id"], c["maxBound"])

	line1 = """var t_panel_%d = new PanelPhysicalSimple({name:"physical.dot", map:map%d, mapid:%d, annot_set:a_set,
file_simple:"%s", load_simple:true, default_annot:"%s", load_annot:true});
""" % (c["id"], c["id"], c["id"], c["file_simple"], c["annot"])
	return [header, line1]

def generate_annot_set(c):
	all_lines = []
	init = """
var a_set = new AnnotationSet();"""
	all_lines.append(init)
	for i,j in c:
		aLine = """a_set.addAnnotation("%s", "%s");""" % (i, j)
		all_lines.append(aLine)
	return all_lines

def generate_interaction(interactions, config):
	a_1 = []
	for aL in interactions:
		for a in aL:
			src = ""
			if config[a]["type"]=="PanelTsne" or config[a]["type"]=="PanelPhysicalSimple":
				src = "t_panel_%d" % config[a]["id"]
			elif config[a]["type"]=="PanelPhysical":
				src = "e_panel_%d" % config[a]["id"]
			targets = []
			for b in aL:
				if a==b: continue
				target = ""
				if config[b]["type"]=="PanelTsne" or config[b]["type"]=="PanelPhysicalSimple":
					target = "t_panel_%d" % config[b]["id"]
				elif config[b]["type"]=="PanelPhysical":
					target = "e_panel_%d" % config[b]["id"]
				targets.append(target)
			target_line = ", ".join(targets)
			cmd = """%s.addInteraction([%s]);""" % (src, target_line)
			a_1.append(cmd)
		
		for a in aL:
			src = ""
			#if config[a]["type"]!="PanelTsne" and config[a]["type"]!="PanelPhysicalSimple": continue
			if config[a]["type"]=="PanelTsne" or config[a]["type"]=="PanelPhysicalSimple":
				src = "t_panel_%d" % config[a]["id"]
			elif config[a]["type"]=="PanelPhysical":
				src = "e_panel_%d" % config[a]["id"]
			#src = "t_panel_%d" % config[a]["id"]
			targets = []
			for b in aL:
				if a==b: continue
				target = ""
				if config[b]["type"]=="PanelTsne" or config[b]["type"]=="PanelPhysicalSimple":
					target = "t_panel_%d" % config[b]["id"]
				elif config[b]["type"]=="PanelPhysical":
					target = "e_panel_%d" % config[b]["id"]
				targets.append(target)
			target_line = ", ".join(targets)
			cmd = """%s.addTooltips([%s]);""" % (src, target_line)
			a_1.append(cmd)
	return a_1
	
def generate_sync(syncs, config):
	a_1 = []
	for aL in syncs:
		for a in aL:
			src = ""
			if config[a]["type"]=="PanelTsne" or config[a]["type"]=="PanelPhysicalSimple":
				src = "t_panel_%d" % config[a]["id"]
			elif config[a]["type"]=="PanelPhysical":
				src = "e_panel_%d" % config[a]["id"]
			targets = []
			for b in aL:
				if a==b: continue
				target = ""
				if config[b]["type"]=="PanelTsne" or config[b]["type"]=="PanelPhysicalSimple":
					target = "t_panel_%d" % config[b]["id"]
				elif config[b]["type"]=="PanelPhysical":
					target = "e_panel_%d" % config[b]["id"]
				targets.append(target)
			target_line = ", ".join(targets)
			cmd = """%s.syncMoveend([%s]);""" % (src, target_line)
			a_1.append(cmd)
	return a_1	

def generate_enable_lasso(config):
	cmds = []
	for k in config:
		if k.startswith("map_"):
			src = ""
			if config[k]["type"]=="PanelTsne" or config[k]["type"]=="PanelPhysicalSimple":
				src = "t_panel_%d" % config[k]["id"]
			elif config[k]["type"]=="PanelPhysical":
				src = "e_panel_%d" % config[k]["id"]
			cmd = """%s.enableLasso();""" % src
			cmds.append(cmd)
	return cmds

if __name__=="__main__":
	parser = argparse.ArgumentParser(description="viewer-setup", formatter_class=argparse.ArgumentDefaultsHelpFormatter)
	parser.add_argument("-c", "--config", dest="config", type=str, required=True)
	parser.add_argument("-o", "--output-js", dest="output_js", type=str, required=True)
	parser.add_argument("-p", "--output-html", dest="output_html", type=str, required=True)
	parser.add_argument("-q", "--output-css", dest="output_css", type=str, required=True)
	args = parser.parse_args()

	f = open(args.config)
	config = json.load(f)
	f.close()

	num_panel = config["num_panel"]
	num_annot = config["annotation_set"]["num_annot"]
	
	ann = []
	for i in range(1, num_annot+1):
		t_key = "annot_%d" % i
		if not t_key in config["annotation_set"]:
			sys.stderr.write("annotation key %s is missing\n" % t_key)
			sys.exit(0) 
		t_annot = config["annotation_set"][t_key]
		ann.append((t_annot["file"], t_annot["name"]))

	lines = []	
	for i in range(1, num_panel+1):
		t_panel = "map_%d" % i
		if not t_panel in config:
			sys.stderr.write("key %s is missing\n" % t_panel)
			sys.exit(0)
		t_map = config[t_panel]
		if t_map["type"]=="PanelPhysical":
			lines.extend(generate_physical_map(t_map))
		elif t_map["type"]=="PanelTsne":
			lines.extend(generate_tsne_map(t_map))
		elif t_map["type"]=="PanelPhysicalSimple":
			lines.extend(generate_physical_simple_map(t_map))


	fw = open(args.output_js, "w")
	cx = generate_other_functions()
	fw.write(cx + "\n")

	aL = generate_annot_set(ann)
	for l in aL:
		fw.write(l + "\n")

	for l in lines:	
		fw.write(l + "\n")
			
	interactions = []
	syncs = []
	for k in config.keys():
		if k.startswith("interact_"):
			interactions.append(config[k])
		if k.startswith("sync_"):
			syncs.append(config[k])

	i_1 = generate_interaction(interactions, config)
	s_1 = generate_sync(syncs, config)
	cc = generate_enable_lasso(config)
	
	for i in i_1:
		fw.write(i + "\n")
	for s in s_1:
		fw.write(s + "\n")
		
	for c in cc:
		fw.write(c + "\n")
	fw.close()

	fw = open(args.output_html, "w")
	if num_panel==6:
		cx = read_html_template.read_template_6(args.output_js, args.output_css, config)
	elif num_panel==4:
		cx = read_html_template.read_template_4(args.output_js, args.output_css, config)
	elif num_panel==2 and config["orientation"]=="horizontal":
		cx = read_html_template.read_template_2_horizontal(args.output_js, args.output_css, config)
	elif num_panel==2 and config["orientation"]=="vertical":
		cx = read_html_template.read_template_2_vertical(args.output_js, args.output_css, config)

	fw.write("\n".join(cx) + "\n")
	fw.close()

	fw = open(args.output_css, "w")
	if num_panel==6:
		cx = read_css_template.read_css_6(args.output_css, config)
	elif num_panel==4:
		cx = read_css_template.read_css_4(args.output_css, config)
	elif num_panel==2:
		cx = read_css_template.read_css_2(args.output_css, config)
	fw.write("\n".join(cx) + "\n")
	fw.close()
