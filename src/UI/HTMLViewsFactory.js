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
--- HTMLViewsFactory.js file ------------------------------------------------------------------------------------------
This file contains:
	- the HTMLViewsFactory function
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- Added noteObjId in the _AddNoteHTML function
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newHTMLViewsFactory };

import { g_Translator } from '../UI/Translator.js';
import { g_Config } from '../data/Config.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_RouteEditor } from '../core/RouteEditor.js';
import { g_NoteEditor } from '../core/NoteEditor.js';

import { newObjId } from '../data/ObjId.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newUtilities } from '../util/Utilities.js';

var newHTMLViewsFactory = function ( ) {
	

	var m_HTMLElementsFactory = newHTMLElementsFactory ( );
	
	var m_Utilities = newUtilities ( );

	var m_SvgIconSize = g_Config.note.svgIconWidth;

	var m_ClassNamePrefix = 'TravelNotes-Control-';
			
	/*
	--- _AddNoteHTML function -----------------------------------------------------------------------------------------

	This function add to the rowDiv parameter two div with the note icon ant the note content

	-------------------------------------------------------------------------------------------------------------------
	*/

	var _AddNoteHTML = function ( note, rowDiv ) {
		var iconCell = m_HTMLElementsFactory.create (
			'div',
			{ 
				className : m_ClassNamePrefix + 'Travel-Notes-IconCell',
				innerHTML : note.iconContent
			}, 
			rowDiv
		);
		if ( ( 'svg' === iconCell.firstChild.tagName ) && ( 'TravelNotes-Roadbook-' === m_ClassNamePrefix ) ) {
			iconCell.firstChild.setAttributeNS ( null, "viewBox", "0 0 " + m_SvgIconSize + " " + m_SvgIconSize);
		}
		
		m_HTMLElementsFactory.create (
			'div',
			{ 
				className : m_ClassNamePrefix + 'Travel-Notes-Cell',
				innerHTML : g_NoteEditor.getNoteHTML ( note, m_ClassNamePrefix )
			}, 
			rowDiv
		);
		rowDiv.noteObjId = note.objId;
	};
			
	/*
	--- _GetTravelHeaderHTML function ---------------------------------------------------------------------------------

	This function returns an HTML element with the travel's header

	-------------------------------------------------------------------------------------------------------------------
	*/

	var _GetTravelHeaderHTML = function ( ) {
		var travelHeaderHTML = m_HTMLElementsFactory.create ( 'div', { className :  m_ClassNamePrefix + 'Travel-Header' } ); 
		m_HTMLElementsFactory.create ( 
			'div',
			{ 
				className : m_ClassNamePrefix + 'Travel-Header-Name',
				innerHTML: g_TravelNotesData.travel.name
			},
			travelHeaderHTML
		); 
		
		var travelDistance = 0;
		var travelRoutesIterator = g_TravelNotesData.travel.routes.iterator;
		while ( ! travelRoutesIterator.done ) {
			m_HTMLElementsFactory.create ( 
				'div',
				{ 
					className : m_ClassNamePrefix + 'Travel-Header-RouteName',
					innerHTML: '<a href="#route' +  travelRoutesIterator.value.objId + '">' + travelRoutesIterator.value.name + '</a>' + '&nbsp;:&nbsp;' + m_Utilities.formatDistance ( travelRoutesIterator.value.distance ) + '.'
				},
				travelHeaderHTML
			); 
			if ( travelRoutesIterator.value.chain ) {
				travelDistance += travelRoutesIterator.value.distance;
			}
		}

		m_HTMLElementsFactory.create ( 
			'div',
			{ 
				className : m_ClassNamePrefix + 'Travel-Header-TravelDistance',
				innerHTML:  g_Translator.getText ( 'HTMLViewsFactory - Travel distance&nbsp;:&nbsp;{distance}', { distance : m_Utilities.formatDistance ( travelDistance ) } )
			},
			travelHeaderHTML
		); 

		return travelHeaderHTML;
	};

			
	/*
	--- _GetTravelNotesHTML function ----------------------------------------------------------------------------------

	This function returns an HTML element with the travel's notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	var _GetTravelNotesHTML = function ( ) {
		var travelNotesHTML = m_HTMLElementsFactory.create ( 'div', { className :  m_ClassNamePrefix + 'Travel-Notes'} ); 
		var travelNotesIterator = g_TravelNotesData.travel.notes.iterator;
		while ( ! travelNotesIterator.done ) {
			var rowDiv = m_HTMLElementsFactory.create ( 
				'div', 
				{ className : m_ClassNamePrefix + 'Travel-Notes-Row'}, 
				travelNotesHTML
			);
			_AddNoteHTML ( travelNotesIterator.value, rowDiv ) ;
		}
		
		return travelNotesHTML;
	};
			
	/*
	--- _GetRouteHeaderHTML function ----------------------------------------------------------------------------------

	This function returns an HTML element with the route header

	-------------------------------------------------------------------------------------------------------------------
	*/

	var _GetRouteHeaderHTML = function ( route ) {
		return m_HTMLElementsFactory.create ( 
			'div',
			{ 
				className : m_ClassNamePrefix + 'Route-Header',
				id : 'route' + route.objId,
				innerHTML: g_RouteEditor.getRouteHTML ( route, m_ClassNamePrefix )
			}
		); 
	};
			
	/*
	--- _GetRouteManeuversAndNotesHTML function -----------------------------------------------------------------------

	This function returns an HTML element with the route maneuvers and notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	var _GetRouteManeuversAndNotesHTML = function ( route ) {
		var routeManeuversAndNotesHTML = m_HTMLElementsFactory.create ( 'div', { className : m_ClassNamePrefix + 'Route-ManeuversAndNotes' } ); 
		
		var notesIterator = route.notes.iterator;
		var notesDone =  notesIterator.done;
		var notesDistance = ! notesDone ? notesIterator.value.distance : Number.MAX_VALUE;
		var previousNotesDistance = notesDistance;
		
		var maneuversIterator = route.itinerary.maneuvers.iterator;
		var maneuversDone = maneuversIterator.done;
		var maneuversDistance = 0;
		
		
		while ( ! ( maneuversDone && notesDone ) ) {
			var rowDiv = m_HTMLElementsFactory.create ( 
				'div', 
				{ className : m_ClassNamePrefix + 'Route-ManeuversAndNotes-Row' }, 
				routeManeuversAndNotesHTML
			);

			if ( maneuversDistance <= notesDistance ) {
				if ( ! maneuversDone ) {
					rowDiv.className = m_ClassNamePrefix + 'Route-Maneuvers-Row';
					m_HTMLElementsFactory.create (
						'div',
						{ 
							className : m_ClassNamePrefix + 'Route-ManeuversAndNotes-IconCell ' + 'TravelNotes-ManeuverNote-' + maneuversIterator.value.iconName,
						}, 
						rowDiv
					);
					
					var maneuverText = 
						'<div>' +  maneuversIterator.value.instruction + '</div>';
					
					if ( 0 < maneuversIterator.value.distance ) {
						maneuverText +=	'<div>' + 
							g_Translator.getText ( 
								'HTMLViewsFactory - To next instruction&nbsp;:&nbsp;{distance}&nbsp;-&nbsp;{duration}', 
								{
									distance : m_Utilities.formatDistance ( maneuversIterator.value.distance ),
									duration : m_Utilities.formatTime (maneuversIterator.value.duration )
								}
							) + '</div>';
					}
					m_HTMLElementsFactory.create (
						'div',
						{ 
							className : m_ClassNamePrefix + 'Route-ManeuversAndNotes-Cell',
							innerHTML : maneuverText
						}, 
						rowDiv
					);
					
					rowDiv.objId= newObjId ( );
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
					rowDiv.className = m_ClassNamePrefix + 'Route-Notes-Row';

					_AddNoteHTML ( notesIterator.value, rowDiv );

					rowDiv.objId= newObjId ( );
					rowDiv.latLng = notesIterator.value.latLng;
					rowDiv.noteObjId = notesIterator.value.objId;
					previousNotesDistance = notesIterator.value.distance;
					notesDone = notesIterator.done;
					notesDistance = notesDone ? Number.MAX_VALUE :  notesIterator.value.distance;
					if ( ! notesDone  ) {
						var nextDistance = notesIterator.value.distance - previousNotesDistance;
						if ( 9 < nextDistance ) {
							m_HTMLElementsFactory.create (
								'div',
								{ 
									className : m_ClassNamePrefix + 'NoteHtml-NextDistance',
									innerHTML : g_Translator.getText ( 'HTMLViewsFactory - Next distance&nbsp;:&nbsp;{distance}', { distance : m_Utilities.formatDistance ( nextDistance ) } )
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
	--- _GetRouteFooterHTML function ----------------------------------------------------------------------------------

	This function returns an HTML element with the route footer

	-------------------------------------------------------------------------------------------------------------------
	*/

	var _GetRouteFooterHTML = function ( route ) {
		var innerHTML = '';
		if ( ( '' !== route.itinerary.provider ) && ( '' !== route.itinerary.transitMode ) ) {
			innerHTML = g_Translator.getText ( 
				'HTMLViewsFactory - Itinerary computed by {provider} and optimized for {transitMode}', 
				{
					provider: route.itinerary.provider, 
					transitMode : g_Translator.getText ( 'HTMLViewsFactory - TransitMode ' +	route.itinerary.transitMode )
				} 
			);
		}
		
		return m_HTMLElementsFactory.create ( 'div', { className : m_ClassNamePrefix + 'RouteFooter',	innerHTML : innerHTML } ); 
	};
			
	/*
	--- _GetTravelFooterHTML function ---------------------------------------------------------------------------------

	This function returns an HTML element with the travel's footer

	-------------------------------------------------------------------------------------------------------------------
	*/

	var _GetTravelFooterHTML = function ( ) {
		return m_HTMLElementsFactory.create ( 
			'div',
			{ 
				className : m_ClassNamePrefix + 'TravelFooter',
				innerHTML : g_Translator.getText ( 'HTMLViewsFactory - Travel footer' )
			} 
		); 
	};
			
	/*
	--- _GetTravelHTML function ---------------------------------------------------------------------------------------

	This function returns an HTML element with the complete travel

	-------------------------------------------------------------------------------------------------------------------
	*/

	var _GetTravelHTML = function ( ) {
		
		var travelHTML = m_HTMLElementsFactory.create ( 'div', { className : m_ClassNamePrefix + 'Travel'} ); 
		
		travelHTML.appendChild ( _GetTravelHeaderHTML ( ) );
		travelHTML.appendChild ( _GetTravelNotesHTML ( ) );
		
		var travelRoutesIterator = g_TravelNotesData.travel.routes.iterator;
		while ( ! travelRoutesIterator.done ) {
			var useEditedRoute = g_Config.routeEditor.displayEditionInHTMLPage && travelRoutesIterator.value.objId === g_TravelNotesData.editedRouteObjId;
			travelHTML.appendChild ( _GetRouteHeaderHTML ( useEditedRoute ? g_TravelNotesData.travel.editedRoute : travelRoutesIterator.value ) );
			travelHTML.appendChild ( _GetRouteManeuversAndNotesHTML ( useEditedRoute ? g_TravelNotesData.travel.editedRoute :travelRoutesIterator.value ) );
			travelHTML.appendChild ( _GetRouteFooterHTML ( useEditedRoute ? g_TravelNotesData.travel.editedRoute : travelRoutesIterator.value ) );
		}
		
		travelHTML.appendChild ( _GetTravelFooterHTML ( ) );

		return travelHTML;
	};

	/* 
	--- HTMLViewsFactory object ---------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			
			set classNamePrefix ( ClassNamePrefix ) { m_ClassNamePrefix = ClassNamePrefix; },
			get classNamePrefix ( ) { return m_ClassNamePrefix; },
			
			get travelHeaderHTML ( )  { return _GetTravelHeaderHTML ( ); }, 
			
			get travelNotesHTML ( )  { return _GetTravelNotesHTML ( ); }, 
			
			get routeHeaderHTML ( )  { return _GetRouteHeaderHTML ( g_TravelNotesData.travel.editedRoute ); }, 
			
			get routeManeuversAndNotesHTML ( )  { return _GetRouteManeuversAndNotesHTML ( g_TravelNotesData.travel.editedRoute ); }, 
			
			get routeFooterHTML ( )  { return _GetRouteFooterHTML ( g_TravelNotesData.travel.editedRoute ); }, 
			
			get travelFooterHTML ( )  { return _GetTravelFooterHTML ( ); }, 
			
			get travelHTML ( ) { return  _GetTravelHTML ( ); }
		}
	);
};

/*
--- End of HTMLViewsFactory.js file -----------------------------------------------------------------------------------
*/	