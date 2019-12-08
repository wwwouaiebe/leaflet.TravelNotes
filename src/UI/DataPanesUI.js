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
--- dataPanesUI.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the newDataPanesUI function
Changes:
	- v1.0.0:
		- created
	- v1.3.0:
		- added train button
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newTravelNotesPaneUI } from '../UI/TravelNotesPaneUI.js';
import { newSearchPaneUI } from '../UI/SearchPaneUI.js';
import { newItineraryPaneUI } from '../UI/ItineraryPaneUI.js';

import  { THE_CONST } from '../util/Constants.js';

/*
--- newDataPanesUI function -------------------------------------------------------------------------------------------

This function returns the dataPanesUI object

-----------------------------------------------------------------------------------------------------------------------
*/

function newDataPanesUI ( ) {

	let myActivePaneIndex = THE_CONST.dataPanesUI.invalidPane;
	let myTravelNotesPaneUI = newTravelNotesPaneUI ( );
	let mySearchPaneUI = newSearchPaneUI ( );
	let myItineraryPaneUI = newItineraryPaneUI ( );

	/*
	--- myRemoveActivePane function -----------------------------------------------------------------------------------

	This function remove the active pane contents

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveActivePane ( ) {
		switch ( myActivePaneIndex ) {
		case THE_CONST.dataPanesUI.itineraryPane :
			myItineraryPaneUI.remove ( );
			break;
		case THE_CONST.dataPanesUI.travelNotesPane :
			myTravelNotesPaneUI.remove ( );
			break;
		case THE_CONST.dataPanesUI.searchPane :
			if ( window.osmSearch ) {
				mySearchPaneUI.remove ( );
			}
			break;
		default :
			break;
		}
	}

	/*
	--- mySetItinerary function ---------------------------------------------------------------------------------------

	This function set the itinerary pane contents

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetItinerary ( ) {
		myRemoveActivePane ( );
		myItineraryPaneUI.add ( );

		myActivePaneIndex = THE_CONST.dataPanesUI.itineraryPane;
	}

	/*
	--- myUpdateItinerary function ------------------------------------------------------------------------------------

	This function set the itinerary pane contents only when this pane is active

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdateItinerary ( ) {
		if ( THE_CONST.dataPanesUI.itineraryPane === myActivePaneIndex ) {
			myItineraryPaneUI.remove ( );
			myItineraryPaneUI.add ( );
		}
	}

	/*
	--- mySetItinerary function ---------------------------------------------------------------------------------------

	This function set the travel notes pane contents

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetTravelNotes ( ) {
		myRemoveActivePane ( );
		myTravelNotesPaneUI.add ( );
		myActivePaneIndex = THE_CONST.dataPanesUI.travelNotesPane;
	}

	/*
	--- myUpdateTravelNotes function ----------------------------------------------------------------------------------

	This function set the travel notes pane contents only when this pane is active

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdateTravelNotes ( ) {
		if ( THE_CONST.dataPanesUI.travelNotesPane === myActivePaneIndex ) {
			myTravelNotesPaneUI.remove ( );
			myTravelNotesPaneUI.add ( );
		}
	}

	/*
	--- mySetSearch function ------------------------------------------------------------------------------------------

	This function set the search pane contents

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetSearch ( ) {
		myRemoveActivePane ( );
		mySearchPaneUI.add ( );

		myActivePaneIndex = THE_CONST.dataPanesUI.searchPane;

	}

	/*
	--- myUpdateSearch function ---------------------------------------------------------------------------------------

	This function set the travel notes pane contents only when this pane is active

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdateSearch ( ) {
		if ( THE_CONST.dataPanesUI.searchPane === myActivePaneIndex ) {
			mySearchPaneUI.remove ( );
			mySearchPaneUI.add ( );
		}
	}

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( controlDiv ) {

		if ( document.getElementById ( 'TravelNotes-Control-DataPanesDiv' ) ) {
			return;
		}

		let htmlElementsFactory = newHTMLElementsFactory ( );

		let headerDiv = htmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-ItineraryHeaderDiv',
				className : 'TravelNotes-Control-HeaderDiv'
			},
			controlDiv
		);

		htmlElementsFactory.create (
			'div',
			{
				innerHTML : theTranslator.getText ( 'DataPanesUI - Itinerary' ),
				id : 'TravelNotes-Control-ItineraryPaneButton',
				className : 'TravelNotes-Control-PaneButton'
			},
			headerDiv
		).addEventListener ( 'click', ( ) => mySetItinerary ( ), false );

		htmlElementsFactory.create (
			'div',
			{
				innerHTML : theTranslator.getText ( 'DataPanesUI - Travel notes' ),
				id : 'TravelNotes-Control-TravelNotesPaneButton',
				className : 'TravelNotes-Control-PaneButton'
			},
			headerDiv
		).addEventListener ( 'click', ( ) => mySetTravelNotes ( ), false );

		if ( window.osmSearch ) {
			htmlElementsFactory.create (
				'div',
				{
					innerHTML : theTranslator.getText ( 'DataPanesUI - Search' ),
					id : 'TravelNotes-Control-SearchPaneButton',
					className : 'TravelNotes-Control-PaneButton'
				},
				headerDiv
			).addEventListener ( 'click', ( ) => mySetSearch ( ), false );
		}

		let dataDiv = htmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-DataPanesDiv',
				className : 'TravelNotes-Control-DataDiv'
			},
			controlDiv );
		dataDiv.addEventListener (
			'wheel',
			wheelEvent => {
				if ( wheelEvent.deltaY ) {
					wheelEvent.target.scrollTop += wheelEvent.deltaY * THE_CONST.mouse.wheelFactor;
				}
				wheelEvent.stopPropagation ( );
			},
			false
		);
	}

	/*
	--- dataPanesUI object --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createUI : controlDiv => myCreateUI ( controlDiv ),

			setItinerary : ( ) =>  mySetItinerary ( ),
			updateItinerary : ( ) =>  myUpdateItinerary ( ),

			setTravelNotes : ( ) =>  mySetTravelNotes ( ),
			updateTravelNotes : ( ) =>  myUpdateTravelNotes ( ),

			setSearch : ( ) =>  mySetSearch ( ),
			updateSearch : ( ) =>  myUpdateSearch ( )

		}
	);
}

/*
--- theDataPaneUI object -----------------------------------------------------------------------------------------------

The one and only one dataPanesUI

-----------------------------------------------------------------------------------------------------------------------
*/

const theDataPanesUI = newDataPanesUI ( );

export { theDataPanesUI };

/*
--- End of dataPanesUI.js file ----------------------------------------------------------------------------------------
*/