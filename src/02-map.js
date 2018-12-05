import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 20, right: 20, bottom: 0 }

let height = 400 - margin.top - margin.bottom

let width = 700 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

Promise.all([
  d3.json(require('./data/world.topojson')),
    d3.csv(require('./data/airport-codes-subset.csv')),
  d3.csv(require('./data/airline.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

let projection = d3.geoEqualEarth()
//.rotate([40.7128, -74.0060])

//let graticule = d3.geoGraticule()

let colorScale = d3.scaleSequential(d3.interpolateCool).clamp(true)

// Feed the projecttion to a geoPath generator
let path = d3.geoPath().projection(projection)

let coordinateStore = d3.map()


function ready([json, airports, flights]) {

	  airports.forEach(d => {
    let name = d.iata_code
    let coords = [d.longitude, d.latitude]
    coordinateStore.set(name, coords)
  })

  var countries = topojson.feature(json, json.objects.countries)

projection.fitSize([width, height], countries)
  // projection.fitSize([width, height], countries)

    svg.append('path')  
      .datum({type: 'Sphere'})
      .attr('d', path)
      .attr('fill', 'lightblue')
      .attr('stroke', 'grey')
      .attr('stroke-width', 'black')

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
    .attr('fill', 'grey')

  svg
    .selectAll('.airports')
    .data(airports)
    .enter()
    .append('circle')
    .attr('class', 'cities')
    .attr('r', 2)
    .attr('fill', "white")
    .attr('transform', d => {
      let coords = projection([d.longitude, d.latitude])
      return `translate(${coords})`
    })

  svg.selectAll('.transit')
    .data(flights)
    .enter().append('path')
    .attr('d', d => {
      // What is the 'from' city?
      // Get the coordinates based on that city's name

      // Pull out our coordinates
      let fromCoords = [-73.7781, 40.6413] 
      let toCoords = coordinateStore.get(d.Prefix)

      // Build a GeoJSON LineString
      var geoLine = {
        type: 'LineString',
        coordinates: [fromCoords, toCoords]
      }

      // Feed that to our d3.geoPath()
      return path(geoLine)
    })
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
    .attr('opacity', 0.8)
    .attr('stroke-linecap', 'round')

}
