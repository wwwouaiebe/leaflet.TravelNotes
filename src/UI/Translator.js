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
--- Translator.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the Translator object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20170930
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {
	
	'use strict';
	var Translator = function ( ) {
		
		if ( ! global.translations ) {
			global.translations = new Map ( );
		}

		return {
			
			setTranslations : function ( translations ) {
				translations.forEach (
					function ( translation ) {
						global.translations.set ( translation.msgid, translation.msgstr );
					}
				);
			},
			
			getText : function ( msgid , params ) { 
				var translation = global.translations.get ( msgid );
				if ( params && translation ) {
					Object.getOwnPropertyNames ( params ).forEach (
						function ( propertyName ) {
							translation = translation.replace ( '{' + propertyName + '}' , params [ propertyName ] ); 
						}
					);
				}
				
				return translation ? translation : msgid;
			}
		};
	};
	
	/* 
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = Translator;
	}

} ) ( );

/*
--- End of Translator.js file -----------------------------------------------------------------------------------------
*/	
