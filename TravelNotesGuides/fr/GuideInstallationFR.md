# Travel & Notes - Guide d'installation

## Où installer Travel & Notes?

Pour des raisons de sécurité, il n'est plus possible d'utiliser Travel & Notes depuis le disque d'un 
ordinateur. Il est indispensable de passer par l'intermédiaire soit d'un serveur web soit distant, soit
d'un serveur web local de type LAMP or MAMP.

### Guide d'installation pour les null

Pas de grandes connaissances informatiques? Si la démo vous convient, vous pouvez télécharger celle-ci 
en vous rendant dans la branche gh-pages.
Encore trop compliqué? suivez directement ce 
[lien](https://github.com/wwwouaiebe/leaflet.TravelNotes/archive/gh-pages.zip)
 qui vous permet de télécharger la démo. Ouvrez le fichier zip et installez son contenu dans 
 un répertoire sur votre serveur et ouvrez le fichier index.html. That's all :-).

### Guide d'installation pour les geeks

#### Que faut-il faire dans le fichier HTML?

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

#### Quelques explications complémentaires sur le Javascript

##### L.travelNotes

Cet objet permet de communiquer avec TravelNotes à partir de Javascript

##### Méthodes de L.travelNotes

__addProvider ( provider )__

Cette méthode est utilisée uniquement par les plugins

__addMapContextMenu ( leftButton, rightButton )__

Cette méthode ajoute les menus contextuels gauche et droit

Paramètres :

- leftButton : quand ce paramètre est true, un menu contextuel est affiché quand un clic gauche 
est fait sur la carte
- rightButton : quand ce paramètre est true, un menu contextuel est affiché quand un clic droit 
est fait sur la carte

##### Propriétés de L.travelNotes

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

-__map__ : renvoie une référence vers l'objet leaflet map

#### Le fichier TravelNotesConfig.json

Ce fichier permet de modifier certains comportements de TravelNotes. Soyez prudents quand vous 
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

#### Le contenu du fichier TravelNotesNoteDialog.json

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

#### Le contenu du fichier de configuration pouvant être chargé avec le bouton &#x23CD;

L'organisation de ce fichier est identique au fichier TravelNotesNoteDialog.json

### Traductions

Travel & Notes est traduit en 'fr' et en 'en'. Si vous désirez traduire Travel & Notes dans une autre 
langue, copiez le fichier TravelNotesEN.json et renommez-le en fonction de la langue utilisée. Ensuite,
éditez ce fichier et traduisez toutes les lignes msgstr dans la langue souhaitée.
Pour charger Travel & Notes dans une autre langue, ajoutez à l'url lng= et la langue à utiliser 
(exemple pour utiliser Travel & Notes en en: https://wwwouaiebe.github.io/leaflet.TravelNotes/?lng=en.

L'organisation de ces fichiers est la plus proche possible de celle de 
[GNU getText](https://en.wikipedia.org/wiki/Gettext)

### Plugins

Pour utiliser un plugin, chargez simplement celui-ci à partir de la page html en utilisant 
le tag <script>