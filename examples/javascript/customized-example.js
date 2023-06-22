(function(){
  var widgetInstance = window._clLeaderBoardV3;

  widgetInstance.settings.enableNotifications = false; // requires a working/valid SSE channel
  widgetInstance.settings.memberId = "jon-doe-Asd3-_J_CgpY-bw2S2Sy";
  widgetInstance.settings.uri.gatewayDomain = "";
  widgetInstance.settings.apiKey = "";
  widgetInstance.settings.spaceName = "your space";
  widgetInstance.settings.gameId = "fruits";
  widgetInstance.settings.bindContainer = document.getElementById("my-widget-container");

  // lookup services override
  widgetInstance.settings.uri.members = "data/member-data-sample.json";
  widgetInstance.settings.uri.competitions = "data/competition-list-data-sample.json";
  widgetInstance.settings.uri.competitionById = "data/competition-data-sample.json";
  widgetInstance.settings.uri.memberCompetitions = "data/competition-list-data-sample.json";
  widgetInstance.settings.uri.memberCompetitionById = "data/competition-data-sample.json";
  widgetInstance.settings.uri.contestLeaderboard = "data/leaderboard-data.json";
  widgetInstance.settings.uri.achievements = "data/achievements-list-data-sample.json";
  widgetInstance.settings.uri.achievement = "data/achievements-data-sample.json";
  widgetInstance.settings.uri.achievementsProgression = "data/achievements-list-perc-data-sample.json";
  widgetInstance.settings.uri.achievementsIssued = "data/achievements-list-issued-data-sample.json";
  widgetInstance.settings.uri.messages = "data/messages-claimed-data-sample.json";
  widgetInstance.settings.uri.memberReward = "data/messages-reward-data-sample.json";
  widgetInstance.settings.uri.messageById = "data/messages-data-sample.json";
  widgetInstance.settings.uri.assets = "images/:attachmentId.png";
  widgetInstance.settings.resources = [
    ("/build/css/style.css?t=" + ( new Date().getTime() ))
  ];

  widgetInstance.settings.styles = {
    widgetBgColor: '#1f294a',
    widgetIcon: 'url(../../../examples/images/logo-icon-3.png)'
  };

  //   List of properties that might be overridden // default value

  //   widgetIcon     // url(../images/logo-icon2.png)
  //   widgetBgColor      // #212121
  //   widgetBorderColor      // #000000
  //   widgetTextColor      // #ffffff
  //   widgetDateTextColor      // #ffffff
  //   widgetHeaderTextColor      // #7a7a7a
  //
  //   widgetNavigationIconWidth    // 73px
  //   widgetNavigationIconHeight   // 73px
  //
  //   TOURNAMENTS
  //-------------------------------------------------
  //   tournamentIcon     //  url(../images/big-tournament-icon.svg)
  //   tournamentIconBgImage      //  url(../images/big-green-btn-icon2.png)
  //   tournamentDetailsBgColor     //  #28a02a
  //   tournamentDetailsLabelColor      //  #ffffff
  //   tournamentFooterBgColor      //  #2bb22e
  //   tournamentFooterTextColor      //  #212121
  //   tournamentContainerBgColor     //  #28a02a
  //   tournamentContainerTextColor     //  #ffffff
  //   tournamentHeaderTextColor      //  #a9d9aa
  //   tournamentTopResultsBgColor      //  #0d980e
  //   tournamentDetailsContainerBgColor      //  #28a02a
  //   tournamentDetailsHeaderColor     //  #ffffff
  //   tournamentDetailsDateColor     //  #ffffff
  //   tournamentDetailsBodyColor     //  #ffffff
  //   tournamentDetailsLinkColor     //  #2c9ab7
  //   tournamentListBgColor      //  #28a02a
  //
  //   ACHIEVEMENTS
  //-------------------------------------------------
  //   achievementsIcon     //  url(../images/big-challenge-icon.svg)
  //   achievementsIconBgImage      //  url(../images/big-blue-btn-icon2.png)
  //   achievementsHeaderBgColor      //  #23b3dd
  //   achievementsDetailsBgColor     //  #00a1bd
  //   achievementsContainerBgColor     //  #00a1bd
  //   achievementsDetailsHeaderTextColor     //  #ffffff
  //   achievementsDetailsDateColor     //  #ffffff
  //   achievementsDetailsBodyColor     //  #ffffff
  //   achievementsDetailsLinkColor     //  #2c9ab7
  //   achievementsFooterBgColor      //  #23b3dd
  //   achievementsFooterTextColor      //  #212121
  //   achievementsDividerColor     //  #068aa2
  //   achievementsItemLabelColor     //  #ffffff
  //   achievementsItemBodyColor      //  #ffffff
  //   achievementsProgressBgColor      //  #068aa2
  //   achievementsProgressFillColor      //  #ffffff
  //   achievementsBtnBgColor     //  #23b3dd
  //   achievementsBtnHoverColor      //  #29c2ef
  //
  //   REWARDS
  //-------------------------------------------------
  //   rewardsIcon      //  url(../images/big-reward-icon.svg)
  //   rewardsIconBgImage     //  url(../images/big-orange-btn-icon2.png)
  //   rewardsHeaderBgColor     //  #f18d32
  //   rewardsFooterBgColor     //  #f18d32
  //   rewardsFooterTextColor     //  #212121
  //   rewardsBgColor     //  #e88229
  //   rewardsDividerColor      //  #c56008
  //   rewardsItemLabelColor      //  #ffffff
  //   rewardsItemBodyColor     //  #ffffff
  //   rewardsItemHoverBgColor      //  #dd790c
  //   rewardsAccordionBgColor      //  #cc6e09
  //   rewardsAccordionHoverColor     //  #ab6d2a
  //   rewardsDetailsBgColor      //  #e88229
  //   rewardsDetailsTitleColor     //  #ffffff
  //   rewardsDetailsDateColor      //  #ffffff
  //   rewardsDetailsBodyColor      //  #ffffff
  //   rewardsWinningsBgColor     //  #cb6e09
  //   rewardsBtnBgColor      //  #ff6d00
  //   rewardsBtnHoverColor     //  #ec6603
  //
  //   MESSAGES
  //-------------------------------------------------
  //   messagesIcon     //  url(../images/big-message-icon.svg)
  //   messagesIconBgImage      //  url(../images/big-red-btn-icon.svg)
  //   messagesHeaderBgColor      //  #f84128
  //   messagesHeaderTextColor      //  #ffffff
  //   messagesHeaderDateColor      //  #ffffff
  //   messagesItemBgColor      //  #ff020c
  //   messagesItemHoverColor     //  #d50004
  //   messagesItemDividerColor     //  #c56008
  //   messagesItemLabelColor     //  #ffffff
  //   messagesItemTextColor      //  #ffffff
  //   messagesDetailsBgColor     //  #d50004
  //   messagesDetailsTitleColor      //  #ffffff
  //   messagesDetailsDateColor     //  #ffffff
  //   messagesDetailsTextColor     //  #ffffff
  //   messagesFooterBgColor      //  #f84128
  //   messagesFooterTextColor      //  #212121

  widgetInstance.init();
})();
