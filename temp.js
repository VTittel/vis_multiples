/* Sliders for dynamic queries */
const causes = ['wounds', 'other', 'disease']
const parseDate = d3.timeParse('%m/%Y')
const margin = { top: 10, right: 25, bottom: 15, left: 10 }
const widthVis2 = 550 - margin.left -margin.right
const heightVis2 = 550 - margin.top - margin.bottom

const x = d3.scaleBand()
    .rangeRound([0, widthVis2])

const y = d3.scaleLinear()
    .rangeRound([heightVis2, 0])

const z = d3.scaleOrdinal(d3.schemeCategory10)

const xAxis = d3.axisBottom()
    .scale(x)
    .tickFormat(d3.timeFormat('%b'))

const yAxis = d3.axisRight()
    .scale(y)

const svg2 = d3.select("#vis2 svg")
    .attr('widthVis2', widthVis2 + margin.left + margin.right)
    .attr('heightVis2', heightVis2 + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

const type = (d) => {
    d.date = parseDate(d.date)
    causes.forEach(c => {
        d[c] = +d[c]
    })
    return d
}


d3.tsv('data/crimea.tsv', type, (crimea) => {

    const layers = d3.stack()
        .keys(causes)
        (crimea);

    x.domain(layers[0].map(d => d.data.date));

    y.domain([0, d3.max(layers[layers.length - 1], d => (d[0] + d[1]) )]).nice();

    const layer = svg2.selectAll('layer')
        .data(layers)
        .enter()
        .append('g')
        .attr('class', 'layer')
        .style('fill', (d, i) => (z(i) ));

    layer.selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('x', d => x(d.data.date))
        .attr('y', d => y(d[0] + d[1]))
        .attr('height', d => y(d[0]) - y(d[1] + d[0]))
        .attr('width', x.bandwidth() - 1);

    svg2.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0,${heightVis2})`)
        .call(xAxis);

    svg2.append('g')
        .attr('class', 'axis axis--y')
        .attr('transform', `translate(${widthVis2},0)`)
        .attr("widthVis2", 100)
        .call(yAxis)
});
