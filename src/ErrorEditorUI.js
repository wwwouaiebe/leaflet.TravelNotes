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

	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( ! _ErrorDiv.childNodes[ 1 ].innerHTML.length ) {
			return;
		}	
		clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.innerHTML = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? '&#x25b6;' : '&#x25bc;';
		clickEvent.target.title = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? 'Afficher' : 'Masquer';
	};

	// User interface

	var _ErrorDiv = null;
	var _ErrorPanel = null;
	
	var getErrorEditorUI = function ( ) {
				
		var _CreateErrorUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			_ErrorDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ErrorDiv', className : 'TravelControl-Div'} );
			var headerErrorDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ErrorHeaderDiv', className : 'TravelControl-HeaderDiv'}, _ErrorDiv );
			var expandErrorButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-ErrorExpandButton', className : 'TravelControl-ExpandButton'}, headerErrorDiv );
			expandErrorButton.addEventListener ( 'click' , onClickExpandButton, false );
			_ErrorPanel = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ErrorPannel', className : 'TravelControl-Panel'}, _ErrorDiv );
		};

		var _ExpandEditorUI = function ( ) {
			_ErrorDiv.childNodes[ 0 ].firstChild.innerHTML = '&#x25bc;';
			_ErrorDiv.childNodes[ 0 ].firstChild.title = 'Masquer';
			_ErrorDiv.childNodes[ 1 ].classList.remove ( 'TravelControl-HiddenList' );
		};
		
		var _ReduceEditorUI = function ( ) {
			_ErrorDiv.childNodes[ 0 ].firstChild.innerHTML = '&#x25b6;';
			_ErrorDiv.childNodes[ 0 ].firstChild.title = 'Afficher';
			_ErrorDiv.childNodes[ 1 ].classList.add ( 'TravelControl-HiddenList' );
		};

		if ( ! _ErrorDiv ) {
			_CreateErrorUI ( );
			_ReduceEditorUI ( );
		}
		
		
		return {
			get UI ( ) { return _ErrorDiv; },
	
			expand : function ( ) {
				_ExpandEditorUI ( );
			},
			
			reduce : function ( ) {
				_ReduceEditorUI ( );
			},
			set message ( Message ) { _ErrorPanel.innerHTML = Message; },
			get message (  ) { return _ErrorPanel.innerHTML; }
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getErrorEditorUI;
	}

}());
