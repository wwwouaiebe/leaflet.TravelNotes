# Travel & Notes documentation 

<a href="#fr" >Vers la version française</a>

## Warning before installing and using version 2.0.0

Version 2.0.0 is a major release containing significant changes in travel files. Files made with a previous version are no 
longer fully compatible with this version and some data in the notes may be lost. See the 
[user guide - en](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/UserGuideEN.md#OpenFileWithV200)
how to convert files made with an earlier version.

## Guides

[User guide - en ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/UserGuideEN.md)

[Installation guide - en ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/en/InstallationGuideEN.md)

[JS code documentation](https://wwwouaiebe.github.io/leaflet.TravelNotes/TechDoc/ )

## Demo

[Demo - en ](https://wwwouaiebe.github.io/leaflet.TravelNotes/?lng=en)

If you have a Mapbox, Stadia Maps, GraphHopper or OpenRouteService API key, you can also use this demo with Mapbox, Stadia Maps, GraphHopper and/or OpenRouteService. 
Simply add your API key via the access key management dialog (button :key: on the toolbar at the top of the control).

Also see this [demo](https://wwwouaiebe.github.io/leaflet.TravelNotes/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlL1N0YXRpb25Ub1lvdXRoSG9zdGVsLnRydg==).
which displays a travel with a route and notes, without any edit box or interface, and therefore without the possibility of modifications.
And the same [demo](https://wwwouaiebe.github.io/samples/Liege/index.html) inside a web page

Other samples:

[An excerpt from my last bike trip from Dover to Chester](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL1VLMjAxOS9VSzIwMTkudHJ2) 

[The printed maps for the first route of Dover to Chester in a pdf file](https://wwwouaiebe.github.io/samples/UK2019/UK2019.pdf)

[A train, bus and bicycle trip from Liège to Tromsø](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlLVRyb21zby9zdW9taTIwMTgwNjA4LnRydg==)

[And the roadbook from Liège to Tromsø](https://wwwouaiebe.github.io/samples/Liege-Tromso/suomi20180608-Roadbook.pdf)
  
## Releases and branches

### gh-pages branch

The [gh-pages branch](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages) is the last stable version. 
This branch contains all the needed files to run Travel & Notes, but not the sources.
  
### v2.0.0 branch

The [v2.0.0 branch](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/v2.0.0) contains the source files of the last stable version.

### master branch

The [master branch](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/master) is the development branch and is unstable. 

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

<a id="fr" />

## Avertissement avant d'installer et utiliser la version 2.0.0

La version 2.0.0 est une version majeure contenant des changements importants dans les fichiers de voyage. Les fichiers réalisés avec une version précédente ne sont plus entièrement compatibles avec cette version 
et quelques données présentes dans les notes peuvent être perdues. Voyez dans le [guide pour les utilisateurs - fr](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/GuideUtilisateurFR.md#OpenFileWithV200) 
comment convertir des fichiers réalisés avec une version antérieure.

## Guides

[Guide pour les utilisateurs - fr ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/GuideUtilisateurFR.md)

[Guide d'installation - fr ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/GuideInstallationFR.md)

[Documentation du code JS](https://wwwouaiebe.github.io/leaflet.TravelNotes/TechDoc/)

## Démo

[Demo - fr ](https://wwwouaiebe.github.io/leaflet.TravelNotes/?)

Si vous disposez d'une API key pour Mapbox, Stadia Maps, GraphHopper ou OpenRouteService, vous pouvez également utiliser cette démo avec Mapbox, Stadia Maps, GraphHopper et / ou OpenRouteService.
Ajoutez simplement votre API key via la boite de dialogue de gestion des clefs d'accès ( bouton :key: sur la barre d'outils en haut du contrôle ).

Voyez aussi cette [démo](https://wwwouaiebe.github.io/leaflet.TravelNotes/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlL1N0YXRpb25Ub1lvdXRoSG9zdGVsLnRydg==)
qui affiche un voyage avec un trajet et des notes, sans aucune boite d'édition ou interface, et donc sans possibilité de modifications.

Et la même [démo](https://wwwouaiebe.github.io/samples/Liege/index.html) intégrée dans une page web

D'autres exemples:

[Un extrait de mon dernier voyage en vélo de Dover à Chester](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL1VLMjAxOS9VSzIwMTkudHJ2) 

[Les cartes imprimées dans un pdf du premier trajet de Dover à Chester](https://wwwouaiebe.github.io/samples/UK2019/UK2019.pdf)

[Un voyage en train, bus et vélo de Liège à Tromsø](https://wwwouaiebe.github.io/leaflet.TravelNotes/viewer/?fil=aHR0cHM6Ly93d3dvdWFpZWJlLmdpdGh1Yi5pby9zYW1wbGVzL0xpZWdlLVRyb21zby9zdW9taTIwMTgwNjA4LnRydg==)

[Et le livre de voyage de Liège à Tromsø](https://wwwouaiebe.github.io/samples/Liege-Tromso/suomi20180608-Roadbook.pdf)

## Versions et branches

### branche gh-pages

La [branche gh-pages](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages) est la dernière version stable.
Cette branche contient tous les fichiers nécessaires pour utiliser Travel & Notes, mais ne contient pas les sources.

### branche v2.0.0

La [branche v2.0.0](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/v2.0.0) contient les sources de la dernière version stable.

### branche master

La [branche master](https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/master) est la branche de développement et est instable.

## Quoi de neuf

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

### Quoi de neuf dans la version 1.11.0

- Les notes de trajet prédéfinie "Icône SVG depuis OSM" ont été améliorées pour les entrées et sorties des rond-points
- Il est possible de créer une note pour toutes les manoeuvres d'un trajet en une opération
- L'affichage des erreurs lors de la lecture du fichier "APIKeys" a été amélioré
- Quelques bugs sont corrigés ( Issues #113, #115, #116, #117 et #118)

### Quoi de neuf dans la version 1.12.0

- L'interface utilisateur a été modifiée. Consultez le [guide pour les utilisateurs - fr ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/GuideUtilisateurFR.md).
- Toutes les commandes sont uniformisées. Chaque objet (carte, route, note, point de passage, manoeuvre) est créé, modifié ou supprimé via des commandes
dans des menus contextuels qui sont disponibles sur la carte ou dans l'interface utilisateur.
- Les performances sont améliorées. L'utilisation de la mémoire a fortement diminué et les temps de chargement réduits. Cela est particulièrement sensible pour de longs voyages.
- [Tout le code est documenté](https://wwwouaiebe.github.io/leaflet.TravelNotes/TechDoc/)

### Quoi de neuf dans la version 1.13.0

- Il est possible de rechercher des points d'intérêt dans OpenStreetMap.
- Des notes peuvent être créées à partir des résultats de recherche dans OpenStreetMap.
- De nouvelles notes prédéfinies ont été ajoutées. Il y a maintenant plus de 70 notes prédéfinies.
- L'arrière-plan des notes peut être transparent.
- Toutes les icônes des notes prédéfinies sont désormais en svg.

### Quoi de neuf dans la version 2.0.0

Pour éviter des [attaques xss](https://fr.wikipedia.org/wiki/Cross-site_scripting), notamment lors de l'échange de fichiers, toute la sécurité de l'apps a été revue, 
ce qui entraine un certain nombre de limitations et de modifications:
- [Content Security Policy](https://developer.mozilla.org/fr/docs/Web/HTTP/CSP) est activé par défaut via une balise &lt;meta&gt; dans le fichier index.html. 
Grâce à cela, il n'est plus possible d'exécuter du javascript depuis un autre site que celui où est installé Travel & Notes, d'exécuter des scripts en inline 
dans le html ni de télécharger des images ou des fichiers depuis un autre site.
Si vous en avez la possibilité, il est cependant préférable d'activer Content Securty Policy via un header installé par le serveur plutôt que via une balise &lt;meta&gt;.
- les balises html pouvant être utilisées lors de la création des notes sont restreintes, de même que les attributs attachés à ces balises html.
Consultez le [guide pour les utilisateurs - fr ](https://github.com/wwwouaiebe/leaflet.TravelNotes/blob/gh-pages/TravelNotesGuides/fr/GuideUtilisateurFR.md#AddHtmltext).
- lors de l'ouverture d'un fichier de voyage réalisé avec une version antérieure, toutes les balises et les attributs non autorisés sont effacé·e·s.
- afin d'éviter une attaque xss via un lien envoyé par mail, il n'est plus possible d'ouvrir automatiquement un fichier de voyage via l'url de l'apps quand ce fichier
de voyage provient d'un autre site, même si Content Security Policy est complètement désactivé.
- il n'est plus possible de définir des styles en inline. Si vous désirez créer un style personnalisé, il faut le créer dans un fichier css et importer celui-ci
avec une balise &lt;link&gt;
- il n'est évidemment plus possible d'utiliser une balise &lt;script&gt; ni aucun gestionnaire d'événements attaché à une balise html (onmouseover, onclick...).
- les liens présents dans les attributs href et src doivent être corrects et complets. Dans un attribut src, le protocole ne peut être que https: (et http: si l'apps
est installée sur un site http:). Dans les attributs href, le protocole doit être http:, https:, mailto:, sms: ou tel:. En outre, les liens sms: et tel: doivent commencer par
un + et ne peuvent comprendre que les caractères #, * espace et des chiffres de 0 à 9.
- il n'est plus possible d'entrer les clefs API des fournisseurs de service via des paramètres de l'url.

En outre, les améliorations suivantes on été apportées:
- les icônes SVG depuis OSM contiennent le numéro du point-noeud lorsque l'icône se trouve sur ce point-noeud et que l'itinéraire est calculé pour un vélo (N.B. les 
points-noeuds sont une particularité des itinéraires vélo en Belgique, aux Pays-Bas et partiellement en Allemagne).
- il est nécessaire de nommer le voyage avant de pouvoir sauver celui-ci dans un fichier
- une solution temporaire a été créée pour contourner les erreurs de noms de commune retournés par Nominatim.
- une prévisualisation de la note en cours d'édition a été ajoutée à la boite d'édition des notes.
- il est possible de cacher ou activer certaines parties de cette même boite d'édition.