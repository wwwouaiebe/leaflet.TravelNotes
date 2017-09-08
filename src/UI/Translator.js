/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
This  program is free software;
you can redistribute it and/or modify it under the terms of the 
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

(function() {
	
	'use strict';

	var _Fr =
	[
		{
			msgid : "ContextMenu - close",
			msgstr : "Fermer"
		},
		{
			msgid : "ErrorEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "ErrorEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "ItineraryEditorUI - Itinerary and notes",
			msgstr : "Itinéraire et notes"
		},
		{
			msgid : "ItineraryEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "ItineraryEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "NoteCategory-Id01",
			msgstr : "A&#xe9;roport"
		},
		{
			msgid : "NoteCategory-Id02",
			msgstr : "Mont&#xe9;e"
		},
		{
			msgid : "NoteCategory-Id03",
			msgstr : "Distributeur de billets"
		},
		{
			msgid : "NoteCategory-Id04",
			msgstr : "Attention requise"
		},
		{
			msgid : "NoteCategory-Id05",
			msgstr : "V&#xe9;los admis"
		},
		{
			msgid : "NoteCategory-Id06",
			msgstr : "Autobus"
		},
		{
			msgid : "NoteCategory-Id07",
			msgstr : "Photo"
		},
		{
			msgid : "NoteCategory-Id08",
			msgstr : "Camping"
		},
		{
			msgid : "NoteCategory-Id09",
			msgstr : "Ferry"
		},
		{
			msgid : "NoteCategory-Id10",
			msgstr : "Auberge de jeunesse"
		},
		{
			msgid : "NoteCategory-Id11",
			msgstr : "Point d\'information"
		},
		{
			msgid : "NoteCategory-Id12",
			msgstr : "Parc national"
		},
		{
			msgid : "NoteCategory-Id13",
			msgstr : "V&#xe9;los mal vus"
		},
		{
			msgid : "NoteCategory-Id14",
			msgstr : "Parc r&#xe9;gional"
		},
		{
			msgid : "NoteCategory-Id15",
			msgstr : "Entretien v&#xe9;lo"
		},
		{
			msgid : "NoteCategory-Id16",
			msgstr : "Magasin"
		},
		{
			msgid : "NoteCategory-Id17",
			msgstr : "Aide"
		},
		{
			msgid : "NoteCategory-Id18",
			msgstr : "Stop"
		},
		{
			msgid : "NoteCategory-Id19",
			msgstr : "Table"
		},
		{
			msgid : "NoteCategory-Id20",
			msgstr : "Toilettes"
		},
		{
			msgid : "NoteCategory-Id21",
			msgstr : "Gare"
		},
		{
			msgid : "NoteCategory-Id22",
			msgstr : "Tunnel"
		},
		{
			msgid : "NoteCategory-Id23",
			msgstr : "Point d\'eau"
		},
		{
			msgid : "NoteCategory-Id24",
			msgstr : "Chambre d\'hotes"
		},
		{
			msgid : "NoteCategory-Id25",
			msgstr : "Cafetaria"
		},
		{
			msgid : "NoteCategory-Id26",
			msgstr : "Restaurant"
		},
		{
			msgid : "NoteCategory-Id27",
			msgstr : "H&#xf4;tel"
		},
		{
			msgid : "NoteCategory-Id28",
			msgstr : "D&#xe9;part"
		},
		{
			msgid : "NoteCategory-Id29",
			msgstr : "Entr&#xe9;e du ferry"
		},
		{
			msgid : "NoteCategory-Id30",
			msgstr : "Sortie du ferry"
		},
		{
			msgid : "NoteCategory-Id31",
			msgstr : "Continuer"
		},
		{
			msgid : "NoteCategory-Id32",
			msgstr : "Tourner l&#xe9;g&#xe8;rement &#xe0; gauche"
		},
		{
			msgid : "NoteCategory-Id33",
			msgstr : "Tourner &#xe0; gauche"
		},
		{
			msgid : "NoteCategory-Id34",
			msgstr : "Tourner fort &#xe0; gauche"
		},
		{
			msgid : "NoteCategory-Id35",
			msgstr : "Tourner l&#xe9;g&#xe8;rement &#xe0; droite"
		},
		{
			msgid : "NoteCategory-Id36",
			msgstr : "Tourner &#xe0; droite"
		},
		{
			msgid : "NoteCategory-Id37",
			msgstr : "Tourner fort &#xe0; droite"
		},
		{
			msgid : "NoteCategory-Id38",
			msgstr : "Point noeud v&#xe9;lo"
		},
		{
			msgid : "MapEditor - Distance",
			msgstr : "<span>Distance</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "MapEditor - Duration",
			msgstr : "<span>Temps</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "MapEditor - popup address",
			msgstr : "<span>Adresse</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "MapEditor - popup phone",
			msgstr : "<span>Téléphone</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "MapEditor - popup url",
			msgstr : "<span>Latitude</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "MapEditor - popup lng",
			msgstr : "<span>&nbsp;-&nbsp;Longitude</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "MapEditor - popup lat",
			msgstr : "<span>Lattitude</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "NoteDialog - Title",
			msgstr : "Note"
		},
		{
			msgid : "NoteDialog - IconHtmlContentTitle",
			msgstr : "Contenu de l'icône&nbsp;:"
		},
		{
			msgid : "NoteDialog - PopupContentTitle",
			msgstr : "Contenu du popup&nbsp;:"
		},
		{
			msgid : "NoteDialog - AdressTitle",
			msgstr : "Addresse&nbsp;:"
		},
		{
			msgid : "NoteDialog - LinkTitle",
			msgstr : "Lien&nbsp;:"
		},
		{
			msgid : "NoteDialog - PhoneTitle",
			msgstr : "Téléphone&nbsp:"
		},
		{
			msgid : "NoteDialog - TooltipTitle",
			msgstr : "Contenu du tooltip&nbsp;:"
		},
		{
			msgid : "NoteDialog - Standard icon",
			msgstr : "Icône standard"
		},
		{
			msgid : "NoteDialog - Personnel icon",
			msgstr : "Icône personnalisée"
		},
		{
			msgid : "NoteDialog - Choose an icon",
			msgstr : "Icône : "
		},
		{
			msgid : "NoteDialog - Icon width",
			msgstr : "Largeur : "
		},
		{
			msgid : "NoteDialog - Icon height",
			msgstr : "Hauteur : "
		},
		{
			msgid : "RouteEditor-Not possible to edit a route without a save or cancel",
			msgstr : "Il n'est pas possible d'éditer une route sans sauver ou abandonner les modifications"
		},
		{
			msgid : "RouteEditor - Select this point as start point",
			msgstr : "Sélectionner cet endroit comme point de départ"
		},
		{
			msgid : "RouteEditor - Select this point as way point",
			msgstr : "Sélectionner cet endroit comme point intermédiaire"
		},
		{
			msgid : "RouteEditor - Select this point as end point",
			msgstr : "Sélectionner cet endroit comme point de fin"
		},
		{
			msgid : "RouteEditor - Edit this route",
			msgstr : "Éditer cette route"
		},
		{
			msgid : "RouteEditor - Delete this route",
			msgstr : "Supprimer cette route"
		},
		{
			msgid : "RouteEditor - Save modifications on this route",
			msgstr : "Sauver les modifications"
		},
		{
			msgid : "RouteEditor - Cancel modifications on this route",
			msgstr : "Abandonner les modifications"
		},
		{
			msgid : "RouteEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "RouteEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "RouteEditorUI - Waypoints",
			msgstr : "Points de passage&nbsp;de la route:"
		},
		{
			msgid : "RouteEditorUI - Start",
			msgstr : "Départ"
		},
		{
			msgid : "RouteEditorUI - Via",
			msgstr : "Point de passage"
		},
		{
			msgid : "RouteEditorUI - End",
			msgstr : "Fin"
		},
		{
			msgid : "RouteEditorUI - Save",
			msgstr : "Sauver les modifications"
		},
		{
			msgid : "RouteEditorUI - Cancel",
			msgstr : "Abandonner les modifications"
		},
		{
			msgid : "RouteEditorUI - Invert waypoints",
			msgstr : "Inverser les points de passage"
		},
		{
			msgid : "RouteEditorUI - Add waypoint",
			msgstr : "Ajouter un point de passage"
		},
		{
			msgid : "RouteEditorUI - Delete all waypoints",
			msgstr : "Supprimer tous les points de passage"
		},
		{
			msgid : "RouteEditorUI - Reduce the list",
			msgstr : "Réduire"
		},
		{
			msgid : "RouteEditorUI - Expand the list",
			msgstr : "Étendre"
		},
		{
			msgid : "TravelEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "TravelEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "TravelEditorUI - Routes",
			msgstr : "Routes du voyage&nbsp;:"
		},
		{
			msgid : "TravelEditorUI - Route",
			msgstr : "Route"
		},
		{
			msgid : "TravelEditorUI - Reduce the list",
			msgstr : "Réduire"
		},
		{
			msgid : "TravelEditorUI - Expand the list",
			msgstr : "Étendre"
		},
		{
			msgid : "TravelEditorUI - New route",
			msgstr : "Nouvelle route"
		},
		{
			msgid : "TravelEditorUI - Delete all routes",
			msgstr : "Supprimer toutes les routes"
		},
		{
			msgid : "TravelEditorUI - Save travel",
			msgstr : "Sauver dans un fichier"
		},
		{
			msgid : "TravelEditorUI - Open travel",
			msgstr : "Ouvrir un fichier"
		},
		{
			msgid : "TravelEditorUI - Undo",
			msgstr : "Réouvrir une route supprimée"
		},
		{
			msgid : "TravelEditor - cannot remove an edited route",
			msgstr : "Il n'est pas possible de supprimer une route quand celle-ci est en cours d'édition"
		},
		{
			msgid : "TravelEditor - Not possible to save a travel without a save or cancel",
			msgstr : "Des données non sauvées sont présentes dans l'éditeur de route. Sauvez ou abandonnez celles-ci avant de sauver le voyage dans un fichier"
		},
		{
			msgid : "TravelEditorUI - Cancel travel",
			msgstr : "Abandonner ce voyage"
		},
		{
			msgid : "Utilities - day",
			msgstr : "jours"
		},
		{
			msgid : "Utilities - hour",
			msgstr : "h"
		},
		{
			msgid : "Utilities - minute",
			msgstr : "m"
		},
		{
			msgid : "Utilities - second",
			msgstr : "s"
		},
		{
			msgid : "TravelEditorUI - ",
			msgstr : "xxx"
		},
		{
			msgid : "TravelEditorUI - ",
			msgstr : "xxx"
		},
		{
			msgid : "TravelEditorUI - ",
			msgstr : "xxx"
		},

	];
	
	var _Translations = null;
	
	var getTranslator = function ( textId ) {
		if ( ! _Translations ) {
			_Translations = new Map ( );
			for ( var messageCounter = 0; messageCounter < _Fr.length; messageCounter ++ ) {
				_Translations.set ( _Fr [ messageCounter ].msgid, _Fr [ messageCounter ].msgstr );
			}
			_Translations.set ( 'Version', '1.0.0' );
		}
		return {
			getText : function ( textId ) { 
				var translation = _Translations.get ( textId );
				return translation === undefined ? textId : translation;
			}
		};
	};
	
	/* --- End of getNote function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTranslator;
	}

} ) ( );
