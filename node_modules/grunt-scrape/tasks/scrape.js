var grunt = require('grunt');
var _ = require('lodash');
var Scraper = require('node-scrape');
var Exporter = require('node-exporter');

module.exports = function(grunt) {

  grunt.registerMultiTask('scrape', 'Extract data from web pages.', function() {

    var config = this.data;

    _.each(config, function(param, key) {
      if (_.isFunction(param)) {
        config[key] = param();
      }
    });

    var done = this.async();

    grunt.verbose.writeln('[log] Scraping data from: ' + config.src + '');
    grunt.verbose.writeln('[log] Scraping data to: ' + config.dest);

    Scraper.scrape(config.src, config)
      .then(function(data) {
        Exporter.export(config.dest, data, config)
          .then(function(filepath) {
            grunt.log.ok('[ok] Successfully scraped data from: ' + config.src);
            grunt.log.ok('[ok] File was writen to: ' + filepath);
            done();
          })
          .catch(function(error) {
            grunt.log.error(error);
          });
      });
  });
};