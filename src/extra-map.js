import * as d3 from 'd3'
import * as turf from '@turf/turf'
import polylabel from 'polylabel'

var margin = { top: -20, left: -50, right: 0, bottom: 0 }
var height = 630 - margin.top - margin.bottom
var width = 1350 - margin.left - margin.right

var svg = d3
  .select('#chart-4')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

Promise.all([
  d3.xml(require('./data/city-01.svg')),
  d3.csv(require('./data/wolves.csv')),
]).then(ready)

var colorScale = d3
  .scaleSequential(d3.interpolateBuPu)
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
      .attr('stroke', 'white')
      .attr('opacity', 1)
      // .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .style('fill', colorScale(+d.wolves))
      .attr('class', d.abbreviation)
      .on('mouseover', function() {
        console.log(d)
        svg.selectAll(`.${d.abbreviation}`).attr('stroke', 'red')
          .style('cursor', 'pointer')

      })
      .on('click', function() {
        window.open(d.site, '_blank')
      })
      .on('mouseout', function(){
        svg.selectAll(`.${d.abbreviation}`).attr('stroke', 'white')
      })
  })

  svg.selectAll('.hex-group').each(function(d) {
    var group = d3.select(this)
    group
      .selectAll('polyline')
      .attr('stroke', 'white')
      .attr('opacity', 1)
      // .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('class', d.abbreviation)
      .attr('fill', colorScale(+d.wolves))
      .on('mouseover', function() {
        console.log(d)
        svg.selectAll(`.${d.abbreviation}`).attr('stroke', 'red')
          .style('cursor', 'pointer')
      })
      .on('click', function() {
        window.open(d.site, '_blank')
      })
      .on('mouseout', function(){
        svg.selectAll(`.${d.abbreviation}`).attr('stroke', 'white')
      })
  })

  svg.selectAll('.hex-group').each(function(d) {
    var group = d3.select(this)
    group
      .selectAll('line')
      .attr('stroke', 'white')
      .attr('opacity', 1)
      // .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('fill', 'white')
      .attr('class', d.abbreviation)
      .on('mouseover', function() {
        console.log(d)
        svg
          .selectAll(`.${d.abbreviation}`)
          .attr('stroke', 'red')
          .style('cursor', 'pointer')
      })
      .on('click', function() {
        window.open(d.site, '_blank')
      })
      .on('mouseout', function(){
        svg.selectAll(`.${d.abbreviation}`).attr('stroke', 'white')
      })
  })

  d3.selectAll('svg')
  .append('image')
//  .attr('d',path)
  .attr('xlink:href', require('./data/light-01.png'))
  .attr('class', 'pico')
  .attr('x', 815)
  .attr('y', 45)
  .attr('height', '100')
  .attr('width', '100')

  // var union = turf.union(poly1, poly2);
}
