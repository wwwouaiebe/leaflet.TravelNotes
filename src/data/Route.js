/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/
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
	- the newRoute function
Changes:
	- v1.0.0:
		- created
	-v1.1.0:
		- Issue #33: Add a command to hide a route
		- Issue #36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/*eslint no-fallthrough: ["error", { "commentPattern": "eslint break omitted intentionally" }]*/

export { newRoute };
import { g_Config } from '../data/Config.js';

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { newCollection } from '../data/Collection.js';
import { newWayPoint } from '../data/WayPoint.js';
import { newItinerary } from '../data/Itinerary.js';

/*
--- newRoute function ---------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newRoute ( ) {

	const s_ObjType = newObjType ( 'Route' );
	
	let m_Name = '';

	let m_WayPoints = newCollection ( 'WayPoint' );
	m_WayPoints.add ( newWayPoint ( ) );
	m_WayPoints.add ( newWayPoint ( ) );

	let m_Notes = newCollection ( 'Note' );

	let m_Itinerary = newItinerary ( );
	
	let m_Width = 5;

	let m_Color = '#ff0000';
	
	let m_DashArray = 0;

	
	if ( g_Config ) {
		m_Width = g_Config.route.width;
		m_Color = g_Config.route.color;			
		m_DashArray = g_Config.route.dashArray;			
	}

	let m_Chain = false;

	let m_ChainedDistance = 0;

	let m_Distance = 0;

	let m_Duration = 0;
	
	let m_Edited = 0; // possible values: 0 not edited; 1 in the editor without changes; 2 in the editor with changes
	
	function m_SetEdited ( edited ) {
		if ( typeof edited !== "number" || 0 > edited || 2 < edited ) {
			throw 'Invalid value for Route.edited : ' + edited;
		}
		else {
			m_Edited = edited;
		}
	}

	let m_Hidden = false;
	
	let m_ObjId = newObjId ( );

	/*
	--- m_Validate function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Validate ( something ) {
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'objType' ) ) {
			throw 'No objType for ' + s_ObjType.name;
		}
		s_ObjType.validate ( something.objType );
		if ( s_ObjType.version !== something.objType.version ) {
			switch ( something.objType.version ) {
				case '1.0.0':
					something.dashArray = 0;
					something.hidden = false;
					// eslint break omitted intentionally
				case '1.1.0':
					// eslint break omitted intentionally
				case '1.2.0':
					// eslint break omitted intentionally
				case '1.3.0':
					// eslint break omitted intentionally
				case '1.4.0':
					something.edited = 0;
					// eslint break omitted intentionally
				case '1.5.0':
					something.objType.version = '1.6.0';
					break;
				default:
					throw 'invalid version for ' + s_ObjType.name;
			}
		}
		let properties = Object.getOwnPropertyNames ( something );
		['name', 'wayPoints', 'notes', 'itinerary', 'width', 'color', 'dashArray', 'chain', 'distance', 'duration', 'edited', 'hidden', 'chainedDistance', 'objId' ].forEach (
			property => {
				if ( ! properties.includes ( property ) ) {
					throw 'No ' + property + ' for ' + s_ObjType.name;
				}
			}
		)
		return something;
	}

	/*
	--- m_GetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetObject ( ) {
		return {
			name : m_Name,
			wayPoints : m_WayPoints.object,
			notes : m_Notes.object,
			itinerary : m_Itinerary.object,
			width : m_Width,
			color : m_Color,
			dashArray : m_DashArray,
			chain : m_Chain,
			distance : parseFloat ( m_Distance.toFixed ( 2 ) ),
			duration : m_Duration,
			edited : m_Edited,
			hidden : m_Hidden,
			chainedDistance : parseFloat ( m_ChainedDistance.toFixed ( 2 ) ),
			objId : m_ObjId,
			objType : s_ObjType.object
		};
	}
	
	/*
	--- m_SetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetObject ( something ) {
		something = m_Validate ( something );
		m_Name = something.name || '';
		m_WayPoints.object = something.wayPoints || [];
		m_Notes.object = something.notes || [];
		m_Itinerary.object = something.itinerary || newItinerary ( ).object;
		m_Width = something.width || 5;
		m_Color = something.color || '#000000';
		m_DashArray = something.dashArray || 0;
		m_Chain = something.chain || false;
		m_Distance = something.distance;
		m_Duration = something.duration;
		m_Edited = something.edited || 0;
		m_Hidden = something.hidden || false;
		m_ChainedDistance = something.chainedDistance;
		m_ObjId = newObjId ( );
	}

	/*
	--- route object --------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
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
			
			get edited ( ) { return m_Edited; },
			set edited ( Edited ) { m_SetEdited ( Edited ); },

			get hidden ( ) { return m_Hidden; },
			set hidden ( Hidden ) { m_Hidden = Hidden; },

			get objId ( ) { return m_ObjId; },

			get objType ( ) { return s_ObjType; },

			get object ( ) { return m_GetObject ( ); },
			set object ( something ) { m_SetObject ( something ); }
		}
	);
}

/*
--- End of Route.js file ----------------------------------------------------------------------------------------------
*/