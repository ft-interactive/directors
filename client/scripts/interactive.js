/* global d3, _, $ */

let dataset = [];

d3.queue()
	.defer(d3.csv, 'data/sortabletable.csv')
	.await(displayCharts);

function drawCategoryChart(categoryData, spreadsheetData, companyData) {
	const categoryName = categoryData.header;
	const chartTitle = categoryData.chartTitle;
	const categoryColumn = categoryData.column;
	const xAxisLabel = categoryData.xAxisLabel;

	console.log(companyData)

	const resultWrapper = d3.select('#result-wrapper');

	const resultContainer = resultWrapper.append('div')
		.attr('class', 'result-container')
		.attr('id', `result-${categoryName}`);

	resultContainer.append('div')
		.attr('class', 'result-header')
		.text(chartTitle);

	resultContainer.append('div')
		.attr('class', 'xAxisLabel')
		.text(xAxisLabel);

	const margins = {
		left: 20,
		right: 20,
		top: 40,
		bottom: 20,
	};

	const graphWidth = resultContainer.node().offsetWidth - margins.left - margins.right;
	const graphHeight = 200 - margins.top - margins.bottom;

	const resultChart = resultContainer.append('svg')
		.attr('class', 'result-chart-container')
		.attr('width', graphWidth + margins.left + margins.right)
		.attr('height', graphHeight + margins.top + margins.right);

	const annotationGroup = resultChart.append('g')
		.attr('width', graphWidth)
		.attr('height', graphHeight)
		.attr('transform', `translate(${margins.left},${margins.top})`)
		.attr('id', 'annotationLayer');

	const resultChartGroup = resultChart.append('g')
		.attr('width', graphWidth)
		.attr('height', graphHeight)
		.attr('transform', `translate(${margins.left},${margins.top})`)
		.attr('id', 'chartLayer');

	let data = _.pluck(spreadsheetData, categoryColumn);
	data = _.map(data, num => Number(num));

	const x = d3.scaleLinear()
		.domain(d3.extent(data))
		.rangeRound([0, graphWidth])
		.nice();

	const bins = d3.histogram()
		.domain(x.domain())
		.thresholds(9)(data);

	const xAxis = d3.axisBottom(x)
		.tickFormat((d, i) => {
			if (i % 2 === 0) {
				return d;
			}
		});

	const y = d3.scaleLinear()
		.domain([0, d3.max(bins, d => d.length)])
		.range([graphHeight, 0]);

	resultChartGroup.append('g')
		.attr('transform', `translate(0,${graphHeight})`)
		.call(xAxis);

	const bar = resultChartGroup.selectAll('.bar')
		.data(bins)
		.enter().append('g')
		.attr('class', 'bar')
		.attr('fill', d => {
			if (companyData && Number(companyData[categoryColumn]) > d.x0 && Number(companyData[categoryColumn]) <= d.x1) {
				return '#A5526A';
			}
			if (companyData && Number(companyData[categoryColumn]) === 0 && d.x0 === 0) {
				return '#A5526A';
			}
			return '#cec6b9';
		})
		.attr('transform', d => `translate(${x(d.x0)},${y(d.length)})`);

	bar.append('rect')
		.attr('x', 1)
		.attr('width', x(bins[0].x1) - x(bins[0].x0) - 1)
		.attr('height', d => graphHeight - y(d.length));

	annotationGroup.selectAll('text.bar-labels')
		.data(bins)
		.enter().append('text')
		.attr('class', 'bar-labels')
		.attr('y', -8)
		.text(d => {
			if (companyData && Number(companyData[categoryColumn]) > d.x0 && Number(companyData[categoryColumn]) <= d.x1) {
				return `${d3.format('.1f')(companyData[categoryColumn])}`;
			}
		})
		.attr('transform', d => `translate(${x(d.x0)},${y(d.length)})`);

	// lines to label sector and country
	annotationGroup.selectAll('line.bar-lines-vertical')
		.data([companyData[`industry${categoryName}`], companyData[`country${categoryName}`]])
		.enter().append('line')
		.attr('class', 'bar-lines bar-lines-vertical')
		.attr('x1', d => `${x(d)}`)
		.attr('x2', d => `${x(d)}`)
		.attr('y1', graphHeight)
		.attr('y2', graphHeight + 35);

	annotationGroup.selectAll('line.bar-lines-horizontal')
		.data([companyData[`industry${categoryName}`], companyData[`country${categoryName}`]].sort())
		.enter().append('line')
		.attr('class', 'bar-lines bar-lines-horizontal')
		.attr('x1', d => `${x(d)}`)
		.attr('x2', (d, i) => {
			if (i === 0) {
				return `${x(d) - 10}`;
			}
			return `${x(d) + 10}`;
		})
		.attr('y1', graphHeight + 35)
		.attr('y2', graphHeight + 35);

	const sectorCountryLabel = annotationGroup.selectAll('text.bar-labels.sectorCountry')
		.data(_.sortBy([{
			name: 'Sector',
			value: companyData[`industry${categoryName}`],
		}, {
			name: companyData.country,
			value: companyData[`country${categoryName}`],
		}], 'value'))
		.enter().append('text')
		.attr('class', 'bar-labels bar-labels-sectorCountry')
		.attr('y', -8)
		.attr('transform', (d, i) => {
			if (i === 0) {
				return `translate(${x(d.value) - 12},${graphHeight + 46})`;
			}
			return `translate(${x(d.value) + 12},${graphHeight + 46})`;
		})
		.attr('text-anchor', (d, i) => {
			if (i === 0) {
				return 'end';
			}
		});

	sectorCountryLabel.append('tspan')
		.text(d => d.name)
		.attr('x', 0);

	sectorCountryLabel.append('tspan')
		.text(d => d3.format('.1f')(d.value))
		.attr('dy', '1em')
		.attr('x', 0);
}

function displayCharts(error, data, companyName) {
	dataset = data;
	companyName = companyName || 'Apple Inc.';

	const categories = {
		tenure: {
			chartTitle: 'Tenure',
			header: 'Tenure',
			column: 'avgTenure',
			xAxisLabel: 'years',
			threshold: 9,
		},
		age: {
			chartTitle: 'Age',
			header: 'Age',
			column: 'avgAge',
			xAxisLabel: 'years',
			threshold: 10,
		},
		gender: {
			chartTitle: 'Gender',
			header: 'Women',
			column: 'percentWomen',
			xAxisLabel: 'per cent female',
			threshold: 9,
		},
	};

	let companyData = {};
	if (companyName) {
		document.getElementById('result-wrapper').innerHTML = '';

		companyData = _.findWhere(dataset, {name: companyName});

		const resultWrapper = d3.select('#result-wrapper');
		resultWrapper.append('div')
			.attr('class', 'result-companyName')
			.text(companyName);

		resultWrapper.append('div')
			.attr('class', 'result-sectorName')
			.text(`Sector: ${companyData.industry}`);
		for (const category in categories) {
			if (categories.hasOwnProperty(category)) {
				drawCategoryChart(categories[category], data, companyData);
			}
		}
	}

}

$('.interactive-search-suggestion').on('click', function () {
	const companyName = $(this).data('companyname');
	displayCharts('', dataset, companyName);
});

