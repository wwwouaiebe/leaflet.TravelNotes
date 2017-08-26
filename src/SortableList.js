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
		--- _setItemsClasses method --------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/
		
		this._setItemsClasses = function ( )
		{
			for ( var itemPosition = 0; itemPosition < this.items.length; itemPosition ++ ){
				
				var item = this.items [ itemPosition ];

				if ( item.classList.contains ( 'deleteBtn' ) ) {
					item.childNodes [ 2 ].removeEventListener ( 'click', onDeleteBtnClick, false );
				}
				if ( item.classList.contains ( 'upArrowBtn' ) ) {
					item.childNodes [ 3 ].removeEventListener ( 'click', onUpArrowBtnClick, false );
				}
				if ( item.classList.contains ( 'downArrowBtn' ) ) {
					item.childNodes [ 4 ].removeEventListener ( 'click', onDownArrowBtnClick, false );
				}
				if ( item.classList.contains ( 'rightArrowBtn' ) ) {
					item.childNodes [ 5 ].removeEventListener ( 'click', onRightArrowBtnClick, false );
				}

				var draggable = true;
				var deleteBtnClass = ' deleteBtn';
				var upArrowBtnClass = ' upArrowBtn';
				var downArrowBtnclass = ' downArrowBtn';
				var rightArrowBtnclass = ' rightArrowBtn';
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
					rightArrowBtnclass = '';
				}
				var className = 'SortableListItem' ;
				item.className = className + deleteBtnClass + upArrowBtnClass + downArrowBtnclass + rightArrowBtnclass + cursorClass ;

				if ( item.classList.contains ( 'deleteBtn' ) ) {
					item.childNodes [ 2 ].addEventListener ( 'click', onDeleteBtnClick, false );
				}
				if ( item.classList.contains ( 'upArrowBtn' ) ) {
					item.childNodes [ 3 ].addEventListener ( 'click', onUpArrowBtnClick, false );
				}
				if ( item.classList.contains ( 'downArrowBtn' ) ) {
					item.childNodes [ 4 ].addEventListener ( 'click', onDownArrowBtnClick, false );
				}
				if ( item.classList.contains ( 'rightArrowBtn' ) ) {
					item.childNodes [ 5 ].addEventListener ( 'click', onRightArrowBtnClick, false );
				}

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
		
		/*
		--- removeItem method --------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/
		
		this.removeItem = function ( ) {
			
			
			this._setItemsClasses ( );
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
			this._setItemsClasses ( );
		};
		
		/*
		--- addItem method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.addItem = function ( name, objId ) {
	
			name = name || '';
			objId = objId || -1;
			
			var ItemContainer = HTMLElementsFactory.create ( 'div', { draggable : false   }, this.Container );

			HTMLElementsFactory.create ( 'span', { className : 'SortableListTextIndex' }, ItemContainer );
			HTMLElementsFactory.create ( 'input', { type : 'text', className : 'SortableListInput', value: name}, ItemContainer );
			HTMLElementsFactory.create ( 'span', { className : 'SortableListDeleteBtn', innerHTML : '&#x1f5d1;' }, ItemContainer );
			HTMLElementsFactory.create ( 'span', { className : 'SortableListUpArrowBtn', innerHTML : String.fromCharCode( 8679 ) }, ItemContainer );
			HTMLElementsFactory.create ( 'span', { className : 'SortableListDownArrowBtn', innerHTML : String.fromCharCode( 8681 ) }, ItemContainer );
			if ( 0 === this.options.listType ) {
				HTMLElementsFactory.create ( 'span', { className : 'SortableListRightArrowBtn', innerHTML : String.fromCharCode( 8688 ) }, ItemContainer );
			}
			ItemContainer.dataObjId = objId; 
			ItemContainer.UIObjId = require ( './ObjId' ) ( );

			this.items.push ( ItemContainer );
			this._setItemsClasses ( );
					
			
			return ItemContainer.UIObjId;
		};
		
		
		/*
		--- _create method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

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
