module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'browserify'],
    files: [
      './specs/**/*.js'
    ],
    exclude: [ ],
    preprocessors: {
      './specs/**/*.js': ['browserify']
    },
    browserify: {
      debug: true,
      transform: [],
      extensions: ['.js']
    },
    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    autoWatch: true,
    singleRun: false,
    concurrency: Infinity
  });
};
