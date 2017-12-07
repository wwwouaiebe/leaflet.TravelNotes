# Travel & Notes - Guide d'installation

## Où installer Travel & Notes?

Travel & Notes peut bien sûr être installé sur un serveur web. Il peut également être installé sur le disque d'un ordinateur et utilisé localement.

### Guide d'installation pour les null

Pas de grandes connaissances informatiques? Si la démo vous convient, vous pouvez télécharger celle-ci en vous rendant dans la branche gh-pages.
Encore trop compliqué? suivez directement ce [lien](https://github.com/wwwouaiebe/leaflet.TravelNotes/archive/gh-pages.zip) qui vous permet de télécharger la démo. 
Ouvrez le fichier zip et installez son contenu dans un répertoire sur votre PC ou sur votre serveur et ouvrez le fichier index.html. That's all :-).

### Guide d'installation pour les geeks

#### Que faut-il faire dans le fichier HTML?

Travel & Notes utilise [Leaflet](http://leafletjs.com/) pour afficher la carte. Vous devez donc télécharger et installer Leaflet.

Dans le &lt;head&gt; du fichier, chargez la feuille de style de Leaflet et de TravelNotes:

```
<head>
	...
	<link rel="stylesheet" href="leaflet/leaflet.css" />
	<link rel="stylesheet" href="TravelNotes.min.css" />
	...
</head>
```

Et dans le &lt;body&gt; chargez les Javascript de Leaflet et de Travel & Notes , créez la carte et ajoutez le contrôle de Travel & Notes:

```
<body>
	...
	<div id="Map">
	...
	<script src="leaflet/leaflet.js"></script>
	<script src="TravelNotes.js"></script>
	<!-- route providers scripts have only to be installed if you have an API key for this provider -->
	<script src="TravelNotesProviders/MapzenRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/MapboxRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/GraphHopperRouteProvider.min.js"></script>
	<script src="TravelNotesProviders/OSRMRouteProvider.min.js"></script>
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

#### Quelques explications complémentaires sur le Javascript

##### L.travelNotes.interface ( )

Cette méthode renvoie un objet unique qui permet de communiquer avec TravelNotes à partir de Javascript

##### Méthodes de L.travelNotes.interface ( )

__addControl ( map, divControlId, options )__

Cette méthode ajoute le contrôle de TravelNotes à la carte. 

Il y a deux moyens d'ajouter le contrôle à la carte: soit comme un contrôle normal de leaflet, soit dans un élément HTML complètement séparé de la carte.

Paramètres :

- map : une référence Javascript vers  l'objet L.map
- divControlId : l'id de l'élément HTML dans lequel le contrôle TravelNotes doit être installé (quand ce contrôle est séparé de la carte) ou null (quand un contrôle leaflet standard est utilisé)
- options : les options du contrôle qui seront utilisées (quand un contrôle leaflet standard est utilisé - ce paramètre est ignoré quand le contrôle est séparé de la carte)

__addProvider ( provider )__

Cette méthode est utilisée uniquement par les pluggins

__addMapContextMenu ( leftButton, rightButton )__

Cette méthode ajoute les menus contextuels gauche et droit

Paramètres :

- leftButton : quand ce paramètre est true, un menu contextuel est affiché quand un clic gauche est fait sur la carte
- rightButton : quand ce paramètre est true, un menu contextuel est affiché quand un clic droit est fait sur la carte

__getProviderKey ( providerName )__

Cette méthode renvoie la clef d'accès d'un fournisseur d'itinéraires

Propriétés de L.travelNotes.interface ( )

- __userData__ : un objet Javascript contenant des données non liées à TravelNotes et qui sera sauvé dans le fichier du voyage

- __leftContextMenu__ : boolean activant ou désactivant le menu contextuel gauche

- __rightContextMenu__ : boolean activant ou désactivant le menu contextuel droit

- __leftUserContextMenu__ : une collection d'objets ajoutant des commandes dans le menu contextuel gauche

- __rightUserContextMenu__ : une collection d'objets ajoutant des commandes dans le menu contextuel droit

- __maneuver__ : renvoie un nouvel objet maneuver. Uniquement utilisé par les pluggins

- __itineraryPoint__ : renvoie un nouvel objet itineraryPoint. Uniquement utilisé par les pluggins

- __version__ (lecture seule) : la version courante de TravelNotes.

#### Le fichier TravelNotesConfig.json

Ce fichier permet de modifier certains comportements de TravelNotes. Soyez prudents quand vous modifiez ce fichier. Vous devez suivre __toutes__ les règles d'écriture des fichiers json.

##### le contenu du fichier TravelNotesConfig.json

contextMenu.timeout : le temps qui va s'écouler entre le moment où la souris ne se trouve plus sur le menu contextuel et le moment ou le menu se ferme automatiquement. 

errorMessages.timeout : le temps qui va s'écouler entre le moment où un message d'erreur est affiché et le moment où il est effacé.

routing.auto : n'est pas utilisé actuellement

language : la langue utilisée par défaut dans TravelNotes

itineraryPointMarker.color : la couleur du cercle utilisé pour indiquer sur la carte le point de l'itinéraire sur lequel se trouve la souris.

itineraryPointMarker.weight : l'épaisseur du cercle utilisé pour indiquer sur la carte le point de l'itinéraire sur lequel se trouve la souris.

itineraryPointMarker.radius : le rayon du cercle utilisé pour indiquer sur la carte le point de l'itinéraire sur lequel se trouve la souris.

itineraryPointMarker.fill : le remplissage du cercle utilisé pour indiquer sur la carte le point de l'itinéraire sur lequel se trouve la souris.

wayPoint.reverseGeocoding : quand cette valeur est true, les coordonnées des points de passage sont remplacées par une adresse.

route.color : la couleur par défaut d'un trajet

route.width : l'épaisseur par défaut d'un trajet

note.reverseGeocoding : quand cette valeur est true, les coordonnées des notes sont remplacées par une adresse.

note.grip.size : la dimension de la poignée à l'extrémité de la ligne de rappel d'une note

note.grip.opacity : l'opacité de la poignée à l'extrémité de la ligne de rappel d'une note (0 = invisible!)

note.polyline.color : la couleur de la ligne de rappel d'une note

note.polyline.weight : l'épaisseur de la ligne de rappel d'une note

note.style : le style css utilisé pour représenter une note

itineraryPointZoom : le facteur de zoom utilisé pour zoomer sur un point de l'itinéraire à partir d'un double-clic dans le contrôle

displayEditionInHTMLPage : quand cette valeur est true et que un trajet est en cours d'édition, les modifications de ce trajet seront immédiatement importées dans le livre de voyage

travelEditor.clearAfterSave : n'est pas utilisé actuellement

travelEditor.startMinimized : quand cette valeur est true, le contrôle de TravelNotes est affiché sous forme réduite au départ

travelEditor.timeout : le temps qui va s'écouler entre le moment où la souris ne se trouve plus dans le contrôle et le moment où celui-ci sera réduit.
