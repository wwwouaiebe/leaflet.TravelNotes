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
	- v1.2.0:
		- created
	- v2.0.0:
		- Issue ♯147 : Add the travel name to gpx file name
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file GpxFactory.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreLib
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theDataSearchEngine from '../data/DataSearchEngine.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theUtilities from '../UILib/Utilities.js';

const OUR_TAB_0 = '\n';
const OUR_TAB_1 = '\n\t';
const OUR_TAB_2 = '\n\t\t';
const OUR_TAB_3 = '\n\t\t\t';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is used to create gpx files
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class GpxFactory {

	#myGpxString = '';
	#timeStamp = '';
	#route = null;

	/**
	Creates the header of the gpx file
	@private
	*/

	#addHeader ( ) {

		// header
		this.#myGpxString = '<?xml version="1.0"?>' + OUR_TAB_0;
		this.#myGpxString += '<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
		'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
		'xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" ' +
		'version="1.1" creator="leaflet.TravelNotes">';
	}

	/**
	Add the waypoints to the gpx file
	@private
	*/

	#addWayPoints ( ) {
		let wayPointsIterator = this.#route.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			this.#myGpxString +=
				OUR_TAB_1 + '<wpt lat="' + wayPointsIterator.value.lat + '" lon="' + wayPointsIterator.value.lng + '" ' +
				this.#timeStamp + '/>';

		}
	}

	/**
	Add the route to the gpx file
	@private
	*/

	#addRoute ( ) {
		this.#myGpxString += OUR_TAB_1 + '<rte>';
		let maneuverIterator = this.#route.itinerary.maneuvers.iterator;
		while ( ! maneuverIterator.done ) {
			let wayPoint = this.#route.itinerary.itineraryPoints.getAt (
				maneuverIterator.value.itineraryPointObjId
			);
			let instruction = maneuverIterator.value.instruction
				.replaceAll ( /\u0027/g, '&apos;' )
				.replaceAll ( /"/g, '&quot;' )
				.replaceAll ( /</g, '&lt;' )
				.replaceAll ( />/g, '&gt;' );
			this.#myGpxString +=
				OUR_TAB_2 +
				'<rtept lat="' +
				wayPoint.lat +
				'" lon="' +
				wayPoint.lng +
				'" ' +
				this.#timeStamp +
				'desc="' +
				instruction + '" />';
		}
		this.#myGpxString += OUR_TAB_1 + '</rte>';
	}

	/**
	Add the track to the gpx file
	@private
	*/

	#addTrack ( ) {
		this.#myGpxString += OUR_TAB_1 + '<trk>';
		this.#myGpxString += OUR_TAB_2 + '<trkseg>';
		let itineraryPointsIterator = this.#route.itinerary.itineraryPoints.iterator;
		while ( ! itineraryPointsIterator.done ) {
			this.#myGpxString +=
				OUR_TAB_3 +
				'<trkpt lat="' + itineraryPointsIterator.value.lat +
				'" lon="' +
				itineraryPointsIterator.value.lng +
				'" ' +
				this.#timeStamp +
				' />';
		}
		this.#myGpxString += OUR_TAB_2 + '</trkseg>';
		this.#myGpxString += OUR_TAB_1 + '</trk>';
	}

	/**
	Add the footer to the gpx file
	@private
	*/

	#addFooter ( ) {
		this.#myGpxString += OUR_TAB_0 + '</gpx>';
	}

	/**
	Save the gpx string to a file
	@private
	*/

	#saveGpxToFile ( ) {
		let fileName =
			( '' === theTravelNotesData.travel.name ? '' : theTravelNotesData.travel.name + ' - ' ) + this.#route.computedName;
		if ( '' === fileName ) {
			fileName = 'TravelNote';
		}
		fileName += '.gpx';
		theUtilities.saveFile ( fileName, this.#myGpxString, 'application/xml' );
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Transform a route into a gpx file
	@param {!number} routeObjId the objId of the route to save in a gpx file
	*/

	routeToGpx ( routeObjId ) {
		this.#route = theDataSearchEngine.getRoute ( routeObjId );
		if ( ! this.#route ) {
			return;
		}
		this.#timeStamp = 'time="' + new Date ( ).toISOString ( ) + '" ';

		this.#addHeader ( );
		this.#addWayPoints ( );
		this.#addRoute ( );
		this.#addTrack ( );
		this.#addFooter ( );
		this.#saveGpxToFile ( );
	}
}

export default GpxFactory;

/*
--- End of GpxFactory.js file -------------------------------------------------------------------------------------------------
*/