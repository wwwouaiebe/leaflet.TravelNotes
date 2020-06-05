# Travel & Notes documentation 

<a href="#fr" >Vers la version française</a>

## Guides

[User guide - en ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/UserGuideEN.md)

[Installation guide - en ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/InstallationGuideEN.md)

## Demo

[Demo - en ](https://wwwouaiebe.github.io/leaflet.TravelNotes/?lng=en)

If you have a Mapbox, Stadia Maps, GraphHopper or OpenRouteService API key, you can also use this demo with Mapbox, Stadia Maps, GraphHopper and/or OpenRouteService. 
Simply add your API key via the access key management dialog (button :key: on the toolbar at the top of the control).

see also the [demo](https://wwwouaiebe.github.io/leaflet.TravelNotes/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlL1N0YXRpb25Ub1lvdXRoSG9zdGVsLnRydg==).
This demo displays a travel with a route and some icons and without any control, so the user cannot modify the travel.

Other samples:

[An excerpt from my last bike trip from Dover to Chester](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL1VLMjAxOS9VSzIwMTkudHJ2) 

[The maps for the first route of Dover to Chester](https://wwwouaiebe.github.io/samples/UK2019/UK2019.pdf)

[A train, bus and bicycle trip from Liège to Tromsø](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlLVRyb21zw7gvc3VvbWkyMDE4MDYwOC50cnY=)

[And the roadbook from Liège to Tromsø](https://wwwouaiebe.github.io/samples/Liege-Tromsø/suomi20180608-Roadbook.html)
  
## Releases and branches

### gh-pages branch

The [gh-pages branch](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages) is the last stable version. 
This branch contains all the needed files to run Travel & Notes, but not the sources.
  
### v1.10.0 branch

The [v1.10.0 branch](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/v1.10.0) contains the source files of the last stable version.

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

<a id="fr" />

## Guides

[Guide pour les utilisateurs - fr ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/GuideUtilisateurFR.md)

[Guide d'installation - fr ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/GuideInstallationFR.md)

## Démo

[Demo - fr ](https://wwwouaiebe.github.io/leaflet.TravelNotes/?)

Si vous disposez d'une API key pour Mapbox, Stadia Maps, GraphHopper ou OpenRouteService, vous pouvez également utiliser cette démo avec Mapbox, Stadia Maps, GraphHopper et / ou OpenRouteService.
Ajoutez simplement votre API key via la boite de dialogue de gestion des clefs d'accès ( bouton :key: sur la barre d'outils en haut du contrôle ).

Voyez aussi la [démo](https://wwwouaiebe.github.io/leaflet.TravelNotes/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlL1N0YXRpb25Ub1lvdXRoSG9zdGVsLnRydg==)
qui affiche un voyage avec un trajet et des icônes, sans aucun contrôle, et donc sans possibilité de modifications.

D'autres exemples:

[Un extrait de mon dernier voyage en vélo de Dover à Chester](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL1VLMjAxOS9VSzIwMTkudHJ2) 

[Les cartes du premier trajet de Dover à Chester](https://wwwouaiebe.github.io/samples/UK2019/UK2019.pdf)

[Un voyage en train, bus et vélo de Liège à Tromsø](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlLVRyb21zw7gvc3VvbWkyMDE4MDYwOC50cnY=)

[Et le livre de voyage de Liège à Tromsø](https://wwwouaiebe.github.io/samples/Liege-Tromsø/suomi20180608-Roadbook.html)

## Versions et branches

### branche gh-pages

La [branche gh-pages](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages) est la dernière version stable.
Cette branche contient tous les fichiers nécessaires pour utiliser Travel & Notes, mais ne contient pas les sources.

### branche v1.10.0

La [branche v1.10.0](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/v1.10.0) contient les sources de la dernière version stable.

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

### Quoi de neuf dans la version 1.7.0

- Lorsque OpenRouteService ou GraphHopper sont utilisés comme fournisseurs d'itinéraire, il est également possible d'afficher le profil de la route.
- Lorsque un trajet entre deux points est fait avec leaflet.TravelNotesPolyline ce trajet n'est plus représente sous forme de ligne droite,
mais bien sous forme d'un segment de grand cercle. Voir la documentation de [leaflet.TravelNotesPolyline](https://github.com/wwwouaiebe/leaflet.TravelNotesPolyline/blob/master/README.md)
- Il est également possible de tracer des cercles avec leaflet.TravelNotesPolyline. Voir la documentation de [leaflet.TravelNotesPolyline](https://github.com/wwwouaiebe/leaflet.TravelNotesPolyline/blob/master/README.md)

### Quoi de neuf dans la version 1.8.0

- Ajouter un point de passage à un trajet a été amélioré. Il suffit maintenant d'amener la souris sur le trajet pour voir apparaître un point de passage temporaire.
En faisant ensuite un glisser / déposer de celui-ci, le point de passage est ajouté au trajet.

### Quoi de neuf dans la version 1.9.0

- Il est maintenant possible d'imprimer les cartes d'un trajet.

### Quoi de neuf dans la version 1.10.0

- Un nouveau fournisseur de service, basé sur Mapzen Valhalla, a été ajouté: Stadia Maps
- Un bouton permettant de recharger les clefs d'accès a été ajouté dans la boite de dialogue de gestion des clefs d'accès
- Un message d'erreur est affiché quand un problème survient lors de la lecture du fichier des clefs d'accès
- Quelques bugs sont corrigés
