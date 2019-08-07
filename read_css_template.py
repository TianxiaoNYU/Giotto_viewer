import sys
import os
import re

def read_css_6(cssfile, config):
	ab = """
.btn-group-xs > .btn, .btn-xs {
  padding: .5rem .25rem;
  font-size: .875rem;
  line-height: .5;
  border-radius: .2rem;
}

.btn-group-xxs > .btn, .btn-xxs {
  padding: .5rem .01rem;
  font-size: .875rem;
  line-height: .5;
  border-radius: .2rem;
}
.leaflet-container{
	background:#000000;
}
body {
  margin: 0;
  height: calc(100% - 51px);
}
html, #map1 {
    height: 100%;
}
html, #map2 {
    height: 100%;
}
html, #map3 {
    height: 100%;
}
html, #map4 {
    height: 100%;
}
html, #map5 {
    height: 100%;
}
html, #map6 {
    height: 100%;
}
header.navbar {
    margin-bottom: 0; /* remove bottom margin */ 
}
.ui-autocomplete.ui-front{
    z-index: 1051;
    height: auto;
    font-size:14px;
    max-height: 480px;
    overflow-x: hidden;
}
html, body {
  font-size: 16px;
  /*height: 100%;*/
}
.leaflet-container {
    background-color:white;
}"""

	ab_2 = """
#map1 {
  height: %s;
}
#map2 {
  height: %s;
}
#map3 {
  height: %s;
}
#map4 {
  height: %s;
}
#map5 {
  height: %s;
}
#map6 {
  height: %s;
}
""" % (config["map_1"]["map_height"], config["map_2"]["map_height"], \
config["map_3"]["map_height"], config["map_4"]["map_height"], \
config["map_5"]["map_height"], config["map_6"]["map_height"])

	ab_3 = """
.scrollable-menu {
    height: auto;
    max-height: 500px;
    width: 200px;
    overflow-x: hidden;
}
#cell_type li {
    font-size: 14px;
}
"""
	return [ab, ab_2, ab_3]

def read_css_4(cssfile, config):
	ab = """
.btn-group-xs > .btn, .btn-xs {
  padding: .5rem .25rem;
  font-size: .875rem;
  line-height: .5;
  border-radius: .2rem;
}

.btn-group-xxs > .btn, .btn-xxs {
  padding: .5rem .01rem;
  font-size: .875rem;
  line-height: .5;
  border-radius: .2rem;
}
.leaflet-container{
	background:#000000;
}
body {
  margin: 0;
  height: calc(100% - 51px);
}
html, #map1 {
    height: 100%;
}
html, #map2 {
    height: 100%;
}
html, #map3 {
    height: 100%;
}
html, #map4 {
    height: 100%;
}
header.navbar {
    margin-bottom: 0; /* remove bottom margin */ 
}
.ui-autocomplete.ui-front{
    z-index: 1051;
    height: auto;
    font-size:14px;
    max-height: 480px;
    overflow-x: hidden;
}
html, body {
  font-size: 16px;
  /*height: 100%;*/
}
.leaflet-container {
    background-color:white;
}"""

	ab_2 = """
#map1 {
  height: %s;
}
#map2 {
  height: %s;
}
#map3 {
  height: %s;
}
#map4 {
  height: %s;
}""" % (config["map_1"]["map_height"], config["map_2"]["map_height"], \
config["map_3"]["map_height"], config["map_4"]["map_height"])

	ab_3 = """
.scrollable-menu {
    height: auto;
    max-height: 500px;
    width: 200px;
    overflow-x: hidden;
}
#cell_type li {
    font-size: 14px;
}
"""
	return [ab, ab_2, ab_3]

def read_css_2(cssfile, config):
	ab = """
.btn-group-xs > .btn, .btn-xs {
  padding: .5rem .25rem;
  font-size: .875rem;
  line-height: .5;
  border-radius: .2rem;
}
.btn-group-xxs > .btn, .btn-xxs {
  padding: .5rem .01rem;
  font-size: .875rem;
  line-height: .5;
  border-radius: .2rem;
}
.leaflet-container{
	background:#000000;
}
body {
  margin: 0;
  height: calc(100% - 51px);
}
html, #map1 {
    height: 100%;
}
html, #map2 {
    height: 100%;
}
header.navbar {
    margin-bottom: 0; /* remove bottom margin */ 
}
.ui-autocomplete.ui-front{
    z-index: 1051;
    height: auto;
    font-size:14px;
    max-height: 480px;
    overflow-x: hidden;
}
html, body {
  font-size: 16px;
  /*height: 100%;*/
}
.leaflet-container {
    background-color:white;
}"""

	ab_2 = """
#map1 {
  height: %s;
}
#map2 {
  height: %s;
}
""" % (config["map_1"]["map_height"], config["map_2"]["map_height"])

	ab_3 = """
.scrollable-menu {
    height: auto;
    max-height: 500px;
    width: 200px;
    overflow-x: hidden;
}
#cell_type li {
    font-size: 14px;
}
"""
	return [ab, ab_2, ab_3]
