# Travel & Notes - Guide d'installation

## Où installer Travel & Notes?

Travel & Notes peut bien sûr être installé sur un serveur web. Il peut également être installé sur le disque d'un ordinateur et utilisé localement.

### Guide d'installation pour les null

Pas de grandes connaissances informatiques? Si la démo vous convient, vous pouvez télécharger celle-ci en vous rendant dans la branche gh-pages.
Encore trop compliqué? suivez directement ce [lien](https://github.com/wwwouaiebe/leaflet.TravelNotes/archive/gh-pages.zip) qui vous permet de télécharger la démo. 
Ouvrez le fichier zip et installez son contenu dans un répertoire sur votre PC ou sur votre serveur et ouvrez le fichier index.html. That's all :-).

### Qu'est ce qu'il faut faire dans le fichier HTML?

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



