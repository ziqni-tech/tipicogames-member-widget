import '@ziqni-tech/gamification-ux-package';
import '@ziqni-tech/gamification-ux-package/build/css/theme/cl-style-1-default-theme.css';

var widgetInstance = window._clLeaderBoardV3;

widgetInstance.settings.enableNotifications = false; // requires a working/valid SSE channel
widgetInstance.settings.memberId = "jon-doe-Asd3-_J_CgpY-bw2S2Sy";
widgetInstance.settings.uri.gatewayDomain = "10a92458d58344458d77baad9ae1a7fe";
widgetInstance.settings.apiKey = "";
widgetInstance.settings.spaceName = "your space";
widgetInstance.settings.gameId = "fruits";
widgetInstance.settings.bindContainer = document.body;

// lookup services override
widgetInstance.settings.uri.members = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/member-data-sample.json";
widgetInstance.settings.uri.competitions = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/competition-list-data-sample.json";
widgetInstance.settings.uri.competitionById = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/competition-data-sample_1.json";
widgetInstance.settings.uri.memberCompetitions = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/competition-list-data-sample.json";
widgetInstance.settings.uri.memberCompetitionById = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/competition-data-sample_1.json";
widgetInstance.settings.uri.contestLeaderboard = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/leaderboard-data.json";
widgetInstance.settings.uri.achievements = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/achievements-list-data-sample.json";
widgetInstance.settings.uri.achievement = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/achievements-data-sample.json";
widgetInstance.settings.uri.achievementsProgression = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/achievements-list-perc-data-sample.json";
widgetInstance.settings.uri.achievementsIssued = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/achievements-list-issued-data-sample.json";
widgetInstance.settings.uri.messages = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/messages-claimed-data-sample.json";
widgetInstance.settings.uri.memberReward = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/messages-reward-data-sample.json";
widgetInstance.settings.uri.messageById = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/messages-data-sample.json";
widgetInstance.settings.uri.assets = "https://ziqni.cdn.ziqni.com/ziqni-tech/gamification-ux-package/ziqni_widget/json/daeC22EBrGt8uv3Bd5lJ.png";

widgetInstance.init();
