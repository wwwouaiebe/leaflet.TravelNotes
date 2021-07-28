/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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

/*
Changes:
	- v1.12.0:
		- created
	- v1.13.0:
		- Issue ♯126 : Add a command "select as start/end/intermediate point" in the osmSearch context menu
		- Issue ♯128 : Unify osmSearch and notes icons and data
Doc reviewed 20200727
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file OsmSearchContextMenu.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OsmSearchContextMenu
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseContextMenu from '../contextMenus/BaseContextMenu.js';
import theNoteEditor from '../core/NoteEditor.js';
import Zoomer from '../core/Zoomer.js';
import theTranslator from '../UI/Translator.js';
import theWayPointEditor from '../core/WayPointEditor.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { LAT_LNG, INVALID_OBJ_ID } from '../util/Constants.js';

class OsmSearchContextMenu extends BaseContextMenu {

	#latLng = LAT_LNG.defaultValue;
	#osmElement = null;
	#geometry = null;

	constructor ( contextMenuEvent, parentDiv = null ) {
		super ( contextMenuEvent, parentDiv );
		this.#latLng = contextMenuEvent.originalEvent.latLng;
		this.#osmElement = contextMenuEvent.originalEvent.osmElement;
		this.#geometry = contextMenuEvent.originalEvent.geometry;
		this.menuItems =
		[
			{
				itemText : theTranslator.getText ( 'MapContextMenu - Select this point as start point' ),
				doAction :
					( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId )
					&&
					( LAT_LNG.defaultValue === theTravelNotesData.travel.editedRoute.wayPoints.first.lat )
			},
			{
				itemText : theTranslator.getText ( 'MapContextMenu - Select this point as way point' ),
				doAction : ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId )
			},
			{
				itemText : theTranslator.getText ( 'MapContextMenu - Select this point as end point' ),
				doAction :
					( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId )
					&&
					( LAT_LNG.defaultValue === theTravelNotesData.travel.editedRoute.wayPoints.last.lat )
			},
			{
				itemText : theTranslator.getText ( 'OsmSearchContextMenu - Create a route note with this result' ),
				doAction : true
			},
			{
				itemText : theTranslator.getText ( 'OsmSearchContextMenu - Create a travel note with this result' ),
				doAction : true
			},
			{
				itemText : theTranslator.getText (
					theNoteEditor.osmSearchNoteDialog
						?
						'OsmSearchContextMenu - Hide note dialog'
						:
						'OsmSearchContextMenu - Show note dialog'
				),
				doAction : true
			},
			{
				itemText : theTranslator.getText ( 'OsmSearchContextMenu - Zoom to this result' ),
				doAction : true
			}
		];
	}

	/* eslint-disable no-magic-numbers */

	doAction ( selectedItemObjId ) {
		switch ( selectedItemObjId ) {
		case 0 :
			theWayPointEditor.setStartPoint ( this.#latLng );
			break;
		case 1 :
			theWayPointEditor.addWayPoint ( this.#latLng );
			break;
		case 2 :
			theWayPointEditor.setEndPoint ( this.#latLng );
			break;
		case 3 :
			theNoteEditor.newSearchNote ( { osmElement : this.#osmElement, isTravelNote : false } );
			break;
		case 4 :
			theNoteEditor.newSearchNote ( { osmElement : this.#osmElement, isTravelNote : true } );
			break;
		case 5 :
			theNoteEditor.changeOsmSearchNoteDialog ( );
			break;
		case 6 :
			new Zoomer ( ).zoomToPoi (
				{
					latLng : this.#latLng,
					geometry : this.#geometry
				}
			);
			break;
		default :
			break;
		}
	}

	/* eslint-enable no-magic-numbers */

}

export default OsmSearchContextMenu;

/*
--- End of OsmSearchContextMenu.js file ---------------------------------------------------------------------------------------
*/