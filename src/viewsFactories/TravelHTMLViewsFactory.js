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
		- Added noteObjId in the this.#getNoteTextAndIconHTML method
	- v1.5.0:
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯70 : Put the get...HTML fcts outside of the editors
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TravelHTMLViewsFactory.js
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

import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import theUtilities from '../UILib/Utilities.js';
import theConfig from '../data/Config.js';
import theTranslator from '../UILib/Translator.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theNoteHTMLViewsFactory from '../viewsFactories/NoteHTMLViewsFactory.js';
import theRouteHTMLViewsFactory from '../viewsFactories/RouteHTMLViewsFactory.js';
import { DISTANCE, ZERO } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class creates HTMLElements for travel, notes and routes
@see {@link theHTMLViewsFactory} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelHTMLViewsFactory {

	/**
	Gives an HTMLElement with the travel name, distance, ascent (if any), descent (if any) and a list with all the routes
	of the travel
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@return {HTMLElement}
	@private
	*/

	#getTravelHeaderHTML ( classPrefix ) {
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
				theTranslator.getText ( 'TravelHTMLViewsFactory - Travel distance' ) +
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
					theTranslator.getText ( 'travelHTMLViewsFactory - Travel ascent' ) +
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
					theTranslator.getText ( 'TravelHTMLViewsFactory - Travel descent' ) +
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
	Gives an HTMLElement with the Copyright notice and OSM attributions
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@return {HTMLElement}
	@private
	*/

	#getTravelFooterHTML ( classPrefix ) {
		let footerText =
			theTranslator.getText ( 'TravelHTMLViewsFactory - Travel footer' ) +
			'<a href="https://github.com/wwwouaiebe/leaflet.TravelNotes"' +
			' target="_blank" title="https://github.com/wwwouaiebe/leaflet.TravelNotes" >Travel & Notes</a>, © ' +
			'<a href="https://www.ouaie.be/"' +
			' target="_blank" title="https://www.ouaie.be/" >wwwouaiebe 2017 2021</a> © ' +
			'<a href="https://www.openstreetmap.org/copyright"' +
			' target="_blank" title="https://www.openstreetmap.org/copyright">' +
			theTranslator.getText ( 'TravelHTMLViewsFactory - OpenStreetMap contributors' ) + '</a>';
		let footerHTML = theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'TravelFooter' } );

		theHTMLSanitizer.sanitizeToHtmlElement ( footerText, footerHTML );

		return footerHTML;
	}

	/*
	constructor
	*/

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
		let travelHTML = theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'Travel' } );

		travelHTML.appendChild ( this.#getTravelHeaderHTML ( classPrefix ) );
		travelHTML.appendChild ( theNoteHTMLViewsFactory.getTravelNotesHTML ( classPrefix ) );

		let travelRoutesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! travelRoutesIterator.done ) {
			let useEditedRoute =
				theConfig.routeEditor.showEditedRouteInRoadbook
				&&
				travelRoutesIterator.value.objId === theTravelNotesData.editedRouteObjId;
			let route = useEditedRoute ? theTravelNotesData.travel.editedRoute : travelRoutesIterator.value;
			travelHTML.appendChild ( theRouteHTMLViewsFactory.getRouteHeaderHTML ( classPrefix, route ) );
			if ( route.itinerary.hasProfile ) {
				travelHTML.appendChild ( theRouteHTMLViewsFactory.getRouteProfileHTML ( classPrefix, route ) );
			}
			travelHTML.appendChild ( theRouteHTMLViewsFactory.getRouteManeuversAndNotesHTML ( classPrefix, route, false ) );
			travelHTML.appendChild ( theRouteHTMLViewsFactory.getRouteFooterHTML ( classPrefix, route ) );
		}

		travelHTML.appendChild ( this.#getTravelFooterHTML ( classPrefix ) );

		return travelHTML;
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of TravelHTMLViewsFactory  class
@type {TravelHTMLViewsFactory }
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theTravelHTMLViewsFactory = new TravelHTMLViewsFactory ( );

export default theTravelHTMLViewsFactory;

/*
--- End of TravelHTMLViewsFactory.js file -------------------------------------------------------------------------------------
*/