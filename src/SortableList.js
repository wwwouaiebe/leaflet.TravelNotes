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

	/* 
	--- SortableList object -----------------------------------------------------------------------------
	
	------------------------------------------------------------------------------------------------------------------------
	*/

	var SortableList = function ( options, Parent ) {
		
		var HTMLElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		this.items = [];
		
		this._setItemsClasses = function ( )
		{
			for ( var itemPosition = 0; itemPosition < this.items.length; itemPosition ++ ){
				var item = this.items [ itemPosition ];
				var draggable = true;
				var deleteBtnClass = ' deleteBtn';
				var upArrowBtnClass = ' upArrowBtn';
				var downArrowBtnclass = ' downArrowBtn';
				var cursorClass = ' moveCursor';
				var placeholder = '';
				var itemName = '';
				if ( 0 === this.options.listType ) {
					placeholder = this.options.placeholder;
					if ( 0 === itemPosition ) {
						upArrowBtnClass = ' noUpArrowBtn';
					}
					if ( this.items.length === itemPosition + 1 ) {
						downArrowBtnclass = ' noDownArrowBtn';
					}
				}
				else if ( 1 === this.options.listType ) {
					placeholder = this.options.placeholders [ 1];
					itemName = itemPosition;
					if ( 0 === itemPosition ) {
						draggable = false;
						deleteBtnClass = ' noDeleteBtn';
						upArrowBtnClass = ' noUpArrowBtn';
						downArrowBtnclass = ' noDownArrowBtn';
						cursorClass = '';
						placeholder = this.options.placeholders [ 0];
						itemName = this.options.texts [ 0 ];
					}
					if ( 1 === itemPosition ) {
						upArrowBtnClass = ' noUpArrowBtn';
					}
					if ( this.items.length - 2 === itemPosition ) {
						downArrowBtnclass = ' noDownArrowBtn';
					}
					if ( this.items.length - 1 === itemPosition ) {
						draggable = false;
						deleteBtnClass = ' noDeleteBtn';
						upArrowBtnClass = ' noUpArrowBtn';
						downArrowBtnclass = ' noDownArrowBtn';
						cursorClass = '';
						placeholder = this.options.placeholders [ 2];
						itemName = this.options.texts [ 2 ];
					}
				}
				var className = 'SortableListItem' ;
				item.className = className + deleteBtnClass + upArrowBtnClass + downArrowBtnclass + cursorClass ;
				if ( item.draggable ) {
					item.removeEventListener ( 'dragstart', onDragStart, false );	
				}
				item.draggable = draggable;
				if ( draggable ) {
					item.addEventListener ( 'dragstart', onDragStart, false );	
				}
				item.firstChild.innerHTML = itemName;
				item.firstChild.nextSibling.placeholder = placeholder;
			}
		};

		this.removeItem = function ( ) {
			this._setItemsClasses ( );
		};
		
		this.moveItem = function ( ) {
			this._setItemsClasses ( );
		};
		
		this.addItem = function ( ) {
	
			var ItemContainer = HTMLElementsFactory.create ( 'div', { draggable : false   }, this.Container );

			HTMLElementsFactory.create ( 'span', { className : 'SortableListTextIndex' }, ItemContainer );
			HTMLElementsFactory.create ( 'input', { type : 'text', className : 'SortableListInput'}, ItemContainer );
			HTMLElementsFactory.create ( 'span', { className : 'SortableListDeleteBtn', innerHTML : '&#x1f5d1;' }, ItemContainer );
			HTMLElementsFactory.create ( 'span', { className : 'SortableListUpArrowBtn', innerHTML : String.fromCharCode( 8679 ) }, ItemContainer );
			HTMLElementsFactory.create ( 'span', { className : 'SortableListDownArrowBtn', innerHTML : String.fromCharCode( 8681 ) }, ItemContainer );

						
			this.items.push ( ItemContainer );
			this._setItemsClasses ( );
		};
		
		this._create = function ( options, Parent ) {

			// options
			
			// options.listType = 0 : all items can be sorted or deleted
			// options.listType = 1 : all items except first and last can be sorted or deleted
			
			this.options = { minSize : 2, listType : 0, placeholder : '', placeholders : [] , texts : [] } ;
			for ( var option in options ) {
				this.options [ option ] = options [ option ];
			}
			this.Container = HTMLElementsFactory.create ( 'div', { className : 'SortableListContainer' } );
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
