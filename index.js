/*All this fancy Regex was borrowed from here:
http://stackoverflow.com/questions/295566/sanitize-rewrite-html-on-the-client-side
posted by user Mike Samuel*/
var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
var tagOrComment = new RegExp('<(?:' + '!--(?:(?:-*[^->])*--+|-?)' + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*' + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*' + '|/?[a-z]' + tagBody + ')>','gi');


function removeTags(html) {
	var oldHtml;
	do {
		oldHtml = html;
		html = html.replace(tagOrComment, '');
	} while (html !== oldHtml);
	return html.replace(/</g, '&lt;');
}

function local_time(date_time_string,offset) {
	var UTC_time = new Date(date_time_string);
	var loc_time = new Date(UTC_time.getTime() - offset*60*1000);
	return loc_time.getFullYear()+'-'+((parseInt(loc_time.getMonth())+1<10)?'0':'')+(loc_time.getMonth()+1)+'-'+((parseInt(loc_time.getDate())<10)?'0':'')+loc_time.getDate()+' '+loc_time.getHours()+':'+((parseInt(loc_time.getMinutes())<10)?'0':'')+loc_time.getMinutes();
}

function post_comment() {
	var is_name_filled = (document.getElementById('name').value != "");
	var is_comment_filled = (document.getElementById('text_box').value != "");
	if (is_name_filled&&is_comment_filled) {
		var hidden_iframe = document.createElement("iframe");
		hidden_iframe.setAttribute("style", "display:none");
		hidden_iframe.setAttribute("id", "hidden_iframe");
		hidden_iframe.setAttribute("name", "hidden_iframe");
		document.body.appendChild(hidden_iframe);

		if (git_int) {
			var username = removeTags(document.getElementById('name').value);
			var retrieve = new XMLHttpRequest();
			retrieve.onreadystatechange = function() {
				if (retrieve.readyState == 4 && retrieve.status == 200) {
					var user_data = JSON.parse(retrieve.responseText);
					if (user_data['name'] != null) {
						username = user_data['name']+' ('+username+')';
					}
					document.getElementById('name').value = username;
					if (user_data['location'] != null) {
						document.getElementById('location').value = user_data['location'];
					}
					else {
						document.getElementById('location').value = 'N/A';
					}
					document.getElementById('avatar').value = user_data['avatar_url'];

					var date_time = new Date();
					document.getElementById('text_box').value = removeTags(document.getElementById('text_box').value).replace('\n','<br/>');
					document.getElementById('commentbox').submit();
					document.getElementById('comments').innerHTML += "<br/>\
					<div id='comment'><table><tr><td>\
						<a name='new_comment'></a>\
						<img height='70vw' border=1px src='"+user_data['avatar_url']+"'/></td>\
						<td><span>\
							&nbsp"+document.getElementById('name').value+"\
						</span><br/>\
						<code style='font-size:1.2vw'>\
							&nbsp"+document.getElementById('location').value+' - '+date_time.getUTCFullYear()+'-'+((parseInt(date_time.getUTCMonth())+1<10)?'0':'')+(date_time.getUTCMonth()+1)+'-'+((parseInt(date_time.getUTCDate())<10)?'0':'')+date_time.getUTCDate()+', just now\
						</code></td></tr></table><br/>\
						'+document.getElementById('text_box').value+"<br/><br/>\
					</div>";

					document.getElementById('text_box').value = "";
					document.getElementById('name').value = "";
					window.location.href = '#new_comment';
				}
			}
			retrieve.open("GET",'https://api.github.com/users/'+username,true);
			retrieve.send(null);
		}
		else {
			document.getElementById('name').value = removeTags(document.getElementById('name').value);
			document.getElementById('location').value = 'N/A';
			document.getElementById('avatar').value = 'img/me_icon.png';

			var date_time = new Date();
			document.getElementById('text_box').value = removeTags(document.getElementById('text_box').value).replace('\n','<br/>');
			document.getElementById('commentbox').submit();
			document.getElementById('comments').innerHTML += "<br/>\
			<div id='comment'><table><tr><td>\
				<a name='new_comment'></a>\
				<img height='70vw' border=1px src='"+document.getElementById('avatar').value+"'/></td>\
				<td><span>\
					&nbsp"+document.getElementById('name').value+"\
				</span><br/>\
				<code style='font-size:1.2vw'>\
					&nbsp"+document.getElementById('location').value+' - '+date_time.getUTCFullYear()+'-'+((parseInt(date_time.getUTCMonth())+1<10)?'0':'')+(date_time.getUTCMonth()+1)+'-'+((parseInt(date_time.getUTCDate())<10)?'0':'')+date_time.getUTCDate()+', just now\
				</code></td></tr></table><br/>\
				'+document.getElementById('text_box').value+"<br/><br/>\
			</div>";

			document.getElementById('text_box').value = "";
			document.getElementById('name').value = "";
			window.location.href = '#new_comment';
		}
	}
	else if (is_name_filled&&!is_comment_filled) {
		document.getElementById('text_box').placeholder = "You can't submit a blank form";
	}
	else if (!is_name_filled&&is_comment_filled) {
		document.getElementById('name').placeholder = "This is required";
	}
}


var git_int = true;
var load_comments = true;
try {
	var page = document.getElementById('page_name').value;
}
catch (e) {
	load_comments = false;
}

if (load_comments) {
	var retrieve = new XMLHttpRequest();
	retrieve.onreadystatechange = function() {
		if (retrieve.readyState == 4 && retrieve.status == 200) {
			document.getElementById('comments').innerHTML = "";
			var comment_history = JSON.parse(retrieve.responseText);
			for (var i = comment_history.length-1; i >= 0; i--) {
				if (comment_history[i]['page_name'] == page) {
					var date_time = new Date();
					var time_date = comment_history[i]['timestamp'].split('T');
					document.getElementById('comments').innerHTML += "<br/>\
					<div id='comment'><table><tr><td>\
						<img height='70vw' border=1px src='"+comment_history[i]['avatar']+"'/></td>\
						<td><span>\
							&nbsp"+comment_history[i]['name']+"\
						</span><br/>\
						<code style='font-size:1.2vw'>\
							&nbsp"+comment_history[i]['location']+' - '+local_time(time_date[0]+' '+time_date[1].split('.')[0],date_time.getTimezoneOffset())+'\
						</code></td></tr></table><br/>\
						'+comment_history[i]['comment_body']+"<br/><br/>\
					</div>";
				}
			}
		}
	}
	retrieve.open("GET",'http://data.sparkfun.com/output/5JJqEo43NJc4mDQadYjR.json',true);
	retrieve.send(null);
}


var modal = document.getElementById('modal-bg');
var btn = document.getElementById("contact_button");

var vw = document.documentElement.clientWidth;

btn.onmouseover = function() {
	vw = document.documentElement.clientWidth;

	if (vw >= 980) {
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