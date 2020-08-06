
import { theDataSearchEngine } from '../data/DataSearchEngine.js';
import { newUtilities } from '../util/Utilities.js';

function myNewGpxFactory ( ) {

	const TAB_0 = '\n';
	const TAB_1 = '\n\t';
	const TAB_2 = '\n\t\t';
	const TAB_3 = '\n\t\t\t';

	let myGpxString = '';
	let myTimeStamp = '';
	let myRoute = null;

	function myAddHeader ( ) {
		myTimeStamp = 'time="' + new Date ( ).toISOString ( ) + '" ';

		// header
		myGpxString = '<?xml version="1.0"?>' + TAB_0;
		myGpxString += '<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
		'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
		'xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" ' +
		'version="1.1" creator="leaflet.TravelNotes">';
	}

	function myAddWayPoints ( ) {
		let wayPointsIterator = myRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			myGpxString +=
				TAB_1 + '<wpt lat="' + wayPointsIterator.value.lat + '" lon="' + wayPointsIterator.value.lng + '" ' +
				myTimeStamp + '/>';

		}
	}

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

	function myAddFooter ( ) {
		myGpxString += TAB_0 + '</gpx>';
	}

	function mySaveGpxToFile ( ) {
		let fileName = myRoute.name;
		if ( '' === fileName ) {
			fileName = 'TravelNote';
		}
		fileName += '.gpx';
		newUtilities ( ).saveFile ( fileName, myGpxString );
	}

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

	class GpxFactory {

		routeToGpx ( routeObjId ) {
			myRouteToGpx ( routeObjId );
		}
	}

	return Object.seal ( new GpxFactory );
}

export {
	myNewGpxFactory as newGpxFactory
};