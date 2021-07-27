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
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file RouteHTMLViewsFactory.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module RouteHTMLViewsFactory
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import ObjId from '../data/ObjId.js';
import ProfileFactory from '../core/ProfileFactory.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theHTMLSanitizer from '../util/HTMLSanitizer.js';
import theTranslator from '../UI/Translator.js';
import theUtilities from '../util/Utilities.js';
import theNoteHTMLViewsFactory from '../UI/NoteHTMLViewsFactory.js';
import theTravelNotesData from '../data/TravelNotesData.js';

import { ZERO, DISTANCE } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RouteHTMLViewsFactory
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class RouteHTMLViewsFactory {

	/**
	Gives an HTMLElement with the icon, instruction, distance since the beginning of the travel (if the instruction is
	linked to a chained route), distance since the beginning of the route and distance till the next maneuver
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@param {Object} routeAndManeuver An object with the maneuver, the route to witch the maneuver is linked and the distance
	between the beginning of the route and the maneuver
	@return {HTMLElement}
	@private
	*/

	#getManeuverHTML ( classPrefix, routeAndManeuver ) {
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

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Gives an HTMLElement with the SVG profile of a route
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@param {Route} route The route for witch the HTMLElement will be created
	*/

	getRouteProfileHTML ( classPrefix, route ) {
		let profileDiv = theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'RouteProfile' } );
		theHTMLSanitizer.sanitizeToHtmlElement ( theTranslator.getText ( 'HTMLViewsFactory - Profile' ), profileDiv );
		profileDiv.appendChild ( new ProfileFactory ( ).createSvg ( route ) );

		return profileDiv;
	}

	/**
	Gives an HTMLElement with all the notes and maneuvers linked to a route, ordered by distance since the
	beginning of the route
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@param {Route} route The route for witch the HTMLElement will be created
	@return {HTMLElement}
	*/

	getRouteManeuversAndNotesHTML ( classPrefix, route ) {
		let notesAndManeuverHTML = [];
		let notesIterator = route.notes.iterator;
		while ( ! notesIterator.done ) {
			let noteTextAndIconHTML = theNoteHTMLViewsFactory.getNoteTextAndIconHTML (
				classPrefix,
				{ note : notesIterator.value, route : route }
			);
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
			let maneuverHTML = this.#getManeuverHTML (
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
	Gives an HTMLElement with a route name, route distance, route duration ( except for bike),
	route ascent (if any) and route descent (if any)
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@param {Route} route The route for witch the HTMLElement will be created
	@return {HTMLElement}
	*/

	getRouteHeaderHTML ( classPrefix, route ) {
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
	Gives an HTMLElement with the provider and transit mode used for the itinerary creation
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@param {Route} route The route for witch the HTMLElement will be created
	@return {HTMLElement}
	*/

	getRouteFooterHTML ( classPrefix, route ) {
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

}
const theRouteHTMLViewsFactory = new RouteHTMLViewsFactory ( );

export default theRouteHTMLViewsFactory;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of RouteHTMLViewsFactory.js file

@------------------------------------------------------------------------------------------------------------------------------
*/