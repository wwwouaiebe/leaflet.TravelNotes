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

/*
--- DataManager.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the DataManager object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	-v1.1.0:
		- Issue #26 : added confirmation message before leaving the page when data modified.
		- Issue #29 : added tooltip to startpoint, waypoints and endpoint
		- Issue #36: Add a linetype property to route
Doc reviewed 20170926
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var DataManager = function ( ) {

		return {

			/*
			--- init method -------------------------------------------------------------------------------------------

			This method ...
			
			-----------------------------------------------------------------------------------------------------------
			*/

			init : function ( map ) {
				global.config = {
					contextMenu : {
						timeout : 1500
					},
					errorMessages :
					{
						timeout : 20000
					},
					routing : {
						auto : true
					},
					language : 'fr',
					itineraryPointMarker : {
						color : 'red',
						weight : 2,
						radius : 7,
						fill : false
					},
					wayPoint :
					{
						reverseGeocoding : false
					},
					route : 
					{
						color : '#ff0000',
						width : 3,
						dashArray : 0,
						dashChoices : [
							{ 
								text : "——————",
								iDashArray : null
							}, 
							{
								text : "— — — — —",
								iDashArray : [ 4, 2 ] 
							}, 
							{
								text : "—‧—‧—‧—‧—",
								iDashArray : [ 4, 2, 0, 2 ] 
							}, 
							{
								text : "················",
								iDashArray : [ 0, 2 ] 
							}
						]
					},
					note : {
						reverseGeocoding : false,
						grip : { 
							size : 10,
							opacity: 0 
						},
						polyline : {
							color : 'gray',
							weight : 1
						},
						style : 'TravelNotes-NotesStyle'
					},
					itineraryPointZoom: 17,
					routeEditor : {
						displayEditionInHTMLPage : true
					},
					travelEditor : {
						clearAfterSave : true,
						startMinimized : true,
						timeout : 1000,
						startupRouteEdition:true
					},
					haveBeforeUnloadWarning : true
				};
				global.version = '1.0.0';
				global.map = map;
				global.travelObjId = 0;
				global.editedRoute = require ( '../data/Route' ) ( );
				global.editedRoute.routeChanged = false;
				global.editedRoute.routeInitialObjId = -1;
				global.editedRoute.haveItinerary = false;
				global.travel = require ( '../data/Travel' ) ( );
				global.mapObjects = new Map ( );
				global.routing = {};
				global.UUID = require ( '../util/Utilities' ) ( ).UUID;
			},


			/*
			--- getters and setters  ----------------------------------------------------------------------------------
			
			-----------------------------------------------------------------------------------------------------------
			*/

			get UUID ( ) { return global.UUID; },

			get version ( ) { return global.version; },

			get routing ( ) { return global.routing; },
			set routing ( Routing ) { global.routing = Routing; },

			get providers ( ) { return global.providers; },

			get editedRoute ( ) { return global.editedRoute; },
			set editedRoute ( editedRoute ) { global.editedRoute = editedRoute; },

			get travel ( ) { return global.travel; },
			set travel ( Travel ) { global.travel = Travel; },

			get config ( ) { return global.config; },
			set config ( Config ) { global.config = Config; },

			get mapObjects ( ) { return global.mapObjects; },

			get map ( ) { return global.map; },

			/*
			--- getWayPoint method --------------------------------------------------------------------------------

			This method returns a wayPoint from the wayPointObjId
			
			-----------------------------------------------------------------------------------------------------------
			*/

			getWayPoint : function ( wayPointObjId ) {
				var wayPoint = null;
				var routeIterator = this.travel.routes.iterator;
				while ( ! routeIterator.done ) {
					wayPoint = routeIterator.value.wayPoints.getAt ( wayPointObjId );
					if ( wayPoint ) {
						return wayPoint;
					}
				}
				wayPoint = this.editedRoute.wayPoints.getAt ( wayPointObjId );
				if ( ! wayPoint ) {
					console.log ( 'Invalid wayPointObjId ' + wayPointObjId + ' for function DataManager.getWayPoint ( )' );
					return null;
				}
				return wayPoint;
			},
			
			/*
			--- getNoteAndRoute method --------------------------------------------------------------------------------

			This method returns a note and a route ( when the note is linked to a route ) from the noteObjId
			
			-----------------------------------------------------------------------------------------------------------
			*/

			getNoteAndRoute : function ( noteObjId ) {
				var note = null;
				note = this.travel.notes.getAt ( noteObjId );
				if ( note ) {
					return { note : note, route : null };
				}
				var routeIterator = this.travel.routes.iterator;
				while ( ! routeIterator.done ) {
					note = routeIterator.value.notes.getAt ( noteObjId );
					if ( note ) {
						return { note : note, route : routeIterator.value };
					}
				}
				note = this.editedRoute.notes.getAt ( noteObjId );
				if ( ! note ) {
					console.log ( 'Invalid noteObjId ' + noteObjId + ' for function DataManager.getNote ( )' );
					return { note : null, route : null };
				}

				return { note : note, route : this.editedRoute };
			},


			/*
			--- getRoute method ---------------------------------------------------------------------------------------

			This method returns a route when giving the routeObjId
			
			-----------------------------------------------------------------------------------------------------------
			*/

			getRoute : function ( routeObjId ) {
				var route = null;
				route = this.travel.routes.getAt ( routeObjId );
				if ( ! route ) {
					if ( routeObjId === this.editedRoute.objId ) {
						route = this.editedRoute;
					}
				}
				if ( ! route ) {
					console.log ( 'Invalid noteObjId ' + routeObjId + ' for function DataManager.getRoute ( )' );
				}

				return route;
			}
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = DataManager;
	}

} ) ( );

/*
--- End of DataManager.js file ----------------------------------------------------------------------------------------
*/