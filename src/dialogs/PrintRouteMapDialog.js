/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.9.0:
		- created
Doc reviewed 20200815
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file PrintRouteMapDialog.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} PrintRouteMapOptions
@desc An object to store the PrintRouteMapDialog options
@property {number} paperWidth The paper width option
@property {number} paperHeight The paper height option
@property {number} borderWidth The border width option
@property {number} zoomFactor The zoom factor option
@property {boolean} pageBreak The page break option
@property {boolean} printNotes The print notes option
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module PrintRouteMapDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewPrintRouteMapDialog
@desc constructor for PrintRouteMapDialog objects
@return {PrintRouteMapDialog} an instance of PrintRouteMapDialog object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewPrintRouteMapDialog ( ) {

	let myHTMLElementsFactory = newHTMLElementsFactory ( );

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class PrintRouteMapDialog
	@classdesc A BaseDialog object completed for edition of print options
	Create an instance of the dialog, then execute the show ( ) method. The print options encoded in
	an object PrintRouteMapOptions are given as parameter of the succes handler of the Promise returned by the show ( ) method.
	@example
	newPrintRouteMapDialog ( )
		.show ( )
		.then ( printRouteMapOptions => doSomethingWithTheprintRouteMapOptions )
		.catch ( error => doSomethingWithTheError );
	@see {@link newPrintRouteMapDialog} for constructor
	@augments BaseDialog
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	let myPrintRouteMapDialog = null;
	let myPrintRouteMapDataDiv = null;

	let myPaperWidthInput = null;
	let myPaperHeightInput = null;
	let myBorderWidthInput = null;
	let myPageBreakInput = null;
	let myPrintNotesInput = null;
	let myZoomFactorInput = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnOkButtonClick
	@desc Event listener for the ok button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {
		return Object.seal (
			{
				paperWidth : parseInt ( myPaperWidthInput.value ),
				paperHeight : parseInt ( myPaperHeightInput.value ),
				borderWidth : parseInt ( myBorderWidthInput.value ),
				zoomFactor : parseInt ( myZoomFactorInput.value ),
				pageBreak : myPageBreakInput.checked,
				printNotes : myPrintNotesInput.checked
			}
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateDialog
	@desc This method creates the dialog
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {
		myPrintRouteMapDialog = newBaseDialog ( );
		myPrintRouteMapDialog.title = theTranslator.getText ( 'PrintRouteMapDialog - Print' );
		myPrintRouteMapDialog.okButtonListener = myOnOkButtonClick;
		myPrintRouteMapDataDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-PrintRouteMapDialog-MainDataDiv'
			},
			myPrintRouteMapDialog.content
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreatePaperWidthDiv
	@desc This method creates the paper width div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreatePaperWidthDiv ( ) {
		let paperWidthDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-PrintRouteMapDialog-DataDiv'
			},
			myPrintRouteMapDataDiv
		);
		myHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'PrintRouteMapDialog - Paper width' )
			},
			paperWidthDiv
		);
		myPaperWidthInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-PrintRouteMapDialog-NumberInput'
			},
			paperWidthDiv
		);
		myPaperWidthInput.value = theConfig.printRouteMap.paperWidth;
		myHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'PrintRouteMapDialog - Paper width units' )
			},
			paperWidthDiv
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreatePaperHeightDiv
	@desc This method creates the paper height div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreatePaperHeightDiv ( ) {
		let paperHeightDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-PrintRouteMapDialog-DataDiv'
			},
			myPrintRouteMapDataDiv
		);
		myHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'PrintRouteMapDialog - Paper height' )
			},
			paperHeightDiv
		);
		myPaperHeightInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-PrintRouteMapDialog-NumberInput',
				value : theConfig.printRouteMap.paperHeight
			},
			paperHeightDiv
		);
		myHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'PrintRouteMapDialog - Paper height units' )
			},
			paperHeightDiv
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateBorderWidthDiv
	@desc This method creates the border width div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateBorderWidthDiv ( ) {
		let borderWidthDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-PrintRouteMapDialog-DataDiv'
			},
			myPrintRouteMapDataDiv
		);
		myHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'PrintRouteMapDialog - Border width' )
			},
			borderWidthDiv
		);
		myBorderWidthInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-PrintRouteMapDialog-NumberInput',
				id : 'TravelNotes-PrintRouteMapDialog-BorderWidthNumberInput',
				value : theConfig.printRouteMap.borderWidth
			},
			borderWidthDiv
		);
		myHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'PrintRouteMapDialog - Border width units' )
			},
			borderWidthDiv
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateZoomFactorDiv
	@desc This method creates the zoom factor div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateZoomFactorDiv ( ) {
		let zoomFactorDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-PrintRouteMapDialog-DataDiv',
				id : 'TravelNotes-PrintRouteMapDialog-ZoomFactorDataDiv'
			},
			myPrintRouteMapDataDiv
		);
		myHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'PrintRouteMapDialog - Zoom factor' )
			},
			zoomFactorDiv
		);
		const MAX_ZOOM = 15;
		myZoomFactorInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-PrintRouteMapDialog-NumberInput',
				value : Math.min ( theConfig.printRouteMap.zoomFactor, MAX_ZOOM ),
				min : theTravelNotesData.map.getMinZoom ( ),
				max : Math.min ( theTravelNotesData.map.getMaxZoom ( ), MAX_ZOOM )
			},
			zoomFactorDiv
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreatePageBreakDiv
	@desc This method creates the page break div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreatePageBreakDiv ( ) {
		let pageBreakDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-PrintRouteMapDialog-DataDiv',
				id : 'TravelNotes-PrintRouteMapDialog-PageBreakDataDiv'
			},
			myPrintRouteMapDataDiv
		);
		myPageBreakInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-PrintRouteMapDialog-PageBreakInput',
				checked : theConfig.printRouteMap.pageBreak
			},
			pageBreakDiv
		);
		myHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'PrintRouteMapDialog - Page break' )
			},
			pageBreakDiv
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreatePrintNotesDiv
	@desc This method creates the print notes div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreatePrintNotesDiv ( ) {
		let printNotesDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-PrintRouteMapDialog-DataDiv',
				id : 'TravelNotes-PrintRouteMapDialog-PrintNotesDataDiv'
			},
			myPrintRouteMapDataDiv
		);
		myPrintNotesInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-PrintRouteMapDialog-PrintNotesInput',
				checked : theConfig.printRouteMap.printNotes
			},
			printNotesDiv
		);
		myHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'PrintRouteMapDialog - Print notes' )
			},
			printNotesDiv
		);

	}

	myCreateDialog ( );
	myCreatePaperWidthDiv ( );
	myCreatePaperHeightDiv ( );
	myCreateBorderWidthDiv ( );
	myCreateZoomFactorDiv ( );
	myCreatePageBreakDiv ( );
	myCreatePrintNotesDiv ( );

	return myPrintRouteMapDialog;
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newPrintRouteMapDialog
	@desc constructor for PrintRouteMapDialog objects
	@return {PrintRouteMapDialog} an instance of PrintRouteMapDialog object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewPrintRouteMapDialog as newPrintRouteMapDialog
};

/*
--- End of PrintRouteMapDialog.js file ----------------------------------------------------------------------------------------
*/