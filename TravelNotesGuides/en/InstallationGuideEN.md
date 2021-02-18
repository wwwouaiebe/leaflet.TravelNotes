# Travel & Notes - Installation guide

- [Where to install Travel & Notes?](#WhereInstall)
- [Installation Guide for Nulls](#GuideNull)
- [Installation guide for geeks](#GuideGeeks)
	- [What to do in the HTML file?](#HtmlPage)
	- [Some additional explanations on Javascript](#MoreOnJS)
	- [The contents of the TravelNotesConfig.json file](#TravelNotesConfigJson)
	- [The contents of the TravelNotesLayers.json file](#TravelNotesLayersJson)
	- [The contents of the TravelNotesNoteDialogFR.json and TravelNotesNoteDialogEN.json file](#TravelNotesNoteDialogJson)
	- [The contents of the configuration file that can be loaded with the button 📂 in the notes dialog](#myTravelNotesNoteDialogJson)
	- ["Search OpenStreetMap" settings](#OsmSearch)
- [Using the viewer](#Viewer)
- [Translations](#Translations)
- [Plugins](#Plugins)

<a id="WhereInstall"></a>
## Where to install Travel & Notes?

For security reasons, it is no longer possible to use Travel & Notes from a computer disc. 
It is essential to go through either a remote web server, or a local LAMP or MAMP web server.
See https://www.mozilla.org/en-US/security/advisories/mfsa2019-21/#CVE-2019-11730

<a id="GuideNull"></a>
## Installation Guide for Nulls

No great computer skills? If the demo suits you, you can download it by going to the gh-pages branch.
Still too complicated? follow this 
[link](https://github.com/wwwouaiebe/leaflet.TravelNotes/archive/gh-pages.zip)  directly
which allows you to download the demo.
Open the zip file and install its contents in a directory on your server and open the 
index.html file. That's all :-).

<a id="GuideGeeks"></a>
## Installation guide for geeks

<a id="HtmlPage"></a>
### What to do in the HTML file?

Travel & Notes uses [Leaflet](http://leafletjs.com/) to display the map. You must therefore download 
and install Leaflet.

In the &lt;head&gt; of the html file, load the Leaflet and TravelNotes stylesheet:

```
<head>
	...
	<link rel="stylesheet" href="leaflet/leaflet.css" />
	<link rel="stylesheet" href="TravelNotes.min.css" />
	...
</head>
```

And in the &lt;body&gt; load Leaflet, TravelNotes and TravelNotes plugins 

```
<body>
	...
	<script src="leaflet/leaflet.js"></script>
	<noscript>Oh oh. Javascript is not enabled. It's impossible to display this page without javascript.</noscript>
	<script src="TravelNotes.min.js"></script>
	<!-- 
		Route providers scripts for Mapbox, Stadia Maps (MapzenValhalla), GraphHopper and OpenRouteService have only to be installed 
		if you have an API key for Mapbox, Stadia Maps, GraphHopper or openRouteService.
		Route providers scripts for OSRM, public transport and polyline have only to be installed 
		if you will work with these providers.  -->
	<script src="TravelNotesProviders/MapboxRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/MapzenValhallaRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/GraphHopperRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/OpenRouteServiceRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/OSRMRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/PublicTransportRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/PolylineRouteProvider.min.js"></script>
</body>
```

Travel & Notes will automatically create the map and all necessary controls.

<a id="MoreOnJS"></a>
### Some additional explanations on Javascript

See the [JS code documentation](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TechDoc/index.html )
for more information.

Note, however, that only the TravelNotes object is accessible from additional JS code 
(via window.TaN - window.L.TravelNotes is deprecated but continues to work currently).

If you want to use other objects, you need to download the sources and import them into your code 
as EcmaScript modules.

<a id="TravelNotesConfigJson"></a>
### The contents of the TravelNotesConfig.json file

This file is used to modify certain behavior of TravelNotes. Be careful when editing this file. 
You must follow __all__ the rules for writing json files.

The contents of the TravelNotesConfig.json file:

- __APIKeys.saveToSessionStorage__ : when this value is true, the API keys are saved in the 'sessionStorage' ( default value : true )
- __APIKeysDialog.haveUnsecureButtons__ : when this value is true, buttons to save or restore the API keys in an unsecured file are present ( default value : false )
- __APIKeysDialog.showAPIKeys__ : when this value is true, the API keys are readable in the dialog box ( default value : false )
- __APIKeysDialog.showButton__ : when this value is true, the button 🔑 is present in the toolbar ( default value : true )
- __colorDialog.haveSlider__ : when this value is true, the route properties dialog has a slider for the color red, otherwise it has buttons ( default value : true )
- __colorDialog.initialRed__ : the initial value for the red slider ( default value : 0 )
- __contextMenu.timeout__ : the time that will elapse, in milliseconds, between the moment when the mouse is no longer on the contextual menu and the moment when the menu closes automatically ( default value : 1500 )
- __errorsUI.helpTimeOut__ : the time that will elapse, in milliseconds, between the moment a help message is displayed and the moment it is deleted ( default value : 30000 )
- __errorsUI.showError__ : when this value is true, error messages are displayed ( default value : true )
- __errorsUI.showHelp__ : when this value is true, help messages are displayed ( default value : false )
- __errorsUI.showInfo__ : when this value is true, information messages are displayed ( default value : true )
- __errorsUI.showWarning__ : when this value is true, warning messages are displayed ( default value : true )
- __errorsUI.timeOut__ : the time that will elapse, in milliseconds, between the moment a message is displayed and the moment it is deleted ( default value : 10000 )
- __geoCoder.distances.city__ : the maximum distance in meters between the point given by the user for an address and a point with the place=city tag in OSM, so that this tag is used in the address ( default value : 1200 )
- __geoCoder.distances.hamlet__ : the maximum distance in meters between the point given by the user for an address and a point with the place=hamlet tag in OSM, so that this tag is used in the address ( default value : 200 )
- __geoCoder.distances.town__ : the maximum distance in meters between the point given by the user for an address and a point with the place=town tag in OSM, so that this tag is used in the address ( default value : 1500 )
- __geoCoder.distances.village__ : the maximum distance in meters between the point given by the user for an address and a point with the place=village tag in OSM, so that this tag is used in the address ( default value : 400 )
- __geoCoder.osmCityAdminLevel.DEFAULT__ : the value used in the OSM admin_level tag for a municipality ( default value : 8 )
- __geoCoder.osmCityAdminLevel.GB__ : The value used in the OSM admin_level tag for a municipality in a country that does not follow the OSM default rule. GB must be replaced by the ISO 3166-1 code of the country in question.
- __geoLocation.marker.color__ : the color of the circle used to indicate the geolocation ( default value : #ff0000 )
- __geoLocation.marker.radius__ : the radius of the circle used to indicate the geolocation ( default value : 10 )
- __geoLocation.options.enableHighAccuracy__ : see the Javascript options of the geolocation functions  ( default value : false )
- __geoLocation.options.maximumAge__ : see the Javascript options of the geolocation functions  ( default value : 0 )
- __geoLocation.options.timeout__ : see the Javascript options of the geolocation functions  ( default value : 3600000 )
- __geoLocation.zoomFactor__ : the zoom factor used for geolocation ( default value : 17 )
- __geoLocation.zoomToPosition__ : when this value is true, a zoom on the position will be performed during the first geolocation ( default value : true )
- __itineraryPaneUI.showManeuvers__ : when this value is true, the maneuvers are visible in the route description ( default value : false )
- __itineraryPaneUI.showNotes__ : when this value is true, the notes are visible in the route description ( default value : true )
- __itineraryPoint.marker.color__ : the color of the circle used to indicate a point on the route on the map ( default value : #ff0000 )
- __itineraryPoint.marker.fill__ : the filling of the circle used to indicate a point on the route on the map ( default value : false )
- __itineraryPoint.marker.radius__ : the radius of the circle used to indicate a point on the route on the map ( default value : 7 )
- __itineraryPoint.marker.weight__ : the thickness of the circle used to indicate a point on the route on the map ( default value : 2 )
- __itineraryPoint.zoomFactor__ : the zoom factor used when zooming on a point on the route ( default value : 17 )
- __layersToolbarUI.haveLayersToolbarUI__ : when this value is true, the basemap toolbar is present ( default value : true )
- __layersToolbarUI.toolbarTimeOut__ : the time that will elapse, in milliseconds, between the moment when the mouse is no longer on the toolbar and the moment when this toolbar closes automatically ( default value : 1500 )
- __layersToolbarUI.theDevil.addButton__ : when this value is true, a button "theDevil" is added to the toolbar ( default value : true )
- __map.center.lat__ : the latitude used for the center of the map at startup ( default value : 50.50923 )
- __map.center.lng__ : the longitude used for the center of the map at startup ( default value : 5.49542 )
- __map.zoom__ : the zoom used for the map at startup ( default value : 12 )
- __mouseUI.haveMouseUI__ : when this value is true, a control is displayed at the top of the screen, indicating the coordinates of the mouse, the zoom value as well as the status of the save ( default value : true )
- __nominatim.url__ : the url to use for Nominatim ( default value : "https://nominatim.openstreetmap.org/" )
- __nominatim.language__ : the language to use for Nominatim ( default value : * )
- __note.grip.size__ : the size of the handle at the end of a note's line ( default value : 10 )
- __note.grip.opacity__ : the opacity of the handle at the end of a note's extension line - reminder : 0 = invisible ( default value : 0 )
- __note.grip.moveOpacity__ : opacity of the handle at the end of a note's extension line when the mouse is over the handle ( default value : 1 )
- __note.haveBackground__ : when this value is true, a white background is displayed with the note ( default value : false )
- __note.maxManeuversNotes__ : the maximum number of notes that can be created with the command "Create a note for each route maneuver" ( default value : 100 )
- __note.polyline.color__ : the color of a note's extension line ( default value : #808080 )
- __note.polyline.weight__ : the thickness of a note's extension line ( default value : 1 )
- __note.reverseGeocoding__ : when this value is true, the coordinates of the notes are replaced by an address ( default value : true )
- __note.svgIcon.angleDistance__ : the minimum distance to use between the center of the SVG icon and the point in the route used to calculate the rotation of the icon ( default value : 10 )
- __note.svgIcon.angleDirection.right__ : the maximum angle of the direction to follow for the indication "Turn right" in the tooltip of the SVG icons ( default value : 35 )
- __note.svgIcon.angleDirection.slightRight__ : the maximum angle of the direction to follow for the indication "Turn slight right" in the tooltip of the SVG icons ( default value : 80 )
- __note.svgIcon.angleDirection.continue__ : the maximum angle of the direction to follow for the indication "Continue" in the tooltip of the SVG icons ( default value : 100 )
- __note.svgIcon.angleDirection.slightLeft__ : the maximum angle of the direction to follow for the indication "Turn slight left" in the tooltip of the SVG icons ( default value : 145 )
- __note.svgIcon.angleDirection.left__ : the maximum angle of the direction to follow for the indication "Turn left" in the tooltip of the SVG icons ( default value : 200 )
- __note.svgIcon.angleDirection.sharpLeft__ : the maximum angle of the direction to follow for the indication "Turn sharp left" in the tooltip of the SVG icons ( default value : 270 )
- __note.svgIcon.angleDirection.sharpRight__ : the maximum angle of the direction to follow for the indication "Turn sharp right" in the tooltip of the SVG icons ( default value : 340 )
- __note.svgIcon.rcnRefDistance__ : the greatest acceptable distance between the note and the OSM node with an rcn_ref key ( default value : 20 )
- __note.svgIcon.roadbookFactor__ : the magnification factor of SVG icons in the roadbook ( default value : 6 )
- __note.svgIcon.zoom__ : the zoom value used to make the SVG icons ( default value : 17 )
- __noteDialog.areaHeight.icon__ : the number of lines in the icon edit area ( default value : 2 )
- __noteDialog.areaHeight.popupContent__ : the number of lines in the text edit area ( default value : 8 )
- __noteDialog.mask.iconsDimension__ : when this value is true, the icon dimension controls are hidden ( default value : true )
- __noteDialog.mask.iconTextArea__ :  when this value is true, the icon edit box is hidden ( default value : false )
- __noteDialog.mask.tooltip__ : when this value is true, the tooltip edit box is hidden ( default value : false )
- __noteDialog.mask.popupContent__ : when this value is true, the text edit box is hidden ( default value : false )
- __noteDialog.mask.address__ : when this value is true, the address edit box is hidden ( default value : false )
- __noteDialog.mask.link__ : when this value is true, the link edit box is hidden ( default value : false )
- __noteDialog.mask.phone__ : when this value is true, the phone edit box is hidden ( default value : true )
- __noteDialog.theDevil.addButton__ : when this value is true, a button "theDevil" is added to the edit dialog ( default value : true )
- __noteDialog.theDevil.zoomFactor__ : the zoom used for the "theDevil" button ( default value : 17 )
- __osmSearch.nextSearchLimit.color__ : the color of the polyline used to indicate on the map the area of the next search ( default value : "#ff0000" )
- __osmSearch.nextSearchLimit.fill__ : the filling of the polyline used to indicate on the map the area of the next search ( default value : false )
- __osmSearch.nextSearchLimit.weight__ : the thickness of the polyline used to indicate on the map the area of the next search ( default value : 1 )
- __osmSearch.previousSearchLimit.color__ : the color of the polyline used to indicate on the map the area of the last search performed ( default value : "#006400" )
- __osmSearch.previousSearchLimit.fill__ : the filling of the polyline used to indicate on the map the area of the last search performed ( default value : false )
- __osmSearch.previousSearchLimit.weight__ : the thickness of the polyline used to indicate on the map the area of the last search performed ( default value : 1 )
- __osmSearch.searchPointMarker.color__ : the color of the circle used to indicate on the map the position of a search result when this result is in the form of a point ( default value : "#006400" )
- __osmSearch.searchPointMarker.fill__ : the filling of the circle used to indicate on the map the position of a search result when this result is in the form of a point ( default value : false )
- __osmSearch.searchPointMarker.radius__ : the radius of the circle used to indicate on the map the position of a search result when this result is in the form of a point ( default value : 20 )
- __osmSearch.searchPointMarker.weight__ : the thickness of the circle used to indicate on the map the position of a search result when this result is in the form of a point ( default value : 4 )
- __osmSearch.searchPointPolyline.color__ : the color of the polyline used to indicate on the map the position of a search result when that result is in the form of a polyline ( default value : "#006400" )
- __osmSearch.searchPointPolyline.fill__ : the filling of the polyline used to indicate on the map the position of a search result when that result is in the form of a polyline ( default value : false )
- __osmSearch.searchPointPolyline.weight__ : the thickness of the polyline used to indicate on the map the position of a search result when that result is in the form of a polyline ( default value : 4 )
- __osmSearch.showSearchNoteDialog__ : when this value is true, the edit notes dialog box is displayed when a note is created from a search result ( default value : false )
- __overpassApi.timeOut__ : the time that will elapse, in seconds, between the moment when a request to OverpassAPI is launched and when a timeout will be triggered ( default value : 40 )
- __overpassApi.url__ : the url to use for OverpassAPI ( default value : "https://lz4.overpass-api.de/api/interpreter" )
- __printRouteMap.isEnabled__ : when this value is true, the command to print the maps of a route is active ( default value : true )
- __printRouteMap.borderWidth__ : the width in millimeters of the map edge that will be duplicated in each map ( default value : 10 )
- __printRouteMap.maxTiles__ : the maximum number of tiles that can be used to print a route ( default value : 720 )
- __printRouteMap.paperWidth__ : the width of the paper in millimeters ( default value : 287 )
- __printRouteMap.paperHeight__ : the height of the paper in millimeters ( default value : 200 )
- __printRouteMap.pageBreak__ : when this value is true, a page break is inserted after each map ( default value : false )
- __printRouteMap.printNotes__ : when this value is true, the notes icon is also printed ( default value : true ) 
- __printRouteMap.zoomFactor__ : the zoom factor to use for printing ( default value : 15 )
- __printRouteMap.entryPointMarker.color__ : the color of the start of route marker on each map ( default value : "#00ff00" )
- __printRouteMap.entryPointMarker.weight__ : the tickness of the start of route marker on each map ( default value : 4 )
- __printRouteMap.entryPointMarker.radius__ : the radius of the start of route marker on each map ( default value : 10 )
- __printRouteMap.entryPointMarker.fill__ : the filling of the start of route marker on each map ( default value : true )
- __printRouteMap.entryPointMarker.fillOpacity__ : the filling opacity of the start of route marker on each map ( default value : 1 )
- __printRouteMap.exitPointMarker.color__ : the color of the end of route marker on each map ( default value : "#ff0000"
- __printRouteMap.exitPointMarker.weight__ : the tickness of the end of route marker on each map ( default value : 4 )
- __printRouteMap.exitPointMarker.radius__ : the radius of the end of route marker on each map ( default value : 10 )
- __printRouteMap.exitPointMarker.fill__ : the filling of the end of route marker on each map ( default value : true )
- __printRouteMap.exitPointMarker.fillOpacity__ : the filling opacity of the end of route marker on each map ( default value : 1 )
- __route.color__ : the default color of a route ( default value : "#ff0000" )
- __route.dashArray__ : the line type to use by default = a number corresponding to the line type index in the dashChoices array ( default value : 0 )
- __route.dashChoices__ : an array with the different types of lines displayed in the RoutesPropertiesDialog dialog box. 
Text will be displayed in the linetype selector and iDashArray is the linetype template.
Warning: the values in this array are numerical values and will be multiplied by the line thickness (width) and transformed into text before being used to adapt the line type 
( default value : "[ { text : "——————" , iDashArray :  [0] }, { text :  "—————", iDashArray : [ 4, 2 ] }, { text : "—‧—‧—‧—‧—" , iDashArray : [ 4, 2, 0, 2] }, { text : "················", iDashArray : [ 0,2 ] } ]" )
- __route.elev.smooth__ : when this value is true, the profile of the route is smoothed ( default value : true )
- __route.elev.smoothCoefficient__ : a coefficient used to calculate the distance between two points for the smoothing of the elevation ( default value : 0.25 )
- __route.elev.smoothPoints__ : the number of points before and after the current point in the smoothing calculations ( default value : 3 )
- __route.showDragTooltip__ : the number of times the tooltip displayed when adding a waypoint is shown ( -1 = always ; default value : 0 )
- __route.width__ : the default thickness of a route ( default value : 5	)
- __routeEditor.showEditedRouteInRoadbook__ : when this value is true the modifications of the route being edited will be immediately imported into the roadbook ( default value : true )
- __travelEditor.startMinimized__ : when this value is true, Travel & Notes is displayed in reduced form at startup ( default value : true )
- __travelEditor.startupRouteEdition__ : when this value is true, a route is directly edited when loading a new travel ( default value : true )
- __travelEditor.timeout__ : the time that will elapse, in milliseconds, between the moment when the mouse is no longer in Travel & Notes and the moment when it is reduced ( default value : 1500 )
- __travelNotes.autoLoad__ : when this value is true, the map and all the controls are built automatically when the Travel & Notes javascript is loaded( default value : true )
- __travelNotes.haveBeforeUnloadWarning__ : when this value is true, a confirmation message is displayed each time the travel being edited is going to be deleted ( default value : true )
- __travelNotes.language__ : the language used by Travel & Notes, unless another language is specified in the url ( default value : "fr" )
- __travelNotesToolbarUI.contactMail.url__ : the email address used in the contact button ( default value : "https://github.com/wwwouaiebe/leaflet.TravelNotes/issues" )
- __wayPoint.reverseGeocoding__ : when this value is true, the coordinates of the waypoints are replaced by an address ( default value : true )
- __wayPoint.geocodingIncludeName__ : when this value is true, a name is if possible added to the address ( default value : true )

<a id="TravelNotesLayersJson"></a>
### The contents of the TravelNotesLayers.json file

This file contains the definitions of background maps of the "Maps" toolbar
These definitions can be adapted.

A sample file with two different background maps, one with the Ferraris map
of Belgium in 1771, the other with the Thunderforest OpenCycleMap map
```
[
	{
		"service":"wms",
		"url":"http://geoservices.wallonie.be/arcgis/services/CARTES_ANCIENNES/FERRARIS/MapServer/WMSServer",
		"wmsOptions":
		{
			"layers":"0",
			"format":"image/png",
			"transparent":true
		},
		"bounds":[ [ 49.15, 2.56 ], [ 50.95, 6.49 ] ],
		"minZoom":7,
		"name":"Service Public de Wallonie - Ferraris map 1770 - 1776",
		"toolbar":
		{
			"text":"1771",
			"color":"black",
			"backgroundColor":"white"
		},
		"providerName":"SPW",
		"providerKeyNeeded":false,
		"attribution":"| <a href='http://geoportail.wallonie.be/home.html' target='_blank'>Service public de Wallonie (SPW)</a>",
		"getCapabilitiesUrl":"https://geoservices.wallonie.be/arcgis/services/CARTES_ANCIENNES/FERRARIS/MapServer/WMSServer?REQUEST=GetCapabilities&SERVICE=WMS"
	},
	{
		"service":"wmts",
		"url":"https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey={providerKey}",
		"name":"Thunderforest - OpenCycleMap",
		"toolbar":
		{
			"text":"🚴",
			"color":"black",
			"backgroundColor":"white"
		},
		"providerName":"Thunderforest",
		"providerKeyNeeded":true,
		"attribution":"| Tiles courtesy of <a href='http://www.thunderforest.com/' target='_blank' title='Andy Allan'>Andy Allan</a> "
	}
]
```

Some explanations on the content of the file for each background map

- __service__ : the type of service: wms or wmts
- __url__: the url to use to get the map. The values {s}, {x}, {y} and {z} will be replaced by 
Leaflet, the value {providerKey} will be replaced by Travel & Notes by the possible access key 
for service. Never replace {providerKey} directly with your own access key !!!
- __wmsOptions__ : these are the options to pass to Leaflet for a wms service. 
See the Leaflet [TileLayer.WMS](https://leafletjs.com/reference-1.7.1.html#tilelayer-wms) documentation.
At a minimum, "layers", "format" and "transparent" should be present.
- __bounds__ : the lower left and upper right corner of the map.
- __minZoom__ : the smallest possible zoom for this map
- __maxZoom__ : the largest possible zoom for this map
- __name__ : the name of the map. It will be used in the tooltip of the button in the maps toolbar.
- __toolbar.text__ : the text to display in the maps toolbar button 
- __toolbar.color__ : the foreground color of the maps toolbar button
- __toolbar.backgroundColor__ : the background color of the maps toolbar button
- __providerName__ : the name of the service provider. This name will be used to find the access key to the service and must therefore be identical to the name provided in the file or in the API keys dialog box.
- __providerKeyNeeded__ : when this value is true, an access key is required to get the map.
- __attribution__ : the map attributions. For maps based on OpenStreetMap, it is not necessary to add
the attributions of OpenStreetMap because they are always present in Travel & Notes.
- __getCapabilitiesUrl__ : the url of the getCapabilities file when it is known.

<a id="TravelNotesNoteDialogJson"></a>
### The contents of the TravelNotesNoteDialogFR.json and TravelNotesNoteDialogEN.json file

This file contains the definitions of the buttons and list of predefined icons of the note editing box. 
These definitions can be adapted to your needs.

Sample file with 3 buttons and 2 predefined icons:

```
{ "editionButtons" : 
	[
		{
			"title" : "<span class='TravelNotes-Note-WhiteRed' title='Insert a red background'>Red</span>",
			"htmlBefore" : "<span class='TravelNotes-Note-WhiteRed'>",
			"htmlAfter" : "</span>"
		}, 
		{
			"title" : "<span class='TravelNotes-Note-WhiteGreen' title='Insert a green background'>Green</span>",
			"htmlBefore" : "<span class='TravelNotes-Note-WhiteGreen'>",
			"htmlAfter" : "</span>"
		}, 
		{
			"title": "Ø",
			"htmlBefore": "Ø"
		}
	],
	"preDefinedIconsList" :
	[
		{
			"name" : "Bikes allowed",
			"icon" : "<div class='TravelNotes-MapNote TravelNotes-MapNoteCategory-0005'></div>",
			"tooltip" : "Bikes allowed",
			"width" : 40,
			"height" : 40
		},
		{
			"name" : "Bus station",
			"icon" : "<div class='TravelNotes-MapNote TravelNotes-MapNoteCategory-0006'></div>",
			"tooltip" : "Bus station",
			"width" : 40,
			"height" : 40
		}
	]
}
```

Two collections of objects __must__ be present in the file: "editionButtons" for the additional 
buttons and "preDefinedIconsList" for the predefined icons. These collections may be empty
but must be present.

Each object in the "editionButtons" collection has two or three properties;

- __title__ : the text that will appear on the button in the dialog box
- __htmlBefore__ : the text that will be inserted before the selection when the button is clicked
- __htmlAfter__ : the text that will be inserted after the selection when the button is clicked. 
This property is optional.

Each object in the "preDefinedIconsList" collection has five properties:

- __name__ : the name that will be displayed in the drop-down list (text)
- __icon__ : the content of the icon (html)
- __tooltip__ : the content of the tooltip (html)
- __width__ : the width of the icon in pixels
- __height__ : the height of the icon in pixels

<a id="myTravelNotesNoteDialogJson"></a>
### The contents of the configuration file that can be loaded with the button 📂 in the notes dialog

The organization of this file is identical to the files TravelNotesNoteDialogFR.json and TravelNotesNoteDialogEN.json

<a id="OsmSearch"></a>
### "Search OpenstreetMap" settings

The TravelNotesSearchDictionaryFR.csv (in French) or TravelNotesSearchDictionaryEN.csv (in English) file contains all the information needed to configure the search in OpenStreetMap. The file can be edited with LibreOffice or any other program capable of reading CSV files.
The file must be saved with Unicode as the character set and encoded in utf-8. the semicolon must be used as a separator.

The tree structure as it is visible in Travel & Notes:

<img src="OSMSearchTransportEN.PNG" />

And the contents of the file with the same tree structure (cells with a light red background):

<img src = "TravelNotesSearchDictionaryEN.PNG" />

The cells with a light yellow, light green or light blue background represent the tags of the objects to be searched in OpenStreetMap.
- on yellow background, simple cases where a single tag is sufficient to search for the objects. The key and the desired value are indicated in the cell, separated by an = sign.
- on a green background, more complex cases where several keys / values are necessary to select an object. These different keys / values are shown on a single line and must be 
ALL checked to select the object in OpenStreetMap ( logical AND ).
- on a blue background, cases where several keys / values are possible. These different keys / values are indicated on several lines
and a single key / verified value is enough to select the object in OpenStreetMap ( logical OR ).
- when you want to limit the search to a single type of OpenStreetMap element, you must specify it in an additional cell ( element=node or element=way or element=relation ).
- when all the values of a tag are acceptable, the key must be indicated, followed by the equal sign followed by the sign *.

<a id="Viewer"></a>
## Using the viewer

The viewer allows you to view files that have been made with TravelNotes. It does not have 
controls or menus and therefore does not allow modification of a travel. Its interest lies in the fact that it does not use too much JavaScript and that it is lighter than TravelNotes

It installs like Travel & Notes, with two tags &lt;link&gt; and two tags &lt;script&gt;
one for Leaflet and the other for the viewer.

```
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="ROBOTS" content="NOINDEX, NOFOLLOW" />
		<title>Travel & Notes by wwwouaiebe</title>
		<link rel="stylesheet" href="leaflet/leaflet.css" />
		<link rel="stylesheet" href="TravelNotesViewer.min.css" />
	</head>
	<body>
		<script src="leaflet/leaflet.js"></script><noscript>Oh oh. Javascript is not enabled. It's impossible to display this page without javascript.</noscript>
		<script src="TravelNotesViewer.min.js"></script>
	</body>
</html>
```

The TravelNotesViewer.min.css and TravelNotesViewer.min.js files as well as the configuration JSON 
files are in the "viewer" sub-directory

<a id="Translations"></a>
## Translations

Travel & Notes is translated into 'fr' and 'en'. If you want to translate Travel & Notes into 
another language, copy the TravelNotesEN.json file and rename it according to the language used. Then,
edit this file and translate all the lines in the desired language.
To load Travel & Notes in another language, add to the url lng = and the language to use 
(example to use Travel & Notes in english: https://wwwouaiebe.github.io/leaflet.TravelNotes/?lng=en.)

The organization of these files is as close as possible to that of 
[GNU getText](https://en.wikipedia.org/wiki/Gettext)

<a id="Plugins"></a>
## Plugins

To use a plugin, simply load it from the html page using the tag <script>