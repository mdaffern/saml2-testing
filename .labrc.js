// Override-able with command-line args
module.exports = {
  parallel: true,
  paths: [
    './src/',
    './test/'
  ],
  reporter: 'console',
  shuffle: true,
  sourcemaps: true,
  leaks: false,
  timeout: 5000,
  transform: './node_modules/lab-transform-typescript',
  verbose: true
};
