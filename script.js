(function($) {

	/* ********* */
	/* init once */
	/* ********* */
	$(document).ready(function() {
		// ...
	});	

	/* *********************** */
	/* init on every page load */
	/* *********************** */

	$(document).ready(function() {	
		init();
	});
	function init() {	
		// ...
	}

	/* ********* */
	/* ajaxize */
	/* ********* */

	var preload_click = false;
	var preload_back = false;		
	var preload_loaded = false;		
	var preload_data = "";
	var dataHistory = 0;

	// on hover
	$(document).on("mouseover", "a", function() {
		var href = $(this).attr("href");
		if( href.replace(/\/$/, "") == window.location.href.replace(/\/$/, "") ) { return false; } // remove trailing slashes
		if ($(this).is('[target]') && $(this).attr('target') == '_blank') { return true; }
		preloadPage(href);
	});

	// on click
	$(document).on("click", "a", function() {
		var href = $(this).attr("href");
		if( href.replace(/\/$/, "") == window.location.href.replace(/\/$/, "") ) { return false; } // remove trailing slashes
		if ($(this).is('[target]') && $(this).attr('target') == '_blank') { return true; }

		preload_click = href;

		$(this).attr('data-history-'+(++dataHistory), 'true');
		history.pushState({ goBack: true, dataHistory: dataHistory }, '', href);
		loadPage(href, this);
		return false;
	});

	// on back
	// this is weird, because browsers interpret popstate differently
	// the following solution is bulletproof and only pops on back button
	history.replaceState({ goBack: true, dataHistory: dataHistory }, document.title);
	$('.current-item').attr('data-history-'+dataHistory, 'true');
	$(window).on("popstate", function(e) {
		if (!e.originalEvent.state.goBack) { return; }

		preload_back = true;

		var context = null;
		if( e.originalEvent.state.dataHistory !== undefined && e.originalEvent.state.dataHistory !== null && $('[data-history-'+e.originalEvent.state.dataHistory+'="true"]').length > 0 ) { context = $('[data-history-'+e.originalEvent.state.dataHistory+'="true"]'); }
		loadPage(location.href, context);
	});

	function preloadPage(href) {
		preload_loaded = false;
		preload_data = "";
		$.ajax({
			method: "GET",
			url: href
		})
		.done(function(html) {
			// if user has clicked on another link meanwhile
			if( preload_click !== false && preload_click != href ) { return false; }

			preload_loaded = href;
			preload_data = html;

			// user has clicked, before preload was finished (or hit the back button)
			if( preload_click !== false || preload_back == true ) {
				showPage();
			}
		});
	}

	function loadPage(href, context) {

		// show fancy loading bar
		$('#loadbar').remove();
		$('body').append('<div id="loadbar"></div>');

		// replace active states
		$('.current-item').removeClass('current-item');
		if( $(context).hasClass('menu-item') ) {
			$(context).addClass('current-item');				
		}

		// next steps
		// user has clicked, after preload has finished
		if( preload_loaded !== false && preload_loaded == href && preload_back === false ) {
			showPage();
		}
		// user has not even clicked
		else if( preload_click === false ) {
			preloadPage(href);
		}

	}

	function showPage() {
		console.log(preload_data);
		// insert
		$('#content').html( $(preload_data).filter('#content').html() );
		// title
		var title = preload_data.match(/<title>(.*?)<\/title>/)[1].trim();
		title = $('<div/>').html(title).text();
		document.title = title;
		// body class (must be renamed because body cannot be grabbed from ajax response)
		preload_data = preload_data.replace(/(<\/?)html( .+?)?>/gi,'$1NOTHTML$2>',preload_data)
		preload_data = preload_data.replace(/(<\/?)body( .+?)?>/gi,'$1NOTBODY$2>',preload_data)
		$('body').attr('class',$(preload_data).find('notbody').attr('class'));
		// reset
		preload_click = false;
		preload_back = false;
		preload_loaded = false;
		preload_data = "";
		// init scripts
		init();
	}

})(jQuery);