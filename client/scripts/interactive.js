'use strict';

/* global d3, _, $ */

var dataset = [];

d3.queue().defer(d3.csv, 'data/sortabletable.csv').await(displayCharts);

function round1dp(x) {
	return Math.round(x * 10) / 10;
}

function drawCategoryChart(categoryData, spreadsheetData, companyData) {
	var categoryName = categoryData.header;
	var chartTitle = categoryData.chartTitle;
	var categoryColumn = categoryData.column;
	var xAxisLabel = categoryData.xAxisLabel;
	var annotation = categoryData.annotation;

	var resultWrapper = d3.select('#result-wrapper');

	var resultContainer = resultWrapper.append('div').attr('class', 'result-container').attr('id', 'result-' + categoryName);

	resultContainer.append('div').attr('class', 'result-header').text(chartTitle);

	resultContainer.append('div').attr('class', 'xAxisLabel').text(xAxisLabel);

	resultContainer.append('div').attr('class', 'annotation').text(annotation);

	var margins = {
		left: 20,
		right: 20,
		top: 25,
		bottom: 20
	};

	if (resultContainer.node().offsetWidth < 250) {
		if (categoryName === 'Tenure') {
			margins.left = 57;
			margins.right = 13;
		}
		if (categoryName === 'Age') {
			margins.left = 58;
			margins.right = 13;
		}
		if (categoryName === 'Women') {
			margins.left = 70;
			margins.right = 0;
		}
	}

	var graphWidth = resultContainer.node().offsetWidth - margins.left - margins.right;
	var graphHeight = 200 - margins.top - margins.bottom;

	var resultChart = resultContainer.append('svg').attr('class', 'result-chart-container').attr('width', graphWidth + margins.left + margins.right).attr('height', graphHeight + margins.top + margins.right).attr('aria-labelledby', 'title desc');

	resultChart.append('title') // add title for accessibility
	.text('Distribution of ' + chartTitle);

	var chartDescription = resultChart.append('desc'); // add description for accessibility

	var resultChartGroup = resultChart.append('g').attr('width', graphWidth).attr('height', graphHeight).attr('transform', 'translate(' + margins.left + ',' + margins.top + ')').attr('id', 'chartLayer');

	var annotationGroup = resultChart.append('g').attr('width', graphWidth).attr('height', graphHeight).attr('transform', 'translate(' + margins.left + ',' + margins.top + ')').attr('id', 'annotationLayer');

	var data = _.pluck(spreadsheetData, categoryColumn);
	data = _.map(data, function (num) {
		return Number(num);
	});

	var x = d3.scaleLinear().domain(d3.extent(data)).rangeRound([0, graphWidth]).nice();

	var bins = d3.histogram().domain(x.domain()).thresholds(40)(data);

	var xAxis = d3.axisBottom(x).tickFormat(function (d, i) {
		if (i % 2 === 0) {
			return d;
		}
	});

	var y = d3.scaleLinear().domain([0, d3.max(bins, function (d) {
		return d.length;
	})]).range([graphHeight, 0]);

	resultChartGroup.append('g').attr('transform', 'translate(0,' + graphHeight + ')').call(xAxis);

	var bar = resultChartGroup.selectAll('.bar').data(bins).enter().append('g').attr('class', 'bar').attr('transform', function (d) {
		return 'translate(' + x(d.x0) + ',' + y(d.length) + ')';
	});

	bar.append('rect').attr('x', 1).attr('fill', function (d) {
		if (companyData && Number(companyData[categoryColumn]) > d.x0 && Number(companyData[categoryColumn]) <= d.x1) {
			return '#A5526A';
		}
		if (companyData && Number(companyData[categoryColumn]) === 0 && d.x0 === 0) {
			return '#A5526A';
		}
		return '#cec6b9';
	}).attr('width', x(bins[0].x1) - x(bins[0].x0) - 1).attr('height', function (d) {
		if (d.length < 3) {
			return graphHeight - y(d.length);
		}
		return graphHeight - y(d.length);
	});

	annotationGroup.selectAll('text.bar-labels').data(bins).enter().append('text').attr('class', 'bar-labels').attr('y', -8).text(function (d) {
		if (companyData && Number(companyData[categoryColumn]) > d.x0 && Number(companyData[categoryColumn]) <= d.x1) {
			chartDescription.text('The average for ' + companyData.name + ' is ' + round1dp(companyData[categoryColumn]) + ' ' + xAxisLabel + '.');
			return '' + round1dp(companyData[categoryColumn]);
		}
		if (companyData && Number(companyData[categoryColumn]) === 0 && d.x0 === 0) {
			chartDescription.text('The average for ' + companyData.name + ' is ' + round1dp(companyData[categoryColumn]) + ' ' + xAxisLabel + '.');
			return '' + round1dp(companyData[categoryColumn]);
		}
	}).attr('transform', function (d) {
		return 'translate(' + x(d.x0) + ',' + y(d.length) + ')';
	});

	if (companyData.name !== 'Global average') {
		// lines to label sector and country
		annotationGroup.selectAll('line.bar-lines-vertical').data([companyData['industry' + categoryName], companyData['country' + categoryName]]).enter().append('line').attr('class', 'bar-lines bar-lines-vertical').attr('x1', function (d) {
			return '' + x(d);
		}).attr('x2', function (d) {
			return '' + x(d);
		}).attr('y1', graphHeight).attr('y2', graphHeight + 35);

		annotationGroup.selectAll('line.bar-lines-horizontal').data([Number(companyData['industry' + categoryName]), Number(companyData['country' + categoryName])].sort(function (a, b) {
			return +a - +b;
		})).enter().append('line').attr('class', 'bar-lines bar-lines-horizontal').attr('x1', function (d) {
			return '' + x(d);
		}).attr('x2', function (d, i) {
			if (i === 0) {
				return '' + (x(d) - 10);
			}
			return '' + (x(d) + 10);
		}).attr('y1', graphHeight + 35).attr('y2', graphHeight + 35);

		var sectorCountryLabel = annotationGroup.selectAll('text.bar-labels.sectorCountry').data(_.sortBy([{
			name: 'Sector',
			value: Number(companyData['industry' + categoryName])
		}, {
			name: companyData.country,
			value: Number(companyData['country' + categoryName])
		}], 'value')).enter().append('text').attr('class', 'bar-labels bar-labels-sectorCountry').attr('y', -8).attr('transform', function (d, i) {
			if (i === 0) {
				return 'translate(' + (x(d.value) - 12) + ',' + (graphHeight + 46) + ')';
			}
			return 'translate(' + (x(d.value) + 12) + ',' + (graphHeight + 46) + ')';
		}).attr('text-anchor', function (d, i) {
			if (i === 0) {
				return 'end';
			}
		});

		sectorCountryLabel.append('tspan').text(function (d) {
			return d.name;
		}).attr('x', 0);

		sectorCountryLabel.append('tspan').text(function (d) {
			return round1dp(d.value);
		}).attr('dy', '1em').attr('x', 0);
	}
}

function displayCharts(error, data, companyName) {
	dataset = data;
	companyName = companyName || 'Global average';

	var categories = {
		tenure: {
			chartTitle: 'Tenure',
			header: 'Tenure',
			column: 'avgTenure',
			xAxisLabel: 'years',
			threshold: 9
		},
		age: {
			chartTitle: 'Age',
			header: 'Age',
			column: 'avgAge',
			xAxisLabel: 'years',
			threshold: 10
		},
		gender: {
			chartTitle: 'Gender composition',
			header: 'Women',
			column: 'percentWomen',
			xAxisLabel: 'per cent female',
			threshold: 9
		}
	};

	if (error !== 'blah') {
		// hack
		var companyList = _.pluck(dataset, 'name');
		$('#companyname-search').autocomplete({
			source: companyList,
			minLength: 2,
			delay: 500,
			select: function select(e, ui) {
				if (ui.item) {
					$(e.target).val(ui.item.value);
				}
				var companyName = $(this).val();
				displayCharts('blah', dataset, companyName);
			}
		});

		$('#companyname-search').bind('autocompleteselect', function () {
			var companyName = $(this).val();
			displayCharts('blah', dataset, companyName);
		});

		$(window).resize(function () {
			_.debounce(displayCharts('blah', dataset, $('.result-companyName').text()), 300);
		});
	}

	var companyData = {};
	if (companyName) {
		companyData = _.findWhere(dataset, { name: companyName });

		if (companyData) {
			document.getElementById('result-wrapper').innerHTML = '';
			document.getElementById('error-nocompany').style.height = 0;

			var resultWrapper = d3.select('#result-wrapper');
			resultWrapper.append('div').attr('class', 'result-companyName').text(companyName);

			if (companyName === 'Global average') {
				resultWrapper.append('div').attr('class', 'result-sectorName-global').text('Includes widely-held companies in 10 sectors and 30 markets');

				resultWrapper.append('div').attr('class', 'result-sectorName-global-hide').text('.');

				resultWrapper.append('div').attr('class', 'result-sectorName-global-hide').attr('id', 'country').text('.');
			} else {
				resultWrapper.append('div').attr('class', 'result-sectorName').text('Sector: ' + companyData.industry);

				resultWrapper.append('div').attr('class', 'result-sectorName').text('Market cap: $' + round1dp(companyData.cap) + 'bn');

				resultWrapper.append('div').attr('class', 'result-sectorName').attr('id', 'country').text('Market: ' + companyData.country);
			}

			for (var category in categories) {
				if (categories.hasOwnProperty(category)) {
					drawCategoryChart(categories[category], data, companyData);
				}
			}
		} else {
			document.getElementById('error-nocompany').style.height = 'auto';
		}
	}
}

$('.interactive-search-suggestion').on('click', function () {
	var companyName = $(this).data('companyname');
	displayCharts('blah', dataset, companyName);
});

$('#companyname-search').on('change', function () {
	var companyName = $(this).val();
	displayCharts('blah', dataset, companyName);
});

$('#companyname-search').on('keypress', function (e) {
	if (e.keyCode === 13) {
		var companyName = $(this).val();
		displayCharts('blah', dataset, companyName);
	}
});

$('#interactive-search').on('click', function () {
	var companyName = $('#companyname-search').val();
	displayCharts('blah', dataset, companyName);
});

$('#random-search').on('click', function () {
	var randomCompanyIndex = Math.floor(Math.random() * dataset.length);
	var companyName = dataset[randomCompanyIndex].name;
	displayCharts('blah', dataset, companyName);

	$('#companyname-search').val('');
});

$('#companyname-search').on('autocoompletechange', function () {
	var companyName = $(this).val();
	displayCharts('blah', dataset, companyName);
});