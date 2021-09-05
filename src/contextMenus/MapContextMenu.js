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
	- v1.6.0:
		- created
		- Issue ♯69 : ContextMenu and ContextMenuFactory are unclear.
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MapContextMenu.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module contextMenus
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseContextMenu from '../contextMenus/BaseContextMenu.js';
import theWayPointEditor from '../core/WayPointEditor.js';
import theTranslator from '../UILib/Translator.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theNoteEditor from '../core/NoteEditor.js';
import theRouteEditor from '../core/RouteEditor.js';
import AboutDialog from '../dialogs/AboutDialog.js';
import Zoomer from '../core/Zoomer.js';

import { LAT_LNG, INVALID_OBJ_ID } from '../main/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class MapContextMenu
@classdesc this class implements the BaseContextMenu class for the map
@extends BaseContextMenu
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class MapContextMenu extends BaseContextMenu {

	#latLng = LAT_LNG.defaultValue;

	/*
	constructor
	@param {Event} contextMenuEvent. The event that have triggered the menu
	@param {Object} parentNode The parent node of the menu. Can be null for leaflet objects
	*/

	constructor ( contextMenuEvent, parentNode = null ) {
		super ( contextMenuEvent, parentNode );
		this.#latLng = [ this.eventData.lat, this.eventData.lng ];
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
			theRouteEditor.addRoute ( );
			break;
		case 4 :
			theRouteEditor.hideRoutes ( );
			break;
		case 5 :
			theRouteEditor.showRoutes ( );
			break;
		case 6 :
			theNoteEditor.newTravelNote ( this.#latLng );
			break;
		case 7 :
			theNoteEditor.hideNotes ( );
			break;
		case 8 :
			theNoteEditor.showNotes ( );
			break;
		case 9 :
			new Zoomer ( ).zoomToTravel ( );
			break;
		case 10 :
			new AboutDialog ( ).show ( )
				.catch ( ( ) => {} );
			break;
		default :
			break;
		}
	}

	/* eslint-enable no-magic-numbers */

	get menuItems ( ) {
		return [
			{
				itemText : theTranslator.getText ( 'MapContextMenu - Select this point as start point' ),
				isActive :
					( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId )
					&&
					( LAT_LNG.defaultValue === theTravelNotesData.travel.editedRoute.wayPoints.first.lat )
			},
			{
				itemText : theTranslator.getText ( 'MapContextMenu - Select this point as way point' ),
				isActive : ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId )
			},
			{
				itemText : theTranslator.getText ( 'MapContextMenu - Select this point as end point' ),
				isActive :
					( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId )
					&&
					( LAT_LNG.defaultValue === theTravelNotesData.travel.editedRoute.wayPoints.last.lat )
			},
			{
				itemText : theTranslator.getText ( 'MapContextMenu - Add a route' ),
				isActive : true
			},
			{
				itemText : theTranslator.getText ( 'MapContextMenu - Hide all routes' ),
				isActive : true
			},
			{
				itemText : theTranslator.getText ( 'MapContextMenu - Show all routes' ),
				isActive : true
			},
			{
				itemText : theTranslator.getText ( 'MapContextMenu - New travel note' ),
				isActive : true
			},
			{
				itemText : theTranslator.getText ( 'MapContextMenu - Hide all notes' ),
				isActive : true
			},
			{
				itemText : theTranslator.getText ( 'MapContextMenu - Show all notes' ),
				isActive : true
			},
			{
				itemText : theTranslator.getText ( 'MapContextMenu - Zoom to travel' ),
				isActive : true
			},
			{
				itemText : theTranslator.getText ( 'MapContextMenu - About Travel & Notes' ),
				isActive : true
			}
		];
	}
}

export default MapContextMenu;

/*
--- End of MapContextMenu.js file ---------------------------------------------------------------------------------------------
*/