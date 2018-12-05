import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .style('background-color', 'black')
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/world-cities.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

let projection = d3.geoMercator()

let graticule = d3.geoGraticule()

let colorScale = d3.scaleSequential(d3.interpolateCool).clamp(true)

// Feed the projecttion to a geoPath generator
let path = d3.geoPath().projection(projection)

function ready([json, cities]) {
  var countries = topojson.feature(json, json.objects.countries)

  //projection.fitSize([width, height], countries)

  svg
    .selectAll('.countries')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    // We need a PATH variable!
    .attr('d', path)
    .attr('stroke', 'white')
    .attr('stroke-width', 0.1)
    .attr('fill', 'black')

  svg
    .append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('stroke', 'lightgrey')
    .attr('opacity', 0.5)
    .lower()

  var minPop = d3.min(cities, d => +d.population)
  var maxPop = d3.max(cities, d => +d.population)
  colorScale.domain([0, 1000000])

  svg
    .selectAll('.cities')
    .data(cities)
    .enter()
    .append('circle')
    .attr('class', 'cities')
    .attr('r', 1)
    .attr('fill', d => colorScale(d.population))
    .attr('transform', d => {
      let coords = projection([d.lng, d.lat])
      return `translate(${coords})`
    })
}
