//! CONSTS
const WIDTH = 1280
const HEIGHT = window.screen.availHeight * .85
const PADDING = 60;

const barHeight = Math.ceil(HEIGHT - 2 * PADDING) / 12 ;

const legendWidth = WIDTH / 3;
const legendHeight = HEIGHT * .1;



//! SVG
const svg =
  d3.select('.chart-container')
    .append('svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT);
    
let dataset

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json',
  (e, json) => {
  dataset = json.monthlyVariance.map((item,i) => item);

  const barWidth = (WIDTH - 2 * PADDING) / Math.ceil(dataset.length / 12);
    const MAX = d3.max(dataset, d => Math.abs(d.variance))
  //! SCALES
  const xScale = 
    d3.scaleLinear()
      .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)])
      .range([PADDING, WIDTH - PADDING])

  const yScale =
    d3.scaleTime()
      .domain([new Date(2020, 0, 1), new Date(2020, 11, 30)])
      .range([PADDING, HEIGHT - PADDING]);
  
  
  const colorScale = 
    d3.scaleLinear()
    .domain(d3.extent(dataset,d => d.variance))
    .range([1,0])


  // !AXIS FORMAT
  const xAxis =
    d3.axisBottom()
      .scale(xScale)
      .tickFormat(d3.format(""))
      .ticks(20);

  const yAxis =
    d3.axisLeft()
      .scale(yScale)
      .tickFormat(d3.timeFormat("%B"));

  // //! TOOLTIP
  const tooltip = d3.select('.chart-container')
    .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0);

  //! AXIS CALLS

  const mainXaxis = svg
    .append('g')
    .attr("transform", `translate(0,${HEIGHT - PADDING})`)
    .attr('id', 'x-axis')
    .call(xAxis);

  const mainYaxis = svg
    .append('g')
    .attr("transform", `translate(${PADDING}, 0)`)
    .attr('id', 'y-axis')
    .call(yAxis)


  // !DOTS
  const rect = mainYaxis
    .selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('x', (d) => xScale(d.year) - PADDING +1)
    .attr('y', (d) => yScale(new Date(2020, d.month - 1)) -2)
    // .attr("transform", `translate(0,${ -  padding})`)
    .attr('width', barWidth)
    .attr('height', barHeight)
    .attr('class', 'cell')
    .attr('fill', (d) => d3.interpolateRdYlBu(colorScale(d.variance)))
    .attr('data-month', (d) => d.month -1)
    .attr('data-year', (d) => d.year)
    .attr('data-temp', (d) => json.baseTemperature + d.variance)
    .on('mouseover', (d) => {
      let date = new Date(d.year, d.month -1, 12)
      tooltip
        .transition()
        .duration(200)
        .style('opacity', .9)
        .attr('data-year', d.year)
      tooltip
        .html(`
          <p>
            <strong>Date</strong>: ${d3.timeFormat('%Y - %B')(date)}<br />
            <strong>Temperature</strong>: ${d3.format('.1f')(json.baseTemperature + d.variance)}<br />
            <strong>Variance</strong>: ${d3.format('+.1f')(d.variance)}<br />
            ${
              d.Doping
                ? `<br />
                  ${d.Doping}
                `
                : ''
              }
          </p>
          
        `)
        .style('left', `${d3.event.screenX - PADDING}px`)
        .style('top', `${d3.event.clientY - PADDING * 2}px`)
    })
    .on('mouseout', () => {
      tooltip
        .transition()
        .duration(200)
        .style('opacity', 0)
    })

  const legendScaleX =
    d3.scaleLinear()
      .domain(d3.extent(dataset, (d) => (d.variance + json.baseTemperature)))
      .range([PADDING, legendWidth - PADDING]);

  const thresHold =
    d3.scaleThreshold()
      .domain([].concat(
          d3.schemeRdYlBu[11].map((item, i) => {
            let interval = (legendScaleX.domain()[1] - legendScaleX.domain()[0]) / d3.schemeRdYlBu[11].length;
            return legendScaleX.domain()[0] + i * interval;
          })
        )
      )
      .range(d3.schemeRdYlBu[11])
  
  const legendX =
    d3.axisBottom()
      .scale(legendScaleX)
      .tickFormat(d3.format(""))
      .tickValues(thresHold.domain())
      .tickSize(20,0)
      .tickFormat(d3.format('1.01f'))
      

  const legend = d3.select('#legend')
    .append('svg')
    .attr('height', legendHeight + PADDING )
    .attr('width', legendWidth + PADDING)
    .append('g')
    .call(legendX)
    
    

  legend
    .selectAll('rect')
    .data(thresHold.range().map((color) => {
      let d = thresHold.invertExtent(color);
      if (d[0] == null) {
        d[0] = legendScaleX.domain()[0];
      }
      if (d[1] == null) {
        d[1] = legendScaleX.domain()[1];
      }
      return d;
    }))
    .enter()
    .insert("rect")
    .attr('height', 20)
    .attr('x', (d) => legendScaleX(d[0]))
    .attr('width', (d) => legendScaleX(d[1]) - legendScaleX(d[0]))
    .attr('fill', (d) => thresHold(d[0]))
    .attr("transform", `translate(${15}, 0)`);
  
  legend
    .select('g')
    .attr("text-anchor", "middle")
});


    