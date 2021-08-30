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
Doc reviewed 20210830
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TranslationRotationFinder.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreMapIcon
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theGeometry from '../util/Geometry.js';

import { ICON_DIMENSIONS, DISTANCE, ZERO, ONE, TWO, DEGREES, ICON_POSITION } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TranslationRotationFinder
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TranslationRotationFinder {

	#computeData = null;
	#mapIconData = null;

	/**
	This method compute the translation needed to have the itinerary point in the middle of the svg
	*/

	computeTranslation ( ) {
		this.#mapIconData.translation = theGeometry.subtrackPoints (
			[ ICON_DIMENSIONS.svgViewboxDim / TWO, ICON_DIMENSIONS.svgViewboxDim / TWO ],
			theGeometry.project ( this.#computeData.mapIconPosition.latLng, theConfig.note.svgIcon.zoom )
		);
	}

	/**
	this method compute the rotation needed to have the SVG oriented on the itinerary
	and compute also the direction to take after the icon
	*/

	computeRotationAndDirection ( ) {

		// searching points at least at 10 m ( theConfig.note.svgIcon.angleDistance ) from the icon point,
		// one for rotation and one for direction
		let distance = DISTANCE.defaultValue;
		let rotationItineraryPoint = this.#computeData.route.itinerary.itineraryPoints.first;
		let directionItineraryPoint = this.#computeData.route.itinerary.itineraryPoints.last;
		let directionPointReached = false;

		this.#computeData.route.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				if ( this.#computeData.mapIconPosition.distance - distance > theConfig.note.svgIcon.angleDistance ) {
					rotationItineraryPoint = itineraryPoint;
				}
				if (
					distance - this.#computeData.mapIconPosition.distance
					>
					theConfig.note.svgIcon.angleDistance && ! directionPointReached
				) {
					directionItineraryPoint = itineraryPoint;
					directionPointReached = true;
				}
				distance += itineraryPoint.distance;
			}
		);

		let iconPoint = theGeometry.addPoints (
			theGeometry.project ( this.#computeData.mapIconPosition.latLng, theConfig.note.svgIcon.zoom ),
			this.#mapIconData.translation
		);

		// computing rotation... if possible
		if (
			this.#computeData.mapIconPosition.nearestItineraryPointObjId
			!==
			this.#computeData.route.itinerary.itineraryPoints.first.objId
		) {
			let rotationPoint = theGeometry.addPoints (
				theGeometry.project ( rotationItineraryPoint.latLng, theConfig.note.svgIcon.zoom ),
				this.#mapIconData.translation
			);
			this.#mapIconData.rotation =
				Math.atan (
					( iconPoint [ ONE ] - rotationPoint [ ONE ] )
					/
					( rotationPoint [ ZERO ] - iconPoint [ ZERO ] )
				)
				*
				DEGREES.d180 / Math.PI;
			if ( ZERO > this.#mapIconData.rotation ) {
				this.#mapIconData.rotation += DEGREES.d360;
			}
			this.#mapIconData.rotation -= DEGREES.d270;

			// point 0,0 of the svg is the UPPER left corner
			if ( ZERO > rotationPoint [ ZERO ] - iconPoint [ ZERO ] ) {
				this.#mapIconData.rotation += DEGREES.d180;
			}
		}

		// computing direction ... if possible

		if (
			this.#computeData.mapIconPosition.nearestItineraryPointObjId
			!==
			this.#computeData.route.itinerary.itineraryPoints.last.objId
		) {
			let directionPoint = theGeometry.addPoints (
				theGeometry.project ( directionItineraryPoint.latLng, theConfig.note.svgIcon.zoom ),
				this.#mapIconData.translation
			);
			this.#computeData.direction = Math.atan (
				( iconPoint [ ONE ] - directionPoint [ ONE ] )
				/
				( directionPoint [ ZERO ] - iconPoint [ ZERO ] )
			)
				*
				DEGREES.d180 / Math.PI;

			// point 0,0 of the svg is the UPPER left corner
			if ( ZERO > directionPoint [ ZERO ] - iconPoint [ ZERO ] ) {
				this.#computeData.direction += DEGREES.d180;
			}
			this.#computeData.direction -= this.#mapIconData.rotation;

			// setting direction between 0 and 360
			while ( DEGREES.d0 > this.#computeData.direction ) {
				this.#computeData.direction += DEGREES.d360;
			}
			while ( DEGREES.d360 < this.#computeData.direction ) {
				this.#computeData.direction -= DEGREES.d360;
			}
		}
		if (
			this.#computeData.mapIconPosition.nearestItineraryPointObjId
			===
			this.#computeData.route.itinerary.itineraryPoints.first.objId
		) {
			this.#mapIconData.rotation = -this.#computeData.direction - DEGREES.d90;
			this.#computeData.direction = null;
			this.#computeData.positionOnRoute = ICON_POSITION.atStart;
		}

		if (
			this.#computeData.mapIconPosition.latLng [ ZERO ] === this.#computeData.route.itinerary.itineraryPoints.last.lat
			&&
			this.#computeData.mapIconPosition.latLng [ ONE ] === this.#computeData.route.itinerary.itineraryPoints.last.lng
		) {

			// using lat & lng because last point is sometime duplicated
			this.#computeData.direction = null;
			this.#computeData.positionOnRoute = ICON_POSITION.atEnd;
		}
	}

	constructor ( computeData, mapIconData ) {
		this.#computeData = computeData;
		this.#mapIconData = mapIconData;
	}

}

export default TranslationRotationFinder;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of ArrowAndTooltipFinder.js file

@------------------------------------------------------------------------------------------------------------------------------
*/