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
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newDataPanesUI };

import { g_Translator } from '../UI/Translator.js';

import { newHTMLElementsFactory } from '../UI/HTMLElementsFactory.js';
import { newTravelNotesPaneUI } from '../UI/TravelNotesPaneUI.js';
import { newSearchPaneUI } from '../UI/SearchPaneUI.js';
import { newItineraryPaneUI } from '../UI/ItineraryPaneUI.js';

var s_ActivePaneIndex = -1;

/*
--- onWheel function --------------------------------------------------------------------------------------------------

wheel event listener for the data div

-----------------------------------------------------------------------------------------------------------------------
*/

var onWheel = function ( wheelEvent ) { 
	if ( wheelEvent.deltaY ) {
		wheelEvent.target.scrollTop = wheelEvent.target.scrollTop + wheelEvent.deltaY * 10 ;
	}
	wheelEvent.stopPropagation ( );
};

/*
--- onClickItineraryPaneButton function -------------------------------------------------------------------------------

click event listener for the itinerary pane button

-----------------------------------------------------------------------------------------------------------------------
*/


var onClickItineraryPaneButton = function ( ) {
	newDataPanesUI ( ).setItinerary ( );
};


/*
--- onClickTravelNotesPaneButton function -----------------------------------------------------------------------------

click event listener for the travel notes pane button

-----------------------------------------------------------------------------------------------------------------------
*/

var onClickTravelNotesPaneButton = function ( ) {
	newDataPanesUI ( ).setTravelNotes ( );
};

/*
--- onClickSearchPaneButton function ----------------------------------------------------------------------------------

click event listener for the search pane button

-----------------------------------------------------------------------------------------------------------------------
*/

var onClickSearchPaneButton = function ( ) {
	newDataPanesUI ( ).setSearch ( );
};


/*
--- dataPanesUI function ----------------------------------------------------------------------------------------------

This function returns the dataPanesUI object

-----------------------------------------------------------------------------------------------------------------------
*/

var newDataPanesUI = function ( ) {

	var m_TravelNotesPaneUI = newTravelNotesPaneUI ( );
	var m_SearchPaneUI = newSearchPaneUI ( );
	var m_ItineraryPaneUI = newItineraryPaneUI ( );

	/*
	--- m_CreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreateUI = function ( controlDiv ) {
		
		if ( document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' ) ) {
			return;
		}

		var htmlElementsFactory = newHTMLElementsFactory ( ) ;

		var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ItineraryHeaderDiv', className : 'TravelNotes-Control-HeaderDiv'}, controlDiv );
		
		htmlElementsFactory.create ( 
			'div', 
			{ 
				innerHTML : g_Translator.getText ( 'DataPanesUI - Itinerary' ), 
				id : 'TravelNotes-Control-ItineraryPaneButton', 
				className : 'TravelNotes-Control-PaneButton'
			},
			headerDiv 
		).addEventListener ( 'click', onClickItineraryPaneButton, false );
		
		htmlElementsFactory.create ( 
			'div', 
			{ 
				innerHTML : g_Translator.getText ( 'DataPanesUI - Travel notes' ), 
				id : 'TravelNotes-Control-TravelNotesPaneButton', 
				className : 'TravelNotes-Control-PaneButton'
			},
			headerDiv 
		).addEventListener ( 'click', onClickTravelNotesPaneButton, false );
		
		if ( window.osmSearch ) {
			htmlElementsFactory.create ( 
				'div', 
				{ 
					innerHTML : g_Translator.getText ( 'DataPanesUI - Search' ), 
					id : 'TravelNotes-Control-SearchPaneButton', 
					className : 'TravelNotes-Control-PaneButton'
				},
				headerDiv 
			).addEventListener ( 'click', onClickSearchPaneButton, false );
		}
		
		htmlElementsFactory.create ( 
			'div', 
			{
				id : 'TravelNotes-Control-ItineraryDataDiv', 
				className : 'TravelNotes-Control-DataDiv'
			},
		controlDiv ).addEventListener ( 'wheel', onWheel, false );
	};

	/*
	--- m_RemoveActivePane function -----------------------------------------------------------------------------------

	This function remove the active pane contents

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_RemoveActivePane = function ( ) {
		switch ( s_ActivePaneIndex ) {
			case 0:
				m_ItineraryPaneUI.remove ( );
				break;
			case 1:
				m_TravelNotesPaneUI.remove ( );
				break;
			case 2 :
				if ( window.osmSearch ) {
					m_SearchPaneUI.remove ( );
				}
				break;
			default:
				break;
		}
	};

	/*
	--- m_SetItinerary function ---------------------------------------------------------------------------------------

	This function set the itinerary pane contents

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_SetItinerary = function ( ) { 
		m_RemoveActivePane ( );
		m_ItineraryPaneUI.add ( );

		s_ActivePaneIndex = 0;
	};

	/*
	--- m_UpdateItinerary function ------------------------------------------------------------------------------------

	This function set the itinerary pane contents only when this pane is active

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_UpdateItinerary = function ( ) {
		if ( 0 === s_ActivePaneIndex ) {
			m_ItineraryPaneUI.remove ( );
			m_ItineraryPaneUI.add ( );
		}
	};
	
	/*
	--- m_SetItinerary function ---------------------------------------------------------------------------------------

	This function set the travel notes pane contents

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_SetTravelNotes = function ( ) { 
		m_RemoveActivePane ( );
		m_TravelNotesPaneUI.add ( );
		s_ActivePaneIndex = 1;
	};
	
	/*
	--- m_UpdateTravelNotes function ----------------------------------------------------------------------------------

	This function set the travel notes pane contents only when this pane is active

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_UpdateTravelNotes = function ( ) {
		if ( 1 === s_ActivePaneIndex ) {
			m_TravelNotesPaneUI.remove ( );
			m_TravelNotesPaneUI.add ( );
		}
	};
	
	/*
	--- m_SetSearch function ------------------------------------------------------------------------------------------

	This function set the search pane contents

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_SetSearch = function ( ) { 
		m_RemoveActivePane ( );
		m_SearchPaneUI.add ( );

		s_ActivePaneIndex = 2;

	};
	
	/*
	--- m_UpdateSearch function ---------------------------------------------------------------------------------------

	This function set the travel notes pane contents only when this pane is active

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_UpdateSearch = function ( ) {
		if ( 2 === s_ActivePaneIndex ) {
			m_SearchPaneUI.remove ( );
			m_SearchPaneUI.add ( );
		}
	};
	
	/* 
	--- dataPanesUI object --------------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------
	*/
	
	return Object.seal (
		{
			
			createUI : function ( controlDiv ) { m_CreateUI ( controlDiv ); },
			
			setItinerary : function ( ) { m_SetItinerary ( ); },
			updateItinerary : function ( ) { m_UpdateItinerary ( ); },

			setTravelNotes : function ( ) { m_SetTravelNotes ( ); },
			updateTravelNotes : function ( ) { m_UpdateTravelNotes ( ); },
			
			setSearch : function ( ) { m_SetSearch ( ); },
			updateSearch : function ( ) { m_UpdateSearch ( ); }
			
		}
	);
};
	
/*
--- End of dataPanesUI.js file ----------------------------------------------------------------------------------------
*/	