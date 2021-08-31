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
Doc reviewed ...
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
import theErrorsUI from '../errorsUI/ErrorsUI.js';
import theUtilities from '../util/Utilities.js';

import { INVALID_OBJ_ID, ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ClickSaveAsButtonEventListener
@classdesc click event listener for the SaveAs button
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class ClickSaveAsButtonEventListener {

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theTravelEditor.saveAsTravel ( );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ClickCancelButtonEventListener
@classdesc click event listener for the Cancel button
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class ClickCancelButtonEventListener {

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ();
		theTravelEditor.clear ( );
		document.title =
			'Travel & Notes' +
			( '' === theTravelNotesData.travel.name ? '' : ' - ' + theTravelNotesData.travel.name );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ClickSaveButtonEventListener
@classdesc click event listener for the Save button
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class ClickSaveButtonEventListener {

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theTravelEditor.saveTravel ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OpenInputChangeEventListener
@classdesc change event listener for the input associated to the open button
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class OpenInputChangeEventListener {

	handleEvent ( changeEvent ) {
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
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ClickOpenButtonEventListener
@classdesc click event listener for the open button
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class ClickOpenButtonEventListener {

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
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

		theUtilities.openFile ( new OpenInputChangeEventListener ( ), '.trv' );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ImportInputChangeEventListener
@classdesc change event listener for the input associated to the import button
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class ImportInputChangeEventListener {

	handleEvent ( changeEvent ) {
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
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ClickImportButtonEventListener
@classdesc click event listener for the import button
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class ClickImportButtonEventListener {

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( INVALID_OBJ_ID === theTravelNotesData.editedRouteObjId ) {
			theUtilities.openFile ( new ImportInputChangeEventListener ( ), '.trv' );
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
			.addEventListener ( 'click', new ClickSaveAsButtonEventListener ( ), false );
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
			.addEventListener ( 'click', new ClickCancelButtonEventListener ( ), false );
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
			.addEventListener ( 'click', new ClickSaveButtonEventListener ( ), false );
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
			.addEventListener ( 'click', new ClickOpenButtonEventListener ( ), false );
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
			.addEventListener ( 'click', new ClickImportButtonEventListener ( ), false );
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

	constructor ( uiMainDiv ) {
		Object.seal ( this );
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

export default TravelToolbarUI;

/*
--- End of TravelToolbarUI.js file --------------------------------------------------------------------------------------------
*/