/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- Added noteObjId in the ourGetNoteTextAndIconHTML function
	- v1.5.0:
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯70 : Put the get...HTML functions outside of the editors
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
Doc reviewed 20200820
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file HTMLViewsFactory.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module HTMLViewsFactory
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theHTMLSanitizer from '../util/HTMLSanitizer.js';
import ObjId from '../data/ObjId.js';
import { theUtilities } from '../util/Utilities.js';
import theConfig from '../data/Config.js';
import { theTranslator } from '../UI/Translator.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import ProfileFactory from '../core/ProfileFactory.js';
import { ICON_DIMENSIONS, DISTANCE, ZERO, ONE } from '../util/Constants.js';

const OUR_LINKS_MAX_LENGTH = 40;
const OUR_MIN_NOTES_DISTANCE = 9;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetNoteTextHTML
@desc Gives an HTMLElement with the tooltipContent (if any), popupContent (if any) address (if any), phone (if any),
url (if any), latitude, longitude, distance since the start of the travel (if the note is attached to a chained node),
distance since the start of the route (if the note is a route note) and distance till the next note(if the note
is a route note)
@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
@param {NoteAndRoute} noteAndRoute A NoteAndRoute object with the note and the route to witch the note is attached
@return {HTMLElement} an HTMLElement
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetNoteTextHTML ( classPrefix, noteAndRoute ) {
	let note = noteAndRoute.note;
	let noteHTMLElement = theHTMLElementsFactory.create ( 'div' );
	if ( ZERO !== note.tooltipContent.length ) {
		theHTMLSanitizer.sanitizeToHtmlElement (
			note.tooltipContent,
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'NoteHtml-TooltipContent'
				},
				noteHTMLElement
			)
		);
	}

	if ( ZERO !== note.popupContent.length ) {
		theHTMLSanitizer.sanitizeToHtmlElement (
			note.popupContent,
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'NoteHtml-PopupContent'
				},
				noteHTMLElement
			)
		);
	}

	if ( ZERO !== note.address.length ) {
		theHTMLSanitizer.sanitizeToHtmlElement (
			'<span>' + theTranslator.getText ( 'HTMLViewsFactory - Address' ) + '</span>' +
			'\u00a0:\u00a0' + note.address,
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'NoteHtml-Address'
				},
				noteHTMLElement
			)
		);
	}

	if ( ZERO !== note.url.length ) {
		theHTMLSanitizer.sanitizeToHtmlElement (
			'<span>' + theTranslator.getText ( 'HTMLViewsFactory - Link' ) +
				'</span><a href=' +
				note.url +
				' target="_blank" >' +
				note.url.substr ( ZERO, OUR_LINKS_MAX_LENGTH ) +
				'...</a>',
			theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'NoteHtml-Url' }, noteHTMLElement )
		);
	}

	if ( ZERO !== note.phone.length ) {
		let phoneText = note.phone;
		if ( note.phone.match ( /^\+[0-9, ,*,\u0023]*$/ ) ) {
			let phoneNumber = note.phone.replaceAll ( /\u0020/g, '' );
			let phoneNumberDisplay = note.phone.replaceAll ( /\u0020/g, '\u00a0' );
			phoneText =
				theTranslator.getText ( 'HTMLViewsFactory - Phone' ) + '\u00a0:\u00a0' +
				theTranslator.getText ( 'HTMLViewsFactory - call' ) +
				'<a target="_blank" href="tel:' + phoneNumber + '" >' + phoneNumberDisplay + '</a>' +
				theTranslator.getText ( 'HTMLViewsFactory - Send a sms to' ) +
				'<a target="_blank" href="sms:' + phoneNumber + '" >' + phoneNumberDisplay + '</a>';
		}
		else {
			phoneText = theTranslator.getText ( 'HTMLViewsFactory - Phone' ) + '\u00a0:\u00a0' + note.phone;
		}
		theHTMLSanitizer.sanitizeToHtmlElement (
			phoneText,
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'NoteHtml-Phone'
				},
				noteHTMLElement
			)
		);
	}

	theHTMLSanitizer.sanitizeToHtmlElement (
		theUtilities.formatLatLng ( note.latLng ),
		theHTMLElementsFactory.create (
			'div',
			{
				className : classPrefix + 'NoteHtml-LatLng'
			},
			noteHTMLElement
		)
	);

	if ( noteAndRoute.route ) {
		if ( noteAndRoute.route.chain ) {
			theHTMLSanitizer.sanitizeToHtmlElement (
				'<span>' +
				theTranslator.getText ( 'HTMLViewsFactory - Distance from start of travel' ) +
				'</span>\u00a0:\u00a0' +
				theUtilities.formatDistance ( note.chainedDistance + note.distance ),
				theHTMLElementsFactory.create (
					'div',
					{
						className : classPrefix + 'NoteHtml-Distance'
					},
					noteHTMLElement
				)
			);
		}

		theHTMLSanitizer.sanitizeToHtmlElement (
			'<span>' +
			theTranslator.getText ( 'HTMLViewsFactory - Distance from start of route' ) +
			'</span>\u00a0:\u00a0' +
			theUtilities.formatDistance ( note.distance ),
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'NoteHtml-Distance'
				},
				noteHTMLElement
			)
		);

		let nextNote = noteAndRoute.route.notes.next ( note.objId );
		if ( nextNote ) {
			let nextDistance = nextNote.distance - note.distance;
			if ( OUR_MIN_NOTES_DISTANCE < nextDistance ) {
				theHTMLSanitizer.sanitizeToHtmlElement (
					'<span>' +
					theTranslator.getText ( 'HTMLViewsFactory - Next note after' ) +
					'</span>\u00a0:\u00a0' +
					theUtilities.formatDistance ( nextDistance ),
					theHTMLElementsFactory.create (
						'div',
						{
							className : classPrefix + 'NoteHtml-NextDistance'
						},
						noteHTMLElement
					)
				);
			}
		}
	}
	return noteHTMLElement;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetNoteTextAndIconHTML
@desc Gives an HTMLElement with the note icon and sames values than the ourGetNoteTextHTML function
@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
@param {NoteAndRoute} noteAndRoute A NoteAndRoute object with the note and the route to witch the note is attached
@return {HTMLElement}
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetNoteTextAndIconHTML ( classPrefix, noteAndRoute ) {
	let NoteTextAndIconHTML = theHTMLElementsFactory.create ( 'div' );
	let iconHTML = theHTMLElementsFactory.create (
		'div',
		{
			className : classPrefix + ( noteAndRoute.route ? 'Route-ManeuversAndNotes-IconCell' : 'Travel-Notes-IconCell' )
		},
		NoteTextAndIconHTML
	);
	let dimCoeficient = ONE;
	theHTMLSanitizer.sanitizeToHtmlElement ( noteAndRoute.note.iconContent, iconHTML );
	if ( 'TravelNotes-Roadbook-' === classPrefix && iconHTML.firstChild ) {
		if ( 'svg' === iconHTML.firstChild.tagName ) {
			iconHTML.firstChild.setAttributeNS (
				null,
				'viewBox',
				'0 0 ' + ICON_DIMENSIONS.svgViewboxDim + ' ' + ICON_DIMENSIONS.svgViewboxDim
			);
			dimCoeficient = theConfig.note.svgIcon.roadbookFactor;
		}
		else if ( iconHTML.firstChild.classList.contains ( 'TravelNotes-MapNoteCategory-0073' ) ) {
			dimCoeficient = theConfig.note.svgIcon.roadbookFactor;
		}
		iconHTML.setAttribute (
			'tanwidth', String ( noteAndRoute.note.iconWidth * dimCoeficient ) + 'px'
		);
		iconHTML.setAttribute (
			'tanheight', String ( noteAndRoute.note.iconWidth * dimCoeficient ) + 'px'
		);
	}
	else {
		iconHTML.style.width = String ( noteAndRoute.note.iconWidth ) + 'px';
		iconHTML.style.height = String ( noteAndRoute.note.iconHeight ) + 'px';
	}

	let noteTextHTMLElement = ourGetNoteTextHTML ( classPrefix, noteAndRoute );
	noteTextHTMLElement.className = classPrefix + ( noteAndRoute.route ? 'Route-ManeuversAndNotes-Cell' : 'Travel-Notes-Cell' );
	NoteTextAndIconHTML.appendChild ( noteTextHTMLElement );
	NoteTextAndIconHTML.noteObjId = noteAndRoute.note.objId;

	return NoteTextAndIconHTML;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetTravelHeaderHTML
@desc Gives an HTMLElement with the travel name, distance, ascent (if any), descent (if any) and a list with all the routes
of the travel
@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
@return {HTMLElement}
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetTravelHeaderHTML ( classPrefix ) {
	let travelHeaderHTML = theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'Travel-Header' } );

	theHTMLSanitizer.sanitizeToHtmlElement (
		theTravelNotesData.travel.name,
		theHTMLElementsFactory.create (
			'div',
			{
				className : classPrefix + 'Travel-Header-Name'
			},
			travelHeaderHTML
		)
	);

	let travelDistance = DISTANCE.defaultValue;
	let travelAscent = ZERO;
	let travelDescent = ZERO;
	let routesIterator = theTravelNotesData.travel.routes.iterator;
	while ( ! routesIterator.done ) {
		let route =
			( routesIterator.value.objId === theTravelNotesData.editedRouteObjId
				&&
				theConfig.routeEditor.showEditedRouteInRoadbook
			)
				?
				theTravelNotesData.travel.editedRoute
				:
				routesIterator.value;

		theHTMLSanitizer.sanitizeToHtmlElement (
			'<a href="\u0023route' + route.objId + '" >' + route.computedName +
			'</a>\u00a0:\u00a0' + theUtilities.formatDistance ( route.distance ) + '.',
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'Travel-Header-RouteName'
				},
				travelHeaderHTML
			)
		);

		if ( route.chain ) {
			travelDistance += route.distance;
			travelAscent += route.itinerary.ascent;
			travelDescent += route.itinerary.descent;
		}
	}

	theHTMLSanitizer.sanitizeToHtmlElement (
		'<span>' +
			theTranslator.getText ( 'HTMLViewsFactory - Travel distance' ) +
			'</span>\u00A0:\u00A0' +
			theUtilities.formatDistance ( travelDistance ),
		theHTMLElementsFactory.create (
			'div',
			{
				className : classPrefix + 'Travel-Header-TravelDistance'
			},
			travelHeaderHTML
		)
	);

	if ( ZERO !== travelAscent ) {
		theHTMLSanitizer.sanitizeToHtmlElement (
			'<span>' +
				theTranslator.getText ( 'HTMLViewsFactory - Travel ascent' ) +
				'</span>\u00A0:\u00A0' +
				String ( travelAscent.toFixed ( ZERO ) ) +
				' m.',
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'Travel-Header-TravelAscent'
				},
				travelHeaderHTML
			)
		);
	}

	if ( ZERO !== travelDescent ) {
		theHTMLSanitizer.sanitizeToHtmlElement (
			'<span>' +
				theTranslator.getText ( 'HTMLViewsFactory - Travel descent' ) +
				'</span>\u00A0:\u00A0' +
				String ( travelDescent.toFixed ( ZERO ) ) +
				' m.',
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'Travel-Header-TravelDescent'
				},
				travelHeaderHTML
			)
		);
	}
	return travelHeaderHTML;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetTravelNotesHTML
@desc Gives an HTMLElement with all the travel notes
@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
@return {HTMLElement}
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetTravelNotesHTML ( classPrefix ) {
	let travelNotesHTML = theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'Travel-Notes' } );
	let travelNotesIterator = theTravelNotesData.travel.notes.iterator;
	while ( ! travelNotesIterator.done ) {
		let noteTextAndIconHTML =
			ourGetNoteTextAndIconHTML ( classPrefix, { note : travelNotesIterator.value, route : null } );
		noteTextAndIconHTML.className = classPrefix + 'Travel-Notes-Row';
		travelNotesHTML.appendChild ( noteTextAndIconHTML );
	}
	return travelNotesHTML;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetRouteHeaderHTML
@desc Gives an HTMLElement with a route name, route distance, route duration ( except for bike),
route ascent (if any) and route descent (if any)
@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
@param {Route} route The route for witch the HTMLElement will be created
@return {HTMLElement}
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetRouteHeaderHTML ( classPrefix, route ) {

	let routeHeaderHTML = theHTMLElementsFactory.create (
		'div',
		{
			className : classPrefix + 'Route-Header',
			id : 'route' + route.objId
		}
	);

	theHTMLSanitizer.sanitizeToHtmlElement (
		route.computedName,
		theHTMLElementsFactory.create (
			'div',
			{
				className : classPrefix + 'Route-Header-Name'
			},
			routeHeaderHTML
		)
	);

	if ( ZERO !== route.distance ) {
		theHTMLSanitizer.sanitizeToHtmlElement (
			'<span>' +
				theTranslator.getText ( 'HTMLViewsFactory - Route distance' ) +
				'</span>\u00a0:\u00a0' +
				theUtilities.formatDistance ( route.distance ),
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'Route-Header-Distance'
				},
				routeHeaderHTML
			)
		);
	}

	if ( ! theTravelNotesData.travel.readOnly && 'bike' !== route.itinerary.transitMode ) {
		theHTMLSanitizer.sanitizeToHtmlElement (
			'<span>' +
				theTranslator.getText ( 'HTMLViewsFactory - Duration' ) +
				'</span>\u00a0:\u00a0' +
				theUtilities.formatTime ( route.duration ),
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'Route-Header-Duration'
				},
				routeHeaderHTML
			)
		);
	}

	if ( route.itinerary.hasProfile ) {
		theHTMLSanitizer.sanitizeToHtmlElement (
			'<span>' +
				theTranslator.getText ( 'HTMLViewsFactory - Ascent' ) +
				'</span>\u00a0:\u00a0' +
				String ( route.itinerary.ascent.toFixed ( ZERO ) ) +
				' m.',
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'Route-Header-Ascent'
				},
				routeHeaderHTML
			)
		);
		theHTMLSanitizer.sanitizeToHtmlElement (
			'<span>' +
				theTranslator.getText ( 'HTMLViewsFactory - Descent' ) +
				'</span>\u00a0:\u00a0' +
				String ( route.itinerary.descent.toFixed ( ZERO ) ) +
				' m.',
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'Route-Header-Descent'
				},
				routeHeaderHTML
			)
		);
	}
	return routeHeaderHTML;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetManeuverHTML
@desc Gives an HTMLElement with the icon, instruction, distance since the beginning of the travel (if the instruction is
linked to a chained route), distance since the beginning of the route and distance till the next maneuver
@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
@param {Object} routeAndManeuver An object with the maneuver, the route to witch the maneuver is linked and the distance
between the beginning of the route and the maneuver
@return {HTMLElement}
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetManeuverHTML ( classPrefix, routeAndManeuver ) {
	let maneuverHTML = theHTMLElementsFactory.create ( 'div' );
	theHTMLElementsFactory.create (
		'div',
		{
			className :
				classPrefix +
				'Route-ManeuversAndNotes-IconCell ' +
				'TravelNotes-ManeuverNote-' +
				routeAndManeuver.maneuver.iconName
		},
		maneuverHTML
	);
	let maneuverTextHTML = theHTMLElementsFactory.create (
		'div',
		{
			className : classPrefix + 'Route-ManeuversAndNotes-Cell'
		},
		maneuverHTML
	);

	theHTMLSanitizer.sanitizeToHtmlElement (
		routeAndManeuver.maneuver.instruction,
		theHTMLElementsFactory.create ( 'div', null, maneuverTextHTML )
	);

	if ( routeAndManeuver.route.chain ) {
		theHTMLSanitizer.sanitizeToHtmlElement (
			'<span>' +
				theTranslator.getText ( 'HTMLViewsFactory - Distance from start of travel' ) +
				'</span>\u00a0:\u00a0' +
				theUtilities.formatDistance ( routeAndManeuver.route.chainedDistance + routeAndManeuver.maneuverDistance ),
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'Route-Maneuver-Distance'
				},
				maneuverTextHTML
			)
		);
	}

	theHTMLSanitizer.sanitizeToHtmlElement (
		'<span>' +
			theTranslator.getText ( 'HTMLViewsFactory - Distance from start of route' ) +
			'</span>\u00a0:\u00a0' +
			theUtilities.formatDistance ( routeAndManeuver.maneuverDistance ),
		theHTMLElementsFactory.create (
			'div',
			{
				className : classPrefix + 'Route-Maneuver-Distance'
			},
			maneuverTextHTML
		)
	);

	if ( DISTANCE.defaultValue < routeAndManeuver.maneuver.distance ) {
		theHTMLSanitizer.sanitizeToHtmlElement (
			'<span>' +
				theTranslator.getText ( 'HTMLViewsFactory - Next maneuver after' ) +
				'</span>\u00a0:\u00a0' +
				theUtilities.formatDistance ( routeAndManeuver.maneuver.distance ),
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'Route-Maneuver-Distance'
				},
				maneuverTextHTML
			)
		);
	}
	return maneuverHTML;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetRouteManeuversAndNotesHTML
@desc Gives an HTMLElement with all the notes and maneuvers linked to a route, ordered by distance since the
beginning of the route
@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
@param {Route} route The route for witch the HTMLElement will be created
@return {HTMLElement}
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetRouteManeuversAndNotesHTML ( classPrefix, route ) {
	let notesAndManeuverHTML = [];
	let notesIterator = route.notes.iterator;
	while ( ! notesIterator.done ) {
		let noteTextAndIconHTML = ourGetNoteTextAndIconHTML ( classPrefix, { note : notesIterator.value, route : route } );
		noteTextAndIconHTML.className = classPrefix + 'Route-Notes-Row';
		noteTextAndIconHTML.objId = ObjId.nextObjId;
		noteTextAndIconHTML.latLng = notesIterator.value.latLng;
		noteTextAndIconHTML.noteObjId = notesIterator.value.objId;
		noteTextAndIconHTML.distance = notesIterator.value.distance;
		notesAndManeuverHTML.push ( noteTextAndIconHTML );
	}
	let maneuversIterator = route.itinerary.maneuvers.iterator;
	let maneuverDistance = ZERO;
	while ( ! maneuversIterator.done ) {
		let maneuverHTML = ourGetManeuverHTML (
			classPrefix,
			{
				route : route,
				maneuver : maneuversIterator.value,
				maneuverDistance : maneuverDistance
			}
		);
		maneuverHTML.className = classPrefix + 'Route-Maneuvers-Row';
		maneuverHTML.objId = ObjId.nextObjId;
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
			className : classPrefix + 'Route-ManeuversAndNotes'
		}
	);
	notesAndManeuverHTML.forEach ( row => routeManeuversAndNotesHTML.appendChild ( row ) );

	return routeManeuversAndNotesHTML;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetRouteFooterHTML
@desc Gives an HTMLElement with the provider and transit mode used for the itinerary creation
@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
@param {Route} route The route for witch the HTMLElement will be created
@return {HTMLElement}
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetRouteFooterHTML ( classPrefix, route ) {
	let footerText = '';
	if ( ( '' !== route.itinerary.provider ) && ( '' !== route.itinerary.transitMode ) ) {
		footerText = theTranslator.getText (
			'HTMLViewsFactory - Itinerary computed by {provider} and optimized for {transitMode}',
			{
				provider : route.itinerary.provider,
				transitMode : theTranslator.getText ( 'HTMLViewsFactory - TransitMode ' +	route.itinerary.transitMode )
			}
		);
	}

	let footerHTML = theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'RouteFooter' } );

	theHTMLSanitizer.sanitizeToHtmlElement ( footerText, footerHTML );

	return footerHTML;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetTravelFooterHTML
@desc Gives an HTMLElement with the Copyright notice and OSM attributions
@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
@return {HTMLElement}
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetTravelFooterHTML ( classPrefix ) {
	let footerText =
		theTranslator.getText ( 'HTMLViewsFactory - Travel footer' ) +
		'<a href="https://github.com/wwwouaiebe/leaflet.TravelNotes"' +
		' target="_blank" title="https://github.com/wwwouaiebe/leaflet.TravelNotes" >Travel & Notes</a>, © ' +
		'<a href="https://www.ouaie.be/" target="_blank" title="https://www.ouaie.be/" >wwwouaiebe 2017 2021</a> © ' +
		'<a href="https://www.openstreetmap.org/copyright" target="_blank" title="https://www.openstreetmap.org/copyright">' +
		theTranslator.getText ( 'HTMLViewsFactory - OpenStreetMap contributors' ) + '</a>';
	let footerHTML = theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'TravelFooter' } );

	theHTMLSanitizer.sanitizeToHtmlElement ( footerText, footerHTML );

	return footerHTML;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetRouteProfileHTML
@desc Gives an HTMLElement with the SVG profile of a route
@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
@param {Route} route The route for witch the HTMLElement will be created
@return {HTMLElement}
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetRouteProfileHTML ( classPrefix, route ) {
	let profileDiv = theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'RouteProfile' } );
	theHTMLSanitizer.sanitizeToHtmlElement ( theTranslator.getText ( 'HTMLViewsFactory - Profile' ), profileDiv );
	profileDiv.appendChild ( new ProfileFactory ( ).createSvg ( route ) );

	return profileDiv;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetTravelHTML
@desc Gives an HTMLElement with the travel header, the travel notes, all the routes of the travel
with route header, route notes, route maneuvers, route footer and travel footer
@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
@return {HTMLElement}
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetTravelHTML ( classPrefix ) {

	let travelHTML = theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'Travel' } );

	travelHTML.appendChild ( ourGetTravelHeaderHTML ( classPrefix ) );
	travelHTML.appendChild ( ourGetTravelNotesHTML ( classPrefix ) );

	let travelRoutesIterator = theTravelNotesData.travel.routes.iterator;
	while ( ! travelRoutesIterator.done ) {
		let useEditedRoute =
			theConfig.routeEditor.showEditedRouteInRoadbook
			&&
			travelRoutesIterator.value.objId === theTravelNotesData.editedRouteObjId;
		let route = useEditedRoute ? theTravelNotesData.travel.editedRoute : travelRoutesIterator.value;
		travelHTML.appendChild ( ourGetRouteHeaderHTML ( classPrefix, route ) );
		if ( route.itinerary.hasProfile ) {
			travelHTML.appendChild ( ourGetRouteProfileHTML ( classPrefix, route ) );
		}
		travelHTML.appendChild ( ourGetRouteManeuversAndNotesHTML ( classPrefix, route ) );
		travelHTML.appendChild ( ourGetRouteFooterHTML ( classPrefix, route ) );
	}

	travelHTML.appendChild ( ourGetTravelFooterHTML ( classPrefix ) );

	return travelHTML;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class creates HTMLElements for travel, notes and routes
@see {@link theHTMLViewsFactory} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class HTMLViewsFactory {

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Gives an HTMLElement with the travel header, the travel notes, all the routes of the travel
	with route header, route notes, route maneuvers, route footer and travel footer
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@return {HTMLElement}
	*/

	getTravelHTML ( classPrefix ) {
		return ourGetTravelHTML ( classPrefix );
	}

	/**
	@function getNoteTextAndIconHTML
	@desc Gives an HTMLElement with the note icon and sames values than the ourGetNoteTextHTML function
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElement
	@param {NoteAndRoute} noteAndRoute A NoteAndRoute object with the note and the route to witch the note is attached
	@return {HTMLElement}
	*/

	getNoteTextAndIconHTML ( classPrefix, noteAndRoute ) {
		return ourGetNoteTextAndIconHTML ( classPrefix, noteAndRoute );
	}

	/**
	Gives an HTMLElement with the tooltipContent (if any), popupContent (if any) address (if any), phone (if any),
	url (if any), latitude, longitude, distance since the start of the travel (if the note is attached to a chained node),
	distance since the start of the route (if the note is a route note) and distance till the next note(if the note
	is a route note)
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@param {NoteAndRoute} noteAndRoute A NoteAndRoute object with the note and the route to witch the note is attached
	@return {HTMLElement} an HTMLElement
	*/

	getNoteTextHTML ( classPrefix, noteAndRoute ) {
		return ourGetNoteTextHTML ( classPrefix, noteAndRoute );
	}

	/**
	Gives an HTMLElement with all the notes and maneuvers linked to the edited route, ordered by distance since the
	beginning of the route
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@param {Route} route The route for witch the HTMLElement will be created
	@return {HTMLElement}
	*/

	getEditedRouteManeuversAndNotesHTML ( classPrefix ) {
		return ourGetRouteManeuversAndNotesHTML (
			classPrefix,
			theTravelNotesData.travel.editedRoute
		);
	}

	/**
	Gives an HTMLElement with all the travel notes
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@return {HTMLElement}
	*/

	getTravelNotesHTML ( classPrefix ) {
		return ourGetTravelNotesHTML ( classPrefix );
	}

	/**
	Gives an HTMLElement with a route name, route distance, route duration ( except for bike),
	route ascent (if any) and route descent (if any)
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@param {Route} route The route for witch the HTMLElement will be created
	@return {HTMLElement}
	*/

	getRouteHeaderHTML ( classPrefix, route ) {
		return ourGetRouteHeaderHTML ( classPrefix, route );
	}
}

const OUR_HTML_VIEWS_FACTORY = new HTMLViewsFactory ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of HTMLViewsFactory  class
	@type {HTMLViewsFactory }
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_HTML_VIEWS_FACTORY as theHTMLViewsFactory
};

/*
--- End of HTMLViewsFactory.js file -------------------------------------------------------------------------------------------
*/