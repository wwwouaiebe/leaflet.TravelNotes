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
Doc reviewed 20200807
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

@module GpxFactory
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theDataSearchEngine } from '../data/DataSearchEngine.js';
import { theUtilities } from '../util/Utilities.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewGpxFactory
@desc constructor of GpxFactory object
@return {GpxFactory} an instance of GpxFactory object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewGpxFactory ( ) {

	const TAB_0 = '\n';
	const TAB_1 = '\n\t';
	const TAB_2 = '\n\t\t';
	const TAB_3 = '\n\t\t\t';

	let myGpxString = '';
	let myTimeStamp = '';
	let myRoute = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddHeader
	@desc Creates the header of the gpx file
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddHeader ( ) {
		myTimeStamp = 'time="' + new Date ( ).toISOString ( ) + '" ';

		// header
		myGpxString = '<?xml version="1.0"?>' + TAB_0;
		myGpxString += '<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
		'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
		'xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" ' +
		'version="1.1" creator="leaflet.TravelNotes">';
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddWayPoints
	@desc Add the waypoints to the gpx file
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddWayPoints ( ) {
		let wayPointsIterator = myRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			myGpxString +=
				TAB_1 + '<wpt lat="' + wayPointsIterator.value.lat + '" lon="' + wayPointsIterator.value.lng + '" ' +
				myTimeStamp + '/>';

		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddRoute
	@desc Add the route to the gpx file
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddRoute ( ) {
		myGpxString += TAB_1 + '<rte>';
		let maneuverIterator = myRoute.itinerary.maneuvers.iterator;
		while ( ! maneuverIterator.done ) {
			let wayPoint = myRoute.itinerary.itineraryPoints.getAt (
				maneuverIterator.value.itineraryPointObjId
			);
			let instruction = maneuverIterator.value.instruction
				.replace ( '&', '&amp;' )
				.replace ( '"', '&apos;' )
				.replace ( '"', '&quote;' )
				.replace ( '>', '&gt;' )
				.replace ( '<', '&lt;' );
			myGpxString +=
				TAB_2 +
				'<rtept lat="' +
				wayPoint.lat +
				'" lon="' +
				wayPoint.lng +
				'" ' +
				myTimeStamp +
				'desc="' +
				instruction + '" />';
		}
		myGpxString += TAB_1 + '</rte>';
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddTrack
	@desc Add the track to the gpx file
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddTrack ( ) {
		myGpxString += TAB_1 + '<trk>';
		myGpxString += TAB_2 + '<trkseg>';
		let itineraryPointsIterator = myRoute.itinerary.itineraryPoints.iterator;
		while ( ! itineraryPointsIterator.done ) {
			myGpxString +=
				TAB_3 +
				'<trkpt lat="' + itineraryPointsIterator.value.lat +
				'" lon="' +
				itineraryPointsIterator.value.lng +
				'" ' +
				myTimeStamp +
				' />';
		}
		myGpxString += TAB_2 + '</trkseg>';
		myGpxString += TAB_1 + '</trk>';
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddFooter
	@desc Add the footer to the gpx file
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddFooter ( ) {
		myGpxString += TAB_0 + '</gpx>';
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function mySaveGpxToFile
	@desc save the gpx string to a file
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function mySaveGpxToFile ( ) {
		let fileName = myRoute.computedName;
		if ( '' === fileName ) {
			fileName = 'TravelNote';
		}
		fileName += '.gpx';
		theUtilities.saveFile ( fileName, myGpxString );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function mySaveGpxToFile
	@desc Transform a route into a gpx file
	@param {!number} routeObjId the objId of the route to save in a gpx file
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myRouteToGpx ( routeObjId ) {
		myRoute = theDataSearchEngine.getRoute ( routeObjId );
		if ( ! myRoute ) {
			return;
		}

		myAddHeader ( );
		myAddWayPoints ( );
		myAddRoute ( );
		myAddTrack ( );
		myAddFooter ( );
		mySaveGpxToFile ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class
	@classdesc This class is used to create gpx files
	@see {@link newGpxFactory} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class GpxFactory {

		/**
		Transform a route into a gpx file
		@param {!number} routeObjId the objId of the route to save in a gpx file
		*/

		routeToGpx ( routeObjId ) {
			myRouteToGpx ( routeObjId );
		}
	}

	return Object.seal ( new GpxFactory );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newGpxFactory
	@desc constructor of GpxFactory object
	@return {GpxFactory} an instance of GpxFactory object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewGpxFactory as newGpxFactory
};