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
--- Route.js file -----------------------------------------------------------------------------------------------------
This file contains:
	- the Route object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20170926
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var _ObjType = require ( '../data/ObjType' ) ( 'Route', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var Route = function ( ) {

		// Private variables

		var _Name = '';

		var _WayPoints = require ( '../data/Collection' ) ( 'WayPoint' );
		_WayPoints.add ( require ( '../data/Waypoint' ) ( ) );
		_WayPoints.add ( require ( '../data/Waypoint' ) ( ) );

		var _Notes = require ( '../data/Collection' ) ( 'Note' );

		var _Itinerary = require ( '../data/Itinerary' ) ( );

		var _Width = require ( '../util/Config' ) ( ).route.width || 5;

		var _Color = require ( '../util/Config' ) ( ).route.color || '#ff0000';

		var _Chain = false;

		var _ChainedDistance = 0;

		var _Distance = 0;

		var _Duration = 0;

		var _ObjId = require ( '../data/ObjId' ) ( );

		return {

			// getters and setters...

			get wayPoints ( ) { return _WayPoints; },

			get itinerary ( ) { return _Itinerary; },

			get notes ( ) { return _Notes; },

			get name ( ) { return _Name; },
			set name ( Name ) { _Name = Name;},

			get width ( ) { return _Width; },
			set width ( Width ) { _Width = Width; },

			get color ( ) { return _Color; },
			set color ( Color ) { _Color = Color; },

			get chain ( ) { return _Chain; },
			set chain ( Chain ) { _Chain = Chain; },

			get chainedDistance ( ) { return _ChainedDistance; },
			set chainedDistance ( ChainedDistance ) { _ChainedDistance = ChainedDistance; },

			get distance ( ) { return _Distance; },
			set distance ( Distance ) { _Distance = Distance; },

			get duration ( ) { return _Duration; },
			set duration ( Duration ) { _Duration = Duration; },

			get objId ( ) { return _ObjId; },

			get objType ( ) { return _ObjType; },

			get object ( ) {
				return {
					name : _Name,
					wayPoints : _WayPoints.object,
					notes : _Notes.object,
					itinerary : _Itinerary.object,
					width : _Width,
					color : _Color,
					chain :_Chain,
					distance : _Distance,
					duration : _Duration,
					chainedDistance : _ChainedDistance,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Name = Object.name || '';
				_WayPoints.object = Object.wayPoints || [];
				_Notes.object = Object.notes || [];
				_Itinerary.object = Object.itinerary || require ( './Itinerary' ) ( ).object;
				_Width = Object.width || 5;
				_Color = Object.color || '#000000';
				_Chain = Object.chain || false;
				_Distance = Object.distance;
				_Duration = Object.duration;
				_ChainedDistance = Object.chainedDistance;
				_ObjId = require ( '../data/ObjId' ) ( );
			}
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = Route;
	}

} ) ( );

/*
--- End of Route.js file ----------------------------------------------------------------------------------------------
*/