/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- HttpRequestBuilder.js file ----------------------------------------------------------------------------------------
This file contains:
	- the newHttpRequestPromise function
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newHttpRequestBuilder };

/*
--- newHttpRequestBuilder function ------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newHttpRequestBuilder ( ) {

	/*
	--- myGetJsonPromise function -------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetJsonPromise ( url, requestHeaders ) {

		/*
		--- jsonRequest function --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		function jsonRequest ( onOk, onError ) {
			let xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = 20000;
			xmlHttpRequest.ontimeout = function ( ) {
				onError ( 'XMLHttpRequest TimeOut. File : ' + xmlHttpRequest.responseURL );
			};
			xmlHttpRequest.onreadystatechange = function ( ) {
				if ( xmlHttpRequest.readyState === 4 ) {
					if ( xmlHttpRequest.status === 200 ) {
						let response;
						try {
							response = JSON.parse ( xmlHttpRequest.responseText );
						}
						catch ( err ) {
							onError ( 'JSON parsing error. File : ' + xmlHttpRequest.responseURL );
						}
						onOk ( response );
					}
					else {
						onError ( 'Error XMLHttpRequest - File : ' + xmlHttpRequest.responseURL );
					}
				}
			};
			xmlHttpRequest.open ( 'GET', url, true );
			if ( requestHeaders ) {
				requestHeaders.forEach ( header => xmlHttpRequest.setRequestHeader ( header.headerName, header.headerValue ) );
			}
			xmlHttpRequest.overrideMimeType ( 'application/json' );
			xmlHttpRequest.send ( null );
		}

		return new Promise ( jsonRequest );
	}

	/*
	--- myGetBinaryPromise function -----------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetBinaryPromise ( url, requestHeaders ) {

		/*
		--- binaryRequest function ------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		function binaryRequest ( onOk, onError ) {
			let xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = 20000;
			xmlHttpRequest.ontimeout = function ( ) {
				onError ( 'XMLHttpRequest TimeOut. File : ' + xmlHttpRequest.responseURL );
			};
			xmlHttpRequest.onload = function ( ) {
				if ( 200 === xmlHttpRequest.status ) {
					let arrayBuffer = xmlHttpRequest.response;
					if ( arrayBuffer ) {
						onOk ( arrayBuffer );
					}
					else {
						onError ( 'Error XMLHttpRequest - File : ' + xmlHttpRequest.responseURL );
					}
				}
				else {
					onError ( 'Error XMLHttpRequest - File : ' + xmlHttpRequest.responseURL );
				}
			};
			xmlHttpRequest.open ( 'GET', url, true );
			if ( requestHeaders ) {
				requestHeaders.forEach ( header => xmlHttpRequest.setRequestHeader ( header.headerName, header.headerValue ) );
			}
			xmlHttpRequest.responseType = 'arraybuffer';
			xmlHttpRequest.send ( null );
		}

		return new Promise ( binaryRequest );
	}

	/*
	--- HttpRequestBuilder object -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return {
		getJsonPromise : ( url, requestHeaders ) => { return myGetJsonPromise ( url, requestHeaders ); },
		getBinaryPromise : ( url, requestHeaders ) => { return myGetBinaryPromise ( url, requestHeaders ); }
	};

}

/*
--- End of HttpRequestBuilder.js file ---------------------------------------------------------------------------------
*/