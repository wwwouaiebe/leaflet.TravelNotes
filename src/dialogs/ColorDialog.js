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
		- Issue #66 : Work with promises for dialogs
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newColorDialog };

import { g_Translator } from '../UI/Translator.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
	
/*
--- newColorDialog function -------------------------------------------------------------------------------------------


-----------------------------------------------------------------------------------------------------------------------
*/

function newColorDialog ( color ) {
	
	let m_ColorDialog = null;
	let m_ColorDiv = null;
	let m_NewColor = color;
	let m_RedInput = null;
	let m_GreenInput = null;
	let m_BlueInput = null;
	let m_ColorSampleDiv = null;
	let m_HTMLElementsFactory = newHTMLElementsFactory ( ) ;
	
	/*
	--- m_ColorToNumbers function -------------------------------------------------------------------------------------

	This function transforms a css color into an object { red : xx, green : xx, blue : xx}

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ColorToNumbers ( color ) {
		return {
			red : parseInt ( color.substr ( 1, 2 ), 16 ),
			green : parseInt ( color.substr ( 3, 2 ), 16 ), 
			blue : parseInt ( color.substr ( 5, 2 ), 16 ) 
		};
	}
	
	/*
	--- m_NumbersToColor function -------------------------------------------------------------------------------------

	This function transforms 3 numbers into a css color

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_NumbersToColor ( red, green, blue ) {

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

						//append to original to ensure we are longer than needed
						padString += padString.repeat ( targetLength / padString.length ); 
					}
					return padString.slice ( 0, targetLength ) + String ( this );
				}
			};
		}			
		
		return '#' + 
			parseInt ( red ).toString (16).padStart ( 2, '0' ) + 
			parseInt ( green ).toString (16).padStart ( 2, '0' ) + 
			parseInt ( blue ).toString (16).padStart ( 2, '0' ) ;
	}

	/*
	--- m_OnColorClick function ---------------------------------------------------------------------------------------

	Click event handler on a color button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnColorClick ( event ) {
		m_NewColor = event.target.colorValue;
		let numbers = m_ColorToNumbers ( m_NewColor );
		m_RedInput.value = numbers.red;
		m_GreenInput.value = numbers.green;
		m_BlueInput.value = numbers.blue;
		m_ColorSampleDiv.setAttribute ( 'style', 'background-color:'+ event.target.colorValue +';' );
		m_ColorSampleDiv.color = m_NewColor;
	}
	
	/*
	--- m_OnRedColorClick function ------------------------------------------------------------------------------------

	Click event handler on a red color button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnRedColorClick ( event ) {
		let red = event.target.redValue;
		let green = 255;
		let blue = 255;
		let rowCounter = 0;
		while ( ++ rowCounter < 7 ) {
			let cellCounter = 0;
			green = 255;
			while ( ++ cellCounter < 7 ) {
				let button = document.getElementById ( ( 'TravelNotes-ColorDialog-CellColorDiv' + rowCounter ) + cellCounter );
				button.colorValue = m_NumbersToColor ( red, green, blue );
				button.setAttribute ( 'style', 'background-color:' + m_NumbersToColor ( red, green, blue ) );
				green -= 51;
			}
			blue -= 51;
		}
	}

	/*
	--- m_OnColorInput function ------------------------------------------------------------------------------------

	Red, green or blue input event handler 

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnColorInput ( )  {
		m_NewColor = m_NumbersToColor ( m_RedInput.value, m_GreenInput.value, m_BlueInput.value );
		m_ColorSampleDiv.setAttribute ( 'style', 'background-color:' + m_NewColor + ';' );
		m_ColorSampleDiv.color = m_NewColor;
	}

	/*
	--- m_CreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateDialog ( ) {		

		// the dialog base is created
		m_ColorDialog = newBaseDialog ( );
		m_ColorDialog.title = g_Translator.getText ( 'ColorDialog - Colors' );
	}

	/*
	--- m_CreateColorDiv function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateColorDiv ( ) {
		m_ColorDiv = m_HTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ColorDiv',
				id : 'TravelNotes-ColorDialog-ColorDiv'
			},
			m_ColorDialog.content
		);
	}
	
	/*
	--- m_CreateButtonsDiv function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateButtonsDiv ( ) {
		let buttonsDiv = m_HTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ButtonsDiv',
				id : 'TravelNotes-ColorDialog-ButtonsDiv'
			},
			m_ColorDiv
		);

		let red = 255;
		let green = 255;
		let blue = 255;		
		let rowCounter = 0;
		
		// loop on the 7 rows
		while ( ++ rowCounter < 8 ) {			
			let colorButtonsRowDiv = m_HTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ColorDialog-RowColorDiv',
					id : 'TravelNotes-ColorDialog-RowColorDiv' +rowCounter
				},
				buttonsDiv
			);
			
			let cellCounter = 0;
			green = 255;
			
			// loop on the 6 cells
			while ( ++ cellCounter < 7 ) {
				let colorButtonCellDiv = m_HTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-ColorDialog-CellColorDiv',
						id : ( 'TravelNotes-ColorDialog-CellColorDiv' + rowCounter ) + cellCounter
					},
					colorButtonsRowDiv
				);
				if ( rowCounter < 7 ) {
					colorButtonCellDiv.setAttribute ( 'style', 'background-color:' + m_NumbersToColor ( red, green, blue ) );
					colorButtonCellDiv.colorValue = m_NumbersToColor ( red, green, blue );
					colorButtonCellDiv.addEventListener ( 'click', m_OnColorClick, false );
					green -= 51;
				}
				else {
					red = ( cellCounter - 1 ) * 51;
					let buttonColor = m_NumbersToColor ( 255, red, red );
					colorButtonCellDiv.setAttribute ( 'style', 'background-color:' + buttonColor );
					colorButtonCellDiv.redValue = 255 - red;
					colorButtonCellDiv.addEventListener ( 'click', m_OnRedColorClick, false );
				}
			}
			blue -= 51;
		}
	}
	
	/*
	--- m_CreateRvbDiv function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateRvbDiv ( ) {
		let rvbDiv = m_HTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-DataDiv',
				id : 'TravelNotes-ColorDialog-DataDiv'
			},
			m_ColorDiv
		);
		
		// ... red ...
		m_HTMLElementsFactory.create (
			'text',
			{
				data : g_Translator.getText ( 'ColorDialog - Red')
			},
			rvbDiv
		);
		m_RedInput =  m_HTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				id : 'TravelNotes-ColorDialog-RedInput'
				
			},
			rvbDiv
		);
		m_RedInput.value = m_ColorToNumbers ( m_NewColor ).red;
		m_RedInput.min = 0;
		m_RedInput.max = 255;
		
		m_RedInput.addEventListener ( 'input', m_OnColorInput, false );
		
		// ... and green...
		m_HTMLElementsFactory.create (
			'text',
			{
				data : g_Translator.getText ( 'ColorDialog - Green')
			},
			rvbDiv
		);
		m_GreenInput =  m_HTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				id : 'TravelNotes-ColorDialog-GreenInput'
			},
			rvbDiv
		);
		m_GreenInput.value = m_ColorToNumbers ( m_NewColor ).green;
		m_GreenInput.min = 0;
		m_GreenInput.max = 255;
		m_GreenInput.addEventListener ( 'input', m_OnColorInput, false );

		// ... and blue
		m_HTMLElementsFactory.create (
			'text',
			{
				data : g_Translator.getText ( 'ColorDialog - Blue')
			},
			rvbDiv
		);
		m_BlueInput =  m_HTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				id : 'TravelNotes-ColorDialog-BlueInput'
			},
			rvbDiv
		);
		m_BlueInput.value = m_ColorToNumbers ( m_NewColor ).blue;
		m_BlueInput.min = 0;
		m_BlueInput.max = 255;
		m_BlueInput.addEventListener ( 'input', m_OnColorInput, false );
	}
	
	/*
	--- m_CreateColorSampleDiv function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateColorSampleDiv ( ) {
		m_ColorSampleDiv = m_HTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ColorSampleDiv',
				id : 'TravelNotes-ColorDialog-ColorSampleDiv'
			},
			m_ColorDiv
		);
		m_ColorSampleDiv.setAttribute ( 'style', 'background-color:'+ m_NewColor +';' );
		m_ColorSampleDiv.color = m_NewColor;
	}




	m_CreateDialog ( );
	m_CreateColorDiv ( );
	m_CreateButtonsDiv ( );
	m_CreateRvbDiv ( );
	m_CreateColorSampleDiv ( );
	
	return m_ColorDialog;
}

/*
--- End of ColorDialog.js file ----------------------------------------------------------------------------------------
*/	