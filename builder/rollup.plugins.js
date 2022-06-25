import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import babelrc from './.babelrc.json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

export default [
	json(),
	nodeResolve({browser:true, extensions:[".js"], preferBuiltins: false}),
	replace({
		preventAssignment: true,
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
	}),
	babel({
		babelHelpers:'bundled',
		babelrc: false,
		exclude:'node_modules/**',
		...babelrc,
	}),
	commonjs()
]