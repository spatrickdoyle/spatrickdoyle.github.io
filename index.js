var modal = document.getElementById('modal-bg');
var btn = document.getElementById("contact_button");

var vw = document.documentElement.clientWidth;

btn.onmouseover = function() {
	vw = document.documentElement.clientWidth;

	if (vw > 980) {
		modal.style.display = "block";
	}
}

btn.onclick = function() {
	modal.style.display = "block";
}

window.onmouseover = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}