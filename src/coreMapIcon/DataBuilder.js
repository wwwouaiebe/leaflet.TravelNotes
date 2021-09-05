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

@file DataBuilder.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} MapIconData
@desc an object with the data needed to build the note and icon
@property {Array.<Number>} translation The translation to use for the svg
@property {Number} rotation The rotation to use for the svg
@property {string} rcnRef Thr RCN_REF found at the icon position or an empty string
@property {string} tooltip A string to be used for the icon tooltip
@property {string} streets A string with the street names found at the icon position

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreMapIcon
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import StreetFinder from '../coreMapIcon/StreetFinder.js';
import ArrowAndTooltipFinder from '../coreMapIcon/ArrowAndTooltipFinder.js';
import TranslationRotationFinder from '../coreMapIcon/TranslationRotationFinder.js';

import { ZERO, ICON_POSITION } from '../main/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class DataBuilder
@classdesc This class is used to search the data needed for the map icon creation
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class DataBuilder {

	#overpassAPIDataLoader = null;

	#mapIconData = Object.seal (
		{
			translation : [ ZERO, ZERO ],
			rotation : ZERO,
			rcnRef : '',
			tooltip : '',
			streets : ''
		}
	);

	#computeData = {
		mapIconPosition : null,
		route : null,
		positionOnRoute : ICON_POSITION.onRoute,
		direction : null,
		directionArrow : ' '
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	This method compute all the data needed for the map icon.
	@param {route} route The route for witch the icon must be builded
	@param {OverpassAPIDataLoader} overpassAPIDataLoader The overpassAPIDataLoader object used for query the data
	@param {Object} mapIconPosition
	@return {MapIconData} an object with the data needed to build the icon.
	*/

	buildData ( route, overpassAPIDataLoader, mapIconPosition ) {

		this.#computeData.mapIconPosition = mapIconPosition;
		this.#computeData.route = route;
		this.#computeData.positionOnRoute = ICON_POSITION.onRoute;
		this.#computeData.direction = null;
		this.#computeData.directionArrow = ' ';

		this.#overpassAPIDataLoader = overpassAPIDataLoader;

		this.#mapIconData.translation = [ ZERO, ZERO ];
		this.#mapIconData.rotation = ZERO;
		this.#mapIconData.rcnRef = '';
		this.#mapIconData.tooltip = '';
		this.#mapIconData.streets = '';

		new TranslationRotationFinder ( this.#computeData, this.#mapIconData ).findData ( );
		new ArrowAndTooltipFinder ( this.#computeData, this.#mapIconData ).findData ( );
		new StreetFinder ( this.#overpassAPIDataLoader, this.#computeData, this.#mapIconData ).findData ( );

		return this.#mapIconData;
	}

}

export default DataBuilder;

/*
--- End of DataBuilder.js file -----------------------------------------------------------------------------------------
*/