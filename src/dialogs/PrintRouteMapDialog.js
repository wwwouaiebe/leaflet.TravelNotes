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
--- PrintRouteMapDialog.js file ---------------------------------------------------------------------------------------
This file contains:
	- the newPrintRouteMapDialog function
Changes:
	- v1.9.0:
		- created

Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';

import { theConfig } from '../data/Config.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

// import { LAT_LNG, ZERO, INVALID_OBJ_ID } from '../util/Constants.js';

/*
--- newPrintRouteMapDialog function -----------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newPrintRouteMapDialog ( ) {

	let myHTMLElementsFactory = newHTMLElementsFactory ( );

	let myPrintRouteMapDialog = null;

	let myPrintRouteMapDataDiv = null;

	let myPaperWidthInput = null;
	let myPaperHeightInput = null;
	let myBorderWidthInput = null;
	let myPageBreakInput = null;
	let myPrintNotesInput = null;
	let myZoomFactorInput = null;

	/*
	--- myOnOkButtonClick function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {
		return {
			paperWidth : myPaperWidthInput.value,
			paperHeight : myPaperHeightInput.value,
			borderWidth : myBorderWidthInput.value,
			zoomFactor : myZoomFactorInput.value,
			pageBreak : myPageBreakInput.checked,
			printNotes : myPrintNotesInput.checked
		};

	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {

		// the dialog base is created
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

	/*
	--- myAddPaperSize function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddPaperSize ( ) {

		// ... width ...
		let paperWidthDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-PrintRouteMapDialog-DataDiv',
				id : 'TravelNotes-PrintRouteMapDialog-PaperWidthDataDiv'
			},
			myPrintRouteMapDataDiv
		);

		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'PrintRouteMapDialog - Paper width' )
			},
			paperWidthDiv
		);
		myPaperWidthInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-PrintRouteMapDialog-NumberInput',
				id : 'TravelNotes-PrintRouteMapDialog-PaperWidthNumberInput'

			},
			paperWidthDiv
		);
		myPaperWidthInput.value = theConfig.printRouteMap.paperWidth;
		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'PrintRouteMapDialog - Paper width units' )
			},
			paperWidthDiv
		);

		// ... height ...
		let paperHeightDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-PrintRouteMapDialog-DataDiv',
				id : 'TravelNotes-PrintRouteMapDialog-PaperHeightDataDiv'
			},
			myPrintRouteMapDataDiv
		);
		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'PrintRouteMapDialog - Paper height' )
			},
			paperHeightDiv
		);
		myPaperHeightInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-PrintRouteMapDialog-NumberInput',
				id : 'TravelNotes-PrintRouteMapDialog-PaperHeightNumberInput'

			},
			paperHeightDiv
		);
		myPaperHeightInput.value = theConfig.printRouteMap.paperHeight;
		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'PrintRouteMapDialog - Paper height units' )
			},
			paperHeightDiv
		);

		// ... border width ...
		let borderWidthDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-PrintRouteMapDialog-DataDiv',
				id : 'TravelNotes-PrintRouteMapDialog-BorderWidthDataDiv'
			},
			myPrintRouteMapDataDiv
		);
		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'PrintRouteMapDialog - Border width' )
			},
			borderWidthDiv
		);
		myBorderWidthInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-PrintRouteMapDialog-NumberInput',
				id : 'TravelNotes-PrintRouteMapDialog-BorderWidthNumberInput'

			},
			borderWidthDiv
		);
		myBorderWidthInput.value = theConfig.printRouteMap.borderWidth;
		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'PrintRouteMapDialog - Border width units' )
			},
			borderWidthDiv
		);
	}

	/*
	--- myAddOthersControls function ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddOthersControls ( ) {

		// ... zoom factor ...
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
				data : theTranslator.getText ( 'PrintRouteMapDialog - Zoom factor' )
			},
			zoomFactorDiv
		);
		myZoomFactorInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-PrintRouteMapDialog-NumberInput',
				id : 'TravelNotes-PrintRouteMapDialog-ZoomFactorNumberInput'
			},
			zoomFactorDiv
		);
		myZoomFactorInput.value = theConfig.printRouteMap.zoomFactor;
		myZoomFactorInput.min = theTravelNotesData.map.getMinZoom ( );
		myZoomFactorInput.max = theTravelNotesData.map.getMaxZoom ( );

		// page break...
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
				id : 'TravelNotes-PrintRouteMapDialog-PageBreakInput'
			},
			pageBreakDiv
		);
		myPageBreakInput.checked = theConfig.printRouteMap.pageBreak;

		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'PrintRouteMapDialog - Page break' )
			},
			pageBreakDiv
		);

		// print notes
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
				id : 'TravelNotes-PrintRouteMapDialog-PrintNotesInput'
			},
			printNotesDiv
		);
		myPrintNotesInput.checked = theConfig.printRouteMap.printNotes;

		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'PrintRouteMapDialog - Print notes' )
			},
			printNotesDiv
		);

	}

	myCreateDialog ( );
	myAddPaperSize ( );
	myAddOthersControls ( );

	return myPrintRouteMapDialog;
}

export { newPrintRouteMapDialog };

/*
--- End of PrintRouteMapDialog.js file --------------------------------------------------------------------------------
*/