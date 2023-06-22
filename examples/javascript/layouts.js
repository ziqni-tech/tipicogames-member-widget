(function(){
	const stringContains = function (str, partial) {
		return (str.indexOf(partial) > -1);
	};

	function _hasClass (element, className) {
		className = className.replace('.', '');

		try {
			if (element.classList) {
				return element.classList.contains(className);
			} else {
				return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
			}
		} catch (e) {
			if (typeof e.stack !== 'undefined') {
				console.log(e.stack);
			}
			console.log(e, element, className);

			return false;
		}
	}

	const hasClass = function (element, className) {
		if (typeof className === 'string') {
			return _hasClass(element, className);
		} else if (className instanceof Array) {
			var hasClass = false;
			for (var i in className) {
				if (typeof className[i] === 'string' && _hasClass(element, className[i])) {
					hasClass = true;
				}
			}
			return hasClass;
		}
	};

	var theme = "cl-style-2-default-theme";
	const urlParams = window.location.search.split("?");
	var queryMap = {};
	for(var k = 0; k < urlParams.length; k++){
		if( typeof urlParams[k] === "string" && urlParams[k].length > 0 ){
			const terms = urlParams[k].split("=");
			queryMap[terms[0]] = (typeof terms[1] !== "undefined") ? terms[1] : "";
		}
	}


	if ( typeof queryMap.theme !== "undefined" ){
		theme = queryMap.theme;
	}

	const options = {
		autoStart: false,
		uri: {},
		layout: {
			miniScoreBoardPosition: {
				left: "30px"
			}
		}
	};
	options.enableNotifications = true; // requires a working/valid SSE channel
	options.memberId = "jon-doe-Asd3-_J_CgpY-bw2S2Sy";
	options.uri.gatewayDomain = "";
	options.apiKey = "";
	options.spaceName = "your space";
	options.gameId = "fruits";
	options.bindContainer = document.body;

	// lookup services override
	options.uri.members = "data/member-data-sample.json";
	options.uri.competitions = "data/competition-list-data-sample.json";
	options.uri.competitionById = "data/competition-data-sample_:id.json";
	options.uri.memberCompetitions = "data/competition-list-data-sample.json";
	options.uri.memberCompetitionById = "data/competition-data-sample_:competitionId.json";
	options.uri.contestLeaderboard = "data/leaderboard-data.json";
	options.uri.achievements = "data/achievements-list-data-sample.json";
	options.uri.achievement = "data/achievements-data-sample.json";
	options.uri.achievementsProgression = "data/achievements-list-perc-data-sample.json";
	options.uri.achievementsIssued = "data/achievements-list-issued-data-sample.json";
	options.uri.messages = "data/messages-claimed-data-sample.json";
	options.uri.memberReward = "data/messages-reward-data-sample.json";
	options.uri.messageById = "data/messages-data-sample.json";
	options.uri.assets = "images/:attachmentId.png";
	options.showCopyright = false;
	options.resources = [
		("/build/css/theme/" + theme + ".css?t=" + ( new Date().getTime() ))
	];

	var widgetInstance = new window._clLeaderBoardV3SelfInit( options );
	widgetInstance.settings.leaderboard.miniScoreBoard.enableRankings = false;
	widgetInstance.init();

	document.querySelector(".external-action-buttons").addEventListener("click", function(event){
		var el = event.target;

		console.log(el, hasClass(el, "trigger-achievement"));
		if (hasClass(el, "trigger-achievement")) {
			widgetInstance.settings.uri.achievement = "data/achievements-data-sample.json";
			widgetInstance.settings.notifications.settings.eventStream.push({
				achievementId: "1"
			})
		} else if (hasClass(el, "trigger-achievement2")) {
			widgetInstance.settings.uri.achievement = "data/achievements-data-sample_id:id.json";
			widgetInstance.settings.notifications.settings.eventStream.push({
				achievementId: "2"
			})
		}
	});

	window._clLayoutsInstance = widgetInstance;

	// const miniScoreboard = new widgetInstance.MiniScoreBoard();
	// miniScoreboard.settings.active = true;
	// miniScoreboard.settings.lbWidget = widgetInstance;
	// const miniWrapper = miniScoreboard.layout();
	//
	//
	// const miniHorizontal = document.querySelector(".opt-1-mini-horizontal");
	// const miniHorizontalOpt = document.querySelector(".opt-1-mini-horizontal-opt");
	// miniScoreboard.settings.container = miniHorizontal.appendChild(miniWrapper);
	// miniScoreboard.settings.overlayContainer = miniHorizontal.appendChild(miniScoreboard.overlayLayout());
	// miniScoreboard.settings.infoContainer = conmisio.query(miniScoreboard.settings.container, '.cl-widget-ms-information-wrapper');
	//
	// var miniInstance
	//
	// setInterval(function(){
	// 	if( miniScoreboard.settings.lbWidget.settings.competition.activeCompetition !== null ){
	// 		miniScoreboard.layoutDefaultOrEmpty();
	// 	}
	// }, 3000);
})();
