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
--- HTMLElementsFactory.js file ---------------------------------------------------------------------------------------
This file contains:
	- the HTMLElementsFactory object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20170929
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	/* 
	--- HTMLElementsFactory object ------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var HTMLElementsFactory = function ( ) {

		/* 
		--- HTMLElementsFactory object --------------------------------------------------------------------------------
		
		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			create : function ( tagName, properties, parentNode ) {
				var element;
				if ( 'text' === tagName.toLowerCase ( ) ) {
					element = document.createTextNode ( '' );
				}
				else {
					element = document.createElement ( tagName );
				}
				if ( parentNode ) {
					parentNode.appendChild ( element );
				}
				if ( properties )
				{
					for ( var property in properties ) {
						try {
							element [ property ] = properties [ property ];
						}
						catch ( e ) {
							console.log ( "Invalid property : " + property );
						}
					}
				}
				return element;
			}
			
		};
			
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = HTMLElementsFactory;
	}

}());

/*
--- End of HTMLElementsFactory.js file --------------------------------------------------------------------------------
*/	
