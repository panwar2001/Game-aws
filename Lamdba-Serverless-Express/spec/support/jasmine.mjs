export default {
  spec_dir: "test",
  spec_files: [
    "get-all-data.[sS]pec.ts"
  ],
  helpers: [
     "node_modules/ts-node/register"
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    random: false,
    forbidDuplicateNames: true
  }
}
