/* global $ */

function toggleVisibility(e) {
	if (e.target.id === 'buttonten') {
		$('#top10').addClass('showten');
	} else {
		$('#top10').removeClass('showten');
	}
}

$('#buttonten').on('click', toggleVisibility);
$('#buttonage').on('click', toggleVisibility);
