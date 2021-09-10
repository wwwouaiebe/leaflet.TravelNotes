# What to do if you wil change the application?

First, you need Node.js and a local web server installed on your computer. Having GitHub Desktop and a Git shell will also facilitate your life.

Then clone leaflet.TravelNotes in your GitHub repository and install it on your computer.

Open a Node.js command prompt or a Git shell and go to the directory where leaflet.TravelNote is installed and run __npm install leaflet.TravelNotes__. All the needed Node packages wil be installed.

From the Node.js command prompt or Git shell run:
- __grunt__ to verify the sources with eslint
- __grunt doc__ to build the technical documentation
- __grunt debug__ to build the application in debug mode
- __grunt release__ to build the application in debug and release mode and build the technical documentation

When running grunt in debug or release mode, the source files are verified with eslint and rollup. If an error is found, grunt is stopped and the build not executed, 
so you have to correct all the errors before you can run the application.

## What's the difference between debug and release modes?

In debug mode, the application is installed in the leaflet.TravelNotes/debug folder and uses directly the sources files as ES6 modules. that's the more easy way to develop and debug the application.

In release mode the application is installed in the leaflet.TravelNotes/dist folder and in the leaflet.TravelNotes/gh-page folder. The leaflet.TravelNotes/gh-page folder contains all the needed files
to run the application, included last version of leaflet. 

In release mode, all the js sources files are grouped in one big js file with rollup, the private fields and methods transformed in public fields and method for compatibility with old browsers,
and then this file is minified with terser, so the file is quite imposible to understand if an error occurs at the execution time.

# How the application works

## User actions

All user actions are based on events. 

The user do an action, mainly with the mouse on the screen and this action trigger an event. Events can be a right mouse click, a mouse move, a mouse over, a mouse wheel on an object on 
the map (notes, routes, waypoints) or on the user interface (UI), a drag and drop operation on the map or on the UI...

This event is captured by an event listener (one of the classes with the name finishing with __...EL__) and the event listener call a method, mainly in one of the global objects in the __core__ module / folder.

When the action is performed, the map and the UI have to be updated with the new/modifed/deleted data. So at the end of the procedure a new event is dispatched to the document with the data
( see the __coreLib/EventDispatcher.js__ file ). This second event is captured by an event listener on the document (see  __AppLoader.#addEventsListeners ( )__ method). This event listener call
the appropriate methods of the classes __MapEditor__ and __UI__ to update the map and the UI.

Seems to be simple, but remember that there are quite 200 event listeners in the app.

## Context menus

Some user actions are displaying a context menu. In that case the action is stopped till the user select something in the context menu and then the action selected in the context menu executed.

All the context menus are derived from the __BaseContextMenu__ class and are based on the Promise API.

## Dialogs

In the same way, some user actions are displaying a dialog. The action is suspended till the user click on the ok button and then restarted.

All dialogs are derived from the __BaseDialog__ class and are also based on the Promise API.

## Loading of the application

When the html page is loaded, some global objects are build (see in the technical documentation Global with name starting with __the...__).

Then the __AppLoader.loadApp ( )__ method is called from the file main.js. This method will first load all the json and csv files with the application configutation from the server.

When the configuration is completely launched, the method call:
- the __TravelNotes.addReadOnlyMap ( )__ method when a travel file name is given in the parameters of the url
- the __TravelNotes.addControl ( )__ method when no travel file name is given

## Classes, classes, classes....

Don't search. You will not find the __function__ keyword in the application. Everything is based on classes and objects!

Arrows functions only are used when Javascript expect a function (and arrows functions are usefull to preserve the value of the __this__ keyword).

And remember that event listeners can also be objects.