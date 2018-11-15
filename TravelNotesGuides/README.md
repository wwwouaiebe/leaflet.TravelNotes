# Travel & Notes documentation 

## Guides

[User guide - en ](en/UserGuideEN.md)

[Installation guide - en ](en/InstallationGuideEN.md)

[Guide pour les utilisateurs - fr ](fr/GuideUtilisateurFR.md)

[Guide d'installation - fr ](fr/GuideInstallationFR.md)

## Demo

[Demo - en ](https://wwwouaiebe.github.io/leaflet.TravelNotes/?lng=en)

__Warning__ : This demo uses OSRM demo server. See https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server for conditions. 
Due to heavy traffic on this server, you can frequently receive an http error 429. 

If you have a Mapbox or GraphHopper API key, you can also use this demo with Mapbox and/or GraphHopper. 
Simply add MapboxProviderKey=your_Mapbox_API_key and/or GraphHopperProviderKey=your_GraphHopper_API_key to the demo url: https://wwwouaiebe.github.io/leaflet.TravelNotes/?MapboxProviderKey=your_mapbox_API_key&GraphHopperProviderKey=your_GraphHopper_API_key .

And with Mapbox and GraphHopper, you can search a route for car, bike or pedestrian.

see also the [demo](https://wwwouaiebe.github.io/leaflet.TravelNotes/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGUudHJ2).  This demo displays a travel with a route and two icons
and without any control, so the user cannot modify the travel.

[Demo - fr ](https://wwwouaiebe.github.io/leaflet.TravelNotes/?)

__Avertissement__ : cette démo utilise le serveur de démo de OSRM. Voyez la page https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server pour les conditions d'utilisation. 
Suite à un traffic important sur ce serveur, vous pouvez fréquemment recevoir une erreur http 429.

Si vous disposez d'une API key pour Mapbox ou GraphHopper, vous pouvez également utiliser cette démo avec Mapbox ou GraphHopper.
Ajoutez simplement MapboxProviderKey=votre_API_key_Mapbox et/ou GraphHopperProviderKey=votre_API_key_GraphHopper à l'url de la démo: https://wwwouaiebe.github.io/leaflet.TravelNotes/?MapboxProviderKey=votre_API_key_Mapbox&GraphHopperProviderKey=votre_API_key_GraphHopper .

Et avec Mapbox et Graphhopper, vous pouvez rechercher un trajet pour une voiture, un vélo ou un piéton.

Voyez aussi la [démo](https://wwwouaiebe.github.io/leaflet.TravelNotes/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGUudHJ2) qui affiche un voyage avec un trajet et des icônes, sans aucun contrôle, et donc sans possibilité de modifications.

## What's new in release 1.3.0

- Working now with Promise at startup and plugins
- New plugin for trains
- new property baseDialog for L.TravelNotesInterface ( )