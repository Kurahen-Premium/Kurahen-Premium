module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		ts: {
			build: {
				src: ['src/**/*.ts'],
				out: 'out.js',
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
				src: ['src/header.txt', 'out.js'],
				dest: 'out.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', ['ts:build', 'concat:build']);
};
