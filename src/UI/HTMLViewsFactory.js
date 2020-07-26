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
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newObjId } from '../data/ObjId.js';
import { newUtilities } from '../util/Utilities.js';
import { theConfig } from '../data/Config.js';
import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newProfileFactory } from '../core/ProfileFactory.js';
import { newGeometry } from '../util/Geometry.js';
import { DISTANCE, ZERO } from '../util/Constants.js';

function newHTMLViewsFactory ( classNamePrefix ) {

	const LINKS_MAX_LENGTH = 40;
	const MIN_NOTES_DISTANCE = 9;

	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myUtilities = newUtilities ( );
	let myProfileFactory = newProfileFactory ( );
	let myGeometry = newGeometry ( );
	let mySvgIconSize = theConfig.note.svgIconWidth;
	let myClassNamePrefix = classNamePrefix || 'TravelNotes-UI-';

	/*
	--- myGetNoteHTML function ----------------------------------------------------------------------------------------

	This function returns an HTML string with the note contents. This string will be used in the
	note popup, the itinerary pane and on the roadbook page

	parameters:
	- note : the TravelNotes object

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetNoteHTML ( noteAndRoute ) {
		let note = noteAndRoute.note;
		let noteText = '';
		if ( ZERO !== note.tooltipContent.length ) {
			noteText +=
				'<div class="' +
				myClassNamePrefix +
				'NoteHtml-TooltipContent">' +
				note.tooltipContent +
				'</div>';
		}
		if ( ZERO !== note.popupContent.length ) {
			noteText +=
				'<div class="' +
				myClassNamePrefix +
				'NoteHtml-PopupContent">' +
				note.popupContent +
				'</div>';
		}
		if ( ZERO !== note.address.length ) {
			noteText +=
				'<div class="' +
				myClassNamePrefix +
				'NoteHtml-Address">' +
				theTranslator.getText ( 'HTMLViewsFactory - Address' ) +
				note.address + '</div>';
		}
		if ( ZERO !== note.phone.length ) {
			noteText +=
				'<div class="' +
				myClassNamePrefix +
				'NoteHtml-Phone">' +
				theTranslator.getText ( 'HTMLViewsFactory - Phone' )
				+ note.phone + '</div>';
		}
		if ( ZERO !== note.url.length ) {
			noteText +=
				'<div class="' +
				myClassNamePrefix +
				'NoteHtml-Url">' +
				theTranslator.getText ( 'HTMLViewsFactory - Link' ) +
				'<a href="' +
				note.url +
				'" target="_blank">' +
				note.url.substr ( ZERO, LINKS_MAX_LENGTH ) +
				'...' +
				'</a></div>';
		}
		let utilities = newUtilities ( );
		noteText += '<div class="' + myClassNamePrefix + 'NoteHtml-LatLng">' +
			theTranslator.getText (
				'HTMLViewsFactory - Latitude Longitude',
				{
					lat : utilities.formatLat ( note.lat ),
					lng : utilities.formatLng ( note.lng )
				}
			) + '</div>';

		if ( noteAndRoute.route ) {
			if ( noteAndRoute.route.chain ) {
				noteText += '<div class="' + myClassNamePrefix + 'NoteHtml-Distance">' +
				theTranslator.getText (
					'HTMLViewsFactory - Distance from start of travel',
					{
						distance : utilities.formatDistance ( note.chainedDistance + note.distance )
					}
				) + '</div>';
			}
			noteText += '<div class="' + myClassNamePrefix + 'NoteHtml-Distance">' +
				theTranslator.getText (
					'HTMLViewsFactory - Distance from start of route',
					{
						distance : utilities.formatDistance ( note.distance )
					}
				) + '</div>';
		}

		return noteText;
	}

	/*
	--- myAddNoteHTML function ----------------------------------------------------------------------------------------

	This function add to the rowDiv parameter two div with the note icon ant the note content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddNoteHTML ( noteAndRoute, rowDiv ) {
		let iconCell = myHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'Travel-Notes-IconCell',
				innerHTML : noteAndRoute.note.iconContent
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
				innerHTML : myGetNoteHTML ( noteAndRoute )
			},
			rowDiv
		);
		rowDiv.noteObjId = noteAndRoute.note.objId;
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
			route.computedName +
			'</div>';
		if ( ZERO !== route.distance ) {
			returnValue +=
				'<div class="' +
				myClassNamePrefix +
				'Route-Header-Distance">' +
				theTranslator.getText (
					'HTMLViewsFactory - Distance',
					{ distance : myUtilities.formatDistance ( route.distance ) }
				) +
				'</div>';
		}
		if ( ! theTravelNotesData.travel.readOnly && 'bike' !== route.itinerary.transitMode ) {
			returnValue +=
				'<div class="' +
				myClassNamePrefix +
				'Route-Header-Duration">' +
				theTranslator.getText (
					'HTMLViewsFactory - Duration',
					{ duration : myUtilities.formatTime ( route.duration ) }
				) +
				'</div>';
		}

		if ( route.itinerary.hasProfile ) {
			returnValue +=
				'<div class="' +
				myClassNamePrefix +
				'Route-Header-Ascent">' +
				theTranslator.getText (
					'HTMLViewsFactory - Ascent',
					{ ascent : route.itinerary.ascent.toFixed ( ZERO ) }
				) +
				'</div><div class="' +
				myClassNamePrefix +
				'Route-Header-Descent">' +
				theTranslator.getText (
					'HTMLViewsFactory - Descent',
					{ descent : route.itinerary.descent.toFixed ( ZERO ) }
				) +
				'</div>';
		}

		return returnValue;
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

		let travelDistance = DISTANCE.defaultValue;
		let travelAscent = ZERO;
		let travelDescent = ZERO;
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {

			let route =
				( routesIterator.value.objId === theTravelNotesData.editedRouteObjId
					&&
					theConfig.routeEditor.displayEditionInHTMLPage
				)
					?
					theTravelNotesData.travel.editedRoute
					:
					routesIterator.value;
			myHTMLElementsFactory.create (
				'div',
				{
					className : myClassNamePrefix + 'Travel-Header-RouteName',
					innerHTML :
						'<a href="#route' +
						route.objId +
						'">' + route.computedName +
						'</a>' + '&nbsp;:&nbsp;' +
						myUtilities.formatDistance ( route.distance ) + '.'
				},
				travelHeaderHTML
			);
			if ( route.chain ) {
				travelDistance += route.distance;
				travelAscent += route.itinerary.ascent;
				travelDescent += route.itinerary.descent;
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

		if ( ZERO !== travelAscent ) {
			myHTMLElementsFactory.create (
				'div',
				{
					className : myClassNamePrefix + 'Travel-Header-TravelAscent',
					innerHTML :
						theTranslator.getText ( 'HTMLViewsFactory - Travel ascent&nbsp;:&nbsp;{ascent}',
							{
								ascent : travelAscent.toFixed ( ZERO )
							}
						)
				},
				travelHeaderHTML
			);
		}

		if ( ZERO !== travelDescent ) {
			myHTMLElementsFactory.create (
				'div',
				{
					className : myClassNamePrefix + 'Travel-Header-TravelDescent',
					innerHTML :
						theTranslator.getText ( 'HTMLViewsFactory - Travel descent&nbsp;:&nbsp;{descent}',
							{
								descent : travelDescent.toFixed ( ZERO )
							}
						)
				},
				travelHeaderHTML
			);
		}

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
			myAddNoteHTML ( { note : travelNotesIterator.value, route : null }, rowDiv );
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

		let notesAndManeuverRows = [];

		let notesIterator = route.notes.iterator;
		while ( ! notesIterator.done ) {
			let rowDiv = myHTMLElementsFactory.create (
				'div',
				{
					className : myClassNamePrefix + 'Route-Notes-Row',
					objId : newObjId ( ),
					latLng : notesIterator.value.latLng,
					noteObjId : notesIterator.value.objId,
					distance : notesIterator.value.distance
				}
			);

			myAddNoteHTML ( { note : notesIterator.value, route : route }, rowDiv );

			let nextNote = notesIterator.next;
			if ( nextNote ) {
				let nextDistance = nextNote.distance - notesIterator.value.distance;
				if ( MIN_NOTES_DISTANCE < nextDistance ) {
					myHTMLElementsFactory.create (
						'div',
						{
							className : myClassNamePrefix + 'NoteHtml-NextDistance',
							innerHTML :
								theTranslator.getText (
									'HTMLViewsFactory - Next note after&nbsp;:&nbsp;{distance}',
									{ distance : myUtilities.formatDistance ( nextDistance ) }
								)
						},
						rowDiv.lastChild
					);
				}
			}
			notesAndManeuverRows.push ( rowDiv );
		}

		let maneuversIterator = route.itinerary.maneuvers.iterator;
		while ( ! maneuversIterator.done ) {

			let latLng = route.itinerary.itineraryPoints.getAt ( maneuversIterator.value.itineraryPointObjId ).latLng;
			let maneuverDistance = myGeometry.getClosestLatLngDistance ( route, latLng ).distance;

			let rowDiv = myHTMLElementsFactory.create (
				'div',
				{
					className : myClassNamePrefix + 'Route-Maneuvers-Row',
					objId : newObjId ( ),
					latLng : latLng,
					maneuverObjId : maneuversIterator.value.objId,
					distance : maneuverDistance
				}
			);
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
				'<div>' + maneuversIterator.value.instruction + '</div>';

			if ( route.chain ) {
				maneuverText += '<div>' +
						theTranslator.getText (
							'HTMLViewsFactory - Distance from start of travel',
							{
								distance : myUtilities.formatDistance ( route.chainedDistance + maneuverDistance )
							}
						) + '</div>';
			}

			maneuverText += '<div>' +
					theTranslator.getText (
						'HTMLViewsFactory - Distance from start of route',
						{
							distance : myUtilities.formatDistance ( maneuverDistance )
						}
					) + '</div>';

			let nextManeuver = maneuversIterator.next;
			if ( nextManeuver ) {
				let nextLatLng = route.itinerary.itineraryPoints.getAt ( nextManeuver.itineraryPointObjId ).latLng;
				let nextManeuverDistance = myGeometry.getClosestLatLngDistance ( route, nextLatLng ).distance;
				maneuverText +=	'<div>' +
					theTranslator.getText (
						'HTMLViewsFactory - Next maneuver after&nbsp;:&nbsp;{distance}',
						{
							distance : myUtilities.formatDistance ( nextManeuverDistance - maneuverDistance )
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
			notesAndManeuverRows.push ( rowDiv );
		}

		notesAndManeuverRows.sort ( ( first, second ) => first.distance - second.distance );

		let routeManeuversAndNotesHTML = myHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'Route-ManeuversAndNotes'
			}
		);
		notesAndManeuverRows.forEach ( row => routeManeuversAndNotesHTML.appendChild ( row ) );

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
	--- myGetRouteProfileHTML function --------------------------------------------------------------------------------

	This function returns an HTML element with the route profile

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetRouteProfileHTML ( route ) {
		let profileDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'RouteProfile',
				innerHTML : theTranslator.getText ( 'HTMLViewsFactory - Profile' )
			}
		);
		profileDiv.appendChild ( myProfileFactory.createSvg ( route ) );

		return profileDiv;
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
			let route = useEditedRoute ? theTravelNotesData.travel.editedRoute : travelRoutesIterator.value;
			travelHTML.appendChild ( myGetRouteHeaderHTML ( route ) );
			if ( route.itinerary.hasProfile ) {
				travelHTML.appendChild ( myGetRouteProfileHTML ( route ) );
			}
			travelHTML.appendChild ( myGetRouteManeuversAndNotesHTML ( route ) );
			travelHTML.appendChild ( myGetRouteFooterHTML ( route ) );
		}

		travelHTML.appendChild ( myGetTravelFooterHTML ( ) );

		return travelHTML;
	}

	/*
	--- HTMLViewsFactory object ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			get travelHeaderHTML ( ) { return myGetTravelHeaderHTML ( ); },

			get travelNotesHTML ( ) { return myGetTravelNotesHTML ( ); },

			get routeHeaderHTML ( ) { return myGetRouteHeaderHTML ( theTravelNotesData.travel.editedRoute ); },

			get routeManeuversAndNotesHTML ( ) {
				return myGetRouteManeuversAndNotesHTML ( theTravelNotesData.travel.editedRoute );
			},

			get routeFooterHTML ( ) { return myGetRouteFooterHTML ( theTravelNotesData.travel.editedRoute ); },

			get travelFooterHTML ( ) { return myGetTravelFooterHTML ( ); },

			get travelHTML ( ) { return myGetTravelHTML ( ); },

			getRouteHTML : route => myGetRouteHTML ( route ),

			getNoteHTML : noteAndRoute => myGetNoteHTML ( noteAndRoute )

		}
	);
}

export { newHTMLViewsFactory };

/*
--- End of HTMLViewsFactory.js file -----------------------------------------------------------------------------------
*/