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
				
		var _GetTravelHeader = function ( ) {
			var travelHeader = _HTMLElementsFactory.create ( 'div', { id : '', className : ''} ); 
			
			return travelHeader;
		};

		var _GetTravelNotes = function ( ) {
			var travelNotes = _HTMLElementsFactory.create ( 'div', { id : '', className : ''} ); 
			
			return travelNotes;
		};

		var _GetRouteHeader = function ( route ) {
			return _HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'RouteHeader',
					innerHTML: _RouteEditor.getRouteHTML ( route, _ClassNamePrefix )
				}
			); 
		};

		var _GetRouteManeuversAndNotes = function ( route ) {
			var routeManeuversAndNotes = _HTMLElementsFactory.create ( 'div', { className : _ClassNamePrefix + 'RouteManeuversNotesList' } ); 
			
			var noteIterator = route.notes.iterator;
			var noteDone =  noteIterator.done;
			var noteDistance = ! noteDone ? noteIterator.value.distance : 999999999;
			
			var maneuverIterator = route.itinerary.maneuvers.iterator;
			var maneuverDone = maneuverIterator.done;
			var maneuverDistance = 0;
			
			while ( ! ( maneuverDone && noteDone ) ) {
				var rowDiv = _HTMLElementsFactory.create ( 
					'div', 
					{ className : _ClassNamePrefix + 'ItineraryRowDiv'}, 
					routeManeuversAndNotes
				);

				if ( maneuverDistance <= noteDistance ) {
					if ( ! maneuverDone ) {
						rowDiv.classList.add ( _ClassNamePrefix + 'ManeuverRowDiv' );
						_HTMLElementsFactory.create (
							'div',
							{ 
								className : _ClassNamePrefix + 'ItineraryCellDiv ' + _ClassNamePrefix + 'iconCellDiv ' + _ClassNamePrefix + maneuverIterator.value.iconName,
							}, 
							rowDiv
						);
						
						var maneuverText = 
							'<div>' +  maneuverIterator.value.instruction + '</div>';
						
						if ( 0 < maneuverIterator.value.distance ) {
							maneuverText +=	'<div>' + 
								_Translator.getText ( 
									'HTMLViewsFactory - ToNextInstruction', 
									{
										distance : _Utilities.formatDistance ( maneuverIterator.value.distance ),
										duration : _Utilities.formatTime ( maneuverIterator.value.duration )
									}
								) + '</div>';
						}
						_HTMLElementsFactory.create (
							'div',
							{ 
								className : _ClassNamePrefix + 'ItineraryCellDiv ' + _ClassNamePrefix + 'ItineraryManeuverDiv',
								innerHTML : maneuverText
							}, 
							rowDiv
						);
						
						rowDiv.objId= require ( '../data/ObjId' ) ( );
						rowDiv.latLng = route.itinerary.itineraryPoints.getAt ( maneuverIterator.value.itineraryPointObjId ).latLng;
						
						maneuverDistance +=  maneuverIterator.value.distance;
						maneuverDone = maneuverIterator.done;
						if ( maneuverDone ) {
							maneuverDistance = 999999999;
						}
					}
				}
				else {
					if ( ! noteDone ) {
						rowDiv.classList.add ( _ClassNamePrefix + 'NoteRowDiv' );
						_HTMLElementsFactory.create (
							'div',
							{ 
								className : _ClassNamePrefix + 'ItineraryCellDiv',
								innerHTML : noteIterator.value.iconContent
							}, 
							rowDiv
						);
						var noteElement = _HTMLElementsFactory.create (
							'div',
							{ 
								className : _ClassNamePrefix + 'ItineraryCellDiv ' + _ClassNamePrefix + 'ItineraryNoteDiv',
								innerHTML : _NoteEditor.getNoteHTML ( noteIterator.value, _ClassNamePrefix )
							}, 
							rowDiv
						);
						
						rowDiv.objId= require ( '../data/ObjId' ) ( );
						rowDiv.latLng = noteIterator.value.latLng;
						
						noteDone = noteIterator.done;
						noteDistance = noteDone ? 999999999 :  noteIterator.value.distance;
					}
				}	
			}
			
			return routeManeuversAndNotes;
		};

		var _GetRouteFooter = function ( ) {
			var routeFooter = _HTMLElementsFactory.create ( 'div', { id : '', className : ''} ); 
			
			return routeFooter;
		};

		var _GetTravelFooter = function ( ) {
			var travelFooter = _HTMLElementsFactory.create ( 'div', { id : '', className : ''} ); 
			
			return travelFooter;
		};

		var _GetTravelView = function ( ) {
			var travelView = _HTMLElementsFactory.create ( 'div', { id : '', className : ''} ); 
			
			return travelView;
		};

		return {
			set classNamePrefix ( ClassNamePrefix ) { _ClassNamePrefix = ClassNamePrefix; },
			get classNamePrefix ( ) { return _ClassNamePrefix; },
			
			get travelHeader ( )  { return _GetTravelHeader ( ); }, 
			
			get travelNotes ( )  { return _GetTravelNotes ( ); }, 
			
			get routeHeader ( )  { return _GetRouteHeader ( _DataManager.editedRoute ); }, 
			
			get routeManeuversAndNotes ( )  { return _GetRouteManeuversAndNotes ( _DataManager.editedRoute ); }, 
			
			get routeFooter ( )  { return _GetRouteFooter ( ); }, 
			
			get travelFooter ( )  { return _GetTravelFooter ( ); }, 
			
			get travelView ( ) { return  _GetTravelView ( ); }
		};
			
	};

	/* --- End of L.Travel.ControlUI object --- */		

	var HTMLElementsFactory = function ( ) {
		return getHTMLElementsFactory ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getHTMLViewsFactory;
	}

}());
