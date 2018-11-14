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

#### Quelques explications complémentaires sur le Javascript

##### L.travelNotes.interface ( )

Cette méthode renvoie un objet unique qui permet de communiquer avec TravelNotes à partir de Javascript

##### Méthodes de L.travelNotes.interface ( )

__addControl ( map, divControlId, options )__

Cette méthode ajoute le contrôle de TravelNotes à la carte. 

Il y a deux moyens d'ajouter le contrôle à la carte: soit comme un contrôle normal de Leaflet, soit dans un élément HTML complètement séparé de la carte.

Paramètres :

- map : une référence Javascript vers  l'objet L.map
- divControlId : l'id de l'élément HTML dans lequel le contrôle TravelNotes doit être installé (quand ce contrôle est séparé de la carte) ou null (quand un contrôle leaflet standard est utilisé)
- options : les options du contrôle qui seront utilisées (quand un contrôle leaflet standard est utilisé - ce paramètre est ignoré quand le contrôle est séparé de la carte)

__addProvider ( provider )__

Cette méthode est utilisée uniquement par les plugins

__addMapContextMenu ( leftButton, rightButton )__

Cette méthode ajoute les menus contextuels gauche et droit

Paramètres :

- leftButton : quand ce paramètre est true, un menu contextuel est affiché quand un clic gauche est fait sur la carte
- rightButton : quand ce paramètre est true, un menu contextuel est affiché quand un clic droit est fait sur la carte

__getProviderKey ( providerName )__

Cette méthode renvoie la clef d'accès d'un fournisseur d'itinéraires

##### Propriétés de L.travelNotes.interface ( )

- __userData__ : un objet Javascript contenant des données non liées à TravelNotes et qui sera sauvé dans le fichier du voyage

- __leftContextMenu__ : boolean activant ou désactivant le menu contextuel gauche

- __rightContextMenu__ : boolean activant ou désactivant le menu contextuel droit

- __leftUserContextMenu__ : une collection d'objets ajoutant des commandes dans le menu contextuel gauche

- __rightUserContextMenu__ : une collection d'objets ajoutant des commandes dans le menu contextuel droit

- __maneuver__ : renvoie un nouvel objet maneuver. Uniquement utilisé par les plugins

- __itineraryPoint__ : renvoie un nouvel objet itineraryPoint. Uniquement utilisé par les plugins

- __version__ (lecture seule) : la version courante de TravelNotes.

#### Le fichier TravelNotesConfig.json

Ce fichier permet de modifier certains comportements de TravelNotes. Soyez prudents quand vous modifiez ce fichier. Vous devez suivre __toutes__ les règles d'écriture des fichiers json.

Le contenu du fichier TravelNotesConfig.json:

- __contextMenu.timeout__ : le temps qui va s'écouler entre le moment où la souris ne se trouve plus sur le menu contextuel et le moment ou le menu se ferme automatiquement. 
- __errorMessages.timeout__ : le temps qui va s'écouler entre le moment où un message d'erreur est affiché et le moment où il est effacé.
- __routing.auto__ : n'est pas utilisé actuellement
- __language__ : la langue utilisée par défaut dans TravelNotes
- __itineraryPointMarker.color__ : la couleur du cercle utilisé pour indiquer sur la carte le point de l'itinéraire sur lequel se trouve la souris.
- __itineraryPointMarker.weight__ : l'épaisseur du cercle utilisé pour indiquer sur la carte le point de l'itinéraire sur lequel se trouve la souris. 
- __itineraryPointMarker.radius__ : le rayon du cercle utilisé pour indiquer sur la carte le point de l'itinéraire sur lequel se trouve la souris.
- __itineraryPointMarker.fill__ : le remplissage du cercle utilisé pour indiquer sur la carte le point de l'itinéraire sur lequel se trouve la souris.
- __wayPoint.reverseGeocoding__ : quand cette valeur est true, les coordonnées des points de passage sont remplacées par une adresse.
- __route.color__ : la couleur par défaut d'un trajet
- __route.width__ : l'épaisseur par défaut d'un trajet
- __route.dashArray__ : le type de ligne à utiliser par défaut ( = un nombre correspondant à l'indice du type de ligne dans le tableau dashChoices ).
- __route.dashChoices__ : un tableau reprenant les différents type de lignes affichés dans la boite de dialogue RoutesPropertiesDialog. Text sera affiché dans le sélecteur du type de ligne et iDashArray 
est le template du type de ligne. Attention: les valeurs contenues dans ce tableau sont des valeurs numériques et seront multipliées par l'épaisseur de la ligne (width) et transformées en texte
avant d'être utilisées pour adapter le type de ligne dans Leaflet.
- __note.reverseGeocoding__ : quand cette valeur est true, les coordonnées des notes sont remplacées par une adresse.
- __note.grip.size__ : la dimension de la poignée à l'extrémité de la ligne de rappel d'une note
- __note.grip.opacity__ : l'opacité de la poignée à l'extrémité de la ligne de rappel d'une note (0 = invisible!) 
- __note.polyline.color__ : la couleur de la ligne de rappel d'une note
- __note.polyline.weight__ : l'épaisseur de la ligne de rappel d'une note
- __note.style__ : le style css utilisé pour représenter une note
- __itineraryPointZoom__ : le facteur de zoom utilisé pour zoomer sur un point de l'itinéraire à partir d'un double-clic dans le contrôle
- __displayEditionInHTMLPage__ : quand cette valeur est true et que un trajet est en cours d'édition, les modifications de ce trajet seront immédiatement importées dans le livre de voyage
- __travelEditor.clearAfterSave__ : n'est pas utilisé actuellement
- __travelEditor.startMinimized__ : quand cette valeur est true, le contrôle de TravelNotes est affiché sous forme réduite au départ
- __travelEditor.timeout__ : le temps qui va s'écouler entre le moment où la souris ne se trouve plus dans le contrôle et le moment où celui-ci sera réduit.
- __travelEditor.startupRouteEdition__ : quand cette valeur est true, un trajet est directement édité au chargement d'un nouveau fichier.
- __haveBeforeUnloadWarning__ : quand cette valeur est true, un avertissement est affiché quand la page web est fermée mais que des données pourraient ne pas être sauvegardées.

#### Le contenu du fichier TravelNotesNoteDialog.json

Ce fichier contient les définitions des boutons et de la liste des icônes prédéfinies de la boite d'édition des notes. Ces définitions peuvent être adaptées à vos besoins.

Exemple de fichier comprenant 3 boutons et 2 icônes prédéfinies:
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

Deux collections d'objets __doivent__ être présentes dans le fichier : "editionButtons" pour les boutons supplémentaires et "preDefinedIconsList" pour les icônes prédéfinies. Ces collections peuvent être vides
mais doivent être présentes.

Chaque objet de la collection "editionButtons" a deux ou trois propriétés;

- __title__ : le texte qui apparaitra sur le bouton dans la boite de dialogue
- __htmlBefore__ : le texte qui sera inséré avant la sélection lorsque l'on cliquera sur le bouton
- __htmlAfter__ : le texte qui sera inséré après la sélection lorsque l'on cliquera sur le bouton. Cette propriété est optionnelle.

Chaque objet de la collection "preDefinedIconsList" a cinq propriétés:

- __name__ : le nom qui sera affiché dans la liste déroulante (texte)
- __icon__ : le contenu de l'icône (html)
- __tooltip__ : le contenu du tooltip (html)
- __width__ : la largeur de l'icône en pixels
- __height__ : la hauteur de l'icône en pixels

#### Le contenu du fichier de configuration pouvant être chargé avec le bouton &#x23CD;

L'organisation de ce fichier est identique au fichier TravelNotesNoteDialog.json

### Traductions

Travel & Notes est traduit en 'fr' et en 'en'. Si vous désirez traduire Travel & Notes dans une autre langue, copiez le fichier TravelNotesEN.json et renommez-le en fonction de la langue utilisée. Ensuite,
éditez ce fichier et traduisez toutes les lignes msgstr dans la langue souhaitée.
Pour charger Travel & Notes dans une autre langue, ajoutez à l'url lng= et la langue à utiliser (exemple pour utiliser Travel & Notes en en: https://wwwouaiebe.github.io/leaflet.TravelNotes/?lng=en.

L'organisation de ces fichiers est la plus proche possible de celle de [GNU getText](https://en.wikipedia.org/wiki/Gettext)

### Plugins

Pour utiliser un plugin, charegez simplement celui-ci à partir de la page html en utilisant le tag <script>