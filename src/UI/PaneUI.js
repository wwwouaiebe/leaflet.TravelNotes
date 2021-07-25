
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
Doc reviewed 20210725
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file PaneUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module PaneUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { PANE_ID } from '../util/Constants.js';

/*
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} PaneUI
@interface
@see {@link PanesManagerUI} for pane UI management
@see {@link ItineraryPaneUI} for existing panes
@see {@link TravelNotesPaneUI} for existing panes
@see {@link OsmSearchPaneUI} for existing panes
@desc An object that can be displayed as a pane
@property {function} remove A function that do the cleaning of the pane data div
@property {function} add A function that add all the needed HTMLElements in the pane data div
@property {function} getId A function that gives a unique identifier for the PaneUI
@property {function} getButtonText A function that return the text to be displayed in the pane button
@property {function} setPaneDivs A function that set the pane data div and pane control div
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@--------------------------------------------------------------------------------------------------------------------------

@class PaneUI
@classdesc Base class for panes
@see {@link PanesManagerUI} for pane UI management
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class PaneUI {

	constructor ( ) {
		this.paneDataDiv = null;
		this.paneControlDiv = null;
	}

	remove ( ) {
	}

	add ( ) {
	}

	getId ( ) {
		return PANE_ID.invalidPane;
	}

	getButtonText ( ) {
		return '';
	}

	setPaneDivs ( paneDataDiv, paneControlDiv ) {
		this.paneDataDiv = paneDataDiv;
		this.paneControlDiv = paneControlDiv;
	}
}

export default PaneUI;