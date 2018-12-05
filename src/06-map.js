import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 300 - margin.top - margin.bottom
let width = 330 - margin.left - margin.right

let container = d3.select('#chart-6')

let colorScale = d3.scaleOrdinal()

let radiusScale = d3.scaleSqrt().range([0, 0.3])

// let xPositionScale = d3.scaleBand().range([0, width - 100])

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

  var nested = d3
    .nest()
    .key(function(d) {
      return d.PrimSource
    })
    .entries(powerplants)

  container
    .selectAll('.map-powerplant')
    .data(nested)
    .enter()
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .each(function(d) {
      var g = d3.select(this)

      projection.fitSize([width, height], states)




      g.selectAll('.powerplants')
        .data(d.values)
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

              g.selectAll('.states')
        .data(states.features)
        .enter()
        .append('path')
        .attr('class', 'state')
        // We need a PATH variable!
        .attr('d', path)
        .attr('stroke', 'white')
        .attr('stroke-width', 0.2)
        .attr('fill', '#E1E1E1')
        .lower()

 g.append('g')
 .attr('transform', `translate(${width/2},${height/2})`)
    .datum(d.key)
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .text(d => d.charAt(0).toUpperCase() + d.slice(1))
    .style(
      'text-shadow',
      '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff'
    )
    .classed('text-source', true)
    .raise()




    


    })
}
