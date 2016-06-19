(function($) {
	$(document).ready(function() {	
		init();
	});
	String.prototype.decodeHTML = function() {
		return $("<div>", {html: "" + this}).html();
	};
	function ajaxLoad(html) {
		// title
		document.title = html.match(/<title>(.*?)<\/title>/)[1].trim().decodeHTML();
		// body class (must be renamed because body cannot be grabbed from ajax response)
		html = html.replace(/(<\/?)html( .+?)?>/gi,'$1NOTHTML$2>',html)
		html = html.replace(/(<\/?)body( .+?)?>/gi,'$1NOTBODY$2>',html)
		$('body').attr('class',$(html).find('notbody').attr('class'));
    // scroll to top
    $(window).scrollTop(0);
		// init scripts
		init();
	};
	function loadPage(href) {
		// show fancy loading bar
		loadBar();
		// ajax load content
		$("#container").load(href + " #container > *", ajaxLoad);
	}
  function loadBar() {
    $('#loadbar').remove();
    $('body').append('<div id="loadbar"></div>');
  }
	// back button: this is weird, because browsers interpret popstate differently
	// the following solution is bulletproof and only pops on back button
	history.replaceState({ goBack: true }, document.title);
	$(window).on("popstate", function(e) {
		if (!e.originalEvent.state.goBack) return;
		loadPage(location.href);
	});
	$(document).on("click", "a", function() {
		var href = $(this).attr("href");
			// if current url is next url (without trailing slashes)
			if( href.replace(/\/$/, "") == window.location.href.replace(/\/$/, "") ) { return false; }
		if (!$(this).is('[target]') || $(this).attr('target') != '_blank')	{
			history.pushState({ goBack: true }, '', href);
			loadPage(href);
			return false;
		}
	});
	function init() {	
		// do stuff you want at page load		
	}
})(jQuery);