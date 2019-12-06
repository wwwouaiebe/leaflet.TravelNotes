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

export { newSortableList };

import { theTranslator } from '../UI/Translator.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/*
--- newSortableList function ------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newSortableList ( options, parentNode ) {

	let myDataObjId  = 0;

	let myHTMLElementsFactory = newHTMLElementsFactory ( );

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

		// for this #@!& MS Edge... don't remove - 1 otherwise crasy things comes in FF
		// MS Edge know the dataTransfer object, but the objects linked to the event are
		//different in the drag event and the drop event
		myDataObjId = dragEvent.target.dataObjId - 1;
	}

	/*
	--- myOnDragOver function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDragOver ( event ) {
		event.preventDefault ( );
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
		let event = new Event ( 'SortableListDrop' );

		// for this #@!& MS Edge... don't remove + 1 otherwise crasy things comes in FF
		//event.draggedObjId = parseInt ( dragEvent.dataTransfer.getData("Text") );
		event.draggedObjId = myDataObjId + 1;

		event.targetObjId = element.dataObjId;
		event.draggedBefore = ( dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY );
		element.parentNode.dispatchEvent ( event );
	}

	/*
	--- myOnDeleteButtonClick function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDeleteButtonClick ( ClickEvent ) {
		let event = new Event ( 'SortableListDelete' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation ();
	}

	/*
	--- myOnUpArrowButtonClick function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnUpArrowButtonClick ( ClickEvent ) {
		let event = new Event ( 'SortableListUpArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation ();
	}

	/*
	--- myOnDownArrowButtonClick function -----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDownArrowButtonClick ( ClickEvent ) {
		let event = new Event ( 'SortableListDownArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation ();
	}

	/*
	--- myOnRightArrowButtonClick function ----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnRightArrowButtonClick ( ClickEvent ) {
		let event = new Event ( 'SortableListRightArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation ();
	}

	/*
	--- myOnChange function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnChange ( changeEvent ) {
		let event = new Event ( 'SortableListChange' );
		event.dataObjId = changeEvent.target.parentNode.dataObjId;
		event.changeValue = changeEvent.target.value;
		changeEvent.target.parentNode.parentNode.dispatchEvent ( event );
		changeEvent.stopPropagation ();
	}

	/*
	--- myOnWheel function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnWheel ( wheelEvent ) {
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop += wheelEvent.deltaY * 10;
		}
		wheelEvent.stopPropagation ( );
	}

	/*
	--- removeAllItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveAllItems ( ) {
		for ( let ItemCounter = 0; ItemCounter < myItems.length; ItemCounter ++ ) {
			myContainer.removeChild ( myItems [ ItemCounter ] );
		}
		myItems.length = 0;
	}

	/*
	--- addItem function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddItem ( name, indexName, placeholder, dataObjId, isLastItem  ) {

		name = name || '';
		indexName = indexName || '';
		placeholder = placeholder || '';
		dataObjId = dataObjId || -1;

		let item = myHTMLElementsFactory.create ( 'div', { draggable : false, className : 'TravelNotes-SortableList-Item' } );

		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-SortableList-ItemTextIndex',
				innerHTML : indexName
			},
			item
		);
		let inputElement = myHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-SortableList-ItemInput',
				placeholder : placeholder,
				value : name
			},
			item
		);
		inputElement.addEventListener ( 'change', myOnChange, false );

		//Workaround for issue #8
		inputElement.addEventListener (
			'focus',
			event => {
				event.target.parentElement.draggable = false;
			},
			false
		);
		inputElement.addEventListener (
			'blur',
			event => {
				event.target.parentElement.draggable = event.target.parentElement.canDrag;
			},
			false
		);

		let upArrowButton = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-SortableList-ItemUpArrowButton',
				title : theTranslator.getText ( 'SortableList - Move up' ),
				innerHTML : String.fromCharCode ( 8679 )
			},
			item
		);
		upArrowButton.addEventListener ( 'click', myOnUpArrowButtonClick, false );
		let downArrowButton = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-SortableList-ItemDownArrowButton',
				title : theTranslator.getText ( 'SortableList - Move down' ),
				innerHTML : String.fromCharCode ( 8681 )
			},
			item
		);
		downArrowButton.addEventListener ( 'click', myOnDownArrowButtonClick, false );
		let rightArrowButton = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-SortableList-ItemRightArrowButton',
				title : theTranslator.getText ( 'SortableList - Edit' ),
				innerHTML : String.fromCharCode ( 8688 )
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
		item.dataObjId = dataObjId;

		item.canDrag = false;
		if ( ( ( 'LimitedSort' !== myOptions.listStyle ) || ( 1 < myItems.length ) ) && ( ! isLastItem  ) ) {
			item.draggable = true;
			item.addEventListener ( 'dragstart', myOnDragStart, false );
			item.classList.add ( 'TravelNotes-SortableList-MoveCursor' );
			item.canDrag = true;
		}

		myItems.push ( item );

		myContainer.appendChild ( item );
	}

	let myItems = [];

	// myOptions.listStyle = 'AllSort' : all items can be sorted or deleted
	// myOptions.listStyle = 'LimitedSort' : all items except first and last can be sorted or deleted

	let myOptions = { minSize : 2, listStyle : 'AllSort', id : 'TravelNotes-SortableList-Container' };
	for ( let option in options ) {
		myOptions [ option ] = options [ option ];
	}
	if ( ( 'LimitedSort' === myOptions.listStyle ) && ( 2 > myOptions.minSize ) ) {
		myOptions.minSize = 0;
	}
	let myContainer = myHTMLElementsFactory.create (
		'div',
		{
			id : myOptions.id,
			className : 'TravelNotes-SortableList-Container'
		}
	);
	myContainer.classList.add ( myOptions.listStyle );
	myContainer.addEventListener ( 'drop', myOnDrop, false );
	myContainer.addEventListener ( 'dragover', myOnDragOver, false );
	myContainer.addEventListener ( 'wheel', myOnWheel, false );

	if ( parentNode ) {
		parentNode.appendChild ( myContainer );
	}

	for ( let itemCounter = 0; itemCounter < myOptions.minSize; itemCounter++ ) {
		myAddItem ( );
	}

	/*
	--- SortableList object -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			removeAllItems : ( ) => myRemoveAllItems ( ),
			addItem :
				(
					name,
					indexName,
					placeholder,
					dataObjId,
					isLastItem ) => myAddItem ( name, indexName, placeholder, dataObjId, isLastItem ),
			get container ( ) { return myContainer; }
		}
	);

}

/*
--- End of SortableList.js file ---------------------------------------------------------------------------------------
*/