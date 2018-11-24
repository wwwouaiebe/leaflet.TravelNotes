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
--- Itinerary.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the Itinerary object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20170925
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var _ObjType = require ( '../data/ObjType' ) ( 'Itinerary', require ( './Version' ) );

	/*
	--- Itinerary object ----------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var Itinerary = function ( ) {

		// Private variables

		var _Provider = '';

		var _TransitMode = '';

		var _ItineraryPoints = require ( '../data/Collection' ) ( 'ItineraryPoint' );

		var _Maneuvers = require ( '../data/Collection' ) ( 'Maneuver' );

		var _ObjId = require ( '../data/ObjId' ) ( );

		return {

			// getters and setters...

			get itineraryPoints ( ) { return _ItineraryPoints; },

			get maneuvers ( ) { return _Maneuvers; },

			get provider ( ) { return _Provider; },
			set provider ( Provider ) { _Provider = Provider; },

			get transitMode ( ) { return _TransitMode; },
			set transitMode ( TransitMode ) { _TransitMode = TransitMode; },

			get objId ( ) { return _ObjId; },

			get objType ( ) { return _ObjType; },

			get object ( ) {
				return {
					itineraryPoints : _ItineraryPoints.object,
					maneuvers : _Maneuvers.object,
					provider : _Provider,
					transitMode : _TransitMode,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_ItineraryPoints.object = Object.itineraryPoints || [];
				_Maneuvers.object = Object.maneuvers || [];
				_Provider = Object.provider || '';
				_TransitMode = Object.transitMode || '';
				_ObjId = require ( '../data/ObjId' ) ( );
				// rebuilding links between maneuvers and itineraryPoints
				var itineraryPointObjIdMap = new Map ( );
				var sourceCounter = 0;
				var targetIterator = _ItineraryPoints.iterator;
				while ( ! targetIterator.done ) {
					itineraryPointObjIdMap.set ( Object.itineraryPoints [ sourceCounter ].objId, targetIterator.value.objId );
					sourceCounter ++;
				}
				var maneuverIterator = _Maneuvers.iterator;
				while ( ! maneuverIterator.done ) {
					maneuverIterator.value.itineraryPointObjId = itineraryPointObjIdMap.get ( maneuverIterator.value.itineraryPointObjId );
				}
			}
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = Itinerary;
	}

} ) ( );

/*
--- End of Itinerary.js file ------------------------------------------------------------------------------------------
*/