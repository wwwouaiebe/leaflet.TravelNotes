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

( function ( ){
	
	'use strict';
	
	/* 
	--- HTMLViewsFactory object -----------------------------------------------------------------------------
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	var _HTMLElementsFactory = require ( '../UI/HTMLElementsFactory' ) ( );
	var _DataManager = require ( '../data/DataManager' ) ( );
	var _Translator = require ( '../UI/Translator' ) ( );
	var _Utilities = require ( '../util/Utilities' ) ( );
	var _NoteEditor = require ( '../core/NoteEditor' ) ( );
	var _RouteEditor = require ( '../core/RouteEditor' ) ( );
	
	var _ClassNamePrefix = 'TravelNotes-Control-';

	var getHTMLViewsFactory = function ( ) {
				
		var _AddNoteHTML = function ( note, rowDiv ) {
			_HTMLElementsFactory.create (
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Notes-IconCell',
					innerHTML : note.iconContent
				}, 
				rowDiv
			);
			var noteElement = _HTMLElementsFactory.create (
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Notes-Cell',
					innerHTML : _NoteEditor.getNoteHTML ( note, _ClassNamePrefix )
				}, 
				rowDiv
			);
		};

		var _GetTravelHeaderHTML = function ( ) {
			var travelHeaderHTML = _HTMLElementsFactory.create ( 'div', { className :  _ClassNamePrefix + 'Travel-Header' } ); 
			_HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Header-Name',
					innerHTML: _DataManager.travel.name
				},
				travelHeaderHTML
			); 
			
			var travelRoutesIterator = _DataManager.travel.routes.iterator;
			while ( ! travelRoutesIterator.done ) {
				_HTMLElementsFactory.create ( 
					'div',
					{ 
						className : _ClassNamePrefix + 'Travel-Header-RouteName',
						innerHTML: travelRoutesIterator.value.name
					},
					travelHeaderHTML
				); 
			}
			
			return travelHeaderHTML;
		};

		var _GetTravelNotesHTML = function ( ) {
			var travelNotesHTML = _HTMLElementsFactory.create ( 'div', { className :  _ClassNamePrefix + 'Travel-Notes'} ); 
			var travelNotesIterator = _DataManager.travel.notes.iterator;
			while ( ! travelNotesIterator.done ) {
				var rowDiv = _HTMLElementsFactory.create ( 
					'div', 
					{ className : _ClassNamePrefix + 'Travel-Notes-Row'}, 
					travelNotesHTML
				);
				 _AddNoteHTML ( travelNotesIterator.value, rowDiv ) ;
			}
			
			return travelNotesHTML;
		};

		var _GetRouteHeaderHTML = function ( route ) {
			return _HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'Route-Header',
					innerHTML: _RouteEditor.getRouteHTML ( route, _ClassNamePrefix )
				}
			); 
		};

		var _GetRouteManeuversAndNotesHTML = function ( route ) {
			var routeManeuversAndNotesHTML = _HTMLElementsFactory.create ( 'div', { className : _ClassNamePrefix + 'Route-ManeuversAndNotes' } ); 
			
			var notesIterator = route.notes.iterator;
			var notesDone =  notesIterator.done;
			var notesDistance = ! notesDone ? notesIterator.value.distance : 999999999;
			
			var maneuversIterator = route.itinerary.maneuvers.iterator;
			var maneuversDone = maneuversIterator.done;
			var maneuversDistance = 0;
			
			while ( ! ( maneuversDone && notesDone ) ) {
				var rowDiv = _HTMLElementsFactory.create ( 
					'div', 
					{ className : _ClassNamePrefix + 'Route-ManeuversAndNotes-Row' }, 
					routeManeuversAndNotesHTML
				);

				if ( maneuversDistance <= notesDistance ) {
					if ( ! maneuversDone ) {
						_HTMLElementsFactory.create (
							'div',
							{ 
								className : _ClassNamePrefix + 'Route-ManeuversAndNotes-IconCell ' + 'TravelNotes-ManeuverNote-' + maneuversIterator.value.iconName,
							}, 
							rowDiv
						);
						
						var maneuverText = 
							'<div>' +  maneuversIterator.value.instruction + '</div>';
						
						if ( 0 < maneuversIterator.value.distance ) {
							maneuverText +=	'<div>' + 
								_Translator.getText ( 
									'HTMLViewsFactory - ToNextInstruction', 
									{
										distance : _Utilities.formatDistance ( maneuversIterator.value.distance ),
										duration : _Utilities.formatTime (maneuversIterator.value.duration )
									}
								) + '</div>';
						}
						_HTMLElementsFactory.create (
							'div',
							{ 
								className : _ClassNamePrefix + 'Route-ManeuversAndNotes-Cell',
								innerHTML : maneuverText
							}, 
							rowDiv
						);
						
						rowDiv.objId= require ( '../data/ObjId' ) ( );
						rowDiv.latLng = route.itinerary.itineraryPoints.getAt ( maneuversIterator.value.itineraryPointObjId ).latLng;
						rowDiv.maneuverObjId = maneuversIterator.value.objId;
						
						maneuversDistance +=  maneuversIterator.value.distance;
						maneuversDone = maneuversIterator.done;
						if ( maneuversDone ) {
							maneuversDistance = 999999999;
						}
					}
				}
				else {
					if ( ! notesDone ) {

						_AddNoteHTML ( notesIterator.value, rowDiv );

						rowDiv.objId= require ( '../data/ObjId' ) ( );
						rowDiv.latLng = notesIterator.value.latLng;
						rowDiv.noteObjId = notesIterator.value.objId;
						
						notesDone = notesIterator.done;
						notesDistance = notesDone ? 999999999 :  notesIterator.value.distance;
					}
				}	
			}
			
			return routeManeuversAndNotesHTML;
		};

		var _GetRouteFooterHTML = function ( route ) {
			return _HTMLElementsFactory.create ( 
				'div', 
				{ 
					className : _ClassNamePrefix + 'RouteFooter',
					innerHTML : _Translator.getText ( 
						'HTMLViewsFactory - Route footer', 
						{
							provider: route.itinerary.provider, 
							transitMode : _Translator.getText ( 'HTMLViewsFactory - TransitMode ' +	route.itinerary.transitMode )
						} 
					)
				}
			); 
		};

		var _GetTravelFooterHTML = function ( ) {
			return _HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'TravelFooter',
					innerHTML : _Translator.getText ( 'HTMLViewsFactory - Travel footer' )
				} 
			); 
		};

		var _GetTravelHTML = function ( ) {
			
			var travelHTML = _HTMLElementsFactory.create ( 'div', { className : _ClassNamePrefix + 'Travel'} ); 
			
			travelHTML.appendChild ( _GetTravelHeaderHTML ( ) );
			travelHTML.appendChild ( _GetTravelNotesHTML ( ) );
			
			var travelRoutesIterator = _DataManager.travel.routes.iterator;
			while ( ! travelRoutesIterator.done ) {
				travelHTML.appendChild ( _GetRouteHeaderHTML ( travelRoutesIterator.value ) );
				travelHTML.appendChild ( _GetRouteManeuversAndNotesHTML ( travelRoutesIterator.value ) );
				travelHTML.appendChild ( _GetRouteFooterHTML ( travelRoutesIterator.value ) );
			}
			
			travelHTML.appendChild ( _GetTravelFooterHTML ( ) );

			return travelHTML;
		};

		return {
			set classNamePrefix ( ClassNamePrefix ) { _ClassNamePrefix = ClassNamePrefix; },
			
			get classNamePrefix ( ) { return _ClassNamePrefix; },
			
			get travelHeaderHTML ( )  { return _GetTravelHeaderHTML ( ); }, 
			
			get travelNotesHTML ( )  { return _GetTravelNotesHTML ( ); }, 
			
			get routeHeaderHTML ( )  { return _GetRouteHeaderHTML ( _DataManager.editedRoute ); }, 
			
			get routeManeuversAndNotesHTML ( )  { return _GetRouteManeuversAndNotesHTML ( _DataManager.editedRoute ); }, 
			
			get routeFooterHTML ( )  { return _GetRouteFooterHTML ( _DataManager.editedRoute ); }, 
			
			get travelFooterHTML ( )  { return _GetTravelFooterHTML ( ); }, 
			
			get travelHTML ( ) { return  _GetTravelHTML ( ); }
		};
			
	};

	/* --- End of L.Travel.ControlUI object --- */		
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getHTMLViewsFactory;
	}

}());
