import * as d3 from 'd3'
import * as topojson from 'topojson'
import debounce from 'debounce'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 300 - margin.top - margin.bottom

let width = 400 - margin.left - margin.right

let svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoMercator()
let graticule = d3.geoGraticule()

// out geoPath needs a PROJECTION variable
let path = d3.geoPath().projection(projection)

let colorScale = d3
  .scaleSequential(d3.interpolateCool)
  .domain([0, 500000])
  .clamp(true)

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/world-cities.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  let countries = topojson.feature(json, json.objects.countries)

  svg
    .append('rect')
    .attr('class', 'background')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'black')

  svg
    .append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('stroke', 'gray')
    .attr('stroke-width', 0.5)

  svg
    .append('g')
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', 'slate')

  svg
    .append('g')
    .selectAll('.city')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'city')
    .attr('r', 0.75)
    .attr('transform', d => `translate(${projection([d.lng, d.lat])})`)
    .attr('fill', d => colorScale(d.population))

  function render() {
    // Get the widt of the <div> the svg is in - we're doing
    // parentNode twice because the 'svg' is actually the g + margin
    let newWidth = svg.node().parentNode.parentNode.offsetWidth
    let newHeight = (height / width) * newWidth

    // Resize the actual svg
    d3.select(svg.node().parentNode)
      .attr('height', newHeight)
      .attr('width', newWidth)

    // Fit the projection to the world, but zoom in a little more
    projection.fitSize([newWidth, newHeight], countries)
    projection.scale(projection.scale() * 1.5)

    // Now deal with everything that has a height
    svg.selectAll('.country').attr('d', path)
    svg
      .selectAll('.city')
      .attr('transform', d => `translate(${projection([d.lng, d.lat])})`)
    svg
      .select('.background')
      .attr('width', newWidth)
      .attr('height', newHeight)
      .attr('fill', 'black')
  }

  // Let's run this function when it's resized
  window.addEventListener('resize', debounce(render, 200))

  // I know we already drew it, let's resize based on what
  // we're currently at. If we were good and proper, we would
  // remove the .attr('d') and .attr('transform') from earlier
  render()
}