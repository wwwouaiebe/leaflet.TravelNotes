# Travel & Notes - Installation guide

## Where to install Travel & Notes?

Of course Travel & Notes can be installed on a web server. It can also be installed on a computer disk and used locally.

### Installation Guide for Nulls

No great computer skills? If the demo suits you, you can download it by going to the gh-pages branch.
Still too complicated? follow this link directly (https://github.com/wwwouaiebe/leaflet.TravelNotes/archive/gh-pages.zip) which allows you to download the demo.
Open the zip file and install its contents in a directory on your PC or on your server and open the index.html file. That's all :-).

__**Warning:**__ following the discovery of a security hole in [JavaScript object XmlHttpRequest] (https://www.mozilla.org/en-US/security/advisories/mfsa2019-21/#CVE-2019-11730) it is no longer possible to run TravelNotes from a directory
on a PC without making any changes to the browser configuration. For Firefox, change the value of ** privacy.file_unique_origin ** in ** about: config ** to continue using TravelNotes locally.
You make this change at your own risk and we advise you to understand the risks before modifying anything. For Chrome and Edge, see the documentation.

### Installation guide for geeks

#### What to do in the HTML file?

The installation procedure is changed since the release v1.4.0. TravelNotes can no longer be installed in a Leaflet control, so you have to create a div in the html page.
and install TravelNotes.

Travel & Notes uses [Leaflet] (http://leafletjs.com/) to display the map. You must therefore download and install Leaflet.

In the &lt;head&gt; of the html file, load the Leaflet and TravelNotes stylesheet and create a &lt;style&gt; tag for the TravelNote map and control:

```
<head>
	...
	<style>
		body { font-family: sans-serif; font: 12px/1.5 "Helvetica Neue", Arial, Helvetica, sans-serif; }
		#TravelNotes { position: absolute; top: 0px; right:0px; z-index: 1200;}
		#Map { position: absolute; width: 100vw; height: 100vh;	max-width: 100vw; max-height: 100vh; top: 0px; left: 0px; overflow:none;}
	</style>
	<link rel="stylesheet" href="leaflet/leaflet.css" />
	<link rel="stylesheet" href="TravelNotes.min.css" />
	...
</head>
```

And in the &lt;body&gt; create a &lt;div&gt; for the map, a &lt;div&gt; for TravelNotes, load Leaflet, TravelNotes and TravelNotes plugins
and install the map and TravelNotes in their respective &lt;div&gt;.

```
<body>
	...
	<div id="Map">
	<div id="TravelNotesControl"></div>
	...
	<script src="leaflet/leaflet.js"></script><noscript>Oh oh. Javascript is not enabled. It's impossible to display this page without javascript.</noscript>
	<script src="TravelNotes.min.js"></script>
	<!-- route providers scripts for Mapbox and GraphHopper have only to be installed if you have an API key for Mapbox or GraphHopper -->
	<!-- route providers scripts for OSRM, public transport and polyline have only to be installed if you will work with these providers -->
	<script src="TravelNotesProviders/MapboxRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/GraphHopperRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/OSRMRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/PublicTransportRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/PolylineRouteProvider.min.js"></script>
	<!-- scripts for osmSearch have only to be installed if you will use osmSearch-->
	<script src="osmSearch/osmSearch.js"></script>
	<script src="osmSearch/osmSearchLatin.js"></script>
	<script>
		(function( ) 
		{
			'use strict';
			// Leaflet installation. See Leaflet documentation
			var Map = L.map ( 'Map' ).setView( [ 50.50923,5.49542 ], 17 );
			L.tileLayer ( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" title="Contributeurs de OpenStreetMap">Contributeurs de OpenStreetMap</a> | &copy; <a href="http://www.ouaie.be/" title="http://www.ouaie.be/">wwwouaiebe</a>' } ).addTo ( Map );
			// TravelNotes installation
			L.travelNotes.addControl ( Map, "TravelNotesControl");
			L.travelNotes.rightContextMenu = true;
		} ());		
	</script>
	...
</body>
```

#### Some additional explanations on Javascript

##### L.travelNotes

This object allows you to communicate with TravelNotes from Javascript

##### L.travelNotes methods

__addControl ( map, divControlId )__

This method adds the TravelNotes control to the HTML page.

Parameters :

- map : a Javascript reference to the object L.map
- divControlId : the id of the HTML element in which the TravelNotes control must be installed

__addProvider ( provider )__

This method is only used by plugins

__addMapContextMenu ( leftButton, rightButton )__

This method adds the left and right context menus

Parameters :

- leftButton : when this parameter is true, a pop-up menu is displayed when a left click is made on the map
- rightButton : when this parameter is true, a pop-up menu is displayed when a right click is made on the map

##### L.travelNotes properties

- __userData__ : a Javascript object containing data not related to TravelNotes and which will be saved in the travel file

- __leftContextMenu__ : boolean enabling or disabling left context menu

- __rightContextMenu__ : boolean enabling or disabling right context menu

- __leftUserContextMenu__ : a collection of objects adding commands to the left context menu

- __rightUserContextMenu__ : a collection of objects adding commands to the right context menu

- __maneuver__ : returns a new maneuver object. Only used by plugins

- __itineraryPoint__ : returns a new itineraryPoint object. Only used by plugins

- __baseDialog__ : an objet that can be used to easily create modal dialogs

- __version__ (read only) : the current version of TravelNotes

#### The TravelNotesConfig.json file

This file is used to modify certain behavior of TravelNotes. Be careful when editing this file. You must follow __all__ the rules for writing json files.

The contents of the TravelNotesConfig.json file:

- __contextMenu.timeout__ : the time that elapses between the moment when the mouse is no longer on the contextual menu and the moment when the menu closes automatically.
- __errorMessages.timeout__ : the time that elapses between the moment an error message is displayed and the moment when it is cleared.
- __routing.auto__ : is not currently used.
- __language__ : the language used by default in TravelNotes
- __itineraryPointMarker.color__ : the color of the circle used to indicate on the map the point of the route on which the mouse is located.
- __itineraryPointMarker.weight__ : the weight of the circle used to indicate on the map the point of the route on which the mouse is located.
- __itineraryPointMarker.radius__ : the radius of the circle used to indicate on the map the point of the route on which the mouse is located.
- __itineraryPointMarker.fill__ : the filling of the circle used to indicate on the map the point of the route on which the mouse is located.
- __searchPointMarker.color__ : the color of the circle used to indicate on the map the position of a search result, following a click on this result in the control, when this result is in the form of a point
- __searchPointMarker.weight__ : the weight of the circle used to indicate on the map the position of a search result, following a click on this result in the control, when this result is in the form of a point
- __searchPointMarker.radius__ : the filling of the circle used to indicate on the map the position of a search result, following a click on this result in the control, when this result is in the form of a point
- __searchPointMarker.fill__ : the color of the circle used to indicate on the map the position of a search result, following a click on this result in the control, when this result is in the form of a point
- __searchPointPolyline.polyline.color__ : the color of the polyline used to indicate on the map the position of a search result, following a click on this result in the control, when this result is in the form of a polyline
- __searchPointPolyline.polyline.weight__ : the weight of the polyline used to indicate on the map the position of a search result, following a click on this result in the control, when this result is in the form of a polyline
- __searchPointPolyline.polyline.fill__ : the filling of the polyline used to indicate on the map the position of a search result, following a click on this result in the control, when this result is in the form of a polyline
- __previousSearchLimit.polyline.color__ : the color of the polyline used to indicate on the map the area of the last search performed
- __previousSearchLimit.polyline.weight__ : the weight of the polyline used to indicate on the map the area of the last search performed
- __previousSearchLimit.polyline.fill__ : the filling of the polyline used to indicate on the map the area of the last search performed
- __nextSearchLimit.polyline.color__ : the color of the polyline used to indicate on the map the area of the next search
- __nextSearchLimit.polyline.weight__ : the weight of the polyline used to indicate on the map the area of the next search
- __nextSearchLimit.polyline.fill__ : the filling of the polyline used to indicate on the map the area of the next search
- __wayPoint.reverseGeocoding__ : when this value is true, the coordinates of the waypoints are replaced by an address.
- __route.color__ : the default color of a route.
- __route.width__ : the default width of a route.
- __route.dashArray__ : the line type to use by default (= a number corresponding to the row type index in the dashChoices array).
- __route.dashChoices__ : a table showing the different types of lines displayed in the RoutesPropertiesDialog dialog box. Text will be displayed in the line type selector and iDashArray
is the template of the line type. Warning: the values in this table are numeric values and will be multiplied by the width of the line and converted into text
before being used to adapt the line type in Leaflet.
- __note.reverseGeocoding__ : when this value is true, the coordinates of the notes are replaced by an address.
- __note.grip.size__ : the size of the handle at the end of the line of a note.
- __note.grip.opacity__ : the opacity of the handle at the end of the line of a note (0 = invisible!).
- __note.polyline.color__ : the color of the line of a note.
- __note.polyline.weight__ : the width of the line of a note.
- __note.style__ : the css style used to represent a note.
- __note.svgIconWidth__ : the radius of the area to be mapped in the SVG icon
- __note.svgAnleMaxDirection.right__ : the maximum angle of the direction to follow for the indication "Turn right" in the tooltip of the SVG icons
- __note.svgAnleMaxDirection.slightRight__ : the maximum angle of the direction to follow for the indication "Turn slight right" in the tooltip of the SVG icons
- __note.svgAnleMaxDirection.continue__ : the maximum angle of the direction to follow for the indication "Continue" in the tooltip of the SVG icons
- __note.svgAnleMaxDirection.slightLeft__ : the maximum angle of the direction to follow for the indication "Turn slight left" in the tooltip of the SVG icons
- __note.svgAnleMaxDirection.left__ : the maximum angle of the direction to follow for the indication "Turn left" in the tooltip of the SVG icons
- __note.svgAnleMaxDirection.sharpLeft__ : the maximum angle of the direction to follow for the indication "Turn sharp left" in the tooltip of the SVG icons
- __note.svgAnleMaxDirection.sharpRight__ : the maximum angle of the direction to follow for the indication "Turn sharp right" in the tooltip of the SVG icons
- __note.svgZoom__ : the zoom value used to make the SVG icons
- __note.svgAngleDistance__ : the minimum distance to use between the center of the SVG icon and the point used to calculate the rotation of the icon
- __note.svgHamletDistance__ : the maximum distance between the center of the SVG icon and a point with the tag place = hamlet in OSM for this tag to be used in the address of the icon
- __note.svgVillageDistance__ : the maximum distance between the center of the SVG icon and a point with the tag place = village in OSM for this tag to be used in the address of the icon
- __note.svgCityDistance__ : the maximum distance between the center of the SVG icon and a point with the tag place = city in OSM for this tag to be used in the address of the icon
- __note.svgTownDistance__ : the maximum distance between the center of the SVG icon and a point with the tag place = town in OSM for this tag to be used in the address of the icon
- __note.svgTimeOut__ : the duration of the timeout sent with the request to create the SVG icon
- __note.cityPrefix__ : a text that will be displayed before the name of the city in the address
- __note.cityPostfix__ : a text that will be displayed after the name of the city in the address
- __itineraryPointZoom__ : the zoom factor used to zoom in on a point in the route from a double-click in the control.
- __displayEditionInHTMLPage__ : when this value is true and a route is being edited, changes to that route will be immediately imported into the roadbook.
- __travelEditor.clearAfterSave__ : is not currently used.
- __travelEditor.startMinimized__ : when this value is true, the TravelNotes control is initially minimized.
- __travelEditor.timeout__ : the time that elapses between the moment when the mouse is no longer in control and when it will be minimized.
- __travelEditor.startupRouteEdition__ : when this value is true, a route is directly edited when a new file is opened.
- __haveBeforeUnloadWarning__ : when this value is true, a warning is displayed when the web page is closed but data may not be saved.
- __overpassApiUrl__ : the url to use for the overpass API
- __nominatim.url__ : the url to use for Nominatim
- __nominatim.language__ : the language to use for Nominatim

#### The contents of the  TravelNotesNoteDialog.json file

This file contains the definitions of the buttons and list of predefined icons of the note editing box. These definitions can be adapted to your needs.

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

Two collections of objects __must__ be present in the file: "editionButtons" for the additional buttons and "preDefinedIconsList" for the predefined icons. These collections may be empty
but must be present.

Each object in the "editionButtons" collection has two or three properties;

- __title__ : the text that will appear on the button in the dialog box
- __htmlBefore__ : the text that will be inserted before the selection when the button is clicked
- __htmlAfter__ : the text that will be inserted after the selection when the button is clicked. This property is optional.

Each object in the "preDefinedIconsList" collection has five properties:

- __name__ : the name that will be displayed in the drop-down list (text)
- __icon__ : the content of the icon (html)
- __tooltip__ : the content of the tooltip (html)
- __width__ : the width of the icon in pixels
- __height__ : the height of the icon in pixels

#### The contents of the configuration file that can be loaded with the button &#x23CD;

The organization of this file is identical to the file TravelNotesNoteDialog.json

### Translations

Travel & Notes is translated into 'fr' and 'en'. If you want to translate Travel & Notes into another language, copy the TravelNotesEN.json file and rename it according to the language used. Then,
edit this file and translate all the lines in the desired language.
To load Travel & Notes in another language, add to the url lng = and the language to use (example to use Travel & Notes in english: https://wwwouaiebe.github.io/leaflet.TravelNotes/?lng=en.)

The organization of these files is as close as possible to that of [GNU getText](https://en.wikipedia.org/wiki/Gettext)

### Plugins

To use a plugin, simply load it from the html page using the tag <script>