/*All this fancy Regex was borrowed from here:
http://stackoverflow.com/questions/295566/sanitize-rewrite-html-on-the-client-side
posted by user Mike Samuel*/
/*var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
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
						<img style='height:70vw;border:1px' src='"+user_data['avatar_url']+"' alt=""/></td>\
						<td><span>\
							&nbsp;"+document.getElementById('name').value+"\
						</span><br/>\
						<code style='font-size:1.2vw'>\
							&nbsp;"+document.getElementById('location').value+' - '+date_time.getUTCFullYear()+'-'+((parseInt(date_time.getUTCMonth())+1<10)?'0':'')+(date_time.getUTCMonth()+1)+'-'+((parseInt(date_time.getUTCDate())<10)?'0':'')+date_time.getUTCDate()+', just now\
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
			document.getElementById('avatar').value = 'img/me_icon.svg';

			var date_time = new Date();
			document.getElementById('text_box').value = removeTags(document.getElementById('text_box').value).replace('\n','<br/>');
			document.getElementById('commentbox').submit();
			document.getElementById('comments').innerHTML += "<br/>\
			<div id='comment'><table><tr><td>\
				<a name='new_comment'></a>\
				<img style='height:70vw;border:1px' src='"+document.getElementById('avatar').value+"' alt=""/></td>\
				<td><span>\
					&nbsp;"+document.getElementById('name').value+"\
				</span><br/>\
				<code style='font-size:1.2vw'>\
					&nbsp;"+document.getElementById('location').value+' - '+date_time.getUTCFullYear()+'-'+((parseInt(date_time.getUTCMonth())+1<10)?'0':'')+(date_time.getUTCMonth()+1)+'-'+((parseInt(date_time.getUTCDate())<10)?'0':'')+date_time.getUTCDate()+', just now\
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
						<img style='height:70vw;border:1px' src='"+comment_history[i]['avatar']+"' alt=""/></td>\
						<td><span>\
							&nbsp;"+comment_history[i]['name']+"\
						</span><br/>\
						<code style='font-size:1.2vw'>\
							&nbsp;"+comment_history[i]['location']+' - '+local_time(time_date[0]+' '+time_date[1].split('.')[0],date_time.getTimezoneOffset())+'\
						</code></td></tr></table><br/>\
						'+comment_history[i]['comment_body']+"<br/><br/>\
					</div>";
				}
			}
		}
	}
	retrieve.open("GET",'http://data.sparkfun.com/output/5JJqEo43NJc4mDQadYjR.json',true);
	retrieve.send(null);
}*/

var pageLoadStart = Date.now();

function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}

var dateObj = new Date();
var hour = dateObj.getHours();

var videofile = "bg"+parseInt(Math.floor(Math.random()*2 + 1));


var heading = create(' \
<video autoplay autobuffer loop muted id="background" style="position:fixed;top:0px;left:0px;z-index:-1;"> \
      <source src="img/'+videofile+'.mp4" type="video/mp4"/> \
      <img src="'+videofile+'.png" /> \
</video> \
\
<div id="bar_block"></div> \
\
<div id="banner"><br/> \
  <h1><a href="index.html">spatrickdoyle.com</a></h1> \
  <i>"Professional problem-solver"</i><br/><br/><br/> \
</div> \
\
<div class="bar" style="height:5px;background:rgba(255,255,255,0);border-width:0px"></div> \
	<div class="bar" id="bar"> \
	  <div class="baritem" style="margin-top:23vh"><a href="me.html"><img src="img/me_icon.svg" onmouseover="this.src=\'img/me_icon_light.png\'" onmouseout="this.src=\'img/me_icon.svg\'" alt=""/>about me</a></div> \
	  <div class="baritem"><a href="website.html"><img src="img/website_icon.svg" onmouseover="this.src=\'img/website_icon_light.png\'" onmouseout="this.src=\'img/website_icon.svg\'" alt=""/>this website</a></div> \
	  <div class="baritem"><a href="projects.html"><img src="img/projects_icon.svg" onmouseover="this.src=\'img/projects_icon_light.png\'" onmouseout="this.src=\'img/projects_icon.svg\'" alt=""/>projects</a></div> \
	  <div class="baritem" id="contact_button"><img src="img/message_icon.svg" onmouseover="this.src=\'img/message_icon_light.png\'" onmouseout="this.src=\'img/message_icon.svg\'" alt=""/>contact me</div> \
	</div> \
\
<div id="modal-bg"> \
	  <div id="modal"> \
		<a href="http://www.facebook.com/spatrickdoyle">Shoot me a Facebook message!</a><br/> \
		<a href="mailto:sean@spatrickdoyle.com">Or email me!</a><br/> \
		Or you can call/text me: 913-530-6297<br/> \
		Or I guess you could send me a pull request or something, <a href="http://www.github.com/spatrickdoyle">if you want to do that.</a><br/> \
	  </div> \
	</div>');

document.body.insertBefore(heading, document.body.childNodes[0]);

var modal = document.getElementById('modal-bg');
var btn = document.getElementById("contact_button");

var vw = document.documentElement.clientWidth;
var vh = document.documentElement.clientHeight;

var bg = document.getElementById('background');

if (vw >= vh) {
	bg.style.width = "100%";
	bg.style.height = "auto";
}
else {
	bg.style.width = "auto";
	bg.style.height = "100%";
}

if (vh < 780) {
	document.getElementById("bar").setAttribute("style", "position: absolute");
}
else {
	document.getElementById("bar").setAttribute("style", "position: fixed");
}

btn.onmouseover = function() {
	vw = document.documentElement.clientWidth;
	//alert(vw);
	if (vw >= 950) {
		var modal_card = document.getElementById('modal');
		var rect = document.getElementById("contact_button").getBoundingClientRect();
		var s = parseInt(rect.top - rect.height/2);
		modal_card.style.top = s+"px";
		modal.style.display = "block";
	}
}

btn.onclick = function() {
	vw = document.documentElement.clientWidth;
	//alert(vw);
	if (vw < 950) {
		var vw = document.documentElement.clientWidth;
		var vh = document.documentElement.clientHeight;
		var modal_card = document.getElementById('modal');
		modal_card.style.top = parseInt(vh/2 - 75)+"px";
		modal.style.visibility = "visible";
		modal.style.display = "block";
	}
}

window.onmouseover = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}

window.onscroll = function() {
	var vh = document.documentElement.clientHeight;
	modal.style.display = "none";

	if (vh < 780) {
		document.getElementById("bar").setAttribute("style", "position: absolute");
	}
	else {
		document.getElementById("bar").setAttribute("style", "position: fixed");
	}
}


var TxtType = function(el, toRotate, period) {
    this.toRotate = toRotate;
	this.urls = [ "", "rice2.html", "vision.html", "website.html", "knw.html", "vision.html", "spectre.html", "vision.html", "me.html" ];
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;

	this.cursor = document.getElementById("cursor");
	this.cursor2 = document.getElementById("cursor2");
};

TxtType.prototype.tick = function() {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];
	var url = this.urls[i];
	console.log(fullTxt,url);

    if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
    }
	else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

    var that = this;
    var delta = 200 - Math.random() * 100;

    if (this.isDeleting) { delta /= 2; }

    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;

		if (this.cursor) {
			this.cursor.style.animationPlayState = "running";
			this.cursor.style.display = "inline-block";
			this.cursor2.style.display = "none";
		}

		this.el.href = url;
    }
	else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;

		if (this.cursor) {
			this.cursor.style.animationPlayState = "running";
			this.cursor.style.display = "inline-block";
			this.cursor2.style.display = "none";
		}
    }
	else {
		if (this.cursor) {
			this.cursor.style.animationPlayState = "paused";
			this.cursor.style.display = "none";
			this.cursor2.style.display = "inline-block";
		}

		this.el.href = "";
	}

    setTimeout(function() {
        that.tick();
    }, delta);
};

window.onload = function() {
	var foot = document.getElementById('foot');
	if (foot) {
		foot.innerHTML = '<!--<form action="http://data.sparkfun.com/input/5JJqEo43NJc4mDQadYjR" method="GET" target="hidden_iframe" id="commentbox"> \
		  <span id=\'name_field\' style=\'font-size:2vw\'>Github username:</span>&nbsp;<span id=\'help\'>(?)</span> \
		  <div id=\'paragraph\'>The comment system is integrated with GitHub to pull user information. Don\'t have a GitHub account? <a href=\'http://www.github.com\'>Make one!</a> Or, click <a href="#comment_form" onclick="git_int=false;document.getElementById(\'name_field\').innerHTML=\'Screen name:\'">here</a> and simply enter a preferred screen name.</div><br/> \
		  <input type="text" name="name" id="name"/><br/><br/> \
		  <span style=\'line-height:4vw;font-size:2vw\'>Comment:<br/></span> \
		  <textarea name="comment_body" form="commentbox" id="text_box"></textarea><br/><br/> \
		  <input type="hidden" name="page_name" id="page_name" value="website"/> \
		  <input type="hidden" name="location" id="location" value=""/> \
		  <input type="hidden" name="avatar" id="avatar" value=""/> \
		  <input type="hidden" name="private_key" value=""/> \
		  <div id="comment_button" onclick="post_comment()">Post</div><br/> \
	  </form> \
\
	  <div id="comments"></div><br/><br/><br/>--> \
\
<div id="paragraph" style="font-size:1.1vw;padding:3px;width:72vw">This website was produced by Sean Patrick Doyle and published between 2016 and 2017. Anything here may be used freely, if you want, but please give me credit.</div><br/>';
	}

	var elements = document.getElementsByClassName('typewrite');
    for (var i=0; i<elements.length; i++) {
        var toRotate = elements[i].getAttribute('data-type')
        var period = elements[i].getAttribute('data-period');
        if (toRotate) {
            new TxtType(elements[i], JSON.parse(toRotate), period);
        }
    }

	var loadTime = Date.now() - pageLoadStart;
	alert(loadTime);
};

window.onresize = function() {
	var vw = document.documentElement.clientWidth;
	var vh = document.documentElement.clientHeight;

	var bg = document.getElementById('background');

	if (vw >= vh) {
		bg.style.width = "100%";
		bg.style.height = "auto";
	}
	else {
		bg.style.width = "auto";
		bg.style.height = "100%";
	}
}
