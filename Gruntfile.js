module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		ts: {
			build: {
				src: ['src/**/*.ts'],
				out: 'kurahenPremium.user.js',
				options: {
					// 'es3' (default) | 'es5'
					target: 'es5',
					// true (default) | false
					sourceMap: false,
					// true (default) | false
					removeComments: false
				}
			}
		},
		concat: {
			build: {
				src: ['src/userscriptMetadata.txt', 'src/jshintSettings.txt', 'kurahenPremium.user.js'],
				dest: 'kurahenPremium.user.js'
			}
		},
		'string-replace': {
			version: {
				files: {
					'kurahenPremium.user.js': 'kurahenPremium.user.js'
				},
				options: {
					replacements: [
						{
							pattern: /{{ VERSION }}/g,
							replacement: '<%= pkg.version %>'
						}
					]
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-string-replace');

	grunt.registerTask('default', [
		'ts:build',
		'concat:build',
		'string-replace:version'
	]);
};
