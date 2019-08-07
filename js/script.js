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

L.Control.include({
  _refocusOnMap: L.Util.falseFn // Do nothing.
});

var mapExtent = [0.00000000, -4096.00000000, 4096.00000000, 0.00000000];
var mapMinZoom = 0;
var mapMaxZoom = 5;
var mapMaxResolution = 1.00000000;
var mapMinResolution = Math.pow(2, mapMaxZoom) * mapMaxResolution;;
var tileExtent = [0.00000000, -4096.00000000, 4096.00000000, 0.00000000];
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
var genes = [];
var p_circle = [];
var circles = [];
var circles_backup=[];
var g_layers = {};
//var g_layergroups = {};
var g_displayed = new Set([]);
var g_color = {};
var pointlist = [];
var fieldID = 1;

// Load map on HTML5 Canvas for faster rendering
var map = new L.Map('map', {
	preferCanvas: true,
	maxZoom: mapMaxZoom,
	minZoom: mapMinZoom,
	crs: crs
});

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
/*
map.on("zoomend", function(){
	var this_rad = 10.0;
	var this_zoom = map.getZoom();
	if(this_zoom==0){
		this_rad = 2.0;
	}else if(this_zoom==1 || this_zoom==2){
		this_rad = 10.0;
	}else if(this_zoom==3 || this_zoom==4){
		this_rad = 15.0;
	}
	//alert("Here" + " " + this_zoom);
	g_displayed.forEach(function(g_id){
		g_layergroups[g_id].eachLayer(function(layer){
			layer.setRadius(this_rad);
		});
	});
	//circles.eachLayer(function (layer) {
	//	layer.setRadius(this_rad);
	//});
});
*/
layerDapi = L.tileLayer('image_tiles_' + fieldID + '_7/{z}/map_{x}_{y}.png', {
	minZoom: mapMinZoom, maxZoom: mapMaxZoom,
	noWrap: true,
	tms: false
});
layerNissl = L.tileLayer('image_tiles_' + fieldID + '_0/{z}/map_{x}_{y}.png', {
	minZoom: mapMinZoom, maxZoom: mapMaxZoom,
	noWrap: true,
	tms: false
});
layerPolyA = L.tileLayer('image_tiles_' + fieldID + '_4/{z}/map_{x}_{y}.png', {
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
});

fetch("roi/roi.pos" + fieldID + ".large.rotate.all.converted.txt")
.then(response2 => response2.text())
.then(function(text2){
	console.log("load segmentations");
	var seg = text2;
	seglist = seg.split("\n");
	i = 0;
	var map_cell = {};
	//alert(seglist);
	for(i=0; i<seglist.length; i++){
		var newplist = seglist[i].split(",");
		x = Number(newplist[1]);
		y = Number(newplist[2]);
		cell_id = String(newplist[0]);
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
	Object.keys(map_cell).forEach(function (cell_id){
		var latlngs = [];
		//alert(cell_id + " " + map_cell[cell_id].length);
		for(i=0; i<map_cell[cell_id].length; i++){
			var latlng = map.unproject(map_cell[cell_id][i], map.getMaxZoom());
			latlngs.push([latlng.lat, latlng.lng]);
		}
		var polygon = L.polygon(latlngs, {color:"red", weight:1, fill:false}).addTo(map);
		//zoom6layer.addLayer(polygon);
	});
});
      // Load point data for zoom 5,6 markers
      // FILE NAME WILL NEED TO BE EDITED
      // FILE FORMAT SHOULD BE IN FORM: Cell Name, x, y, cluster #
      fetch("Pos" + fieldID + "_all_transcripts_combined_clean.csv")
      .then(response => response.text())
      .then(function(text){
          console.log("load")
          pointlist = text.split("\n");	
			/*
          for (i = 0; i < pointlist.length-1; i++) {
              var newplist = pointlist[i].split(",");
              x = Number(newplist[0]);
              y = Number(newplist[1]);
              gene_id = newplist[4];
              gene_id = String(gene_id);
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
			
				//if(g_layers.hasOwnProperty(gene_id)){
				//	g_layers[gene_id].push(marker);
				//}else{
				//	g_layers[gene_id] = [];
				//	g_layers[gene_id].push(marker);
				//}
			  p_circle.push(marker);
          };
			*/
		//circles = new L.LayerGroup(p_circle).addTo(map);
		/*
		Object.keys(g_layers).forEach(function (gene_id){
			g_layergroups[gene_id] = new L.LayerGroup(g_layers[gene_id]);
			g_layergroups[gene_id].addTo(map);
		});
		*/


		var selected_circles = {};

		fetch("gene.list")
		.then(response => response.text())
		.then(function(text){
			var glist = text.split("\n");
			genes = glist;
			//alert(glist);
			$("#search_box").autocomplete({
				source: glist,
				select: function(event, ui){
					if(g_displayed.size==0){
						map.removeLayer(circles);
						//alert("Cleared");
					}
					
					var this_id = ui.item.value;
					//g_layergroups[this_id].addTo(map);
					if(g_displayed.has(this_id)){
						return ;
					}else{
						if(getcolor(this_id)>=0){
							g_color[this_id] = getcolor(this_id);
							g_displayed.add(this_id);
						}else{
							alert("BAD");
						}

						$("#color_legend tr").append($("<td>")
							.attr("id", "gene_" + this_id)
							.attr("bgcolor", colorlist[g_color[this_id]])
							.text(this_id)
							.append($("<img>")
								.attr("src", "open-iconic-master/svg/circle-x.svg")
								.attr("alt", "circle-x")
								.attr("width", "12")
								.attr("height", "12")
								.click(function(e){
									//alert($(this).parent());
									var sel = $("#color_legend tr td[id='gene_" + this_id + "']");
									sel.remove();
									g_displayed.delete(this_id);
									delete g_color[this_id];
									//$("#color_legend tr").remove(sel);
									map.removeLayer(selected_circles);
									new_circles = draw_markers(pointlist);
									selected_circles = new L.LayerGroup(new_circles).addTo(map);
								})
							)
						);
					}
					//var this_layers = circles.customGetLayers(this_id);
					//for(i=0; i<this_layers.length; i++){
					//	circles.addLayer(
					//}
					map.removeLayer(selected_circles);
					new_circles = draw_markers(pointlist);
					selected_circles = new L.LayerGroup(new_circles).addTo(map);
					//alert(this_layers.length);
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
        doStuff(e);
      });

      function doStuff(e) {
        console.log(e.latlng);
        // Coordinates in tile space
        var x = e.layerPoint.x;
        var y = e.layerPoint.y;
        console.log([x, y]);
        // Calculate point in xy space
        var pointXY = L.point(x, y);
        console.log("Point in x,y space: " + pointXY);
        // Convert to lat/lng space
        var pointlatlng = map.layerPointToLatLng(pointXY);
        // Why doesn't this match e.latlng?
        console.log("Point in lat,lng space: " + pointlatlng);
      };
