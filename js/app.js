	// GENERAL
	var modal = $('#modal-wrapper'),
		article = $('.article'),
		title = $('header .title'),
		about = $('#about-wrapper'),
		content = $('#content'),
		infoBox = $('#info-box'),
		keywords,
		circle;

	$('.center').centerIn();

	$(document).bind('mousemove',function(e){ 
		infoBox.css( "left", e.pageX + 30 ).css( "top", e.pageY); 
	});


	// INIT MAP

	function init() {

		var map = L.map('map', {
			zoomControl: false
		});

		L.tileLayer('https://{s}.tiles.mapbox.com/v3/maxhasfun.kcb46pe9/{z}/{x}/{y}.png', {
			minZoom: 3,
			maxZoom: 7,
		}).addTo(map);

		// Don't show the 'Powered by Leaflet' text. Attribution overload
		map.attributionControl.setPrefix('');

		// Load Countries: GeoJSON Data + Styling
		L.geoJson(countries, {
			onEachFeature: onEachFeature,
			style: countryStyle,
		}).addTo(map);

		// Load Zones: Array + Styling
		// $("path[fill='#EE2B31']").attr("fill-opacity","0.2");
		var ZentralMittelmeer = L.circle([34.879727, 18.694201], 550000, markerStyle).addTo(map).on({
				mouseover: function () { infoBox.addClass("zone").append('<h2>Reiserouten</h2><p class="refugees">Zentrale und Südöstliche<br> Mittelmeerroute</p><p><strong>175.760 Registrierte</strong></p>').show(); },
				mouseout: function () { infoBox.hide().removeClass("zone").empty() },
				click: function() { drawData("zone", "die zentrale Mittelmeerroute") },
			});
		var WestMittelmeer = L.circle([41.568703, 28.757677], 550000, markerStyle).addTo(map).on({
				mouseover: function () { infoBox.addClass("zone").append('<h2>Reiserouten</h2><p class="refugees">Westliche Balkanroute und <br>Östliche Mittelmeerroute</p><p><strong>95.460 Registrierte</strong></p>').show(); },
				mouseout: function () { infoBox.hide().removeClass("zone").empty() },
				click: function() { drawData("zone", "die westliche Mittelmeerroute") },
			});


		// Set Startview
		var onStart = new L.LatLng(41.585140, 37.370958);
		map.setView(onStart, 3);

	}


	// MAP

	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: mouseover,
			mouseout: mouseout,
			click: click
		});
	};

	function mouseover(layer) {
		layer.target.setStyle(styleHighlight);
		if (layer.target.feature.properties.role == "source" ) {

			var pop = layer.target.feature.properties.population,
				qua = layer.target.feature.properties.quantity,
				average;

			pop = pop.replace(',','.');
			pop *= 1000000;
			qua = qua.replace('.','');
			average = 100/ ( (qua/pop ) * 100);

			infoBox.addClass(layer.target.feature.properties.role).append(
				'<h2>' + layer.target.feature.properties.name + '</h2>' +
				'<p class="population">' + layer.target.feature.properties.population + ' Mill. Einwohner</p>' +
				'<p class="refugees">' + layer.target.feature.properties.quantity + ' Flüchtlinge</p>' +
				'<p class="average">Im Durchschnitt flieht <br/><strong>1 von ' + Math.round(average) + '</strong> Personen</p>').show();
		}
		else if (layer.target.feature.properties.role == "target" ) {

			var pop = layer.target.feature.properties.population,
				qua = layer.target.feature.properties.quantity,
				average;

			pop = pop.replace(',','.');
			pop *= 1000000;
			qua = qua.replace('.','');
			average = pop/qua;

			infoBox.addClass(layer.target.feature.properties.role).append(
				'<h2>' + layer.target.feature.properties.name + '</h2>' +
				'<p class="population">' + layer.target.feature.properties.population + ' Mill. Einwohner</p>' +
				'<p class="refugees">' + layer.target.feature.properties.quantity + ' Flüchtlinge</p>' +
				'<p class="average">1 Asylsuchender verteilt sich<br/> auf <strong>' + Math.round(average) + ' Bewohner</strong></p>').show();
		}
	};

	function mouseout(layer) {
		layer.target.setStyle(styleNormalize);
		infoBox.hide().empty().removeClass("source target");
	};

	function click(layer) {
		drawData(layer.target.feature.properties.role, layer.target.feature.properties.name);
	};


	// CONTENT
	// Display Modal Info based on the passed Properties

	function drawData(role, name) {

		title.text("Relevante Nachrichten über " + name);

		if 		( role == "source" )	keywords = name + "+Flucht+OR+Flüchtlinge+OR+Vertreibung+OR+Verfolgung+OR+Auswanderung+OR+Asyl+-Abschiebung";
		else if	( role == "target" )	keywords = name + "+Flucht+OR+Vertreibung+OR+Verfolgung+OR+Auswanderung+OR+Asyl+Abschiebung";
		else if	( role == "zone" ) {
							var meta = "+Flüchtlinge+OR+Grenze+OR+Frontex+OR+Bootpeople+OR+Route+OR+Flucht+OR+Asyl+OR+Meer";
							if ( name == "die zentrale Mittelmeerroute" )  keywords = "Lybien+OR+Tunesien+OR+Ägypten+OR+Sizilien+OR+Italien" + meta;
							if ( name == "die westliche Mittelmeerroute" ) keywords = "Bulgarien+OR+Griechenland+OR+Ägypten+OR+Türkei" + meta;
		}

		var url = "https://ajax.googleapis.com/ajax/services/search/news?v=1.0&q=" + keywords;

		for (var i = 0; i <= 20; i += 4) {  // Max 20 Articles range of API

			$.ajax({
				type: "GET",
				contentType: "application/json",
				dataType: "JSONP",
				jsonp: 'jsoncallback',
				url: url + '&start=' + i + '&callback=?',
				data: {  },
				cache: false,
				success: function(data) {
								$.each(data.responseData.results, function(key, value){
									content.append(
										'<div class="entry-wrapper"><a href="' + value.unescapedUrl + '" target="_blank"><div class="entry-hover ' + role + '"></div><div class="entry ' + role + '">' +
											'<p class="date">' + value.publishedDate.substring(5, 16) + ' - ' + value.publisher + '</p>' +
											'<h2>' + value.titleNoFormatting + '</h2>' +
											'<p class="text">' + value.content + '</p>' +
										'</div></a></div>');
								});
				}
			});

		}

		article.addClass(role).fadeIn();			

		modal.fadeIn();
	}

	function drawAbout() {
		article.addClass("start").show();
		about.fadeIn();
	}


	// MODAL FUNCTIONS
	function resetModal() {
		article.removeClass('source target zone start');
		title.empty();
		content.empty();
	}

	$('#modal').on('click', function(e) {
		if (e.target !== this) return;
		closeModal();
	});

	function closeModal() {
		about.fadeOut();
		article.hide();
		modal.fadeOut();
		resetModal();
		return true;
	}