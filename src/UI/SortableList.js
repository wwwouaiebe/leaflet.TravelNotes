/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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
	- the SortableList object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20171001
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );

	var onDragStart = function  ( dragEvent ) {
		dragEvent.stopPropagation ( ); 
		try {
			dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.dataObjId );
			dragEvent.dataTransfer.dropEffect = "move";
		}
		catch ( e ) {
		}
	};
	
	var onDrop = function ( dragEvent ) { 
		dragEvent.preventDefault ( );
		var element = dragEvent.target;
		while ( ! element.dataObjId ) {
			element = element.parentElement;
		}
		var clientRect = element.getBoundingClientRect ( );
		var event = new Event ( 'SortableListDrop' );
		event.draggedObjId = parseInt ( dragEvent.dataTransfer.getData("Text") );
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
		console.log ( 'onChange' );
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
	--- SortableList object -------------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var SortableList = function ( options, parentNode ) {
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		this.items = [];
		
		/*
		--- removeAllItems method -------------------------------------------------------------------------------------
		This method ...
		---------------------------------------------------------------------------------------------------------------
		*/

		this.removeAllItems = function ( ) {
			for ( var ItemCounter = 0; ItemCounter < this.items.length; ItemCounter ++ ) {
				this.container.removeChild ( this.items [ ItemCounter ] );
			}
			this.items.length = 0;
		};
		
		/*
		--- addItem method --------------------------------------------------------------------------------------------
		This method ...
		---------------------------------------------------------------------------------------------------------------
		*/

		this.addItem = function ( name, indexName, placeholder, dataObjId, isLastItem  ) {
	
			name = name || '';
			indexName = indexName || '';
			placeholder = placeholder || '';
			dataObjId = dataObjId || -1;
			
			var item = htmlElementsFactory.create ( 'div', { draggable : false , className : 'TravelNotes-SortableList-Item' } );

			htmlElementsFactory.create ( 'div', { className : 'TravelNotes-SortableList-ItemTextIndex' , innerHTML : indexName }, item );
			var inputElement = htmlElementsFactory.create ( 'input', { type : 'text', className : 'TravelNotes-SortableList-ItemInput', placeholder : placeholder, value: name}, item );
			inputElement.addEventListener ( 'change' , onChange, false );
			var upArrowButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					className : 'TravelNotes-SortableList-ItemUpArrowButton', 
					title : _Translator.getText ('SortableList - Move up' ),
					innerHTML : String.fromCharCode( 8679 )
				}, 
				item
			);
			upArrowButton.addEventListener ( 'click', onUpArrowButtonClick, false );
			var downArrowButton = htmlElementsFactory.create (
				'div', 
				{ 
					className : 'TravelNotes-SortableList-ItemDownArrowButton', 
					title : _Translator.getText ('SortableList - Move down' ), 
					innerHTML : String.fromCharCode( 8681 ) 
				},
				item 
			);
			downArrowButton.addEventListener ( 'click', onDownArrowButtonClick, false );
			var rightArrowButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					className : 'TravelNotes-SortableList-ItemRightArrowButton', 
					title : _Translator.getText ('SortableList - Edit' ), 
					innerHTML : String.fromCharCode( 8688 ) 
				},
			item );
			if ( 'AllSort' === this.options.listStyle ) {
				rightArrowButton.addEventListener ( 'click', onRightArrowButtonClick, false );
			}
			var deleteButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					className : 'TravelNotes-SortableList-ItemDeleteButton', 
					title : _Translator.getText ('SortableList - Delete' ),
					innerHTML : '&#x267b;' 
				},
				item 
			);
			deleteButton.addEventListener ( 'click', onDeleteButtonClick, false );
			item.dataObjId = dataObjId; 

			this.items.push ( item );
/*
			if ( ( ( 'LimitedSort' !== this.options.listStyle ) || ( 1 < this.items.length ) ) && ( ! isLastItem  ) ){
				item.draggable = true;
				item.addEventListener ( 'dragstart', onDragStart, false );	
				item.classList.add ( 'TravelNotes-SortableList-MoveCursor' );
			}
*/	
			this.container.appendChild ( item );
		};
		
		/*
		--- _create method --------------------------------------------------------------------------------------------
		This method ...
		---------------------------------------------------------------------------------------------------------------
		*/

		this._create = function ( options, parentNode ) {

			// options
			
			// options.listStyle = 'AllSort' : all items can be sorted or deleted
			// options.listStyle = 'LimitedSort' : all items except first and last can be sorted or deleted
			
			this.options = { minSize : 2, listStyle : 'AllSort', id : 'TravelNotes-SortableList-Container' } ;
			for ( var option in options ) {
				this.options [ option ] = options [ option ];
			}
			if ( ( 'LimitedSort' === this.options.listStyle ) && ( 2 > this.options.minSize ) )
			{
				this.options.minSize = 0;
			}
			this.container = htmlElementsFactory.create ( 'div', { id : options.id, className : 'TravelNotes-SortableList-Container' } );
			this.container.classList.add ( this.options.listStyle );
			this.container.addEventListener ( 'drop', onDrop, false );
			this.container.addEventListener ( 'wheel', onWheel, false );

			if ( parentNode ) {
				parentNode.appendChild ( this.container );
			}
			
			for ( var itemCounter = 0; itemCounter < this.options.minSize; itemCounter++ )
			{
				this.addItem ( );
			}
		};
		
		this._create ( options, parentNode );
		
	};
	
	/* 
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	var sortableList = function ( options, parentNode ) {
		return new SortableList ( options, parentNode );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = sortableList;
	}

}());

/*
--- End of SortableList.js file ---------------------------------------------------------------------------------------
*/	
