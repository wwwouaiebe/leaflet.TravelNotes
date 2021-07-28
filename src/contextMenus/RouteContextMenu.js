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
	- v1.7.0:
		- Issue ♯89 : Add elevation graph
	- v1.8.0:
		- Issue ♯97 : Improve adding a new waypoint to a route
	- v1.9.0:
		- Issue ♯101 : Add a print command for a route
	- v1.11.0:
		- Issue ♯110 : Add a command to create a SVG icon from osm for each maneuver
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
Doc reviewed 20200727
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file RouteContextMenu.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module RouteContextMenu
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseContextMenu from '../contextMenus/BaseContextMenu.js';
import theConfig from '../data/Config.js';
import theNoteEditor from '../core/NoteEditor.js';
import theRouteEditor from '../core/RouteEditor.js';
import theWayPointEditor from '../core/WayPointEditor.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theTranslator from '../UI/Translator.js';
import Zoomer from '../core/Zoomer.js';
import theProfileWindowsManager from '../core/ProfileWindowsManager.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';

import { ROUTE_EDITION_STATUS, ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewRouteContextMenu
@desc constructor of RouteContextMenu objects
@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
When null, the body of the html page is selected
@return {RouteContextMenu} an instance of a RouteContextMenu object
@listens mouseenter mouseleave click keydown keypress keyup
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewRouteContextMenu ( contextMenuEvent, parentDiv ) {

	let myRouteObjId = contextMenuEvent.target.objId;
	let myRoute = theDataSearchEngine.getRoute ( myRouteObjId );
	let myZoomer = new Zoomer ( );

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetMenuItems
	@desc get an array with the menu items
	@return {array.<MenuItem>} the menu items
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetMenuItems ( ) {
		let menuItems = [
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'RouteContextMenu - Edit this route' ),
				action :
					(
						( myRouteObjId === theTravelNotesData.travel.editedRoute.objId )
						|| ( ROUTE_EDITION_STATUS.editedChanged === theTravelNotesData.travel.editedRoute.editionStatus )
					) ?
						null
						:
						theRouteEditor.editRoute,
				param : myRouteObjId
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'RouteContextMenu - Delete this route' ),
				action :
					(
						( myRouteObjId === theTravelNotesData.travel.editedRoute.objId )
						&&
						( ROUTE_EDITION_STATUS.editedChanged === theTravelNotesData.travel.editedRoute.editionStatus )
					)
						?
						null
						:
						theRouteEditor.removeRoute,
				param : myRouteObjId
			},
			myRoute.hidden
				?
				{
					context : theRouteEditor,
					name : theTranslator.getText ( 'RouteContextMenu - Show this route' ),
					action : theRouteEditor.showRoute,
					param : myRouteObjId
				}
				:
				{
					context : theRouteEditor,
					name : theTranslator.getText ( 'RouteContextMenu - Hide this route' ),
					action :
							( theTravelNotesData.travel.editedRoute.objId === myRouteObjId )
								?
								null :
								theRouteEditor.hideRoute,
					param : myRouteObjId
				},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'RouteContextMenu - Properties' ),
				action :
					myRoute.hidden
						?
						null
						:
						theRouteEditor.routeProperties,
				param : myRouteObjId
			},
			{
				context : myZoomer,
				name : theTranslator.getText ( 'RouteContextMenu - Zoom to route' ),
				action : myRoute.hidden ? null : myZoomer.zoomToRoute,
				param : myRouteObjId
			},
			{
				context : theProfileWindowsManager,
				name : theTranslator.getText ( 'RouteContextMenu - View the elevation' ),
				action :
					myRoute.itinerary.hasProfile
						?
						theProfileWindowsManager.showProfile
						:
						null,
				param : myRouteObjId
			}
		];
		if ( theConfig.printRouteMap.isEnabled ) {
			menuItems.push (
				{
					context : theRouteEditor,
					name : theTranslator.getText ( 'RouteContextMenu - Print route map' ),
					action : theRouteEditor.printRouteMap,
					param : myRouteObjId
				}
			);
		}
		menuItems = menuItems.concat (
			[
				{
					context : theRouteEditor,
					name : theTranslator.getText ( 'RouteContextMenu - Save this route in a GPX file' ),
					action : ( ZERO < myRoute.itinerary.itineraryPoints.length )
						?
						theRouteEditor.saveGpx
						:
						null,
					param : myRouteObjId
				},
				{
					context : theWayPointEditor,
					name : theTranslator.getText ( 'RouteContextMenu - Invert waypoints' ),
					action : ( theTravelNotesData.travel.editedRoute.objId === myRouteObjId )
						?
						theWayPointEditor.reverseWayPoints
						:
						null
				},
				{
					context : theNoteEditor,
					name : theTranslator.getText ( 'RouteContextMenu - Add a note on the route' ),
					action :
						contextMenuEvent.fromUI
							?
							null
							:
							theNoteEditor.newRouteNote,
					param : {
						routeObjId : myRouteObjId,
						lat : contextMenuEvent.latlng.lat,
						lng : contextMenuEvent.latlng.lng
					}
				},
				{
					context : theNoteEditor,
					name : theTranslator.getText ( 'RouteContextMenu - Create a note for each route maneuver' ),
					action :
						myRoute.hidden
							?
							null
							:
							theNoteEditor.addAllManeuverNotes,
					param : myRouteObjId
				},
				{
					context : theRouteEditor,
					name : theTranslator.getText ( 'RouteContextMenu - Save modifications on this route' ),
					action : ( theTravelNotesData.travel.editedRoute.objId === myRouteObjId )
						?
						theRouteEditor.saveEdition
						:
						null
				},
				{
					context : theRouteEditor,
					name : theTranslator.getText ( 'RouteContextMenu - Cancel modifications on this route' ),
					action : ( theTravelNotesData.travel.editedRoute.objId === myRouteObjId )
						?
						theRouteEditor.cancelEdition
						:
						null
				}
			]
		);

		return menuItems;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class RouteContextMenu
	@classdesc a BaseContextMenu object with items completed for routes
	@see {@link newRouteContextMenu} for constructor
	@augments BaseContextMenu
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	return new BaseContextMenu ( contextMenuEvent, myGetMenuItems ( ), parentDiv );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newRouteContextMenu
	@desc constructor of RouteContextMenu objects
	@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
	@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
	When null, the body of the html page is selected
	@return {RouteContextMenu} an instance of a RouteContextMenu object
	@listens mouseenter mouseleave click keydown keypress keyup
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewRouteContextMenu as newRouteContextMenu
};

/*
--- End of RouteContextMenu.js file -------------------------------------------------------------------------------------------
*/