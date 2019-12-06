/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- FileLoader.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the newFileLoader function
Changes:
	- v1.4.0:
		- created from TravelEditor
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
		- Issue #61 : Disable right context menu when readonly travel.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newFileLoader };

import { polyline } from '../polyline/Polyline.js';

import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { newTravel } from '../data/Travel.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newRoadbookUpdate } from '../roadbook/RoadbookUpdate.js';

/*
--- fileLoader function -----------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newFileLoader ( ) {

	let myMergeContent = false;
	let myFileName = '';
	let myIsFileReadOnly = false;
	let myFileContent = {};
	let myEventDispatcher = newEventDispatcher ( );

	/*
	--- myDecompressRoute function ------------------------------------------------------------------------------------

	This function decompress a route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDecompressRoute ( route ) {
		route.itinerary.itineraryPoints.latLngs = polyline.decode ( route.itinerary.itineraryPoints.latLngs, 6 );
		let decompressedItineraryPoints = [];
		let latLngsCounter = 0;
		route.itinerary.itineraryPoints.latLngs.forEach (
			latLng => {
				let itineraryPoint = {};
				itineraryPoint.lat = latLng [ 0 ];
				itineraryPoint.lng = latLng [ 1 ];
				itineraryPoint.distance = route.itinerary.itineraryPoints.distances [ latLngsCounter ];
				itineraryPoint.objId = route.itinerary.itineraryPoints.objIds [ latLngsCounter ];
				itineraryPoint.objType = route.itinerary.itineraryPoints.objType;
				decompressedItineraryPoints.push ( itineraryPoint );
				latLngsCounter ++;
			}
		);
		route.itinerary.itineraryPoints = decompressedItineraryPoints;
	}

	/*
	--- myDecompressFileContent function ------------------------------------------------------------------------------

	This function decompress the file data

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDecompressFileContent ( ) {

		myFileContent.routes.forEach ( myDecompressRoute );
		if ( myFileContent.editedRoute ) {

			// don't remove the if statment... files created with version < 1.5.0 don't have editedRoute...
			myDecompressRoute ( myFileContent.editedRoute );
		}
		if ( myMergeContent ) {
			myMerge ( );
		}
		else {
			myOpen ( );
		}
	}

	/*
	--- myMerge function ----------------------------------------------------------------------------------------------

	This function merge the file data with the theTravelNotesData.travel

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myMerge ( ) {

		// ... and transform the data in the correct format
		let travel = newTravel ( );
		travel.object = myFileContent;

		// routes are added with their notes
		let routesIterator = travel.routes.iterator;
		while ( ! routesIterator.done ) {
			theTravelNotesData.travel.routes.add ( routesIterator.value );
		}

		// travel notes are added
		let notesIterator = travel.notes.iterator;
		while ( ! notesIterator.done ) {
			theTravelNotesData.travel.notes.add ( notesIterator.value );
		}

		theRouteEditor.chainRoutes ( );

		myDisplay ( );
	}

	/*
	--- myOpen function -----------------------------------------------------------------------------------------------

	This function load the file data within the theTravelNotesData.travel

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOpen ( ) {
		theTravelNotesData.travel.object = myFileContent;
		theTravelNotesData.editedRouteObjId = -1;

		if ( '' !== myFileName ) {
			theTravelNotesData.travel.name = myFileName.substr ( 0, myFileName.lastIndexOf ( '.' ) );
		}
		theTravelNotesData.travel.readOnly = myIsFileReadOnly;
		theTravelNotesData.travel.routes.forEach (
			route => {
				if ( 0 !== route.edited ) {
					theTravelNotesData.editedRouteObjId = route.objId;
				}
			}
		);
		myDisplay ( );
	}

	/*
	--- myDisplay function --------------------------------------------------------------------------------------------

	This function update the screen

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDisplay ( ) {

		// the map is cleaned
		myEventDispatcher.dispatch ( 'removeallobjects' );

		// routes are added with their notes
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			if ( 0 === routesIterator.value.edited ) {
				myEventDispatcher.dispatch (
					'addroute',
					{
						route : routesIterator.value,
						addNotes : true,
						addWayPoints : false,
						readOnly : myIsFileReadOnly
					}
				);
			}
		}

		// edited route is added with notes and , depending of read only, waypoints
		if ( -1 !== theTravelNotesData.editedRouteObjId ) {
			myEventDispatcher.dispatch (
				'addroute',
				{
					route : theTravelNotesData.travel.editedRoute,
					addNotes : true,
					addWayPoints : ! myIsFileReadOnly,
					readOnly : myIsFileReadOnly
				}
			);
		}

		// travel notes are added
		let notesIterator = theTravelNotesData.travel.notes.iterator;
		while ( ! notesIterator.done ) {
			myEventDispatcher.dispatch (
				'addnote',
				{
					note : notesIterator.value,
					readOnly : myIsFileReadOnly
				}
			);
		}

		// zoom on the travel
		myEventDispatcher.dispatch ( 'zoomtotravel' );

		// Editors and roadbook are filled
		if ( myIsFileReadOnly ) {

			// control is hidden
			document.getElementById ( 'TravelNotes-Control-MainDiv' )
				.classList.add ( 'TravelNotes-Control-MainDiv-Hidden' );
			document.getElementById ( 'TravelNotes-Control-MainDiv' )
				.classList.remove ( 'TravelNotes-Control-MainDiv-Maximize' );
			document.getElementById ( 'TravelNotes-Control-MainDiv' )
				.classList.remove ( 'TravelNotes-Control-MainDiv-Minimize' );
		}
		else {

			// Editors and HTML pages are filled
			myEventDispatcher.dispatch ( 'setrouteslist' );
			if ( -1 !== theTravelNotesData.editedRouteObjId ) {
				let providerName = theTravelNotesData.travel.editedRoute.itinerary.provider;
				if (
					providerName
					&&
					( '' !== providerName )
					&&
					! theTravelNotesData.providers.get ( providerName.toLowerCase ( ) )
				) {
					theErrorsUI.showError (
						theTranslator.getText (
							'FileLoader - Not possible to select as provider',
							{ provider : providerName }
						)
					);
				}
				else {

					// Provider and transit mode are changed in the itinerary editor
					let transitMode = theTravelNotesData.travel.editedRoute.itinerary.transitMode;
					myEventDispatcher.dispatch ( 'setprovider', { provider : providerName } );

					if ( transitMode && '' !== transitMode ) {
						myEventDispatcher.dispatch ( 'settransitmode', { transitMode : transitMode } );
					}
				}
				theRouteEditor.chainRoutes ( );
				myEventDispatcher.dispatch ( 'expandrouteui' );
				myEventDispatcher.dispatch ( 'setwaypointslist' );
				myEventDispatcher.dispatch ( 'setitinerary' );
			}
			newRoadbookUpdate ( );
		}
		theTravelNotesData.map.fire (
			'travelnotesfileloaded',
			{
				readOnly : myIsFileReadOnly,
				name : theTravelNotesData.travel.name
			}
		);
	}

	/*
	--- myOpenFile function -------------------------------------------------------------------------------------------

	This function open a local file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOpenFile ( event ) {
		myFileName = event.target.files [ 0 ].name;

		let fileReader = new FileReader ( );
		fileReader.onload = function ( ) {
			try {
				myFileContent =  JSON.parse ( fileReader.result );
				myDecompressFileContent ( );
			}
			catch ( err ) {
				console.log ( err ? err : 'An error occurs when reading the file' );
			}
		};
		fileReader.readAsText ( event.target.files [ 0 ] );
	}

	/*
	--- myOpenLocalFile function --------------------------------------------------------------------------------------

	This function open a local file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOpenLocalFile ( event ) {
		myMergeContent = false;
		myIsFileReadOnly = false;
		myOpenFile ( event );
	}

	/*
	--- myMergeLocalFile function -------------------------------------------------------------------------------------

	This function open a local file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myMergeLocalFile ( event ) {

		myMergeContent = true;
		myIsFileReadOnly = false;
		myOpenFile ( event );
	}

	/*
	--- myOpenDistantFile function ------------------------------------------------------------------------------------

	This function open a local file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOpenDistantFile ( fileContent ) {
		window.L.travelNotes.rightContextMenu = false;
		myIsFileReadOnly = true;
		myFileContent = fileContent;
		myDecompressFileContent ( );
	}

	/*
	--- FileLoader object ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			openLocalFile : event => myOpenLocalFile ( event ),
			mergeLocalFile : event => myMergeLocalFile ( event ),
			openDistantFile : fileContent => myOpenDistantFile ( fileContent )
		}
	);
}

/*
--- End of FileLoader.js file -----------------------------------------------------------------------------------------
*/