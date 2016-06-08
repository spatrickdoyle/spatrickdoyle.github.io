var modal = document.getElementById('modal-bg');
var btn = document.getElementById("contact_button");

btn.onmouseover = function() {
	modal.style.display = "block";
}

window.onmouseover = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}