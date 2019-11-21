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
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/
	
'use strict';

export { newSortableList };

import { g_Translator } from '../UI/Translator.js';

import { newHTMLElementsFactory } from '../UI/HTMLElementsFactory.js';

var _DataObjId  = 0;

var htmlElementsFactory = newHTMLElementsFactory ( ) ;

var onDragStart = function  ( dragEvent ) {
	dragEvent.stopPropagation ( ); 
	try {
		dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.dataObjId );
		dragEvent.dataTransfer.dropEffect = "move";
	}
	catch ( e ) {
		console.log ( e );
	}
	// for this #@!& MS Edge... don't remove - 1 otherwise crasy things comes in FF
	// MS Edge know the dataTransfer object, but the objects linked to the event are different in the drag event and the drop event
	_DataObjId = dragEvent.target.dataObjId - 1;
};

var onDragOver = function ( event ) {
	event.preventDefault ( );
};

var onDrop = function ( dragEvent ) { 
	dragEvent.preventDefault ( );
	var element = dragEvent.target;
	while ( ! element.dataObjId ) {
		element = element.parentElement;
	}
	var clientRect = element.getBoundingClientRect ( );
	var event = new Event ( 'SortableListDrop' );
	
	// for this #@!& MS Edge... don't remove + 1 otherwise crasy things comes in FF
	//event.draggedObjId = parseInt ( dragEvent.dataTransfer.getData("Text") );
	event.draggedObjId = _DataObjId + 1;

	event.targetObjId = element.dataObjId;
	event.draggedBefore = ( dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY );
	element.parentNode.dispatchEvent ( event );
};

var onDeleteButtonClick = function ( ClickEvent ) {
	var event = new Event ( 'SortableListDelete' );
	event.itemNode = ClickEvent.target.parentNode;
	ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
	ClickEvent.stopPropagation();
};

var onUpArrowButtonClick = function ( ClickEvent ) {
	var event = new Event ( 'SortableListUpArrow' );
	event.itemNode = ClickEvent.target.parentNode;
	ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
	ClickEvent.stopPropagation();
};

var onDownArrowButtonClick = function ( ClickEvent ) {
	var event = new Event ( 'SortableListDownArrow' );
	event.itemNode = ClickEvent.target.parentNode;
	ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
	ClickEvent.stopPropagation();
};

var onRightArrowButtonClick = function ( ClickEvent ) {
	var event = new Event ( 'SortableListRightArrow' );
	event.itemNode = ClickEvent.target.parentNode;
	ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
	ClickEvent.stopPropagation();
};

var onChange = function ( changeEvent ) {
	var event = new Event ( 'SortableListChange' );
	event.dataObjId = changeEvent.target.parentNode.dataObjId;
	event.changeValue = changeEvent.target.value;
	changeEvent.target.parentNode.parentNode.dispatchEvent ( event );
	changeEvent.stopPropagation();
};

var onWheel = function ( wheelEvent ) { 
	if ( wheelEvent.deltaY ) {
		wheelEvent.target.scrollTop = wheelEvent.target.scrollTop + wheelEvent.deltaY * 10 ;
	}
	wheelEvent.stopPropagation ( );
};
/* 
--- SortableList object -----------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

var SortableList = function ( options, parentNode ) {
	
	/*
	--- removeAllItems method -----------------------------------------------------------------------------------------
	This method ...
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_RemoveAllItems = function ( ) {
		for ( var ItemCounter = 0; ItemCounter < m_Items.length; ItemCounter ++ ) {
			m_Container.removeChild ( m_Items [ ItemCounter ] );
		}
		m_Items.length = 0;
	};
	
	/*
	--- addItem method ------------------------------------------------------------------------------------------------
	This method ...
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_AddItem = function ( name, indexName, placeholder, dataObjId, isLastItem  ) {

		name = name || '';
		indexName = indexName || '';
		placeholder = placeholder || '';
		dataObjId = dataObjId || -1;
		
		var item = htmlElementsFactory.create ( 'div', { draggable : false , className : 'TravelNotes-SortableList-Item' } );

		htmlElementsFactory.create ( 'div', { className : 'TravelNotes-SortableList-ItemTextIndex' , innerHTML : indexName }, item );
		var inputElement = htmlElementsFactory.create ( 'input', { type : 'text', className : 'TravelNotes-SortableList-ItemInput', placeholder : placeholder, value: name}, item );
		inputElement.addEventListener ( 'change' , onChange, false );

		//Workaround for issue #8
		inputElement.addEventListener ( 
			'focus',
			function ( event ) {
				event.target.parentElement.draggable = false;
			},
			false
		);
		inputElement.addEventListener ( 
			'blur',
			function ( event ) {
				event.target.parentElement.draggable = event.target.parentElement.canDrag;
			},
			false
		);
			
		var upArrowButton = htmlElementsFactory.create ( 
			'div', 
			{ 
				className : 'TravelNotes-SortableList-ItemUpArrowButton', 
				title : g_Translator.getText ('SortableList - Move up' ),
				innerHTML : String.fromCharCode( 8679 )
			}, 
			item
		);
		upArrowButton.addEventListener ( 'click', onUpArrowButtonClick, false );
		var downArrowButton = htmlElementsFactory.create (
			'div', 
			{ 
				className : 'TravelNotes-SortableList-ItemDownArrowButton', 
				title : g_Translator.getText ('SortableList - Move down' ), 
				innerHTML : String.fromCharCode( 8681 ) 
			},
			item 
		);
		downArrowButton.addEventListener ( 'click', onDownArrowButtonClick, false );
		var rightArrowButton = htmlElementsFactory.create ( 
			'div', 
			{ 
				className : 'TravelNotes-SortableList-ItemRightArrowButton', 
				title : g_Translator.getText ('SortableList - Edit' ), 
				innerHTML : String.fromCharCode( 8688 ) 
			},
		item );
		if ( 'AllSort' === m_Options.listStyle ) {
			rightArrowButton.addEventListener ( 'click', onRightArrowButtonClick, false );
		}
		var deleteButton = htmlElementsFactory.create ( 
			'div', 
			{ 
				className : 'TravelNotes-SortableList-ItemDeleteButton', 
				title : g_Translator.getText ('SortableList - Delete' ),
				innerHTML : '&#x267b;' 
			},
			item 
		);
		deleteButton.addEventListener ( 'click', onDeleteButtonClick, false );
		item.dataObjId = dataObjId; 

		item.canDrag = false;
		if ( ( ( 'LimitedSort' !== m_Options.listStyle ) || ( 1 < m_Items.length ) ) && ( ! isLastItem  ) ){
			item.draggable = true;
			item.addEventListener ( 'dragstart', onDragStart, false );	
			item.classList.add ( 'TravelNotes-SortableList-MoveCursor' );
			item.canDrag = true;
		}
		
		m_Items.push ( item );

		m_Container.appendChild ( item );
	};
		
	var m_Items = [];
	
	// m_Options.listStyle = 'AllSort' : all items can be sorted or deleted
	// m_Options.listStyle = 'LimitedSort' : all items except first and last can be sorted or deleted
	
	var m_Options = { minSize : 2, listStyle : 'AllSort', id : 'TravelNotes-SortableList-Container' } ;
	for ( var option in options ) {
		m_Options [ option ] = options [ option ];
	}
	if ( ( 'LimitedSort' === m_Options.listStyle ) && ( 2 > m_Options.minSize ) )
	{
		m_Options.minSize = 0;
	}
	var m_Container = htmlElementsFactory.create ( 'div', { id : m_Options.id, className : 'TravelNotes-SortableList-Container' } );
	m_Container.classList.add ( m_Options.listStyle );
	m_Container.addEventListener ( 'drop', onDrop, false );
	m_Container.addEventListener ( 'dragover', onDragOver, false );
	m_Container.addEventListener ( 'wheel', onWheel, false );

	if ( parentNode ) {
		parentNode.appendChild ( m_Container );
	}
	
	for ( var itemCounter = 0; itemCounter < m_Options.minSize; itemCounter++ )
	{
		m_AddItem ( );
	}
	
	return Object.seal (
		{
			removeAllItems : function ( ) { m_RemoveAllItems ( ) ;},
			addItem : function ( name, indexName, placeholder, dataObjId, isLastItem ) { m_AddItem ( name, indexName, placeholder, dataObjId, isLastItem  );},
			get container ( ) { return m_Container; }
		}
	);
	
};

var newSortableList = function ( options, parentNode ) {
	return SortableList ( options, parentNode );
};

/*
--- End of SortableList.js file ---------------------------------------------------------------------------------------
*/	
