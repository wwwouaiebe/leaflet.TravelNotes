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
--- HTMLElementsFactory.js file ---------------------------------------------------------------------------------------
This file contains:
	- the newHTMLElementsFactory function
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newHTMLElementsFactory };

/* 
--- newHTMLElementsFactory function -----------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newHTMLElementsFactory ( ) {
	
	/* 
	--- m_Create function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_Create  ( tagName, properties, parentNode ) {
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
		if ( properties ) {
			for ( var property in properties ) {
				try {
					element [ property ] = properties [ property ];
				}
				catch ( err ) {
					console.log ( "Invalid property : " + property );
				}
			}
		}
		return element;	
	}

	/* 
	--- HTMLElementsFactory object ------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			create : ( tagName, properties, parentNode ) => { return m_Create ( tagName, properties, parentNode ); }
		}
	);	
}
	
/*
--- End of HTMLElementsFactory.js file --------------------------------------------------------------------------------
*/	