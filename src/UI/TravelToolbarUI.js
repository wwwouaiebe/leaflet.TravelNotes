/*
Copyright - 2017 2021 - wwwouaiebe - Contact: http//www.ouaie.be/

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
Doc reviewed 20210725
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TravelToolbarUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module TravelToolbarUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UI/Translator.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theTravelEditor from '../core/TravelEditor.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import FileLoader from '../core/FileLoader.js';
import theConfig from '../data/Config.js';
import theErrorsUI from '../UI/ErrorsUI.js';
import theUtilities from '../util/Utilities.js';

import { INVALID_OBJ_ID, ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class SaveAsTravelButtonEventListeners
@classdesc This class contains the event listeners for the SaveAsTravel button
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class SaveAsTravelButtonEventListeners {

	/**
	click event listener for the SaveAsTravel button
	@private
	*/

	static onClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theTravelEditor.saveAsTravel ( );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class CancelTravelButtonEventListeners
@classdesc This class contains the event listeners for the CancelTravel button
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class CancelTravelButtonEventListeners {

	/**
	click event listener for the CancelTravel button
	@private
	*/

	static onClick ( clickEvent ) {
		clickEvent.stopPropagation ();
		theTravelEditor.clear ( );
		document.title =
			'Travel & Notes' +
			( '' === theTravelNotesData.travel.name ? '' : ' - ' + theTravelNotesData.travel.name );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class SaveTravelButtonEventListeners
@classdesc This class contains the event listeners for the CancelTravel button
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class SaveTravelButtonEventListeners {

	/**
	click event listener for the SaveTravel button
	@private
	*/

	static onClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theTravelEditor.saveTravel ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OpenTravelButtonEventListeners
@classdesc This class contains the event listeners for the OpenTravel button
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class OpenTravelButtonEventListeners {

	/**
	change event listener for the OpenTravel input
	@private
	*/

	static #onInputChange ( changeEvent ) {
		changeEvent.stopPropagation ( );

		let fileReader = new FileReader ( );
		fileReader.onload = ( ) => {
			let fileContent = {};
			try {
				fileContent = JSON.parse ( fileReader.result );
				new FileLoader ( ).openLocalFile ( fileContent );
			}
			catch ( err ) {
				if ( err instanceof Error ) {
					console.error ( err );
				}
			}
		};
		fileReader.readAsText ( changeEvent.target.files [ ZERO ] );
	}

	/**
	Click event listener for the OpenTravel button
	*/

	static onClick ( ) {
		if (
			theConfig.travelNotes.haveBeforeUnloadWarning
			&&
			(
				! window.confirm (
					theTranslator.getText ( 'TravelEditor - This page ask to close; data are perhaps not saved.' )
				)
			)
		) {
			return;
		}

		theUtilities.openFile ( OpenTravelButtonEventListeners.#onInputChange, '.trv' );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ImportTravelButtonEventListeners
@classdesc This class contains the event listeners for the ImportTravel button
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class ImportTravelButtonEventListeners {

	/**
	change event listener for the ImportTravel input
	@private
	*/

	static #onInputChange ( changeEvent ) {
		changeEvent.stopPropagation ( );

		let fileReader = new FileReader ( );
		fileReader.onload = ( ) => {
			let fileContent = {};
			try {
				fileContent = JSON.parse ( fileReader.result );
				new FileLoader ( ).mergeLocalFile ( fileContent );
			}
			catch ( err ) {
				if ( err instanceof Error ) {
					console.error ( err );
				}
			}
		};

		fileReader.readAsText ( changeEvent.target.files [ ZERO ] );
	}

	/**
	Click event listener for the ImportTravel button
	*/

	static onClick ( ) {
		if ( INVALID_OBJ_ID === theTravelNotesData.editedRouteObjId ) {
			theUtilities.openFile ( ImportTravelButtonEventListeners.#onInputChange, '.trv' );
		}
		else {
			theErrorsUI.showError (
				theTranslator.getText ( 'TravelUI - Not possible to merge a travel when a route is edited' )
			);
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TravelToolbarUI
@classdesc This class is the TravelToolbar part of the UI
@see {@link theTravelToolbarUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelToolbarUI {

	#buttonsDiv = null;

	/**
	This method creates the save travel button
	@private
	*/

	#createSaveAsTravelButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button TravelNotes-TravelUI-SaveAsButton',
				title : theTranslator.getText ( 'TravelUI - Save as travel' ),
				textContent : '💾'
			},
			this.#buttonsDiv
		)
			.addEventListener ( 'click', SaveAsTravelButtonEventListeners.onClick, false );
	}

	/**
	This method creates the cancel travel button
	@private
	*/

	#createCancelTravelButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'TravelUI - Cancel travel' ),
				textContent : '❌'
			},
			this.#buttonsDiv
		)
			.addEventListener ( 'click', CancelTravelButtonEventListeners.onClick, false );
	}

	/**
	This method creates the save travel button
	@private
	*/

	#createSaveTravelButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'TravelUI - Save travel' ),
				textContent : '💾'
			},
			this.#buttonsDiv
		)
			.addEventListener ( 'click', SaveTravelButtonEventListeners.onClick, false );
	}

	/**
	This method creates the open travel button
	@private
	*/

	#createOpenTravelButton ( ) {

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'TravelUI - Open travel' ),
				textContent : '📂'
			},
			this.#buttonsDiv
		)
			.addEventListener ( 'click', OpenTravelButtonEventListeners.onClick, false );
	}

	/**
	This method creates the import travel button
	@private
	*/

	#createImportTravelButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'TravelUI - Import travel' ),
				textContent : '🌏'
			},
			this.#buttonsDiv
		)
			.addEventListener ( 'click', ImportTravelButtonEventListeners.onClick, false );
	}

	/**
	This method creates the roadbook button
	@private
	*/

	#createRoadbookButton ( ) {

		theHTMLElementsFactory.create (
			'text',
			{
				value : '📋'
			},
			theHTMLElementsFactory.create (
				'a',
				{
					className : 'TravelNotes-UI-LinkButton',
					href : 'TravelNotesRoadbook.html?lng=' +
						theConfig.travelNotes.language + '&page=' +
						theTravelNotesData.UUID,
					target : '_blank'
				},
				theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-UI-Button',
						title : theTranslator.getText ( 'TravelUI - Open travel roadbook' )
					},
					this.#buttonsDiv
				)
			)
		);
	}

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the user interface
	@param {HTMLElement} uiMainDiv The HTML element in witch the different elements of the UI have to be created
	*/

	createUI ( uiMainDiv ) {

		if ( this.#buttonsDiv ) {
			return;
		}

		this.#buttonsDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-FlexRowDiv'
			},
			uiMainDiv
		);

		this.#createSaveAsTravelButton ( );
		this.#createCancelTravelButton ( );
		this.#createSaveTravelButton ( );
		this.#createOpenTravelButton ( );
		this.#createImportTravelButton ( );
		this.#createRoadbookButton ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of TravelToolbarUI class
@type {TravelToolbarUI}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theTravelToolbarUI = new TravelToolbarUI ( );

export default theTravelToolbarUI;

/*
--- End of TravelToolbarUI.js file --------------------------------------------------------------------------------------------
*/