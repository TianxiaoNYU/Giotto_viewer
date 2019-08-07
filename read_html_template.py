import sys
import re
import os

def read_template_4(jsfile, cssfile, config):
	code = """<!DOCTYPE html>
<html>
  <head>
    <title>Giotto viewer</title>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
	<script src="js/jquery.3.3.1.min.js"></script>
	<script src="js/jquery-ui.min.js"></script>

    <link rel="stylesheet" href="css/leaflet.css">
    <link rel="stylesheet" href="css/L.Control.MousePosition.css">
    <script src="js/leaflet.js" type="text/javascript"></script>
    <script src="js/L.Control.MousePosition.js" type="text/javascript"></script>
    <link rel="stylesheet" href="css/font-awesome.4.7.0.min.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous">
    <link rel="stylesheet" href="css/jquery-ui.min.css" />
	<script src="js/popper.min.js"></script>
	<script src="js/leaflet-lasso-2.js"></script>
	<script src="js/L.Map.Sync.js"></script>
	<script src="js/bootstrap.4.1.0.min.js"></script>
	<link rel="stylesheet" href="css/bootstrap.4.1.0.min.css">
    <link rel="stylesheet" href="%s">
  </head>""" % cssfile

	code_2 = """
  <body>
	<div class="container-fluid">
 	  <div class="row no-gutters">
		<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
          <div class="row no-gutters">
			<div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_1"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map1_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""

	code_2 += """ 
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map1_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map1_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map1_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map1_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map1_search_box"></small>
		      <br>
			  <div><button id="map1_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
			  <button id="map1_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
			  <div id="map1_lassoEnabled"><small>Disabled</small></div>
			  <br>
              <div><button id="map1_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
			  <div><button id="map1_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	
		  </div>
		  <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
    	    <div id="map1"></div>
		  </div>
		</div>
      </div>
        <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
          <div class="row no-gutters">
	       <div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_2"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map2_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2 += """
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map2_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map2_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map2_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map2_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map2_search_box"></small>
		      <br>
		     <div><button id="map2_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
			<button id="map2_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
		     <div id="map2_lassoEnabled"><small>Disabled</small></div>
		     <br>
             <div><button id="map2_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
		     <div><button id="map2_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	      </div>
	      <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
            <div id="map2"></div>
	      </div>
       </div>
      </div>
    </div>
 	<div class="row no-gutters">
		<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
          <div class="row no-gutters">
			<div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_3"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map3_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2+="""
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map3_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map3_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map3_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map3_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map3_search_box"></small>
		      <br>
			  <div><button id="map3_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
				<button id="map3_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
			  <div id="map3_lassoEnabled"><small>Disabled</small></div>
			  <br>
              <div><button id="map3_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
			  <div><button id="map3_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	
		  </div>
		  <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
    	    <div id="map3"></div>
		  </div>
		</div>
      </div>
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
        <div class="row no-gutters">
	      <div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_4"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map4_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2+="""
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map4_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map4_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map4_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map4_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map4_search_box"></small>
		      <br>
		     <div><button id="map4_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
			<button id="map4_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
		     <div id="map4_lassoEnabled"><small>Disabled</small></div>
		     <br>
             <div><button id="map4_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
		     <div><button id="map4_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	      </div>
	      <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
            <div id="map4"></div>
	      </div>
       </div>
     </div>
	<!--	
      <div class="col-xs-8 col-sm-8 col-md-8 col-lg-8">
        <table id="color_legend">
         	<tr>
			</tr> 
        </table>
      </div>
    -->
	</div>

	<div class="row">
    </div>
  </div>
"""
	code_3 = """
	<script src="js/script.stitched.class.js"></script>
	<script src="%s"></script>
  </body>
</html>""" % jsfile
	return [code, code_2, code_3]


def read_template_2_horizontal(jsfile, cssfile, config):
	code = """<!DOCTYPE html>
<html>
  <head>
    <title>Giotto viewer</title>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
	<script src="js/jquery.3.3.1.min.js"></script>
	<script src="js/jquery-ui.min.js"></script>
    <link rel="stylesheet" href="css/leaflet.css">
    <link rel="stylesheet" href="css/L.Control.MousePosition.css">
    <script src="js/leaflet.js" type="text/javascript"></script>
    <script src="js/L.Control.MousePosition.js" type="text/javascript"></script>
    <link rel="stylesheet" href="css/font-awesome.4.7.0.min.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous">
    <link rel="stylesheet" href="css/jquery-ui.min.css" />
	<script src="js/popper.min.js"></script>
	<script src="js/leaflet-lasso-2.js"></script>
	<script src="js/L.Map.Sync.js"></script>
	<script src="js/bootstrap.4.1.0.min.js"></script>
	<link rel="stylesheet" href="css/bootstrap.4.1.0.min.css">
    <link rel="stylesheet" href="%s">
  </head>""" % cssfile

	code_2 = """
  <body>
	<div class="container-fluid">
 	  <div class="row no-gutters">
		<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
          <div class="row no-gutters">
			<div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""
	if config["map_1"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map1_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2+="""
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map1_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map1_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map1_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map1_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map1_search_box"></small>
		      <br>
			  <div><button id="map1_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
			  <button id="map1_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
			  <div id="map1_lassoEnabled"><small>Disabled</small></div>
			  <br>
              <div><button id="map1_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
			  <div><button id="map1_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	
		  </div>
		  <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
    	    <div id="map1"></div>
		  </div>
		</div>
      </div>
        <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
          <div class="row no-gutters">
	       <div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_2"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map2_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2+="""
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map2_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map2_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map2_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map2_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map2_search_box"></small>
		      <br>
		     <div><button id="map2_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
			<button id="map2_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
		     <div id="map2_lassoEnabled"><small>Disabled</small></div>
		     <br>
             <div><button id="map2_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
		     <div><button id="map2_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	      </div>
	      <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
            <div id="map2"></div>
	      </div>
       </div>
      </div>
    </div>

	<div class="row">
    </div>
  </div>
"""
	code_3 = """
	<script src="js/script.stitched.class.js"></script>
	<script src="%s"></script>
  </body>
</html>""" % jsfile
	return [code, code_2, code_3]

def read_template_2_vertical(jsfile, cssfile, config):
	code = """<!DOCTYPE html>
<html>
  <head>
    <title>Giotto viewer</title>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
	<script src="js/jquery.3.3.1.min.js"></script>
	<script src="js/jquery-ui.min.js"></script>
    <link rel="stylesheet" href="css/leaflet.css">
    <link rel="stylesheet" href="css/L.Control.MousePosition.css">
    <script src="js/leaflet.js" type="text/javascript"></script>
    <script src="js/L.Control.MousePosition.js" type="text/javascript"></script>
    <link rel="stylesheet" href="css/font-awesome.4.7.0.min.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous">
    <link rel="stylesheet" href="css/jquery-ui.min.css" />
	<script src="js/popper.min.js"></script>
	<script src="js/leaflet-lasso-2.js"></script>
	<script src="js/L.Map.Sync.js"></script>
	<script src="js/bootstrap.4.1.0.min.js"></script>
	<link rel="stylesheet" href="css/bootstrap.4.1.0.min.css">
    <link rel="stylesheet" href="%s">
  </head>""" % cssfile

	code_2 = """
  <body>
	<div class="container-fluid">
          <div class="row no-gutters">
			<div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_1"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map1_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2+="""
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map1_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map1_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map1_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map1_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map1_search_box"></small>
		      <br>
			  <div><button id="map1_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
			  <button id="map1_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
			  <div id="map1_lassoEnabled"><small>Disabled</small></div>
			  <br>
              <div><button id="map1_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
			  <div><button id="map1_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	
		  </div>
		  <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
    	    <div id="map1"></div>
		  </div>
        </div>
          <div class="row no-gutters">
	       <div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_2"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map2_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2+="""
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map2_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map2_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map2_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map2_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map2_search_box"></small>
		      <br>
		     <div><button id="map2_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
			<button id="map2_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
		     <div id="map2_lassoEnabled"><small>Disabled</small></div>
		     <br>
             <div><button id="map2_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
		     <div><button id="map2_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	      </div>
	      <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
            <div id="map2"></div>
	      </div>
       </div>
      
    </div>

	<div class="row">
    </div>
  </div>
"""
	code_3 = """
	<script src="js/script.stitched.class.js"></script>
	<script src="%s"></script>
  </body>
</html>""" % jsfile
	return [code, code_2, code_3]


def read_template_6(jsfile, cssfile, config):
	code = """<!DOCTYPE html>
<html>
  <head>
    <title>Giotto viewer</title>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
	<script src="js/jquery.3.3.1.min.js"></script>
	<script src="js/jquery-ui.min.js"></script>
    <link rel="stylesheet" href="css/leaflet.css">
    <link rel="stylesheet" href="css/L.Control.MousePosition.css">
    <script src="js/leaflet.js" type="text/javascript"></script>
    <script src="js/L.Control.MousePosition.js" type="text/javascript"></script>
    <link rel="stylesheet" href="css/font-awesome.4.7.0.min.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous">
    <link rel="stylesheet" href="css/jquery-ui.min.css" />
	<script src="js/popper.min.js"></script>
	<script src="js/leaflet-lasso-2.js"></script>
	<script src="js/L.Map.Sync.js"></script>
	<script src="js/bootstrap.4.1.0.min.js"></script>
	<link rel="stylesheet" href="css/bootstrap.4.1.0.min.css">
    <link rel="stylesheet" href="%s">
  </head>""" % cssfile

	code_2 = """
  <body>
	<div class="container-fluid">
 	  <div class="row no-gutters">
		<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
          <div class="row no-gutters">
			<div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_1"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map1_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2+="""
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map1_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map1_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map1_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map1_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map1_search_box"></small>
		      <br>
			  <div><button id="map1_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
			  <button id="map1_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
			  <div id="map1_lassoEnabled"><small>Disabled</small></div>
			  <br>
              <div><button id="map1_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
			  <div><button id="map1_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	
		  </div>
		  <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
    	    <div id="map1"></div>
		  </div>
		</div>
      </div>
      <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
          <div class="row no-gutters">
	       <div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_2"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map2_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2+="""
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map2_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map2_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map2_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map2_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map2_search_box"></small>
		      <br>
		     <div><button id="map2_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
			<button id="map2_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
		     <div id="map2_lassoEnabled"><small>Disabled</small></div>
		     <br>
             <div><button id="map2_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
		     <div><button id="map2_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	      </div>
	      <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
            <div id="map2"></div>
	      </div>
       </div>
      </div>

      <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
          <div class="row no-gutters">
	       <div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_3"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map3_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2+="""
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map3_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map3_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map3_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map3_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map3_search_box"></small>
		      <br>
		     <div><button id="map3_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
			<button id="map3_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
		     <div id="map3_lassoEnabled"><small>Disabled</small></div>
		     <br>
             <div><button id="map3_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
		     <div><button id="map3_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	      </div>
	      <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
            <div id="map3"></div>
	      </div>
       </div>
      </div>
    </div>

 	<div class="row no-gutters">
		<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
          <div class="row no-gutters">
			<div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_4"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map4_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2+="""
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map4_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map4_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map4_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map4_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map4_search_box"></small>
		      <br>
			  <div><button id="map4_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
				<button id="map4_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
			  <div id="map4_lassoEnabled"><small>Disabled</small></div>
			  <br>
              <div><button id="map4_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
			  <div><button id="map4_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	
		  </div>
		  <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
    	    <div id="map4"></div>
		  </div>
		</div>
      </div>


      <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
        <div class="row no-gutters">
	      <div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_5"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map5_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2+="""
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map5_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map5_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map5_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map5_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map5_search_box"></small>
		      <br>
		     <div><button id="map5_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
			<button id="map5_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
		     <div id="map5_lassoEnabled"><small>Disabled</small></div>
		     <br>
             <div><button id="map5_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
		     <div><button id="map5_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	      </div>
	      <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
            <div id="map5"></div>
	      </div>
       </div>
     </div>

      <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
        <div class="row no-gutters">
	      <div class="col-xs-1 col-sm-1 col-md-1 col-lg-1">
"""

	if config["map_6"]["type"]=="PanelPhysical":
		code_2 += """
			  <div class="dropdown">
				<button class="btn btn-success btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Stain
		   	    <span class="caret"></span></button>
		   	    <ul id="map6_stain" class="dropdown-menu scrollable-menu"></ul>
	      	  </div>
"""
	code_2+="""
			  <div class="dropdown">
				<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Annot
				<span class="caret"></span></button>
				<ul id="map6_annot" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map6_annot_status">#</div>
			  <div class="dropdown">
				<button class="btn btn-secondary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Clust
				<span class="caret"></span></button>
				<ul id="map6_cluster" class="dropdown-menu scrollable-menu"></ul>
			  </div>
			  <div id="map6_cluster_status">#</div>
			  <small>Expr:
			  <input class="form-control autocomplete" id="map6_search_box"></small>
		      <br>
		     <div><button id="map6_toggleLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Toggle Lasso">Tog</button>
			<button id="map6_deselectLasso" type="button" class="btn btn-primary btn-xxs" data-toggle="tooltip" data-placement="right" title="Deselect Lasso">Des</button></div>
		     <div id="map6_lassoEnabled"><small>Disabled</small></div>
		     <br>
             <div><button id="map6_exportLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="View Cells">View.C</button></div>
		     <div><button id="map6_saveLasso" type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="right" title="Save Cells">Save.C</button></div>
	      </div>
	      <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11">
            <div id="map6"></div>
	      </div>
       </div>
     </div>

	</div>

	<div class="row">
    </div>
  </div>
"""
	code_3 = """
	<script src="js/script.stitched.class.js"></script>
	<script src="%s"></script>
  </body>
</html>""" % jsfile
	return [code, code_2, code_3]
