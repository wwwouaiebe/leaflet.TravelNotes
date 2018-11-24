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

( function ( ){
	
	'use strict';

/*
--- RoutePropertiesDialog.js file -------------------------------------------------------------------------------------
This file contains:
	- the RoutePropertiesDialog object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20170930
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

	var _Translator = require ( '../UI/Translator' ) ( );


	/*
	--- RoutePropertiesDialog function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var RoutePropertiesDialog = function ( route ) {
		
		/*
		--- onOkButtonClick function --------------------------------------------------------------------------------------

		click event listener for the ok button

		-------------------------------------------------------------------------------------------------------------------
		*/

		var onOkButtonClick = function ( ) {
			route.color = colorDialog.getNewColor ( );
			route.width = parseInt ( widthInput.value );
			route.chain = chainInput.checked;
			route.dashArray = dashSelect.selectedIndex;

			require ( '../core/MapEditor' ) ( ).editRoute ( route );
			require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
			require ( '../UI/TravelEditorUI' ) ( ).setRoutesList ( );
			require ( '../core/TravelEditor' ) ( ).changeTravelHTML ( );
			return true;
		};

		// the dialog base is created
		var colorDialog = require ( '../UI/ColorDialog' ) ( route.color );
		colorDialog.title = _Translator.getText ( 'RoutePropertiesDialog - Route properties' );
		colorDialog.addClickOkButtonEventListener ( onOkButtonClick );
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

		var routePropertiesDiv = htmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-RoutePropertiesDialog-MainDataDiv'
			},
			colorDialog.content
		);
		
		// ... width ...
		var widthDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-WithDiv'
			},
			routePropertiesDiv
		);
		widthDiv.innerHTML = '<span>' + _Translator.getText ( 'RoutePropertiesDialog - Width') + '</span>';
		var widthInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				id : 'TravelNotes-RoutePropertiesDialog-WidthInput'
				
			},
			widthDiv
		);
		widthInput.value = route.width;
		widthInput.min = 1;
		widthInput.max = 40;

		// dash
		var dashDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-dashDiv'
			},
			routePropertiesDiv
		);
		dashDiv.innerHTML = '<span>' + _Translator.getText ( 'RoutePropertiesDialog - Linetype') + '</span>';
		var dashSelect = htmlElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-RoutePropertiesDialog-Select',
				id : 'TravelNotes-RoutePropertiesDialog-DashSelect'
			},
			dashDiv
		);

		var dashChoices = require ( '../L.TravelNotes' ).config.route.dashChoices;
		for ( var optionsCounter = 0; optionsCounter < dashChoices.length; optionsCounter ++ ) {
			dashSelect.add ( htmlElementsFactory.create ( 'option', { text :  dashChoices [ optionsCounter ].text } ) );
		}
		dashSelect.selectedIndex = route.dashArray < dashChoices.length ? route.dashArray : 0;
		
		// chain
		var chainDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-ChainDiv'
			},
			routePropertiesDiv
		);
		chainDiv.innerHTML = '<span>' + _Translator.getText ( 'RoutePropertiesDialog - Chained route') + '</span>';
		var chainInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-RoutePropertiesDialog-ChainInput'			
			},
			chainDiv
		);
		chainInput.checked = route.chain;
		return colorDialog;
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = RoutePropertiesDialog;
	}

}());

/*
--- End of RoutePropertiesDialog.js file ------------------------------------------------------------------------------
*/	