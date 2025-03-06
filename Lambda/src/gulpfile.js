const gulp = require("gulp");
const ts = require("gulp-typescript");
const zip = require("gulp-zip");
const del = require("del");
const install = require("gulp-install");
const path = require("path");
const fs = require("fs-extra");

// Load TypeScript project config
const tsProject = ts.createProject("tsconfig.json");

// Define Lambda function files
const lambdaFunctions = ["insert", "delete", "create", "update"];

// Clean output directories
gulp.task("clean", function () {
    return del(["dist/**", "zips/**", "builds/**"]);
});

// Compile TypeScript files
gulp.task("compile", function () {
    return gulp.src("src/**/*.ts") // Adjust folder as needed
        .pipe(tsProject())
        .pipe(gulp.dest("dist"));
});

// Prepare individual builds for each function
gulp.task("package", async function () {
    await Promise.all(
        lambdaFunctions.map(async (func) => {
            const functionBuildPath = `builds/${func}`;

            // Ensure function build directory is clean
            await fs.remove(functionBuildPath);
            await fs.ensureDir(functionBuildPath);

            // Copy compiled JS file to the function's build directory
            await fs.copy(`dist/${func}.js`, `${functionBuildPath}/${func}.js`);

            // Copy package.json and package-lock.json
            await fs.copy("package.json", `${functionBuildPath}/package.json`);
            await fs.copy("package-lock.json", `${functionBuildPath}/package-lock.json`);

            // Install only necessary dependencies
            await new Promise((resolve) => {
                gulp.src(`${functionBuildPath}/package.json`)
                    .pipe(gulp.dest(functionBuildPath))
                    .pipe(install({ production: true })) // Installs only needed dependencies
                    .on("end", resolve);
            });

            // Zip the function
            return gulp.src(`${functionBuildPath}/**/*`, { base: functionBuildPath })
                .pipe(zip(`${func}.zip`))
                .pipe(gulp.dest("zips"));
        })
    );
});

// Main build task: Clean → Compile → Package
gulp.task("build", gulp.series("clean", "compile", "package"));
