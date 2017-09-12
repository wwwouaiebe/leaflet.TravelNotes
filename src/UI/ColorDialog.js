/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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
To do: translations
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );
	
	var _LocalEditorData = { buttons : [], list : [] };
	var _Note;
	var _RouteObjId;
	
	var onOkButtonClick = function ( ) {
		return true;
	};

	var getColorDialog = function ( color ) {

		var red = parseInt ( color.substr ( 1, 2 ), 16 ); 
		var green = parseInt ( color.substr ( 3, 2 ), 16 ); 
		var blue = parseInt ( color.substr ( 5, 2 ), 16 ); 
		var newColor = color;
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

		// the dialog base is created
		var baseDialog = require ( '../UI/BaseDialog' ) ( );
		baseDialog.title = _Translator.getText ( 'ColorDialog - Title' );
		baseDialog.addClickOkButtonEventListener ( onOkButtonClick );

		var rowCounter = 0;
		var colorButtons = [
			[ '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff' ], 
			[ '#000033', '#000066', '#000099', '#0000cc', '#0000ff', '#ffffff' ], 
			[ '#003300', '#006600', '#009900', '#00cc00', '#00ff00', '#ffffff' ],
			[ '#330000', '#660000', '#990000', '#cc0000', '#ff0000', '#ffffff' ], 
			[ '#333300', '#666600', '#999900', '#cccc00', '#ffff00', '#ffffff' ], 
			[ '#330033', '#660066', '#990099', '#cc00cc', '#ff00ff', '#ffffff' ], 
			[ '#003333', '#006666', '#009999', '#00cccc', '#00ffff', '#ffffff' ], 
		];
		
		var setColor = function ( event ) {
			redInput.value = parseInt ( event.target.colorValue.substr ( 1, 2 ), 16 );
			greenInput.value = parseInt ( event.target.colorValue.substr ( 3, 2 ), 16 );
			blueInput.value = parseInt ( event.target.colorValue.substr ( 5, 2 ), 16 );
			document.getElementById ( 'TravelNotes-ColorDialog-ColorSampleDiv').setAttribute ( 'style', 'background-color:'+ event.target.colorValue +';' );
		};
		var buttonsDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ButtonsDiv',
				id : 'TravelNotes-ColorDialog-ButtonsDiv'
			},
			baseDialog.content
		);

		var colorButtonsDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ColorButtonsDiv',
				id : 'TravelNotes-ColorDialog-ColorButtonsDiv'
			},
			buttonsDiv
		);
		while ( ++ rowCounter < 8 ) {
			var colorButtonsRowDiv = htmlElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ColorDialog-RowColorDiv',
					id : 'TravelNotes-ColorDialog-RowColorDiv' +rowCounter
				},
				colorButtonsDiv
			);
			var cellCounter = 0;


			while ( ++ cellCounter < 7 ) {
				var colorButtonCellDiv = htmlElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-ColorDialog-CellColorDiv',
						id : ( 'TravelNotes-ColorDialog-CellColorDiv' + rowCounter ) + cellCounter
					},
					colorButtonsRowDiv
				);
				colorButtonCellDiv.setAttribute ( 'style', 'background-color:' + colorButtons [ rowCounter - 1] [ cellCounter - 1 ] );
				colorButtonCellDiv.colorValue = colorButtons [ rowCounter - 1] [ cellCounter - 1 ];
				colorButtonCellDiv.addEventListener ( 'click', setColor, false );
			}
		}
		
		var rvbDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-DataDiv',
				id : 'TravelNotes-ColorDialog-DataDiv'
			},
			baseDialog.content
		);
		
		var changeSampleColor = function ( )  {
			console.log ( 'changeSampleColor');
			newColor = '#' + parseInt ( redInput.value ).toString(16).padStart ( 2, '0' ) + parseInt ( greenInput.value ).toString(16).padStart ( 2, '0' )  + parseInt ( blueInput.value ).toString(16).padStart ( 2, '0' ) ;
			console.log ( newColor );
			document.getElementById ( 'TravelNotes-ColorDialog-ColorSampleDiv').setAttribute ( 'style', 'background-color:'+newColor+';' );
		};
		
		// ... red ...
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'ColorDialog - red'),
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
		redInput.value = red;
		redInput.min = 0;
		redInput.max = 255;
		
		redInput.addEventListener ( 'input', changeSampleColor, false );
		
		// ... and green...
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'ColorDialog - green'),
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
		greenInput.value = green;
		greenInput.min = 0;
		greenInput.max = 255;
		greenInput.addEventListener ( 'input', changeSampleColor, false );

		// ... and green
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'ColorDialog - blue'),
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
		blueInput.value = blue;
		blueInput.min = 0;
		blueInput.max = 255;
		blueInput.addEventListener ( 'input', changeSampleColor, false );
		
		var colorSampleDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-DataDiv',
				id : 'TravelNotes-ColorDialog-ColorSampleDiv'
			},
			baseDialog.content
		);
		colorSampleDiv.setAttribute ( 'style', 'background-color:'+ color +';' );

		
		// and the dialog is centered on the screen
		baseDialog.center ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getColorDialog;
	}

}());

		