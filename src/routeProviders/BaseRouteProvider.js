/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
Changes:
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file BaseRouteProvider.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module routeProviders
@todo review this module: -> split into different modules for each provider + lib for shared classes.

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@class BaseRouteProvider
@classdesc coming soon...
@hideconstructor
@abstract

@------------------------------------------------------------------------------------------------------------------------------
*/

class BaseRouteProvider {

	#userLanguage = 'fr';

	/**
	The provider key. Will be set by TravelNotes
	@private
	*/

	#providerKey = '';

	/**
	A reference to the edited route
	*/

	#route = null;

	/* eslint-disable-next-line no-unused-vars */
	#getRoute ( onOk, onError ) {

		// to be implemented in the derived classes
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	get icon ( ) {
		return '' +
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjw' +
			'v8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAArSURBVEhL7cyxDQAgAAQh91/67ektTI4BOHumGtWoRjWqUY1qVKMaP9bbBZKXgg' +
			'u6NeCUAAAAAElFTkSuQmCC';
	}

	getPromiseRoute ( route ) {
		this.#route = route;
		return new Promise ( ( onOk, onError ) => this.#getRoute ( onOk, onError ) );
	}

	get name ( ) { return ''; }

	get title ( ) { return ''; }

	get transitModes ( ) { return [ /* 'bike', 'pedestrian', 'car', 'train', 'line', 'circle' */ ]; }

	get providerKeyNeeded ( ) { return true; }

	get providerKey ( ) { return this.#providerKey.length; }
	set providerKey ( providerKey ) { this.#providerKey = providerKey; }

	get userLanguage ( ) { return this.#userLanguage; }
	set userLanguage ( userLanguage ) { this.#userLanguage = userLanguage; }
}

export default BaseRouteProvider;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of BaseRouteProvider.js file

@------------------------------------------------------------------------------------------------------------------------------
*/