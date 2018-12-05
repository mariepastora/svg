import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-4b')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let colorScale = d3.scaleOrdinal().domain(["clinton", "trump" ]).range(['#902952', '#316419'])

let opacityScale = d3.scaleLinear().range([0, 1])

d3.json(require('./data/counties_with_election_data.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

let projection = d3.geoAlbers()
let path = d3.geoPath().projection(projection)

function ready(json) {
  var counties = topojson.feature(json, json.objects.us_counties)
  opacityScale.domain([0, 50000]).clamp(true)

    svg
    .selectAll('.counties')
    .data(counties.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    // We need a PATH variable!
    .attr('d', path)
    .attr('stroke', 'white')
    .attr('stroke-width', 0.1)
    .attr('fill', function(d) {
    	var winner 
    	if (d.properties.trump /(d.properties.trump + d.properties.clinton) > 0.5){
    		winner = 'trump'
    	}
    	else{
    		winner = 'clinton'
    	}
      return colorScale(winner)
    })
    .attr('opacity', function(d) {
      return opacityScale(d.properties.trump + d.properties.clinton)
    })


}