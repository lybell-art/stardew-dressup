import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import babelrc from './.babelrc.json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

export default {
	input: "src/App.jsx",
	output: {
		file: "dist/App.js",
		format: "esm",
		sourcemap: true
	},
	plugins: [
		json(),
		nodeResolve({browser:true, extensions:[".js"], preferBuiltins: false}),
		replace({
			preventAssignment: true,
			'process.env.NODE_ENV': JSON.stringify('development')
		}),
		babel({
			babelHelpers:'bundled',
			babelrc: false,
			exclude:'node_modules/**',
			...babelrc,
		}),
		commonjs(),
		serve({
			open: true,
			openPage : "/index.html",
			verbose: true,
			contentBase: "",
			host: "localhost",
			port: 3000
		}),
		livereload({ watch: "dist" })
	]
}