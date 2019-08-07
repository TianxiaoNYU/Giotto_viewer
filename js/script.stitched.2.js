function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function rgbToHex(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function getcolor(gene_id){
	var occupied = [];
	for(i=0; i<50; i++){
		occupied.push(0);
	}
	g_displayed.forEach(function(g_id){
		occupied[g_color[g_id]] = 1;
	});
	for(i=0; i<50; i++){
		if(occupied[i]==0){
			return i;
		}
	}
}
function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}
//requires g_displayed, g_color, colorlist
function draw_markers(pointlist){
	var new_circles = [];
	for(i=0; i<pointlist.length-1; i++){
		var newplist = pointlist[i].split(",");
		var gene_id = newplist[4];
		if(g_displayed.has(gene_id)){
			x = Number(newplist[0]);
			y = Number(newplist[1]);
			cellid = String(newplist[3]);
			gene_color = g_color[gene_id];
			var marker = L.circle(map.unproject([x, y], map.getMaxZoom()), {
				radius: 10, color: colorlist[gene_color], fillOpacity: 1.0,
				stroke: false, "gene_id": gene_id,   
			});
			marker_coords_str = "<b>Cell:</b> " + cellid + "<br>" + "<b>Gene:</b> " + gene_id;
			marker.bindTooltip(marker_coords_str).openTooltip();
			new_circles.push(marker);
		}
	}
	return new_circles;
}

function setHighlightTsne(layer){
	layer.setStyle(style.highlight);
	highlightTsne = layer;
}
function unsetHighlightTsne(layer){
	highlightTsne = null;
	var t_color = layer.options.cluster;
	layer.setStyle({color: colorlist[t_color]});
}
function setHighlightSpatial(layer){
	if(viewMode=="cluster"){
		layer.setStyle(style.selected_spatial);
		highlight = layer;
	}
	if(viewMode=="expression"){
		if(isExpressionStroke){
			layer.setStyle({fill:true, stroke:true});
		}else{
			layer.setStyle({fill:true, stroke:false});
		}
	}
	/*
	if(isFilledColor){
		layer.setStyle({fill:true});
	}else{
		layer.setStyle({fill:false});
	}*/
}
function unsetHighlightSpatial(layer){
	highlight = null;
	if(viewMode=="cluster"){
		layer.setStyle(style.unselected_spatial);
		if(isFilledColor){
			layer.setStyle({fill:true, fillOpacity:0.5});
		}else{
			layer.setStyle({fill:false, fillOpacity:0.2});
		}
	}
	if(viewMode=="expression"){
		if(isExpressionStroke){
			layer.setStyle({fill:true, stroke:true, color:"red"});
		}else{
			layer.setStyle({fill:true, stroke:false, color:"red"});
		}
	}
}

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

var highlightTsne, highlight;
var style = {
	"highlight": {
		"color": "blue", "fillOpacity": 0.5
	},
	"unselected_spatial": {
		"color": "red", //stroke color
		//"weight": 1, 
		"fill": false, "fillOpacity":0.2
	},
	"selected_spatial": {
		"color": "red", //stroke color
		//"weight": 1, 
		"fill": true, "fillOpacity":1.0
	}
};


L.Control.include({
  _refocusOnMap: L.Util.falseFn // Do nothing.
});

L.Circle.include({
    _getLngRadius: function () {
        return this._getLatRadius();
    }
});
L.LayerGroup.include({
	customGetLayer: function (id) {
		for (var i in this._layers) {
			if (this._layers[i].options.id == id) {
				return this._layers[i];
			}
		}
	},
	customGetLayers: function (gene_id){
		var ret = [];
		for (var i in this._layers){
			if(this._layers[i].options.gene_id==gene_id){
				ret.push(this._layers[i]);
			}
		}
		return ret;
	},
	getLayersByCluster: function(cluster){
		var ret = [];
		for (var i in this._layers){
			if(this._layers[i].options.cluster==cluster){
				ret.push(this._layers[i]);
			}
		}
		return ret;
	},
	getLayersByIDs: function(ids){
		var ret = [];
		var set_ids = new Set(ids);
		for(var i in this._layers){
			if(set_ids.has(this._layers[i].options.id)){
				ret.push(this._layers[i]);
			}
		}
		return ret;
	},
	getAllLayers: function(){
		var ret = [];
		for(var i in this._layers){
			ret.push(this._layers[i]);
		}
		return ret;
	}
});



var mapExtent = [0.0, -10240.0, 4096.0, 0.0];
var mapMinZoom = 0;
var mapMaxZoom = 5;
var mapMaxResolution = 1.00000000;
var mapMinResolution = Math.pow(2, mapMaxZoom) * mapMaxResolution;;
var tileExtent = [0.0, -10240.0, 4096.0, 0.0];
var crs = L.CRS.Simple;
crs.transformation = new L.Transformation(1, -tileExtent[0], -1, tileExtent[3]);
crs.scale = function(zoom) {
	return Math.pow(2, zoom) / mapMinResolution;
};
crs.zoom = function(scale) {
	return Math.log(scale * mapMinResolution) / Math.LN2;
};
var layerDapi;
var layerNissl;
var layerPolyA;
var selectedStain;
var isFilledColor = false;
var viewMode = "cluster"; //or cluster
var isExpressionStroke = true; //stroke (border) on expression cells in expression mode
var tsne_cell_fill = "cluster"; //or expression or none
var current_gene;
var current_expr = [];

var genes = [];
var p_circle = [];
var circles = [];
var segmentations = [];
var segmentation_group = {};
var circles_backup=[];
var gene_to_file = {};

var g_layers = {};
//var g_layergroups = {};
var g_displayed = new Set([]);
var g_color = {};
var pointlist = [];
var map_seg_to_cell_expr = {};
var map_cell_expr_to_seg = {};

// Load map on HTML5 Canvas for faster rendering
var map = new L.Map('map', {
	preferCanvas: true,
	maxZoom: mapMaxZoom,
	minZoom: mapMinZoom,
	crs: crs
});


/*Tsne map setting */

var crs2 = L.CRS.Simple;
var tileExtent2 = [0.0, -500.0, 500.0, 0.0];
crs2.transformation = new L.Transformation(1, -tileExtent2[0], -1, tileExtent2[3]);
var tsne_maxZoom = 5;
var tsne_minZoom = 0;
var tsne_mapMaxResolution = 1.00000000;
var tsne_mapMinResolution = Math.pow(2, tsne_maxZoom) * tsne_mapMaxResolution;
var current_selected_cluster = -1;
var mapCluster = {};
/*crs2.scale = function(zoom){
	return Math.pow(2, zoom)/tsne_mapMinResolution;
};
crs2.zoom = function(scale){
	return Math.log(scale*tsne_mapMinResolution) / Math.LN2;
};*/
var map2 = new L.map("map2", {
	preferCanvas:true,
	//zoom: 0,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
  //'maxZoom': 2.5,
	maxZoom:tsne_maxZoom,
	minZoom:tsne_minZoom,
	crs:crs2
});
var tsne_layer;
var cluster_map = {};
//var fname="test.astrocyte.id.txt";
//var fname="test.interneuron.id.txt";
//var fname="test.hmrf.oct14.spatial.0.99.top100.b24.0.k9.cluster.txt";
//var fname="test.hmrf.oct14.spatial.0.99.top300.b52.0.k9.cluster.txt";
//var fname="test.cell.type.seqfish.1e-5.id.txt";
var fname="test.cell.type.unsupervised.id.txt";
//fetch("test.tsne.coord.txt")
//fetch("test.iter.cluster.txt")
var fname2 = fname.substr(0, fname.lastIndexOf(".")) + ".annot";
//alert(fname2);	
fetch(fname2)
.then(response2x => response2x.text())
.then(function(text3){
	pp = text3.split("\n");
	for(i=0; i<pp.length-1; i++){
		var pp2 = pp[i].split("\t");
		cluster_map[Number(pp2[0])] = pp2[1];
	}

	fetch(fname)
	.then(response2 => response2.text())
	.then(function(text2){
		console.log("load tsne coordinates");
		var point = text2;
		var pointlist2 = [];
		pointlist2 = point.split("\n");
		i = 0;
		var map_cell = {};
		for(i=0; i<pointlist2.length-1; i++){
			var newplist = pointlist2[i].split(" ");
			x = Number(newplist[1]) * 20;
			y = Number(newplist[2]) * 20;
			cc = Number(newplist[0]);
			cell_id = i+1;
			map_cell[cell_id] = [cc, x, y];
		}
		var tsne_points = [];
		var all_clust = [];
		Object.keys(map_cell).forEach(function (cell_id){
			t_color = map_cell[cell_id][0];
			t_name = cluster_map[t_color];
			//alert(cell_id + " " + t_name);
			x = map_cell[cell_id][2];
			y = map_cell[cell_id][1];
			//console.log(x + " " + y);
			var marker = L.circle(map2.unproject([x, y], map2.getMaxZoom()), {
				radius: 5,
				color: colorlist[t_color],
				fillOpacity: 0.5,
				stroke: false,
				"id": cell_id,  
				"cluster": t_color,
				"cluster_name": t_name,
				"type": "circle", 
			});
			tsne_points.push(marker);
			all_clust.push(t_color);
			//marker.addTo(map2);
			mapCluster[cell_id] = t_color;
		});
		all_clust = new Set(all_clust);
		for(let t_cluster of all_clust){
			$("#cluster_name")
				.append($("<li>")
					.append($("<a>")
						.attr("id", "clust_"+t_cluster)
						.attr("href", "#")
						.text("Cluster " + cluster_map[t_cluster])
						.click(function(e){
							if(current_selected_cluster>0){
								var ret_l = tsne_layer.getLayersByCluster(current_selected_cluster);
								for(i=0; i<ret_l.length; i++){
									ret_l[i].setStyle({stroke: false});
								}
								current_selected_cluster = -1;
								var cell_ids = [];
								for(i=0; i<ret_l.length; i++){
									mapped_id = map_cell_expr_to_seg[ret_l[i].options.id];
									cell_ids.push(mapped_id.toString());	
								}
								var ret_l = segmentation_group.getLayersByIDs(cell_ids);
								for(i=0; i<ret_l.length; i++){
									ret_l[i].setStyle({weight: 1});
								}
							}
							var ret_l = tsne_layer.getLayersByCluster(t_cluster);
							for(i=0; i<ret_l.length; i++){
								ret_l[i].setStyle({stroke: true});
							}
							current_selected_cluster = t_cluster;
							var cell_ids = [];
							for(i=0; i<ret_l.length; i++){
								mapped_id = map_cell_expr_to_seg[ret_l[i].options.id];
								cell_ids.push(mapped_id.toString());	
							}
							var ret_l = segmentation_group.getLayersByIDs(cell_ids);
							for(i=0; i<ret_l.length; i++){
								ret_l[i].setStyle({weight: 3});
							}
						})
					)
				);
		}
		$("#cluster_name").append(
			$("<li>").append($("<a>")
				.attr("id", "clust_deselect")
				.attr("href", "#")
				.text("Deselect")
				.click(function(e){
					if(current_selected_cluster>0){
						var ret_l = tsne_layer.getLayersByCluster(current_selected_cluster);
						for(i=0; i<ret_l.length; i++){
							ret_l[i].setStyle({stroke:false});
						}
						current_selected_cluster = -1;
						var cell_ids = [];
						for(i=0; i<ret_l.length; i++){
							mapped_id = map_cell_expr_to_seg[ret_l[i].options.id];
							cell_ids.push(mapped_id.toString());	
						}
						var ret_l = segmentation_group.getLayersByIDs(cell_ids);
						for(i=0; i<ret_l.length; i++){
							ret_l[i].setStyle({weight: 1});
						}
					}
				})
			)
		);

		tsne_layer = new L.LayerGroup(tsne_points).addTo(map2);
		tsne_layer.eachLayer(function (layer) {
			unsetHighlightTsne(layer);
			layer.bindTooltip("Cell ID: " + layer.options.id + 
				" " + "Cluster: " + layer.options.cluster_name);
			layer.on('mouseover', function (e) {
				setHighlightTsne(layer);
				mapped_id = map_cell_expr_to_seg[layer.options.id];
				var this_layer = segmentation_group.customGetLayer(mapped_id.toString());
				this_layer.setTooltipContent("Cell ID: " + layer.options.id + " " + "Cluster: " + layer.options.cluster_name);
				setHighlightSpatial(this_layer);
				this_layer.openTooltip();
			});
			layer.on('mouseout', function (e) {
				unsetHighlightTsne(layer);
				mapped_id = map_cell_expr_to_seg[layer.options.id];
				var this_layer = segmentation_group.customGetLayer(mapped_id.toString());
				unsetHighlightSpatial(this_layer);
				this_layer.closeTooltip();
			});
		});
	});
});
map2.fitBounds([
	crs2.unproject(L.point(tileExtent2[2], tileExtent2[3])),
	crs2.unproject(L.point(tileExtent2[0], tileExtent2[1]))
]);
L.control.mousePosition().addTo(map2);

const lasso = L.lasso(map2);
map2.on("lasso.finished", (event) => {
	//console.log("Finished" + event.layers);
	var vs = new Set([]);
	var vs_seg = new Set([]);
	for(var i=0; i<event.layers.length; i++){
		event.layers[i].setStyle({fillColor:"red"});
		mapped_id = map_cell_expr_to_seg[event.layers[i].options.id];
		vs_seg.add(mapped_id.toString());
		vs.add(event.layers[i].options.id);
	}
	var ret_l = segmentation_group.getAllLayers();
	for(i=0; i<ret_l.length; i++){
		if(vs_seg.has(ret_l[i].options.id)){
			ret_l[i].setStyle({weight: 3});
		}else{
			ret_l[i].setStyle({weight: 1});
		}
	}
	var all = tsne_layer.getAllLayers();
	for(var i=0; i<all.length; i++){
		if(vs.has(all[i].options.id)){
			continue;
		}
		all[i].setStyle({fillColor:"lightgray"});
	}
});
map2.on("lasso.enabled", () => {
	$("#lassoEnabled").text("Enabled");
});
map2.on("lasso.disabled", () => {
	$("#lassoEnabled").text("Disabled");
});
$("#toggleLasso").click(function(){
	if(lasso.enabled()){
		lasso.disable();
	}else{
		lasso.enable();
	}
});
$("#deselectLasso").click(function(){
	var all = tsne_layer.getAllLayers();
	for(var i=0; i<all.length; i++){
		all[i].setStyle({fillColor:colorlist[all[i].options.cluster]});
	}
	var all = segmentation_group.getAllLayers();
	for(var i=0; i<all.length; i++){
		all[i].setStyle({weight:1});
	}
});
$("#exportLasso").click(function(){
	var ret_l = segmentation_group.getAllLayers();
	var ret_str = "";
	for(i=0; i<ret_l.length; i++){
		if(ret_l[i].options.weight==3){
			ret_str += ret_l[i].options.id + " ";
		}
	}
	alert(ret_str);
});
$("#saveLasso").click(function(){
	var ret_l = segmentation_group.getAllLayers();
	var ret_str = "";
	for(i=0; i<ret_l.length; i++){
		if(ret_l[i].options.weight==3){
			ret_str += ret_l[i].options.id + " ";
		}
	}
	ret_str+="\n";
	download("selection_1.txt", ret_str);
});
$("#saveLassoSpatial").click(function(){
	$("#saveLasso").trigger("click");
});
$("#exportLassoSpatial").click(function(){
	$("#exportLasso").trigger("click");
});

//==========================================================
const lassoSpatial = L.lasso(map);
map.on("lasso.finished", (event) => {
	var vs_seg = new Set([]);
	var vs = new Set([]);
	for(var i=0; i<event.layers.length; i++){
		event.layers[i].setStyle({weight:3});
		vs_seg.add(event.layers[i].options.id);
		mapped_id = map_seg_to_cell_expr[event.layers[i].options.id];
		vs.add(mapped_id.toString());
	}
	var ret_l = segmentation_group.getAllLayers();
	for(i=0; i<ret_l.length; i++){
		if(!vs_seg.has(ret_l[i].options.id)){
			ret_l[i].setStyle({weight:1});
		}
	}
	var ret_l = tsne_layer.getAllLayers();
	for(i=0; i<ret_l.length; i++){
		if(vs.has(ret_l[i].options.id)){
			ret_l[i].setStyle({fillColor: "red"});
		}else{
			ret_l[i].setStyle({fillColor: "lightgray"});
		}
	}
});
map.on("lasso.enabled", () => {
	$("#lassoEnabledSpatial").text("Enabled");
});
map.on("lasso.disabled", () => {
	$("#lassoEnabledSpatial").text("Disabled");
});
$("#toggleLassoSpatial").click(function(){
	if(lassoSpatial.enabled()){
		lassoSpatial.disable();
	}else{
		lassoSpatial.enable();
	}
});
$("#deselectLassoSpatial").click(function(){
	var all = tsne_layer.getAllLayers();
	for(var i=0; i<all.length; i++){
		all[i].setStyle({fillColor:colorlist[all[i].options.cluster]});
	}
	var all = segmentation_group.getAllLayers();
	for(var i=0; i<all.length; i++){
		all[i].setStyle({weight:1});
	}
});
//=================================================================
$("#cluster_annot").click(function(e){
    if(this.checked){
		var ret_l = segmentation_group.getAllLayers();
		for(i=0; i<ret_l.length; i++){
			mapped_id = map_seg_to_cell_expr[ret_l[i].options.id];
			var t_color = colorlist[mapCluster[mapped_id]];
			ret_l[i].setStyle({fillColor:t_color, fill:true, fillOpacity:0.5});
		}
		viewMode = "cluster";
		isFilledColor = true;
    }else{
		var ret_l = segmentation_group.getAllLayers();
		for(i=0; i<ret_l.length; i++){
			mapped_id = map_seg_to_cell_expr[ret_l[i].options.id];
			var t_color = colorlist[mapCluster[mapped_id]];
			ret_l[i].setStyle({fill:false});
		}
		viewMode = "cluster";
		isFilledColor = false;
    }
});

//==========================================================

$("#stain")
.append($("<li>").append($("<a>").attr("id", "stain_dapi").attr("href", "#").text("DAPI")
	.click(function(e){
		selectedStain = "dapi";
		map.removeLayer(layerNissl);
		map.removeLayer(layerDapi);
		map.removeLayer(layerPolyA);
		layerDapi.addTo(map);
	}))
)
.append($("<li>").append($("<a>").attr("id", "stain_nissl").attr("href", "#").text("Nissl")
	.click(function(e){
		selectedStain = "nissl";
		map.removeLayer(layerNissl);
		map.removeLayer(layerDapi);
		map.removeLayer(layerPolyA);
		layerNissl.addTo(map);
	}))
)
.append($("<li>").append($("<a>").attr("id", "stain_polyA").attr("href", "#").text("PolyA")
	.click(function(e){
		selectedStain = "polyA";
		map.removeLayer(layerNissl);
		map.removeLayer(layerDapi);
		map.removeLayer(layerPolyA);
		layerPolyA.addTo(map);
	}))
);

/*
$("#all_genes").click(function(e){
	if(this.checked){
		//alert("Checked");
		p_circle = [];
          for (i = 0; i < pointlist.length-1; i++) {
              var newplist = pointlist[i].split(",");
              x = Number(newplist[0]);
              y = Number(newplist[1]);
              gene_id = String(newplist[4]);
              cellid = String(newplist[3]);
              index = cellid.indexOf("_");
              cell_type = cellid;
              barcode = cellid.substr(index);
              cell_color = colorlist[cellid -1];
              var marker = L.circle(map.unproject([x, y], map.getMaxZoom()), {
              radius: 5,
              color: cell_color,
              fillOpacity: 0.5,
              stroke: false,
			  "gene_id": gene_id,   
           	  });
              marker_coords_str = "<b>Cell:</b> " + cell_type + "<br>" + "<b>Gene:</b> " + gene_id;
              marker.bindTooltip(marker_coords_str).openTooltip();
			  p_circle.push(marker);
          };
		circles = new L.LayerGroup(p_circle).addTo(map);
	}else{
		map.removeLayer(circles);
	}
});
*/

layerDapi = L.tileLayer('imapr26.7/{z}/map_{x}_{y}.png', {
	minZoom: mapMinZoom, maxZoom: mapMaxZoom,
	noWrap: true,
	tms: false
});

layerNissl = L.tileLayer('imapr26.0/{z}/map_{x}_{y}.png', {
	minZoom: mapMinZoom, maxZoom: mapMaxZoom,
	noWrap: true,
	tms: false
});

layerPolyA = L.tileLayer('imapr26.4/{z}/map_{x}_{y}.png', {
	minZoom: mapMinZoom, maxZoom: mapMaxZoom,
	noWrap: true,
	tms: false
});

layerNissl.addTo(map);

// Fit map to max bounds
map.fitBounds([
	crs.unproject(L.point(mapExtent[2], mapExtent[3])),
	crs.unproject(L.point(mapExtent[0], mapExtent[1]))
]);
L.control.mousePosition().addTo(map);

// Set different zoom layers
//var zoom6layer = new L.FeatureGroup();
// Set list of colors
// COLORS WILL NEED TO BE EDITED FOR GRADIENT/MORE GROUPS

var colorlist = [
	"#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
	"#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
	"#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
	"#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
	"#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
	"#372101", "#FFB500", "#C2FFED", "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09",
	"#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
	"#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C",
	"#34362D", "#B4A8BD", "#00A6AA", "#452C2C", "#636375", "#A3C8C9", "#FF913F", "#938A81",
	"#575329", "#00FECF", "#B05B6F", "#8CD0FF", "#3B9700", "#04F757", "#C8A1A1", "#1E6E00",
	"#7900D7", "#A77500", "#6367A9", "#A05837", "#6B002C", "#772600", "#D790FF", "#9B9700",
	"#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329",
	"#5B4534", "#FDE8DC",
	"#000000", "#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
	"#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
	"#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
	"#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
	"#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
	"#372101"
];

/*
var colorlist = [
	"#723C44", "#FF5200", "#FFA400", "#FFB400", "#FFCF00", "#FFDA00", "#FFEA00", "#FFFA00", "#BDFF00",
	"#91FF00", "#7CFF00", "#5BFF00", "#4BFF00", "#00FF2B", "#00FF9B", "#00FFC1", "#00FFD1", "#00FFEC", 
	"#00F6FF", "#00E0FF", "#00D0FF", "#00BAFF", "#009AFF", "#0084FF", "#0053FF", "#003DFF", "#0017FF", 
	"#5A00FF", "#7B00FF", "#9600FF", "#C100FF", "#DC00FF", "#F800FF"
];
*/
//colorlist = shuffle(colorlist);

fetch("10k.genes/gene.map")
.then(response => response.text())
.then(function(text){
	lines = text.split("\n");
	for(i=0; i<lines.length-1; i++){
		tt = lines[i].split("\t");
		t1 = tt[0];
		t2 = tt[1];
		gene_to_file[t2] = t1;
	}
});

fetch("roi.stitched.pos.all.cells.txt")
.then(response2 => response2.text())
.then(function(text2){
	console.log("load segmentations");
	var seg = text2;
	seglist = seg.split("\n");
	i = 0;
	var map_cell = {};
	//alert(seglist);
	for(i=0; i<seglist.length-1; i++){
		var newplist = seglist[i].split(",");
		x = Number(newplist[1]);
		y = Number(newplist[2]);
		cell_id = Number(newplist[0]);
		a = [x,y];
		if(map_cell.hasOwnProperty(cell_id)){
			map_cell[cell_id].push(a);
			//alert(map_cell[cell_id]);
		}
		else{
			map_cell[cell_id] = [];
			map_cell[cell_id].push(a);
		}
		//alert(x + " " + y + " " + cell_id);
	}
	//alert("Here");
	segmentations = [];
	Object.keys(map_cell).forEach(function (cell_id){
		var latlngs = [];
		//alert(cell_id + " " + map_cell[cell_id].length);
		for(i=0; i<map_cell[cell_id].length; i++){
			var latlng = map.unproject(map_cell[cell_id][i], map.getMaxZoom());
			latlngs.push([latlng.lat, latlng.lng]);
		}
		//alert(latlngs);
		var polygon = L.polygon(latlngs, {color:"red", weight:1, fill:false, "id":cell_id, "type": "polygon"});
		//zoom6layer.addLayer(polygon);
		segmentations.push(polygon);
	});
	segmentation_group = new L.LayerGroup(segmentations).addTo(map);
	segmentation_group.eachLayer(function (layer) {
		unsetHighlightSpatial(layer);
		//var t_layer = tsne_layer.customGetLayer(layer.options.id);
		layer.bindTooltip("Cell ID: " + layer.options.id);
		//layer.bindTooltip("Cell ID: " + layer.options.id + 
		//	" " + "Cluster: " + layer.options.cluster);
		layer.on('mouseover', function (e) {
			setHighlightSpatial(layer);
			var this_layer = tsne_layer.customGetLayer(layer.options.id);
			setHighlightTsne(this_layer);
			layer.setTooltipContent("Cell ID: " + layer.options.id + " " + "Cluster: " + this_layer.options.cluster_name);
			this_layer.openTooltip();
		});
		layer.on('mouseout', function (e) {
			unsetHighlightSpatial(layer);
			var this_layer = tsne_layer.customGetLayer(layer.options.id);
			unsetHighlightTsne(this_layer);
			this_layer.closeTooltip();
		});
	});
});

//seg_keys[i], names[j]
fetch("segmentation.to.cell.centroid.map.txt")
.then(response => response.text())
.then(function(text){
	console.log("load")
	//pointlist = text.split("\n");

	cell_list = text.split("\n");
	for(i=0; i<cell_list.length-1; i++){
		var gg = cell_list[i].split(" ");
		var s1 = parseInt(gg[1]);
		var s2 = parseInt(gg[2]);
		map_seg_to_cell_expr[s1] = s2;
		map_cell_expr_to_seg[s2] = s1;
	}	
	
	var selected_circles = {};
	fetch("gene.list.10k")
	.then(response => response.text())
	.then(function(text){
		var glist = text.split("\n");
		genes = glist;
		//alert(glist);
		$("#search_box").autocomplete({
			source: glist,
			select: function(event, ui){
				var this_id = ui.item.value;
				var fid = gene_to_file[this_id];
				current_gene = this_id;

				fetch("10k.genes/expr." + fid + ".txt")
				.then(response2 => response2.text())
				.then(function(text2){
					gexpr = text2.split("\n");
					current_expr = [];
					for(i=0; i<gexpr.length-1; i++){
						if(gexpr[i].startsWith(this_id)){
							current_expr = gexpr[i].split("\t");
							break;
						}
					}
					//alert(expr);
					//var this_layer = segmentation_group.customGetLayer(this_id);
					//this_layer.options.fill = "true";
					for(var i in segmentation_group._layers) {
						var cid = segmentation_group._layers[i].options.id;
						var mapped_cid = map_seg_to_cell_expr[cid];
						t_expr = Number(current_expr[mapped_cid]);
						if(t_expr>2.0){
							t_expr = 2.0;
						}else if(t_expr<0){
							t_expr = 0;
						}
						var t_r = parseInt(t_expr/0.00784);
						//segmentation_group._layers[i].setStyle({fill: true, fillColor:rgbToHex(t_r,0,0), fillOpacity:1.0});
						viewMode = "expression";
						segmentation_group._layers[i].setStyle({fill: true, stroke:isExpressionStroke, fillColor:rgbToHex(t_r,0,0), fillOpacity:1.0});
					}
				});
			},
		});
	});
});
	
console.log("next");
map.zoomIn();
//if (map.getZoom() >= 0) {
//  map.addLayer(zoom6layer);
//}

map.on('click', function() {
	console.log(map.getZoom());
});
// Coordinates debugging
map.on('click', function(e) {
	var map_id = 1;
	doStuff(map_id, e);
});

map2.zoomIn();
map2.on('click', function() {
	console.log(map2.getZoom());
});
map2.on('click', function(e) {
	var map_id = 2;
	doStuff(map_id, e);
});

function doStuff(map_id, e) {
	console.log(e.latlng);
	// Coordinates in tile space
	var x = e.layerPoint.x;
	var y = e.layerPoint.y;
	console.log([x, y]);
	// Calculate point in xy space
	var pointXY = L.point(x, y);
	console.log("Point in x,y space: " + pointXY);
	// Convert to lat/lng space
	var pointlatlng;
	if(map_id==1){
		pointlatlng = map.layerPointToLatLng(pointXY);
	}
	if(map_id==2){
		pointlatlng = map2.layerPointToLatLng(pointXY);
	}
	// Why doesn't this match e.latlng?
	console.log("Point in lat,lng space: " + pointlatlng);
};
