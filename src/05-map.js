import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 20, left: 150, right: 0, bottom: 0 }

let height = 600 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let colorScale = d3.scaleOrdinal()

let radiusScale = d3.scaleSqrt().range([0, 7])

let yPositionScale = d3.scaleBand().range([0, height - 100])

Promise.all([
  d3.json(require('./data/us_states.topojson')),
  d3.csv(require('./data/powerplants.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

let projection = d3.geoAlbersUsa()
let path = d3.geoPath().projection(projection)

function ready([json, powerplants]) {
  console.log(json)
  var states = topojson.feature(json, json.objects.us_states)


  // var sources = powerplants.map(d => d.PrimSource)
  // var uniqueSources = Array.from(new Set(sources))
  // console.log(uniqueSources)

  colorScale
    .domain([
      'hydroelectric',
      'coal',
      'nuclear',
      'natural gas',
      'petroleum',
      'wind',
      'solar',
      'other',
      'biomass',
      'geothermal',
      'pumped storage'
    ])
    .range([
      '#2C81C5',
      '#99979A',
      '#CF4A9B',
      '#EF8A33',
      '#E93F33',
      '#5CB44D',
      '#D7C944',
      '#CF4A9B',
      '#FDEFD6',
      '#EF8A33'
    ])
  var maxProd = d3.max(powerplants, d => d.Total_MW)
  radiusScale.domain([0, maxProd])

  var categories = colorScale.domain()

  yPositionScale.domain(categories)

  svg
    .selectAll('legend')
    .append('g')
    .data(categories)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${-100}, ${yPositionScale(d)})`)
    .each(function(d) {
      var g = d3.select(this)

      g.append('circle')
        .attr('r', 10)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('fill', d => colorScale(d))

      g.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .text(d => d.charAt(0).toUpperCase() + d.slice(1))
        .attr('dx', 15)
        .attr('dy', 5)
    })
  projection.fitSize([width, height], states)

  svg
  .append('g')
    .selectAll('.states')
    .data(states.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    // We need a PATH variable!
    .attr('d', path)
    .attr('stroke', 'white')
    .attr('stroke-width', 0.2)
    .attr('fill', '#E1E1E1')

  svg
    .selectAll('.stateText')
    .data(states.features)
    .enter()
    .append('text')
    .attr('x', function(d) {
      return path.centroid(d)[0]
    })
    .attr('y', function(d) {
      return path.centroid(d)[1]
    })
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .text(d => d.properties.abbrev)
    .style(
      'text-shadow',
      '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff'
    )
    .lower()

  svg
    .selectAll('.powerplants')
    .data(powerplants)
    .enter()
    .append('circle')
    .attr('class', 'powerplants')
    .attr('opacity', 0.4)
    .attr('r', d => radiusScale(d.Total_MW))
    .attr('fill', d => colorScale(d.PrimSource))
    .attr('transform', d => {
      let coords = projection([d.Longitude, d.Latitude])
      return `translate(${coords})`
    })


}
