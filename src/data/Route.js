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

	var _ObjType = require ( './ObjType' ) ( 'Route', '1.0.0' );

	var getRoute = function ( ) {
		
		var _Name = '';
		var _WayPoints = require ( './Collection' ) ( 'WayPoint' );
		_WayPoints.add ( require ( './Waypoint' ) ( ) );
		_WayPoints.add ( require ( './Waypoint' ) ( ) );
		var _Notes = require ( './Collection' ) ( 'Note' );
		
		var _Geom = require ( './Geom' ) ( );
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {
			get name ( ) { return _Name; },
			set name ( Name ) { _Name = Name;},
			
			get wayPoints ( ) { return _WayPoints; },
			
			get notes ( ) { return _Notes; },

			get geom ( ) { return _Geom; },
			set geom ( Geom ) { _Geom = Geom; },
			
			get objId ( ) { return _ObjId; },
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				var wayPoints = [];
				var wayPointsIterator = this.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					wayPoints.push ( wayPointsIterator.value.object );
				}
				var notes = [ ];
				var notesIterator = this.notes.iterator;
				while ( ! notesIterator.done ) {
					notes.push ( notesIterator.value.object );
				}
				return {
					name : _Name,
					wayPoints : wayPoints,
					notes : notes,
					geom : _Geom.object,
					objId : _ObjId,
					objType : _ObjType
				};
			},
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Name = Object.name || '';
				_WayPoints.removeAll ( );
				for ( var wayPointsCounter = 0; wayPointsCounter < Object.wayPoints.length; wayPointsCounter ++ ) {
					var newWayPoint = require ( './WayPoint' ) ( );
					newWayPoint.object = Object.wayPoints [ wayPointsCounter ];
					_WayPoints.add ( newWayPoint );
				}
				_Notes.removeAll ( );
				for ( var notesCounter = 0; notesCounter < Object.notes.length; notesCounter ++ ) {
					var newNote = require ( './Note' ) ( );
					newNote.object = Object.notes [ notesCounter ];
					_Notes.add ( newNote );
				}
				var tmpGeom = require ( './Geom' ) ( );
				tmpGeom.object = Object.geom;
				_Geom = tmpGeom;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoute;
	}

} ) ( );

/* --- End of MapData.js file --- */