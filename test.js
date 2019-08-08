
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
function initializeMap(elementid="map", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=6, maxBound=4096){
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
a_set.addAnnotation("pleiden_clus_annot_information.txt", "pleiden_clus");
a_set.addAnnotation("HMRF_k6_b.15_annot_information.txt", "HMRF_k6_b.15");

var map1 = initializeMap(elementid="map1", zoomControl=false, zoomSnap=0.5,
zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=500);

var t_panel_1 = new PanelTsne({name:"tsne", map:map1, mapid:1, annot_set:a_set,
file_tsne:"umap_umap_dim_coord.txt", load_tsne:true, default_annot:"HMRF_k6_b.15", load_annot:true});


var map2 = initializeMap(elementid="map2", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=2000);

var t_panel_2 = new PanelPhysicalSimple({name:"physical.dot", map:map2, mapid:2, annot_set:a_set,
file_simple:"test_centroid_locations.txt", load_simple:true, default_annot:"HMRF_k6_b.15", load_annot:true});


var map3 = initializeMap(elementid="map3", zoomControl=false, zoomSnap=0.5,
zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=500);

var t_panel_3 = new PanelTsne({name:"tsne", map:map3, mapid:3, annot_set:a_set,
file_tsne:"umap_umap_dim_coord.txt", load_tsne:true, default_annot:"pleiden_clus", load_annot:true});


var map4 = initializeMap(elementid="map4", zoomControl=false, zoomSnap=0.5, zoomDelta=0.5, minZoom=0, maxZoom=5, maxBound=2000);

var t_panel_4 = new PanelPhysicalSimple({name:"physical.dot", map:map4, mapid:4, annot_set:a_set,
file_simple:"test_centroid_locations.txt", load_simple:true, default_annot:"pleiden_clus", load_annot:true});

t_panel_1.addInteraction([t_panel_2, t_panel_3, t_panel_4]);
t_panel_2.addInteraction([t_panel_1, t_panel_3, t_panel_4]);
t_panel_3.addInteraction([t_panel_1, t_panel_2, t_panel_4]);
t_panel_4.addInteraction([t_panel_1, t_panel_2, t_panel_3]);
t_panel_1.addTooltips([t_panel_2, t_panel_3, t_panel_4]);
t_panel_2.addTooltips([t_panel_1, t_panel_3, t_panel_4]);
t_panel_3.addTooltips([t_panel_1, t_panel_2, t_panel_4]);
t_panel_4.addTooltips([t_panel_1, t_panel_2, t_panel_3]);
t_panel_1.syncMoveend([t_panel_3]);
t_panel_3.syncMoveend([t_panel_1]);
t_panel_2.syncMoveend([t_panel_4]);
t_panel_4.syncMoveend([t_panel_2]);
t_panel_1.enableLasso();
t_panel_2.enableLasso();
t_panel_3.enableLasso();
t_panel_4.enableLasso();
