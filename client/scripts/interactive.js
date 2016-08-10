// const dataset;

// d3.csv('data/sortabletable.csv', function(row) {

// });

function displayCharts(companyName) {
	document.getElementById('result-tenure').getElementsByClassName('result-chart-rect--company')[0].style.width = '90%';
	document.getElementById('result-tenure').getElementsByClassName('result-chart-rect--company')[0].getElementsByClassName('result-chart-val')[0].innerHTML = 8;
}

displayCharts('Apple');
