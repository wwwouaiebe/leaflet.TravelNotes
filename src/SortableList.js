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
	
	/* 
	--- SortableList object -----------------------------------------------------------------------------
	
	------------------------------------------------------------------------------------------------------------------------
	*/
	
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

	var HTMLElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

	
	var SortableList = function ( options, Parent ) {

		
		this.addItem = function ( options ) {
	
			var ItemContainer = HTMLElementsFactory.create ( 'div', { draggable : options.sortable, className : 'SortableListItem' + ( options.sortable ? ' MoveCursor': '')  }, this.Container );
			if ( options.sortable ) {
				L.DomEvent.on ( ItemContainer, 'dragstart', onDragStart );
				//L.DomEvent.on ( ItemContainer, 'dragenter', onDragEnter );
				//L.DomEvent.on ( ItemContainer, 'dragleave', onDragLeave );
				//L.DomEvent.on ( ItemContainer, 'dragend', onDragEnd );
				
				HTMLElementsFactory.create ( 'span', { className : 'SortableListTextArrow', innerHTML : String.fromCharCode( 8645 ) }, ItemContainer );
			}
			else {
				HTMLElementsFactory.create ( 'span', { className : 'SortableListTextArrow', innerHTML : '&nbsp;' }, ItemContainer );
			}
			HTMLElementsFactory.create ( 'span', { className : 'SortableListTextIndex', innerHTML : options.text }, ItemContainer );
			HTMLElementsFactory.create ( 'input', { type : 'text', className : 'SortableListInput', placeholder : options.placeholder }, ItemContainer );
			if ( options.sortable ) {
				HTMLElementsFactory.create ( 'span', { className : 'SortableListDelButton', innerHTML : '&#x1f5d1;' }, ItemContainer );
			}
			
			
			this.items [ this.size ] = ItemContainer;
			this.size ++;
		};
		
		this.setOptions = function ( options ) {
			for ( var option in options ) {
				this.options [ option ] = options [ option ];
			}
		};
		
		this.initialize = function ( options, Parent ) {
			this.options = { minSize : 2, listType : 0, placeholder : '', placeholders : [] , texts : [] } ;
			this.setOptions (options );
			this.size = 0;
			this.items = [];
			this.Container = HTMLElementsFactory.create ( 'div', { className : 'SortableListContainer' } );


			
			if ( Parent ) {
				Parent.appendChild ( this.Container );
				L.DomEvent.on ( Parent, 'dragover', onDragOver );
				L.DomEvent.on ( Parent, 'drop', onDrop );
			}
			for ( var ItemCounter = 0; ItemCounter < this.options.minSize; ItemCounter++ )
			{
				var itemOptions = { sortable : true , placeholder : this.options.placeholder, text : ''};
				itemOptions.sortable = true;
				if ( 1 === this.options.listType ) {
					if ( 0 === ItemCounter ) {
						itemOptions = { sortable : false , placeholder : this.options.placeholders [ 0 ], text : this.options.texts [ 0 ]};
					}
					else if ( ItemCounter === this.options.minSize - 1 )
					{
						itemOptions = { sortable : false , placeholder : this.options.placeholders [ 2 ], text : this.options.texts [ 2 ]};
					}
					else
					{
						itemOptions = { sortable : true , placeholder : this.options.placeholders [ 1 ], text : ItemCounter };
					}
				}
				this.addItem ( itemOptions );
			}
		};
		
		this.initialize ( options, Parent );
		
	};

	var sortableList = function ( options, Parent ) {
		return new SortableList ( options, Parent );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = sortableList;
	}

}());
