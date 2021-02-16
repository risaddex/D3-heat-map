//! CONSTS
const width = window.screen.availWidth
const height = window.screen.availHeight * 0.75;
const padding = 60;

const gridSize = Math.floor(width - padding / 26)
const barHeight = (height - 2 * padding) / 12;
const barWidth = (width - padding) / 265;


//! SVG
const svg =
  d3.select('.chart-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
let dataset

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json',
  (e, json) => {
  dataset = json.monthlyVariance.map((item,i) => item);

  //! SCALES
  const xScale =
    d3.scaleLinear()
      .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)])
      .range([padding, width - padding]);

  const yScale =
    d3.scaleLinear()
      .domain([d3.min(dataset, d => new Date(2000, 0, 10)), d3.max(dataset, d => new Date(2000, 11, 10))])
      .range([height - padding, padding]);
  
  const colorScale = 
    d3.scaleLinear()
    .domain(d3.extent(dataset,d => d.variance))
    .range([0, 1])

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
  // const tooltip = d3.select('.chart-container')
  //   .append('div')
  //   .attr('id', 'tooltip')
  //   .style('opacity', 0);

  //! AXIS CALLS

  const mainXaxis = svg
    .append('g')
    .attr("transform", `translate(0,${height - padding})`)
    .attr('id', 'x-axis')
    .call(xAxis);

  const mainYaxis = svg
    .append('g')
    .attr("transform", `translate(${padding}, 0)`)
    .attr('id', 'y-axis')
    .call(yAxis);

  // !DOTS
  const rect = mainYaxis
    .selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('x', (d) => xScale(d.year) - padding)
    .attr('y', (d) => d.month * barHeight)
    .attr('width', barWidth)
    .attr('height',barHeight)
    .attr('class', 'cell')
    .attr('fill', (d) => d3.interpolateRdYlGn(colorScale(d.variance)))
    .attr('data-month', (d) => d.month -1)
    .attr('data-year', (d) => d.year)
    .attr('data-temp', (d) => json.baseTemperature + d.variance)
    


  //   .on('mouseover', (d) => {
  //     tooltip
  //       .transition()
  //       .duration(200)
  //       .style('opacity', .9)
  //       .attr('data-year', d.Year)
  //     tooltip
  //       .html(`
  //         <p>
  //           <strong>Name</strong>: ${d.Name}<br />
  //           <strong>Time</strong>: ${d.Time}<br />
  //           <strong>Year</strong>: ${d.Year}<br />
  //           ${
  //             d.Doping
  //               ? `<br />
  //                 ${d.Doping}
  //               `
  //               : ''
  //             }
  //         </p>
          
  //       `)
  //       .style('left', `${d3.event.screenX - padding}px`)
  //       .style('top', `${d3.event.clientY - padding * 2}px`)
  //   })
  //   .on('mouseout', () => {
  //     tooltip
  //       .transition()
  //       .duration(200)
  //       .style('opacity', 0)
  //   })
});


    