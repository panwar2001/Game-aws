import { task, src, dest, series } from "gulp";
import { deleteAsync } from "del";
import zip from "gulp-zip";
import esbuild from "gulp-esbuild";
import rename from 'gulp-rename';
import fs from 'fs';
import path from 'path';
import tslint from 'gulp-tslint';

// Get handler file names 
const lambdaFunctions = fs.readdirSync('src')
                          .filter((file) => file.endsWith('.ts')) 
                          .map((file) =>  path.parse(file).name);  


// Clean output directories
task("clean", function () {
    return deleteAsync(["zip/**","undefined/**"]);
});

// Lint src folder and fix code
task('lint', async ()=> {
    console.log('Started code analysis');
    return src('src/**/*.ts').pipe(tslint({formatter: 'prose', fix:true}))
                      .pipe(tslint.report({emitError: false}))
                      .pipe(dest('src/'))
});


// Bundle TypeScript files using esbuild
task("bundle", async ()=> {
    return src("src/**/*.ts") 
        .pipe(esbuild({
            platform: "node",
            target: "node22",
            sourcemap: true, 
            format:'esm',
            bundle:true,
            external: [
                "@aws-sdk/client-dynamodb", // Exclude AWS SDK packages from the bundle
                "@aws-sdk/lib-dynamodb"    // Exclude AWS SDK lib packages from the bundle
            ],
            outExtension: {".js":".mjs"}
        }))
        .pipe(zip('src.zip'))
        .pipe(dest("zip"));
});


const build = series("clean", "bundle");
task("default", build);
