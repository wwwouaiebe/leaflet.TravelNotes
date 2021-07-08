##  What's new

### What's new in release 1.6.0

- The management of access keys has been completely revised. This is now done via a dialog box and it is possible to 
read / save these access keys from / to a file protected by password.
- Error display has been improved
- A toolbar allowing to manage the background maps was added
- A light viewer has been created. This allows viewing a travel on an old device that does not understand all the new JavaScript

Many technical modifications have also been made:
- All code has been migrated to ES6 and uses ES6 modules instead of nodeJS modules
- eslint is used to check the quality of the code
- All dialogs are based on the use of Promise
- Updates to the user interface and the map are made via events, which greatly reduces dependencies in the code.

### What's new in release 1.7.0

- When OpenRouteService or GraphHopper are used as route providers, it is also possible to display the route profile.
- When a route between two points is made with leaflet.TravelNotesPolyline this route is no longer represented as a straight line,
but in the form of a segment of a great circle. See [leaflet.TravelNotesPolyline](https://github.com/wwwouaiebe/leaflet.TravelNotesPolyline/blob/master/README.md) documentation.
- It is also possible to draw circles with leaflet.TravelNotesPolyline. See [leaflet.TravelNotesPolyline](https://github.com/wwwouaiebe/leaflet.TravelNotesPolyline/blob/master/README.md) documentation.

### What's new in release 1.8.0

- Adding a waypoint to a route has been improved. Now just move the mouse over the route to see a temporary waypoint appear. Then by dragging and dropping it, the waypoint is added to the route.

### What's new in release 1.9.0

- it's now possible to print maps of a route.

### What's new in release 1.10.0

- A new service provider, based on Mapzen Valhalla, has been added: Stadia Maps
- A button to reload the access keys has been added to the access key management dialog
- An error message is displayed when a problem occurs while reading the access keys file
- Some bugs are fixed

### What's new in release 1.11.0

- The predefined route notes "Icon SVG from OSM" have been improved for entries and exits from roundabouts
- It is possible to create a note for all the maneuvers of a route in one operation
- The display of errors when reading the "APIKeys" file has been improved
- Some bugs are fixed ( Issues #113, #115, #116, #117 and #118)

###  What's new in release 1.12.0

- The user interface has been changed. Consult the [User guide - en ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/UserGuideEN.md).
- All commands are standardized. Each object (map, route, note, waypoint, maneuver) is created, modified or deleted via commands in context menus that are available on the map or in the user interface.
- Performance is improved. Memory usage has been greatly reduced and load times reduced. This is particularly noticeable for long travels.
- [All code is documented](https://wwwouaiebe.github.io/leaflet.TravelNotes/TechDoc/)

###  What's new in release 1.13.0

- It is possible to search for points of interest in OpenStreetMap.
- Notes can be created from search results in OpenStreetMap.
- New predefined notes have been added. There are now over 70 predefined notes.
- The background of the notes can be transparent.
- All predefined note icons are now in svg.

### What's new in release 2.0.0

To avoid [xss attacks](https://en.wikipedia.org/wiki/Cross-site_scripting), especially when exchanging files, all the security 
of the app has been reviewed, which leads to a certain number of limitations and modifications:
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) is enabled by default via a &lt;meta&gt; tag in the index.html file.
Thanks to this, it is no longer possible to run javascript from a site other than the one where Travel & Notes is installed, 
to run scripts inline in the html or to download images or files from another site.
If you have the possibility, however, it is preferable to activate Content Securty Policy via a header installed by the server rather than via a&lt;meta&gt; tag.
- the html tags that can be used when creating notes are restricted, as are the attributes attached to these html tags.
Consult the [User guide - en ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/UserGuideEN.md#AddHtmltext).
- when opening a travel file made with an earlier version, all unauthorized tags and attributes are deleted.
- in order to avoid an xss attack via a link sent by email, it is no longer possible to automatically open a travel file 
via the app url when this travel file comes from another site, even if Content Security Policy is completely disabled.
- it is no longer possible to define styles in inline. If you want to create a custom style, you have to create it in a css
file and import it with a tag &lt;link&gt;
- it is obviously no longer possible to use a &lt;script&gt; nor any event handler attached to an html tag (onmouseover, onclick ...).
- the links present in the href and src attributes must be correct and complete. In an src attribute, the protocol can only
 be https: (and http: if the app is installed on an http: site). In the href attributes, the protocol must be http:, 
 https:, mailto:, sms: or tel:. In addition, sms: and tel: links must start with a + and can only include the 
 characters #, * space and numbers 0-9.
- it is no longer possible to enter the API keys of service providers via url parameters.

In addition, the following improvements have been made:
- the SVG icons from OSM contain the number of the node-point when the icon is on this node-point and the route is 
calculated for a bicycle (NB the points-nodes are a particularity of the bicycle routes in Belgium, Netherlands
 and partially in Germany).
- it is necessary to name the travel before being able to save it in a file.
- a temporary solution was created to work around the errors of city names returned by Nominatim.
- a preview of the note being edited has been added to the note edit box.
- it is possible to hide or activate certain parts of this same edit box.

### What's new in release 2.1.0

Version 2.1.0. is primarily a version containing changes for developers:
- all plugin repositories have been merged into TravelNotes and there is therefore only one repository. Thanks to that,
the sizes of some plugins have been reduced considerably.
- @mapbox\polyline is no longer used for data compression and has been replaced by an internal development
which also greatly reduces the size of the data files. 

### What's new in release 2.2.0

- the TravelNotesConfig.json file has been completely revised. If you are using a modified version of this file, it is important to review this one. See the installation guide.
- a status indicator for the last use of the "Save to file" command has been added (green: travel saved - yellow: travel modified since the last save - red: travel modified and not saved for at least 5 minutes).
- the method used to find the municipality of an address has been revised.
- the search for points of interest in OpenStreetMap has been improved and is much faster.
- a "Partial save" command has been added. This allows you to save a travel WITHOUT the travel notes and / or WITHOUT the route notes and / or WITHOUT the maneuvers. This command allows to have a much lighter file
for map presentations on the Internet
- the css have been reorganized and revised. Many small presentation bugs related to CSS have been fixed.
- it is possible to zoom and pan on the map when a dialog is displayed.
- it is possible to use the keyboard for the viewer commands. See the 
 [user guide - en ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/UserGuideEN.md#Viewer)
- and many purely technical modifications as well as the correction of many small bugs.

### What's new in release 2.3.0

Following bugs are corrected:

- Issue #158: when creating a route note from an Osm search result, the distance from the beginning of route is 0
- Issue #159: When creating a note from an Osm search result, it's needed to verify the address before adding the note or showing the dialog
- Issue #160: noopener noreferrer are added automaticaly when a link is created with target='_blank'
- Issue #162: Zoom on the map is not working when a dialog is displayed.
- Issue #163: svg icons integrated in js files are not displayed correctly ( Chrome ).
- Issue #164: PolylineProvider and PublicTransportProvider crash when selected from the provider toolbar 
- Issue #168: RCN REF numbers are difficult to read in the notes icons. Change the color.
- Issue #170: The apps crash when renaming a waypoint and then saving the route before the end of the renaming operation..

