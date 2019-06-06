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
--- HTMLViewsFactory.js file ------------------------------------------------------------------------------------------
This file contains:
	- the HTMLViewsFactory object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- Added noteObjId in the _AddNoteHTML function
Doc reviewed 20170929
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var _HTMLElementsFactory = require ( '../UI/HTMLElementsFactory' ) ( );
	var _TravelNotesData = require ( '../L.TravelNotes' );
	var _Translator = require ( '../UI/Translator' ) ( );
	var _Utilities = require ( '../util/Utilities' ) ( );
	var _NoteEditor = require ( '../core/NoteEditor' ) ( );
	var _RouteEditor = require ( '../core/RouteEditor' ) ( );
	
	var m_SvgIconSize = require ( '../L.TravelNotes' ).config.note.svgIconWidth;
	
	var _ClassNamePrefix = 'TravelNotes-Control-';

	var HTMLViewsFactory = function ( ) {
				
		/*
		--- _AddNoteHTML function -------------------------------------------------------------------------------------

		This function add to the rowDiv parameter two div with the note icon ant the note content

		---------------------------------------------------------------------------------------------------------------
		*/

		var _AddNoteHTML = function ( note, rowDiv ) {
			var iconCell = _HTMLElementsFactory.create (
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Notes-IconCell',
					innerHTML : note.iconContent
				}, 
				rowDiv
			);
			if ( ( 'svg' === iconCell.firstChild.tagName ) && ( 'TravelNotes-Roadbook-' === _ClassNamePrefix ) ) {
				iconCell.firstChild.setAttributeNS ( null, "viewBox", "0 0 " + m_SvgIconSize + " " + m_SvgIconSize);
			}
			
			var noteElement = _HTMLElementsFactory.create (
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Notes-Cell',
					innerHTML : _NoteEditor.getNoteHTML ( note, _ClassNamePrefix )
				}, 
				rowDiv
			);
			rowDiv.noteObjId = note.objId;
		};
				
		/*
		--- _GetTravelHeaderHTML function -----------------------------------------------------------------------------

		This function returns an HTML element with the travel's header

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetTravelHeaderHTML = function ( ) {
			var travelHeaderHTML = _HTMLElementsFactory.create ( 'div', { className :  _ClassNamePrefix + 'Travel-Header' } ); 
			_HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Header-Name',
					innerHTML: _TravelNotesData.travel.name
				},
				travelHeaderHTML
			); 
			
			var travelDistance = 0;
			var travelRoutesIterator = _TravelNotesData.travel.routes.iterator;
			while ( ! travelRoutesIterator.done ) {
				_HTMLElementsFactory.create ( 
					'div',
					{ 
						className : _ClassNamePrefix + 'Travel-Header-RouteName',
						innerHTML: '<a href="#route' +  travelRoutesIterator.value.objId + '">' + travelRoutesIterator.value.name + '</a>' + '&nbsp;:&nbsp;' + _Utilities.formatDistance ( travelRoutesIterator.value.distance ) + '.'
					},
					travelHeaderHTML
				); 
				if ( travelRoutesIterator.value.chain ) {
					travelDistance += travelRoutesIterator.value.distance;
				}
			}

			_HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Header-TravelDistance',
					innerHTML:  _Translator.getText ( 'HTMLViewsFactory - Travel distance&nbsp;:&nbsp;{distance}', { distance : _Utilities.formatDistance ( travelDistance ) } )
				},
				travelHeaderHTML
			); 

			return travelHeaderHTML;
		};

				
		/*
		--- _GetTravelNotesHTML function ------------------------------------------------------------------------------

		This function returns an HTML element with the travel's notes

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetTravelNotesHTML = function ( ) {
			var travelNotesHTML = _HTMLElementsFactory.create ( 'div', { className :  _ClassNamePrefix + 'Travel-Notes'} ); 
			var travelNotesIterator = _TravelNotesData.travel.notes.iterator;
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
				
		/*
		--- _GetRouteHeaderHTML function ------------------------------------------------------------------------------

		This function returns an HTML element with the route header

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetRouteHeaderHTML = function ( route ) {
			return _HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'Route-Header',
					id : 'route' + route.objId,
					innerHTML: _RouteEditor.getRouteHTML ( route, _ClassNamePrefix )
				}
			); 
		};
				
		/*
		--- _GetRouteManeuversAndNotesHTML function -------------------------------------------------------------------

		This function returns an HTML element with the route maneuvers and notes

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetRouteManeuversAndNotesHTML = function ( route ) {
			var routeManeuversAndNotesHTML = _HTMLElementsFactory.create ( 'div', { className : _ClassNamePrefix + 'Route-ManeuversAndNotes' } ); 
			
			var notesIterator = route.notes.iterator;
			var notesDone =  notesIterator.done;
			var notesDistance = ! notesDone ? notesIterator.value.distance : Number.MAX_VALUE;
			var previousNotesDistance = notesDistance;
			
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
						rowDiv.className = _ClassNamePrefix + 'Route-Maneuvers-Row';
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
									'HTMLViewsFactory - To next instruction&nbsp;:&nbsp;{distance}&nbsp;-&nbsp;{duration}', 
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
							maneuversDistance = Number.MAX_VALUE;
						}
					}
				}
				else {
					if ( ! notesDone ) {
						rowDiv.className = _ClassNamePrefix + 'Route-Notes-Row';

						_AddNoteHTML ( notesIterator.value, rowDiv );

						rowDiv.objId= require ( '../data/ObjId' ) ( );
						rowDiv.latLng = notesIterator.value.latLng;
						rowDiv.noteObjId = notesIterator.value.objId;
						previousNotesDistance = notesIterator.value.distance;
						notesDone = notesIterator.done;
						notesDistance = notesDone ? Number.MAX_VALUE :  notesIterator.value.distance;
						if ( ! notesDone  ) {
							var nextDistance = notesIterator.value.distance - previousNotesDistance;
							if ( 2 < nextDistance ) {
								_HTMLElementsFactory.create (
									'div',
									{ 
										className : _ClassNamePrefix + 'NoteHtml-NextDistance',
										innerHTML : _Translator.getText ( 'HTMLViewsFactory - Next distance&nbsp;:&nbsp;{distance}', { distance : _Utilities.formatDistance ( nextDistance ) } )
									}, 
									rowDiv.lastChild
								);	
							}
						}
					}
				}	
			}
			
			return routeManeuversAndNotesHTML;
		};
				
		/*
		--- _GetRouteFooterHTML function ------------------------------------------------------------------------------

		This function returns an HTML element with the route footer

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetRouteFooterHTML = function ( route ) {
			var innerHTML = '';
			if ( ( '' !== route.itinerary.provider ) && ( '' !== route.itinerary.transitMode ) ) {
				innerHTML = _Translator.getText ( 
					'HTMLViewsFactory - Itinerary computed by {provider} and optimized for {transitMode}', 
					{
						provider: route.itinerary.provider, 
						transitMode : _Translator.getText ( 'HTMLViewsFactory - TransitMode ' +	route.itinerary.transitMode )
					} 
				);
			}
			
			return _HTMLElementsFactory.create ( 'div', { className : _ClassNamePrefix + 'RouteFooter',	innerHTML : innerHTML } ); 
		};
				
		/*
		--- _GetTravelFooterHTML function -----------------------------------------------------------------------------

		This function returns an HTML element with the travel's footer

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetTravelFooterHTML = function ( ) {
			return _HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'TravelFooter',
					innerHTML : _Translator.getText ( 'HTMLViewsFactory - Travel footer' )
				} 
			); 
		};
				
		/*
		--- _GetTravelHTML function -----------------------------------------------------------------------------------

		This function returns an HTML element with the complete travel

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetTravelHTML = function ( ) {
			
			var travelHTML = _HTMLElementsFactory.create ( 'div', { className : _ClassNamePrefix + 'Travel'} ); 
			
			travelHTML.appendChild ( _GetTravelHeaderHTML ( ) );
			travelHTML.appendChild ( _GetTravelNotesHTML ( ) );
			
			var travelRoutesIterator = _TravelNotesData.travel.routes.iterator;
			while ( ! travelRoutesIterator.done ) {
				var useEditedRoute = _TravelNotesData.config.routeEditor.displayEditionInHTMLPage && travelRoutesIterator.value.objId === _TravelNotesData.routeEdition.routeInitialObjId;
				travelHTML.appendChild ( _GetRouteHeaderHTML ( useEditedRoute ? _TravelNotesData.editedRoute : travelRoutesIterator.value ) );
				travelHTML.appendChild ( _GetRouteManeuversAndNotesHTML ( useEditedRoute ? _TravelNotesData.editedRoute :travelRoutesIterator.value ) );
				travelHTML.appendChild ( _GetRouteFooterHTML ( useEditedRoute ? _TravelNotesData.editedRoute : travelRoutesIterator.value ) );
			}
			
			travelHTML.appendChild ( _GetTravelFooterHTML ( ) );

			return travelHTML;
		};

		/* 
		--- HTMLViewsFactory object -----------------------------------------------------------------------------------
		
		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			
			set classNamePrefix ( ClassNamePrefix ) { _ClassNamePrefix = ClassNamePrefix; },
			get classNamePrefix ( ) { return _ClassNamePrefix; },
			
			get travelHeaderHTML ( )  { return _GetTravelHeaderHTML ( ); }, 
			
			get travelNotesHTML ( )  { return _GetTravelNotesHTML ( ); }, 
			
			get routeHeaderHTML ( )  { return _GetRouteHeaderHTML ( _TravelNotesData.editedRoute ); }, 
			
			get routeManeuversAndNotesHTML ( )  { return _GetRouteManeuversAndNotesHTML ( _TravelNotesData.editedRoute ); }, 
			
			get routeFooterHTML ( )  { return _GetRouteFooterHTML ( _TravelNotesData.editedRoute ); }, 
			
			get travelFooterHTML ( )  { return _GetTravelFooterHTML ( ); }, 
			
			get travelHTML ( ) { return  _GetTravelHTML ( ); }
		};
			
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = HTMLViewsFactory;
	}

}());

/*
--- End of HTMLViewsFactory.js file --------------------------------------------------------------------------------
*/	