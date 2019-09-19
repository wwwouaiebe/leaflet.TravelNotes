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
--- TaskLoader.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the TaskLoader object
	- the module.exports implementation
Notice:
	why doing simple when you can do it complex?	
Changes:
	- v1.3.0:
		- Created

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var TaskLoader = function ( ) {
		
		var _Tasks = [];
		var _TaskPointer = 0;
		var _TaskStatus = require ( './TaskStatus' ) ( ).taskStatus;

		/*
		--- _LoadJsonFile function ------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var _LoadJsonFile = function ( taskLoader, task )
		{
			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = 5000;
			
			xmlHttpRequest.ontimeout = function ( event ) {
				task.response = { status : 1 , statusText : 'xmlHttpRequest.timeout error'};
				task.status = _TaskStatus.FINISH_NOK;
				taskLoader.endTask ( task );
			};
			
			xmlHttpRequest.onreadystatechange = function ( ) {
				if ( xmlHttpRequest.readyState === 4 ) {
					if ( xmlHttpRequest.status === 200 ) {
						try {
							task.response = JSON.parse ( xmlHttpRequest.responseText );
							task.status = _TaskStatus.FINISH_OK;
						}
						catch ( e ) {
							task.response = { status : 2 , statusText : 'JSON parsing error'};
							task.status = _TaskStatus.FINISH_NOK;
						}
						taskLoader.endTask ( task );
					}
					else {
						task.response = { status : this.status, statusText : this.statusText };
						task.status = _TaskStatus.FINISH_NOK;
						taskLoader.endTask ( task );
					}
				}
			};
			
			xmlHttpRequest.open ( 
				"GET", 
				task.func.call ( task.context ), 
				true );
			xmlHttpRequest.overrideMimeType ( 'application/json' );
			xmlHttpRequest.send ( null );
		};
		
		/*
		--- End of _LoadJsonFile function ---
		*/

		/*
		--- _ShowDialog function --------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var _ShowDialog = function ( taskLoader, task ) {
			var responses = [];
			// responses from previous tasks are added to the params if needed
			if ( task.useResponses ) {
				task.useResponses.forEach (
					function ( useResponse ) {
						responses.push ( _Tasks [ useResponse ].response );
					}
				);
			}
			task.func.call ( task.context, taskLoader, task, responses );
		};

		/*
		--- End of _ShowDialog function ---
		*/

		/*
		--- _Run function ---------------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var _Run = function ( task ) {
			var params = task.params || [ ];
			if ( task.useResponses ) {
				task.useResponses.forEach (
					function ( useResponse ) {
						params.push ( _Tasks [ useResponse ].response );
					}
				);
			}
			task.response = task.func.call ( task.context, params );
			task.status = _TaskStatus.FINISH_OK;
		};

		/*
		--- End of _Run function ---
		*/
							
		/*
		--- taskLoader object -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			
			start : function ( tasks ) {
				_Tasks = tasks;
				var taskNumber = 0;
				_Tasks.forEach ( 
					function ( task ) {
						task.status = _TaskStatus.READY;
						task.response = { status : 0 , statusText : 'Task not yet executed' };
						task.number = taskNumber ++;
					}
				);
				_TaskPointer = 0;
				this.taskRunner ( );
			},
			
			taskRunner : function ( ) {

				var wait = false;
				while (  ( ! wait ) && _TaskPointer < _Tasks.length   ) {
					var currentTask = _Tasks [ _TaskPointer];
					currentTask.status = _TaskStatus.STARTED;

					switch ( currentTask.task )
					{
						case 'loadJsonFile':
							_LoadJsonFile ( this, currentTask );
							_TaskPointer ++;
							break;
						case 'wait':
							this.endTask ( "", currentTask ); // calling endTask to avoid an infinite break if previous tasks are already finished
							wait = true;
							break;
						case 'showDialog' :
							_ShowDialog ( this, currentTask );
							_TaskPointer ++;
							break;
						case 'run' :
							_Run ( currentTask );
							_TaskPointer ++;
							break;
						default:
							_TaskPointer ++;
							break;
					}
				}
			},
			
			endTask : function ( finishedTask ) {

				if ( _TaskStatus.FINISH_NOK === finishedTask.status ) {
					// a task is not correctly executed...
					_Tasks.forEach (
						// ... all task responses are filled with the error
						function ( task ) {
							task.response = finishedTask.response;
						}
					);
					// the task pointer is set to the last task
					_TaskPointer = _Tasks.length - 1;
					// and this task is executed
					this.taskRunner ( );
					return;
				}
				
				var currentTask = _Tasks [ _TaskPointer ];
				if ( 'wait' === currentTask.task ) {
					// the TaskLoader is in 'wait' state. We look if the previous tasks are finished
					var previousTasksFinished = true;
					for ( var taskCounter = 0; taskCounter < currentTask.number; taskCounter ++ )
					{
						previousTasksFinished &= ( _Tasks [ taskCounter ].status >= _TaskStatus.FINISH_OK );
					}
					if ( previousTasksFinished ) {
						// and we start eventually the next task
						currentTask.status = _TaskStatus.FINISH_OK;
						_TaskPointer ++;
						this.taskRunner ( );
					}
				}
			}
		};
	};
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = TaskLoader;
	}

}());

/*
--- End of TaskLoader.js file ----------------------------------------------------------------------------------------
*/