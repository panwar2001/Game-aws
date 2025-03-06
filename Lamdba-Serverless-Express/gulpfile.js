const gulp = require("gulp");
const del = require("del");
const fs = require("fs-extra");
const zip = require("gulp-zip");
const esbuild = require("gulp-esbuild");

// Define Lambda function names
const lambdaFunctions = ["insert-data", "delete-data", "get-all-data", "update-data"];

// Clean output directories
gulp.task("clean", function () {
    return del.deleteAsync(["zips/**", "build/**"]);
});

// Bundle TypeScript files using esbuild
gulp.task("bundle", function () {
    return gulp.src("src/**/*.ts") // Adjust the source path as needed
        .pipe(esbuild({
            bundle: true,
            platform: "node",
            target: "node22", // Adjust based on your Node.js version
            minify: true, // Minifies the output
            define: {
                "process.env.NODE_ENV": "'production'", // Set the NODE_ENV to 'production'
                "process.env.TABLE_NAME":"'score'"
            },
            sourcemap: false, // Disable sourcemaps for production (optional)
        }))
        .pipe(gulp.dest("build"));
});

// Zip the packaged functions
gulp.task("zip_packages", async () => {
    const tasks = lambdaFunctions.map((func) => {
        const functionBuildPath = `build/handlers/${func}`;
        return gulp.src(`${functionBuildPath}.js`)
            .pipe(zip(`${func}.zip`))
            .pipe(gulp.dest("zips"));
    });

    return Promise.all(tasks); // Ensure Gulp waits for all tasks
});

// Main build task: Clean → Bundle → Package → Zip
const build = gulp.series("clean", "bundle","zip_packages");
gulp.task("default", build);
