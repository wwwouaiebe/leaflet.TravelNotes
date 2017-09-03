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
			msgid : "ItineraryNotesEditorUI - Itinerary and notes",
			msgstr : "Itinéraire et notes"
		},
		{
			msgid : "ItineraryNotesEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "ItineraryNotesEditorUI - Hide",
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
			msgid : "RouteEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "RouteEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "RouteEditorUI - Waypoints",
			msgstr : "Points de passage&nbsp;:"
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
			msgid : "RoutesListEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "RoutesListEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "RoutesListEditorUI - Routes",
			msgstr : "Routes&nbsp;:"
		},
		{
			msgid : "RoutesListEditorUI - Route",
			msgstr : "Route"
		},
		{
			msgid : "RoutesListEditorUI - Reduce the list",
			msgstr : "Réduire"
		},
		{
			msgid : "RoutesListEditorUI - Expand the list",
			msgstr : "Étendre"
		},
		{
			msgid : "RoutesListEditorUI - New route",
			msgstr : "Nouvelle route"
		},
		{
			msgid : "RoutesListEditorUI - Delete all routes",
			msgstr : "Supprimer toutes les routes"
		},
		{
			msgid : "RoutesListEditorUI - ",
			msgstr : "xxx"
		},
		{
			msgid : "RoutesListEditorUI - ",
			msgstr : "xxx"
		},
		{
			msgid : "RoutesListEditorUI - ",
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
