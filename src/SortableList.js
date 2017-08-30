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
( function ( ){
	
	'use strict';
	
	
	var onDragStart = function  ( DragEvent ) {
		DragEvent.stopPropagation(); // needed to avoid map movements
		try {
			DragEvent.dataTransfer.setData ( 'Text', '1' );
		}
		catch ( e ) {
		}
		console.log ( 'onDragStart' );
	};
	
	var onDragOver = function ( DragEvent ) {
		DragEvent.preventDefault();
		console.log ( 'onDragOver' );
	};
	
	var onDrop = function ( DragEvent ) { 
		DragEvent.preventDefault();
		var data = DragEvent.dataTransfer.getData("Text");
		console.log ( 'onDrop' );
	};

	/*
	var onDragEnd = function ( DragEvent ) { 
		console.log ( 'onDragEnd' );
	};
	
	var onDragEnter = function ( DragEvent ) { 
		console.log ( 'onDragLeave' );
	};
	var onDragLeave = function ( DragEvent ) { 
		console.log ( 'onDragEnter' );
	};
	*/	
	
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
	
	/* 
	--- SortableList object --------------------------------------------------------------------------------------------------
	
	--------------------------------------------------------------------------------------------------------------------------
	*/

	var SortableList = function ( options, parentNode ) {
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		this.items = [];
		
		/*
		--- removeAllItems method ----------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.removeAllItems = function ( ) {
			for ( var ItemCounter = 0; ItemCounter < this.items.length; ItemCounter ++ ) {
				this.container.removeChild ( this.items [ ItemCounter ] );
			}
			this.items.length = 0;
		};
		
		/*
		--- addItem method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.addItem = function ( name, dataObjId, isLastItem ) {
	
			name = name || '';
			dataObjId = dataObjId || -1;
			
			var placeholder = '';
			if ( 1 === this.options.placeholders.length ) {
				placeholder = this.options.placeholders [ 0 ];
			}
			if ( 3 === this.options.placeholders.length ) {
				switch ( this.items.length ) {
					case 0:
					placeholder = this.options.placeholders [ 0 ];
					break;
					default:
					placeholder = this.options.placeholders [ 1 ];
					break;
				}
				if ( isLastItem ) {
					placeholder = this.options.placeholders [ 2 ];
				}
			}
			
			var indexName = '';
			if ( 1 === this.options.indexNames.length ) {
				indexName = this.options.indexNames [ 0 ];
			}
			if ( 3 === this.options.indexNames.length ) {
				switch ( this.items.length ) {
					case 0:
					indexName = this.options.indexNames [ 0 ];
					break;
					default:
					indexName = this.options.indexNames [ 1 ];
					break;
				}
				if ( isLastItem ) {
					indexName = this.options.indexNames [ 2 ];
				}
			}
			if ( 'index' === indexName )
			{
				indexName = this.items.length;
			}
			
			var item = htmlElementsFactory.create ( 'div', { draggable : false , className : 'SortableList-Item' } );

			htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemTextIndex' , innerHTML : indexName }, item );
			var inputElement = htmlElementsFactory.create ( 'input', { type : 'text', className : 'SortableList-ItemInput', placeholder : placeholder, value: name}, item );
			inputElement.addEventListener ( 'change' , onChange, false );
			var upArrowButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemUpArrowButton', title : 'Déplacer vers le haut', innerHTML : String.fromCharCode( 8679 ) }, item );
			upArrowButton.addEventListener ( 'click', onUpArrowButtonClick, false );
			var downArrowButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemDownArrowButton', title : 'Déplacer vers le bas', innerHTML : String.fromCharCode( 8681 ) }, item );
			downArrowButton.addEventListener ( 'click', onDownArrowButtonClick, false );
			if ( 'AllSort' === this.options.listStyle ) {
				var rightArrowButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemRightArrowButton', title : 'Éditer', innerHTML : String.fromCharCode( 8688 ) }, item );
				rightArrowButton.addEventListener ( 'click', onRightArrowButtonClick, false );
			}
			var deleteButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemDeleteButton', title : 'Supprimer', innerHTML : '&#x1f5d1;' }, item );
			deleteButton.addEventListener ( 'click', onDeleteButtonClick, false );
			item.dataObjId = dataObjId; 
			item.UIObjId = require ( './ObjId' ) ( );

			this.items.push ( item );

			if ( ( ( 'LimitedSort' !== this.options.listStyle ) || ( 1 < this.items.length ) ) && ( ! isLastItem  ) ){
				item.draggable = true;
				item.addEventListener ( 'dragstart', onDragStart, false );	
				item.classList.add ( 'SortableList-MoveCursor' );
			}
	
			this.container.appendChild ( item );
		};
		
		
		/*
		--- _create method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this._create = function ( options, parentNode ) {

			// options
			
			// options.listStyle = 'AllSort' : all items can be sorted or deleted
			// options.listStyle = 'LimitedSort' : all items except first and last can be sorted or deleted
			
			this.options = { minSize : 2, listStyle : 'AllSort', placeholders : [] , indexNames : [], id : 'SortableList-Container' } ;
			for ( var option in options ) {
				this.options [ option ] = options [ option ];
			}
			if ( ( 'LimitedSort' === this.options.listStyle ) && ( 2 > this.options.minSize ) )
			{
				this.options.minSize = 0;
			}
			this.container = htmlElementsFactory.create ( 'div', { id : options.id, className : 'SortableList-Container' } );
			this.container.classList.add ( this.options.listStyle );
			this.container.addEventListener ( 'dragover', onDragOver, false );
			this.container.addEventListener ( 'drop', onDrop, false );

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

	var sortableList = function ( options, parentNode ) {
		return new SortableList ( options, parentNode );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = sortableList;
	}

}());
