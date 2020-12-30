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
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #70 : Put the get...HTML functions outside of the editors
	- v1.12.0:
		- Issue #120 : Review the UserInterface
	- v1.14.0:
		- Issue #135 : Remove innerHTML from code
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

import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theHTMLParserSerializer } from '../util/HTMLParserSerializer.js';
import { newObjId } from '../data/ObjId.js';
import { theUtilities } from '../util/Utilities.js';
import { theConfig } from '../data/Config.js';
import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newProfileFactory } from '../core/ProfileFactory.js';
import { DISTANCE, ZERO } from '../util/Constants.js';

const LINKS_MAX_LENGTH = 40;
const MIN_NOTES_DISTANCE = 9;

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
		theHTMLParserSerializer.parse (
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
		theHTMLParserSerializer.parse (
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
		theHTMLParserSerializer.parse (
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

	if ( ZERO !== note.phone.length ) {
		theHTMLParserSerializer.parse (
			theTranslator.getText ( 'HTMLViewsFactory - Phone' ) + '\u00a0:\u00a0' + note.phone,
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'NoteHtml-Phone'
				},
				noteHTMLElement
			)
		);
	}

	if ( ZERO !== note.url.length ) {
		theHTMLParserSerializer.parse (
			theTranslator.getText ( 'HTMLViewsFactory - Link' ) + '<a href=' + note.url + ' target="_blank" >' +
				note.url.substr ( ZERO, LINKS_MAX_LENGTH ) + '...</a>',
			theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'NoteHtml-Url' }, noteHTMLElement )
		);
	}

	theHTMLParserSerializer.parse (
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
			theHTMLParserSerializer.parse (
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

		theHTMLParserSerializer.parse (
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
			if ( MIN_NOTES_DISTANCE < nextDistance ) {
				theHTMLParserSerializer.parse (
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
			className : classPrefix + 'Travel-Notes-IconCell'
		},
		NoteTextAndIconHTML
	);
	theHTMLParserSerializer.parse ( noteAndRoute.note.iconContent, iconHTML );
	if ( ( 'svg' === iconHTML.firstChild.tagName ) && ( 'TravelNotes-Roadbook-' === classPrefix ) ) {
		iconHTML.firstChild.setAttributeNS (
			null,
			'viewBox',
			'0 0 ' + theConfig.note.svgIconWidth + ' ' + theConfig.note.svgIconWidth );
	}

	let noteTextHTMLElement = ourGetNoteTextHTML ( classPrefix, noteAndRoute );
	noteTextHTMLElement.className = classPrefix + 'Travel-Notes-Cell';
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

	theHTMLParserSerializer.parse (
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
				theConfig.routeEditor.displayEditionInHTMLPage
			)
				?
				theTravelNotesData.travel.editedRoute
				:
				routesIterator.value;

		theHTMLParserSerializer.parse (
			'<a href="#route' + route.objId + '" >' + route.computedName +
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

	theHTMLParserSerializer.parse (
		theTranslator.getText (
			'HTMLViewsFactory - Travel distance',
			{
				distance : theUtilities.formatDistance ( travelDistance )
			}
		),
		theHTMLElementsFactory.create (
			'div',
			{
				className : classPrefix + 'Travel-Header-TravelDistance'
			},
			travelHeaderHTML
		)
	);

	if ( ZERO !== travelAscent ) {
		theHTMLParserSerializer.parse (
			theTranslator.getText (
				'HTMLViewsFactory - Travel ascent',
				{
					ascent : travelAscent.toFixed ( ZERO )
				}
			),
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
		theHTMLParserSerializer.parse (
			theTranslator.getText (
				'HTMLViewsFactory - Travel descent',
				{
					descent : travelDescent.toFixed ( ZERO )
				}
			),
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

	theHTMLParserSerializer.parse (
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
		theHTMLParserSerializer.parse (
			theTranslator.getText (
				'HTMLViewsFactory - Route distance',
				{
					distance : theUtilities.formatDistance ( route.distance )
				}
			),
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
		theHTMLParserSerializer.parse (
			theTranslator.getText (
				'HTMLViewsFactory - Duration',
				{ duration : theUtilities.formatTime ( route.duration ) }
			),
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
		theHTMLParserSerializer.parse (
			theTranslator.getText (
				'HTMLViewsFactory - Ascent',
				{ ascent : route.itinerary.ascent.toFixed ( ZERO ) }
			),
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'Route-Header-Ascent'
				},
				routeHeaderHTML
			)
		);
		theHTMLParserSerializer.parse (
			theTranslator.getText (
				'HTMLViewsFactory - Descent',
				{ descent : route.itinerary.descent.toFixed ( ZERO ) }
			),
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

	theHTMLParserSerializer.parse (
		routeAndManeuver.maneuver.instruction,
		theHTMLElementsFactory.create ( 'div', null, maneuverTextHTML )
	);

	if ( routeAndManeuver.route.chain ) {
		theHTMLParserSerializer.parse (
			'<span>' +
				theTranslator.getText ( 'HTMLViewsFactory - Distance from start of travel' ) +
				'</span>\u00a0:\u00a0' +
				theUtilities.formatDistance ( routeAndManeuver.route.chainedDistance + routeAndManeuver.maneuverDistance ),
			theHTMLElementsFactory.create ( 'div', null, maneuverTextHTML )
		);
	}

	theHTMLParserSerializer.parse (
		'<span>' +
			theTranslator.getText ( 'HTMLViewsFactory - Distance from start of route' ) +
			'</span>\u00a0:\u00a0' +
			theUtilities.formatDistance ( routeAndManeuver.maneuverDistance ),
		theHTMLElementsFactory.create ( 'div', null, maneuverTextHTML )
	);

	if ( DISTANCE.defaultValue < routeAndManeuver.maneuver.distance ) {
		theHTMLParserSerializer.parse (
			'<span>' +
				theTranslator.getText ( 'HTMLViewsFactory - Next maneuver after' ) +
				'</span>\u00a0:\u00a0' +
				theUtilities.formatDistance ( routeAndManeuver.maneuver.distance ),
			theHTMLElementsFactory.create ( 'div', null, maneuverTextHTML )
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
		noteTextAndIconHTML.objId = newObjId ( );
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

	theHTMLParserSerializer.parse ( footerText, footerHTML );

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

	theHTMLParserSerializer.parse ( footerText, footerHTML );

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
	theHTMLParserSerializer.parse ( theTranslator.getText ( 'HTMLViewsFactory - Profile' ), profileDiv );
	profileDiv.appendChild ( newProfileFactory ( ).createSvg ( route ) );

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
			theConfig.routeEditor.displayEditionInHTMLPage
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

const ourHTMLViewsFactory = Object.freeze ( new HTMLViewsFactory );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of HTMLViewsFactory  class
	@type {HTMLViewsFactory }
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourHTMLViewsFactory as theHTMLViewsFactory
};

/*
--- End of HTMLViewsFactory.js file -------------------------------------------------------------------------------------------
*/