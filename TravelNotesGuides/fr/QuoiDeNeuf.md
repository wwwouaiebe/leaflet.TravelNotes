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

### Quoi de neuf dans la version 2.1.0

La version 2.1.0. est avant tout une version contenant des changements pour les dévelopeurs:
- tous les repositories de plugins on été fusionnés dans TravelNotes et il n'y a donc plus qu'un seul repository. Grâce à celà,
les tailles de certains plugins ont été considérablement réduites.
- @mapbox\polyline n'est plus utilisé pour la compression des données et a été remplacé par un dévelopement 
interne, ce qui permet également de réduire fortement la taille des fichiers de donnée..
