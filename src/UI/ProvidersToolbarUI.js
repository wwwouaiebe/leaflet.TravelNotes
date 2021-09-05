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
	- v1.4.0:
		- created
	- v1.5.0:
		- code review
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯63 : Find a better solution for provider keys upload
	- v1.7.0:
		- added line and circle icons
		- modified bike, pedestrian and car icons
	- v1.6.0:
		- Issue ♯102 : Sometime the provider toolbar is incomplete at startup
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ProvidersToolbarUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module providersToolbarUI

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTravelNotesData from '../data/TravelNotesData.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import ProviderToolbarTransitModeButton from '../UI/ProviderToolbarTransitModeButton.js';
import ProviderToolbarProviderButton from '../UI/ProviderToolbarProviderButton.js';
import { NOT_FOUND, ZERO } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ProvidersToolbarUI
@classdesc This class is the provider and transitModes toolbar at the bottom of the UI
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ProvidersToolbarUI {

	/**
	The toolbar HTMLElement
	@private
	*/

	#toolbarHTMLElement = null;

	/**
	A map with the transit mode buttons
	@private
	*/

	#transitModeButtons = new Map ( );

	/**
	A map with the provider buttons
	@private
	*/

	#providerButtons = new Map ( );

	/**
	the active transit mode buttonHTMLElement
	@private
	*/

	#activeTransitModeButton = null;

	/**
	the active provider button
	@private
	*/

	#activeProviderButton = null;

	/**
	Transit mode buttons creation
	@private
	*/

	#createTransitModesButtons ( ) {
		[ 'bike', 'pedestrian', 'car', 'train', 'line', 'circle' ].forEach (
			transitMode => {
				let transitModeButton = new ProviderToolbarTransitModeButton ( this, transitMode );
				this.#transitModeButtons.set ( transitMode, transitModeButton );
				this.#toolbarHTMLElement.appendChild ( transitModeButton.buttonHTMLElement );
			}
		);

	}

	/**
	Provider buttons creation
	@private
	*/

	#createProvidersButtons ( ) {
		theTravelNotesData.providers.forEach (
			provider => {
				if ( ZERO !== provider.providerKey ) {
					let providerButton = new ProviderToolbarProviderButton ( this, provider );
					this.#providerButtons.set ( provider.name, providerButton );
					this.#toolbarHTMLElement.appendChild ( providerButton.buttonHTMLElement );
				}
			}
		);
	}

	/*
	constructor
	*/

	constructor ( UIMainHTMLElement ) {
		Object.freeze ( this );
		this.#toolbarHTMLElement = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-FlexRowDiv TravelNotes-ProvidersToolbarUI-ImgButtonsDiv'
			},
			UIMainHTMLElement
		);
		this.#createTransitModesButtons ( );
		this.#createProvidersButtons ( );
		this.provider = this.#providerButtons.keys ().next ().value;
	}

	/**
	set a provider as active provider
	*/

	set provider ( providerName ) {
		theTravelNotesData.routing.provider = providerName;

		// removing previous provider
		if ( this.#activeProviderButton ) {
			this.#activeProviderButton.active = false;
		}

		// set the new provider
		this.#activeProviderButton = this.#providerButtons.get ( providerName );
		this.#activeProviderButton.active = true;

		// transit mode buttons activation
		let provider = theTravelNotesData.providers.get ( providerName.toLowerCase ( ) );
		this.#transitModeButtons.forEach (
			transitModeButton => {
				transitModeButton.visible = NOT_FOUND !== provider.transitModes.indexOf ( transitModeButton.transitMode );
			}
		);

		// transit mode button selection if the current one is not more valid
		if (
			! this.#activeTransitModeButton
			||
			NOT_FOUND === provider.transitModes.indexOf ( this.#activeTransitModeButton.transitMode )
		) {
			this.#activeTransitModeButton = null;
			this.#transitModeButtons.forEach (
				transitModeButton => {
					if (
						( ! this.#activeTransitModeButton )
						&&
						NOT_FOUND !== provider.transitModes.indexOf ( transitModeButton.transitMode )
					) {
						this.#activeTransitModeButton = transitModeButton;
						transitModeButton.active = true;
						theTravelNotesData.routing.transitMode = transitModeButton.transitMode;
					}
					else {
						transitModeButton.active = false;
					}
				}
			);

		}
	}

	/**
	set a transit mode as active transit mode
	*/

	set transitMode ( transitMode ) {
		theTravelNotesData.routing.transitMode = transitMode;
		if ( this.#activeTransitModeButton ) {
			this.#activeTransitModeButton.active = false;
		}
		this.#activeTransitModeButton = this.#transitModeButtons.get ( transitMode );
		this.#activeTransitModeButton.active = true;
	}

	/**
	Reset the toolbar when providers added ( see providersadded event )
	*/

	providersAdded ( ) {
		while ( this.#toolbarHTMLElement.firstChild ) {
			this.#toolbarHTMLElement.removeChild ( this.#toolbarHTMLElement.firstChild );
		}
		this.#transitModeButtons.clear ( );
		this.#providerButtons.clear ( );
		this.#createTransitModesButtons ( );
		this.#createProvidersButtons ( );
		this.provider = this.#providerButtons.keys ().next ().value;
		let providerName = this.#providerButtons.keys ( ).next ( ).value;
		this.provider = providerName;
		this.transitMode = theTravelNotesData.providers.get ( providerName.toLowerCase ( ) ).transitModes [ ZERO ];
	}

}

export default ProvidersToolbarUI;

/*
--- End of ProvidersToolbarUI.js file -----------------------------------------------------------------------------------------
*/