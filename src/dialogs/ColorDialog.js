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
--- ColorDialog.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the newColorDialog function
Changes:
	- v1.0.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newColorDialog };

import { g_Translator } from '../UI/Translator.js';

import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newHTMLElementsFactory } from '../UI/HTMLElementsFactory.js';

var onOkButtonClick = function ( ) {
	return true;
};
	

var newColorDialog = function ( color ) {
	
	/*
	--- colorToNumbers function ---------------------------------------------------------------------------------------

	This function transforms a css color into an object { r : xx, g : xx, b : xx}

	-------------------------------------------------------------------------------------------------------------------
	*/

	var colorToNumbers = function ( color ) {
		return {
			r : parseInt ( color.substr ( 1, 2 ), 16 ),
			g : parseInt ( color.substr ( 3, 2 ), 16 ), 
			b : parseInt ( color.substr ( 5, 2 ), 16 ), 
		};
	};
	
	/*
	--- colorToNumbers function ---------------------------------------------------------------------------------------

	This function transforms 3 numbers into a css color

	-------------------------------------------------------------------------------------------------------------------
	*/
	var numbersToColor = function ( r, g, b ) {
		// MS Edge do't know padStart...
		if ( ! String.prototype.padStart ) {
			String.prototype.padStart = function padStart ( targetLength, padString ) {
				targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
				padString = String ( padString || ' ' );
				if ( this.length > targetLength ) {
					return String ( this );
				}
				else {
					targetLength = targetLength - this.length;
					if ( targetLength > padString.length ) {
						padString += padString.repeat ( targetLength / padString.length ); //append to original to ensure we are longer than needed
					}
					return padString.slice ( 0, targetLength ) + String ( this );
				}
			};
		}			
		
		return '#' + 
			parseInt ( r ).toString(16).padStart ( 2, '0' ) + 
			parseInt ( g ).toString(16).padStart ( 2, '0' ) + 
			parseInt ( b ).toString(16).padStart ( 2, '0' ) ;
	};

	// Click event handler on a color button
	var onColorClick = function ( event ) {
		newColor = event.target.colorValue;
		var numbers = colorToNumbers ( newColor );
		redInput.value = numbers.r;
		greenInput.value = numbers.g;
		blueInput.value = numbers.b;
		document.getElementById ( 'TravelNotes-ColorDialog-ColorSampleDiv').setAttribute ( 'style', 'background-color:'+ event.target.colorValue +';' );
	};
	
	// Click event handler on a red color button
	var onRedColorClick = function ( event ) {
		var r = event.target.redValue;
		var g = 255;
		var b = 255;
		var rowCounter = 0;
		while ( ++ rowCounter < 7 ) {
			var cellCounter = 0;
			g = 255;
			while ( ++ cellCounter < 7 ) {
				var button = document.getElementById ( ( 'TravelNotes-ColorDialog-CellColorDiv' + rowCounter ) + cellCounter );
				button.colorValue = numbersToColor ( r, g, b );
				button.setAttribute ( 'style', 'background-color:' + numbersToColor ( r, g, b ) );
				g -= 51;
			}
			b -= 51;
		}
	};

	// Red, green or blue input event handler 
	var onColorInput = function ( )  {
		newColor = numbersToColor ( redInput.value, greenInput.value, blueInput.value );
		document.getElementById ( 'TravelNotes-ColorDialog-ColorSampleDiv').setAttribute ( 'style', 'background-color:' + newColor + ';' );
	};
	

	var newColor = color;
	var htmlElementsFactory = newHTMLElementsFactory ( ) ;

	// the dialog base is created
	var baseDialog = newBaseDialog ( );
	baseDialog.title = g_Translator.getText ( 'ColorDialog - Colors' );
	baseDialog.okButtonListener = onOkButtonClick;
	baseDialog.getNewColor = function ( ) {
		return newColor;
	};
	
	// elements are added to the base dialog content
	var colorDiv = htmlElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-ColorDialog-ColorDiv',
			id : 'TravelNotes-ColorDialog-ColorDiv'
		},
		baseDialog.content
	);
	var buttonsDiv = htmlElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-ColorDialog-ButtonsDiv',
			id : 'TravelNotes-ColorDialog-ButtonsDiv'
		},
		colorDiv
	);

	var r = 255;
	var g = 255;
	var b = 255;		
	var rowCounter = 0;
	
	// loop on the 7 rows
	while ( ++ rowCounter < 8 ) {			
		var colorButtonsRowDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-RowColorDiv',
				id : 'TravelNotes-ColorDialog-RowColorDiv' +rowCounter
			},
			buttonsDiv
		);
		
		var cellCounter = 0;
		g = 255;
		
		// loop on the 6 cells
		while ( ++ cellCounter < 7 ) {
			var colorButtonCellDiv = htmlElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ColorDialog-CellColorDiv',
					id : ( 'TravelNotes-ColorDialog-CellColorDiv' + rowCounter ) + cellCounter
				},
				colorButtonsRowDiv
			);
			if ( rowCounter < 7 ) {
				colorButtonCellDiv.setAttribute ( 'style', 'background-color:' + numbersToColor ( r, g, b ) );
				colorButtonCellDiv.colorValue = numbersToColor ( r, g, b );
				colorButtonCellDiv.addEventListener ( 'click', onColorClick, false );
				g -= 51;
			}
			else
			{
				r = ( cellCounter - 1 ) * 51;
				var buttonColor = numbersToColor ( 255, r, r );
				colorButtonCellDiv.setAttribute ( 'style', 'background-color:' + buttonColor );
				colorButtonCellDiv.redValue = 255 - r;
				colorButtonCellDiv.addEventListener ( 'click', onRedColorClick, false );
			}
		}
		b -= 51;
	}
	
	var rvbDiv = htmlElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-ColorDialog-DataDiv',
			id : 'TravelNotes-ColorDialog-DataDiv'
		},
		colorDiv
	);
	
	// ... red ...
	htmlElementsFactory.create (
		'text',
		{
			data : g_Translator.getText ( 'ColorDialog - Red'),
		},
		rvbDiv
	);
	var redInput =  htmlElementsFactory.create (
		'input',
		{
			type : 'number',
			className : 'TravelNotes-ColorDialog-NumberInput',
			id : 'TravelNotes-ColorDialog-RedInput'
			
		},
		rvbDiv
	);
	redInput.value = colorToNumbers ( color ).r;
	redInput.min = 0;
	redInput.max = 255;
	
	redInput.addEventListener ( 'input', onColorInput, false );
	
	// ... and green...
	htmlElementsFactory.create (
		'text',
		{
			data : g_Translator.getText ( 'ColorDialog - Green'),
		},
		rvbDiv
	);
	var greenInput =  htmlElementsFactory.create (
		'input',
		{
			type : 'number',
			className : 'TravelNotes-ColorDialog-NumberInput',
			id : 'TravelNotes-ColorDialog-GreenInput'
		},
		rvbDiv
	);
	greenInput.value = colorToNumbers ( color ).g;
	greenInput.min = 0;
	greenInput.max = 255;
	greenInput.addEventListener ( 'input', onColorInput, false );

	// ... and blue
	htmlElementsFactory.create (
		'text',
		{
			data : g_Translator.getText ( 'ColorDialog - Blue'),
		},
		rvbDiv
	);
	var blueInput =  htmlElementsFactory.create (
		'input',
		{
			type : 'number',
			className : 'TravelNotes-ColorDialog-NumberInput',
			id : 'TravelNotes-ColorDialog-BlueInput'
		},
		rvbDiv
	);
	blueInput.value = colorToNumbers ( color ).b;
	blueInput.min = 0;
	blueInput.max = 255;
	blueInput.addEventListener ( 'input', onColorInput, false );
	
	// Sample color
	var colorSampleDiv = htmlElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-ColorDialog-ColorSampleDiv',
			id : 'TravelNotes-ColorDialog-ColorSampleDiv'
		},
		colorDiv
	);
	colorSampleDiv.setAttribute ( 'style', 'background-color:'+ color +';' );

	
	// and the dialog is centered on the screen
	baseDialog.center ( );
	
	return baseDialog;
};

/*
--- End of ColorDialog.js file ----------------------------------------------------------------------------------------
*/	