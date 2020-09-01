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
				  'tmp/TravelNotesRoadbook.min.js': ['src/roadbook/roadbook.js']				  
				}
			}
		},
		includes: {
			Polyline: {
				files: {
					'src/polyline/Polyline.js' : ['src/polyline/Polyline.template']
				}
			},
			Roadbook: {
				files: {
					'tmp/TravelNotesRoadbook.html' : ['src/html/TravelNotesRoadbook.html']
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
			TravelNotes: {
				files: {
					'tmp/TravelNotes.min.css': [ 'src/**/*.css']
				}
			},
			Viewer: {
				files: {
					'tmp/TravelNotesViewer.min.css': [ 'src/css/Map.css', 'src/css/Notes.css', 'src/css/NotesIcons.css', 'src/css/Popup.css', 'src/UI/AttributionsUI.css', 'src/UI/ErrorsUI.css','src/UI/ViewerLayersToolbarUI.css' ]
				}
			},
			Roadbook: {
				files: {
					'tmp/TravelNotesRoadbook.min.css': [ 'src/dialogs/ProfileWindow.css', 'src/css/NotesIcons.css', 'src/roadbook/Roadbook.css' ]
				}
			}
		},
		terser: {
			TravelNotes: {
				options: {
					mangle: true,
					output: {
						preamble: banner
					}
				},
				files: {
					'tmp/TravelNotes.min.js': ['tmp/TravelNotes.min.js']
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
					'tmp/TravelNotesViewer.min.js': ['tmp/TravelNotesViewer.min.js']
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
					'tmp/TravelNotesRoadbook.min.js': ['tmp/TravelNotesRoadbook.min.js']
				}
			},
		},
		copy: {
			dist: {
				files: [
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
						cwd: 'tmp/',
						src: ['TravelNotesRoadbook.html'],
						dest: 'dist/'
					},					
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.js'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.css'],
						dest: 'dist/'
					},
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
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesViewer.min.js'],
						dest: 'dist/viewer/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesViewer.min.css'],
						dest: 'dist/viewer/'
					}
				]
			},
			ghpage: {
				files: [
					{
						expand: true,
						cwd: 'src/cfg/',
						src: ['*.json', '*.csv'],
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
						cwd: 'tmp/',
						src: ['TravelNotesRoadbook.html'],
						dest: 'gh-page/'
					},					
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.js'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.css'],
						dest: 'gh-page/'
					},
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
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesViewer.min.js'],
						dest: 'gh-page/viewer/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesViewer.min.css'],
						dest: 'gh-page/viewer/'
					}
				]
			},
			debug: {
				files: [
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
						cwd: 'tmp/',
						src: ['TravelNotesRoadbook.html'],
						dest: 'debug/'
					},
					{
						expand: true,
						cwd: 'src/',
						src: ['**/*.js'],
						dest: 'debug/src/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.css'],
						dest: 'debug/'
					},
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
						cwd: 'src/',
						src: ['**/*.js'],
						dest: 'debug/viewer/src/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesViewer.min.css'],
						dest: 'debug/viewer/'
					},
				]
			},
			TravelNotesGuides: {
				files: [
					{
						expand: true,
						cwd: 'TravelNotesGuides/',
						src: ['**/*.*'],
						dest: 'gh-page/TravelNotesGuides/'
					},
					{
						expand: true,
						cwd: 'TechDoc/',
						src: ['**/*.*'],
						dest: 'gh-page/TechDoc/'
					}					
				]
			}
		},
		clean : ['tmp', 'src/polyline/Polyline.js', 'out' ],
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
	grunt.loadNpmTasks('grunt-includes');
	grunt.loadNpmTasks('grunt-terser');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.registerTask('doc', [ 'jsdoc' ]);
	grunt.registerTask('default', [ 'clean', 'eslint', 'includes:Polyline', 'rollup', 'stylelint','cssmin', 'includes:Roadbook', 'copy:debug', 'clean', 'jsdoc' ]);
	grunt.registerTask('release', [ 'clean', 'eslint', 'includes:Polyline', 'rollup', 'terser', 'stylelint', 'cssmin', 'includes:Roadbook', 'copy:dist', 'copy:ghpage', 'copy:TravelNotesGuides', 'clean', 'jsdoc' ]);
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
	console.log ( '\n                                     ' + grunt.config.data.pkg.name + ' - ' + grunt.config.data.pkg.version +' - build: '+ grunt.config.data.pkg.buildNumber + ' - ' + grunt.template.today("isoDateTime") +'\n' );
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
};