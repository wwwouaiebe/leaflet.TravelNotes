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
		- Added noteObjId in the myAddNoteHTML function
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

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newObjId } from '../data/ObjId.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newUtilities } from '../util/Utilities.js';

function newHTMLViewsFactory ( classNamePrefix ) {

	let myHTMLElementsFactory = newHTMLElementsFactory ( );

	let myUtilities = newUtilities ( );

	let mySvgIconSize = theConfig.note.svgIconWidth;

	let myClassNamePrefix = classNamePrefix || 'TravelNotes-Control-';

	/*
	--- myAddNoteHTML function ----------------------------------------------------------------------------------------

	This function add to the rowDiv parameter two div with the note icon ant the note content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddNoteHTML ( note, rowDiv ) {
		let iconCell = myHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'Travel-Notes-IconCell',
				innerHTML : note.iconContent
			},
			rowDiv
		);
		if ( ( 'svg' === iconCell.firstChild.tagName ) && ( 'TravelNotes-Roadbook-' === myClassNamePrefix ) ) {
			iconCell.firstChild.setAttributeNS ( null, 'viewBox', '0 0 ' + mySvgIconSize + ' ' + mySvgIconSize );
		}

		myHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'Travel-Notes-Cell',
				innerHTML : myGetNoteHTML ( note )
			},
			rowDiv
		);
		rowDiv.noteObjId = note.objId;
	}

	/*
	--- myGetTravelHeaderHTML function --------------------------------------------------------------------------------

	This function returns an HTML element with the travel's header

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetTravelHeaderHTML ( ) {
		let travelHeaderHTML = myHTMLElementsFactory.create ( 'div', { className : myClassNamePrefix + 'Travel-Header' } );
		myHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'Travel-Header-Name',
				innerHTML : theTravelNotesData.travel.name
			},
			travelHeaderHTML
		);

		let travelDistance = 0;
		let travelRoutesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! travelRoutesIterator.done ) {
			myHTMLElementsFactory.create (
				'div',
				{
					className : myClassNamePrefix + 'Travel-Header-RouteName',
					innerHTML :
						'<a href="#route' +
						travelRoutesIterator.value.objId +
						'">' + travelRoutesIterator.value.name +
						'</a>' + '&nbsp;:&nbsp;' +
						myUtilities.formatDistance ( travelRoutesIterator.value.distance ) + '.'
				},
				travelHeaderHTML
			);
			if ( travelRoutesIterator.value.chain ) {
				travelDistance += travelRoutesIterator.value.distance;
			}
		}

		myHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'Travel-Header-TravelDistance',
				innerHTML :
					theTranslator.getText ( 'HTMLViewsFactory - Travel distance&nbsp;:&nbsp;{distance}',
						{
							distance : myUtilities.formatDistance ( travelDistance )
						}
					)
			},
			travelHeaderHTML
		);

		return travelHeaderHTML;
	}

	/*
	--- myGetTravelNotesHTML function ---------------------------------------------------------------------------------

	This function returns an HTML element with the travel's notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetTravelNotesHTML ( ) {
		let travelNotesHTML = myHTMLElementsFactory.create ( 'div', { className : myClassNamePrefix + 'Travel-Notes' } );
		let travelNotesIterator = theTravelNotesData.travel.notes.iterator;
		while ( ! travelNotesIterator.done ) {
			let rowDiv = myHTMLElementsFactory.create (
				'div',
				{ className : myClassNamePrefix + 'Travel-Notes-Row' },
				travelNotesHTML
			);
			myAddNoteHTML ( travelNotesIterator.value, rowDiv );
		}

		return travelNotesHTML;
	}

	/*
	--- myGetRouteHeaderHTML function ---------------------------------------------------------------------------------

	This function returns an HTML element with the route header

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetRouteHeaderHTML ( route ) {
		return myHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'Route-Header',
				id : 'route' + route.objId,
				innerHTML : myGetRouteHTML ( route )
			}
		);
	}

	/*
	--- myGetRouteManeuversAndNotesHTML function ----------------------------------------------------------------------

	This function returns an HTML element with the route maneuvers and notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetRouteManeuversAndNotesHTML ( route ) {
		let routeManeuversAndNotesHTML = myHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'Route-ManeuversAndNotes'
			}
		);

		let notesIterator = route.notes.iterator;
		let notesDone =  notesIterator.done;
		let notesDistance = notesDone ? Number.MAX_VALUE : notesIterator.value.distance;
		let previousNotesDistance = notesDistance;

		let maneuversIterator = route.itinerary.maneuvers.iterator;
		let maneuversDone = maneuversIterator.done;
		let maneuversDistance = 0;

		while ( ! ( maneuversDone && notesDone ) ) {
			let rowDiv = myHTMLElementsFactory.create (
				'div',
				{ className : myClassNamePrefix + 'Route-ManeuversAndNotes-Row' },
				routeManeuversAndNotesHTML
			);

			if ( maneuversDistance <= notesDistance ) {
				if ( ! maneuversDone ) {
					rowDiv.className = myClassNamePrefix + 'Route-Maneuvers-Row';
					myHTMLElementsFactory.create (
						'div',
						{
							className :
								myClassNamePrefix +
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
							theTranslator.getText (
								'HTMLViewsFactory - To next instruction&nbsp;:&nbsp;{distance}&nbsp;-&nbsp;{duration}',
								{
									distance : myUtilities.formatDistance ( maneuversIterator.value.distance ),
									duration : myUtilities.formatTime ( maneuversIterator.value.duration )
								}
							) + '</div>';
					}
					myHTMLElementsFactory.create (
						'div',
						{
							className : myClassNamePrefix + 'Route-ManeuversAndNotes-Cell',
							innerHTML : maneuverText
						},
						rowDiv
					);

					rowDiv.objId = newObjId ( );
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
				rowDiv.className = myClassNamePrefix + 'Route-Notes-Row';

				myAddNoteHTML ( notesIterator.value, rowDiv );

				rowDiv.objId = newObjId ( );
				rowDiv.latLng = notesIterator.value.latLng;
				rowDiv.noteObjId = notesIterator.value.objId;
				previousNotesDistance = notesIterator.value.distance;
				notesDone = notesIterator.done;
				notesDistance = notesDone ? Number.MAX_VALUE :  notesIterator.value.distance;
				if ( ! notesDone  ) {
					let nextDistance = notesIterator.value.distance - previousNotesDistance;
					if ( 9 < nextDistance ) {
						myHTMLElementsFactory.create (
							'div',
							{
								className : myClassNamePrefix + 'NoteHtml-NextDistance',
								innerHTML :
									theTranslator.getText (
										'HTMLViewsFactory - Next distance&nbsp;:&nbsp;{distance}',
										{ distance : myUtilities.formatDistance ( nextDistance ) }
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
	--- myGetRouteFooterHTML function ---------------------------------------------------------------------------------

	This function returns an HTML element with the route footer

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetRouteFooterHTML ( route ) {
		let innerHTML = '';
		if ( ( '' !== route.itinerary.provider ) && ( '' !== route.itinerary.transitMode ) ) {
			innerHTML = theTranslator.getText (
				'HTMLViewsFactory - Itinerary computed by {provider} and optimized for {transitMode}',
				{
					provider : route.itinerary.provider,
					transitMode : theTranslator.getText ( 'HTMLViewsFactory - TransitMode ' +	route.itinerary.transitMode )
				}
			);
		}

		return myHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'RouteFooter',
				innerHTML : innerHTML
			}
		);
	}

	/*
	--- myGetTravelFooterHTML function --------------------------------------------------------------------------------

	This function returns an HTML element with the travel's footer

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetTravelFooterHTML ( ) {
		return myHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'TravelFooter',
				innerHTML : theTranslator.getText ( 'HTMLViewsFactory - Travel footer' )
			}
		);
	}

	/*
	--- myGetTravelHTML function --------------------------------------------------------------------------------------

	This function returns an HTML element with the complete travel

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetTravelHTML ( ) {

		let travelHTML = myHTMLElementsFactory.create ( 'div', { className : myClassNamePrefix + 'Travel' } );

		travelHTML.appendChild ( myGetTravelHeaderHTML ( ) );
		travelHTML.appendChild ( myGetTravelNotesHTML ( ) );

		let travelRoutesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! travelRoutesIterator.done ) {
			let useEditedRoute =
				theConfig.routeEditor.displayEditionInHTMLPage
				&&
				travelRoutesIterator.value.objId === theTravelNotesData.editedRouteObjId;
			travelHTML.appendChild (
				myGetRouteHeaderHTML (
					useEditedRoute
						?
						theTravelNotesData.travel.editedRoute
						:
						travelRoutesIterator.value
				)
			);
			travelHTML.appendChild (
				myGetRouteManeuversAndNotesHTML (
					useEditedRoute
						?
						theTravelNotesData.travel.editedRoute
						:
						travelRoutesIterator.value
				)
			);
			travelHTML.appendChild (
				myGetRouteFooterHTML (
					useEditedRoute
						?
						theTravelNotesData.travel.editedRoute
						:
						travelRoutesIterator.value
				)
			);
		}

		travelHTML.appendChild ( myGetTravelFooterHTML ( ) );

		return travelHTML;
	}

	/*
	--- myGetRouteHTML function ---------------------------------------------------------------------------------------

	This function returns an HTML string with the route contents. This string will be used in the
	route popup and on the roadbook page

	parameters:
	- route : the TravelNotes route object

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetRouteHTML ( route ) {

		let returnValue = '<div class="' + myClassNamePrefix + 'Route-Header-Name">' +
			route.name +
			'</div>';
		if ( 0 !== route.distance ) {
			returnValue +=
				'<div class="' +
				myClassNamePrefix +
				'Route-Header-Distance">' +
				theTranslator.getText (
					'RouteEditor - Distance',
					{ distance : myUtilities.formatDistance ( route.distance ) }
				) +
				'</div>';
		}
		if ( ! theTravelNotesData.travel.readOnly ) {
			returnValue +=
				'<div class="' +
				myClassNamePrefix +
				'Route-Header-Duration">' +
				theTranslator.getText (
					'RouteEditor - Duration',
					{ duration : myUtilities.formatTime ( route.duration ) }
				) +
				'</div>';
		}

		return returnValue;
	}

	/*
	--- myGetNoteHTML function ----------------------------------------------------------------------------------------

	This function returns an HTML string with the note contents. This string will be used in the
	note popup and on the roadbook page

	parameters:
	- note : the TravelNotes object

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetNoteHTML ( note ) {

		let noteText = '';
		if ( 0 !== note.tooltipContent.length ) {
			noteText +=
				'<div class="' +
				myClassNamePrefix +
				'NoteHtml-TooltipContent">' +
				note.tooltipContent +
				'</div>';
		}
		if ( 0 !== note.popupContent.length ) {
			noteText +=
				'<div class="' +
				myClassNamePrefix +
				'NoteHtml-PopupContent">' +
				note.popupContent +
				'</div>';
		}
		if ( 0 !== note.address.length ) {
			noteText +=
				'<div class="' +
				myClassNamePrefix +
				'NoteHtml-Address">' +
				theTranslator.getText ( 'NoteEditor - Address' ) +
				note.address + '</div>';
		}
		if ( 0 !== note.phone.length ) {
			noteText +=
				'<div class="' +
				myClassNamePrefix +
				'NoteHtml-Phone">' +
				theTranslator.getText ( 'NoteEditor - Phone' )
				+ note.phone + '</div>';
		}
		if ( 0 !== note.url.length ) {
			noteText +=
				'<div class="' +
				myClassNamePrefix +
				'NoteHtml-Url">' +
				theTranslator.getText ( 'NoteEditor - Link' ) +
				'<a href="' +
				note.url +
				'" target="_blank">' +
				note.url.substr ( 0, 40 ) +
				'...' +
				'</a></div>';
		}
		let utilities = newUtilities ( );
		noteText += '<div class="' + myClassNamePrefix + 'NoteHtml-LatLng">' +
			theTranslator.getText (
				'NoteEditor - Latitude Longitude',
				{
					lat : utilities.formatLat ( note.lat ),
					lng : utilities.formatLng ( note.lng )
				}
			) + '</div>';

		if ( -1 !== note.distance ) {
			noteText += '<div class="' + myClassNamePrefix + 'NoteHtml-Distance">' +
				theTranslator.getText (
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

			get travelHeaderHTML ( )  { return myGetTravelHeaderHTML ( ); },

			get travelNotesHTML ( )  { return myGetTravelNotesHTML ( ); },

			get routeHeaderHTML ( )  { return myGetRouteHeaderHTML ( theTravelNotesData.travel.editedRoute ); },

			get routeManeuversAndNotesHTML ( ) {
				return myGetRouteManeuversAndNotesHTML ( theTravelNotesData.travel.editedRoute );
			},

			get routeFooterHTML ( )  { return myGetRouteFooterHTML ( theTravelNotesData.travel.editedRoute ); },

			get travelFooterHTML ( )  { return myGetTravelFooterHTML ( ); },

			get travelHTML ( ) { return  myGetTravelHTML ( ); },

			getRouteHTML : ( route ) => { return myGetRouteHTML ( route ); },

			getNoteHTML : ( note ) => { return myGetNoteHTML ( note ); }

		}
	);
}

/*
--- End of HTMLViewsFactory.js file -----------------------------------------------------------------------------------
*/