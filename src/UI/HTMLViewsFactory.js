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
		- Added noteObjId in the m_AddNoteHTML function
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #70 : Put the get...HTML functions outside of the editors
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newHTMLViewsFactory };

import { g_Translator } from '../UI/Translator.js';
import { g_Config } from '../data/Config.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { newObjId } from '../data/ObjId.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newUtilities } from '../util/Utilities.js';

function newHTMLViewsFactory ( classNamePrefix ) {

	let m_HTMLElementsFactory = newHTMLElementsFactory ( );

	let m_Utilities = newUtilities ( );

	let m_SvgIconSize = g_Config.note.svgIconWidth;

	let m_ClassNamePrefix = classNamePrefix || 'TravelNotes-Control-';

	/*
	--- m_AddNoteHTML function ----------------------------------------------------------------------------------------

	This function add to the rowDiv parameter two div with the note icon ant the note content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddNoteHTML ( note, rowDiv ) {
		let iconCell = m_HTMLElementsFactory.create (
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
				innerHTML : m_GetNoteHTML ( note )
			},
			rowDiv
		);
		rowDiv.noteObjId = note.objId;
	}

	/*
	--- m_GetTravelHeaderHTML function --------------------------------------------------------------------------------

	This function returns an HTML element with the travel's header

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetTravelHeaderHTML ( ) {
		let travelHeaderHTML = m_HTMLElementsFactory.create ( 'div', { className : m_ClassNamePrefix + 'Travel-Header' } );
		m_HTMLElementsFactory.create (
			'div',
			{
				className : m_ClassNamePrefix + 'Travel-Header-Name',
				innerHTML : g_TravelNotesData.travel.name
			},
			travelHeaderHTML
		);

		let travelDistance = 0;
		let travelRoutesIterator = g_TravelNotesData.travel.routes.iterator;
		while ( ! travelRoutesIterator.done ) {
			m_HTMLElementsFactory.create (
				'div',
				{
					className : m_ClassNamePrefix + 'Travel-Header-RouteName',
					innerHTML :
						'<a href="#route' +
						travelRoutesIterator.value.objId +
						'">' + travelRoutesIterator.value.name +
						'</a>' + '&nbsp;:&nbsp;' +
						m_Utilities.formatDistance ( travelRoutesIterator.value.distance ) + '.'
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
				innerHTML :
					g_Translator.getText ( 'HTMLViewsFactory - Travel distance&nbsp;:&nbsp;{distance}',
						{
							distance : m_Utilities.formatDistance ( travelDistance )
						}
					)
			},
			travelHeaderHTML
		);

		return travelHeaderHTML;
	}

	/*
	--- m_GetTravelNotesHTML function ---------------------------------------------------------------------------------

	This function returns an HTML element with the travel's notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetTravelNotesHTML ( ) {
		let travelNotesHTML = m_HTMLElementsFactory.create ( 'div', { className : m_ClassNamePrefix + 'Travel-Notes' } );
		let travelNotesIterator = g_TravelNotesData.travel.notes.iterator;
		while ( ! travelNotesIterator.done ) {
			let rowDiv = m_HTMLElementsFactory.create (
				'div',
				{ className : m_ClassNamePrefix + 'Travel-Notes-Row' },
				travelNotesHTML
			);
			m_AddNoteHTML ( travelNotesIterator.value, rowDiv ) ;
		}

		return travelNotesHTML;
	}

	/*
	--- m_GetRouteHeaderHTML function ---------------------------------------------------------------------------------

	This function returns an HTML element with the route header

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetRouteHeaderHTML ( route ) {
		return m_HTMLElementsFactory.create (
			'div',
			{
				className : m_ClassNamePrefix + 'Route-Header',
				id : 'route' + route.objId,
				innerHTML : m_GetRouteHTML ( route )
			}
		);
	}

	/*
	--- m_GetRouteManeuversAndNotesHTML function ----------------------------------------------------------------------

	This function returns an HTML element with the route maneuvers and notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetRouteManeuversAndNotesHTML ( route ) {
		let routeManeuversAndNotesHTML = m_HTMLElementsFactory.create (
			'div',
			{
				className : m_ClassNamePrefix + 'Route-ManeuversAndNotes'
			}
		);

		let notesIterator = route.notes.iterator;
		let notesDone =  notesIterator.done;
		let notesDistance = notesDone ? Number.MAX_VALUE : notesIterator.value.distance ;
		let previousNotesDistance = notesDistance;

		let maneuversIterator = route.itinerary.maneuvers.iterator;
		let maneuversDone = maneuversIterator.done;
		let maneuversDistance = 0;

		while ( ! ( maneuversDone && notesDone ) ) {
			let rowDiv = m_HTMLElementsFactory.create (
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
							className :
								m_ClassNamePrefix +
								'Route-ManeuversAndNotes-IconCell ' +
								'TravelNotes-ManeuverNote-' +
								maneuversIterator.value.iconName
						},
						rowDiv
					);

					let maneuverText =
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
					rowDiv.latLng =
						route.itinerary.itineraryPoints.getAt ( maneuversIterator.value.itineraryPointObjId ).latLng;
					rowDiv.maneuverObjId = maneuversIterator.value.objId;

					maneuversDistance +=  maneuversIterator.value.distance;
					maneuversDone = maneuversIterator.done;
					if ( maneuversDone ) {
						maneuversDistance = Number.MAX_VALUE;
					}
				}
			}
			else if ( ! notesDone ) {
				rowDiv.className = m_ClassNamePrefix + 'Route-Notes-Row';

				m_AddNoteHTML ( notesIterator.value, rowDiv );

				rowDiv.objId= newObjId ( );
				rowDiv.latLng = notesIterator.value.latLng;
				rowDiv.noteObjId = notesIterator.value.objId;
				previousNotesDistance = notesIterator.value.distance;
				notesDone = notesIterator.done;
				notesDistance = notesDone ? Number.MAX_VALUE :  notesIterator.value.distance;
				if ( ! notesDone  ) {
					let nextDistance = notesIterator.value.distance - previousNotesDistance;
					if ( 9 < nextDistance ) {
						m_HTMLElementsFactory.create (
							'div',
							{
								className : m_ClassNamePrefix + 'NoteHtml-NextDistance',
								innerHTML :
									g_Translator.getText (
										'HTMLViewsFactory - Next distance&nbsp;:&nbsp;{distance}',
										{ distance : m_Utilities.formatDistance ( nextDistance ) }
									)
							},
							rowDiv.lastChild
						);
					}
				}
			}
		}

		return routeManeuversAndNotesHTML;
	}

	/*
	--- m_GetRouteFooterHTML function ---------------------------------------------------------------------------------

	This function returns an HTML element with the route footer

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetRouteFooterHTML ( route ) {
		let innerHTML = '';
		if ( ( '' !== route.itinerary.provider ) && ( '' !== route.itinerary.transitMode ) ) {
			innerHTML = g_Translator.getText (
				'HTMLViewsFactory - Itinerary computed by {provider} and optimized for {transitMode}',
				{
					provider : route.itinerary.provider,
					transitMode : g_Translator.getText ( 'HTMLViewsFactory - TransitMode ' +	route.itinerary.transitMode )
				}
			);
		}

		return m_HTMLElementsFactory.create (
			'div',
			{
				className : m_ClassNamePrefix + 'RouteFooter',
				innerHTML : innerHTML
			}
		);
	}

	/*
	--- m_GetTravelFooterHTML function --------------------------------------------------------------------------------

	This function returns an HTML element with the travel's footer

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetTravelFooterHTML ( ) {
		return m_HTMLElementsFactory.create (
			'div',
			{
				className : m_ClassNamePrefix + 'TravelFooter',
				innerHTML : g_Translator.getText ( 'HTMLViewsFactory - Travel footer' )
			}
		);
	}

	/*
	--- m_GetTravelHTML function --------------------------------------------------------------------------------------

	This function returns an HTML element with the complete travel

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetTravelHTML ( ) {

		let travelHTML = m_HTMLElementsFactory.create ( 'div', { className : m_ClassNamePrefix + 'Travel' } );

		travelHTML.appendChild ( m_GetTravelHeaderHTML ( ) );
		travelHTML.appendChild ( m_GetTravelNotesHTML ( ) );

		let travelRoutesIterator = g_TravelNotesData.travel.routes.iterator;
		while ( ! travelRoutesIterator.done ) {
			let useEditedRoute =
				g_Config.routeEditor.displayEditionInHTMLPage
				&&
				travelRoutesIterator.value.objId === g_TravelNotesData.editedRouteObjId;
			travelHTML.appendChild (
				m_GetRouteHeaderHTML (
					useEditedRoute
						?
						g_TravelNotesData.travel.editedRoute
						:
						travelRoutesIterator.value
				)
			);
			travelHTML.appendChild (
				m_GetRouteManeuversAndNotesHTML (
					useEditedRoute
						?
						g_TravelNotesData.travel.editedRoute
						:
						travelRoutesIterator.value
				)
			);
			travelHTML.appendChild (
				m_GetRouteFooterHTML (
					useEditedRoute
						?
						g_TravelNotesData.travel.editedRoute
						:
						travelRoutesIterator.value
				)
			);
		}

		travelHTML.appendChild ( m_GetTravelFooterHTML ( ) );

		return travelHTML;
	}

	/*
	--- m_GetRouteHTML function ---------------------------------------------------------------------------------------

	This function returns an HTML string with the route contents. This string will be used in the
	route popup and on the roadbook page

	parameters:
	- route : the TravelNotes route object

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetRouteHTML ( route ) {

		let returnValue = '<div class="' + m_ClassNamePrefix + 'Route-Header-Name">' +
			route.name +
			'</div>';
		if ( 0 !== route.distance ) {
			returnValue +=
				'<div class="' +
				m_ClassNamePrefix +
				'Route-Header-Distance">' +
				g_Translator.getText (
					'RouteEditor - Distance',
					{ distance : m_Utilities.formatDistance ( route.distance ) }
				) +
				'</div>';
		}
		if ( ! g_TravelNotesData.travel.readOnly ) {
			returnValue +=
				'<div class="' +
				m_ClassNamePrefix +
				'Route-Header-Duration">' +
				g_Translator.getText (
					'RouteEditor - Duration',
					{ duration : m_Utilities.formatTime ( route.duration ) }
				) +
				'</div>';
		}

		return returnValue;
	}

	/*
	--- m_GetNoteHTML function ----------------------------------------------------------------------------------------

	This function returns an HTML string with the note contents. This string will be used in the
	note popup and on the roadbook page

	parameters:
	- note : the TravelNotes object

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetNoteHTML ( note ) {

		let noteText = '';
		if ( 0 !== note.tooltipContent.length ) {
			noteText +=
				'<div class="' +
				m_ClassNamePrefix +
				'NoteHtml-TooltipContent">' +
				note.tooltipContent +
				'</div>';
		}
		if ( 0 !== note.popupContent.length ) {
			noteText +=
				'<div class="' +
				m_ClassNamePrefix +
				'NoteHtml-PopupContent">' +
				note.popupContent +
				'</div>';
		}
		if ( 0 !== note.address.length ) {
			noteText +=
				'<div class="' +
				m_ClassNamePrefix +
				'NoteHtml-Address">' +
				g_Translator.getText ( 'NoteEditor - Address' ) +
				note.address + '</div>';
		}
		if ( 0 !== note.phone.length ) {
			noteText +=
				'<div class="' +
				m_ClassNamePrefix +
				'NoteHtml-Phone">' +
				g_Translator.getText ( 'NoteEditor - Phone' )
				+ note.phone + '</div>';
		}
		if ( 0 !== note.url.length ) {
			noteText +=
				'<div class="' +
				m_ClassNamePrefix +
				'NoteHtml-Url">' +
				g_Translator.getText ( 'NoteEditor - Link' ) +
				'<a href="' +
				note.url +
				'" target="_blank">' +
				note.url.substr ( 0, 40 ) +
				'...' +
				'</a></div>';
		}
		let utilities = newUtilities ( );
		noteText += '<div class="' + m_ClassNamePrefix + 'NoteHtml-LatLng">' +
			g_Translator.getText (
				'NoteEditor - Latitude Longitude',
				{
					lat : utilities.formatLat ( note.lat ),
					lng : utilities.formatLng ( note.lng )
				}
			) + '</div>';

		if ( -1 !== note.distance ) {
			noteText += '<div class="' + m_ClassNamePrefix + 'NoteHtml-Distance">' +
				g_Translator.getText (
					'NoteEditor - Distance',
					{
						distance : utilities.formatDistance ( note.chainedDistance + note.distance )
					}
				) + '</div>';
		}

		return noteText;
	}

	/*
	--- HTMLViewsFactory object ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			get travelHeaderHTML ( )  { return m_GetTravelHeaderHTML ( ); },

			get travelNotesHTML ( )  { return m_GetTravelNotesHTML ( ); },

			get routeHeaderHTML ( )  { return m_GetRouteHeaderHTML ( g_TravelNotesData.travel.editedRoute ); },

			get routeManeuversAndNotesHTML ( ) {
				return m_GetRouteManeuversAndNotesHTML ( g_TravelNotesData.travel.editedRoute );
			},

			get routeFooterHTML ( )  { return m_GetRouteFooterHTML ( g_TravelNotesData.travel.editedRoute ); },

			get travelFooterHTML ( )  { return m_GetTravelFooterHTML ( ); },

			get travelHTML ( ) { return  m_GetTravelHTML ( ); },

			getRouteHTML : ( route ) => { return m_GetRouteHTML ( route ); },

			getNoteHTML : ( note ) => { return m_GetNoteHTML ( note ); }

		}
	);
}

/*
--- End of HTMLViewsFactory.js file -----------------------------------------------------------------------------------
*/