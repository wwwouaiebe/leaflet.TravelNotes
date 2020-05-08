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

import { theErrorsUI } from '../UI/ErrorsUI.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newGeometry } from '../util/Geometry.js';
import { theConfig } from '../data/Config.js';
import { theTranslator } from '../UI/Translator.js';
import { theLayersToolbarUI } from '../UI/LayersToolbarUI.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';
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
	let myViewCounter = 0;
	let myRoutePolyline = null;

	let myBody = document.getElementsByTagName ( 'body' ) [ ZERO ];

	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myGeometry = newGeometry ( );
	let myTilesPage = 0;

	/*
	--- onAfterPrint function -----------------------------------------------------------------------------------------

	This function restore the map after printing

	-------------------------------------------------------------------------------------------------------------------
	*/

	function onAfterPrint ( ) {

		while ( ZERO < document.getElementsByClassName ( 'TravelNotes-routeViewDiv' ).length ) {
			myBody.removeChild ( document.getElementsByClassName ( 'TravelNotes-routeViewDiv' ) [ ZERO ] );
		}

		document.getElementById ( 'TravelNotes-PrintToolbar-PrintButton' )
			.removeEventListener (	'click', ( ) => window.print ( ), false );
		document.getElementById ( 'TravelNotes-PrintToolbar-CancelButton' )
			.removeEventListener (	'click', onAfterPrint, false );
		myBody.removeChild ( document.getElementById ( 'TravelNotes-PrintToolbar' ) );

		myBody.classList.remove ( 'TravelNotes-PrintPageBreak' );
		myBody.classList.remove ( 'TravelNotes-PrintViews' );

		theTravelNotesData.map.invalidateSize ( false );

		window.removeEventListener ( 'afterprint', onAfterPrint, true );
	}

	/*
	--- myComputePrintSize function -----------------------------------------------------------------------------------

	This function compute the print size in lat and lng
	transforming the dimension given in mm by the user.

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myComputePrintSize ( ) {

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
		const TILE_SIZE = 256;
		myTilesPage = Math.ceil ( dummyDiv.clientWidth / TILE_SIZE ) * Math.ceil ( dummyDiv.clientHeight / TILE_SIZE );
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
	--- myIsFirstPointOnView function ---------------------------------------------------------------------------------

	This function test if firstItineraryPoint is on the frame of currentView

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myIsFirstPointOnView ( currentView, firstItineraryPoint ) {
		const tolerance = 0.000001;
		if (
			firstItineraryPoint.lat - currentView.bottomLeft.lat < tolerance
			||
			currentView.upperRight.lat - firstItineraryPoint.lat < tolerance
			||
			firstItineraryPoint.lng - currentView.bottomLeft.lng < tolerance
			||
			currentView.upperRight.lng - firstItineraryPoint.lng < tolerance
		) {

			// itinerary point is really near the frame. we consider the itinerary point as intermediate point
			return { lat : firstItineraryPoint.lat, lng : firstItineraryPoint.lng };
		}
		return null;
	}

	/*
	--- myIsItineraryHorOrVer function --------------------------------------------------------------------------------

	This function compute if the line defined by firstItineraryPoint  lastItineraryPoint
	is horizontal or vertical. If yes, the intersection of the line and currentView is returned

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myIsItineraryHorOrVer ( currentView, firstItineraryPoint, lastItineraryPoint ) {
		if ( firstItineraryPoint.lng === lastItineraryPoint.lng ) {

			// Itinerary is vertical
			return {
				lat : firstItineraryPoint.lat > lastItineraryPoint.lat
					?
					currentView.bottomLeft.lat : currentView.upperRight.lat,
				lng : firstItineraryPoint.lng
			};
		}
		if ( firstItineraryPoint.lat === lastItineraryPoint.lat ) {

			// Itinerary is horizontal
			return {
				lat : firstItineraryPoint.lat,
				lng : firstItineraryPoint.lng < lastItineraryPoint.lng
					?
					currentView.upperRight.lng : currentView.bottomLeft.lng
			};
		}
		return null;
	}

	/*
	--- myHaveViewOnlyOnePoint function ---------------------------------------------------------------------------

	This function test if currentView is only a point. If yes an intermediatePoint is computed
	to exetend the view to the maximun possible

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myHaveViewOnlyOnePoint ( currentView, firstItineraryPoint, lastItineraryPoint ) {
		if (
			currentView.bottomLeft.lat === currentView.upperRight.lat
			&&
			currentView.bottomLeft.lng === currentView.upperRight.lng
		) {
			let coef = Math.min (
				Math.abs ( myPrintSize [ LAT ] / ( lastItineraryPoint.lat - firstItineraryPoint.lat ) ),
				Math.abs ( myPrintSize [ LNG ] / ( lastItineraryPoint.lng - firstItineraryPoint.lng ) )
			);
			return {
				lat : firstItineraryPoint.lat + ( coef * ( lastItineraryPoint.lat - firstItineraryPoint.lat ) ),
				lng : firstItineraryPoint.lng + ( coef * ( lastItineraryPoint.lng - firstItineraryPoint.lng ) )
			};
		}
		return null;
	}

	/*
	--- myComputeIntermediatePoint function ---------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myComputeIntermediatePoint ( currentView, firstItineraryPoint, lastItineraryPoint ) {

		/*
		we have to find the intersection of the line segment 'firstItineraryPoint -> lastItineraryPoint' with
		the rectangle defined by currentView.lowerLeft, currentView.upperRight.
		We know also that firstItineraryPoint is inside currentView
		but perhaps on the frame and that lastItineraryPoint is outside the frame so the intersection is
		always between firstItineraryPoint and lastItineraryPoint

		Equation of the a line :
			y = coefA * x + coefB
			or
			x = ( y - coefB ) / coefA

		So we have :

			firstItineraryPoint.lat = coefA * firstItineraryPoint.lng + coefB
			and
			lastItineraryPoint.lat = coefA * lastItineraryPoint.lng + coefB

		and after some transformations:
			coefA = ( firstItineraryPoint.lat - lastItineraryPoint.lat ) / ( firstItineraryPoint.lng - lastItineraryPoint.lng )
			coefB = firstItineraryPoint.lat - ( coefA * firstItineraryPoint.lng )

		Notice: we have some computing problems when
		- currentView.lowerLeft === currentView.upperRight. We cannot find an intersection and we have to compute a
		intermediatePoint outside the currentView
		- firstItineraryPoint is on the frame (or really near the frame ) of currentView -> the intersection
		is the firstItineraryPoint
		- the line segment 'firstItineraryPoint -> lastItineraryPoint' is horizontal or vertical
		(we have to divide by 0)

		So we test first the 3 problems and then we compute the intersection if needed
		*/

		let intermediatePoint = myHaveViewOnlyOnePoint ( currentView, firstItineraryPoint, lastItineraryPoint );
		if ( intermediatePoint ) {
			return intermediatePoint;
		}

		intermediatePoint = myIsFirstPointOnView ( currentView, firstItineraryPoint );
		if ( intermediatePoint ) {
			return intermediatePoint;
		}

		intermediatePoint = myIsItineraryHorOrVer ( currentView, firstItineraryPoint, lastItineraryPoint );
		if ( intermediatePoint ) {
			return intermediatePoint;
		}

		let coefA = ( firstItineraryPoint.lat - lastItineraryPoint.lat ) / ( firstItineraryPoint.lng - lastItineraryPoint.lng );
		let coefB = firstItineraryPoint.lat - ( coefA * firstItineraryPoint.lng );

		// Searching intersection with the right side of currentView
		intermediatePoint = {
			lat : ( coefA * currentView.upperRight.lng ) + coefB,
			lng : currentView.upperRight.lng
		};

		if (
			intermediatePoint.lat <= currentView.upperRight.lat
				&&
				intermediatePoint.lat >= currentView.bottomLeft.lat
				&&
				intermediatePoint.lng < lastItineraryPoint.lng
		) {
			return intermediatePoint;
		}

		// Searching intersection with the top side of currentView
		intermediatePoint = {
			lat : currentView.upperRight.lat,
			lng : ( currentView.upperRight.lat - coefB ) / coefA
		};

		if (
			intermediatePoint.lng >= currentView.bottomLeft.lng
				&&
				intermediatePoint.lng <= currentView.upperRight.lng
				&&
				intermediatePoint.lat < lastItineraryPoint.lat
		) {
			return intermediatePoint;
		}

		// Searching intersection with the left side of currentView
		intermediatePoint = {
			lat : ( coefA * currentView.bottomLeft.lng ) + coefB,
			lng : currentView.bottomLeft.lng
		};

		if (
			intermediatePoint.lat <= currentView.upperRight.lat
				&&
				intermediatePoint.lat >= currentView.bottomLeft.lat
				&&
				intermediatePoint.lng > lastItineraryPoint.lng
		) {
			return intermediatePoint;
		}

		// Searching intersection with the bottom side of currentView
		intermediatePoint = {
			lat : currentView.bottomLeft.lat,
			lng : ( currentView.bottomLeft.lat - coefB ) / coefA
		};

		if (
			intermediatePoint.lng >= currentView.bottomLeft.lng
				&&
				intermediatePoint.lng <= currentView.upperRight.lng
				&&
				intermediatePoint.lat > lastItineraryPoint.lat
		) {
			return intermediatePoint;
		}
		throw new Error ( 'intermediate point not found' );
	}

	/*
	--- myComputeViews function ---------------------------------------------------------------------------------------

	This function compute the different views needed to print the maps

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myComputeViews ( ) {

		myViews = [];

		// Iteration on the route
		let itineraryPointsIterator = myRoute.itinerary.itineraryPoints.iterator;
		let done = itineraryPointsIterator.done;

		// First view is created with the first point
		let currentView = {
			bottomLeft : { lat : itineraryPointsIterator.value.lat, lng : itineraryPointsIterator.value.lng },
			upperRight : { lat : itineraryPointsIterator.value.lat, lng : itineraryPointsIterator.value.lng }
		};
		let entryPoint = { lat : itineraryPointsIterator.value.lat, lng : itineraryPointsIterator.value.lng };
		let previousItineraryPoint = itineraryPointsIterator.value;

		// we go to the next point
		done = itineraryPointsIterator.done;
		let currentItineraryPoint = itineraryPointsIterator.value;
		while ( ! done ) {

			// a temporary view is created, extending the current view with the current itinerary point
			let tmpView = {
				bottomLeft : {
					lat : Math.min ( currentView.bottomLeft.lat, currentItineraryPoint.lat ),
					lng : Math.min ( currentView.bottomLeft.lng, currentItineraryPoint.lng )
				},
				upperRight : {
					lat : Math.max ( currentView.upperRight.lat, currentItineraryPoint.lat ),
					lng : Math.max ( currentView.upperRight.lng, currentItineraryPoint.lng )
				}
			};

			// computing the temporary view size...
			let tmpViewSize = [
				tmpView.upperRight.lat - tmpView.bottomLeft.lat,
				tmpView.upperRight.lng - tmpView.bottomLeft.lng
			];

			// and comparing with the desired max view size
			if ( myPrintSize [ LAT ] > tmpViewSize [ LAT ] && myPrintSize [ LNG ] > tmpViewSize [ LNG ] ) {

				// the current itineraryPoint is inside the temporary view.
				// the temporary view becomes the current view and we go to the next itinerary point
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

				// the itineraryPoint is outside the view. We have to compute an intermediate
				// point (where the route intersect with the max size view).
				previousItineraryPoint = myComputeIntermediatePoint (
					currentView,
					previousItineraryPoint,
					currentItineraryPoint
				);

				// The view is extended to the intermediate point
				currentView.bottomLeft = {
					lat : Math.min ( currentView.bottomLeft.lat, previousItineraryPoint.lat ),
					lng : Math.min ( currentView.bottomLeft.lng, previousItineraryPoint.lng )
				};
				currentView.upperRight = {
					lat : Math.max ( currentView.upperRight.lat, previousItineraryPoint.lat ),
					lng : Math.max ( currentView.upperRight.lng, previousItineraryPoint.lng )
				};

				// entry point and exit point are computed and added to the view
				currentView.entryPoint = entryPoint;
				currentView.exitPoint = previousItineraryPoint;

				// and the view added to the list view
				myViews.push ( currentView );

				// and a new view is created
				currentView = {
					bottomLeft : { lat : previousItineraryPoint.lat, lng : previousItineraryPoint.lng },
					upperRight : { lat : previousItineraryPoint.lat, lng : previousItineraryPoint.lng }
				};
				entryPoint = { lat : previousItineraryPoint.lat, lng : previousItineraryPoint.lng };
			}
			if ( theConfig.printRouteMap.maxTiles < myViews.length * myTilesPage ) {

				// verifying that we don't have to mutch views
				done = true;
			}
		} // end of while ( ! done )
	}

	/*
	--- myGetLayer function -------------------------------------------------------------------------------------------

	This function creates a leaflet layer with the same map that the main map

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetLayer ( ) {
		let layer = theLayersToolbarUI.getLayer ( theTravelNotesData.travel.layerName );
		let url = layer.url;
		if ( layer.providerKeyNeeded ) {
			let providerKey = theAPIKeysManager.getKey ( layer.providerName.toLowerCase ( ) );
			url = url.replace ( '{providerKey}', providerKey );
		}
		let leafletLayer = null;
		if ( 'wmts' === layer.service.toLowerCase ( ) ) {
			leafletLayer = L.tileLayer ( url );
		}
		else {
			leafletLayer = L.tileLayer.wms ( url, layer.wmsOptions );
		}

		leafletLayer.options.attribution =
			' &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" ' +
			'title="OpenStreetMap contributors">OpenStreetMap contributors</a> ' +
			layer.attribution +
			'| &copy; <a href="https://github.com/wwwouaiebe" target="_blank" ' +
			'title="https://github.com/wwwouaiebe">Travel & Notes</a> ';

		return leafletLayer;
	}

	/*
	--- myGetNotesMarkers function ------------------------------------------------------------------------------------

	This function creates markers for notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetNotesMarkers ( ) {
		let notesMarkers = [];
		myRoute.notes.forEach (
			note => {
				let icon = L.divIcon (
					{
						iconSize : [ note.iconWidth, note.iconHeight ],
						iconAnchor : [ note.iconWidth / TWO, note.iconHeight / TWO ],
						popupAnchor : [ ZERO, -note.iconHeight / TWO ],
						html : note.iconContent,
						className : 'TravelNotes-AllNotes ' + theConfig.note.style
					}
				);

				const NOTE_Z_INDEX_OFFSET = 100;
				let marker = L.marker (
					note.iconLatLng,
					{
						zIndexOffset : NOTE_Z_INDEX_OFFSET,
						icon : icon,
						draggable : true
					}
				);
				notesMarkers.push ( marker );
			}
		);
		return notesMarkers;
	}

	/*
	--- myPrintView function ------------------------------------------------------------------------------------------

	This function creates a print view

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myPrintView ( view ) {
		myViewCounter ++;
		let viewId = 'TravelNotes-RouteViewDiv' + myViewCounter;
		let viewDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-routeViewDiv',
				id : viewId
			},
			myBody
		);

		// setting the size given by theuser in mm
		viewDiv.setAttribute (
			'style',
			'width:' +
				myPrintData.paperWidth +
				'mm;height:' +
				myPrintData.paperHeight +
				'mm;'
		);

		// creating markers for notes
		let layers = myPrintData.printNotes ? myGetNotesMarkers ( ) : [];

		// adding the leaflet map layer
		layers.push ( myGetLayer ( ) );

		// adding entry point and exit point markers
		layers.push (
			L.circleMarker (
				[ view.entryPoint.lat, view.entryPoint.lng ],
				theConfig.printRouteMap.entryPointMarker
			)
		);
		layers.push (
			L.circleMarker (
				[ view.exitPoint.lat, view.exitPoint.lng ],
				theConfig.printRouteMap.exitPointMarker
			)
		);

		// adding the route
		layers.push ( myRoutePolyline );

		// creating the map
		L.map (
			viewId,
			{
				attributionControl : true,
				zoomControl : false,
				center : [
					( view.bottomLeft.lat + view.upperRight.lat ) / TWO,
					( view.bottomLeft.lng + view.upperRight.lng ) / TWO
				],
				zoom : myPrintData.zoomFactor,
				minZoom : myPrintData.zoomFactor,
				maxZoom : myPrintData.zoomFactor,
				layers : layers
			}
		);
	}

	/*
	--- myCreateToolbar function ---------------------------------------------------------------------------------------

	This function creates the toolbar with the print and cancel button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateToolbar ( ) {
		let printToolbar = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-PrintToolbar'
			},
			myBody
		);

		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-PrintToolbar-PrintButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'PrintFactory - Print' ),
				innerHTML : '&#x1F5A8;&#xFE0F;'
			},
			printToolbar
		)
			.addEventListener (	'click', ( ) => window.print ( ), false );
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-PrintToolbar-CancelButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'PrintFactory - Cancel print' ),
				innerHTML : '&#x274c;'
			},
			printToolbar
		)
			.addEventListener (	'click', onAfterPrint, false );
	}

	/*
	--- myPrintViews function -----------------------------------------------------------------------------------------

	This function add the print views to the html page

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myPrintViews ( ) {

		// adding classes to the body
		myBody.classList.add ( 'TravelNotes-PrintViews' );

		if ( myPrintData.pageBreak ) {
			myBody.classList.add ( 'TravelNotes-PrintPageBreak' );
		}

		window.addEventListener ( 'afterprint', onAfterPrint, true );

		// creating the polyline for the route
		// why we can create the polyline only once and we have to create markers and layers for each view?
		let latLng = [];
		let pointsIterator = myRoute.itinerary.itineraryPoints.iterator;
		while ( ! pointsIterator.done ) {
			latLng.push ( pointsIterator.value.latLng );
		}
		myRoutePolyline = L.polyline (
			latLng,
			{
				color : myRoute.color,
				weight : myRoute.width
			}
		);

		// adding views
		myViewCounter = ZERO;
		myViews.forEach ( myPrintView );
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

		/*
		// Remain for debugging
		myViews.forEach (
			view => L.rectangle ( [ view.bottomLeft, view.upperRight ] ).addTo ( theTravelNotesData.map )
		);
		console.log ( 'views :' + myViews.length );
		*/

		if ( theConfig.printRouteMap.maxTiles < myViews.length * myTilesPage ) {
			theErrorsUI.showError ( theTranslator.getText ( 'PrintFactory - The maximum of allowed pages is reached.' ) );
			return;
		}

		myCreateToolbar ( );

		myPrintViews ( );
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