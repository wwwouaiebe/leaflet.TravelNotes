# Travel & Notes - Installation guide

## Where to install Travel & Notes?

For security reasons, it is no longer possible to use Travel & Notes from a computer disc. 
It is essential to go through either a remote web server, or a local LAMP or MAMP web server.
See https://www.mozilla.org/en-US/security/advisories/mfsa2019-21/#CVE-2019-11730

### Installation Guide for Nulls

No great computer skills? If the demo suits you, you can download it by going to the gh-pages branch.
Still too complicated? follow this 
[link](https://github.com/wwwouaiebe/leaflet.TravelNotes/archive/gh-pages.zip)  directly
which allows you to download the demo.
Open the zip file and install its contents in a directory on your server and open the 
index.html file. That's all :-).

### Installation guide for geeks

#### What to do in the HTML file?

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
	<!-- route providers scripts for Mapbox, GraphHopper and OpenRouteService have only to be installed 
		if you have an API key for Mapbox, GraphHopper or openRouteService -->
	<!-- route providers scripts for OSRM, public transport and polyline have only to be installed 
		if you will work with these providers -->
	<script src="TravelNotesProviders/MapboxRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/GraphHopperRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/OpenRouteServiceRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/OSRMRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/PublicTransportRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/PolylineRouteProvider.min.js"></script>
</body>
```

Travel & Notes will automatically create the map and all necessary controls.

#### Some additional explanations on Javascript

##### L.travelNotes

This object allows you to communicate with TravelNotes from Javascript

##### L.travelNotes methods

__addProvider ( provider )__

This method is only used by plugins

__addMapContextMenu ( leftButton, rightButton )__

This method adds the left and right context menus

Parameters :

- leftButton : when this parameter is true, a pop-up menu is displayed when a left click 
is made on the map
- rightButton : when this parameter is true, a pop-up menu is displayed when a right click 
is made on the map

##### L.travelNotes properties

- __userData__ : a Javascript object containing data not related to TravelNotes and which will 
be saved in the travel file

- __leftContextMenu__ : boolean enabling or disabling left context menu

- __rightContextMenu__ : boolean enabling or disabling right context menu

- __leftUserContextMenu__ : a collection of objects adding commands to the left context menu

- __rightUserContextMenu__ : a collection of objects adding commands to the right context menu

- __maneuver__ : returns a new maneuver object. Only used by plugins

- __itineraryPoint__ : returns a new itineraryPoint object. Only used by plugins

- __baseDialog__ : an objet that can be used to easily create modal dialogs. Only used by plugins

- __version__ (read only) : the current version of TravelNotes

-__map__ : return a reference to the leaflet object map

#### The TravelNotesConfig.json file

This file is used to modify certain behavior of TravelNotes. Be careful when editing this file. 
You must follow __all__ the rules for writing json files.

The contents of the TravelNotesConfig.json file:

- __autoLoad__ : when this value is true, the map and all controls are built automatically when 
Travel & Notes loads
- __map.center.lat__ : the latitude used for the center of the map during automatic loading
- __map.center.lng__ : the longitude used for the center of the map during automatic loading
- __map.zoom__ : the zoom used for the map during automatic loading
- __travelNotesToolbarUI.contactMail__ : the email address used in the contact button
- __layersToolbarUI.haveLayersToolbarUI__ : when this value is true, the background maps toolbar is present.
- __layersToolbarUI.toolbarTimeOut__ : the time that will elapse between the moment when the mouse 
is no longer on the toolbar and the moment when this toolbar closes automatically.
- __layersToolbarUI.theDevil.addButton__ : when this value is true, a "theDevil" button is added 
to the toolbar and the note editing dialog.
- __layersToolbarUI.theDevil.title__ : the tooltip used for the "theDevil" button
- __layersToolbarUI.theDevil.text__ : the text used for the "theDevil" button
- __layersToolbarUI.theDevil.noteZoom__ : the zoom used for the "theDevil" button in the note editing dialog
- __mouseUI.haveMouseUI__ : when this value is true, a control is displayed at the top of the screen, 
indicating the coordinates of the mouse, the zoom value and the name of the open file
- __errorUI.timeOut__ : the time that will elapse between the time an error message is displayed and the time 
it is cleared
- __errorUI.helpTimeOut__ : the time that will elapse between the time a help message is displayed and the time
 it is cleared
- __errorUI.showError__ : when this value is true, error messages are displayed
- __errorUI.showWarning__ : when this value is true, warning messages are displayed
- __errorUI.showInfo__ : when this value is true, information messages are displayed
- __errorUI.showHelp__ : when this value is true, help messages are displayed
- __geoLocation.color__ : the color of the circle used to indicate the geolocation
- __geoLocation.radius__ : the radius of the circle used to indicate the geolocation
- __geoLocation.zoomToPosition__ : when this value is true, Travel & Notes zoom in on the position during 
the first geolocation
- __geoLocation.zoomFactor__ : the zoom factor used for geolocation
- __geoLocation.options.enableHighAccuracy__ : see Javascript options for localization functions
- __geoLocation.options.maximumAge__ : see Javascript options for localization functions
- __geoLocation.options.timeout__ : see Javascript options for localization functions
- __APIKeys.showDialogButton__ : when this value is true, the :key: button is present in
the toolbar
- __APIKeys.saveToSessionStorage__ : when this value is true, the access keys are saved in the
'SessionStorage'
- __APIKeys.showAPIKeysInDialog__ : when this value is true, the access keys can be read in the dialog box
- __APIKeys.dialogHaveUnsecureButtons__ : when this value is true, buttons to save or restore access keys in 
an unsecured file are present
- __contextMenu.timeout__ : the time that elapses between the moment when the mouse is no longer 
on the contextual menu and the moment when the menu closes automatically.
- __routing.auto__ : is not currently used.
- __language__ : the language used by default in TravelNotes
- __itineraryPointMarker.color__ : the color of the circle used to indicate on the map the point 
of the route on which the mouse is located.
- __itineraryPointMarker.weight__ : the weight of the circle used to indicate on the map the point 
of the route on which the mouse is located.
- __itineraryPointMarker.radius__ : the radius of the circle used to indicate on the map the point 
of the route on which the mouse is located.
- __itineraryPointMarker.fill__ : the filling of the circle used to indicate on the map the point 
of the route on which the mouse is located.
- __searchPointMarker.color__ : the color of the circle used to indicate on the map the position 
of a search result, following a click on this result in the control, when this result is in the form 
of a point
- __searchPointMarker.weight__ : the weight of the circle used to indicate on the map the position 
of a search result, following a click on this result in the control, when this result is in the form 
of a point
- __searchPointMarker.radius__ : the filling of the circle used to indicate on the map the position 
of a search result, following a click on this result in the control, when this result is in the form 
of a point
- __searchPointMarker.fill__ : the color of the circle used to indicate on the map the position 
of a search result, following a click on this result in the control, when this result is in the form 
of a point
- __searchPointPolyline.polyline.color__ : the color of the polyline used to indicate on the map the position 
of a search result, following a click on this result in the control, when this result is in the form 
of a polyline
- __searchPointPolyline.polyline.weight__ : the weight of the polyline used to indicate on the map the position 
of a search result, following a click on this result in the control, when this result is in the form 
of a polyline
- __searchPointPolyline.polyline.fill__ : the filling of the polyline used to indicate on the map the position 
of a search result, following a click on this result in the control, when this result is in the form 
of a polyline
- __previousSearchLimit.polyline.color__ : the color of the polyline used to indicate on the map 
the area of the last search performed
- __previousSearchLimit.polyline.weight__ : the weight of the polyline used to indicate on the map 
the area of the last search performed
- __previousSearchLimit.polyline.fill__ : the filling of the polyline used to indicate on the map 
the area of the last search performed
- __nextSearchLimit.polyline.color__ : the color of the polyline used to indicate on the map the 
area of the next search
- __nextSearchLimit.polyline.weight__ : the weight of the polyline used to indicate on the map 
the area of the next search
- __nextSearchLimit.polyline.fill__ : the filling of the polyline used to indicate on the map 
the area of the next search
- __wayPoint.reverseGeocoding__ : when this value is true, the coordinates of the waypoints are 
replaced by an address.
- __route.color__ : the default color of a route.
- __route.width__ : the default width of a route.
- __route.dashArray__ : the line type to use by default (= a number corresponding to the row 
type index in the dashChoices array).
- __route.dashChoices__ : a table showing the different types of lines displayed in the 
RoutesPropertiesDialog dialog box. Text will be displayed in the line type selector and iDashArray
is the template of the line type. Warning: the values in this table are numeric values and will be 
multiplied by the width of the line and converted into text before being used to adapt the line 
type in Leaflet.
- __note.reverseGeocoding__ : when this value is true, the coordinates of the notes are replaced 
by an address.
- __note.grip.size__ : the size of the handle at the end of the line of a note.
- __note.grip.opacity__ : the opacity of the handle at the end of the line of a note (0 = invisible!).
- __note.polyline.color__ : the color of the line of a note.
- __note.polyline.weight__ : the width of the line of a note.
- __note.style__ : the css style used to represent a note.
- __note.svgIconWidth__ : the radius of the area to be mapped in the SVG icon
- __note.svgAnleMaxDirection.right__ : the maximum angle of the direction to follow for the indication 
"Turn right" in the tooltip of the SVG icons
- __note.svgAnleMaxDirection.slightRight__ : the maximum angle of the direction to follow for the indication 
"Turn slight right" in the tooltip of the SVG icons
- __note.svgAnleMaxDirection.continue__ : the maximum angle of the direction to follow for the indication 
"Continue" in the tooltip of the SVG icons
- __note.svgAnleMaxDirection.slightLeft__ : the maximum angle of the direction to follow for the indication 
"Turn slight left" in the tooltip of the SVG icons
- __note.svgAnleMaxDirection.left__ : the maximum angle of the direction to follow for the indication 
"Turn left" in the tooltip of the SVG icons
- __note.svgAnleMaxDirection.sharpLeft__ : the maximum angle of the direction to follow for the indication 
"Turn sharp left" in the tooltip of the SVG icons
- __note.svgAnleMaxDirection.sharpRight__ : the maximum angle of the direction to follow for the indication 
"Turn sharp right" in the tooltip of the SVG icons
- __note.svgZoom__ : the zoom value used to make the SVG icons
- __note.svgAngleDistance__ : the minimum distance to use between the center of the SVG icon and 
the point used to calculate the rotation of the icon
- __note.svgHamletDistance__ : the maximum distance between the center of the SVG icon and a point 
with the tag place = hamlet in OSM for this tag to be used in the address of the icon
- __note.svgVillageDistance__ : the maximum distance between the center of the SVG icon and a point 
with the tag place = village in OSM for this tag to be used in the address of the icon
- __note.svgCityDistance__ : the maximum distance between the center of the SVG icon and a point 
with the tag place = city in OSM for this tag to be used in the address of the icon
- __note.svgTownDistance__ : the maximum distance between the center of the SVG icon and a point 
with the tag place = town in OSM for this tag to be used in the address of the icon
- __note.svgTimeOut__ : the duration of the timeout sent with the request to create the SVG icon
- __note.cityPrefix__ : a text that will be displayed before the name of the city in the address
- __note.cityPostfix__ : a text that will be displayed after the name of the city in the address
- __itineraryPointZoom__ : the zoom factor used to zoom in on a point in the route from a 
double-click in the control.
- __displayEditionInHTMLPage__ : when this value is true and a route is being edited, changes to 
that route will be immediately imported into the roadbook.
- __travelEditor.clearAfterSave__ : is not currently used.
- __travelEditor.startMinimized__ : when this value is true, the TravelNotes control is initially 
minimized.
- __travelEditor.timeout__ : the time that elapses between the moment when the mouse is no longer 
in control and when it will be minimized.
- __travelEditor.startupRouteEdition__ : when this value is true, a route is directly edited when 
a new file is opened.
- __haveBeforeUnloadWarning__ : when this value is true, a warning is displayed when the web page 
is closed but data may not be saved.
- __overpassApiUrl__ : the url to use for the overpass API
- __nominatim.url__ : the url to use for Nominatim
- __nominatim.language__ : the language to use for Nominatim

#### The contents of the TravelNotesLayers.json file

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
			"text":"&#x1f6b2;",
			"color":"black",
			"backgroundColor":"white"
		},
		"providerName":"Thunderforest",
		"providerKeyNeeded":true,
		"attribution":"| &copy; <a href='http://www.openstreetmap.org/copyright' target='_blank' title='OpenStreetMap contributors'>OpenStreetMap contributors</a> | Tiles courtesy of <a href='http://www.thunderforest.com/' target='_blank' title='Andy Allan'>Andy Allan</a> "
	}
]
```

Some explanations on the content of the file for each background map

- __service__ : the type of service: wms or wmts
- __url__: the url to use to get the map. The values {s}, {x}, {y} and {z} will be replaced by 
Leaflet, the value {providerKey} will be replaced by Travel & Notes by the possible access key 
for service. Never replace {providerKey} directly with your own access key !!!
- __wmsOptions__ : these are the options to pass to Leaflet for a wms service. 
See the Leaflet TileLayer.WMS documentation.
At a minimum, "layers", "format" and "transparent" should be present.
- __bounds__ : the lower left and upper right corner of the map.
- __minZoom__ : the smallest possible zoom for this map
- __maxZoom__ : the largest possible zoom for this map
- __name__ : the name of the card. It will be used in the tooltip of the button in the toolbar.
- __toolbar.text__ : the text to display in the toolbar button
- __toolbar.color__ : the foreground color of the toolbar button
- __toolbar.backgroundColor : the background color of the toolbar button
- __providerName__ : the name of the service provider. This name will be used to find 
the access key to the service.
- __providerKeyNeeded__ : when this value is true, an access key is required to get the map.
- __attribution__ : the map attributions
- __getCapabilitiesUrl__ : the url of the getCapabilities file when it is known.

#### The contents of the  TravelNotesNoteDialog.json file

This file contains the definitions of the buttons and list of predefined icons of the note editing box. 
These definitions can be adapted to your needs.

Sample file with 3 buttons and 2 predefined icons:

```
{ "editionButtons" : 
	[
		{
			"title" : "<span style='color:white;background-color:blue'>Blue</span>",
			"htmlBefore" : "<span style='color:white;background-color:blue'>",
			"htmlAfter" : "</span>"
		}, 
		{
			"title" : "<span style='color:white;background-color:red'>Red</span>",
			"htmlBefore" : "<span style='color:white;background-color:red'>",
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
			"name" : "Vélos admis",
			"icon" : "<div class='TravelNotes-MapNote TravelNotes-MapNoteCategory-0005'></div>",
			"tooltip" : "Vélos admis",
			"width" : 40,
			"height" : 40
		},
		{
			"name" : "Autobus",
			"icon" : "<div class='TravelNotes-MapNote TravelNotes-MapNoteCategory-0006'></div>",
			"tooltip" : "Autobus",
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

#### The contents of the configuration file that can be loaded with the button :file_folder:

The organization of this file is identical to the file TravelNotesNoteDialog.json

### Using the viewer

The viewer allows you to view files that have been made with TravelNotes. It does not have 
controls or menus and therefore does not allow modification of a travel. Its advantage lies in the 
fact that it does not use (too much) recent Javascript and that it is lighter than Travel & Notes.
Therefore, it is well suited for viewing travels on relatively slow old mobiles.

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

### Translations

Travel & Notes is translated into 'fr' and 'en'. If you want to translate Travel & Notes into 
another language, copy the TravelNotesEN.json file and rename it according to the language used. Then,
edit this file and translate all the lines in the desired language.
To load Travel & Notes in another language, add to the url lng = and the language to use 
(example to use Travel & Notes in english: https://wwwouaiebe.github.io/leaflet.TravelNotes/?lng=en.)

The organization of these files is as close as possible to that of 
[GNU getText](https://en.wikipedia.org/wiki/Gettext)

### Plugins

To use a plugin, simply load it from the html page using the tag <script>