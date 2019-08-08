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
	getLayersNotInCluster: function(cluster){
		var ret = [];
		for (var i in this._layers){
			if(this._layers[i].options.cluster!=cluster){
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
	getLayersNotIDs: function(ids){
		var ret = [];
		var set_ids = new Set(ids);
		for(var i in this._layers){
			if(!set_ids.has(this._layers[i].options.id)){
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

function AnnotationSet(){
	this.name = [];
	this.set_fname = {};
	this.set_fname2 = {};
	this.cluster_map = {};
	this.annot = {};
	this.busy = false;
	this.is_empty = true;
}
AnnotationSet.prototype.addAnnotation = function(fname, name){
	if(this.is_empty==true || this.busy==false){	
		this.busy = true;
		this.name.push(name);
		this.set_fname[name] = fname;
		var fname2 = fname.substr(0, fname.lastIndexOf(".")) + ".annot";
		this.set_fname2[name] = fname2;
		this.cluster_map[name] = {};
		this.annot[name] = [];
		fetch(fname2)
		.then(response2x => response2x.text())
		.then(function(text3){
			var pp = text3.split("\n");
			var i;
			for(i=0; i<pp.length-1; i++){
				var pp2 = pp[i].split("\t");
				this.cluster_map[name][Number(pp2[0])] = pp2[1];
			}
			fetch(fname)
			.then(response2 => response2.text())
			.then(function(text2){
				var pointlist2 = text2.split("\n");
				var i;
				for(i=0; i<pointlist2.length-1; i++){
					var newplist = pointlist2[i].split(" ");
					var cc = Number(newplist[0]);
					this.annot[name].push(cc);
				}
				this.is_empty = false;
				this.busy = false;
			}.bind(this));
		}.bind(this));
	}else{
		setTimeout(this.addAnnotation.bind(this), 100, fname, name);
	}
}

//======================================================================
function Panel (name, map2, mapid, annot_set){
	this.name = name;
	this.map2 = map2;
	this.id = mapid;
	this.annot_set = annot_set;
	this.selected_annot;
	this.layer = null; //previously called this.tsne_layer
	this.highlight_layer = null; //previously called this.highlightTsne 
	this.layer_loaded = false; //previously called this.tsne_loaded
	this.annot_loaded = false;
	this.interaction_defined = false;
	this.mapArray = null;
	this.type = "Panel";
	this.current_selected_cluster = -1;
	this.colorlist = ["#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059", 
		"#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", 
"#B79762", "#004D43", "#8FB0FF", "#997D87",
		"#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
		"#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
		"#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
		"#372101", "#FFB500", "#C2FFED", "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09",
		"#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
		"#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C",
		"#34362D", "#B4A8BD", "#00A6AA", "#452C2C", "#636375", "#A3C8C9", "#FF913F", "#938A81",
		"#575329", "#00FECF", "#B05B6F", "#8CD0FF", "#3B9700", "#04F757", "#C8A1A1", "#1E6E00",
		"#7900D7", "#A77500", "#6367A9", "#A05837", "#6B002C", "#772600", "#D790FF", "#9B9700",
		"#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329", "#5B4534", "#FDE8DC",
		"#000000", "#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
		"#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
		"#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
		"#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
		"#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F", "#372101"];
	this.style = {"highlight": {"color": "blue", "fillColor":"blue", "fillOpacity": 0.5}, 
	//"unselected_spatial": {"color": "red", "fill":false, "fillOpacity":0.2}, 
	//"selected_spatial": {"color":"red", "fill":true, "fillOpacity":1.0}, 
	"selected": {stroke: true, color:"red", "fillOpacity":1.0}, 
	"unselected": {stroke: false, "fillOpacity":0.5}};
	this.map2.on("zoom", function(){
		var this_zoom = this.map2.getZoom();
		var tmap = {1:1.0, 1.5:1.5, 2:2, 2.5:2.5, 3:3, 3.5:3.5, 4:4, 4.5:4.5, 5:5};
		var this_rad = tmap[this_zoom];	
		this.layer.eachLayer(function(layer){
			layer.setRadius(this_rad);
		});
		console.log(this_zoom + " " + this_rad);
	}.bind(this));
}
Panel.prototype.setAnnotation = function(name){
	if(this.annot_set.busy==false && this.layer_loaded==true){
		if(this.mapArray!=null){
			this.resetSelection(this.mapArray);
		}
		this.annot_loaded = false;
		this.interaction_defined = false;
		this.selected_annot = name;
		var c_list = this.annot_set.annot[name];
		var c_map = this.annot_set.cluster_map[name];
		var all_clust = new Set(c_list);
		var map_cell = {};
		var i;
		for(i=0; i<c_list.length; i++){
			var cell_id = i+1;
			map_cell[cell_id] = c_list[i];
		}
		Object.keys(map_cell).forEach(function (cell_id){
			var this_cell = this.layer.customGetLayer(cell_id.toString());
			var c_id = map_cell[cell_id];
			this_cell.setStyle({"cluster": c_id, fillColor:this.colorlist[c_id], "orig_color": this.colorlist[c_id], 
			"cluster_name": c_map[c_id]});
			//this_cell.setStyle(this.style.unselected);
		}.bind(this));
		$("#map" + this.id + "_cluster").empty();
		for(let t_cluster of all_clust){
			$("#map" + this.id + "_cluster")
			.append($("<li>")
				.append($("<a>")
					.attr("id", "map"+this.id+"_clust_" + t_cluster)
					.attr("href", "#")
					.text("Cluster " + c_map[t_cluster])
				)
			);
		}
		$("#map" + this.id + "_annot_status").empty().append($("<small>").text(name));
		this.annot_loaded = true;
		console.log(map_cell);
	}else{
		setTimeout(this.setAnnotation.bind(this), 100, name);
	}
}
Panel.prototype.loadAnnotationSet = function(){
	if(this.annot_set.busy==false){
		var i;
		for(i=0; i<this.annot_set.name.length; i++){
			var t_name = this.annot_set.name[i];
			$("#map"+this.id + "_annot")
			.append($("<li>").append($("<a>").attr("id", "map"+this.id+"_annot_"+i).attr("href", "#")
			.attr("t_name", t_name).text(t_name)
				.click(function(e){
					var tt = $(e.currentTarget).attr("t_name");
					this.setAnnotation(tt);
					this.addInteraction(this.mapArray);
				}.bind(this)))
			);
		}
	}
	else{
		setTimeout(this.loadAnnotationSet.bind(this), 100);
	}
}
/*
Panel.prototype.readTsne = function(fname){
	if(this.annot_set.busy==false){
		this.layer_loaded = false;
		fetch(fname)
		.then(response2 => response2.text())
		.then(function(text2){
			var point = text2;
			var pointlist2 = point.split("\n");
			i = 0;
			var map_cell = {};
			for(i=0; i<pointlist2.length-1; i++){
				var newplist = pointlist2[i].split(" ");
				x = Number(newplist[1]) * 20;
				y = Number(newplist[2]) * 20;
				var cell_id = i+1;
				map_cell[cell_id] = [x, y];
			}
			var tsne_points = [];
			this.all_clust = [];
			Object.keys(map_cell).forEach(function (cell_id){
				x = map_cell[cell_id][1];
				y = map_cell[cell_id][0];
				var marker = L.circleMarker(this.map2.unproject([x,y], this.map2.getMaxZoom()), {
					radius:5, fillOpacity:0.5, stroke:false, weight:3, "id":cell_id, "type":"circleMarker", 
					"cluster":0, fillColor:this.colorlist[0], "cluster_name": "#",  //=======filler=======
				});
				tsne_points.push(marker);
			}.bind(this));
			this.layer = new L.LayerGroup(tsne_points).addTo(this.map2);
			this.layer_loaded = true;
		}.bind(this));
	}else{
		console.log("Not ready");
		setTimeout(this.readTsne.bind(this), 100, fname);
	}
}*/
Panel.prototype.resetSelection = function(mapArray){
	var t_status = true;
	for(ix=0; ix<mapArray.length; ix++){
		if(mapArray[ix].layer==null){
			t_status = false;
			break;
		}
	}
	if(t_status==true){
		var ret_l = this.layer.getAllLayers();
		for(i=0; i<ret_l.length; i++){
			ret_l[i].setStyle(this.style.unselected);
			delete ret_l[i].options.prev;
		}
		if(this.style.unselected.hasOwnProperty("dim_rest")){
			if(this.style.unselected.dim_rest==true){
				for(i=0; i<ret_l.length; i++){
					ret_l[i].setStyle({"fillColor": "#ededed"});
				}
			}else{
				for(i=0; i<ret_l.length; i++){
					ret_l[i].setStyle({"fillColor": ret_l[i].options.orig_color});
				}
			}
		}
		var cell_ids = [];
		for(i=0; i<ret_l.length; i++){
			mapped_id = ret_l[i].options.id;
			cell_ids.push(mapped_id.toString());	
		}
		for(ix=0; ix<mapArray.length; ix++){
			ret_l = mapArray[ix].layer.getLayersByIDs(cell_ids);
			//ret_l_not = mapArray[ix].layer.getLayersNotIDs(cell_ids);
			for(i=0; i<ret_l.length; i++){
				ret_l[i].setStyle(mapArray[ix].style.unselected); //{stroke:false} if Panel or PanelPhysicalSimple, {weight:1} if PanelPhysical
			}
			if(mapArray[ix].style.unselected.hasOwnProperty("dim_rest")){
				if(mapArray[ix].style.unselected.dim_rest==true){
					for(i=0; i<ret_l.length; i++){
						ret_l[i].setStyle({"fillColor": "#ededed"});
					}
				}else{
					for(i=0; i<ret_l.length; i++){
						ret_l[i].setStyle({"fillColor": ret_l[i].options.orig_color});
					}
				}
			}
			$("#map" + mapArray[ix].id + "_cluster_status").empty().append($("<small>").text("---"));
		}	
		this.current_selected_cluster = -1;
	}else{
		setTimeout(this.resetSelection.bind(this), 100, mapArray);
	}
}
Panel.prototype.addInteraction = function(mapArray){
	if(this.annot_loaded==true){
		this.interaction_defined = false;
		this.mapArray = mapArray; //interacting panes
		var name = this.selected_annot;
		var c_list = this.annot_set.annot[name];
		var c_map = this.annot_set.cluster_map[name];
		var all_clust = new Set(c_list);
		for(let t_cluster of all_clust){
			$("#map" + this.id + "_clust_" + t_cluster).click(function(e){
				console.log("Triggered");
				$("#map" + this.id + "_cluster_status").empty().append($("<small>").text(c_map[t_cluster]));
				this.resetSelection(this.mapArray);
				var ret_l = this.layer.getLayersByCluster(t_cluster);
				var ret_l_not = this.layer.getLayersNotInCluster(t_cluster);
				var cell_ids = [];
				for(i=0; i<ret_l.length; i++){
					mapped_id = ret_l[i].options.id;
					ret_l[i].setStyle(this.style.selected);
					cell_ids.push(mapped_id.toString());
				}
				if(this.style.selected.hasOwnProperty("dim_rest")){
					if(this.style.selected.dim_rest==true){
						for(i=0; i<ret_l_not.length; i++){
							ret_l_not[i].setStyle({"fillColor": "#ededed"});
						}
					}else{
						for(i=0; i<ret_l_not.length; i++){
							ret_l_not[i].setStyle({"fillColor": ret_l[i].options.orig_color});
						}
					}
				}
				for(ix=0; ix<mapArray.length; ix++){
					var ret_l = mapArray[ix].layer.getLayersByIDs(cell_ids);
					var ret_l_not = mapArray[ix].layer.getLayersNotIDs(cell_ids);
					for(i=0; i<ret_l.length; i++){
						ret_l[i].setStyle(mapArray[ix].style.selected);
					}
					if(mapArray[ix].style.selected.hasOwnProperty("dim_rest")){
						if(mapArray[ix].style.selected.dim_rest==true){
							for(i=0; i<ret_l_not.length; i++){
								ret_l_not[i].setStyle({"fillColor": "#ededed"});
							}
						}else{
							for(i=0; i<ret_l_not.length; i++){
								ret_l_not[i].setStyle({"fillColor": ret_l_not[i].options.orig_color});
							}
						}
					}	
				}
				this.current_selected_cluster = t_cluster;
			}.bind(this));
		}
		this.interaction_defined = true;
	}else{
		setTimeout(this.addInteraction.bind(this), 100, mapArray);
	}
}
Panel.prototype.addTooltips = function(mapArray){
	if(this.annot_loaded==true){
		this.layer.eachLayer(function(layer) {
			this.attachTooltip(layer);
			layer.on('mouseover', function(e) {
				this.setHighlight(layer);
				layer.setTooltipContent("Cell ID: " + layer.options.id + " " + "Cluster: " + layer.options.cluster_name);
				mapped_id = layer.options.id;
				for(ix=0; ix<mapArray.length; ix++){
					var this_layer = mapArray[ix].layer.customGetLayer(mapped_id.toString());
					this_layer.setTooltipContent("Cell ID: " + layer.options.id + " " + "Cluster: " + this_layer.options.cluster_name);
					mapArray[ix].setHighlight(this_layer);
					this_layer.openTooltip();
				}
			}.bind(this));
			layer.on('mouseout', function (e) {
				this.unsetHighlight(layer);
				mapped_id = layer.options.id;
				for(ix=0; ix<mapArray.length; ix++){
					var this_layer = mapArray[ix].layer.customGetLayer(mapped_id.toString());
					mapArray[ix].unsetHighlight(this_layer);
					this_layer.closeTooltip();
				}
			}.bind(this));
		}.bind(this));
	}else{
		setTimeout(this.addTooltips.bind(this), 100, mapArray);
	}
}
Panel.prototype.unsetHighlight = function(layer){
	this.highlight_layer = null;
	var t_color = layer.options.cluster;
	//layer.setStyle({"fillColor": layer.options.orig_color});
	//alert(layer.options.prev_fillColor);
	if(layer.options.hasOwnProperty("prev")){
		layer.setStyle({"fillColor": layer.options.prev_fillColor, "color": layer.options.prev_color, 
		"fillOpacity": layer.options.prev_fillOpacity, "stroke": layer.options.prev_stroke, "weight": layer.options.prev_weight});
	}
}
Panel.prototype.setHighlight = function(layer){
	layer.setStyle({"prev": true, "prev_color": layer.options.color, "prev_fillColor": layer.options.fillColor, 
		"prev_fillOpacity": layer.options.fillOpacity, "prev_stroke": layer.options.stroke, "prev_weight": layer.options.weight});
	layer.setStyle(this.style.highlight);
	this.highlight_layer = layer;
}
Panel.prototype.attachTooltip = function(layer){
	this.unsetHighlight(layer);
	layer.bindTooltip("Cell ID: " + layer.options.id + " " + "Cluster: " + layer.options.cluster_name);
}
Panel.prototype.syncMoveend = function(mapArray){
	for(ix=0; ix<mapArray.length; ix++){
		if(mapArray[ix].type==this.type){
			mapArray[ix].map2.sync(this.map2);
		}
	}
}
Panel.prototype.enableLasso = function(){
	if(this.mapArray!=null && this.annot_loaded==true){
		this.lasso = L.lasso(this.map2);
		this.map2.on("lasso.finished", function(event){
			this.resetSelection(this.mapArray);
			var vs = [];
			var vs_not = [];
			for(i=0; i<event.layers.length; i++){
				mapped_id = event.layers[i].options.id;
				vs.push(mapped_id.toString());
			}
			var ret_l = this.layer.getLayersByIDs(vs);
			for(i=0; i<ret_l.length; i++){
				ret_l[i].setStyle(this.style.selected);
				//event.layers[i].setStyle(this.style.selected);
			}
			var ret_l_not = this.layer.getLayersNotIDs(vs);
			if(this.style.selected.hasOwnProperty("dim_rest")){
				if(this.style.selected.dim_rest==true){
					for(i=0; i<ret_l_not.length; i++){
						ret_l_not[i].setStyle({"fillColor": "#ededed"});
					}
				}else{
					for(i=0; i<ret_l_not.length; i++){
						ret_l_not[i].setStyle({"fillColor": ret_l_not[i].options.orig_color});
					}
				}
			}
			/*
			var ret_l = this.layer.getAllLayers();
			var vs_set = new Set(vs);
			for(i=0; i<ret_l.length; i++){
				if(!vs_set.has(ret_l[i].options.id)){
					vs_not.push(ret_l[i].options.id);
				}
			}*/
			for(ix=0; ix<this.mapArray.length; ix++){
				var ret_l = this.mapArray[ix].layer.getLayersByIDs(vs);
				var ret_l_not = this.mapArray[ix].layer.getLayersNotIDs(vs);
				for(i=0; i<ret_l.length; i++){
					ret_l[i].setStyle(this.mapArray[ix].style.selected);
				}
				if(this.mapArray[ix].style.selected.hasOwnProperty("dim_rest")){
					if(this.mapArray[ix].style.selected.dim_rest==true){
						for(i=0; i<ret_l_not.length; i++){
							ret_l_not[i].setStyle({"fillColor": "#ededed"});
						}
					}else{
						for(i=0; i<ret_l_not.length; i++){
							ret_l_not[i].setStyle({"fillColor": ret_l_not[i].options.orig_color});
						}
					}
				}
			}
		}.bind(this));
		this.map2.on("lasso.enabled", function(){
			$("#map" + this.id + "_lassoEnabled small").text("Enabled");
		}.bind(this));
		this.map2.on("lasso.disabled", function(){
			$("#map" + this.id + "_lassoEnabled small").text("Disabled");
		}.bind(this));
		$("#map" + this.id + "_toggleLasso").click(function(){
			if(this.lasso.enabled()){
				this.lasso.disable();
			}else{
				this.lasso.enable();
			}
		}.bind(this));
		$("#map" + this.id + "_deselectLasso").click(function(){
			this.resetSelection(this.mapArray);
		}.bind(this));
		$("#map" + this.id + "_exportLasso").click(function(){
			var ret_l = this.layer.getAllLayers();
			var ret_str = "";
			for(i=0; i<ret_l.length; i++){
				var is_consistent = true;
				Object.keys(this.style.selected).forEach(function (t_key){
					if(ret_l[i].options[t_key]!=this.style.selected[t_key]){
						is_consistent = false;
					}
				}.bind(this));
				if(is_consistent){
					ret_str += ret_l[i].options.id + " ";
				}
			}
			alert(ret_str);
		}.bind(this));
		$("#map" + this.id + "_saveLasso").click(function(){
			var ret_l = this.layer.getAllLayers();
			var ret_str = "";
			for(i=0; i<ret_l.length; i++){
				var is_consistent = true;
				Object.keys(this.style.selected).forEach(function (t_key){
					if(ret_l[i].options[t_key]!=this.style.selected[t_key]){
						is_consistent = false;
					}
				}.bind(this));
				if(is_consistent){
					ret_str += ret_l[i].options.id + " ";
				}
			}
			ret_str+="\n";
			download("selection_1.txt", ret_str);
		}.bind(this));
	}else{
		setTimeout(this.enableLasso.bind(this), 100);
	}
}

//============================================================
//function PanelTsne(name, map2, mapid, annot_set){
function PanelTsne(params){
	var prop = $.extend({name:null, map:null, mapid:null, annot_set:[],
	file_tsne:null, load_tsne:true, default_annot:null, load_annot:true}, params);

	//console.log(prop);
	Panel.call(this, prop.name, prop.map, prop.mapid, prop.annot_set);
	this.type = "PanelTsne";
	this.style = {"highlight": {"color": "blue", "fillColor": "blue", "fillOpacity": 0.5}, 
	//"unselected_spatial": {"color": "red", "fill":false, "fillOpacity":0.2}, 
	//"selected_spatial": {"color":"red", "fill":true, "fillOpacity":1.0}, 
	//"selected": {stroke: true, color:"red", "fillOpacity":0.5}, 
	//"unselected": {stroke:false, "fillOpacity":0.5},
	"selected": {"stroke": false, "dim_rest":true, "fillOpacity":1.0},
	"unselected": {"stroke": false, "dim_rest":false, "fillOpacity":0.4},
	};
	this.map2.off("zoom").on("zoom", function(){
		var this_zoom = this.map2.getZoom();
		var tmap = {1:1.0, 1.5:1.5, 2:2, 2.5:2.5, 3:3, 3.5:3.5, 4:4, 4.5:4.5, 5:5};
		var this_rad = tmap[this_zoom];	
		this.layer.eachLayer(function(layer){
			layer.setRadius(this_rad);
		});
		console.log(this_zoom + " " + this_rad);
	}.bind(this));
	if(prop.load_tsne==true){
		this.readTsne(prop.file_tsne);
	}
	if(prop.load_annot==true){
		this.loadAnnotationSet();
		this.setAnnotation(prop.default_annot);
	}
}

Object.setPrototypeOf(PanelTsne.prototype, Panel.prototype);

PanelTsne.prototype.readTsne = function(fname){
	//if(this.annot_set.busy==false){
		this.layer_loaded = false;
		fetch(fname)
		.then(response2 => response2.text())
		.then(function(text2){
			var point = text2;
			var pointlist2 = point.split("\n");
			i = 0;
			var map_cell = {};
			for(i=0; i<pointlist2.length-1; i++){
				var newplist = pointlist2[i].split(" ");
				//x = Number(newplist[1]) * 20;
				//y = Number(newplist[2]) * 20;
				x = Number(newplist[0]) * 20;
				y = Number(newplist[1]) * 20;
				var cell_id = i+1;
				map_cell[cell_id] = [x, y];
			}
			var tsne_points = [];
			this.all_clust = [];
			Object.keys(map_cell).forEach(function (cell_id){
				x = map_cell[cell_id][1];
				y = map_cell[cell_id][0];
				var marker = L.circleMarker(this.map2.unproject([x,y], this.map2.getMaxZoom()), {
					radius:5, fillOpacity:0.5, stroke:false, weight:3, "id":cell_id, "type":"circleMarker",
					"orig_color": this.colorlist[0], "dim_rest": false, 
					"cluster":0, fillColor:this.colorlist[0], "cluster_name": "#",  //=======filler=======
				});
				tsne_points.push(marker);
			}.bind(this));
			this.layer = new L.LayerGroup(tsne_points).addTo(this.map2);
			this.layer_loaded = true;
		}.bind(this));
	//}else{
	//	console.log("Not ready");
	//	setTimeout(this.readTsne.bind(this), 100, fname);
	//}
}

//=============================================================
function PanelPhysical(params){
//name, tileDirectoryDapi, tileDirectoryNissl, tileDirectoryPolyA, map, mapid, annot_set){
	var prop = $.extend({name:null, dir_dapi:null, dir_nissl:null, dir_polyA:null, 
	map:null, mapid:null, annot_set:[], default_annot:null,
	load_tile:true, default_tile:"nissl", load_gene_map:true, 
	load_segmentation:true, load_annot:true, load_expression:true,
	file_gene_map:"10k.genes/gene.map", 
	file_segmentation_map:"segmentation.to.cell.centroid.map.txt", 
	file_segmentation:"roi.stitched.pos.all.cells.txt",
	dir_gene_expression:"10k.genes", file_gene_list:"gene.list.10k"}, params);

	this.layerDapi = null;
	this.layerNissl = null;
	this.layerPolyA = null;
	this.annot_set = prop.annot_set;
	this.tileDirectoryDapi = prop.dir_dapi;
	this.tileDirectoryNissl = prop.dir_nissl;
	this.tileDirectoryPolyA = prop.dir_polyA;
	this.name = prop.name;
	this.type = "PanelPhysical";
	this.id = prop.mapid;
	this.map = prop.map;
	this.mapMinZoom = 0;
	this.mapMaxZoom = 5;
	this.geneMapFile = prop.file_gene_map;	
	this.segmentationFile = prop.file_segmentation;
	this.segmentationMapFile = prop.file_segmentation_map;
	this.genelistFile = prop.file_gene_list;
	this.geneExprDirectory = prop.dir_gene_expression;
	this.geneMapLoaded = false;
	this.segmentationLoaded = false;
	this.segmentationMapLoaded = false;
	this.annot_loaded = false;
	this.selected_annot = null;
	this.current_selected_cluster = -1;
	this.mapArray = null;
	this.gene_to_file = {};
	this.segmentations = null;
	//this.segmentation_group = null;
	this.layer = null; //previously called this.segmentation_group
	this.highlight = null;
	this.viewMode = "cluster";
	this.lasso = null;
	this.style = {"highlight": {"fillColor": "blue", "fillOpacity": 0.5}, 
	"normal": {"fill":true, "fillOpacity":0.5},
	"unselected_spatial": {"fill":false, "fillOpacity":0.2}, 
	"selected_spatial": {"fill":true, "fillColor": "blue", "fillOpacity":1.0},
	//"selected": {weight:3, color:"red", "fillOpacity":0.5}, 
	//"unselected": {weight:1, "fillOpacity":0.5},
	"selected": {weight:1, color:"red", "dim_rest":true, "fillOpacity":1.0}, 
	"unselected": {weight:1, "dim_rest":false, "fillOpacity":0.4},
	};
	this.colorlist = ["#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059", 
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
		"#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329", "#5B4534", "#FDE8DC",
		"#000000", "#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
		"#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
		"#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
		"#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
		"#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F", "#372101"];
	this.isExpressionStroke = true; //stroke (border) on expression cells in expression mode
	this.isFilledColor = false;
	this.selectedStain;
	this.map_seg_to_cell_expr = null;
	this.map_cell_expr_to_seg = null;

	if(prop.load_tile){
		this.loadTile();
		this.startTile(prop.default_tile);
	}
	if(prop.load_gene_map){
		this.readGeneMap();
	}
	if(prop.load_segmentation){
		r_maps = this.readSegmentationCellCentroidMap();
		this.map_seg_to_cell_expr = r_maps["seg_to_cell_expr"];
		this.map_cell_expr_to_seg = r_maps["cell_expr_to_seg"];
		this.readSegmentation(this.map_seg_to_cell_expr);
	}
	if(prop.load_annot){
		this.loadAnnotationSet();
		this.setAnnotation(prop.default_annot);
	}
	if(prop.load_expression){
		this.readExpression();
	}
}

PanelPhysical.prototype.setAnnotation = function(name){
	if(this.annot_set.busy==false && this.segmentationLoaded==true){
		this.annot_loaded = false;
		this.selected_annot = name;
		var c_list = this.annot_set.annot[name];
		var c_map = this.annot_set.cluster_map[name];
		var all_clust = new Set(c_list);
		var map_cell = {};
		var i;
		if(this.mapArray!=null){
			this.resetSelection(this.mapArray);
		}
		for(i=0; i<c_list.length; i++){
			var cell_id = i+1;
			map_cell[cell_id] = c_list[i];
		}
		Object.keys(map_cell).forEach(function (cell_id){
			var this_cell = this.layer.customGetLayer(cell_id.toString());
			var c_id = map_cell[cell_id];
			this_cell.setStyle({"cluster": c_id, fillColor:this.colorlist[c_id], 
				"orig_color":this.colorlist[c_id], "cluster_name": c_map[c_id], 
				"fill":true, "fillOpacity":0.5
				});
			//this_cell.setStyle(this.style.normal);			
		}.bind(this));
		this.isFilledColor = true;
		$("#map" + this.id + "_cluster").empty();
		for(let t_cluster of all_clust){
			$("#map" + this.id + "_cluster")
			.append($("<li>")
				.append($("<a>")
					.attr("id", "map"+this.id+"_clust_" + t_cluster)
					.attr("href", "#")
					.text("Cluster " + c_map[t_cluster])
				)
			);
		}
		$("#map" + this.id + "_annot_status").empty().append($("<small>").text(name));
		this.annot_loaded = true;
		console.log(map_cell);
	}else{
		setTimeout(this.setAnnotation.bind(this), 100, name);
	}
}
PanelPhysical.prototype.loadAnnotationSet = function(){
	if(this.annot_set.busy==false){
		var i;
		for(i=0; i<this.annot_set.name.length; i++){
			var t_name = this.annot_set.name[i];
			$("#map"+this.id + "_annot")
			.append($("<li>").append($("<a>").attr("id", "map"+this.id+"_annot_"+i).attr("href", "#")
			.attr("t_name", t_name).text(t_name)
				.click(function(e){
					var tt = $(e.currentTarget).attr("t_name");
					this.setAnnotation(tt);
					this.addInteraction(this.mapArray);
				}.bind(this)))
			);
		}
	}
	else{
		setTimeout(this.loadAnnotationSet.bind(this), 100);
	}
}
PanelPhysical.prototype.loadTile = function(){
	this.layerDapi = L.tileLayer(this.tileDirectoryDapi + "/{z}/map_{x}_{y}.png", {
		minZoom: this.mapMinZoom, maxZoom: this.mapMaxZoom, noWrap:true, tms:false});
	this.layerNissl = L.tileLayer(this.tileDirectoryNissl + "/{z}/map_{x}_{y}.png", {
		minZoom: this.mapMinZoom, maxZoom: this.mapMaxZoom, noWrap:true, tms:false});
	this.layerPolyA = L.tileLayer(this.tileDirectoryPolyA + "/{z}/map_{x}_{y}.png", {
		minZoom: this.mapMinZoom, maxZoom: this.mapMaxZoom, noWrap:true, tms:false});
	$("#map"+this.id + "_stain")
	.append($("<li>").append($("<a>").attr("id", "stain_dapi").attr("href", "#").text("DAPI")
		.click(function(e){
			this.selectedStain = "dapi";
			this.map.removeLayer(this.layerNissl);
			this.map.removeLayer(this.layerDapi);
			this.map.removeLayer(this.layerPolyA);
			this.layerDapi.addTo(this.map);
		}.bind(this)))
	)
	.append($("<li>").append($("<a>").attr("id", "stain_nissl").attr("href", "#").text("Nissl")
		.click(function(e){
			this.selectedStain = "nissl";
			this.map.removeLayer(this.layerNissl);
			this.map.removeLayer(this.layerDapi);
			this.map.removeLayer(this.layerPolyA);
			this.layerNissl.addTo(this.map);
		}.bind(this)))
	)
	.append($("<li>").append($("<a>").attr("id", "stain_polyA").attr("href", "#").text("PolyA")
		.click(function(e){
			this.selectedStain = "polyA";
			this.map.removeLayer(this.layerNissl);
			this.map.removeLayer(this.layerDapi);
			this.map.removeLayer(this.layerPolyA);
			this.layerPolyA.addTo(this.map);
		}.bind(this)))
	);
	//this.layerNissl.addTo(this.map);
}
PanelPhysical.prototype.startTile = function(name){
	if(name=="dapi"){
		this.layerDapi.addTo(this.map);
	}else if(name=="nissl"){
		this.layerNissl.addTo(this.map);
	}else if(name=="polyA"){
		this.layerPolyA.addTo(this.map);
	}
	console.log("added");
}
PanelPhysical.prototype.readGeneMap = function(){
	fetch(this.geneMapFile)
	.then(response => response.text())
	.then(function(text){
		lines = text.split("\n");
		for(i=0; i<lines.length-1; i++){
			tt = lines[i].split("\t");
			t1 = tt[0];
			t2 = tt[1];
			this.gene_to_file[t2] = t1;
		}
		this.geneMapLoaded = true;
	}.bind(this));
}
PanelPhysical.prototype.readSegmentationCellCentroidMap = function(){
	var map_seg_to_cell_expr = {};
	var map_cell_expr_to_seg = {};
	this.segmentationMapLoaded = false;
	fetch(this.segmentationMapFile)
	.then(response => response.text())
	.then(function(text){
	    cell_list = text.split("\n");
		for(i=0; i<cell_list.length-1; i++){
			var gg = cell_list[i].split(" ");
			var s1 = parseInt(gg[1]);
			var s2 = parseInt(gg[2]);
			map_seg_to_cell_expr[s1] = s2;
			map_cell_expr_to_seg[s2] = s1;
		}
		this.segmentationMapLoaded = true;
	}.bind(this));
	return {"seg_to_cell_expr": map_seg_to_cell_expr, "cell_expr_to_seg": map_cell_expr_to_seg};
}
PanelPhysical.prototype.readSegmentation = function(map_seg_to_cell_expr){
	if(this.segmentationMapLoaded==true){
		this.segmentationLoaded = false;
		fetch(this.segmentationFile)
		.then(response2 => response2.text())
		.then(function(text2){
			console.log("load segmentations");
			var seg = text2;
			var seglist = seg.split("\n");
			i = 0;
			var map_cell = {};
			for(i=0; i<seglist.length-1; i++){
				var newplist = seglist[i].split(",");
				x = Number(newplist[1]);
				y = Number(newplist[2]);
				cell_id = map_seg_to_cell_expr[Number(newplist[0])];
				a = [x,y];
				if(map_cell.hasOwnProperty(cell_id)){
					map_cell[cell_id].push(a);
				}
				else{
					map_cell[cell_id] = [];
					map_cell[cell_id].push(a);
				}
			}
			this.segmentations = [];
			Object.keys(map_cell).forEach(function (cell_id){
				var latlngs = [];
				for(i=0; i<map_cell[cell_id].length; i++){
					var latlng = this.map.unproject(map_cell[cell_id][i], this.map.getMaxZoom());
					latlngs.push([latlng.lat, latlng.lng]);
				}
				var polygon = L.polygon(latlngs, {color:"red", weight:1, fill:false, "id":cell_id, "type": "polygon", 
					"cluster":0, "cluster_name":"#", "orig_color": "#",  //place holder
				});
				this.segmentations.push(polygon);
			}.bind(this));
			this.layer = new L.LayerGroup(this.segmentations).addTo(this.map);
			this.segmentationLoaded = true;
		}.bind(this));
	}else{
		setTimeout(this.readSegmentation.bind(this), 100, map_seg_to_cell_expr);
	}
}
PanelPhysical.prototype.resetSelection = function(mapArray){
	var t_status = true;
	for(ix=0; ix<mapArray.length; ix++){
		if(mapArray[ix].layer==null){
			t_status = false;
			break;
		}
	}
	if(t_status==true){
		var ret_l = this.layer.getAllLayers();
		for(i=0; i<ret_l.length; i++){
			//ret_l[i].setStyle({weight:1});
			ret_l[i].setStyle(this.style.unselected);
			delete ret_l[i].options.prev;
		}
		if(this.style.unselected.hasOwnProperty("dim_rest")){
			if(this.style.unselected.dim_rest==true){
				for(i=0; i<ret_l.length; i++){
					ret_l[i].setStyle({"fillColor": "#ededed"});
				}
			}else{
				for(i=0; i<ret_l.length; i++){
					ret_l[i].setStyle({"fillColor": ret_l[i].options.orig_color});
				}
			}
		}
		var cell_ids = [];
		for(i=0; i<ret_l.length; i++){
			mapped_id = ret_l[i].options.id;
			cell_ids.push(mapped_id.toString());	
		}
		for(ix=0; ix<mapArray.length; ix++){
			ret_l = mapArray[ix].layer.getLayersByIDs(cell_ids);
			//ret_l_not = mapArray[ix].layer.getLayersNotIDs(cell_ids);
			for(i=0; i<ret_l.length; i++){
				ret_l[i].setStyle(mapArray[ix].style.unselected);
			}
			if(mapArray[ix].style.unselected.hasOwnProperty("dim_rest")){
				if(mapArray[ix].style.unselected.dim_rest==true){
					for(i=0; i<ret_l.length; i++){
						ret_l[i].setStyle({"fillColor": "#ededed"});
					}
				}else{
					for(i=0; i<ret_l.length; i++){
						ret_l[i].setStyle({"fillColor": ret_l[i].options.orig_color});
					}
				}
			}
			$("#map" + mapArray[ix].id + "_cluster_status").empty().append($("<small>").text("---"));
		}	
		this.current_selected_cluster = -1;
	}else{
		setTimeout(this.resetSelection.bind(this), 100, mapArray);
	}
}
PanelPhysical.prototype.addTooltips = function(mapArray){
	if(this.annot_loaded==true && this.segmentationLoaded==true && this.segmentationMapLoaded==true){
		this.layer.eachLayer(function (layer) {
			this.unsetHighlight(layer);
			layer.bindTooltip("Cell ID: " + layer.options.id + " " + "Cluster: " + layer.options.cluster_name);
			layer.on('mouseover', function (e) {
				layer.setTooltipContent("Cell ID: " + layer.options.id + " " + "Cluster: " + layer.options.cluster_name);
				this.setHighlight(layer);
				for(ix=0; ix<mapArray.length; ix++){
					var mapped_id = layer.options.id;
					var this_layer = mapArray[ix].layer.customGetLayer(mapped_id);
					mapArray[ix].setHighlight(this_layer);
					this_layer.setTooltipContent("Cell ID: " + layer.options.id + " " + "Cluster: " + this_layer.options.cluster_name);
					this_layer.openTooltip();
				}
			}.bind(this));
			layer.on('mouseout', function (e) {
				this.unsetHighlight(layer);
				for(ix=0; ix<mapArray.length; ix++){
					var mapped_id = layer.options.id;
					var this_layer = mapArray[ix].layer.customGetLayer(mapped_id);
					mapArray[ix].unsetHighlight(this_layer);
					this_layer.closeTooltip();
				}
			}.bind(this));
		}.bind(this));
	}else{
		setTimeout(this.addTooltips.bind(this), 100, mapArray);
	}
}
PanelPhysical.prototype.addInteraction = function(mapArray){
	if(this.annot_loaded==true && this.segmentationLoaded==true && this.segmentationMapLoaded==true){
		this.mapArray = mapArray; //interacting panes
		var name = this.selected_annot;
		var c_list = this.annot_set.annot[name];
		var c_map = this.annot_set.cluster_map[name];
		var all_clust = new Set(c_list);
		for(let t_cluster of all_clust){
			$("#map" + this.id + "_clust_" + t_cluster).click(function(e){
				console.log("Triggered");
				$("#map" + this.id + "_cluster_status").empty().append($("<small>").text(c_map[t_cluster]));
				this.resetSelection(this.mapArray);
				var ret_l = this.layer.getLayersByCluster(t_cluster);
				var ret_l_not = this.layer.getLayersNotInCluster(t_cluster);
				var cell_ids = [];
				for(i=0; i<ret_l.length; i++){
					mapped_id = ret_l[i].options.id;
					//ret_l[i].setStyle({weight:3});
					ret_l[i].setStyle(this.style.selected);
					cell_ids.push(mapped_id.toString());
				}
				if(this.style.selected.hasOwnProperty("dim_rest")){
					if(this.style.selected.dim_rest==true){
						for(i=0; i<ret_l_not.length; i++){
							ret_l_not[i].setStyle({"fillColor": "#ededed"});
						}
					}else{
						for(i=0; i<ret_l_not.length; i++){
							ret_l_not[i].setStyle({"fillColor": ret_l_not[i].options.orig_color});
						}
					}
				}
				for(ix=0; ix<mapArray.length; ix++){
					var ret_l = mapArray[ix].layer.getLayersByIDs(cell_ids);
					var ret_l_not = mapArray[ix].layer.getLayersNotIDs(cell_ids);
					for(i=0; i<ret_l.length; i++){
						ret_l[i].setStyle(mapArray[ix].style.selected);
					}
					if(mapArray[ix].style.selected.hasOwnProperty("dim_rest")){
						if(mapArray[ix].style.selected.dim_rest==false){
							for(i=0; i<ret_l_not.length; i++){
								ret_l_not[i].setStyle({"fillColor": ret_l_not[i].options.orig_color});
							}
						}else{
							for(i=0; i<ret_l_not.length; i++){
								ret_l_not[i].setStyle({"fillColor": "#ededed"});
							}	
						}
					}	
				}
				this.current_selected_cluster = t_cluster;
			}.bind(this));
		}
	}else{
		setTimeout(this.addInteraction.bind(this), 100, mapArray);
	}
}
PanelPhysical.prototype.readExpression = function(){
	if(this.geneMapLoaded==true){
		fetch(this.genelistFile)
		.then(response => response.text())
		.then(function(text){
			var glist = text.split("\n");
			genes = glist;
			$("#map" + this.id + "_search_box").autocomplete({
				source: glist,
				select: function(event, ui){
					var this_id = ui.item.value;
					var fid = this.gene_to_file[this_id];
					current_gene = this_id;
					fetch(this.geneExprDirectory + "/expr." + fid + ".txt")
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
						for(var i in this.layer._layers) {
							var cid = this.layer._layers[i].options.id;
							var mapped_cid = cid;
							t_expr = Number(current_expr[mapped_cid]);
							if(t_expr>2.0){
								t_expr = 2.0;
							}else if(t_expr<0){
								t_expr = 0;
							}
							var t_r = parseInt(t_expr/0.00784);
							this.viewMode = "expression";
							this.layer._layers[i].setStyle({
							fill: true, stroke:this.isExpressionStroke, 
							fillColor:this.rgbToHex(t_r,0,0), fillOpacity:1.0});
						}
					}.bind(this));
				}.bind(this),
			});
		}.bind(this));
	}else{
		setTimeout(this.readExpression.bind(this), 100);
	}
}
PanelPhysical.prototype.rgbToHex = function(r, g, b){
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
PanelPhysical.prototype.setHighlight = function(layer){
	if(this.viewMode=="cluster"){
		//console.log("AA");
		//console.log(layer.options);
		layer.setStyle({"prev": true, "prev_fill": layer.options.fill, 
			"prev_color": layer.options.color, "prev_fillColor": layer.options.fillColor, 
			"prev_fillOpacity": layer.options.fillOpacity, "prev_stroke": layer.options.stroke, "prev_weight": layer.options.weight});
		layer.setStyle(this.style.selected_spatial);
		//layer.setStyle(this.style.highlight);
		this.highlight = layer;
	}
	if(this.viewMode=="expression"){
		if(this.isExpressionStroke){
			layer.setStyle({fill:true, stroke:true});
		}else{
			layer.setStyle({fill:true, stroke:false});
		}
	}
}
PanelPhysical.prototype.unsetHighlight = function(layer){
	this.highlight = null;
	if(this.viewMode=="cluster"){
		//console.log("AB");
		//console.log(layer.options);
		if(layer.options.hasOwnProperty("prev")){
			layer.setStyle({"fillColor": layer.options.prev_fillColor, "fill": layer.options.prev_fill, 
			"color": layer.options.prev_color, "fillOpacity": layer.options.prev_fillOpacity, 
			"stroke": layer.options.prev_stroke, "weight": layer.options.prev_weight});
		}
		//layer.setStyle(this.style.unselected_spatial);
		/*if(this.isFilledColor){
			layer.setStyle({fill:true, fillColor:layer.options.orig_color, fillOpacity:0.5});
		}else{
			layer.setStyle({fill:false, fillOpacity:0.2});
		}*/
	}
	if(this.viewMode=="expression"){
		if(this.isExpressionStroke){
			layer.setStyle({fill:true, stroke:true, color:"red"});
		}else{
			layer.setStyle({fill:true, stroke:false, color:"red"});
		}
	}
}
PanelPhysical.prototype.syncMoveend = function(mapArray){
	for(ix=0; ix<mapArray.length; ix++){
		if(mapArray[ix].type==this.type){
			mapArray[ix].map.sync(this.map);
		}
	}
}
PanelPhysical.prototype.enableLasso = function(){
	if(this.mapArray!=null && this.annot_loaded==true && this.segmentationLoaded==true && this.segmentationMapLoaded==true){
		this.lasso = L.lasso(this.map);
		this.map.on("lasso.finished", function(event){
			this.resetSelection(this.mapArray);
			var vs = [];
			var vs_not = [];
			for(i=0; i<event.layers.length; i++){
				//event.layers[i].setStyle({weight:3});
				event.layers[i].setStyle(this.style.selected);
				mapped_id = event.layers[i].options.id;
				vs.push(mapped_id.toString());
			}
			/*
			var ret_l = this.layer.getAllLayers();
			var vs_set = new Set(vs);
			for(i=0; i<ret_l.length; i++){
				if(!vs_set.has(ret_l[i].options.id)){
					vs_not.push(ret_l[i].options.id);
				}
			}*/
			var ret_l = this.layer.getLayersByIDs(vs);
			var ret_l_not = this.layer.getLayersNotIDs(vs);
			if(this.style.selected.hasOwnProperty("dim_rest")){
				if(this.style.selected.dim_rest==true){
					for(i=0; i<ret_l_not.length; i++){
						ret_l_not[i].setStyle({"fillColor": "#ededed"});
					}
				}else{
					for(i=0; i<ret_l_not.length; i++){
						ret_l_not[i].setStyle({"fillColor": ret_l_not[i].options.orig_color});
					}
				}
			}
			for(ix=0; ix<this.mapArray.length; ix++){
				var ret_l = this.mapArray[ix].layer.getLayersByIDs(vs);
				var ret_l_not = this.mapArray[ix].layer.getLayersNotIDs(vs);
				for(i=0; i<ret_l.length; i++){
					ret_l[i].setStyle(this.mapArray[ix].style.selected);
				}
				if(this.mapArray[ix].style.selected.hasOwnProperty("dim_rest")){
					if(this.mapArray[ix].style.selected.dim_rest==true){
						for(i=0; i<ret_l_not.length; i++){
							ret_l_not[i].setStyle({"fillColor":"#ededed"});
						}
					}else{
						for(i=0; i<ret_l_not.length; i++){
							ret_l_not[i].setStyle({"fillColor":ret_l_not[i].options.orig_color});
						}
					}
				}
			}
		}.bind(this));
		this.map.on("lasso.enabled", function(){
			$("#map" + this.id + "_lassoEnabled small").text("Enabled");
		}.bind(this));
		this.map.on("lasso.disabled", function(){
			$("#map" + this.id + "_lassoEnabled small").text("Disabled");
		}.bind(this));
		$("#map" + this.id + "_toggleLasso").click(function(){
			if(this.lasso.enabled()){
				this.lasso.disable();
			}else{
				this.lasso.enable();
			}
		}.bind(this));
		$("#map" + this.id + "_deselectLasso").click(function(){
			this.resetSelection(this.mapArray);
		}.bind(this));
		$("#map" + this.id + "_exportLasso").click(function(){
			var ret_l = this.layer.getAllLayers();
			var ret_str = "";
			for(i=0; i<ret_l.length; i++){
				var is_consistent = true;
				Object.keys(this.style.selected).forEach(function (t_key){
					if(ret_l[i].options[t_key]!=this.style.selected[t_key]){
						is_consistent = false;
					}
				}.bind(this));
				if(is_consistent){
					ret_str += ret_l[i].options.id + " ";
				}
			}
			alert(ret_str);
		}.bind(this));
		$("#map" + this.id + "_saveLasso").click(function(){
			var ret_l = this.layer.getAllLayers();
			var ret_str = "";
			for(i=0; i<ret_l.length; i++){
				var is_consistent = true;
				Object.keys(this.style.selected).forEach(function (t_key){
					if(ret_l[i].options[t_key]!=this.style.selected[t_key]){
						is_consistent = false;
					}
				}.bind(this));
				if(is_consistent){
					ret_str += ret_l[i].options.id + " ";
				}
			}
			ret_str+="\n";
			download("selection_1.txt", ret_str);
		}.bind(this));
	}else{
		setTimeout(this.enableLasso.bind(this), 100);
	}
}

//===========================================================================
function PanelPhysicalSimple(params){
	var prop = $.extend({name:null, map:null, mapid:null, annot_set:[],
	file_simple:null, load_simple:true, default_annot:null, load_annot:true}, params);

	Panel.call(this, prop.name, prop.map, prop.mapid, prop.annot_set);
	this.type = "PanelPhysicalSimple";
	this.style = {"highlight": {"color": "blue", "fillOpacity": 0.5}, 
	"unselected_spatial": {"color": "red", "fill":false, "fillOpacity":0.2}, 
	"selected_spatial": {"color":"red", "fill":true, "fillOpacity":1.0}, 
	"selected": {"stroke": false, "dim_rest":true, "fillOpacity":1.0},
	"unselected": {"stroke": false, "dim_rest":false, "fillOpacity":0.4}};
	this.map2.off("zoom").on("zoom", function(){
		var this_zoom = this.map2.getZoom();
		var tmap = {1:1.0, 1.5:1.5, 2:2, 2.5:2.5, 3:3, 3.5:3.5, 4:4, 4.5:4.5, 5:5};
		var this_rad = tmap[this_zoom];	
		this.layer.eachLayer(function(layer){
			layer.setRadius(this_rad);
		});
		console.log(this_zoom + " " + this_rad);
	}.bind(this));
	if(prop.load_simple==true){
		this.readPhysicalSimple(prop.file_simple);
	}
	if(prop.load_annot==true){
		this.loadAnnotationSet();
		this.setAnnotation(prop.default_annot);
	}
}

Object.setPrototypeOf(PanelPhysicalSimple.prototype, Panel.prototype);

PanelPhysicalSimple.prototype.readPhysicalSimple = function(fname){
	//if(this.annot_set.busy==false){
		this.layer_loaded = false;
		fetch(fname)
		.then(response2 => response2.text())
		.then(function(text2){
			var point = text2;
			var pointlist2 = point.split("\n");
			i = 0;
			var map_cell = {};
			for(i=0; i<pointlist2.length-1; i++){
				var newplist = pointlist2[i].split(" ");
				//x = Number(newplist[1]) * 20;
				//y = Number(newplist[2]) * 20;
				x = Number(newplist[0]) * 20;
				y = Number(newplist[1]) * 20;
				var cell_id = i+1;
				map_cell[cell_id] = [x, y];
			}
			var tsne_points = [];
			this.all_clust = [];
			Object.keys(map_cell).forEach(function (cell_id){
				x = map_cell[cell_id][1];
				y = map_cell[cell_id][0];
				var marker = L.circleMarker(this.map2.unproject([x,y], this.map2.getMaxZoom()), {
					radius:5, fillOpacity:0.5, stroke:false, weight:3, "id":cell_id, "type":"circleMarker",
					"orig_color": this.colorlist[0], "dim_rest": false, 
					"cluster":0, fillColor:this.colorlist[0], "cluster_name": "#",  //=======filler=======
				});
				tsne_points.push(marker);
			}.bind(this));
			this.layer = new L.LayerGroup(tsne_points).addTo(this.map2);
			this.layer_loaded = true;
		}.bind(this));
	//}else{
	//	console.log("Not ready");
	//	setTimeout(this.readTsne.bind(this), 100, fname);
	//}
}
