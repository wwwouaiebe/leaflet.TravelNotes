# Travel & Notes

## Guide de l'utilisateur

### Pourquoi Travel & Notes

Je pars de temps en temps en voyage en vélo pour plusieurs semaines, parfois dans des régions isolées. Ce genre de voyage ne s'improvise pas, même si il y a
toujours une part d'imprévu. Il me fallait un outil pour préparer mon itinéraire à partir de la carte et pouvoir y ajouter des notes.

Oui, je sais, il y a des tas d'applications qui permettent de faire un itinéraire d'un point à un autre, mais aucune ne me donne vraiment satisfaction: 
je ne cherche pas souvent le trajet le plus court - parfois il s'agit même d'un trajet circulaire - et en général on est limité à quelques centaines 
de kilomètres.

En final , il est aussi important de pouvoir enrégistrer ce qui a été préparé car cela ne se fait pas en quelques minutes.Il faut aussi pouvoir imprimer le résultat. Dans
certaines région isolées, il n'y a pas toujours de réseau mobile ni de possibilité de recharger une batterie. Une bonne vieille copie papier est souvent précieuse.

### Quelques explications sur les termes utilisés

Un **trajet** relie deux points. Sur la carte, il est représenté par une ligne continue.

Un **voyage** est constitué de un ou plusieurs trajets. Ceux-ci ne doivent pas obligatoirement se toucher à leur extrémités. Il peut également y avoir plus de deux trajets
partant d'un même point.

Dans un voyage, certains trajets peuvent être **chainés** entre eux. Dans ce cas les différents trajets chainés seront considérés comme n'en faisant qu'un seul pour le calcul des distances. Une seule chaine
peut-être créée par voyage, mais il n'est pas obligatoire que tous les trajets soient inclus dans la chaine.

Une **note** est un ensemble d'informations qui concerne un point précis sur la carte ou sur un trajet. Une note est composée d'une icône, d'un 'tooltip', d'un texte libre, d'une adresse et d'un numéro de téléphone.
Aucune de ces informations n'est obligatoire, à l'exception de l'icône, qui est utilisée pour représenter la note sur la carte. Cette icône peut être une image, une photo, un texte...

Le **livre de voyage** est une page HTML qui regroupe toute l'information du voyage: les notes, les trajets et la description de ceux-ci.

### Avant de commencer à utiliser Travel & Notes

Travel & Notes ne calcule pas lui-même les itinéraires des trajets. Il se connecte chez un fournisseur d'itinéraires pour obtenir ce trajet. Les différents fournisseurs d'itinéraire qu'il est possible d'utiliser actuellement
sont GraphHopper, Mapbox et Mapzen. Il est également possible d'utiliser OSRM, mais pour l'instant le serveur OSRM est hors service.

Pour GraphHopper, Mapbox et Mapzen il est nécessaire de posséder une clef d'accès ( **API Key** ) pour se connecter au serveur. Consultez les sites internet de ces différents fournisseurs pour obtenir une clef d'accès.

Vous devez également lire correctement  les conditions d'utilisation des clefs d'accès et vérifier que ce que vous faites avec Travel & Notes correspond à ces conditions d'utilisation.

Vous êtes également responsable de l'utilisation qui est faite de vos clefs d'accès. N'oubliez pas qu'il peut y avoir une facturation qui est faite sur la base de ces clefs d'accès. Ne les donnez pas à n'importe qui 
ni ne les laissez pas trainer n'importe où.

#### Comment introduire vos clefs d'accès dans Travel & Notes

Le seul moyen d'introduire les clefs d'accès dans Travel & Notes est de mettre celles-ci à la fin de l'url de la page web chargeant Travel & Notes: vous devez introduire un ? suivi du nom du fournisseur suivi de ProviderKey
suivi de = suivi de votre clef d'accès. Plsieurs clef d'accès peuvent être introduites simultanément en les séparants par un &.

Exemple:
```
https://www.example.org/TravelNotes/?MapboxProviderKey=votre_clef_accessMapbox&MapzenProviderKey=votre_clef_access_Mapzen&GraphHopperProviderKey=votre_clef_acces_GraphHopper
```

Les clefs d'accès sont sauvegardées dans le _sessionStorage_ du browser. Il n'est donc pas nécessaire de les réintroduire lors de chaque rafraichissement de la page. Cependant, elles sont définitivement effacées 
lors de la fermeture du browser

Dès que Travel & Notes détecte des clefs d'accès dans l'url, celles-ci sont enrégistrées dans le _sessionStorage_ et effacée de l'url. Elles ne sont donc plus visibles à l'écran.
**Cependant, rappelez-vous qu'une personne mal intentionnée peut toujours les retrouver dans l'historique du navigateur**, à moins que vous n'utilisiez le mode navigation privée de votre browser.

### Interface

Lorsque la carte s'affiche, seul un petit rectangle noir est est visible dans le coin supérieur de la carte:

<img src="MinInterface.PNG" />

Déplacez la souris sur ce rectangle pour voir l'interface complète:

<img src="InterfaceFR.PNG" />

Si vous désirez que l'interface soie toujours visible, cliquez sur le bouton &#x274c;