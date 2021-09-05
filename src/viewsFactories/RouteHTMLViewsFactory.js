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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module viewsFactories
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import ObjId from '../data/ObjId.js';
import ProfileFactory from '../coreLib/ProfileFactory.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import theTranslator from '../UILib/Translator.js';
import theUtilities from '../UILib/Utilities.js';
import theNoteHTMLViewsFactory from '../viewsFactories/NoteHTMLViewsFactory.js';
import theTravelNotesData from '../data/TravelNotesData.js';

import { ZERO, DISTANCE } from '../main/Constants.js';

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
					theTranslator.getText ( 'RouteHTMLViewsFactory - Distance from start of travel' ) +
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
				theTranslator.getText ( 'RouteHTMLViewsFactory - Distance from start of route' ) +
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
					theTranslator.getText ( 'RouteHTMLViewsFactory - Next maneuver after' ) +
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

	/*
	constructor
	*/

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
		theHTMLSanitizer.sanitizeToHtmlElement ( theTranslator.getText ( 'RouteHTMLViewsFactory - Profile' ), profileDiv );
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

	getRouteManeuversAndNotesHTML ( classPrefix, route, addDataset ) {
		let notesAndManeuvers = [];
		let notesIterator = route.notes.iterator;
		while ( ! notesIterator.done ) {
			notesAndManeuvers.push (
				{
					data : notesIterator.value,
					distance : notesIterator.value.distance
				}
			);
		}
		let maneuversIterator = route.itinerary.maneuvers.iterator;
		let maneuverDistance = ZERO;
		while ( ! maneuversIterator.done ) {
			notesAndManeuvers.push (
				{
					data : maneuversIterator.value,
					distance : maneuverDistance
				}
			);
			maneuverDistance += maneuversIterator.value.distance;
		}
		notesAndManeuvers.sort ( ( first, second ) => first.distance - second.distance );
		let routeNotesAndManeuversHTML = theHTMLElementsFactory.create (
			'div',
			{
				className : classPrefix + 'Route-ManeuversAndNotes'
			}
		);
		notesAndManeuvers.forEach (
			noteOrManeuver => {
				let noteOrManeuverHTML = null;
				if ( 'Note' === noteOrManeuver.data.objType.name ) {
					noteOrManeuverHTML = theNoteHTMLViewsFactory.getNoteTextAndIconHTML (
						classPrefix,
						{ note : noteOrManeuver.data, route : route }
					);
					noteOrManeuverHTML.className = classPrefix + 'Route-Notes-Row';
				}
				else {
					noteOrManeuverHTML = this.#getManeuverHTML (
						classPrefix,
						{
							route : route,
							maneuver : noteOrManeuver.data,
							maneuverDistance : noteOrManeuver.distance
						}
					);
					noteOrManeuverHTML.className = classPrefix + 'Route-Maneuvers-Row';
				}
				if ( addDataset ) {
					noteOrManeuverHTML.dataset.tanObjId = noteOrManeuver.data.objId;
					noteOrManeuverHTML.dataset.tanMarkerObjId = ObjId.nextObjId;
					noteOrManeuverHTML.dataset.tanObjType = noteOrManeuver.data.objType.name;
				}
				routeNotesAndManeuversHTML.appendChild ( noteOrManeuverHTML );
			}
		);

		return routeNotesAndManeuversHTML;
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
					theTranslator.getText ( 'RouteHTMLViewsFactory - Route distance' ) +
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
					theTranslator.getText ( 'RouteHTMLViewsFactory - Duration' ) +
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
					theTranslator.getText ( 'RouteHTMLViewsFactory - Ascent' ) +
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
					theTranslator.getText ( 'RouteHTMLViewsFactory - Descent' ) +
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
				'RouteHTMLViewsFactory - Itinerary computed by {provider} and optimized for {transitMode}',
				{
					provider : route.itinerary.provider,
					transitMode : theTranslator.getText (
						'RouteHTMLViewsFactory - TransitMode ' +	route.itinerary.transitMode
					)
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