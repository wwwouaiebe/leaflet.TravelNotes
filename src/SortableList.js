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
	
	var onDeleteBtnClick = function ( ClickEvent ) {
		
		console.log ( 'onDeleteBtnClick' );
		ClickEvent.stopPropagation();
	};
	
	var onUpArrowBtnClick = function ( ClickEvent ) {
		console.log ( 'onUpArrowBtnClick' );
		ClickEvent.stopPropagation();
	};
	
	var onDownArrowBtnClick = function ( ClickEvent ) {
		console.log ( 'onDownArrowBtnClick' );
		ClickEvent.stopPropagation();
	};
	
	var onRightArrowBtnClick = function ( ClickEvent ) {
		console.log ( 'onRightArrowBtnClick' );
		ClickEvent.stopPropagation();
	};

	
	/* 
	--- SortableList object --------------------------------------------------------------------------------------------------
	
	--------------------------------------------------------------------------------------------------------------------------
	*/

	var SortableList = function ( options, Parent ) {
		
		var HTMLElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		this.items = [];
		
		/*
		--- removeItem method --------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/
		
		this.removeItem = function ( ) {
		};
		
		/*
		--- removeAllItems method ----------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.removeAllItems = function ( ) {
			for ( var ItemCounter = 0; ItemCounter < this.items.length; ItemCounter ++ ) {
				this.Container.removeChild ( this.items [ ItemCounter ] );
			}
			this.items.length = 0;
		};
		
		/*
		--- moveItem method ----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.moveItem = function ( ) {
		};
		
		/*
		--- addItem method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.addItem = function ( name, dataObjId ) {
	
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
					case 1:
					placeholder = this.options.placeholders [ 2 ];
					break;
					default:
					placeholder = this.options.placeholders [ 1 ];
					break;
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
					case 1:
					indexName = this.options.indexNames [ 2 ];
					break;
					default:
					indexName = this.options.indexNames [ 1 ];
					break;
				}
			}
			if ( 'index' === indexName )
			{
				indexName = this.items.length - 1;
			}
			
			var Item = HTMLElementsFactory.create ( 'div', { draggable : false , className : 'SortableList-Item' } );

			HTMLElementsFactory.create ( 'span', { className : 'SortableList-ItemTextIndex' , innerHTML : indexName }, Item );
			HTMLElementsFactory.create ( 'input', { type : 'text', className : 'SortableList-ItemInput', placeholder : placeholder, value: name}, Item );
			var deleteBtn = HTMLElementsFactory.create ( 'span', { className : 'SortableList-ItemDeleteBtn', innerHTML : '&#x1f5d1;' }, Item );
			deleteBtn.addEventListener ( 'click', onDeleteBtnClick, false );
			var upArrowBtn = HTMLElementsFactory.create ( 'span', { className : 'SortableList-ItemUpArrowBtn', innerHTML : String.fromCharCode( 8679 ) }, Item );
			upArrowBtn.addEventListener ( 'click', onUpArrowBtnClick, false );
			var downArrowBtn = HTMLElementsFactory.create ( 'span', { className : 'SortableList-ItemDownArrowBtn', innerHTML : String.fromCharCode( 8681 ) }, Item );
			downArrowBtn.addEventListener ( 'click', onDownArrowBtnClick, false );
			if ( 'AllSort' === this.options.listStyle ) {
				var rightArrowBtn = HTMLElementsFactory.create ( 'span', { className : 'SortableList-ItemRightArrowBtn', innerHTML : String.fromCharCode( 8688 ) }, Item );
				rightArrowBtn.addEventListener ( 'click', onRightArrowBtnClick, false );
			}
			Item.dataObjId = dataObjId; 
			Item.UIObjId = require ( './ObjId' ) ( );

			this.items.push ( Item );
			
			var lastItem = null;
			if ( ( 'LimitedSort' === this.options.listStyle ) && ( 2 < this.items.length ) ){
				lastItem = this.items [ this.items.length - 2 ];
				this.items [ this.items.length - 2 ] = this.items [ this.items.length - 1 ];
				this.items [ this.items.length - 1 ] = lastItem;
			}
			if ( ( 'LimitedSort' !== this.options.listStyle ) || ( 2 < this.items.length ) ){
			{
				Item.draggable = true;
				Item.addEventListener ( 'dragstart', onDragStart, false );	
				Item.classList.add ( 'SortableList-MoveCursor' );
			}
	
			}
			if ( lastItem ) {
				this.Container.insertBefore ( Item, lastItem );
			}
			else
			{
				this.Container.appendChild ( Item );
			}
		};
		
		
		/*
		--- _create method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this._create = function ( options, Parent ) {

			// options
			
			// options.listStyle = 'AllSort' : all items can be sorted or deleted
			// options.listStyle = 'LimitedSort' : all items except first and last can be sorted or deleted
			
			this.options = { minSize : 2, listStyle : 'AllSort', placeholders : [] , indexNames : [] } ;
			for ( var option in options ) {
				this.options [ option ] = options [ option ];
			}
			if ( ( 'LimitedSort' === this.options.listStyle ) && ( 2 > this.options.minSize ) )
			{
				this.options.minSize = 2;
			}
			this.Container = HTMLElementsFactory.create ( 'div', { className : 'SortableList-Container' } );
			this.Container.classList.add ( this.options.listStyle );
			this.Container.addEventListener ( 'dragover', onDragOver, false );
			this.Container.addEventListener ( 'drop', onDrop, false );

			if ( Parent ) {
				Parent.appendChild ( this.Container );
			}
			
			for ( var ItemCounter = 0; ItemCounter < this.options.minSize; ItemCounter++ )
			{
				this.addItem ( );
			}
		};
		
		this._create ( options, Parent );
		
	};

	var sortableList = function ( options, Parent ) {
		return new SortableList ( options, Parent );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = sortableList;
	}

}());
