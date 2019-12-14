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
--- SortableList.js file ----------------------------------------------------------------------------------------------
This file contains:
	- the newSortableList function
	- the SortableList object
Changes:
	- v1.0.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newSortableList function ------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newSortableList ( options, parentNode ) {

	let myDataObjId = THE_CONST.zero;

	let myHTMLElementsFactory = newHTMLElementsFactory ( );

	let myItems = [];

	let myOptions = { minSize : THE_CONST.number2, listStyle : 'AllSort', id : 'TravelNotes-SortableList-Container' };

	let myContainer = myHTMLElementsFactory.create (
		'div',
		{
			id : myOptions.id,
			className : 'TravelNotes-SortableList-Container'
		}
	);

	/*
	--- myOnDragStart function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDragStart ( dragEvent ) {
		dragEvent.stopPropagation ( );
		try {
			dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.dataObjId );
			dragEvent.dataTransfer.dropEffect = 'move';
		}
		catch ( err ) {
			console.log ( err );
		}

		// for this #@!& MS Edge... don't remove - THE_CONST.number1 otherwise crasy things comes in FF
		// MS Edge know the dataTransfer object, but the objects linked to the event are
		// different in the drag event and the drop event
		myDataObjId = dragEvent.target.dataObjId - THE_CONST.number1;
	}

	/*
	--- myOnDragOver function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDragOver ( dragEvent ) {
		dragEvent.preventDefault ( );
	}

	/*
	--- myOnDrop function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDrop ( dragEvent ) {
		dragEvent.preventDefault ( );
		let element = dragEvent.target;
		while ( ! element.dataObjId ) {
			element = element.parentElement;
		}
		let clientRect = element.getBoundingClientRect ( );
		let sortableListDropEvent = new Event ( 'SortableListDrop' );

		// for this #@!& MS Edge... don't remove + THE_CONST.number1 otherwise crasy things comes in FF
		// event.draggedObjId = parseInt ( dragEvent.dataTransfer.getData("Text") );
		sortableListDropEvent.draggedObjId = myDataObjId + THE_CONST.number1;

		sortableListDropEvent.targetObjId = element.dataObjId;
		sortableListDropEvent.draggedBefore = ( dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY );
		element.parentNode.dispatchEvent ( sortableListDropEvent );
	}

	/*
	--- myOnDeleteButtonClick function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDeleteButtonClick ( ClickEvent ) {
		let sortableListDeleteEvent = new Event ( 'SortableListDelete' );
		sortableListDeleteEvent.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( sortableListDeleteEvent );
		ClickEvent.stopPropagation ();
	}

	/*
	--- myOnUpArrowButtonClick function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnUpArrowButtonClick ( ClickEvent ) {
		let sortableListUpArrowEvent = new Event ( 'SortableListUpArrow' );
		sortableListUpArrowEvent.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( sortableListUpArrowEvent );
		ClickEvent.stopPropagation ();
	}

	/*
	--- myOnDownArrowButtonClick function -----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDownArrowButtonClick ( ClickEvent ) {
		let sortableListDownArrowEvent = new Event ( 'SortableListDownArrow' );
		sortableListDownArrowEvent.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( sortableListDownArrowEvent );
		ClickEvent.stopPropagation ();
	}

	/*
	--- myOnRightArrowButtonClick function ----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnRightArrowButtonClick ( ClickEvent ) {
		let sortableListRightArrowEvent = new Event ( 'SortableListRightArrow' );
		sortableListRightArrowEvent.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( sortableListRightArrowEvent );
		ClickEvent.stopPropagation ();
	}

	/*
	--- myOnChange function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnChange ( changeEvent ) {
		let sortableListChangeEvent = new Event ( 'SortableListChange' );
		sortableListChangeEvent.dataObjId = changeEvent.target.parentNode.dataObjId;
		sortableListChangeEvent.changeValue = changeEvent.target.value;
		changeEvent.target.parentNode.parentNode.dispatchEvent ( sortableListChangeEvent );
		changeEvent.stopPropagation ();
	}

	/*
	--- myOnWheel function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnWheel ( wheelEvent ) {
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop += wheelEvent.deltaY * THE_CONST.mouse.wheelFactor;
		}
		wheelEvent.stopPropagation ( );
	}

	/*
	--- removeAllItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveAllItems ( ) {
		for ( let ItemCounter = THE_CONST.zero; ItemCounter < myItems.length; ItemCounter ++ ) {
			myContainer.removeChild ( myItems [ ItemCounter ] );
		}
		myItems.length = THE_CONST.zero;
	}

	/*
	--- addItem function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddItem ( itemData ) {

		let item = myHTMLElementsFactory.create ( 'div', { draggable : false, className : 'TravelNotes-SortableList-Item' } );

		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-SortableList-ItemTextIndex',
				innerHTML : itemData.label || ''
			},
			item
		);
		let inputElement = myHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-SortableList-ItemInput',
				placeholder : itemData.placeholder || '',
				value : itemData.value || ''
			},
			item
		);
		inputElement.addEventListener ( 'change', myOnChange, false );

		// Workaround for issue #8
		inputElement.addEventListener (
			'focus',
			focusEvent => {
				focusEvent.target.parentElement.draggable = false;
			},
			false
		);
		inputElement.addEventListener (
			'blur',
			blurEvent => {
				blurEvent.target.parentElement.draggable = blurEvent.target.parentElement.canDrag;
			},
			false
		);

		let upArrowButton = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-SortableList-ItemUpArrowButton',
				title : theTranslator.getText ( 'SortableList - Move up' ),
				innerHTML : '&#x21e7;'
			},
			item
		);
		upArrowButton.addEventListener ( 'click', myOnUpArrowButtonClick, false );
		let downArrowButton = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-SortableList-ItemDownArrowButton',
				title : theTranslator.getText ( 'SortableList - Move down' ),
				innerHTML : '&#x21e9;'
			},
			item
		);
		downArrowButton.addEventListener ( 'click', myOnDownArrowButtonClick, false );
		let rightArrowButton = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-SortableList-ItemRightArrowButton',
				title : theTranslator.getText ( 'SortableList - Edit' ),
				innerHTML : '&#x21f0;'
			},
			item );
		if ( 'AllSort' === myOptions.listStyle ) {
			rightArrowButton.addEventListener ( 'click', myOnRightArrowButtonClick, false );
		}
		let deleteButton = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-SortableList-ItemDeleteButton',
				title : theTranslator.getText ( 'SortableList - Delete' ),
				innerHTML : '&#x267b;'
			},
			item
		);
		deleteButton.addEventListener ( 'click', myOnDeleteButtonClick, false );
		item.dataObjId = itemData.objId || THE_CONST.invalidObjId;

		item.canDrag = false;
		if (
			( ( 'LimitedSort' !== myOptions.listStyle ) || ( THE_CONST.number1 < myItems.length ) )
			&&
			( ! itemData.isLast )
		) {
			item.draggable = true;
			item.addEventListener ( 'dragstart', myOnDragStart, false );
			item.classList.add ( 'TravelNotes-SortableList-MoveCursor' );
			item.canDrag = true;
		}

		myItems.push ( item );

		myContainer.appendChild ( item );
	}

	// myOptions.listStyle = 'AllSort' : all items can be sorted or deleted
	// myOptions.listStyle = 'LimitedSort' : all items except first and last can be sorted or deleted

	for ( let option in options ) {
		myOptions [ option ] = options [ option ];
	}
	if ( ( 'LimitedSort' === myOptions.listStyle ) && ( THE_CONST.number2 > myOptions.minSize ) ) {
		myOptions.minSize = THE_CONST.zero;
	}
	myContainer.classList.add ( myOptions.listStyle );
	myContainer.addEventListener ( 'drop', myOnDrop, false );
	myContainer.addEventListener ( 'dragover', myOnDragOver, false );
	myContainer.addEventListener ( 'wheel', myOnWheel, false );

	if ( parentNode ) {
		parentNode.appendChild ( myContainer );
	}

	for ( let itemCounter = THE_CONST.zero; itemCounter < myOptions.minSize; itemCounter ++ ) {
		myAddItem ( );
	}

	/*
	--- SortableList object -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			removeAllItems : ( ) => myRemoveAllItems ( ),
			addItem : itemData => myAddItem ( itemData ),
			get container ( ) { return myContainer; }
		}
	);

}

export { newSortableList };

/*
--- End of SortableList.js file ---------------------------------------------------------------------------------------
*/