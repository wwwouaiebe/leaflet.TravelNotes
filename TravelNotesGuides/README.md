# Travel & Notes documentation 

<a href="#fr" >Vers la version française</a>

## Guides

[User guide - en ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/UserGuideEN.md)

[Installation guide - en ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/InstallationGuideEN.md)

## Demo

[Demo - en ](https://wwwouaiebe.github.io/leaflet.TravelNotes/?lng=en)

__Warning__ : This demo uses OSRM demo server. See https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server for conditions. 
Due to heavy traffic on this server, you can frequently receive an http error 429. 

If you have a Mapbox, GraphHopper or OpenRouteService API key, you can also use this demo with Mapbox, GraphHopper and/or OpenRouteService. 
Simply add your API key via the access key management dialog (button: key: on the toolbar at the top of the control).

And with Mapbox, GraphHopper and OpenRouteService, you can search a route for car, bike or pedestrian.

see also the [demo](https://wwwouaiebe.github.io/leaflet.TravelNotes/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlL1N0YXRpb25Ub1lvdXRoSG9zdGVsLnRydg==).
This demo displays a travel with a route and some icons and without any control, so the user cannot modify the travel.

Other samples:

[An excerpt from my last bike trip from Dover to Chester](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL1VLMjAxOS9VSzIwMTkudHJ2) 

[A train, bus and bicycle trip from Liège to Tromsø](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlLVRyb21zw7gvc3VvbWkyMDE4MDYwOC50cnY=)

[And the roadbook from Liège to Tromsø](https://wwwouaiebe.github.io/samples/Liege-Tromsø/suomi20180608-Roadbook.html)
  
## Releases and branches

### gh-pages branch

The [gh-pages branch](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages) is the last stable version. 
This branch contains all the needed files to run Travel & Notes, but not the sources.
  
### v1.6.0 branch

The [v1.6.0 branch](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/v1.6.0) contains the source files of the last stable version.

### master branch

The [master branch](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/master) is the development branch and is unstable. 

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

<a id="fr" />

## Guides

[Guide pour les utilisateurs - fr ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/GuideUtilisateurFR.md)

[Guide d'installation - fr ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/GuideInstallationFR.md)


[Demo - fr ](https://wwwouaiebe.github.io/leaflet.TravelNotes/?)

__Avertissement__ : cette démo utilise le serveur de démo de OSRM. Voyez la page https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server pour les conditions d'utilisation. 
Suite à un trafic important sur ce serveur, vous pouvez fréquemment recevoir une erreur http 429.

Si vous disposez d'une API key pour Mapbox, GraphHopper ou OpenRouteService, vous pouvez également utiliser cette démo avec Mapbox, GraphHopper et / ou OpenRouteService.
Ajoutez simplement votre API key via la boite de dialogue de gestion des clefs d'accès ( bouton :key: sur la barre d'outils en haut du contrôle ).

Et avec Mapbox, Graphhopper et OpenRouteService, vous pouvez rechercher un trajet pour une voiture, un vélo ou un piéton.

Voyez aussi la [démo](https://wwwouaiebe.github.io/leaflet.TravelNotes/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlL1N0YXRpb25Ub1lvdXRoSG9zdGVsLnRydg==)
qui affiche un voyage avec un trajet et des icônes, sans aucun contrôle, et donc sans possibilité de modifications.

D'autres exemples:

[Un extrait de mon dernier voyage en vélo de Dover à Chester](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL1VLMjAxOS9VSzIwMTkudHJ2) 

[Un voyage en train, bus et vélo de Liège à Tromsø](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlLVRyb21zw7gvc3VvbWkyMDE4MDYwOC50cnY=)

[Et le livre de voyage de Liège à Tromsø](https://wwwouaiebe.github.io/samples/Liege-Tromsø/suomi20180608-Roadbook.html)

## Versions et branches

### branche gh-pages

La [branche gh-pages](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages) est la dernière version stable.
Cette branche contient tous les fichiers nécessaires pour utiliser Travel & Notes, mais ne contient pas les sources.

### branche v1.6.0

La [branche v1.6.0](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/v1.6.0) contient les sources de la dernière version stable.

### branche master

La [branche master](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/master) est la branche de développement et est instable.

### Quoi de neuf dans la version 1.6.0

- La gestion des clefs d'accès a été entièrement revue. Celle-ci se fait maintenant via une boite de dialogue et il est
possible de lire / sauver ces clefs d'accès depuis / vers un fichier protégé par mot de passe.
- L'affichage des erreurs a été amélioré
- Une barre d'outils permettant des gérer les fonds de cartes a été ajoutée.
- Un viewer léger a été créé. Celui-ci permet la visualisation d'un voyage sur un appareil ancien qui ne comprend pas
toutes les nouveautés de JavaScript

De nombreuses modifications techniques ont également été faites:
- Tout le code a été migré vers ES6 et utilise les modules ES6 au lieu de modules nodeJS
- eslint est utilisé pour vérifier la qualité du code
- toutes les boites de dialogue sont basées sur l'utilisation de Promise
- les mises à jour de l'interface utilisateur et de la carte se font via des events, ce qui réduit fortement
les dépendances dans le code.

