import { task, src, dest, series } from "gulp";
import { deleteAsync } from "del";
import zip from "gulp-zip";
import esbuild from "gulp-esbuild";
import rename from 'gulp-rename';
import fs from 'fs';
import path from 'path';


// Get handler file names 
const lambdaFunctions = fs.readdirSync('src/handlers')
                          .filter((file) => file.endsWith('.ts')) 
                          .map((file) =>  path.parse(file).name);  


// Clean output directories
task("clean", function () {
    return deleteAsync(["zips/**", "build/**"]);
});

// Bundle TypeScript files using esbuild
task("bundle", function () {
    return src("src/**/*.ts") // Adjust the source path as needed
        .pipe(esbuild({
            platform: "node",
            target: "node22", // Adjust based on your Node.js version
            sourcemap: false, // Disable sourcemaps for production (optional)
            format:'esm'
        }))
        .pipe(dest("build"));
});

// Zip the packaged functions
task("zip_packages", async () => {
    const tasks = lambdaFunctions.map((func) => {
        const functionBuildPath = `build/handlers/${func}`;
        return src(`${functionBuildPath}.js`)
            .pipe(rename('index.mjs'))
            .pipe(zip(`${func}.zip`))
            .pipe(dest("zips"));
    });

    return Promise.all(tasks); // Ensure Gulp waits for all tasks
});

// Main build task: Clean → Bundle → Package → Zip
const build = series("clean", "bundle","zip_packages");
task("default", build);
