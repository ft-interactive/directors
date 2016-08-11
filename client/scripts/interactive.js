/* global d3, _ */

let dataset = [];

d3.queue()
	.defer(d3.csv, 'data/sortabletable.csv')
	.await(displayCharts);

function drawCategoryChart(categoryData, spreadsheetData, companyData) {
	const categoryName = categoryData.header;
	const chartTitle = categoryData.chartTitle;
	const categoryColumn = categoryData.column;
	const xAxisLabel = categoryData.xAxisLabel;

	console.log(companyData);

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
		top: 20,
		bottom: 20,
	};

	const graphWidth = resultContainer.node().offsetWidth/2 - margins.left - margins.right;
	const graphHeight = 150 - margins.top - margins.bottom;

	const resultChart = resultContainer.append('svg')
		.attr('class', 'result-chart-container')
		.attr('width', graphWidth + margins.left + margins.right)
		.attr('height', graphHeight + margins.top + margins.right);

	const annotationGroup = resultChart.append('g')
		.attr('width', graphWidth)
		.attr('height', graphHeight)
		.attr('transform', `translate(${margins.left},${margins.top})`);

	const resultChartGroup = resultChart.append('g')
		.attr('width', graphWidth)
		.attr('height', graphHeight)
		.attr('transform', `translate(${margins.left},${margins.top})`);

	let data = _.pluck(spreadsheetData, categoryColumn);
	data = _.map(data, num => Number(num));

	const x = d3.scaleLinear()
		.domain(d3.extent(data))
		.rangeRound([graphHeight, 0])
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
		.range([0, graphWidth]);

	resultChartGroup.append('g')
		.attr('transform', `translate(0,0)`)
		.call(xAxis);

	const bar = resultChartGroup.selectAll('.bar')
		.data(bins)
		.enter().append('g')
		.attr('class', 'bar')
		.attr('fill', d => {
			if (companyData && Number(companyData[categoryColumn]) > d.x0 && Number(companyData[categoryColumn]) <= d.x1) {
				return '#A5526A';
			}
			if (companyData && Number(companyData[`industry${categoryName}`]) >= d.x0 && Number(companyData[`industry${categoryName}`]) < d.x1) {
				return '#a7a59b';
			}
			if (companyData && Number(companyData[`country${categoryName}`]) >= d.x0 && Number(companyData[`country${categoryName}`]) < d.x1) {
				return '#a7a59b';
			}
			return '#cec6b9';
		})
		.attr('transform', d => `translate(0,  ${x(d.x1)})`);

	bar.append('rect')
		.attr('y', 0)
		.attr('width', d => y(d.length))
		.attr('height', x(bins[0].x0) - x(bins[0].x1)+1);

	const barText = annotationGroup.selectAll('text.bar-labels')
		.data(bins)
		.enter().append('text')
		.attr('class', 'bar-labels')
<<<<<<< HEAD
		.attr('transform', d => {
			return `translate(${y(d.length) + 5},11)`
		})
=======
		.attr('y', -8)
>>>>>>> origin/histogram
		.text(d => {
			let labelText = [];
			if (companyData && Number(companyData[categoryColumn]) > d.x0 && Number(companyData[categoryColumn]) <= d.x1) {
<<<<<<< HEAD
				labelText.push(`${companyData.name} ${d3.format('.1f')(companyData[categoryColumn])}`);
			}
			if (companyData && Number(companyData[`industry${categoryName}`]) >= d.x0 && Number(companyData[`industry${categoryName}`]) < d.x1) {
				labelText.push(`${companyData.industry} ${d3.format('.1f')(companyData[`industry${categoryName}`])}`);
			}
			if (companyData && Number(companyData[`country${categoryName}`]) >= d.x0 && Number(companyData[`country${categoryName}`]) < d.x1) {
				labelText.push(`${companyData.country} ${d3.format('.1f')(companyData[`country${categoryName}`])}`);
			}
			return labelText.join(', ');
=======
				return `${d3.format('.1f')(companyData[categoryColumn])}`;
			}
		})
		.attr('transform', d => `translate(${x(d.x0)},${y(d.length)})`);

	const sectorLabel = annotationGroup.selectAll('text.bar-labels')
		.data(bins)
		.enter().append('text')
		.attr('class', 'bar-labels')
		.attr('y', -8)
		.attr('transform', d => `translate(${x(d.x0)},${y(d.length)})`)

	sectorLabel.append('tspan')
		.text(d => {
			if (companyData && Number(companyData[`industry${categoryName}`]) >= d.x0 && Number(companyData[`industry${categoryName}`]) < d.x1) {
				return 'Sector';
			}
		});

	sectorLabel.append('tspan')
		.text(d => {
			if (companyData && Number(companyData[`industry${categoryName}`]) >= d.x0 && Number(companyData[`industry${categoryName}`]) < d.x1) {
				return `${d3.format('.1f')(companyData[`industry${categoryName}`])}`;
			}
>>>>>>> origin/histogram
		});

	// barText.append('tspan')
	// 	.text(d => {
	// 		if (companyData && Number(companyData[categoryColumn]) > d.x0 && Number(companyData[categoryColumn]) <= d.x1) {
	// 			return `${companyData.name} ${d3.format('.1f')(companyData[categoryColumn])}`;
	// 		}
	// 	})
	// 	.attr('x', 0);

	// barText.append('tspan')
	// 	.text(d => {
	// 		if (companyData && Number(companyData[`industry${categoryName}`]) >= d.x0 && Number(companyData[`industry${categoryName}`]) < d.x1) {
	// 			return `${companyData.industry} ${d3.format('.1f')(companyData[`industry${categoryName}`])}`;
	// 		}
	// 	})
	// 	.attr('x', 0)
	// 	.attr('dy', '1em');

	// barText.append('tspan')
	// 	.text(d => {
	// 		if (companyData && Number(companyData[`country${categoryName}`]) >= d.x0 && Number(companyData[`country${categoryName}`]) < d.x1) {
	// 			return `${companyData.country} ${d3.format('.1f')(companyData[`country${categoryName}`])}`;
	// 		}
	// 	})
	// 	.attr('x', 0)
	// 	.attr('dy', '1em');
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
		companyData = _.findWhere(dataset, {name: companyName});

		const resultWrapper = d3.select('#result-wrapper');
		resultWrapper.append('div')
			.attr('class', 'result-companyName')
			.text(companyName);

		resultWrapper.append('div')
			.attr('class', 'result-sectorName')
			.text(`Sector: ${companyData.industry}`);
	}

	for (const category in categories) {
		if (categories.hasOwnProperty(category)) {
			drawCategoryChart(categories[category], data, companyData);
		}
	}
}
