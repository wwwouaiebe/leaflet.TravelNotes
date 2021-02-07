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
	- v1.10.0
		- Issue #106 : Profiles are not hidden when printing the route maps
	- v1.12.0:
		- Issue #120 : Review the UserInterface
	- v2.0.0:
		- Issue #134 : Remove node.setAttribute ( 'style', blablabla) in the code
		- Issue #135 : Remove innerHTML from code
		- Issue #136 : Remove html entities from js string
		- Issue #146 : Add the travel name in the document title...
Doc reviewed 20200508
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file PrintFactory.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module PrintFactory
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theDataSearchEngine } from '../data/DataSearchEngine.js';
import { theGeometry } from '../util/Geometry.js';
import { theConfig } from '../data/Config.js';
import { theTranslator } from '../UI/Translator.js';
import { theLayersToolbarUI } from '../UI/LayersToolbarUI.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';
import { ZERO, TWO, LAT, LNG } from '../util/Constants.js';

const OUR_TILE_SIZE = 256;
const OUR_LAT_LNG_TOLERANCE = 0.000001;
const OUR_NOTE_Z_INDEX_OFFSET = 100;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewPrintFactory
@desc constructor for PrintFactory objects
@return {PrintFactory} an instance of PrintFactory object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewPrintFactory ( ) {

	let myPrintData = null;
	let myRoute = null;
	let myPrintSize = null;
	let myViews = [];
	let myViewCounter = 0;
	let myRoutePolyline = null;
	let myBody = document.querySelector ( 'body' );
	let myTilesPage = 0;

	/*
	--- myOnAfterPrint function -----------------------------------------------------------------------------------------

	This function restore the map after printing

	-------------------------------------------------------------------------------------------------------------------
	*/

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnAfterPrint
	@desc remove the print views and restore the map and user interface after printing
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnAfterPrint ( ) {
		while ( ZERO < document.getElementsByClassName ( 'TravelNotes-routeViewDiv' ).length ) {
			myBody.removeChild ( document.getElementsByClassName ( 'TravelNotes-routeViewDiv' ) [ ZERO ] );
		}
		document.getElementById ( 'TravelNotes-PrintToolbar-PrintButton' )
			.removeEventListener (	'click', ( ) => window.print ( ), false );
		document.getElementById ( 'TravelNotes-PrintToolbar-CancelButton' )
			.removeEventListener (	'click', myOnAfterPrint, false );
		myBody.removeChild ( document.getElementById ( 'TravelNotes-PrintToolbar' ) );

		let childrens = myBody.children;
		for ( let counter = 0; counter < childrens.length; counter ++ ) {
			childrens.item ( counter ).classList.remove ( 'TravelNotes-PrintViews-Hidden' );
		}
		theTravelNotesData.map.invalidateSize ( false );
		window.removeEventListener ( 'afterprint', myOnAfterPrint, true );
		document.title =
			'Travel & Notes' +
			( '' === theTravelNotesData.travel.name ? '' : ' - ' + theTravelNotesData.travel.name );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myComputePrintSize
	@desc compute the print size in lat and lng transforming the dimension given in mm by the user.
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myComputePrintSize ( ) {

		let body = document.querySelector ( 'body' );
		let dummyDiv = theHTMLElementsFactory.create ( 'div', { }, body );
		dummyDiv.style.position = 'absolute';
		dummyDiv.style.top = '0';
		dummyDiv.style.left = '0';
		dummyDiv.style.width = String ( myPrintData.paperWidth - ( TWO * myPrintData.borderWidth ) ) + 'mm';
		dummyDiv.style.height = String ( myPrintData.paperHeight - ( TWO * myPrintData.borderWidth ) ) + 'mm';
		myTilesPage = Math.ceil ( dummyDiv.clientWidth / OUR_TILE_SIZE ) * Math.ceil ( dummyDiv.clientHeight / OUR_TILE_SIZE );
		let topLeftScreen = theGeometry.screenCoordToLatLng ( ZERO, ZERO );
		let bottomRightScreen = theGeometry.screenCoordToLatLng (
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myIsFirstPointOnView
	@desc test if firstItineraryPoint is on the frame of currentView
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myIsFirstPointOnView ( currentView, firstItineraryPoint ) {
		if (
			firstItineraryPoint.lat - currentView.bottomLeft.lat < OUR_LAT_LNG_TOLERANCE
			||
			currentView.upperRight.lat - firstItineraryPoint.lat < OUR_LAT_LNG_TOLERANCE
			||
			firstItineraryPoint.lng - currentView.bottomLeft.lng < OUR_LAT_LNG_TOLERANCE
			||
			currentView.upperRight.lng - firstItineraryPoint.lng < OUR_LAT_LNG_TOLERANCE
		) {

			// itinerary point is really near the frame. we consider the itinerary point as intermediate point
			return { lat : firstItineraryPoint.lat, lng : firstItineraryPoint.lng };
		}
		return null;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myIsItineraryHorOrVer
	@desc compute if the line defined by firstItineraryPoint  lastItineraryPoint
	is horizontal or vertical. If yes, the intersection of the line and currentView is returned
	@private

	@--------------------------------------------------------------------------------------------------------------------------
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myHaveViewOnlyOnePoint
	@desc test if currentView is only a point. If yes an intermediatePoint is computed
	to extend the view to the maximun possible
	@private

	@--------------------------------------------------------------------------------------------------------------------------
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myComputeIntermediatePoint
	@desc See comments in the code
	@private

	@--------------------------------------------------------------------------------------------------------------------------
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myComputeViews
	@desc compute the different views needed to print the maps
	@private

	@--------------------------------------------------------------------------------------------------------------------------
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetLayer
	@desc creates a leaflet layer with the same map that the main map
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetLayer ( ) {
		let layer = theLayersToolbarUI.getLayer ( theTravelNotesData.travel.layerName );
		let url = theAPIKeysManager.getUrl ( layer );
		let leafletLayer = null;
		if ( 'wmts' === layer.service.toLowerCase ( ) ) {
			leafletLayer = window.L.tileLayer ( url );
		}
		else {
			leafletLayer = window.L.tileLayer.wms ( url, layer.wmsOptions );
		}

		leafletLayer.options.attribution =
			' © <a href="https://www.openstreetmap.org/copyright" target="_blank" ' +
			'title="OpenStreetMap contributors">OpenStreetMap contributors</a> ' +
			layer.attribution +
			'| © <a href="https://github.com/wwwouaiebe" target="_blank" ' +
			'title="https://github.com/wwwouaiebe">Travel & Notes</a> ';

		return leafletLayer;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetNotesMarkers
	@desc creates markers for notes
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetNotesMarkers ( ) {
		let notesMarkers = [];
		myRoute.notes.forEach (
			note => {
				let icon = window.L.divIcon (
					{
						iconSize : [ note.iconWidth, note.iconHeight ],
						iconAnchor : [ note.iconWidth / TWO, note.iconHeight / TWO ],
						popupAnchor : [ ZERO, -note.iconHeight / TWO ],
						html : note.iconContent,
						className : 'TravelNotes-Map-AllNotes '
					}
				);

				let marker = window.L.marker (
					note.iconLatLng,
					{
						zIndexOffset : OUR_NOTE_Z_INDEX_OFFSET,
						icon : icon,
						draggable : true
					}
				);
				notesMarkers.push ( marker );
			}
		);
		return notesMarkers;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myPrintView
	@desc creates a print view
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myPrintView ( view ) {
		myViewCounter ++;
		let viewId = 'TravelNotes-RouteViewDiv' + myViewCounter;
		let viewDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-routeViewDiv',
				id : viewId
			},
			myBody
		);

		if ( myPrintData.pageBreak ) {
			viewDiv.classList.add ( 'TravelNotes-PrintPageBreak' );
		}

		// setting the size given by the user in mm
		viewDiv.style.width = String ( myPrintData.paperWidth ) + 'mm';
		viewDiv.style.height = String ( myPrintData.paperHeight ) + 'mm';

		// creating markers for notes
		let layers = myPrintData.printNotes ? myGetNotesMarkers ( ) : [];

		// adding the leaflet map layer
		layers.push ( myGetLayer ( ) );

		// adding entry point and exit point markers
		layers.push (
			window.L.circleMarker (
				[ view.entryPoint.lat, view.entryPoint.lng ],
				theConfig.printRouteMap.entryPointMarker
			)
		);
		layers.push (
			window.L.circleMarker (
				[ view.exitPoint.lat, view.exitPoint.lng ],
				theConfig.printRouteMap.exitPointMarker
			)
		);

		// adding the route
		layers.push ( myRoutePolyline );

		// creating the map
		window.L.map (
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateToolbar
	@desc creates the toolbar with the print and cancel button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateToolbar ( ) {
		let printToolbar = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-PrintToolbar'
			},
			myBody
		);
		theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-PrintToolbar-PrintButton',
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'PrintFactory - Print' ),
				textContent : '🖨️'
			},
			printToolbar
		)
			.addEventListener (	'click', ( ) => window.print ( ), false );
		theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-PrintToolbar-CancelButton',
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'PrintFactory - Cancel print' ),
				textContent : '❌'
			},
			printToolbar
		)
			.addEventListener (	'click', myOnAfterPrint, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myPrintViews
	@desc add the print views to the html page
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myPrintViews ( ) {

		// adding classes to the body

		let childrens = myBody.children;
		for ( let counter = 0; counter < childrens.length; counter ++ ) {
			childrens.item ( counter ).classList.add ( 'TravelNotes-PrintViews-Hidden' );
		}
		document.title =
			'' === theTravelNotesData.travel.name
				?
				'maps'
				:
				theTravelNotesData.travel.name + ' - ' + myRoute.computedName + ' - maps';
		myCreateToolbar ( );

		window.addEventListener ( 'afterprint', myOnAfterPrint, true );

		// creating the polyline for the route
		// why we can create the polyline only once and we have to create markers and layers for each view?
		let latLng = [];
		let pointsIterator = myRoute.itinerary.itineraryPoints.iterator;
		while ( ! pointsIterator.done ) {
			latLng.push ( pointsIterator.value.latLng );
		}
		myRoutePolyline = window.L.polyline (
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class PrintFactory
	@classdesc This class manages the print of a route
	@see {@link newPrintFactory} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class PrintFactory {

		constructor ( ) {
			Object.freeze ( this );
		}

		/**
		Hide the map and user interface, prepares the print views and add a toolbar on top of the screen
		@param {PrintRouteMapOptions} printData the print options returned by the PrintRouteMapDialog
		@param {!number} routeObjId The objId of the route to print
		*/

		print ( printData, routeObjId ) {
			myRoute = theDataSearchEngine.getRoute ( routeObjId );
			if ( ! myRoute ) {
				return;
			}
			myPrintData = printData;
			myComputePrintSize ( );
			myComputeViews ( );

			/*
			// Remain for debugging
			myViews.forEach (
				view => window.L.rectangle ( [ view.bottomLeft, view.upperRight ] ).addTo ( theTravelNotesData.map )
			);
			console.log ( 'views :' + myViews.length );
			*/

			if ( theConfig.printRouteMap.maxTiles < myViews.length * myTilesPage ) {
				theErrorsUI.showError ( theTranslator.getText ( 'PrintFactory - The maximum of allowed pages is reached.' ) );
				return;
			}
			myPrintViews ( );
		}
	}

	return new PrintFactory ( );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newPrintFactory
	@desc constructor for PrintFactory objects
	@return {PrintFactory} an instance of FileLoader object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewPrintFactory as newPrintFactory
};

/*
--- End of PrintFactory.js file -----------------------------------------------------------------------------------------------

*/