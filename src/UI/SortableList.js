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

import { g_Translator } from '../UI/Translator.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/* 
--- newSortableList function ------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newSortableList ( options, parentNode ) {
	
	let m_DataObjId  = 0;
	
	let m_HTMLElementsFactory = newHTMLElementsFactory ( ) ;

	/*
	--- m_OnDragStart function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnDragStart ( dragEvent ) {
		dragEvent.stopPropagation ( ); 
		try {
			dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.dataObjId );
			dragEvent.dataTransfer.dropEffect = "move";
		}
		catch ( err ) {
			console.log ( err );
		}
		// for this #@!& MS Edge... don't remove - 1 otherwise crasy things comes in FF
		// MS Edge know the dataTransfer object, but the objects linked to the event are different in the drag event and the drop event
		m_DataObjId = dragEvent.target.dataObjId - 1;
	}

	/*
	--- m_OnDragOver function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnDragOver ( event ) {
		event.preventDefault ( );
	}

	/*
	--- m_OnDrop function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnDrop ( dragEvent ) { 
		dragEvent.preventDefault ( );
		let element = dragEvent.target;
		while ( ! element.dataObjId ) {
			element = element.parentElement;
		}
		let clientRect = element.getBoundingClientRect ( );
		let event = new Event ( 'SortableListDrop' );
		
		// for this #@!& MS Edge... don't remove + 1 otherwise crasy things comes in FF
		//event.draggedObjId = parseInt ( dragEvent.dataTransfer.getData("Text") );
		event.draggedObjId = m_DataObjId + 1;

		event.targetObjId = element.dataObjId;
		event.draggedBefore = ( dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY );
		element.parentNode.dispatchEvent ( event );
	}

	/*
	--- m_OnDeleteButtonClick function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnDeleteButtonClick ( ClickEvent ) {
		let event = new Event ( 'SortableListDelete' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation ();
	}

	/*
	--- m_OnUpArrowButtonClick function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnUpArrowButtonClick ( ClickEvent ) {
		let event = new Event ( 'SortableListUpArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation ();
	}

	/*
	--- m_OnDownArrowButtonClick function -----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnDownArrowButtonClick ( ClickEvent ) {
		let event = new Event ( 'SortableListDownArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation ();
	}

	/*
	--- m_OnRightArrowButtonClick function ----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnRightArrowButtonClick ( ClickEvent ) {
		let event = new Event ( 'SortableListRightArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation ();
	}

	/*
	--- m_OnChange function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnChange ( changeEvent ) {
		let event = new Event ( 'SortableListChange' );
		event.dataObjId = changeEvent.target.parentNode.dataObjId;
		event.changeValue = changeEvent.target.value;
		changeEvent.target.parentNode.parentNode.dispatchEvent ( event );
		changeEvent.stopPropagation ();
	}

	/*
	--- m_OnWheel function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnWheel ( wheelEvent ) { 
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop = wheelEvent.target.scrollTop + wheelEvent.deltaY * 10 ;
		}
		wheelEvent.stopPropagation ( );
	}
		
	/*
	--- removeAllItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_RemoveAllItems ( ) {
		for ( let ItemCounter = 0; ItemCounter < m_Items.length; ItemCounter ++ ) {
			m_Container.removeChild ( m_Items [ ItemCounter ] );
		}
		m_Items.length = 0;
	}
	
	/*
	--- addItem function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddItem ( name, indexName, placeholder, dataObjId, isLastItem  ) {

		name = name || '';
		indexName = indexName || '';
		placeholder = placeholder || '';
		dataObjId = dataObjId || -1;
		
		let item = m_HTMLElementsFactory.create ( 'div', { draggable : false, className : 'TravelNotes-SortableList-Item' } );

		m_HTMLElementsFactory.create ( 'div', { className : 'TravelNotes-SortableList-ItemTextIndex', innerHTML : indexName }, item );
		let inputElement = m_HTMLElementsFactory.create ( 'input', { type : 'text', className : 'TravelNotes-SortableList-ItemInput', placeholder : placeholder, value : name}, item );
		inputElement.addEventListener ( 'change', m_OnChange, false );

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
			
		let upArrowButton = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				className : 'TravelNotes-SortableList-ItemUpArrowButton', 
				title : g_Translator.getText ('SortableList - Move up' ),
				innerHTML : String.fromCharCode ( 8679 )
			}, 
			item
		);
		upArrowButton.addEventListener ( 'click', m_OnUpArrowButtonClick, false );
		let downArrowButton = m_HTMLElementsFactory.create (
			'div', 
			{ 
				className : 'TravelNotes-SortableList-ItemDownArrowButton', 
				title : g_Translator.getText ('SortableList - Move down' ), 
				innerHTML : String.fromCharCode ( 8681 ) 
			},
			item 
		);
		downArrowButton.addEventListener ( 'click', m_OnDownArrowButtonClick, false );
		let rightArrowButton = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				className : 'TravelNotes-SortableList-ItemRightArrowButton', 
				title : g_Translator.getText ('SortableList - Edit' ), 
				innerHTML : String.fromCharCode ( 8688 ) 
			},
			item );
		if ( 'AllSort' === m_Options.listStyle ) {
			rightArrowButton.addEventListener ( 'click', m_OnRightArrowButtonClick, false );
		}
		let deleteButton = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				className : 'TravelNotes-SortableList-ItemDeleteButton', 
				title : g_Translator.getText ('SortableList - Delete' ),
				innerHTML : '&#x267b;' 
			},
			item 
		);
		deleteButton.addEventListener ( 'click', m_OnDeleteButtonClick, false );
		item.dataObjId = dataObjId; 

		item.canDrag = false;
		if ( ( ( 'LimitedSort' !== m_Options.listStyle ) || ( 1 < m_Items.length ) ) && ( ! isLastItem  ) ){
			item.draggable = true;
			item.addEventListener ( 'dragstart', m_OnDragStart, false );	
			item.classList.add ( 'TravelNotes-SortableList-MoveCursor' );
			item.canDrag = true;
		}
		
		m_Items.push ( item );

		m_Container.appendChild ( item );
	}
		
	let m_Items = [];
	
	// m_Options.listStyle = 'AllSort' : all items can be sorted or deleted
	// m_Options.listStyle = 'LimitedSort' : all items except first and last can be sorted or deleted
	
	let m_Options = { minSize : 2, listStyle : 'AllSort', id : 'TravelNotes-SortableList-Container' } ;
	for ( let option in options ) {
		m_Options [ option ] = options [ option ];
	}
	if ( ( 'LimitedSort' === m_Options.listStyle ) && ( 2 > m_Options.minSize ) ) {
		m_Options.minSize = 0;
	}
	let m_Container = m_HTMLElementsFactory.create ( 'div', { id : m_Options.id, className : 'TravelNotes-SortableList-Container' } );
	m_Container.classList.add ( m_Options.listStyle );
	m_Container.addEventListener ( 'drop', m_OnDrop, false );
	m_Container.addEventListener ( 'dragover', m_OnDragOver, false );
	m_Container.addEventListener ( 'wheel', m_OnWheel, false );

	if ( parentNode ) {
		parentNode.appendChild ( m_Container );
	}
	
	for ( let itemCounter = 0; itemCounter < m_Options.minSize; itemCounter++ ) {
		m_AddItem ( );
	}
	
	/*
	--- SortableList object -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			removeAllItems : ( ) => m_RemoveAllItems ( ),
			addItem : ( name, indexName, placeholder, dataObjId, isLastItem ) => m_AddItem ( name, indexName, placeholder, dataObjId, isLastItem  ),
			get container ( ) { return m_Container; }
		}
	);
	
}

/*
--- End of SortableList.js file ---------------------------------------------------------------------------------------
*/	