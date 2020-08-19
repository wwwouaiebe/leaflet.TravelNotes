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
		- Added noteObjId in the myGetNoteTextAndIconHTML function
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

import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newObjId } from '../data/ObjId.js';
import { newUtilities } from '../util/Utilities.js';
import { theConfig } from '../data/Config.js';
import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newProfileFactory } from '../core/ProfileFactory.js';
import { DISTANCE, ZERO } from '../util/Constants.js';

function newHTMLViewsFactory ( classNamePrefix ) {

	const LINKS_MAX_LENGTH = 40;
	const MIN_NOTES_DISTANCE = 9;

	let myUtilities = newUtilities ( );
	let myProfileFactory = newProfileFactory ( );
	let mySvgIconSize = theConfig.note.svgIconWidth;
	let myClassNamePrefix = classNamePrefix || 'TravelNotes-UI-';

	/*
	--- myGetNoteHTML function ----------------------------------------------------------------------------------------

	This function returns an HTML string with the note contents. This string will be used in the
	note popup, the itinerary pane and on the roadbook page

	parameters:
	- note : the TravelNotes object

	ok
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetNoteTextHTML ( noteAndRoute ) {
		let note = noteAndRoute.note;
		let noteHTMLElement = theHTMLElementsFactory.create ( 'div' );
		if ( ZERO !== note.tooltipContent.length ) {
			theHTMLElementsFactory.create (
				'div',
				{
					className : myClassNamePrefix + 'NoteHtml-TooltipContent',
					innerHTML : note.tooltipContent
				},
				noteHTMLElement
			);
		}
		if ( ZERO !== note.popupContent.length ) {
			theHTMLElementsFactory.create (
				'div',
				{
					className : myClassNamePrefix + 'NoteHtml-PopupContent',
					innerHTML : note.popupContent
				},
				noteHTMLElement
			);
		}
		if ( ZERO !== note.address.length ) {
			theHTMLElementsFactory.create (
				'div',
				{
					className : myClassNamePrefix + 'NoteHtml-Address',
					innerHTML : theTranslator.getText ( 'HTMLViewsFactory - Address' ) + note.address
				},
				noteHTMLElement
			);
		}
		if ( ZERO !== note.phone.length ) {
			theHTMLElementsFactory.create (
				'div',
				{
					className : myClassNamePrefix + 'NoteHtml-Phone',
					innerHTML : theTranslator.getText ( 'HTMLViewsFactory - Phone' ) + note.phone
				},
				noteHTMLElement
			);
		}
		if ( ZERO !== note.url.length ) {
			theHTMLElementsFactory.create (
				'a',
				{
					href : note.url,
					target : '_blank',
					innerHTML : note.url.substr ( ZERO, LINKS_MAX_LENGTH ) + '...'
				},
				theHTMLElementsFactory.create (
					'div',
					{
						className : myClassNamePrefix + 'NoteHtml-Url',
						innerHTML : theTranslator.getText ( 'HTMLViewsFactory - Link' )
					},
					noteHTMLElement
				)
			);
		}
		theHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'NoteHtml-LatLng',
				innerHTML :	theTranslator.getText (
					'HTMLViewsFactory - Latitude Longitude',
					{
						lat : myUtilities.formatLat ( note.lat ),
						lng : myUtilities.formatLng ( note.lng )
					}
				)
			},
			noteHTMLElement
		);
		if ( noteAndRoute.route ) {
			if ( noteAndRoute.route.chain ) {
				theHTMLElementsFactory.create (
					'div',
					{
						className : myClassNamePrefix + 'NoteHtml-Distance',
						innerHTML :	theTranslator.getText (
							'HTMLViewsFactory - Distance from start of travel',
							{
								distance : myUtilities.formatDistance ( note.chainedDistance + note.distance )
							}
						)
					},
					noteHTMLElement
				);
			}
			theHTMLElementsFactory.create (
				'div',
				{
					className : myClassNamePrefix + 'NoteHtml-Distance',
					innerHTML :	theTranslator.getText (
						'HTMLViewsFactory - Distance from start of route',
						{
							distance : myUtilities.formatDistance ( note.distance )
						}
					)
				},
				noteHTMLElement
			);
			let nextNote = noteAndRoute.route.notes.next ( note.objId );
			if ( nextNote ) {
				let nextDistance = nextNote.distance - note.distance;
				if ( MIN_NOTES_DISTANCE < nextDistance ) {
					theHTMLElementsFactory.create (
						'div',
						{
							className : myClassNamePrefix + 'NoteHtml-NextDistance',
							innerHTML :
								theTranslator.getText (
									'HTMLViewsFactory - Next note after&nbsp;:&nbsp;{distance}',
									{ distance : myUtilities.formatDistance ( nextDistance ) }
								)
						},
						noteHTMLElement
					);
				}
			}
		}
		return noteHTMLElement;
	}

	/*
	--- myGetNoteTextAndIconHTML function -----------------------------------------------------------------------------

	This function add to the rowDiv parameter two div with the note icon ant the note content

	ok
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetNoteTextAndIconHTML ( noteAndRoute ) {
		let NoteTextAndIconHTML = theHTMLElementsFactory.create ( 'div' );
		let iconHTML = theHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'Travel-Notes-IconCell',
				innerHTML : noteAndRoute.note.iconContent
			},
			NoteTextAndIconHTML
		);
		if ( ( 'svg' === iconHTML.firstChild.tagName ) && ( 'TravelNotes-Roadbook-' === myClassNamePrefix ) ) {
			iconHTML.firstChild.setAttributeNS ( null, 'viewBox', '0 0 ' + mySvgIconSize + ' ' + mySvgIconSize );
		}

		let noteTextHTMLElement = myGetNoteTextHTML ( noteAndRoute );
		noteTextHTMLElement.className = myClassNamePrefix + 'Travel-Notes-Cell';
		NoteTextAndIconHTML.appendChild ( noteTextHTMLElement );
		NoteTextAndIconHTML.noteObjId = noteAndRoute.note.objId;
		return NoteTextAndIconHTML;
	}

	/*
	--- myGetRouteHTML function ---------------------------------------------------------------------------------------

	This function returns an HTML string with the route contents. This string will be used in the
	route popup and on the roadbook page

	parameters:
	- route : the TravelNotes route object

	todo
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

	todo
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetTravelHeaderHTML ( ) {
		let travelHeaderHTML = theHTMLElementsFactory.create ( 'div', { className : myClassNamePrefix + 'Travel-Header' } );
		theHTMLElementsFactory.create (
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
			theHTMLElementsFactory.create (
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

		theHTMLElementsFactory.create (
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
			theHTMLElementsFactory.create (
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
			theHTMLElementsFactory.create (
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

	ok
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetTravelNotesHTML ( ) {
		let travelNotesHTML = theHTMLElementsFactory.create ( 'div', { className : myClassNamePrefix + 'Travel-Notes' } );
		let travelNotesIterator = theTravelNotesData.travel.notes.iterator;
		while ( ! travelNotesIterator.done ) {
			let noteTextAndIconHTML = myGetNoteTextAndIconHTML ( { note : travelNotesIterator.value, route : null } );
			noteTextAndIconHTML.className = myClassNamePrefix + 'Travel-Notes-Row';
			travelNotesHTML.appendChild ( noteTextAndIconHTML );
		}
		return travelNotesHTML;
	}

	/*
	--- myGetRouteHeaderHTML function ---------------------------------------------------------------------------------

	This function returns an HTML element with the route header

	todo
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetRouteHeaderHTML ( route ) {
		return theHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'Route-Header',
				id : 'route' + route.objId,
				innerHTML : myGetRouteHTML ( route )
			}
		);
	}

	/*
	--- myGetManeuverHTML function ---------------------------------------------------------------------------------

	ok
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetManeuverHTML ( route, maneuver, maneuverDistance ) {
		let maneuverHTML = theHTMLElementsFactory.create ( 'div' );
		theHTMLElementsFactory.create (
			'div',
			{
				className :
					myClassNamePrefix +
					'Route-ManeuversAndNotes-IconCell ' +
					'TravelNotes-ManeuverNote-' +
					maneuver.iconName
			},
			maneuverHTML
		);
		let maneuverTextHTML = theHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'Route-ManeuversAndNotes-Cell'
			},
			maneuverHTML
		);
		theHTMLElementsFactory.create (
			'div',
			{
				innerHTML : maneuver.instruction
			},
			maneuverTextHTML
		);
		if ( route.chain ) {
			theHTMLElementsFactory.create (
				'div',
				{
					innerHTML :	theTranslator.getText (
						'HTMLViewsFactory - Distance from start of travel',
						{
							distance : myUtilities.formatDistance ( route.chainedDistance + maneuverDistance )
						}
					)
				},
				maneuverTextHTML
			);
		}
		theHTMLElementsFactory.create (
			'div',
			{
				innerHTML :	theTranslator.getText (
					'HTMLViewsFactory - Distance from start of route',
					{
						distance : myUtilities.formatDistance ( maneuverDistance )
					}
				)
			},
			maneuverTextHTML
		);
		if ( DISTANCE.defaultValue < maneuver.distance ) {
			theHTMLElementsFactory.create (
				'div',
				{
					innerHTML :	theTranslator.getText (
						'HTMLViewsFactory - Next maneuver after&nbsp;:&nbsp;{distance}',
						{
							distance : myUtilities.formatDistance ( maneuver.distance )
						}
					)
				},
				maneuverTextHTML
			);
		}
		return maneuverHTML;
	}

	/*
	--- myGetRouteManeuversAndNotesHTML function ----------------------------------------------------------------------

	This function returns an HTML element with the route maneuvers and notes

	ok
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetRouteManeuversAndNotesHTML ( route ) {
		let notesAndManeuverHTML = [];
		let notesIterator = route.notes.iterator;
		while ( ! notesIterator.done ) {
			let noteTextAndIconHTML = myGetNoteTextAndIconHTML ( { note : notesIterator.value, route : route } );
			noteTextAndIconHTML.className = myClassNamePrefix + 'Route-Notes-Row';
			noteTextAndIconHTML.objId = newObjId ( );
			noteTextAndIconHTML.latLng = notesIterator.value.latLng;
			noteTextAndIconHTML.noteObjId = notesIterator.value.objId;
			noteTextAndIconHTML.distance = notesIterator.value.distance;
			notesAndManeuverHTML.push ( noteTextAndIconHTML );
		}
		let maneuversIterator = route.itinerary.maneuvers.iterator;
		let maneuverDistance = ZERO;
		while ( ! maneuversIterator.done ) {
			let maneuverHTML = myGetManeuverHTML ( route, maneuversIterator.value, maneuverDistance );
			maneuverHTML.className = myClassNamePrefix + 'Route-Maneuvers-Row';
			maneuverHTML.objId = newObjId ( );
			maneuverHTML.latLng =
				route.itinerary.itineraryPoints.getAt ( maneuversIterator.value.itineraryPointObjId ).latLng;
			maneuverHTML.maneuverObjId = maneuversIterator.value.objId;
			maneuverHTML.distance = maneuverDistance;
			notesAndManeuverHTML.push ( maneuverHTML );
			maneuverDistance += maneuversIterator.value.distance;
		}
		notesAndManeuverHTML.sort ( ( first, second ) => first.distance - second.distance );
		let routeManeuversAndNotesHTML = theHTMLElementsFactory.create (
			'div',
			{
				className : myClassNamePrefix + 'Route-ManeuversAndNotes'
			}
		);
		notesAndManeuverHTML.forEach ( row => routeManeuversAndNotesHTML.appendChild ( row ) );

		return routeManeuversAndNotesHTML;
	}

	/*
	--- myGetRouteFooterHTML function ---------------------------------------------------------------------------------

	This function returns an HTML element with the route footer

	todo
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

		return theHTMLElementsFactory.create (
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

	todo
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetTravelFooterHTML ( ) {
		return theHTMLElementsFactory.create (
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

	todo
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetRouteProfileHTML ( route ) {
		let profileDiv = theHTMLElementsFactory.create (
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

	todo
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetTravelHTML ( ) {

		let travelHTML = theHTMLElementsFactory.create ( 'div', { className : myClassNamePrefix + 'Travel' } );

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

			getNoteTextHTML : noteAndRoute => myGetNoteTextHTML ( noteAndRoute )

		}
	);
}

export { newHTMLViewsFactory };

/*
--- End of HTMLViewsFactory.js file -----------------------------------------------------------------------------------
*/