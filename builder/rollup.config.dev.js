import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import commonPlugins from "./rollup.plugins.js";

export default {
	input: "src/App.jsx",
	
	output: {
		file: "dist/App_indev.js",
		format: "esm",
		sourcemap: true
	},
	plugins: [
		...commonPlugins,
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
};