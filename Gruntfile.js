module.exports = function(grunt) {
	let banner = 
		'/**\n * ' +
		'\n * @source: <%= pkg.sources %>\n * ' + 
		'\n * @licstart  The following is the entire license notice for the' +
		'\n * JavaScript code in this page.\n * \n * <%= pkg.name %> - version <%= pkg.version %>' + 
		'\n * Build <%= pkg.buildNumber %> - <%= grunt.template.today("isoDateTime") %> ' + 
		'\n * Copyright 2017 <%= grunt.template.today("yyyy") %> wwwouaiebe ' + 
		'\n * Contact: https://www.ouaie.be/' + 
		'\n * License: <%= pkg.license %>' +
		'\n * \n * The JavaScript code in this page is free software: you can' +
		'\n * redistribute it and/or modify it under the terms of the GNU' +
		'\n * General Public License (GNU GPL) as published by the Free Software' +
		'\n * Foundation, either version 3 of the License, or (at your option)' +
		'\n * any later version.  The code is distributed WITHOUT ANY WARRANTY;' +
		'\n * without even the implied warranty of MERCHANTABILITY or FITNESS' +
		'\n * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.' +
		'\n * \n * As additional permission under GNU GPL version 3 section 7, you' +
		'\n * may distribute non-source (e.g., minimized or compacted) forms of' +
		'\n * that code without the copy of the GNU GPL normally required by' +
		'\n * section 4, provided you include this license notice and a URL' +
		'\n * through which recipients can access the Corresponding Source.' +
		'\n * \n * @licend  The above is the entire license notice' +
		'\n * for the JavaScript code in this page.' +
		'\n * \n */\n\n';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		eslint: {
			options: {
				fix: true,
				configFile: '.eslintrc.json'
			},				
			target: ['src/**/*.js']
		},	
		rollup : {
			Default : {
				options : {
					format : 'iife'
				},
				files: {
				  'tmp/TravelNotes.min.js': ['src/main/main.js'],  
				  'tmp/TravelNotesViewer.min.js': ['src/main/mainViewer.js'],  
				  'tmp/TravelNotesRoadbook.min.js': ['src/roadbook/roadbook.js'],			  
				  'tmp/GraphHopperRouteProvider.min.js': ['src/routeProviders/GraphHopperRouteProvider.js'],			  
				  'tmp/MapboxRouteProvider.min.js': ['src/routeProviders/MapboxRouteProvider.js'],			  
				  'tmp/MapzenValhallaRouteProvider.min.js': ['src/routeProviders/MapzenValhallaRouteProvider.js'],			  
				  'tmp/OpenRouteServiceRouteProvider.min.js': ['src/routeProviders/OpenRouteServiceRouteProvider.js'],				  
				  'tmp/OsrmRouteProvider.min.js': ['src/routeProviders/OsrmRouteProvider.js'],				  
				  'tmp/PolylineRouteProvider.min.js': ['src/routeProviders/PolylineRouteProvider.js'],				  
				  'tmp/PublicTransportRouteProvider.min.js': ['src/routeProviders/PublicTransportRouteProvider.js']				  
				}
			}
		},
		stylelint: {
			 options: {
				 fix: true
			 },
			src: ['src/**/*.css']
		},		
		cssmin: {
			options: {
				mergeIntoShorthands: false,
				roundingPrecision: -1
			},
			release: {
				files: {
					'dist/TravelNotes.min.css': [ 'src/**/*.css'],
					'dist/viewer/TravelNotesViewer.min.css': [ 'src/css/Map.css', 'src/css/Notes.css', 'src/css/NotesIcons.css', 'src/css/Popup.css', 'src/UI/AttributionsUI.css', 'src/UI/ErrorsUI.css','src/UI/ViewerLayersToolbarUI.css' ],
					'dist/TravelNotesRoadbook.min.css': [ 'src/dialogs/ProfileWindow.css', 'src/css/Notes.css', 'src/css/NotesIcons.css', 'src/roadbook/Roadbook.css' ],
					'gh-page/TravelNotes.min.css': [ 'src/**/*.css'],
					'gh-page/viewer/TravelNotesViewer.min.css': [ 'src/css/Map.css', 'src/css/Notes.css', 'src/css/NotesIcons.css', 'src/css/Popup.css', 'src/UI/AttributionsUI.css', 'src/UI/ErrorsUI.css','src/UI/ViewerLayersToolbarUI.css' ],
					'gh-page/TravelNotesRoadbook.min.css': [ 'src/dialogs/ProfileWindow.css', 'src/css/Notes.css', 'src/css/NotesIcons.css', 'src/roadbook/Roadbook.css' ]
				}
			},
			debug: {
				files: {
					'debug/TravelNotes.min.css': [ 'src/**/*.css'],
					'debug/viewer/TravelNotesViewer.min.css': [ 'src/css/Map.css', 'src/css/Notes.css', 'src/css/NotesIcons.css', 'src/css/Popup.css', 'src/UI/AttributionsUI.css', 'src/UI/ErrorsUI.css','src/UI/ViewerLayersToolbarUI.css' ],
					'debug/TravelNotesRoadbook.min.css': [ 'src/dialogs/ProfileWindow.css', 'src/css/Notes.css', 'src/css/NotesIcons.css', 'src/roadbook/Roadbook.css' ]
				}
			}
		},
		terser: {
			// release only
			TravelNotes: {
				options: {
					mangle: true,
					output: {
						preamble: banner
					}
				},
				files: {
					'dist/TravelNotes.min.js': ['tmp/TravelNotes.min.js'],
					'dist/TravelNotesProviders/GraphHopperRouteProvider.min.js': ['tmp/GraphHopperRouteProvider.min.js'],			  
					'dist/TravelNotesProviders/MapboxRouteProvider.min.js': ['tmp/MapboxRouteProvider.min.js'],			  
					'dist/TravelNotesProviders/MapzenValhallaRouteProvider.min.js': ['tmp/MapzenValhallaRouteProvider.min.js'],			  
					'dist/TravelNotesProviders/OpenRouteServiceRouteProvider.min.js': ['tmp/OpenRouteServiceRouteProvider.min.js'],				  
					'dist/TravelNotesProviders/OsrmRouteProvider.min.js': ['tmp/OsrmRouteProvider.min.js'],				  
					'dist/TravelNotesProviders/PolylineRouteProvider.min.js': ['tmp/PolylineRouteProvider.min.js'],				  
					'dist/TravelNotesProviders/PublicTransportRouteProvider.min.js': ['tmp/PublicTransportRouteProvider.min.js'],
					'gh-page/TravelNotes.min.js': ['tmp/TravelNotes.min.js'],
					'gh-page/TravelNotesProviders/GraphHopperRouteProvider.min.js': ['tmp/GraphHopperRouteProvider.min.js'],			  
					'gh-page/TravelNotesProviders/MapboxRouteProvider.min.js': ['tmp/MapboxRouteProvider.min.js'],			  
					'gh-page/TravelNotesProviders/MapzenValhallaRouteProvider.min.js': ['tmp/MapzenValhallaRouteProvider.min.js'],			  
					'gh-page/TravelNotesProviders/OpenRouteServiceRouteProvider.min.js': ['tmp/OpenRouteServiceRouteProvider.min.js'],				  
					'gh-page/TravelNotesProviders/OsrmRouteProvider.min.js': ['tmp/OsrmRouteProvider.min.js'],				  
					'gh-page/TravelNotesProviders/PolylineRouteProvider.min.js': ['tmp/PolylineRouteProvider.min.js'],				  
					'gh-page/TravelNotesProviders/PublicTransportRouteProvider.min.js': ['tmp/PublicTransportRouteProvider.min.js']				  
				}
			},
			Viewer: {
				options: {
					mangle: true,
					output: {
						preamble: banner
					}
				},
				files: {
					'dist/viewer/TravelNotesViewer.min.js': ['tmp/TravelNotesViewer.min.js'],
					'gh-page/viewer/TravelNotesViewer.min.js': ['tmp/TravelNotesViewer.min.js']
				}
			},
			Roadbook: {
				options: {
					mangle: true,
					output: {
						preamble: banner
					}
				},
				files: {
					'dist/TravelNotesRoadbook.min.js': ['tmp/TravelNotesRoadbook.min.js'],
					'gh-page/TravelNotesRoadbook.min.js': ['tmp/TravelNotesRoadbook.min.js']
				}
			},
		},
		copy: {
			release: {
				// release only
				files: [
					// TravelNotes
					{
						expand: true,
						cwd: 'src/cfg/',
						src: ['*.json', '*.csv' ],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['index.html'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['TravelNotesRoadbook.html'],
						dest: 'dist/'
					},		
					// viewer
					{
						expand: true,
						cwd: 'src/cfg/',
						src: [ 'TravelNotesConfig.json', 'TravelNotesLayers.json' ],
						dest: 'dist/viewer/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'dist/viewer/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['TravelNotesViewer.html'],
						rename: function ( ){return 'dist/viewer/index.html';}
					},
					// osrmTextInstructions
					{
						expand: true,
						cwd: 'node_modules/osrm-text-instructions/languages/abbreviations/',
						src: ['en.json', 'fr.json'],
						dest: 'dist/TravelNotesProviders/languages/abbreviations/'
					},
					{
						expand: true,
						cwd: 'node_modules/osrm-text-instructions/languages/translations/',
						src: ['en.json', 'fr.json'],
						dest: 'dist/TravelNotesProviders/languages/instructions/'
					},
					{
						expand: true,
						cwd: 'node_modules/osrm-text-instructions/languages/grammar/',
						src: ['fr.json'],
						dest: 'dist/TravelNotesProviders/languages/grammars/'
					},
					// TravelNotes
					{
						expand: true,
						cwd: 'src/cfg/',
						src: ['*.json', '*.csv' ],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['index.html'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['TravelNotesRoadbook.html'],
						dest: 'gh-page/'
					},		
					// viewer
					{
						expand: true,
						cwd: 'src/cfg/',
						src: [ 'TravelNotesConfig.json', 'TravelNotesLayers.json' ],
						dest: 'gh-page/viewer/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'gh-page/viewer/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['TravelNotesViewer.html'],
						rename: function ( ){return 'gh-page/viewer/index.html';}
					},
					// guides
					{
						expand: true,
						cwd: 'TravelNotesGuides/',
						src: ['**/*.*'],
						dest: 'gh-page/TravelNotesGuides/'
					},
					// tech doc
					{
						expand: true,
						cwd: 'TechDoc/',
						src: ['**/*.*'],
						dest: 'gh-page/TechDoc/'
					},
					// leaflet
					{
						expand: true,
						cwd: 'node_modules/leaflet/dist/',
						src: ['leaflet.js', 'leaflet.css' ],
						dest: 'gh-page/leaflet/'
					},
					{
						expand: true,
						cwd: 'node_modules/leaflet/dist/images/',
						src: ['*.png' ],
						dest: 'gh-page/leaflet/images/'
					},
					// osrmTextInstructions
					{
						expand: true,
						cwd: 'node_modules/osrm-text-instructions/languages/abbreviations/',
						src: ['en.json', 'fr.json'],
						dest: 'gh-page/TravelNotesProviders/languages/abbreviations/'
					},
					{
						expand: true,
						cwd: 'node_modules/osrm-text-instructions/languages/translations/',
						src: ['en.json', 'fr.json'],
						dest: 'gh-page/TravelNotesProviders/languages/instructions/'
					},
					{
						expand: true,
						cwd: 'node_modules/osrm-text-instructions/languages/grammar/',
						src: ['fr.json'],
						dest: 'gh-page/TravelNotesProviders/languages/grammars/'
					}
				]
			},
			debug: {
				files: [
					// TravelNotes
					{
						expand: true,
						cwd: 'src/cfg/',
						src: ['*.json', '*.csv'],
						dest: 'debug/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'debug/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: 'indexDebug.html',
						rename: function ( ){return 'debug/index.html';}
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['TravelNotesRoadbook.html'],
						dest: 'debug/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesRoadbook.min.css'],
						dest: 'debug/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.css'],
						dest: 'debug/'
					},
					// Viewer
					{
						expand: true,
						cwd: 'src/cfg/',
						src: [ 'TravelNotesConfig.json', 'TravelNotesLayers.json' ],
						dest: 'debug/viewer/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'debug/viewer/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: 'TravelNotesViewerDebug.html',
						rename: function ( ){return 'debug/viewer/index.html';}
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesViewer.min.css'],
						dest: 'debug/viewer/'
					},
					// osrmTextInstructions
					{
						expand: true,
						cwd: 'node_modules/osrm-text-instructions/languages/abbreviations/',
						src: ['en.json', 'fr.json'],
						dest: 'debug/TravelNotesProviders/languages/abbreviations/'
					},
					{
						expand: true,
						cwd: 'node_modules/osrm-text-instructions/languages/translations/',
						src: ['en.json', 'fr.json'],
						dest: 'debug/TravelNotesProviders/languages/instructions/'
					},
					{
						expand: true,
						cwd: 'node_modules/osrm-text-instructions/languages/grammar/',
						src: ['fr.json'],
						dest: 'debug/TravelNotesProviders/languages/grammars/'
					}
				]
			}
		},
		clean: {
			  debug: ['debug', 'tmp', 'out'],
			  release: ['TechDoc', 'dist', 'gh-page', 'tmp', 'out'],
			  end: ['tmp', 'out' ]
		},
		jsdoc : {
			doc : {
				src: ['src/**/*.js'],
				options: {
					destination : 'TechDoc',
					configure : "JSDocConf/JSDocConf.json"
				}
			}
		}		
	});
	grunt.config.data.pkg.buildNumber = grunt.file.readJSON('buildNumber.json').buildNumber;
	grunt.config.data.pkg.buildNumber = ("00000" + ( Number.parseInt ( grunt.config.data.pkg.buildNumber ) + 1 )).substr ( -5, 5 ) ;
	grunt.file.write ( 'buildNumber.json', '{ "buildNumber" : "' + grunt.config.data.pkg.buildNumber + '"}'  );
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-rollup');
	grunt.loadNpmTasks('grunt-stylelint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-terser');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.registerTask('doc', [ 'jsdoc' ]);
	grunt.registerTask('default', [ 'clean:debug', 'eslint', 'rollup', 'stylelint','cssmin:debug', 'copy:debug', 'jsdoc','clean:end', ]);
	grunt.registerTask('release', [ 'clean:release', 'eslint', 'rollup', 'terser', 'stylelint', 'cssmin:release', 'jsdoc', 'copy:release', 'clean:end' ]);
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
	console.log ( '\n                                     ' + grunt.config.data.pkg.name + ' - ' + grunt.config.data.pkg.version +' - build: '+ grunt.config.data.pkg.buildNumber + ' - ' + grunt.template.today("isoDateTime") +'\n' );
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
};