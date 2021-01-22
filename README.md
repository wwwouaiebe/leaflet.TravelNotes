# Travel & Notes 

<a href="#fr" >Vers la version française</a>

# Travel & Notes 

Travel & Notes allows you to plan a trip from the map. You can :
- draw one or more routes on the map
- add notes to these different routes or to the trip
- search for points of interest in OpenStreetMap and create notes from these results
- save your work to a file and reopen it later for editing or viewing
- create a travel book containing the different itineraries and notes created
- print route maps
- export routes to gpx files
- display the trip in a web page.
- use different basemap

## Guides

[User guide - en ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/UserGuideEN.md)

[Installation guide - en ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/InstallationGuideEN.md)

[JS code documentation](https://wwwouaiebe.github.io/leaflet.TravelNotes/TechDoc/ )

## Demo

[Demo - en ](https://wwwouaiebe.github.io/leaflet.TravelNotes/?lng=en)

If you have a Mapbox, Stadia Maps, GraphHopper or OpenRouteService API key, you can also use this demo with Mapbox, Stadia Maps, GraphHopper and/or OpenRouteService. 
Simply add your API key via the access key management dialog (button 🔑 on the toolbar at the top of the control).

Also see this [demo](https://wwwouaiebe.github.io/leaflet.TravelNotes/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlL1N0YXRpb25Ub1lvdXRoSG9zdGVsLnRydg==).
which displays a travel with a route and notes, without any edit box or interface, and therefore without the possibility of modifications.
And the same [demo](https://wwwouaiebe.github.io/samples/Liege/index.html) inside a web page

Other samples:

[A great travel bike from Belgium to the North of Norway and return to Stockholm](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL25vcmQvMjAxNS0yMDE4LU5vcmQudHJ2) (Keep calm... 8000 km 2Mb)

[An excerpt from my last bike trip from Dover to Chester](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL1VLMjAxOS9VSzIwMTkudHJ2) 

[The printed maps for the first route of Dover to Chester in a pdf file](https://wwwouaiebe.github.io/samples/UK2019/UK2019.pdf)

[A train, bus and bicycle trip from Liège to Tromsø](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlLVRyb21zby9zdW9taTIwMTgwNjA4LnRydg==)

[And the roadbook from Liège to Tromsø](https://wwwouaiebe.github.io/samples/Liege-Tromso/suomi20180608-Roadbook.pdf)
  
## Releases and branches

### gh-pages branch

The [gh-pages branch](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages) is the last stable version. 
This branch contains all the needed files to run Travel & Notes, but not the sources.
  
### v2.1.0 branch

The [v2.1.0 branch](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/v2.1.0) contains the source files of the last stable version.

### master branch

The [master branch](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/master) is the development branch and is unstable. 

## Warning before installing and using version 2.0.0 or greater

Version 2.0.0 is a major release containing significant changes in travel files. Files made with a previous version are no 
longer fully compatible with this version and some data in the notes may be lost. See the 
[user guide - en](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/UserGuideEN.md#OpenFileWithV200)
how to convert files made with an earlier version.

## What's new in the last release

Version 2.1.0. is primarily a version containing changes for developers:
- all plugin repositories have been merged into TravelNotes and there is therefore only one repository. Thanks to that,
the sizes of some plugins have been reduced considerably.
- @mapbox\polyline is no longer used for data compression and has been replaced by an internal development
which also greatly reduces the size of the data files. 

For users, only a few minor bugs have been fixed.

For other versions, see the document ['What's new?' - en ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/WhatsNew.md)

<a id="fr" />

# Travel & Notes 

Travel & Notes vous permet de préparer un voyage à partir de la carte. Vous pouvez :
- tracer un ou plusieurs itinéraires sur la carte
- ajouter des notes à ces différents itinéraires ou au voyage
- faire des recherches de points d'intérets dans OpenStreetMap et créer des notes à partir de ces résultats
- sauvegarder votre travail dans un fichier et le réouvrir plus tard pour modifications ou consultation
- créer un livre de voyage reprenant les différents itinéraires et notes créées
- imprimer les cartes d'un itinéraire
- exporter les itinéraires vers des fichiers gpx
- afficher le voyage dans une page web.
- utiliser différents fond de carte

## Guides

[Guide pour les utilisateurs - fr ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/GuideUtilisateurFR.md)

[Guide d'installation - fr ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/GuideInstallationFR.md)

[Documentation du code JS](https://wwwouaiebe.github.io/leaflet.TravelNotes/TechDoc/)

## Démo

[Demo - fr ](https://wwwouaiebe.github.io/leaflet.TravelNotes/?)

Si vous disposez d'une API key pour Mapbox, Stadia Maps, GraphHopper ou OpenRouteService, vous pouvez également utiliser cette démo avec Mapbox, Stadia Maps, GraphHopper et / ou OpenRouteService.
Ajoutez simplement votre API key via la boite de dialogue de gestion des clefs d'accès ( bouton 🔑 sur la barre d'outils en haut du contrôle ).

Voyez aussi cette [démo](https://wwwouaiebe.github.io/leaflet.TravelNotes/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlL1N0YXRpb25Ub1lvdXRoSG9zdGVsLnRydg==)
qui affiche un voyage avec un trajet et des notes, sans aucune boite d'édition ou interface, et donc sans possibilité de modifications.

Et la même [démo](https://wwwouaiebe.github.io/samples/Liege/index.html) intégrée dans une page web

D'autres exemples:

[Un grand voyage en vélo depuis la Belgique jusqu'au Nord de la norvège et retour jusqu'à Stockholm](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL25vcmQvMjAxNS0yMDE4LU5vcmQudHJ2) (Patientez... 8000 km 2Mb)

[Un extrait de mon dernier voyage en vélo de Dover à Chester](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL1VLMjAxOS9VSzIwMTkudHJ2) 

[Les cartes imprimées dans un pdf du premier trajet de Dover à Chester](https://wwwouaiebe.github.io/samples/UK2019/UK2019.pdf)

[Un voyage en train, bus et vélo de Liège à Tromsø](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlLVRyb21zby9zdW9taTIwMTgwNjA4LnRydg==)

[Et le livre de voyage de Liège à Tromsø](https://wwwouaiebe.github.io/samples/Liege-Tromso/suomi20180608-Roadbook.pdf)

## Versions et branches

### branche gh-pages

La [branche gh-pages](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages) est la dernière version stable.
Cette branche contient tous les fichiers nécessaires pour utiliser Travel & Notes, mais ne contient pas les sources.

### branche v2.1.0

La [branche v2.1.0](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/v2.0.0) contient les sources de la dernière version stable.

### branche master

La [branche master](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/master) est la branche de développement et est instable.

## Avertissement avant d'installer et utiliser la version 2.0.0 ou une version supérieure à 2.0.0

La version 2.0.0 est une version majeure contenant des changements importants dans les fichiers de voyage. Les fichiers réalisés avec une version précédente ne sont plus entièrement compatibles avec cette version 
et quelques données présentes dans les notes peuvent être perdues. Voyez dans le [guide pour les utilisateurs - fr](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/GuideUtilisateurFR.md#OpenFileWithV200) 
comment convertir des fichiers réalisés avec une version antérieure.

## Quoi de neuf dans la dernière version

La version 2.1.0. est avant tout une version contenant des changements pour les dévelopeurs:
- tous les repositories de plugins on été fusionnés dans TravelNotes et il n'y a donc plus qu'un seul repository. Grâce à celà,
les tailles de certains plugins ont été considérablement réduites.
- @mapbox\polyline n'est plus utilisé pour la compression des données et a été remplacé par un dévelopement 
interne, ce qui permet également de réduire fortement la taille des fichiers de donnée..

Pour les utilisateurs, seuls quelques bugs mineurs ont été corrigés.

Pour les autres versions, reportez-vous au document ['quoi de neuf?' - fr ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/QuoiDeNeuf.md)
