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
	-v1.1.0:
		- Issue #33: Add a command to hide a route
		- Issue #36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var s_ObjType = require ( '../data/ObjType' ) ( 'Route', require ( './Version' ) );

	/*
	--- route function ------------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var route = function ( ) {

		var m_Name = '';

		var m_WayPoints = require ( '../data/Collection' ) ( 'WayPoint' );
		m_WayPoints.add ( require ( '../data/Waypoint' ) ( ) );
		m_WayPoints.add ( require ( '../data/Waypoint' ) ( ) );

		var m_Notes = require ( '../data/Collection' ) ( 'Note' );

		var m_Itinerary = require ( '../data/Itinerary' ) ( );

		var m_Width = require ( '../L.TravelNotes' ).config.route.width || 5;

		var m_Color = require ( '../L.TravelNotes' ).config.route.color || '#ff0000';
		
		var m_DashArray = require ( '../L.TravelNotes' ).config.route.dashArray || 0;

		var m_Chain = false;

		var m_ChainedDistance = 0;

		var m_Distance = 0;

		var m_Duration = 0;
		
		var m_Hidden = false;

		var m_ObjId = require ( '../data/ObjId' ) ( );

		var m_GetObject = function ( ) {
			return {
				name : m_Name,
				wayPoints : m_WayPoints.object,
				notes : m_Notes.object,
				itinerary : m_Itinerary.object,
				width : m_Width,
				color : m_Color,
				dashArray : m_DashArray,
				chain :m_Chain,
				distance : parseFloat ( m_Distance.toFixed ( 2 ) ),
				duration : m_Duration,
				hidden : m_Hidden,
				chainedDistance : parseFloat ( m_ChainedDistance.toFixed ( 2 ) ),
				objId : m_ObjId,
				objType : s_ObjType.object
			};
		};
		
		var m_SetObject = function ( something ) {
			something = s_ObjType.validate ( something );
			m_Name = something.name || '';
			m_WayPoints.object = something.wayPoints || [];
			m_Notes.object = something.notes || [];
			m_Itinerary.object = something.itinerary || require ( './Itinerary' ) ( ).object;
			m_Width = something.width || 5;
			m_Color = something.color || '#000000';
			m_DashArray = something.dashArray || 0;
			m_Chain = something.chain || false;
			m_Distance = something.distance;
			m_Duration = something.duration;
			m_Hidden = something.hidden || false;
			m_ChainedDistance = something.chainedDistance;
			m_ObjId = require ( '../data/ObjId' ) ( );
		};

		/*
		--- route object -----------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal ( 
			{

				get wayPoints ( ) { return m_WayPoints; },

				get itinerary ( ) { return m_Itinerary; },

				get notes ( ) { return m_Notes; },

				get name ( ) { return m_Name; },
				set name ( Name ) { m_Name = Name;},

				get width ( ) { return m_Width; },
				set width ( Width ) { m_Width = Width; },

				get color ( ) { return m_Color; },
				set color ( Color ) { m_Color = Color; },

				get dashArray ( ) { return m_DashArray; },
				set dashArray ( DashArray ) { m_DashArray = DashArray; },

				get chain ( ) { return m_Chain; },
				set chain ( Chain ) { m_Chain = Chain; },

				get chainedDistance ( ) { return m_ChainedDistance; },
				set chainedDistance ( ChainedDistance ) { m_ChainedDistance = ChainedDistance; },

				get distance ( ) { return m_Distance; },
				set distance ( Distance ) { m_Distance = Distance; },

				get duration ( ) { return m_Duration; },
				set duration ( Duration ) { m_Duration = Duration; },

				get hidden ( ) { return m_Hidden; },
				set hidden ( Hidden ) { m_Hidden = Hidden; },

				get objId ( ) { return m_ObjId; },

				get objType ( ) { return s_ObjType; },

				get object ( ) { return m_GetObject ( ); },
				set object ( something ) { m_SetObject ( something ); }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = route;
	}

} ) ( );

/*
--- End of Route.js file ----------------------------------------------------------------------------------------------
*/