# Travel & Notes - Guide d'installation

- [Où installer Travel & Notes?](#WhereInstall)
- [Guide d'installation pour les null](#GuideNull)
- [Guide d'installation pour les geeks](#GuideGeeks)
	- [Que faut-il faire dans le fichier HTML?](#HtmlPage)
	- [Quelques explications complémentaires sur le Javascript](#MoreOnJS)
		- [L'objet L.travelNotes](#LTravelNotes)
		- [Méthodes de L.travelNotes](#LTravelNotesMethods)
		- [Propriétés de L.travelNotes](#LTravelNotesProperties)
	- [Le contenu du fichier TravelNotesConfig.json](#TravelNotesConfigJson)
	- [Le contenu du fichier TravelNotesLayers.json](#TravelNotesLayersJson)
	- [Le contenu des fichiers TravelNotesNoteDialogFR.json et TravelNotesNoteDialogEN.json](#TravelNotesNoteDialogJson)
	- [Le contenu du fichier de configuration pouvant être chargé avec le bouton :file_folder: dans la boite d'édition des notes](#myTravelNotesNoteDialogJson)
- [Utiliser le viewer](#Viewer)
- [Traductions](#Translations)
- [Plugins](#Plugins)

<a id="WhereInstall"></a>
## Où installer Travel & Notes?

Pour des raisons de sécurité, il n'est plus possible d'utiliser Travel & Notes depuis le disque d'un 
ordinateur. Il est indispensable de passer par l'intermédiaire soit d'un serveur web soit distant, soit
d'un serveur web local de type LAMP or MAMP.
Voir https://www.mozilla.org/en-US/security/advisories/mfsa2019-21/#CVE-2019-11730

<a id="GuideNull"></a>
## Guide d'installation pour les null

Pas de grandes connaissances informatiques? Si la démo vous convient, vous pouvez télécharger celle-ci 
en vous rendant dans la branche gh-pages.
Encore trop compliqué? suivez directement ce 
[lien](https://github.com/wwwouaiebe/leaflet.TravelNotes/archive/gh-pages.zip)
 qui vous permet de télécharger la démo. Ouvrez le fichier zip et installez son contenu dans 
 un répertoire sur votre serveur et ouvrez le fichier index.html. That's all :-).

<a id="GuideGeeks"></a>
## Guide d'installation pour les geeks

<a id="HtmlPage"></a>
### Que faut-il faire dans le fichier HTML?

Travel & Notes utilise [Leaflet](http://leafletjs.com/) pour afficher la carte. Vous devez donc 
télécharger et installer Leaflet.

Dans le &lt;head&gt; du fichier, chargez la feuille de style de Leaflet et de TravelNotes

```
<head>
	...
	<link rel="stylesheet" href="leaflet/leaflet.css" />
	<link rel="stylesheet" href="TravelNotes.min.css" />
	...
</head>
```

Et dans le &lt;body&gt; chargez les Javascript de Leaflet, de TravelNotes et des plugins de TravelNotes

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

Travel & Notes créera automatiquement la carte et tous les contrôles nécessaires.

<a id="MoreOnJS"></a>
### Quelques explications complémentaires sur le Javascript

<a id="LTravelNotes"></a>
#### L'objet L.travelNotes

Cet objet permet de communiquer avec TravelNotes à partir de Javascript

<a id="LTravelNotesMethods"></a>
#### Méthodes de L.travelNotes

__addProvider ( provider )__

Cette méthode est utilisée uniquement par les plugins

__showInfo ( info )__

Cette méthode affiche à l'écran le texte contenu dans "info" 

__addMapContextMenu ( leftButton, rightButton )__

Cette méthode ajoute les menus contextuels gauche et droit

Paramètres :

- leftButton : quand ce paramètre est true, un menu contextuel est affiché quand un clic gauche 
est fait sur la carte
- rightButton : quand ce paramètre est true, un menu contextuel est affiché quand un clic droit 
est fait sur la carte

<a id="LTravelNotesProperties"></a>
#### Propriétés de L.travelNotes

- __userData__ : un objet Javascript contenant des données non liées à TravelNotes et qui sera 
sauvé dans le fichier du voyage

- __leftContextMenu__ : boolean activant ou désactivant le menu contextuel gauche

- __rightContextMenu__ : boolean activant ou désactivant le menu contextuel droit

- __leftUserContextMenu__ : une collection d'objets ajoutant des commandes dans le menu contextuel gauche

- __rightUserContextMenu__ : une collection d'objets ajoutant des commandes dans le menu contextuel droit

- __maneuver__ : renvoie un nouvel objet maneuver. Uniquement utilisé par les plugins

- __itineraryPoint__ : renvoie un nouvel objet itineraryPoint. Uniquement utilisé par les plugins

- __baseDialog__ : un objet pour créer facilement des dialogues modaux. Uniquement utilisé par les plugins

- __version__ (lecture seule) : la version courante de TravelNotes.

- __map__ : renvoie une référence vers l'objet leaflet map

<a id="TravelNotesConfigJson"></a>
### Le contenu du fichier TravelNotesConfig.json

Ce fichier permet de modifier certains comportements de TravelNotes. Soyez prudent quand vous 
modifiez ce fichier. Vous devez suivre __toutes__ les règles d'écriture des fichiers json.

Le contenu du fichier TravelNotesConfig.json:

- __autoLoad__ : quand cette valeur est true, la carte et tous les contrôles sont construits automatiquement
au chargement de Travel & Notes
- __map.center.lat__ : la latitude utilisée pour le centre de la carte lors du chargement automatique
- __map.center.lng__ : la longitude utilisée pour le centre de la carte lors du chargement automatique
- __map.zoom__ : le zoom utilisé pour la carte lors du chargement automatique
- __travelNotesToolbarUI.contactMail__ : l'adresse mail utilisée dans le bouton contact
- __layersToolbarUI.haveLayersToolbarUI__ : quand cette valeur est true, la barre d'outils des fonds de carte
est présente.
- __layersToolbarUI.toolbarTimeOut__ : le temps qui va s'écouler entre le moment où la souris ne se trouve
plus sur la barre d'outils et le moment où cette barre d'outils se ferme automatiquement. 
- __layersToolbarUI.theDevil.addButton__ : quand cette valeur est true, un bouton "theDevil" est ajouté à 
la barre d'outils et à la boite de dialogue d'édition des notes.
- __layersToolbarUI.theDevil.title__ : le tooltip utilisé pour le bouton "theDevil"
- __layersToolbarUI.theDevil.text__ : le texte utilisé pour le bouton "theDevil"
- __layersToolbarUI.theDevil.noteZoom__ : le zoom utilisé pour le bouton "theDevil" de la boite 
de dialogue d'édition des notes
- __mouseUI.haveMouseUI__ : quand cette valeur est true, un contrôle est affiché en haut de l'écran,
indiquant les coordonnées de la souris, la valeur du zoom et le nom du fichier ouvert
- __errorUI.timeOut__ : le temps qui va s'écouler entre le moment où un message d'erreur est affiché et le
moment où il est effacé
- __errorUI.helpTimeOut__ : le temps qui va s'écouler entre le moment où un message d'aide est affiché et le
moment où il est effacé
- __errorUI.showError__ : quand cette valeur est true, les messages d'erreur sont affichés
- __errorUI.showWarning__ : quand cette valeur est true, les messages d'avertissement sont affichés
- __errorUI.showInfo__ : quand cette valeur est true, les messages d'information sont affichés
- __errorUI.showHelp__ : quand cette valeur est true, les messages d'aide sont affichés
- __geoLocation.color__ : la couleur du cercle utilisé pour indiquer la geolocalisation
- __geoLocation.radius__ : le rayon du cercle utilisé pour indiquer la geolocalisation
- __geoLocation.zoomToPosition__ : quand cette valeur est true, Travel & Notes zoomera sur la position
 lors de la première geolocalisation
- __geoLocation.zoomFactor__ : le facteur de zoom utilisé pour la geolocalisation
- __geoLocation.options.enableHighAccuracy__ : voir les options Javascript des fonctions de localisation
- __geoLocation.options.maximumAge__ : voir les options Javascript des fonctions de localisation
- __geoLocation.options.timeout__ : voir les options Javascript des fonctions de localisation
- __APIKeys.showDialogButton__ : quand cette valeur est true, le bouton :key: est présent dans 
la barre d'outils
- __APIKeys.saveToSessionStorage__ : quand cette valeur est true, les clefs d'accès sont sauvées dans le 
'sessionStorage'
- __APIKeys.showAPIKeysInDialog__ : quand cette valeur est true, les clefs d'accès sont lisibles dans la
boite de dialogue
- __APIKeys.dialogHaveUnsecureButtons__ : quand cette valeur est true, des  boutons pour enrégistrer
ou restaurer les clefs d'accès dans un fichier non sécurisé sont présents
- __contextMenu.timeout__ : le temps qui va s'écouler entre le moment où la souris ne se trouve plus 
sur le menu contextuel et le moment ou le menu se ferme automatiquement. 
- __routing.auto__ : n'est pas utilisé actuellement
- __language__ : la langue utilisée par défaut dans TravelNotes
- __itineraryPointMarker.color__ : la couleur du cercle utilisé pour indiquer sur la carte le point 
de l'itinéraire sur lequel se trouve la souris.
- __itineraryPointMarker.weight__ : l'épaisseur du cercle utilisé pour indiquer sur la carte le point 
de l'itinéraire sur lequel se trouve la souris. 
- __itineraryPointMarker.radius__ : le rayon du cercle utilisé pour indiquer sur la carte le point 
de l'itinéraire sur lequel se trouve la souris.
- __itineraryPointMarker.fill__ : le remplissage du cercle utilisé pour indiquer sur la carte le point 
de l'itinéraire sur lequel se trouve la souris.
- __searchPointMarker.color__ : la couleur du cercle utilisé pour indiquer sur la carte la position 
d'un résultat de recherche, suite à un click sur ce résultat dans le contrôle, lorsque ce résultat 
est sous forme de point
- __searchPointMarker.weight__ : l'épaisseur du cercle utilisé pour indiquer sur la carte la position 
d'un résultat de recherche, suite à un click sur ce résultat dans le contrôle, lorsque ce résultat 
est sous forme de point
- __searchPointMarker.radius__ : le rayon du cercle utilisé pour indiquer sur la carte la position 
d'un résultat de recherche, suite à un click sur ce résultat dans le contrôle, lorsque ce résultat 
est sous forme de point
- __searchPointMarker.fill__ : le remplissage du cercle utilisé pour indiquer sur la carte la position 
d'un résultat de recherche, suite à un click sur ce résultat dans le contrôle, lorsque ce résultat 
est sous forme de point
- __searchPointPolyline.polyline.color__ : la couleur de la polyline utilisée pour indiquer 
sur la carte la position d'un résultat de recherche, suite à un click sur ce résultat dans le contrôle, 
lorsque ce résultat est sous forme de polyline
- __searchPointPolyline.polyline.weight__ : l'épaisseur de la polyline utilisée pour indiquer
sur la carte la position d'un résultat de recherche, suite à un click sur ce résultat dans le contrôle,
lorsque ce résultat est sous forme de polyline
- __searchPointPolyline.polyline.fill__ : le remplissage de la polyline utilisée pour indiquer 
sur la carte la position d'un résultat de recherche, suite à un click sur ce résultat dans le contrôle, 
lorsque ce résultat est sous forme de polyline
- __previousSearchLimit.polyline.color__ : la couleur de la polyline utilisée pour indiquer 
sur la carte la zone de la dernière recherche effectuée
- __previousSearchLimit.polyline.weight__ : l'épaisseur de la polyline utilisée pour indiquer 
sur la carte la zone de la dernière recherche effectuée
- __previousSearchLimit.polyline.fill__ : le remplissage de la polyline utilisée pour indiquer 
sur la carte la zone de la dernière recherche effectuée
- __nextSearchLimit.polyline.color__ : la couleur de la polyline utilisée pour indiquer 
sur la carte la zone de la prochaine recherche
- __nextSearchLimit.polyline.weight__ : l'épaisseur de la polyline utilisée pour indiquer 
sur la carte la zone de la prochaine recherche
- __nextSearchLimit.polyline.fill__ : le remplissage de la polyline utilisée pour indiquer 
sur la carte la zone de la prochaine recherche
- __wayPoint.reverseGeocoding__ : quand cette valeur est true, les coordonnées des points 
de passage sont remplacées par une adresse.
- __route.color__ : la couleur par défaut d'un trajet
- __route.width__ : l'épaisseur par défaut d'un trajet
- __route.dashArray__ : le type de ligne à utiliser par défaut 
( = un nombre correspondant à l'indice du type de ligne dans le tableau dashChoices ).
- __route.dashChoices__ : un tableau reprenant les différents type de lignes affichés 
dans la boite de dialogue RoutesPropertiesDialog. Text sera affiché dans le sélecteur du type de ligne 
et iDashArray est le template du type de ligne. Attention: les valeurs contenues dans ce tableau sont 
des valeurs numériques et seront multipliées par l'épaisseur de la ligne (width) et transformées en 
texte avant d'être utilisées pour adapter le type de ligne dans Leaflet.
- __route.elev.smooth__ : quand cette valeur est true, le profil de la route est lissé 
- __route.elev.smoothCoefficient__ : un coefficient utilisé pour calculer la distance entre deux points 
pour le lissage de l'élévation. Valeur par défaut: 0.25
- __route.elev.smoothPoints__ : le nombre de points avant et après le point courant dans les calculs de lissage
- __route.showDragTooltip__ : le nombre de fois que le tooltip affiché lors de l'ajout d'un point de passage est montré
( -1 = toujours ).
- __note.reverseGeocoding__ : quand cette valeur est true, les coordonnées des notes sont remplacées 
par une adresse.
- __note.grip.size__ : la dimension de la poignée à l'extrémité de la ligne de rappel d'une note
- __note.grip.opacity__ : l'opacité de la poignée à l'extrémité de la ligne de rappel d'une note 
(0 = invisible!) 
- __note.polyline.color__ : la couleur de la ligne de rappel d'une note
- __note.polyline.weight__ : l'épaisseur de la ligne de rappel d'une note
- __note.style__ : le style css utilisé pour représenter une note
- __note.svgIconWidth__ : le rayon de la zone à cartographier dans l'icône SVG
- __note.svgAnleMaxDirection.right__ : l'angle maximum de la direction à suivre por l'indication 
"Tourner à droite" dans le tooltip des icones SVG
- __note.svgAnleMaxDirection.slightRight__ : l'angle maximum de la direction à suivre por l'indication 
"Tourner légèrement à droite" dans le tooltip des icones SVG
- __note.svgAnleMaxDirection.continue__ : l'angle maximum de la direction à suivre por l'indication 
"Continuer" dans le tooltip des icones SVG
- __note.svgAnleMaxDirection.slightLeft__ : l'angle maximum de la direction à suivre por l'indication 
"Tourner légèrement à gauche" dans le tooltip des icones SVG
- __note.svgAnleMaxDirection.left__ : l'angle maximum de la direction à suivre por l'indication 
"Tourner à gauche" dans le tooltip des icones SVG
- __note.svgAnleMaxDirection.sharpLeft__ : l'angle maximum de la direction à suivre por l'indication 
"Tourner fortement à gauche" dans le tooltip des icones SVG
- __note.svgAnleMaxDirection.sharpRight__ : l'angle maximum de la direction à suivre por l'indication 
"Tourner fortement à droite" dans le tooltip des icones SVG
- __note.svgZoom__ : la valeur du zoom utilisé pour réaliser les icônes SVG
- __note.svgAngleDistance__ : la distance minimale à utiliser entre le centre de l'icône SVG et le point 
utilisé pour calculer la rotation de l'icône
- __note.svgHamletDistance__ : la distance maximum entre le centre de l'icône SVG et un point avec le 
tag place=hamlet dans OSM pour que ce tag soit utilisé dans l'adresse de l'icône
- __note.svgVillageDistance__ : la distance maximum entre le centre de l'icône SVG et un point avec le 
tag place=village dans OSM pour que ce tag soit utilisé dans l'adresse de l'icône
- __note.svgCityDistance__ : la distance maximum entre le centre de l'icône SVG et un point avec le 
tag place=city dans OSM pour que ce tag soit utilisé dans l'adresse de l'icône
- __note.svgTownDistance__ : la distance maximum entre le centre de l'icône SVG et un point avec le 
tag place=town dans OSM pour que ce tag soit utilisé dans l'adresse de l'icône
- __note.svgTimeOut__ : la durée du timeout envoyé avec la requête de création de l'icône SVG
- __note.cityPrefix__ : un texte qui sera affiché avant le nom de la cité dans l'adresse
- __note.cityPostfix__ :un texte qui sera affiché après le nom de la cité dans l'adresse
- __itineraryPointZoom__ : le facteur de zoom utilisé pour zoomer sur un point de l'itinéraire à partir 
d'un double-clic dans le contrôle
- __routeEditor.displayEditionInHTMLPage__ : quand cette valeur est true et que un trajet est en cours 
d'édition, les modifications de ce trajet seront immédiatement importées dans le livre de voyage
- __travelEditor.clearAfterSave__ : n'est pas utilisé actuellement
- __travelEditor.startMinimized__ : quand cette valeur est true, le contrôle de TravelNotes est affiché 
sous forme réduite au départ
- __travelEditor.timeout__ : le temps qui va s'écouler entre le moment où la souris ne se trouve plus 
dans le contrôle et le moment où celui-ci sera réduit.
- __travelEditor.startupRouteEdition__ : quand cette valeur est true, un trajet est directement édité 
au chargement d'un nouveau fichier.
- __haveBeforeUnloadWarning__ : quand cette valeur est true, un avertissement est affiché quand la 
page web est fermée mais que des données pourraient ne pas être sauvegardées.
- __overpassApiUrl__ : l'url à utiliser pour l'overpass API
- __nominatim.url__ : l'url à utiliser pour Nominatim
- __nominatim.language__ : la langue à utiliser pour Nominatim
- __printRouteMap.isEnabled__ : quand cette valeur est true, la commande pour imprimer les cartes d'un trajet est active.
- __printRouteMap.maxTiles__ : le maximum de tuiles pouvant être utilisées pour imprimer un trajet
- __printRouteMap.paperWidth__ : la largeur du papier
- __printRouteMap.paperHeight__ : la hauteur du papier
- __printRouteMap.pageBreak__ : quand cette valeur est true, un saut de page est inséré après chaque carte
- __printRouteMap.printNotes__ : quand cette valeur est true, l'icône des notes est également imprimée
- __printRouteMap.borderWidth__ : la largeur du bord de carte qui sera dupliqué dans chaque carte
- __printRouteMap.zoomFactor__ :  le zoom à utiliser pour l'impression
- __printRouteMap.entryPointMarker__ : les options à utiliser pour le marqueur de début de trajet. Toutes les options
de [leaflet.CircleMarker](https://leafletjs.com/reference-1.6.0.html#circlemarker) peuvent être utilisées.
- __printRouteMap.exitPointMarker__ : les options à utiliser pour le marqueur de fin de trajet. Toutes les options
de [leaflet.CircleMarker](https://leafletjs.com/reference-1.6.0.html#circlemarker) peuvent être utilisées.

<a id="TravelNotesLayersJson"></a>
### Le contenu du fichier TravelNotesLayers.json

Ce fichier contient les définitions des fonds de carte de la barre d'outils "Cartes"
Ces définitions peuvent être adaptées.

Un exemple de fichier avec deux fond de carte différents, l'un avec la carte de Ferraris 
de la Belgique en 1771, l'autre avec la carte de OpenCycleMap de Thunderforest

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
		"attribution":"| Tiles courtesy of <a href='http://www.thunderforest.com/' target='_blank' title='Andy Allan'>Andy Allan</a> "
	}
]
```

Quelques explications sur le contenu du fichier pour chaque fond de carte

- __service__ : le type de service: wms ou wmts
- __url__: l'url à utiliser pour obtenir la carte. Les valeurs {s}, {x}, {y} et {z} 
seront remplacées par Leaflet, la valeur {providerKey} sera remplacée par Travel & Notes par la clef d'accès
éventuelle pour ce fournisseur. Ne jamais remplacer directement {providerKey} par votre propre clef d'accès!!!
- __wmsOptions__ : ce sont les options à passer à Leaflet pour un service wms. 
Voir la documentation de [TileLayer.WMS](https://leafletjs.com/reference-1.6.0.html#tilelayer-wms) de Leaflet.
Au minimum, "layers", "format" et "transparent" devraient être présents.
- __bounds__ : le coin inférieur gauche et supérieur droit de la carte.
- __minZoom__ : le plus petit zoom possible pour cette carte
- __maxZoom__ : le plus grand zoom possible pour cette carte
- __name__ : le nom de la carte.Il sera utilisé dans le tooltip du bouton de la barre d'outils.
- __toolbar.text__ : le texte à afficher dans le bouton de la barre d'outils
- __toolbar.color__ : la couleur d'avant-plan du bouton de la barre d'outils
- __toolbar.backgroundColor__ : la couleur d'arrière-plan du bouton de la barre d'outils
- __providerName__ : le nom du fournisseur de service. Ce nom sera utilisé pour retrouver la clef d'accès
au service.
- __providerKeyNeeded__ : quand cette valeur est true, une clef d'accès est nécessaire 
pour obtenir la carte.
- __attribution__ : les attributions de la carte. Pour les cartes basées sur OpenStreetMap, il n'est pas nécessaire d'ajouter 
les attributions de OpenStreetMap car celles-ci sont toujours présentes dans Travel & Notes.
- __getCapabilitiesUrl__ : l'url du fichier getCapabilities quand celle-ci est connue.

<a id="TravelNotesNoteDialogJson"></a>
### Le contenu des fichiers TravelNotesNoteDialogFR.json et TravelNotesNoteDialogEN.json

Ce fichier contient les définitions des boutons et de la liste des icônes prédéfinies de la boite 
d'édition des notes. Ces définitions peuvent être adaptées à vos besoins.

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

Deux collections d'objets __doivent__ être présentes dans le fichier : "editionButtons" pour les 
boutons supplémentaires et "preDefinedIconsList" pour les icônes prédéfinies. Ces collections peuvent 
être vides mais doivent être présentes.

Chaque objet de la collection "editionButtons" a deux ou trois propriétés;

- __title__ : le texte qui apparaitra sur le bouton dans la boite de dialogue
- __htmlBefore__ : le texte qui sera inséré avant la sélection lorsque l'on cliquera sur le bouton
- __htmlAfter__ : le texte qui sera inséré après la sélection lorsque l'on cliquera sur le bouton. 
Cette propriété est optionnelle.

Chaque objet de la collection "preDefinedIconsList" a cinq propriétés:

- __name__ : le nom qui sera affiché dans la liste déroulante (texte)
- __icon__ : le contenu de l'icône (html)
- __tooltip__ : le contenu du tooltip (html)
- __width__ : la largeur de l'icône en pixels
- __height__ : la hauteur de l'icône en pixels

<a id="myTravelNotesNoteDialogJson"></a>
### Le contenu du fichier de configuration pouvant être chargé avec le bouton :file_folder: dans la boite d'édition des notes

L'organisation de ce fichier est identique aux fichiers TravelNotesNoteDialogFR.json et TravelNotesNoteDialogEN.json

<a id="Viewer"></a>
## Utiliser le viewer

Le viewer permet de visualiser des fichiers qui ont été réalisés avec TravelNotes. Il ne possède
pas de contrôles ni de menus et ne permet donc pas la modification d'un voyage.
Son intérêt réside dans le fait qu'il n'utilise pas (trop) de Javascript récent et qu'il est
plus léger que Travel & Notes. De ce fait, il convient bien pour visualiser des voyages sur de
vieux mobiles relativement lents.

Il s'installe comme Travel & Notes, avec deux balises &lt;link&gt; et deux balises &lt;script&gt;,
une pour Leaflet et l'autre pour le viewer:

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

Les fichiers TravelNotesViewer.min.css et TravelNotesViewer.min.js ainsi que les fichiers JSON
de configuration se trouvent dans le sous-répertoire "viewer".

<a id="Translations"></a>
## Traductions

Travel & Notes est traduit en 'fr' et en 'en'. Si vous désirez traduire Travel & Notes dans une autre 
langue, copiez le fichier TravelNotesEN.json et renommez-le en fonction de la langue utilisée. Ensuite,
éditez ce fichier et traduisez toutes les lignes msgstr dans la langue souhaitée.
Pour charger Travel & Notes dans une autre langue, ajoutez à l'url lng= et la langue à utiliser 
(exemple pour utiliser Travel & Notes en en: https://wwwouaiebe.github.io/leaflet.TravelNotes/?lng=en.

L'organisation de ces fichiers est la plus proche possible de celle de 
[GNU getText](https://en.wikipedia.org/wiki/Gettext)

<a id="Plugins"></a>
## Plugins

Pour utiliser un plugin, chargez simplement celui-ci à partir de la page html en utilisant 
le tag <script>