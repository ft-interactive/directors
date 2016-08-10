function displayCharts(companyName) {
	document.getElementById("result-tenure").getElementsByClassName("result-chart-rect--company")[0].style.height = "90px";
	document.getElementById("result-tenure").getElementsByClassName("result-chart-rect--company")[0].getElementsByClassName("result-chart-val")[0].innerHTML = 8;
}

displayCharts("Apple");
