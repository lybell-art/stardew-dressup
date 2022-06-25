import commonPlugins from "./rollup.plugins.js";
import {terser} from "rollup-plugin-terser";

export default {
	input: "src/App.jsx",
	output: {
		file: "dist/App.js",
		format: "esm",
		sourcemap: false
	},
	plugins: [
		...commonPlugins,
		terser()
	]
};