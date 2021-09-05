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

@file BaseContextMenuEventListeners.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module contextMenus
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@--------------------------------------------------------------------------------------------------------------------------

@class KeyboardKeydownEL
@classdesc keydown event listener for the context menus
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class KeyboardKeydownEL {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( keydownEvent ) {
		keydownEvent.stopPropagation ( );
		this.#menuOperator.onKeydownKeyboard ( keydownEvent.key );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class CancelButtonClickEL
@classdesc click event listener on the cancel button for the context menus
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class CancelButtonClickEL {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		this.#menuOperator.onCancelMenu ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class MenuItemMouseLeaveEL
@classdesc mouseleave event listener on the menuItems for the context menus
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class MenuItemMouseLeaveEL {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( mouseLeaveEvent ) {
		mouseLeaveEvent.stopPropagation ( );
		this.#menuOperator.onMouseLeaveMenuItem ( mouseLeaveEvent.target );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class MenuItemMouseEnterEL
@classdesc mouseenter event listener on the menuItems for the context menus
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class MenuItemMouseEnterEL {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( mouseEnterEvent ) {
		mouseEnterEvent.stopPropagation ( );
		this.#menuOperator.onMouseEnterMenuItem ( mouseEnterEvent.target );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class MenuItemClickEL
@classdesc click event listener on the menuItems for the context menus
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class MenuItemClickEL {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		this.#menuOperator.selectItem ( Number.parseInt ( clickEvent.target.dataset.tanObjId ) );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ContainerMouseLeaveEL
@classdesc mouseleave event listener on the container for the context menus
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class ContainerMouseLeaveEL {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( mouseLeaveEvent ) {
		mouseLeaveEvent.stopPropagation ( );
		this.#menuOperator.onMouseLeaveContainer ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ContainerMouseEnterEL
@classdesc  mouseenter event listener on the container for the context menus
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class ContainerMouseEnterEL {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( mouseEnterEvent ) {
		mouseEnterEvent.stopPropagation ( );
		this.#menuOperator.onMouseEnterContainer ( );
	}
}

export {
	KeyboardKeydownEL,
	CancelButtonClickEL,
	MenuItemMouseLeaveEL,
	MenuItemMouseEnterEL,
	MenuItemClickEL,
	ContainerMouseLeaveEL,
	ContainerMouseEnterEL
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of BaseContextMenuEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/