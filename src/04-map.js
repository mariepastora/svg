import * as d3 from 'd3'
import * as turf from '@turf/turf'
import polylabel from 'polylabel'

var margin = { top: 0, left: 0, right: 0, bottom: 0 }
var height = 500 - margin.top - margin.bottom
var width = 700 - margin.left - margin.right

var svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

Promise.all([
  d3.xml(require('./data/cana.svg')),
  d3.csv(require('./data/wolves.csv'))
]).then(ready)

var colorScale = d3
  .scaleSequential(d3.interpolateYlGnBu)
  .clamp(true)
  .domain([0, 9000])

    var line = d3.line()
    var path = d3.geoPath()

function ready([hexFile, datapoints]) {
  // Get ready to process the hexagon svg file with D3
  let imported = d3.select(hexFile).select('svg')

  // Remove the stylesheets Illustrator saved
  imported.selectAll('style').remove()

  // Inject the imported svg's contents into our real svg
  svg.html(imported.html())

  // Loop through our csv, finding the g for each state.
  // Use d3 to attach the datapoint to the group.
  // e.g. d3.select("#" + d.abbr) => d3.select("#CA")
  datapoints.forEach(d => {
    svg
      .select('#' + d.abbreviation)
      .attr('class', 'hex-group')
      .each(function() {
        d3.select(this).datum(d)
      })
  })

  svg.selectAll('.hex-group').each(function(d) {
    var group = d3.select(this)
    group
      .selectAll('polygon')
      .attr('fill', colorScale(+d.wolves))
      .attr('opacity', 0.8)
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
  })

  svg.selectAll('.hex-group').each(function(d) {
    // Grab the current group...

          var group = d3.select(this)

          // Get each polygon (hexagon) inside of the group
          // Get the points attribute, looks like:
          // 176.6,57.1 176.6,30.2 153.3,16.7
          // Split on spaces, then commas
          // Add first coordinate to end of coordinate
          // list so it forms a closed shape
          // And then return GeoJSON polygons using turf

      var polygons = group
        .selectAll('polygon')
        .nodes()
        .map(function(node) {
          return node.getAttribute('points').trim()
        })
        .map(function(pointString) {
          var regex = /(([\d\.]+)[ ,]([\d\.]+))/g
          return pointString.match(regex).map(function(pair) {
            var coords = pair.split(/[ ,]/)
            return [+coords[0], +coords[1]]
          })
        })
        .map(function(coords) {
          coords.push(coords[0])
          return turf.polygon([coords])
        })

    //console.log(polygons)

    // Merge all of our hexagons into one big polygon

    var merged = turf.union(...polygons)

    // Add a new path for our outline
    // And use the geoPath with our
    // totally fake GeoJSON

    group
      .append('path')
      .datum(merged)
      .attr('class', 'outline')
      .attr('d', path)
      .attr('stroke', 'black')
      .attr('stroke-width', 3)
      .attr('fill', 'none')


      var center = polylabel(merged.geometry.coordinates)

      group.append('text')
            .attr('class', 'outline')
            .attr('transform', `translate(${center})`)
            .text(d.abbreviation)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('font-weight', 'bold')
            .attr('font-size', 16)
  })

  // var union = turf.union(poly1, poly2);
}
