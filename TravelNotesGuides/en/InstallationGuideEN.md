# Travel & Notes - Installation guide

## Where to install Travel & Notes?

Of course Travel & Notes can be installed on a web server. It can also be installed on a computer disk and used locally.

### Installation Guide for Nulls

No great computer skills? If the demo suits you, you can download it by going to the gh-pages branch.
Still too complicated? follow this link directly (https://github.com/wwwouaiebe/leaflet.TravelNotes/archive/gh-pages.zip) which allows you to download the demo.
Open the zip file and install its contents in a directory on your PC or on your server and open the index.html file. That's all :-).

### Installation guide for geeks

#### What to do in the HTML file?

Travel & Notes uses [Leaflet] (http://leafletjs.com/) to display the map. You must therefore download and install Leaflet.

In the &lt;head&gt; file, load the Leaflet and TravelNotes stylesheet:

```
<head>
	...
	<link rel="stylesheet" href="leaflet/leaflet.css" />
	<link rel="stylesheet" href="TravelNotes.min.css" />
	...
</head>
```

And in the &lt;body&gt; load Leaflet and Travel & Notes Javascript, create the map and add the Travel & Notes control:

```
<body>
	...
	<div id="Map">
	...
	<script src="leaflet/leaflet.js"></script>
	<script src="TravelNotes.min.js"></script>
	<!-- route providers scripts have only to be installed if you have an API key for this provider -->
	<script src="TravelNotesProviders/MapboxRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/GraphHopperRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/OSRMRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/PolylineRouteProvider.min.js"></script>
	<script>
		(function( ) 
		{
			'use strict';
			// Leaflet installation. See Leaflet documentation
			var Map = L.map ( 'Map' ).setView( [ 50.50923,5.49542 ], 17 );
			L.tileLayer ( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" title="Contributeurs de OpenStreetMap">Contributeurs de OpenStreetMap</a> | &copy; <a href="http://www.ouaie.be/" title="http://www.ouaie.be/">Christian Guyette</a>' } ).addTo ( Map );
			// TravelNotes installation
			var myInterface = L.travelNotes.interface ( );
			myInterface.addControl ( Map, null, { position: "topright"} );
			myInterface.rightContextMenu = true;
		} ());		
	</script>
	...
</body>
```

#### Some additional explanations on Javascript

##### L.travelNotes.interface ( )

This method returns a unique object that allows you to communicate with TravelNotes from Javascript

##### L.travelNotes.interface ( ) methods

__addControl ( map, divControlId, options )__

This method adds the TravelNotes control to the map.

There are two ways to add the control to the map: either as a normal Leaflet control, or in an HTML element completely separated from the map.

Parameters :

- map : a Javascript reference to the object L.map
- divControlId : the id of the HTML element in which the TravelNotes control must be installed (when this control is separate from the map) or null (when a standard leaflet control is used)
- options : the control options that will be used (when a standard leaflet control is used - this parameter is ignored when the control is separated from the map)

__addProvider ( provider )__

This method is only used by plugins

__addMapContextMenu ( leftButton, rightButton )__

This method adds the left and right context menus

Parameters :

- leftButton : when this parameter is true, a pop-up menu is displayed when a left click is made on the map
- rightButton : when this parameter is true, a pop-up menu is displayed when a right click is made on the map

__getProviderKey ( providerName )__

This method returns the access key of a route provider

##### L.travelNotes.interface ( ) properties

- __userData__ : a Javascript object containing data not related to TravelNotes and which will be saved in the travel file

- __leftContextMenu__ : boolean enabling or disabling left context menu

- __rightContextMenu__ : boolean enabling or disabling right context menu

- __leftUserContextMenu__ : a collection of objects adding commands to the left context menu

- __rightUserContextMenu__ : a collection of objects adding commands to the right context menu

- __maneuver__ : returns a new maneuver object. Only used by plugins

- __itineraryPoint__ : returns a new itineraryPoint object. Only used by plugins

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
- __itineraryPointZoom__ : the zoom factor used to zoom in on a point in the route from a double-click in the control.
- __displayEditionInHTMLPage__ : when this value is true and a route is being edited, changes to that route will be immediately imported into the roadbook.
- __travelEditor.clearAfterSave__ : is not currently used.
- __travelEditor.startMinimized__ : when this value is true, the TravelNotes control is initially minimized.
- __travelEditor.timeout__ : the time that elapses between the moment when the mouse is no longer in control and when it will be minimized.
- __travelEditor.startupRouteEdition__ : when this value is true, a route is directly edited when a new file is opened.
- __haveBeforeUnloadWarning__ : when this value is true, a warning is displayed when the web page is closed but data may not be saved.

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