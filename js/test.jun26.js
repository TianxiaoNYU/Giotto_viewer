
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


var a_set = new AnnotationSet();
a_set.addAnnotation("test.cell.type.unsupervised.id.txt", "cell.type.unsup");
a_set.addAnnotation("test.hmrf.oct14.spatial.0.99.top100.b24.0.k9.cluster.txt", "spatial_k9");


var map1 = initializeMap(elementid="map1", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=4096);

var e_panel_1 = new PanelPhysical({name:"physical", dir_dapi:"imapr26.7", dir_nissl:"imapr26.0",
dir_polyA:"imapr26.4", map:map1, mapid:1, annot_set:a_set, default_annot:"cell.type.unsup", 
default_tile:"nissl",
load_tile:true, load_gene_map:true, load_segmentation:true, load_annot:true, 
load_expression:true,
file_gene_map:"10k.genes/gene.map",
file_segmentation_map:"segmentation.to.cell.centroid.map.txt",
file_segmentation:"roi.stitched.pos.all.cells.txt",
dir_gene_expression:"10k.genes", file_gene_list:"gene.list.10k"});


var map2 = initializeMap(elementid="map2", zoomControl=false, zoomSnap=0.5,
zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=500);

var t_panel_2 = new PanelTsne({name:"tsne", map:map2, mapid:2, annot_set:a_set,
file_tsne:"test.cell.type.unsupervised.id.txt", load_tsne:true, default_annot:"cell.type.unsup", load_annot:true});



var map3 = initializeMap(elementid="map3", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=4096);

var e_panel_3 = new PanelPhysical({name:"physical", dir_dapi:"imapr26.7", dir_nissl:"imapr26.0",
dir_polyA:"imapr26.4", map:map3, mapid:3, annot_set:a_set, default_annot:"cell.type.unsup", 
default_tile:"nissl",
load_tile:true, load_gene_map:true, load_segmentation:true, load_annot:true, 
load_expression:true,
file_gene_map:"10k.genes/gene.map",
file_segmentation_map:"segmentation.to.cell.centroid.map.txt",
file_segmentation:"roi.stitched.pos.all.cells.txt",
dir_gene_expression:"10k.genes", file_gene_list:"gene.list.10k"});


var map4 = initializeMap(elementid="map4", zoomControl=false, zoomSnap=0.5,
zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=500);

var t_panel_4 = new PanelTsne({name:"tsne", map:map4, mapid:4, annot_set:a_set,
file_tsne:"test.cell.type.unsupervised.id.txt", load_tsne:true, default_annot:"cell.type.unsup", load_annot:true});

e_panel_1.addInteraction([t_panel_2, e_panel_3, t_panel_4]);
t_panel_2.addInteraction([e_panel_1, e_panel_3, t_panel_4]);
e_panel_3.addInteraction([e_panel_1, t_panel_2, t_panel_4]);
t_panel_4.addInteraction([e_panel_1, t_panel_2, e_panel_3]);
t_panel_2.addTooltips([e_panel_1, e_panel_3, t_panel_4]);
t_panel_4.addTooltips([e_panel_1, t_panel_2, e_panel_3]);
t_panel_2.syncMoveend([t_panel_4]);
t_panel_4.syncMoveend([t_panel_2]);
e_panel_1.syncMoveend([e_panel_3]);
e_panel_3.syncMoveend([e_panel_1]);
t_panel_4.enableLasso();
t_panel_2.enableLasso();
e_panel_3.enableLasso();
e_panel_1.enableLasso();
