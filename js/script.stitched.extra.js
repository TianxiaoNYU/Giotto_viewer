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

/*
L.Circle.include({
	_getLngRadius: function(){
		return this._getLatRadius();
	}
});*/

var a_set = new AnnotationSet();
a_set.addAnnotation("test.cell.type.unsupervised.id.txt", "cell.type.unsup");
a_set.addAnnotation("test.hmrf.oct14.spatial.0.99.top100.b24.0.k9.cluster.txt", "spatial_k9");

//var map2 = initializeMap(elementid="map2", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=500);
var map2 = initializeMap(elementid="map2", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=4096);
//var t_panel = new PanelTsne({name:"tsne", map:map2, mapid:2, annot_set:a_set, 
//file_tsne:"test.cell.type.unsupervised.id.txt", load_tsne:true, default_annot:"cell.type.unsup", load_annot:true});
var t_panel = new PanelPhysicalSimple({name:"physical.dot", map:map2, mapid:2, annot_set:a_set, 
file_simple:"Cell_centroids_stitched_jun14.csv", load_simple:true, default_annot:"cell.type.unsup", load_annot:true});
//t_panel.readTsne("test.cell.type.unsupervised.id.txt");
//t_panel.loadAnnotationSet();
//t_panel.setAnnotation("cell.type.unsup");
//t_panel.readAnnot();
//t_panel.readTsne();

var map = initializeMap(elementid="map", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=4096);
var e_panel = new PanelPhysical({name:"physical", dir_dapi:"imapr26.7", dir_nissl:"imapr26.0", 
dir_polyA:"imapr26.4", map:map, mapid:1, annot_set:a_set, default_annot:"cell.type.unsup", 
load_tile:true, default_tile:"nissl", load_gene_map:true, load_segmentation:true, load_annot:true, load_expression:true, 
file_gene_map:"10k.genes/gene.map",
file_segmentation_map:"segmentation.to.cell.centroid.map.txt",
file_segmentation:"roi.stitched.pos.all.cells.txt", 
dir_gene_expression:"10k.genes", file_gene_list:"gene.list.10k"});
/*
e_panel.loadTile();
e_panel.startTile("nissl");
e_panel.readGeneMap();
r_maps = e_panel.readSegmentationCellCentroidMap();
var map_seg_to_cell_expr = r_maps["seg_to_cell_expr"];
var map_cell_expr_to_seg = r_maps["cell_expr_to_seg"];
e_panel.readSegmentation(map_seg_to_cell_expr);
e_panel.loadAnnotationSet();
e_panel.setAnnotation("cell.type.unsup");
e_panel.readExpression();
*/
//var map4 = initializeMap(elementid="map4", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=500);
var map4 = initializeMap(elementid="map4", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=4096);
//var t2_panel = new PanelTsne({name:"tsne", map:map4, mapid:4, annot_set:a_set, 
//file_tsne:"test.cell.type.unsupervised.id.txt", load_tsne:true, default_annot:"cell.type.unsup", load_annot:true});
var t2_panel = new PanelPhysicalSimple({name:"physical.dot", map:map4, mapid:4, annot_set:a_set, 
file_simple:"Cell_centroids_stitched_jun14.csv", load_simple:true, default_annot:"cell.type.unsup", load_annot:true});
//t2_panel.readAnnot();
//t2_panel.readTsne("test.cell.type.unsupervised.id.txt");
//t2_panel.loadAnnotationSet();
//t2_panel.setAnnotation("cell.type.unsup");

var map3 = initializeMap(elementid="map3", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=4096);

var e2_panel = new PanelPhysical({name:"physical", dir_dapi:"imapr26.7", dir_nissl:"imapr26.0", 
dir_polyA:"imapr26.4", map:map3, mapid:3, annot_set:a_set, default_annot:"cell.type.unsup", default_tile:"nissl",  
load_tile:true, load_gene_map:true, load_segmentation:true, load_annot:true, load_expression:true, 
file_gene_map:"10k.genes/gene.map",
file_segmentation_map:"segmentation.to.cell.centroid.map.txt",
file_segmentation:"roi.stitched.pos.all.cells.txt", 
dir_gene_expression:"10k.genes", file_gene_list:"gene.list.10k"});
/*
var e2_panel = new PanelPhysical("physical", "imapr26.7", "imapr26.0", "imapr26.4", map3, 3, a_set);
e2_panel.loadTile();
e2_panel.startTile("nissl");
e2_panel.readGeneMap();
e2_panel.readSegmentationCellCentroidMap();
e2_panel.readSegmentation(map_seg_to_cell_expr);
e2_panel.loadAnnotationSet();
e2_panel.setAnnotation("cell.type.unsup");
e2_panel.readExpression();
*/

t_panel.addTooltips([e_panel, e2_panel, t2_panel]);
t_panel.addInteraction([e_panel, e2_panel, t2_panel]);
e_panel.addInteraction([t_panel, e2_panel, t2_panel]);

t2_panel.addTooltips([e_panel, e2_panel, t_panel]);
t2_panel.addInteraction([e_panel, e2_panel, t_panel]);
e2_panel.addInteraction([t_panel, t2_panel, e_panel]);

t_panel.syncMoveend([t2_panel]);
t2_panel.syncMoveend([t_panel]);
e_panel.syncMoveend([e2_panel]);
e2_panel.syncMoveend([e_panel]);

e_panel.enableLasso();
e2_panel.enableLasso();
t_panel.enableLasso();
t2_panel.enableLasso();
