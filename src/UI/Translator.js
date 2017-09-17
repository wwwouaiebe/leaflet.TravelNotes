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
			msgid : "AboutDialog - Title",
			msgstr : "À propos de Travel & Notes"
		},
		{
			msgid : "ColorDialog - Title",
			msgstr : "Couleurs"
		},
		{
			msgid : "ColorDialog - red",
			msgstr : "Rouge"
		},
		{
			msgid : "ColorDialog - green",
			msgstr : "Vert"
		},
		{
			msgid : "ColorDialog - blue",
			msgstr : "Bleu"
		},
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
			msgid : "HTMLViewsFactory - ToNextInstruction",
			msgstr : "Jusqu'à la prochaine instruction&nbsp;:&nbsp;{distance}&nbsp;-&nbsp;{duration}"
		},
		{
			msgid : "HTMLViewsFactory - Distance",
			msgstr : ":"
		},
		{
			msgid : "HTMLViewsFactory - Time",
			msgstr : "-"
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
			msgstr : "Adresse&nbsp;:"
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
			msgid : "NoteEditor - new travel note",
			msgstr : "Ajouter une note"
		},
		{
			msgid : "NoteEditor - edit note",
			msgstr : "Éditer cette note"
		},
		{
			msgid : "NoteEditor - delete note",
			msgstr : "Effacer cette note"
		},
		{
			msgid : "NoteEditor - zoom to travel",
			msgstr : "Zoom sur le voyage"
		},
		{
			msgid : "NoteEditor - About",
			msgstr : "À propos de Travel & Notes"
		},
		{
			msgid : "NoteEditor - address",
			msgstr : "<span>Adresse</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "NoteEditor - phone",
			msgstr : "<span>Téléphone</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "NoteEditor - url",
			msgstr : "<span>Url</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "NoteEditor - latlng",
			msgstr : "<span>Latitude</span>&nbsp;:&nbsp;{lat}&nbsp;-&nbsp;<span>Longitude</span>&nbsp;:&nbsp;{lng}"
		},
		{
			msgid : "NoteEditor - distance",
			msgstr : "<span>Distance</span>&nbsp;:&nbsp;{distance}"
		},
		{
			msgid : "Notedialog - empty icon content",
			msgstr : "Le contenu de l'icône doit être complété."
		},
		{
			msgid : "RouteEditor - Distance",
			msgstr : "<span>Distance</span>&nbsp;:&nbsp;{distance}"
		},
		{
			msgid : "RouteEditor - Duration",
			msgstr : "<span>Temps</span>&nbsp;:&nbsp;{duration}"
		},
		{
			msgid : "RouteEditor-Not possible to edit a route without a save or cancel",
			msgstr : "Il n'est pas possible d'éditer une route sans sauver ou abandonner les modifications"
		},
		{
			msgid : "RouteEditor - Add a note on the route",
			msgstr : "Ajouter une note à ce trajet"
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
			msgid : "RouteEditor - Properties",
			msgstr : "Propriétés"
		},
		{
			msgid : "RouteEditor - Zoom to route",
			msgstr : "Zoom sur le trajet"
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
			msgid : "RoutePropertiesDialog - Title",
			msgstr : "Propriétés du trajet"
		},
		{
			msgid : "RoutePropertiesDialog - Width",
			msgstr : "Largeur : "
		},
		{
			msgid : "RoutePropertiesDialog - Chain",
			msgstr : "Trajet&nbsp;chaîné"
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
			msgstr : "min"
		},
		{
			msgid : "Utilities - second",
			msgstr : "sec"
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
			getText : function ( textId , params ) { 
				var translation = _Translations.get ( textId );
				if ( params && translation ) {
					Object.getOwnPropertyNames ( params ).forEach (
						function ( propertyName ) {
							translation = translation.replace ( '{' + propertyName + '}' , params [ propertyName ] ); 
						}
					);
				}
				
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
