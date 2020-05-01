/*
Copyright - 2020 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- printFactory.js file ----------------------------------------------------------------------------------------------
This file contains:
	-
Changes:
	- v1.9.0:
		- created
Doc reviewed
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/* global L */

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newGeometry } from '../util/Geometry.js';
import { ZERO, ONE, TWO } from '../util/Constants.js';

/*
--- newPrintFactory function ------------------------------------------------------------------------------------------

This function ...

-----------------------------------------------------------------------------------------------------------------------
*/

function newPrintFactory ( ) {

	const LAT = ZERO;
	const LNG = ONE;

	let myPrintData = null;
	let myRoute = null;
	let myPrintSize = null;
	let myViews = [];

	let myGeometry = newGeometry ( );

	/*
	--- myComputePrintArea function -----------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myComputePrintSize ( ) {

		let myHTMLElementsFactory = newHTMLElementsFactory ( );
		let body = document.getElementsByTagName ( 'body' ) [ ZERO ];
		let dummyDiv = myHTMLElementsFactory.create ( 'div', { }, body );
		dummyDiv.setAttribute (
			'style',
			'position:absolute;top:0,left:0;width:' +
				( myPrintData.paperWidth - ( TWO * myPrintData.borderWidth ) ) +
				'mm;height:' +
				( myPrintData.paperHeight - ( TWO * myPrintData.borderWidth ) ) +
				'mm;'
		);

		let topLeftScreen = myGeometry.screenCoordToLatLng ( ZERO, ZERO );
		let bottomRightScreen = myGeometry.screenCoordToLatLng (
			dummyDiv.clientWidth,
			dummyDiv.clientHeight
		);
		body.removeChild ( dummyDiv );

		let scale = theTravelNotesData.map.getZoomScale ( theTravelNotesData.map.getZoom ( ), myPrintData.zoomFactor );
		myPrintSize = [
			Math.abs ( topLeftScreen [ LAT ] - bottomRightScreen [ LAT ] ) * scale,
			Math.abs ( topLeftScreen [ LNG ] - bottomRightScreen [ LNG ] ) * scale
		];
	}

	/*
	--- myComputeIntermediatePoint function ---------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myComputeIntermediatePoint ( currentView, firstItineraryPoint, lastItineraryPoint ) {

		let intermediatePoint = { lat : ZERO, lng : ZERO };

		if ( firstItineraryPoint.lng === lastItineraryPoint.lng ) {

			// Itinerary is vertical
			intermediatePoint = {
				lat : firstItineraryPoint.lat > lastItineraryPoint.lat
					?
					currentView.bottomRight [ LAT ] : currentView.topLeft [ LAT ],
				lng : firstItineraryPoint.lng
			};
			return intermediatePoint;
		}
		if ( firstItineraryPoint.lat === lastItineraryPoint.lat ) {

			// Itinerary is horizontal
			intermediatePoint = {
				lat : firstItineraryPoint.lat,
				lng : firstItineraryPoint.lng < lastItineraryPoint.lng
					?
					currentView.bottomRight [ LNG ] : currentView.topLeft [ LNG ]
			};
			return intermediatePoint;
		}

		let coefA = ( firstItineraryPoint.lat - lastItineraryPoint.lat ) / ( firstItineraryPoint.lng - lastItineraryPoint.lng );
		let coefB = firstItineraryPoint.lat - ( coefA * firstItineraryPoint.lng );

		// Searching intersection with the right side of currentView
		intermediatePoint = {
			lat : ( coefA * currentView.bottomRight [ LNG ] ) + coefB,
			lng : currentView.bottomRight [ LNG ]
		};

		if (
			intermediatePoint.lat <= currentView.topLeft [ LAT ]
				&&
				intermediatePoint.lat >= currentView.bottomRight [ LAT ]
				&&
				intermediatePoint.lng < lastItineraryPoint.lng
		) {
			return intermediatePoint;
		}

		// Searching intersection with the top side of currentView
		intermediatePoint = {
			lat : currentView.topLeft [ LAT ],
			lng : ( currentView.topLeft [ LAT ] - coefB ) / coefA
		};

		if (
			intermediatePoint.lng >= currentView.topLeft [ LNG ]
				&&
				intermediatePoint.lng <= currentView.bottomRight [ LNG ]
				&&
				intermediatePoint.lat < lastItineraryPoint.lat
		) {
			return intermediatePoint;
		}

		// Searching intersection with the left side of currentView
		intermediatePoint = {
			lat : ( coefA * currentView.topLeft [ LNG ] ) + coefB,
			lng : currentView.topLeft [ LNG ]
		};

		if (
			intermediatePoint.lat <= currentView.topLeft [ LAT ]
				&&
				intermediatePoint.lat >= currentView.bottomRight [ LAT ]
				&&
				intermediatePoint.lng > lastItineraryPoint.lng
		) {
			return intermediatePoint;
		}

		// Searching intersection with the bottom side of currentView
		intermediatePoint = {
			lat : currentView.bottomRight [ LAT ],
			lng : ( currentView.bottomRight [ LAT ] - coefB ) / coefA
		};

		if (
			intermediatePoint.lng >= currentView.topLeft [ LNG ]
				&&
				intermediatePoint.lng <= currentView.bottomRight [ LNG ]
				&&
				intermediatePoint.lat > lastItineraryPoint.lat
		) {
			return intermediatePoint;
		}
		return { lat : ZERO, lng : ZERO };
	}

	/*
	--- myComputeViews function ---------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myComputeViews ( ) {

		myViews = [];

		let itineraryPointsIterator = myRoute.itinerary.itineraryPoints.iterator;
		let done = itineraryPointsIterator.done;
		let currentView = {
			topLeft : [ itineraryPointsIterator.value.lat, itineraryPointsIterator.value.lng ],
			bottomRight : [ itineraryPointsIterator.value.lat, itineraryPointsIterator.value.lng ]
		};
		let entryPoint = itineraryPointsIterator.value;
		let previousItineraryPoint = itineraryPointsIterator.value;
		done = itineraryPointsIterator.done;
		let currentItineraryPoint = itineraryPointsIterator.value;
		while ( ! done ) {
			let tmpView = {
				topLeft : [
					Math.max ( currentView.topLeft [ LAT ], currentItineraryPoint.lat ),
					Math.min ( currentView.topLeft [ LNG ], currentItineraryPoint.lng )
				],
				bottomRight : [
					Math.min ( currentView.bottomRight [ LAT ], currentItineraryPoint.lat ),
					Math.max ( currentView.bottomRight [ LNG ], currentItineraryPoint.lng )
				]
			};
			let tmpViewSize = [
				Math.abs ( tmpView.topLeft [ LAT ] - tmpView.bottomRight [ LAT ] ),
				Math.abs ( tmpView.topLeft [ LNG ] - tmpView.bottomRight [ LNG ] )
			];
			if ( myPrintSize [ LAT ] > tmpViewSize [ LAT ] && myPrintSize [ LNG ] > tmpViewSize [ LNG ] ) {

				// itineraryPoint is inside the view...
				currentView = tmpView;
				previousItineraryPoint = itineraryPointsIterator.value;
				done = itineraryPointsIterator.done;
				currentItineraryPoint = itineraryPointsIterator.value;
				if ( done ) {
					currentView.entryPoint = entryPoint;
					currentView.exitPoint = previousItineraryPoint;
					myViews.push ( currentView );
				}
			}
			else {

				// itineraryPoint is outside the view...
				previousItineraryPoint = myComputeIntermediatePoint (
					currentView,
					previousItineraryPoint,
					currentItineraryPoint
				);
				currentView.entryPoint = entryPoint;
				currentView.exitPoint = previousItineraryPoint;
				myViews.push ( currentView );
				currentView = {
					topLeft : [ previousItineraryPoint.lat, previousItineraryPoint.lng ],
					bottomRight : [ previousItineraryPoint.lat, previousItineraryPoint.lng ]
				};
				entryPoint = [ previousItineraryPoint.lat, previousItineraryPoint.lng ];
			}
		}
	}

	/*
	--- myPrint function ----------------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myPrint ( printData, routeObjId ) {
		myRoute = newDataSearchEngine ( ).getRoute ( routeObjId );
		if ( ! myRoute ) {
			return;
		}
		myPrintData = printData;

		myComputePrintSize ( );

		myComputeViews ( );

		myViews.forEach (
			view => L.rectangle ( [ view.topLeft, view.bottomRight ] ).addTo ( theTravelNotesData.map )
		);
	}

	/*
	--- PrintFactory object -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			print : ( printData, routeObjId ) => myPrint ( printData, routeObjId )
		}
	);
}

export { newPrintFactory };

/*
--- End of PrintFactory.js file ---------------------------------------------------------------------------------------

*/