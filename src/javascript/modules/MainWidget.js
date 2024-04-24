import moment from 'moment';
import mapObject from '../utils/mapObject';
import hasClass from '../utils/hasClass';
import removeClass from '../utils/removeClass';
import objectIterator from '../utils/objectIterator';
import query from '../utils/query';
import closest from '../utils/closest';
import addClass from '../utils/addClass';
import remove from '../utils/remove';
import appendNext from '../utils/appendNext';
import stripHtml from '../utils/stripHtml';
import cloneDeep from 'lodash.clonedeep';
import { ContestRequest } from '@ziqni-tech/member-api-client';

/**
 * MainWidget
 * @param options {Object}
 * @constructor
 */
export const MainWidget = function (options) {
  /**
   * MainWidget settings
   * @memberOf MainWidget
   * @constant
   * @type { Object }
   */
  this.settings = {
    lbWidget: null,
    container: null,
    overlayContainer: null,
    navigation: null,
    section: null,
    detailsContainer: null,
    tournamentListContainer: null,
    headerDate: null,
    labelDate: null,
    labelDateHeaders: null,
    detailsDateHeaders: null,
    descriptionDate: null,
    awardTAndC: null,
    preLoader: {
      preLoaderActive: false,
      preLoaderlastAttempt: null,
      preloaderCallbackRecovery: function () {
      }
    },
    achievement: {
      container: null,
      detailsContainer: null,
      achievement: null
    },
    reward: {
      container: null,
      detailsContainer: null,
      timerInterval: null
    },
    tournament: {
      timerInterval: null
    },
    leaderboard: {
      defaultEmptyList: 3,
      topResultSize: 3,
      header: null,
      container: null,
      resultContainer: null,
      list: null,
      topResults: null,
      timerInterval: null
    },
    tournamentsSection: {
      accordionLayout: [
        {
          label: 'Active Tournaments',
          type: 'activeCompetitions',
          show: true,
          showTopResults: 0
        },
        {
          label: 'Finished Tournaments',
          type: 'finishedCompetitions',
          show: false,
          showTopResults: 0
        }
      ]
    },
    rewardsSection: {
      accordionLayout: [
        {
          label: 'Available Awards',
          type: 'availableAwards',
          show: true,
          showTopResults: 1
        },
        {
          label: 'Past Awards',
          type: 'pastAwards',
          show: false,
          showTopResults: 1
        }
      ]
    },
    achievementSection: {
      accordionLayout: [
        {
          label: 'Current',
          type: 'current',
          show: true,
          showTopResults: 1
        },
        {
          label: 'Past',
          type: 'past',
          show: false,
          showTopResults: 1
        }
      ]
    },
    active: false,
    navigationSwitchLastAtempt: new Date().getTime(),
    navigationSwitchInProgress: false
  };

  if (typeof options !== 'undefined') {
    for (var opt in options) {
      if (options.hasOwnProperty(opt)) {
        this.settings[opt] = options[opt];
      }
    }
  }

  /**
   * Accordion style layout
   * - parameters:
   *      - label: String "Available rewards"
   *      - type: String "available-rewards"
   *      - shown: Boolean true/false
   *
   * @memberOf MainWidget
   * @param data { Array }
   * @param onLayout { Function }
   */
  this.awardsList = function (data, onLayout) {
    const _this = this;
    const accordionWrapper = document.createElement('div');

    accordionWrapper.setAttribute('class', 'cl-main-accordion-container');

    const statusMenu = document.createElement('div');
    statusMenu.setAttribute('class', 'cl-main-accordion-container-menu');

    const availableTitle = document.createElement('div');
    const claimedTitle = document.createElement('div');

    availableTitle.setAttribute('class', 'cl-main-accordion-container-menu-item availableAwards');
    claimedTitle.setAttribute('class', 'cl-main-accordion-container-menu-item claimedAwards');

    const idx = data.findIndex(d => d.show === true);
    if (idx !== -1) {
      switch (data[idx].type) {
        case 'availableAwards':
          availableTitle.classList.add('active');
          break;
        case 'pastAwards':
          claimedTitle.classList.add('active');
          break;
      }
    }

    availableTitle.innerHTML = _this.settings.lbWidget.settings.translation.rewards.availableRewards;
    claimedTitle.innerHTML = _this.settings.lbWidget.settings.translation.rewards.claimed;

    statusMenu.appendChild(availableTitle);
    statusMenu.appendChild(claimedTitle);

    accordionWrapper.appendChild(statusMenu);

    mapObject(data, function (entry) {
      const accordionSection = document.createElement('div');
      const topShownEntry = document.createElement('div');
      const accordionListContainer = document.createElement('div');
      const accordionList = document.createElement('div');

      accordionSection.setAttribute('class', 'cl-accordion ' + entry.type + ((typeof entry.show === 'boolean' && entry.show) ? ' cl-shown' : ''));
      topShownEntry.setAttribute('class', 'cl-accordion-entry');
      accordionListContainer.setAttribute('class', 'cl-accordion-list-container');
      accordionList.setAttribute('class', 'cl-accordion-list');

      if (typeof onLayout === 'function') {
        onLayout(accordionSection, accordionList, topShownEntry, entry);
      }

      accordionListContainer.appendChild(accordionList);

      accordionSection.appendChild(accordionListContainer);

      accordionWrapper.appendChild(accordionSection);
    });

    return accordionWrapper;
  };

  this.tournamentsList = function (data, onLayout) {
    const _this = this;
    const accordionWrapper = document.createElement('div');

    accordionWrapper.setAttribute('class', 'cl-main-accordion-container');

    const statusMenu = document.createElement('div');
    statusMenu.setAttribute('class', 'cl-main-accordion-container-menu');

    const finishedTitle = document.createElement('div');
    const activeTitle = document.createElement('div');

    finishedTitle.setAttribute('class', 'cl-main-accordion-container-menu-item finishedTournaments');
    activeTitle.setAttribute('class', 'cl-main-accordion-container-menu-item activeTournaments');

    const idx = data.findIndex(d => d.show === true);
    if (idx !== -1) {
      switch (data[idx].type) {
        case 'activeCompetitions':
          activeTitle.classList.add('active');
          break;
        case 'finishedCompetitions':
          finishedTitle.classList.add('active');
          break;
      }
    }

    finishedTitle.innerHTML = _this.settings.lbWidget.settings.translation.tournaments.finishedCompetitions;
    activeTitle.innerHTML = _this.settings.lbWidget.settings.translation.tournaments.activeCompetitions;

    statusMenu.appendChild(activeTitle);
    statusMenu.appendChild(finishedTitle);

    accordionWrapper.appendChild(statusMenu);

    mapObject(data, function (entry) {
      const accordionSection = document.createElement('div');
      const accordionLabel = document.createElement('div');
      const topShownEntry = document.createElement('div');
      const accordionListContainer = document.createElement('div');
      const accordionList = document.createElement('div');

      accordionSection.setAttribute('class', 'cl-accordion ' + entry.type + ((typeof entry.show === 'boolean' && entry.show) ? ' cl-shown' : ''));
      topShownEntry.setAttribute('class', 'cl-accordion-entry');
      accordionListContainer.setAttribute('class', 'cl-accordion-list-container');
      accordionList.setAttribute('class', 'cl-accordion-list');

      if (typeof onLayout === 'function') {
        onLayout(accordionSection, accordionList, topShownEntry, entry);
      }

      accordionListContainer.appendChild(accordionList);

      accordionSection.appendChild(accordionLabel);
      accordionSection.appendChild(topShownEntry);
      accordionSection.appendChild(accordionListContainer);

      accordionWrapper.appendChild(accordionSection);
    });

    return accordionWrapper;
  };

  this.listsNavigation = function (element) {
    const menuItems = element.parentNode.querySelectorAll('.cl-main-accordion-container-menu-item');
    const container = element.closest('.cl-main-accordion-container');
    const sections = container.querySelectorAll('.cl-accordion');

    menuItems.forEach(i => i.classList.remove('active'));
    element.classList.add('active');

    sections.forEach(s => s.classList.remove('cl-shown'));

    if (element.classList.contains('finishedTournaments')) {
      const finishedContainer = container.querySelector('.finishedCompetitions');
      finishedContainer.classList.add('cl-shown');
    }
    if (element.classList.contains('activeTournaments')) {
      const activeContainer = container.querySelector('.activeCompetitions');
      activeContainer.classList.add('cl-shown');
    }

    if (element.classList.contains('availableAwards')) {
      const availableContainer = container.querySelector('.cl-accordion.availableAwards');
      availableContainer.classList.add('cl-shown');
    }
    if (element.classList.contains('claimedAwards')) {
      const claimedContainer = container.querySelector('.cl-accordion.pastAwards');
      claimedContainer.classList.add('cl-shown');
    }

    if (element.classList.contains('currentAchievements')) {
      const availableContainer = container.querySelector('.cl-accordion.current');
      availableContainer.classList.add('cl-shown');
    }
    if (element.classList.contains('pastAchievements')) {
      const claimedContainer = container.querySelector('.cl-accordion.past');
      claimedContainer.classList.add('cl-shown');
    }
  };

  this.accordionNavigation = function (element) {
    const parentEl = element.parentNode;

    if (hasClass(parentEl, 'cl-shown')) {
      removeClass(parentEl, 'cl-shown');
    } else {
      objectIterator(query(closest(parentEl, '.cl-main-accordion-container'), '.cl-shown'), function (obj) {
        removeClass(obj, 'cl-shown');
      });

      addClass(parentEl, 'cl-shown');
    }
  };

  this.navigationSorter = function (a, b) {
    if (a.order < b.order) {
      return -1;
    }
    if (a.order > b.order) {
      return 1;
    }
    return 0;
  };

  this.navigationItems = function (container, navigationList) {
    const _this = this;

    // sorting navigation by order number
    navigationList.sort(_this.navigationSorter);

    mapObject(navigationList, function (val, key) {
      const navigationItem = document.createElement('div');
      const navigationItemIcon = document.createElement('div');
      const navigationItemTitle = document.createElement('div');
      if (val.key === 'inbox') {
        navigationItemTitle.innerHTML = _this.settings.lbWidget.settings.translation.messages.label;
      } else {
        navigationItemTitle.innerHTML = _this.settings.lbWidget.settings.translation[val.key].label;
      }

      navigationItem.setAttribute('class', _this.settings.lbWidget.settings.navigation[val.key].navigationClass + ' cl-main-widget-navigation-item' + (_this.settings.lbWidget.settings.navigation[val.key].enable ? '' : ' cl-hidden-navigation-item'));
      navigationItemIcon.setAttribute('class', _this.settings.lbWidget.settings.navigation[val.key].navigationClassIcon + ' cl-main-navigation-item');
      navigationItemTitle.setAttribute('class', 'cl-main-navigation-item-title');

      navigationItem.appendChild(navigationItemIcon);
      navigationItem.appendChild(navigationItemTitle);
      container.appendChild(navigationItem);
    });
  };

  this.overlayLayout = function () {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'cl-widget-main-widget-overlay-wrapper');

    return wrapper;
  };

  this.layout = function () {
    const _this = this;
    const wrapper = document.createElement('div');
    const innerWrapper = document.createElement('div');

    const navigationContainer = document.createElement('div');
    const navigationItems = document.createElement('div');

    const mainSectionContainer = document.createElement('div');

    const preLoaderContainer = document.createElement('div');
    const preLoaderContent = document.createElement('div');

    const sectionLB = _this.leaderboardAreaLayout();
    const sectionACH = _this.achievementsAreaLayout();
    const sectionRewards = _this.rewardsAreaLayout();
    const sectionDashboard = _this.dashboardAreaLayout();

    const landscapeClose = document.createElement('div');

    const errorPage = document.createElement('div');
    errorPage.setAttribute('class', 'cl-main-widget-error');
    const errorTemplate = require('../templates/mainWidget/error.hbs');
    errorPage.innerHTML = errorTemplate({
      errorLabel: this.settings.lbWidget.settings.translation.error.errorLabel,
      errorTitle: this.settings.lbWidget.settings.translation.error.errorTitle,
      errorDescription: this.settings.lbWidget.settings.translation.error.errorDescription
    });

    landscapeClose.setAttribute('class', 'cl-landscape-close');

    const navigationItemList = [];
    mapObject(_this.settings.lbWidget.settings.navigation, function (val, key) {
      navigationItemList.push({
        key: key,
        order: parseInt(val.order)
      });
    });

    _this.navigationItems(navigationItems, navigationItemList); // populate sorted navigation

    wrapper.setAttribute('class', 'cl-main-widget-wrapper');
    innerWrapper.setAttribute('class', 'cl-main-widget-inner-wrapper');

    navigationContainer.setAttribute('class', 'cl-main-widget-navigation-container');
    navigationItems.setAttribute('class', 'cl-main-widget-navigation-items');

    mainSectionContainer.setAttribute('class', 'cl-main-widget-section-container' + (_this.settings.lbWidget.settings.showCopyright ? '' : ' cl-hidden-copyright'));

    preLoaderContainer.setAttribute('class', 'cl-main-widget-pre-loader');
    preLoaderContent.setAttribute('class', 'cl-main-widget-pre-loader-content');

    preLoaderContainer.appendChild(preLoaderContent);

    navigationContainer.appendChild(navigationItems);

    mainSectionContainer.appendChild(sectionLB);
    mainSectionContainer.appendChild(sectionACH);
    mainSectionContainer.appendChild(sectionRewards);
    mainSectionContainer.appendChild(sectionDashboard);
    mainSectionContainer.appendChild(preLoaderContainer);
    mainSectionContainer.appendChild(landscapeClose);
    mainSectionContainer.appendChild(errorPage);

    innerWrapper.appendChild(mainSectionContainer);
    wrapper.appendChild(innerWrapper);

    return wrapper;
  };

  this.mainNavigationCheck = function () {
    const _this = this;
    const navItems = query(_this.settings.container, '.cl-main-widget-navigation-item');
    let checkEnabled = 0;

    objectIterator(navItems, function (navItem) {
      if (!hasClass(navItem, 'cl-hidden-navigation-item')) {
        checkEnabled++;
      }
    });

    if (checkEnabled === 1) {
      addClass(query(_this.settings.container, '.cl-main-widget-inner-wrapper'), 'cl-hidden-navigation');
    } else if (checkEnabled === 0) {
      _this.settings.lbWidget.log('All navigation items disabled, check [this.settings.lbWidget.settings.navigation]');
    }
  };

  this.leaderboardAreaLayout = function () {
    const sectionLB = document.createElement('div');
    sectionLB.setAttribute('class', this.settings.lbWidget.settings.navigation.tournaments.containerClass + ' cl-main-section-item cl-main-active-section');

    const template = require('../templates/mainWidget/leaderboard.hbs');
    sectionLB.innerHTML = template({
      tournamentsLabel: this.settings.lbWidget.settings.translation.tournaments.label,
      descriptionLabel: this.settings.lbWidget.settings.translation.global.descriptionLabel,
      tAndCLabel: this.settings.lbWidget.settings.translation.global.tAndCLabel,
      enterLabel: this.settings.lbWidget.settings.translation.tournaments.enter,
      globalCopy: this.settings.lbWidget.settings.translation.global.copy,
      monthsFull: this.settings.lbWidget.settings.translation.time.monthsFull,
      daysFull: this.settings.lbWidget.settings.translation.time.daysFull,
      hoursFull: this.settings.lbWidget.settings.translation.time.hoursFull,
      minutesFull: this.settings.lbWidget.settings.translation.time.minutesFull,
      secondsFull: this.settings.lbWidget.settings.translation.time.secondsFull,
      infoLabel: this.settings.lbWidget.settings.translation.tournaments.infoLabel,
      leaderboardLabel: this.settings.lbWidget.settings.translation.tournaments.leaderboardLabel,
      positionLabel: this.settings.lbWidget.settings.translation.tournaments.positionLabel,
      spinsLeftLabel: this.settings.lbWidget.settings.translation.tournaments.spinsLeftLabel,
      pointsLabel: this.settings.lbWidget.settings.translation.tournaments.pointsLabel,
      durationLabel: this.settings.lbWidget.settings.translation.tournaments.durationLabel,
      spinLimitLabel: this.settings.lbWidget.settings.translation.tournaments.spinLimitLabel,
      minBetLabel: this.settings.lbWidget.settings.translation.tournaments.minBetLabel,
      pickAGameLabel: this.settings.lbWidget.settings.translation.tournaments.pickAGameLabel,
      howToLabel: this.settings.lbWidget.settings.translation.tournaments.howToLabel,
      abortLabel: this.settings.lbWidget.settings.translation.tournaments.abortLabel,
      endsLabel: this.settings.lbWidget.settings.translation.tournaments.endsLabel,
      startsLabel: this.settings.lbWidget.settings.translation.tournaments.startsLabel,
      pickAGameContLabel: this.settings.lbWidget.settings.translation.tournaments.pickAGameContLabel,
      drawerTitle: this.settings.lbWidget.settings.translation.tournaments.drawerTitle,
      drawerDescription: this.settings.lbWidget.settings.translation.tournaments.drawerDescription,
      drawerOntInBtn: this.settings.lbWidget.settings.translation.tournaments.drawerOntInBtn,
      optedInLabel: this.settings.lbWidget.settings.translation.tournaments.joinedLabel,
      liveLabel: this.settings.lbWidget.settings.translation.tournaments.liveLabel
    });

    return sectionLB;
  };

  this.achievementsAreaLayout = function () {
    const sectionACH = document.createElement('div');
    sectionACH.setAttribute('class', this.settings.lbWidget.settings.navigation.achievements.containerClass + ' cl-main-section-item');

    const template = require('../templates/layouts/achievementsAreaLayout.hbs');
    sectionACH.innerHTML = template({
      leavePopupTitle: this.settings.lbWidget.settings.translation.achievements.leavePopupTitle,
      leavePopupDescription: this.settings.lbWidget.settings.translation.achievements.leavePopupDescription,
      leavePopupActionConfirm: this.settings.lbWidget.settings.translation.achievements.leavePopupConfirm,
      leavePopupActionCancel: this.settings.lbWidget.settings.translation.achievements.leavePopupClose,
      descriptionLabel: this.settings.lbWidget.settings.translation.global.descriptionLabel,
      tAndCLabel: this.settings.lbWidget.settings.translation.global.tAndCLabel,
      progressLabel: this.settings.lbWidget.settings.translation.achievements.progress,
      headerLabel: this.settings.lbWidget.settings.translation.achievements.label,
      globalCopy: this.settings.lbWidget.settings.translation.global.copy,
      enterLabel: this.settings.lbWidget.settings.translation.achievements.enter,
      pickAGameLabel: this.settings.lbWidget.settings.translation.achievements.pickAGameLabel,
      abortMissionLabel: this.settings.lbWidget.settings.translation.achievements.abortMissionLabel,
      endsLabel: this.settings.lbWidget.settings.translation.achievements.endsLabel,
      pickAGameBtn: this.settings.lbWidget.settings.translation.achievements.pickAGameBtn,
      drawerLabel: this.settings.lbWidget.settings.translation.achievements.drawerLabel,
      drawerDescription: this.settings.lbWidget.settings.translation.achievements.drawerDescription,
      drawerPlayBtn: this.settings.lbWidget.settings.translation.achievements.drawerPlayBtn,
      optedInLabel: this.settings.lbWidget.settings.translation.achievements.optedInLabel
    });

    return sectionACH;
  };

  this.rewardsAreaLayout = function () {
    const sectionRewards = document.createElement('div');
    sectionRewards.setAttribute('class', this.settings.lbWidget.settings.navigation.rewards.containerClass + ' cl-main-section-item');

    const template = require('../templates/layouts/awardsAreaLayout.hbs');
    sectionRewards.innerHTML = template({
      headerLabel: this.settings.lbWidget.settings.translation.rewards.label,
      globalCopy: this.settings.lbWidget.settings.translation.global.copy,
      claimBtn: this.settings.lbWidget.settings.translation.rewards.claim,
      expiresInLabel: this.settings.lbWidget.settings.translation.rewards.expiresInLabel,
      gamesLabel: this.settings.lbWidget.settings.translation.rewards.gamesLabel,
      freeSpinDetailsLabel: this.settings.lbWidget.settings.translation.rewards.freeSpinDetailsLabel,
      totalLabel: this.settings.lbWidget.settings.translation.rewards.totalLabel,
      expiresOnLabel: this.settings.lbWidget.settings.translation.rewards.expiresOnLabel,
      campaignLabel: this.settings.lbWidget.settings.translation.rewards.campaignLabel,
      tAndCLabel: this.settings.lbWidget.settings.translation.global.tAndCLabel,
      forfeitLabel: this.settings.lbWidget.settings.translation.rewards.forfeitLabel,
      drawerLabel: this.settings.lbWidget.settings.translation.rewards.drawerLabel,
      drawerDescription: this.settings.lbWidget.settings.translation.rewards.drawerDescription,
      drawerKeepBtn: this.settings.lbWidget.settings.translation.rewards.drawerKeepBtn,
      drawerForfeitBtn: this.settings.lbWidget.settings.translation.rewards.drawerForfeitBtn
    });

    return sectionRewards;
  };

  this.dashboardAreaLayout = function () {
    const sectionDashboard = document.createElement('div');
    sectionDashboard.setAttribute('class', this.settings.lbWidget.settings.navigation.dashboard.containerClass + ' cl-main-section-item');

    const headerLabel = this.settings.lbWidget.settings.translation.dashboard.label +
      (this.settings.lbWidget.settings.member ? ', ' + this.settings.lbWidget.settings.member.name : '');

    const template = require('../templates/layouts/dashboardAreaLayout.hbs');
    sectionDashboard.innerHTML = template({
      isInstantWins: false,
      isAchievements: this.settings.lbWidget.settings.navigation.achievements.enable,
      isTournaments: this.settings.lbWidget.settings.navigation.tournaments.enable,
      seeAllLabel: this.settings.lbWidget.settings.translation.dashboard.seeAll,
      headerLabel: headerLabel,
      rewardsTitle: this.settings.lbWidget.settings.translation.dashboard.rewardsTitle,
      tournamentsTitle: this.settings.lbWidget.settings.translation.dashboard.tournamentsTitle,
      achievementsTitle: this.settings.lbWidget.settings.translation.dashboard.achievementsTitle,
      instantWinsTitle: this.settings.lbWidget.settings.translation.dashboard.instantWinsTitle,
      leavePopupTitle: this.settings.lbWidget.settings.translation.achievements.leavePopupTitle,
      leavePopupDescription: this.settings.lbWidget.settings.translation.achievements.leavePopupDescription,
      leavePopupActionConfirm: this.settings.lbWidget.settings.translation.achievements.leavePopupConfirm,
      leavePopupActionCancel: this.settings.lbWidget.settings.translation.achievements.leavePopupClose,
      instantWinsWheelTitle: this.settings.lbWidget.settings.translation.dashboard.singleWheelTitle,
      instantWinsWheelButton: this.settings.lbWidget.settings.translation.dashboard.singleWheelButton,
      instantWinsCardsTitle: this.settings.lbWidget.settings.translation.dashboard.scratchcardsTitle,
      instantWinsCardsButton: this.settings.lbWidget.settings.translation.dashboard.scratchcardsButton
    });

    return sectionDashboard;
  };

  this.leaderboardHeader = function () {
    addClass(this.settings.leaderboard.header, 'cl-reward-enabled');

    const rewardEnabled = typeof this.settings.lbWidget.settings.competition.activeContest !== 'undefined' &&
      this.settings.lbWidget.settings.competition.activeContest !== null &&
      typeof this.settings.lbWidget.settings.competition.activeContest.rewards !== 'undefined' &&
      this.settings.lbWidget.settings.competition.activeContest.rewards.length > 0;

    const template = require('../templates/mainWidget/leaderboardHeader.hbs');
    this.settings.leaderboard.header.innerHTML = template({
      rewardEnabled: rewardEnabled,
      rankColLabel: this.settings.lbWidget.settings.translation.leaderboard.rank,
      nameColLabel: this.settings.lbWidget.settings.translation.leaderboard.name,
      pointsColLabel: this.settings.lbWidget.settings.translation.leaderboard.points,
      rewardColLabel: this.settings.lbWidget.settings.translation.leaderboard.prize
    });
  };

  this.leaderboardRow = function (rank, icon, name, change, growth, points, reward, count, memberFound) {
    const cellWrapper = document.createElement('div');
    const memberFoundClass = (memberFound) ? ' cl-lb-member-row' : '';
    cellWrapper.setAttribute('class', 'cl-lb-row cl-lb-rank-' + rank + ' cl-lb-count-' + count + memberFoundClass);
    cellWrapper.dataset.rank = rank;

    const datasetGrowth = (change < 0) ? 'down' : (change > 0 ? 'up' : 'same');
    const datasetChange = change;

    const rewardEnabled = (typeof this.settings.lbWidget.settings.competition.activeContest !== 'undefined' && this.settings.lbWidget.settings.competition.activeContest !== null && typeof this.settings.lbWidget.settings.competition.activeContest.rewards !== 'undefined' && this.settings.lbWidget.settings.competition.activeContest.rewards.length > 0);

    const rewardValue = (typeof reward !== 'undefined' && reward !== null) ? reward : '';

    const template = require('../templates/mainWidget/leaderboardRow.hbs');
    cellWrapper.innerHTML = template({
      rank: rank,
      name: name,
      icon: icon,
      datasetGrowth: datasetGrowth,
      datasetChange: datasetChange,
      growth: growth,
      points: points,
      rewardEnabled: rewardEnabled,
      rewardEnabledClass: 'cl-col-reward-enabled',
      rewardValue: rewardValue
    });

    return cellWrapper;
  };

  this.leaderboardRowUpdate = function (rank, icon, name, change, growth, points, reward, count, memberFound, onMissing, isLast) {
    const _this = this;
    const cellRow = query(_this.settings.leaderboard.container, '.cl-lb-rank-' + rank + '.cl-lb-count-' + count);

    if (cellRow === null) {
      onMissing(rank, name ? name[0] : '', name, change, growth, points, reward, count, memberFound, isLast);
    } else {
      const rankCel = query(cellRow, '.cl-rank-col-value');
      const nameCel = query(cellRow, '.lb-name');
      const pointsCel = query(cellRow, '.cl-points-col');
      const memberFoundClass = 'cl-lb-member-row';
      const rowHasClass = hasClass(cellRow, memberFoundClass);

      if (count > 0 && !hasClass(cellRow, 'cl-shared-rank')) {
        addClass(cellRow, 'cl-shared-rank');
      }

      if (isLast) {
        addClass(cellRow, 'lb-last');
      }

      if (memberFound && !rowHasClass) {
        addClass(cellRow, memberFoundClass);
      } else if (!memberFound && rowHasClass) {
        removeClass(cellRow, memberFoundClass);
      }

      cellRow.dataset.rank = rank;
      rankCel.innerHTML = rank;
      nameCel.innerHTML = name;
      pointsCel.innerHTML = points;

      if (typeof _this.settings.lbWidget.settings.competition.activeContest !== 'undefined' && _this.settings.lbWidget.settings.competition.activeContest !== null && typeof _this.settings.lbWidget.settings.competition.activeContest.rewards !== 'undefined' && _this.settings.lbWidget.settings.competition.activeContest.rewards.length > 0) {
        const rewardCel = query(cellRow, '.lb-reward');
        if (rewardCel !== null) {
          rewardCel.innerHTML = (typeof reward !== 'undefined' && reward.length)
            ? `<span class='lb-reward-value'>${reward[0].rewardValue}</span> ${reward[0].name}`
            : '';
        }
      } else {
        const rewardCel = query(cellRow, '.cl-reward-col');
        if (rewardCel !== null) {
          rewardCel.innerHTML = '';
        }
      }
    }
  };

  this.populateLeaderboardResultsWithDefaultEntries = function (clearPrize = false) {
    const remainingResults = [];

    const emptyListLength = this.settings.lbWidget.settings.leaderboard.fullLeaderboardSize + 1;

    for (let s = 0; s < emptyListLength; s++) {
      const rank = s + 1;

      remainingResults.push({
        name: '-',
        rank: rank,
        score: '-',
        memberId: '',
        memberRefId: ''
      });
    }

    this.updateLeaderboardResults(remainingResults, clearPrize);
  };

  this.getRewardData = function (rank) {
    const _this = this;
    const rewardResponse = [];

    if (typeof _this.settings.lbWidget.settings.competition.activeContest !== 'undefined' && _this.settings.lbWidget.settings.competition.activeContest !== null) {
      mapObject(_this.settings.lbWidget.settings.competition.activeContest.rewards, function (reward) {
        if (reward.rewardRank.indexOf('-') !== -1 || reward.rewardRank.indexOf(',') !== -1) {
          const rewardRankArr = reward.rewardRank.split(',');
          rewardRankArr.forEach(r => {
            const idx = r.indexOf('-');
            if (idx !== -1) {
              const start = parseInt(r);
              const end = parseInt(r.substring(idx + 1));
              if (rank >= start && rank <= end) {
                rewardResponse.push(reward);
              }
            } else if (parseInt(r) === rank) {
              rewardResponse.push(reward);
            }
          });
        } else if (rank !== 0 && parseInt(reward.rewardRank) === rank) {
          rewardResponse.push(reward);
        }
      });
    }

    return rewardResponse;
  };

  this.getReward = function (rank) {
    const _this = this;
    const rewardResponse = [];

    if (typeof _this.settings.lbWidget.settings.competition.activeContest !== 'undefined' && _this.settings.lbWidget.settings.competition.activeContest !== null) {
      mapObject(_this.settings.lbWidget.settings.competition.activeContest.rewards, function (reward) {
        if (reward.rewardRank.indexOf('-') !== -1 || reward.rewardRank.indexOf(',') !== -1) {
          const rewardRankArr = reward.rewardRank.split(',');
          rewardRankArr.forEach(r => {
            const idx = r.indexOf('-');
            if (idx !== -1) {
              const start = parseInt(r);
              const end = parseInt(r.substring(idx + 1));
              if (rank >= start && rank <= end) {
                rewardResponse.push(_this.settings.lbWidget.settings.partialFunctions.rewardFormatter(reward));
              }
            } else if (parseInt(r) === rank) {
              rewardResponse.push(_this.settings.lbWidget.settings.partialFunctions.rewardFormatter(reward));
            }
          });
        } else if (rank !== 0 && parseInt(reward.rewardRank) === rank) {
          rewardResponse.push(_this.settings.lbWidget.settings.partialFunctions.rewardFormatter(reward));
        }
      });
    }

    return rewardResponse.join(', ');
  };

  this.updateLeaderboardResults = function (remainingResults, clearPrize = false) {
    const _this = this;
    const rankCheck = [];
    const cleanupRankCheck = [];

    // cleanup
    mapObject(remainingResults, function (lb) {
      cleanupRankCheck.push(lb.rank);
      objectIterator(query(_this.settings.leaderboard.list, '.cl-lb-rank-' + lb.rank + '.cl-shared-rank'), function (obj) {
        remove(obj);
      });
    });

    objectIterator(query(_this.settings.leaderboard.container, '.cl-lb-row'), function (obj) {
      const rank = parseInt(obj.dataset.rank);
      if (cleanupRankCheck.indexOf(rank) === -1 && (rank > _this.settings.leaderboard.defaultEmptyList || rank === 0)) {
        remove(obj);
      }
    });

    if (remainingResults[remainingResults.length - 1] && remainingResults[remainingResults.length - 2]) {
      if (remainingResults[remainingResults.length - 1].rank - remainingResults[remainingResults.length - 2].rank > 1) {
        remainingResults[remainingResults.length - 1].isLast = true;
      }
    }

    mapObject(remainingResults, function (lb) {
      let memberNames = '';
      let memberLbName = '';
      if (lb.members && lb.members.length) {
        memberNames = lb.members.map((m) => m.name);
        memberLbName = memberNames.join();
      } else {
        memberLbName = lb.name;
      }
      let count = 0;
      const icon = memberLbName && memberLbName.length ? memberLbName[0] : '';
      const memberFound = lb.members && lb.members.findIndex(m => m.memberRefId === _this.settings.lbWidget.settings.member.memberRefId) !== -1;
      let memberName = (memberFound) ? _this.settings.lbWidget.settings.translation.leaderboard.you : memberLbName;
      const memberNameLength = _this.settings.lbWidget.settings.memberNameLength;
      const reward = clearPrize ? '' : _this.getRewardData(lb.rank);
      const change = (typeof lb.change === 'undefined') ? 0 : lb.change;
      const growthType = (change < 0) ? 'down' : (change > 0 ? 'up' : 'same');
      const growthIcon = "<span class='cl-growth-icon cl-growth-" + growthType + "'></span>";
      const formattedPoints = _this.settings.lbWidget.settings.leaderboard.pointsFormatter(lb.score);

      if (rankCheck.indexOf(lb.rank) !== -1) {
        for (let rc = 0; rc < rankCheck.length; rc++) {
          if (lb.rank === rankCheck[rc]) {
            count++;
          }
        }
      }

      if (memberNameLength && memberName !== _this.settings.lbWidget.settings.translation.leaderboard.you) {
        memberName = memberName.slice(0, memberNameLength) + '*****';
      }

      _this.leaderboardRowUpdate(
        lb.rank,
        icon,
        memberName,
        change,
        growthIcon,
        formattedPoints,
        reward,
        count,
        memberFound,
        function (rank, icon, name, change, growth, points, reward, count, memberFound, isLast) {
          const newRow = _this.leaderboardRow(rank, icon, name, name, growth, points, reward, count, memberFound);
          if (isLast) newRow.classList.add('lb-last');
          const prevCellRow = query(_this.settings.leaderboard.container, '.cl-lb-rank-' + rank + '.cl-lb-count-' + (count - 1));

          if (prevCellRow !== null && typeof prevCellRow.length === 'undefined') {
            appendNext(prevCellRow, newRow);
          } else {
            _this.settings.leaderboard.list.appendChild(newRow);
          }
        },
        lb.isLast
      );

      rankCheck.push(lb.rank);
    });
  };

  this.updateLeaderboard = function () {
    const _this = this;
    // const topResults = [];
    const remainingResults = [];

    _this.populateLeaderboardResultsWithDefaultEntries();

    mapObject(_this.settings.lbWidget.settings.leaderboard.leaderboardData, function (lb) {
      remainingResults.push(lb);
    });

    // _this.updateLeaderboardTopResults(topResults);
    _this.updateLeaderboardResults(remainingResults);

    const member = query(_this.settings.leaderboard.resultContainer, '.cl-lb-member-row');

    const detailsContainer = document.querySelector('.cl-main-widget-lb-details-description-container');

    if (member !== null) {
      _this.missingMember(_this.isElementVisibleInView(member, detailsContainer));
    } else {
      _this.missingMemberReset();
    }
  };

  this.updateLeaderboardTime = function () {
    const _this = this;
    const descriptionDateEl = document.querySelector('.cl-main-widget-lb-details-description-date');
    const descriptionDateHeadersEl = document.querySelector('.cl-main-widget-lb-details-description-date-headers');
    const lbDateEl = document.querySelector('.cl-main-widget-lb-details-content-date');
    const lbDateHeaderEl = document.querySelector('.cl-main-widget-lb-details-content-date-headers');
    const descriptionMonthsLabel = document.querySelector('.cl-main-widget-lb-details-description-date-headers-item.months');
    const lbMonthsLabel = document.querySelector('.cl-main-widget-lb-details-content-date-headers-item.months');

    if (!_this.settings.lbWidget.settings.competition.activeContest && this.settings.lbWidget.settings.competition.activeCompetition.statusCode !== 15) {
      descriptionDateEl.style.display = 'none';
      lbDateEl.style.display = 'none';
      descriptionDateHeadersEl.style.display = 'none';
      lbDateHeaderEl.style.display = 'none';
    } else if (this.settings.lbWidget.settings.competition.activeCompetition && this.settings.lbWidget.settings.competition.activeCompetition.statusCode === 15) {
      descriptionDateEl.style.display = 'block';
      lbDateEl.style.display = 'block';
      descriptionDateHeadersEl.style.display = 'flex';
      lbDateHeaderEl.style.display = 'flex';

      const diff = moment(this.settings.lbWidget.settings.competition.activeCompetition.scheduledStartDate).diff(moment());
      const date = _this.settings.lbWidget.settings.translation.miniLeaderboard.startsIn + ': ' + _this.settings.lbWidget.formatDateTime(moment.duration(diff));
      const months = moment.duration(diff).months();
      if (months) {
        descriptionMonthsLabel.classList.remove('hidden');
        lbMonthsLabel.classList.remove('hidden');
      } else {
        descriptionMonthsLabel.classList.add('hidden');
        lbMonthsLabel.classList.add('hidden');
      }

      const labelDate = '<div class="cl-main-widget-lb-details-content-date-label">' +
        _this.settings.lbWidget.settings.translation.miniLeaderboard.startsIn +
        ':</div>' +
        _this.settings.lbWidget.formatBannerDateTime(moment.duration(diff));
      const descriptionDate = '<div class="cl-main-widget-lb-details-description-date-label">' +
        _this.settings.lbWidget.settings.translation.miniLeaderboard.startsIn +
        ':</div>' +
        _this.settings.lbWidget.formatBannerDateTime(moment.duration(diff));

      if (_this.settings.leaderboard.timerInterval) {
        clearTimeout(_this.settings.leaderboard.timerInterval);
      }

      _this.settings.headerDate.innerHTML = date;
      _this.settings.labelDate.innerHTML = labelDate;
      _this.settings.descriptionDate.innerHTML = descriptionDate;
      _this.settings.detailsContainerDate.innerHTML = date;
    } else {
      descriptionDateEl.style.display = 'block';
      lbDateEl.style.display = 'block';
      descriptionDateHeadersEl.style.display = 'flex';
      lbDateHeaderEl.style.display = 'flex';

      let diff = moment(_this.settings.lbWidget.settings.competition.activeContest.scheduledStartDate).diff(moment());
      let date = _this.settings.lbWidget.settings.translation.miniLeaderboard.startsIn + ': ' + _this.settings.lbWidget.formatDateTime(moment.duration(diff));
      let labelDate = '<div class="cl-main-widget-lb-details-content-date-label">' +
        _this.settings.lbWidget.settings.translation.miniLeaderboard.startsIn +
        ':</div>' +
        _this.settings.lbWidget.formatBannerDateTime(moment.duration(diff));
      let descriptionDate = '<div class="cl-main-widget-lb-details-description-date-label">' +
        _this.settings.lbWidget.settings.translation.miniLeaderboard.startsIn +
        ':</div>' +
        _this.settings.lbWidget.formatBannerDateTime(moment.duration(diff));
      const months = moment.duration(diff).months();
      if (months) {
        descriptionMonthsLabel.classList.remove('hidden');
        lbMonthsLabel.classList.remove('hidden');
      } else {
        descriptionMonthsLabel.classList.add('hidden');
        lbMonthsLabel.classList.add('hidden');
      }
      if (_this.settings.leaderboard.timerInterval) {
        clearTimeout(_this.settings.leaderboard.timerInterval);
      }

      if (diff <= 0 && _this.settings.lbWidget.settings.competition.activeContest.statusCode === 15) {
        date = _this.settings.lbWidget.settings.translation.miniLeaderboard.starting;
        labelDate = _this.settings.lbWidget.settings.translation.miniLeaderboard.starting;
        descriptionDate = _this.settings.lbWidget.settings.translation.miniLeaderboard.starting;
        _this.settings.labelDateHeaders.innerHTML = '';
        _this.settings.detailsDateHeaders.innerHTML = '';
      } else if (_this.settings.lbWidget.settings.competition.activeContest.statusCode === 20) {
        date = _this.settings.lbWidget.settings.translation.tournaments.starting;
        labelDate = _this.settings.lbWidget.settings.translation.tournaments.starting;
        descriptionDate = _this.settings.lbWidget.settings.translation.tournaments.starting;
        _this.settings.labelDateHeaders.innerHTML = '';
        _this.settings.detailsDateHeaders.innerHTML = '';
      } else if (_this.settings.lbWidget.settings.competition.activeContest.statusCode === 25) {
        diff = moment(_this.settings.lbWidget.settings.competition.activeContest.scheduledEndDate).diff(moment());
        date = _this.settings.lbWidget.formatDateTime(moment.duration(diff));
        labelDate = _this.settings.lbWidget.formatBannerDateTime(moment.duration(diff));
        descriptionDate = _this.settings.lbWidget.formatBannerDateTime(moment.duration(diff));

        const months = moment.duration(diff).months();
        if (months) {
          descriptionMonthsLabel.classList.remove('hidden');
          lbMonthsLabel.classList.remove('hidden');
        } else {
          descriptionMonthsLabel.classList.add('hidden');
          lbMonthsLabel.classList.add('hidden');
        }

        if (diff <= 0) {
          date = _this.settings.lbWidget.settings.translation.tournaments.finishing;
          labelDate = _this.settings.lbWidget.settings.translation.tournaments.finishing;
          descriptionDate = _this.settings.lbWidget.settings.translation.tournaments.finishing;
          descriptionDateHeadersEl.style.display = 'none';
          lbDateHeaderEl.style.display = 'none';
        }
      } else if (_this.settings.lbWidget.settings.competition.activeContest.statusCode === 30) {
        date = _this.settings.lbWidget.settings.translation.tournaments.finishing;
        labelDate = _this.settings.lbWidget.settings.translation.tournaments.finishing;
        descriptionDate = _this.settings.lbWidget.settings.translation.tournaments.finishing;
        descriptionDateHeadersEl.style.display = 'none';
        lbDateHeaderEl.style.display = 'none';
      } else if (_this.settings.lbWidget.settings.competition.activeContest.statusCode >= 35) {
        date = _this.settings.lbWidget.settings.translation.tournaments.finished;
        labelDate = _this.settings.lbWidget.settings.translation.tournaments.finished;
        descriptionDate = _this.settings.lbWidget.settings.translation.tournaments.finished;
        descriptionDateHeadersEl.style.display = 'none';
        lbDateHeaderEl.style.display = 'none';
      }

      _this.settings.headerDate.innerHTML = date;
      _this.settings.labelDate.innerHTML = labelDate;
      _this.settings.descriptionDate.innerHTML = descriptionDate;
      _this.settings.detailsContainerDate.innerHTML = date;
    }

    _this.settings.leaderboard.timerInterval = setTimeout(function () {
      _this.updateLeaderboardTime();
    }, 1000);
  };

  this.getActiveContestTitle = function () {
    let name = '';

    if (this.settings.lbWidget.settings.competition.activeCompetition && this.settings.lbWidget.settings.competition.activeCompetition.statusCode === 15) {
      name = this.settings.lbWidget.settings.competition.activeCompetition.name;
    } else {
      name = (
        this.settings.lbWidget.settings.competition.activeContest !== null &&
        this.settings.lbWidget.settings.competition.activeContest.name
      )
        ? this.settings.lbWidget.settings.competition.activeContest.name
        : this.settings.lbWidget.settings.translation.tournaments.noAvailableCompetitions;
    }

    return name;
  };

  this.getActiveContestIcon = function () {
    let iconUrl = '';

    if (this.settings.lbWidget.settings.competition.activeContest && this.settings.lbWidget.settings.competition.activeContest.iconLink) {
      iconUrl = this.settings.lbWidget.settings.competition.activeContest.iconLink;
    }

    return iconUrl;
  };

  this.getActiveContestRewardTitle = function () {
    let rewardTitle = '';

    if (this.settings.lbWidget.settings.competition.activeContest) {
      const reward = this.getRewardData(1);
      if (reward && reward.length) {
        rewardTitle = reward[0].name;
      }
    }

    return rewardTitle;
  };

  this.getActiveContestDuration = function () {
    let duration = '';

    if (this.settings.lbWidget.settings.competition.activeContest) {
      const diff = moment(this.settings.lbWidget.settings.competition.activeContest.scheduledEndDate)
        .diff(moment(this.settings.lbWidget.settings.competition.activeContest.scheduledStartDate));

      duration = moment.duration(diff).humanize();
    }

    return duration;
  };

  this.getActiveContestDate = function () {
    let date = '-';

    if (this.settings.lbWidget.settings.competition.activeContest) {
      date = new Date(this.settings.lbWidget.settings.competition.activeContest.scheduledEndDate)
        .toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });
    }

    return date;
  };

  this.getActiveContestStartDate = function () {
    let date = '-';

    if (this.settings.lbWidget.settings.competition.activeContest) {
      date = new Date(this.settings.lbWidget.settings.competition.activeContest.scheduledStartDate)
        .toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });
    }

    return date;
  };

  this.getActiveContestDescription = function () {
    return (
      this.settings.lbWidget.settings.competition.activeContest !== null &&
      this.settings.lbWidget.settings.competition.activeContest.description
    )
      ? this.settings.lbWidget.settings.competition.activeContest.description
      : '';
  };

  this.getActiveContestProducts = function (el) {
    const gameFull = query(this.settings.section, '.cl-main-widget-tournament-details-body .cl-main-widget-ach-details-game-full');
    const gameOverlay = query(this.settings.section, '.cl-main-widget-tournament-details-body .cl-main-widget-ach-details-game-overlay');
    let isExpand = false;

    if (
      this.settings.lbWidget.settings.competition.activeCompetition &&
      this.settings.lbWidget.settings.competition.activeCompetition.products &&
      this.settings.lbWidget.settings.competition.activeCompetition.products.length
    ) {
      if (this.settings.lbWidget.settings.competition.activeCompetition.products.length > 9) {
        isExpand = true;
      }

      this.settings.lbWidget.settings.competition.activeCompetition.products.forEach(product => {
        const item = this.createGameItem(product);
        el.appendChild(item);
      });
    }

    if (gameFull && gameOverlay) {
      if (isExpand) {
        gameFull.style.display = 'flex';
        gameOverlay.style.display = 'block';
      } else {
        gameFull.style.display = 'none';
        gameOverlay.style.display = 'none';
      }
    }
  };

  this.getActiveCompetitionDescription = function () {
    const description = (this.settings.lbWidget.settings.competition.activeContest !== null &&
        this.settings.lbWidget.settings.competition.activeContest.description &&
        this.settings.lbWidget.settings.competition.activeContest.description.length > 0)
      ? this.settings.lbWidget.settings.competition.activeContest.description
      : ((this.settings.lbWidget.settings.competition.activeCompetition !== null &&
            this.settings.lbWidget.settings.competition.activeCompetition.description &&
            this.settings.lbWidget.settings.competition.activeCompetition.description.length > 0)
        ? this.settings.lbWidget.settings.competition.activeCompetition.description : '');

    return description
      ? description.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      : '<p>' + this.settings.lbWidget.settings.translation.global.descriptionEmpty + '</p>';
  };

  this.getActiveCompetitionTAndC = function () {
    const tc = (this.settings.lbWidget.settings.competition.activeContest !== null &&
      this.settings.lbWidget.settings.competition.activeContest.termsAndConditions &&
      this.settings.lbWidget.settings.competition.activeContest.termsAndConditions.length > 0)
      ? this.settings.lbWidget.settings.competition.activeContest.termsAndConditions
      : ((this.settings.lbWidget.settings.competition.activeCompetition !== null &&
        this.settings.lbWidget.settings.competition.activeCompetition.termsAndConditions &&
        this.settings.lbWidget.settings.competition.activeCompetition.termsAndConditions.length > 0)
        ? this.settings.lbWidget.settings.competition.activeCompetition.termsAndConditions : '');

    return tc
      ? tc.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      : '<p>' + this.settings.lbWidget.settings.translation.global.tAndCEmpty + '</p>';
  };

  this.showTermsAndConditions = (type, id, contestId = null) => {
    const drawer = document.createElement('div');
    const wrapp = document.querySelector('.cl-main-widget-inner-wrapper');
    drawer.classList.add('terms-and-conditions-drawer');
    const template = require('../templates/mainWidget/termsAndConditions.hbs');

    if (type === 'achievement') {
      const idx = this.settings.lbWidget.settings.achievements.pastList.findIndex(ach => ach.id === id);
      if (idx !== -1) {
        const achievement = this.settings.lbWidget.settings.achievements.pastList[idx];

        drawer.innerHTML = template({
          label: this.settings.lbWidget.settings.translation.global.tAndCLabel,
          body: achievement.termsAndConditions ?? this.settings.lbWidget.settings.translation.global.tAndCEmpty,
          btnLabel: this.settings.lbWidget.settings.translation.global.tAndCDrawerBtnLabel
        });

        wrapp.appendChild(drawer);
      } else {
        this.settings.lbWidget.getAchievementsByIds([id])
          .then(achievement => {
            drawer.innerHTML = template({
              label: this.settings.lbWidget.settings.translation.global.tAndCLabel,
              body: achievement[0].termsAndConditions ?? this.settings.lbWidget.settings.translation.global.tAndCEmpty,
              btnLabel: this.settings.lbWidget.settings.translation.global.tAndCDrawerBtnLabel
            });

            wrapp.appendChild(drawer);
          });
      }
    } else if (type === 'contest') {
      this.settings.lbWidget.getContestsByIds([contestId])
        .then(contest => {
          const idx = this.settings.lbWidget.settings.tournaments.finishedCompetitions.findIndex(tour => tour.id === id);
          const tour = this.settings.lbWidget.settings.tournaments.finishedCompetitions[idx];

          let tAndC = this.settings.lbWidget.settings.translation.global.tAndCEmpty;
          if (contest.termsAndConditions) {
            tAndC = contest.termsAndConditions;
          } else if (tour.termsAndConditions) {
            tAndC = tour.termsAndConditions;
          }

          drawer.innerHTML = template({
            label: this.settings.lbWidget.settings.translation.global.tAndCLabel,
            body: tAndC,
            btnLabel: this.settings.lbWidget.settings.translation.global.tAndCDrawerBtnLabel
          });

          wrapp.appendChild(drawer);
        });
    } else if (type === 'award') {
      drawer.innerHTML = template({
        label: this.settings.lbWidget.settings.translation.global.tAndCLabel,
        body: this.awardTAndC ?? this.settings.lbWidget.settings.translation.global.tAndCEmpty,
        btnLabel: this.settings.lbWidget.settings.translation.global.tAndCDrawerBtnLabel
      });

      wrapp.appendChild(drawer);
    }
  };

  this.createLbRewardItem = function (reward) {
    const item = document.createElement('div');
    const positionEl = document.createElement('div');
    const valueEl = document.createElement('div');

    item.classList.add('cl-main-widget-lb-details-actions-reward-item');
    positionEl.classList.add('cl-main-widget-lb-details-actions-reward-item-position');
    valueEl.classList.add('cl-main-widget-lb-details-actions-reward-item-value');

    positionEl.classList.add('rank-' + reward.rewardRank);
    positionEl.innerHTML = reward.rewardRank;
    valueEl.innerHTML = reward.rewardValue + ' ' + reward.name;

    item.appendChild(positionEl);
    item.appendChild(valueEl);

    return item;
  };

  this.rewardRankSort = (a, b) => {
    const rankA = this.parseRewardRank(a.rewardRank);
    const rankB = this.parseRewardRank(b.rewardRank);

    if (rankA < rankB) {
      return -1;
    }
    if (rankA > rankB) {
      return 1;
    }
    return 0;
  };

  this.parseRewardRank = (rank) => {
    const parts = rank.split('-');
    return parseInt(parts[0]);
  };

  this.leaderboardDetailsUpdate = function () {
    const _this = this;
    const mainLabel = query(_this.settings.section, '.cl-main-widget-lb-details-content-label-text');
    let tc = null;
    let title = null;
    let headerLabel = null;
    let icon = null;
    const rewardTitle = query(_this.settings.section, '.cl-main-widget-lb-details-reward-title');
    const duration = query(_this.settings.section, '.cl-main-widget-tournament-details-body .cl-main-widget-lb-details-duration');
    const actionsDate = query(this.settings.section, '.cl-main-widget-lb-details-body-cta-ends-date');
    const actionsDateLabel = query(this.settings.section, '.cl-main-widget-lb-details .cl-main-widget-ach-details-body-cta-ends-label');
    const actionsStartDate = query(this.settings.section, '.cl-main-widget-lb-details-body-cta-starts-date');
    const actionsStartDateLabel = query(this.settings.section, '.cl-main-widget-ach-details-body-cta-starts-label');
    const description = query(this.settings.section, '.cl-main-widget-tournament-details-hw');
    const rewardItems = query(this.settings.section, '.cl-main-widget-lb-details-actions-reward-items');
    const rewardedEl = query(this.settings.section, '.cl-main-widget-lb-details-rewarded');
    const games = query(this.settings.section, '.cl-main-widget-ach-details-game-items.tour-games');
    const liveIcon = query(this.settings.section, '.cl-main-widget-lb-details .cl-main-widget-ach-details-body-cta-live');

    rewardedEl.innerHTML = this.settings.lbWidget.settings.translation.tournaments.rewarded.replace('$', this.settings.lbWidget.settings.leaderboard.fullLeaderboardSize);

    rewardItems.innerHTML = '';

    games.innerHTML = '';

    if (this.settings.lbWidget.settings.competition.activeContest && this.settings.lbWidget.settings.competition.activeContest.rewards) {
      const rewards = this.settings.lbWidget.settings.competition.activeContest.rewards.sort(this.rewardRankSort);
      rewards.forEach(reward => {
        const rewardItem = this.createLbRewardItem(reward);
        rewardItems.appendChild(rewardItem);
      });
    }

    tc = query(_this.settings.section, '.cl-main-widget-tournament-details-tc');
    title = query(_this.settings.section, '.cl-main-widget-lb-details-header-title');
    headerLabel = query(_this.settings.section, '.cl-main-widget-lb-header-label');
    icon = query(_this.settings.section, '.cl-main-widget-lb-details-image-cont');

    if (!title) return;

    tc.innerHTML = _this.getActiveCompetitionTAndC();
    title.innerHTML = _this.getActiveContestTitle();
    headerLabel.innerHTML = _this.getActiveContestTitle();
    const iconUrl = _this.getActiveContestIcon();
    icon.style = `background-image: url(${iconUrl})`;
    rewardTitle.innerHTML = _this.getActiveContestRewardTitle();
    duration.innerHTML = _this.getActiveContestDuration();
    actionsDate.innerHTML = _this.getActiveContestDate();
    actionsStartDate.innerHTML = _this.getActiveContestStartDate();

    if (this.settings.lbWidget.settings.competition.activeContest && this.settings.lbWidget.settings.competition.activeContest.statusCode === 15) {
      actionsDate.style.display = 'none';
      actionsDateLabel.style.display = 'none';
      actionsStartDate.style.display = 'block';
      actionsStartDateLabel.style.display = 'block';
    } else {
      actionsDate.style.display = 'block';
      actionsDateLabel.style.display = 'block';
      actionsStartDate.style.display = 'none';
      actionsStartDateLabel.style.display = 'none';
    }

    description.innerHTML = _this.getActiveContestDescription();
    _this.getActiveContestProducts(games);

    if (this.settings.lbWidget.settings.competition.activeCompetition && this.settings.lbWidget.settings.competition.activeCompetition.statusCode === 15) {
      mainLabel.innerHTML = this.settings.lbWidget.settings.competition.activeCompetition.name;
      liveIcon.style.display = 'none';
    } else {
      liveIcon.style.display = 'flex';
      mainLabel.innerHTML = (_this.settings.lbWidget.settings.competition.activeContest !== null)
        ? _this.settings.lbWidget.settings.competition.activeContest.name
        : _this.settings.lbWidget.settings.translation.tournaments.noAvailableCompetitions;
    }
  };

  this.showEmbeddedCompetitionDetailsContent = async function (callback) {
    if (!hasClass(this.settings.section, 'cl-main-active-embedded-description')) {
      addClass(this.settings.section, 'cl-main-active-embedded-description');
    }

    if (typeof callback === 'function') callback();
  };

  this.hideEmbeddedCompetitionDetailsContent = function (callback) {
    const missingMember = document.querySelector('.cl-main-widget-lb-missing-member-details');

    if (missingMember) {
      missingMember.style.display = 'none';
    }

    removeClass(this.settings.section, 'cl-main-active-embedded-description');
    if (typeof callback === 'function') callback();
  };

  this.leaderboardOptInCheck = async function () {
    const optIn = query(this.settings.section, '.cl-main-widget-lb-optin-action');
    const pickBtn = query(this.settings.section, '.cl-main-widget-lb-details-body-cta-ends-btn-pick');
    const abortBtn = query(this.settings.section, '.cl-main-widget-tournament-details-body-abort');
    const detailsData = query(this.settings.section, '.cl-main-widget-lb-details-data');
    const optedInLabel = query(this.settings.section, '.cl-main-widget-lb-details-header-opted-in');

    if (
      typeof this.settings.lbWidget.settings.competition.activeCompetition !== 'undefined' &&
      this.settings.lbWidget.settings.competition.activeCompetition !== null &&
      this.settings.lbWidget.settings.competition.activeCompetition.constraints &&
      this.settings.lbWidget.settings.competition.activeCompetition.constraints.includes('optinRequiredForEntrants')
    ) {
      const optInStatus = await this.settings.lbWidget.getCompetitionOptInStatus(
        this.settings.lbWidget.settings.competition.activeCompetition.id
      );

      if (optInStatus.length && optInStatus[0].statusCode >= 15 && optInStatus[0].statusCode <= 35) {
        optIn.parentNode.style.display = 'none';
        pickBtn.style.display = 'flex';
        optedInLabel.style.display = 'flex';
        abortBtn.style.display = 'block';
        detailsData.style.display = 'flex';
      } else if (optInStatus.length && (optInStatus[0].statusCode === 10 || optInStatus[0].statusCode === 0)) {
        optIn.innerHTML = this.settings.lbWidget.settings.translation.tournaments.processing;
        addClass(optIn, 'checking');
        optIn.parentNode.style.display = 'flex';
        pickBtn.style.display = 'none';
        optedInLabel.style.display = 'none';
        abortBtn.style.display = 'none';
        detailsData.style.display = 'none';
      } else {
        optIn.innerHTML = this.settings.lbWidget.settings.translation.tournaments.enter;
        optIn.parentNode.style.display = 'flex';
        removeClass(optIn, 'checking');
        pickBtn.style.display = 'none';
        optedInLabel.style.display = 'none';
        abortBtn.style.display = 'none';
        detailsData.style.display = 'none';
      }
    } else {
      optIn.parentNode.style.display = 'none';
      pickBtn.style.display = 'flex';
      optedInLabel.style.display = 'flex';
      abortBtn.style.display = 'block';
      detailsData.style.display = 'flex';
    }

    if (this.settings.lbWidget.settings.competition.activeCompetition && this.settings.lbWidget.settings.competition.activeCompetition.statusCode === 15) {
      detailsData.style.display = 'none';
    }
  };

  // cleanup/recover activity
  this.preLoaderRerun = function () {
    const _this = this;

    if (_this.settings.preLoader.preLoaderActive && _this.settings.preLoader.preloaderCallbackRecovery !== null &&
      _this.settings.preLoader.preLoaderlastAttempt !== null && typeof _this.settings.preLoader.preLoaderlastAttempt === 'number' &&
      (_this.settings.preLoader.preLoaderlastAttempt + 8000) < new Date().getTime()) {
      _this.settings.preLoader.preloaderCallbackRecovery();
    }
  };

  this.preloader = function () {
    const _this = this;
    const preLoader = query(_this.settings.section, '.cl-main-widget-pre-loader');

    return {
      show: function (callback) {
        _this.settings.preLoader.preLoaderActive = true;
        _this.settings.preLoader.preLoaderlastAttempt = new Date().getTime();
        preLoader.style.display = 'block';
        setTimeout(function () {
          preLoader.style.opacity = 1;
        }, 20);

        if (_this.settings.preLoader.preloaderCallbackRecovery === null && typeof callback === 'function') {
          _this.settings.preLoader.preloaderCallbackRecovery = callback;
        }

        callback();
      },
      hide: function () {
        _this.settings.preLoader.preLoaderActive = false;
        _this.settings.preLoader.preLoaderlastAttempt = null;
        preLoader.style.opacity = 0;

        if (_this.settings.preLoader.preloaderCallbackRecovery !== null) {
          _this.settings.preLoader.preloaderCallbackRecovery = null;
        }

        setTimeout(function () {
          preLoader.style.display = 'none';
        }, 200);
      }
    };
  };

  this.destroyLayout = function () {
    if (this.settings.container !== null) {
      remove(this.settings.container);
      remove(this.settings.overlayContainer);
    }

    this.settings.container = null;
    this.settings.overlayContainer = null;
  };

  this.loadLeaderboard = function (callback, isTimeReload = false) {
    const _this = this;

    if (_this.settings.container === null) {
      _this.settings.container = _this.settings.lbWidget.settings.bindContainer.appendChild(_this.layout());
      _this.settings.overlayContainer = _this.settings.lbWidget.settings.bindContainer.appendChild(_this.overlayLayout());
      _this.settings.navigation = query(_this.settings.container, '.cl-main-widget-navigation-container');
      _this.settings.section = query(_this.settings.container, '.cl-main-widget-section-container');
      _this.settings.leaderboard.container = query(_this.settings.section, '.cl-main-widget-lb-leaderboard');
      _this.settings.leaderboard.header = query(_this.settings.leaderboard.container, '.cl-main-widget-lb-leaderboard-header-labels');
      _this.settings.leaderboard.resultContainer = query(_this.settings.leaderboard.container, '.cl-main-widget-lb-leaderboard-res-container');
      _this.settings.leaderboard.list = query(_this.settings.leaderboard.container, '.cl-main-widget-lb-leaderboard-body-res');
      _this.settings.leaderboard.topResults = query(_this.settings.leaderboard.container, '.cl-main-widget-lb-leaderboard-header-top-res');
      _this.settings.detailsContainer = query(_this.settings.container, '.cl-main-widget-lb-details-container');
      _this.settings.tournamentListContainer = query(_this.settings.container, '.cl-main-widget-tournaments-list');
      _this.settings.detailsContainerDate = query(_this.settings.container, '.cl-main-widget-lb-details-header-date');
      _this.settings.headerDate = query(_this.settings.container, '.cl-main-widget-lb-header-date');
      _this.settings.labelDate = query(_this.settings.container, '.cl-main-widget-lb-details-content-date');
      _this.settings.labelDateHeaders = query(_this.settings.container, '.cl-main-widget-lb-details-content-date-headers');
      _this.settings.detailsDateHeaders = query(_this.settings.container, '.cl-main-widget-lb-details-description-date-headers');
      _this.settings.achievement.container = query(_this.settings.container, '.' + _this.settings.lbWidget.settings.navigation.achievements.containerClass);
      _this.settings.achievement.detailsContainer = query(_this.settings.container, '.cl-main-widget-ach-details-container');
      _this.settings.reward.container = query(_this.settings.container, '.' + _this.settings.lbWidget.settings.navigation.rewards.containerClass);
      _this.settings.reward.detailsContainer = query(_this.settings.container, '.cl-main-widget-reward-details-container');

      _this.mainNavigationCheck();
      _this.leaderboardHeader();
    }

    _this.eventListeners();

    _this.leaderboardOptInCheck();
    _this.leaderboardDetailsUpdate();
    _this.updateLeaderboard();

    if (typeof callback === 'function') {
      callback();
    }
  };

  this.clearAll = function () {
    this.settings.active = false;

    if (this.settings.leaderboard.timerInterval) {
      clearTimeout(this.settings.leaderboard.timerInterval);
    }

    this.settings.preLoader.preLoaderActive = false;
  };

  this.hide = function (callback) {
    const _this = this;

    document.body.classList.remove('no-scroll');

    _this.clearAll();

    if (_this.settings.container !== null) {
      removeClass(_this.settings.container, 'cl-show');

      setTimeout(function () {
        _this.settings.container.style.display = 'none';
        _this.settings.overlayContainer.style.display = 'none';

        _this.hideCompetitionDetails();
        _this.hideAchievementDetails();

        if (typeof callback === 'function') {
          callback();
        }
      }, 30);
    } else if (typeof callback === 'function') {
      callback();
    }
  };

  this.missingMember = function (isVisible) {
    const _this = this;
    const area = query(_this.settings.container, '.cl-main-widget-lb-missing-member');
    const areaDetails = query(_this.settings.container, '.cl-main-widget-lb-missing-member-details');
    let member = query(_this.settings.leaderboard.list, '.cl-lb-member-row');
    const detailsBody = document.querySelector('.cl-main-widget-tournament-details-body');
    const detailsData = detailsBody.querySelector('.cl-main-widget-lb-details-data');
    // const sectionContainer = query(_this.settings.container, '.cl-main-widget-section-container');

    if (!member) {
      member = query(_this.settings.leaderboard.topResults, '.cl-lb-member-row');
    }

    if (Array.isArray(member)) {
      member = member[0];
    }

    if (member) {
      const memberRank = member.querySelector('.cl-rank-col-value').innerHTML;
      const memberPoins = member.querySelector('.cl-points-col').innerHTML;
      const rankEl = detailsData.querySelector('.dashboard-tournament-list-details-position-value');
      const pointsEl = detailsData.querySelector('.dashboard-tournament-list-details-points-value');

      rankEl.innerHTML = memberRank;
      pointsEl.innerHTML = memberPoins;
    }

    if (area !== null && member !== null) {
      area.innerHTML = member.innerHTML;
    }

    if (areaDetails !== null && member !== null) {
      areaDetails.innerHTML = member.innerHTML;
    }

    if (isVisible) {
      if (area !== null && member !== null) {
        area.style.display = 'none';
      }
    } else {
      if (area !== null && member !== null) {
        area.style.display = 'flex';
      }
    }
  };

  this.missingMemberReset = function () {
    const _this = this;
    const area = query(_this.settings.container, '.cl-main-widget-lb-missing-member');
    const areaDetails = query(_this.settings.container, '.cl-main-widget-lb-missing-member-details');
    area.innerHTML = '';
    areaDetails.innerHTML = '';
  };

  this.isElementVisibleInView = function (el, container) {
    if (Array.isArray(el)) {
      el = el[0];
    }
    const position = el.getBoundingClientRect();
    const elemContainer = container.getBoundingClientRect();
    const elemTop = position.top;
    const elemBottom = position.bottom;
    const elemHeight = position.height;
    const indentation = 80;

    return (elemTop - indentation) <= elemContainer.top
      ? elemContainer.top - (elemTop - indentation) <= elemHeight : elemBottom - elemContainer.bottom <= elemHeight;
  };

  // this.isDashboardMemberVisibleInView = function (container, dashboardHeaderMember, dashboardHeader) {
  //   if (container.scrollTop > 32) {
  //     dashboardHeaderMember.classList.add('active');
  //     dashboardHeader.classList.add('filled');
  //   } else {
  //     dashboardHeaderMember.classList.remove('active');
  //     dashboardHeader.classList.remove('filled');
  //   }
  // };

  let onresizeInitialised = false;
  this.eventListeners = function () {
    const _this = this;

    if (_this.settings.leaderboard.list !== null && _this.settings.leaderboard.list.parentNode.onscroll === null) {
      const detailsContainer = _this.settings.leaderboard.list.closest('.cl-main-widget-lb-details-description-container');
      const lbHeaderLabel = document.querySelector('.cl-main-widget-lb-header-label');

      if (detailsContainer.onscroll === null) {
        detailsContainer.onscroll = function (evt) {
          evt.preventDefault();
          const member = query(_this.settings.leaderboard.resultContainer, '.cl-lb-member-row');

          if (member !== null) {
            _this.missingMember(_this.isElementVisibleInView(member, evt.target));
          }

          if (evt.target.scrollTop > 55) {
            lbHeaderLabel.classList.add('active');
          } else {
            lbHeaderLabel.classList.remove('active');
          }
        };
      }
    }

    if (_this.settings.achievement.detailsContainer !== null) {
      const detailsContainer = _this.settings.achievement.detailsContainer.querySelector('.cl-main-widget-ach-details-body-container');
      const lbHeaderLabel = document.querySelector('.cl-main-widget-ach-details-top-label');

      if (detailsContainer.onscroll === null) {
        detailsContainer.onscroll = function (evt) {
          evt.preventDefault();
          if (evt.target.scrollTop > 55) {
            lbHeaderLabel.classList.add('active');
          } else {
            lbHeaderLabel.classList.remove('active');
          }
        };
      }
    }

    if (!onresizeInitialised) {
      onresizeInitialised = true;
      window.onresize = function (evt) {
        const member = query(_this.settings.leaderboard.resultContainer, '.cl-lb-member-row');

        if (member !== null) {
          _this.missingMember(_this.isElementVisibleInView(member, _this.settings.leaderboard.resultContainer));
        }
      };
    }
  };

  this.competitionDetailsOptInButtonState = function () {
    const _this = this;
    const optIn = query(_this.settings.detailsContainer, '.cl-main-widget-lb-details-optin-action');

    if (typeof _this.settings.lbWidget.settings.competition.activeCompetition.optinRequired === 'boolean' && _this.settings.lbWidget.settings.competition.activeCompetition.optinRequired) {
      if (typeof _this.settings.lbWidget.settings.competition.activeCompetition.optin === 'boolean' && !_this.settings.lbWidget.settings.competition.activeCompetition.optin) {
        optIn.innerHTML = _this.settings.lbWidget.settings.translation.tournaments.enter;
        removeClass(optIn, 'cl-disabled');
      } else {
        optIn.innerHTML = _this.settings.lbWidget.settings.translation.tournaments.registered;
        addClass(optIn, 'cl-disabled');
      }
      optIn.parentNode.style.display = 'block';
    } else {
      optIn.parentNode.style.display = 'none';
    }
  };

  this.loadCompetitionDetails = function (callback) {
    const _this = this;
    const label = query(_this.settings.detailsContainer, '.cl-main-widget-lb-details-header-label');
    const body = query(_this.settings.detailsContainer, '.cl-main-widget-lb-details-body');
    const image = query(_this.settings.detailsContainer, '.cl-main-widget-lb-details-body-image-cont');

    image.innerHTML = '';
    label.innerHTML = (_this.settings.lbWidget.settings.competition.activeContest.label.length > 0) ? _this.settings.lbWidget.settings.competition.activeContest.label : _this.settings.lbWidget.settings.competition.activeCompetition.label;
    body.innerHTML = (_this.settings.lbWidget.settings.competition.activeContest.description.length > 0) ? _this.settings.lbWidget.settings.competition.activeContest.description : _this.settings.lbWidget.settings.competition.activeCompetition.description;
    _this.competitionDetailsOptInButtonState();

    _this.settings.detailsContainer.style.display = 'block';
    _this.settings.headerDate.style.display = 'none';

    setTimeout(function () {
      addClass(_this.settings.detailsContainer, 'cl-show');

      if (typeof callback === 'function') callback();
    }, 50);
  };

  this.loadCompetitionList = function (
    callback,
    readyPageNumber = 1,
    activePageNumber = 1,
    finishedPageNumber = 1,
    paginationArr = null,
    isReady = false,
    isActive = true,
    isFinished = false
  ) {
    const _this = this;
    const listResContainer = query(_this.settings.tournamentListContainer, '.cl-main-widget-tournaments-list-body-res');

    const totalCount = _this.settings.lbWidget.settings.tournaments.totalCount;
    const readyTotalCount = _this.settings.lbWidget.settings.tournaments.readyTotalCount;
    const finishedTotalCount = _this.settings.lbWidget.settings.tournaments.finishedTotalCount;
    const itemsPerPage = 20;

    const prev = document.createElement('span');
    prev.setAttribute('class', 'paginator-item prev');
    const next = document.createElement('span');
    next.setAttribute('class', 'paginator-item next');

    let paginator = query(listResContainer, '.paginator-active');
    if (!paginator && totalCount > itemsPerPage) {
      const pagesCount = Math.ceil(totalCount / itemsPerPage);
      paginator = document.createElement('div');
      paginator.setAttribute('class', 'paginator-active');
      addClass(paginator, 'paginator');
      addClass(paginator, 'accordion');

      let page = '';
      const isEllipsis = pagesCount > 7;

      if (isEllipsis) {
        for (let i = 0; i < 7; i++) {
          if (i === 5) {
            page += '<span class="paginator-item" data-page="..."\>...</span>';
          } else if (i === 6) {
            page += '<span class="paginator-item" data-page=' + pagesCount + '\>' + pagesCount + '</span>';
          } else {
            page += '<span class="paginator-item" data-page=' + (i + 1) + '\>' + (i + 1) + '</span>';
          }
        }
      } else {
        for (let i = 0; i < pagesCount; i++) {
          page += '<span class="paginator-item" data-page=' + (i + 1) + '\>' + (i + 1) + '</span>';
        }
      }

      paginator.innerHTML = page;

      const prev = document.createElement('span');
      prev.setAttribute('class', 'paginator-item prev');
      const next = document.createElement('span');
      next.setAttribute('class', 'paginator-item next');

      paginator.prepend(prev);
      paginator.appendChild(next);
    }

    let readyPaginator = query(listResContainer, '.paginator-ready');
    if (!readyPaginator && readyTotalCount > itemsPerPage) {
      const pagesCount = Math.ceil(readyTotalCount / itemsPerPage);
      readyPaginator = document.createElement('div');
      readyPaginator.setAttribute('class', 'paginator-ready');
      addClass(readyPaginator, 'paginator');
      addClass(readyPaginator, 'accordion');

      let page = '';
      const isEllipsis = pagesCount > 7;

      if (isEllipsis) {
        for (let i = 0; i < 7; i++) {
          if (i === 5) {
            page += '<span class="paginator-item" data-page="..."\>...</span>';
          } else if (i === 6) {
            page += '<span class="paginator-item" data-page=' + pagesCount + '\>' + pagesCount + '</span>';
          } else {
            page += '<span class="paginator-item" data-page=' + (i + 1) + '\>' + (i + 1) + '</span>';
          }
        }
      } else {
        for (let i = 0; i < pagesCount; i++) {
          page += '<span class="paginator-item" data-page=' + (i + 1) + '\>' + (i + 1) + '</span>';
        }
      }

      readyPaginator.innerHTML = page;

      const prev = document.createElement('span');
      prev.setAttribute('class', 'paginator-item prev');
      const next = document.createElement('span');
      next.setAttribute('class', 'paginator-item next');

      readyPaginator.prepend(prev);
      readyPaginator.appendChild(next);
    }

    let finishedPaginator = query(listResContainer, '.paginator-finished');
    if (!finishedPaginator && finishedTotalCount > itemsPerPage) {
      const pagesCount = Math.ceil(finishedTotalCount / itemsPerPage);
      finishedPaginator = document.createElement('div');
      finishedPaginator.setAttribute('class', 'paginator-finished');
      addClass(finishedPaginator, 'paginator');
      addClass(finishedPaginator, 'accordion');

      let page = '';
      const isEllipsis = pagesCount > 7;

      if (isEllipsis) {
        for (let i = 0; i < 7; i++) {
          if (i === 5) {
            page += '<span class="paginator-item" data-page="..."\>...</span>';
          } else if (i === 6) {
            page += '<span class="paginator-item" data-page=' + pagesCount + '\>' + pagesCount + '</span>';
          } else {
            page += '<span class="paginator-item" data-page=' + (i + 1) + '\>' + (i + 1) + '</span>';
          }
        }
      } else {
        for (let i = 0; i < pagesCount; i++) {
          page += '<span class="paginator-item" data-page=' + (i + 1) + '\>' + (i + 1) + '</span>';
        }
      }

      finishedPaginator.innerHTML = page;

      const prev = document.createElement('span');
      prev.setAttribute('class', 'paginator-item prev');
      const next = document.createElement('span');
      next.setAttribute('class', 'paginator-item next');

      finishedPaginator.prepend(prev);
      finishedPaginator.appendChild(next);
    }

    if (isFinished) {
      _this.settings.tournamentsSection.accordionLayout.map(t => {
        t.show = t.type === 'finishedCompetitions';
      });
      if (paginationArr && paginationArr.length) {
        let page = '';
        for (const i in paginationArr) {
          page += '<span class="paginator-item" data-page=' + paginationArr[i] + '\>' + paginationArr[i] + '</span>';
        }
        finishedPaginator.innerHTML = page;

        finishedPaginator.prepend(prev);
        finishedPaginator.appendChild(next);
      }
    } else {
      _this.settings.tournamentsSection.accordionLayout.map(t => {
        t.show = t.type === 'activeCompetitions';
      });
      if (paginationArr && paginationArr.length) {
        let page = '';
        for (const i in paginationArr) {
          page += '<span class="paginator-item" data-page=' + paginationArr[i] + '\>' + paginationArr[i] + '</span>';
        }
        paginator.innerHTML = page;

        paginator.prepend(prev);
        paginator.appendChild(next);
      }
    }

    const accordionObj = _this.tournamentsList(_this.settings.tournamentsSection.accordionLayout, function (accordionSection, listContainer, topEntryContainer, layout) {
      const tournamentData = cloneDeep(_this.settings.lbWidget.settings.tournaments[layout.type]);

      if (typeof tournamentData !== 'undefined') {
        if (tournamentData.length === 0) {
          accordionSection.style.display = 'none';
        }
        if (layout.type === 'activeCompetitions') {
          mapObject(tournamentData, async function (tournament, key, count) {
            const listItem = await _this.dashboardTournamentItem(tournament);
            if (listItem) listContainer.appendChild(listItem);
          });
        } else if (layout.type === 'finishedCompetitions') {
          mapObject(tournamentData, async function (tournament, key, count) {
            const listItem = await _this.tournamentResultItem(tournament);
            if (listItem) listContainer.appendChild(listItem);
          });
        }
      }
    });

    listResContainer.innerHTML = '';
    listResContainer.appendChild(accordionObj);

    if (finishedPaginator) {
      const finishedContainer = query(listResContainer, '.finishedCompetitions');
      if (finishedContainer) {
        const listContainer = query(finishedContainer, '.cl-accordion-list-container');
        const paginatorItems = query(finishedPaginator, '.paginator-item');
        paginatorItems.forEach(item => {
          removeClass(item, 'active');
          if (Number(item.dataset.page) === Number(finishedPageNumber)) {
            addClass(item, 'active');
          }
        });

        listContainer.appendChild(finishedPaginator);
      }
    }

    if (paginator) {
      const activeContainer = query(listResContainer, '.activeCompetitions');
      if (activeContainer) {
        const listContainer = query(activeContainer, '.cl-accordion-list-container');
        const paginatorItems = query(paginator, '.paginator-item');
        paginatorItems.forEach(item => {
          removeClass(item, 'active');
          if (Number(item.dataset.page) === Number(activePageNumber)) {
            addClass(item, 'active');
          }
        });

        listContainer.appendChild(paginator);
      }
    }

    _this.settings.tournamentListContainer.style.display = 'block';
    setTimeout(function () {
      addClass(_this.settings.tournamentListContainer, 'cl-show');
      if (typeof callback === 'function') callback();
    }, 50);
  };

  this.toggleCompetitionDescription = function () {
    const descriptionLabel = query(this.settings.section, '.cl-main-widget-lb-details-description-title');
    const description = query(this.settings.section, '.cl-main-widget-lb-details-description');
    const tcLabel = query(this.settings.section, '.cl-main-widget-lb-details-tc-title');
    const tc = query(this.settings.section, '.cl-main-widget-lb-details-tc');

    if (tc.style.display === 'block') {
      tcLabel.style.display = 'none';
      tc.style.display = 'none';
      descriptionLabel.style.display = 'block';
      description.style.display = 'block';
    } else {
      tcLabel.style.display = 'block';
      tc.style.display = 'block';
      descriptionLabel.style.display = 'none';
      description.style.display = 'none';
    }
  };

  this.toggleAchievementDescription = function () {
    const descriptionLabel = query(this.settings.section, '.cl-main-widget-ach-details-body-description-title');
    const description = query(this.settings.section, '.cl-main-widget-ach-details-body');
    const tcLabel = query(this.settings.section, '.cl-main-widget-ach-details-body-description-tc-title');
    const tc = query(this.settings.section, '.cl-main-widget-ach-details-tc');

    if (tc.style.display === 'block') {
      tcLabel.style.display = 'none';
      tc.style.display = 'none';
      descriptionLabel.style.display = 'block';
      description.style.display = 'block';
    } else {
      tcLabel.style.display = 'block';
      tc.style.display = 'block';
      descriptionLabel.style.display = 'none';
      description.style.display = 'none';
    }
  };

  this.hideCompetitionList = function (callback) {
    const _this = this;

    _this.hideEmbeddedCompetitionDetailsContent();
    _this.missingMemberReset();

    removeClass(_this.settings.tournamentListContainer, 'cl-show');

    setTimeout(function () {
      _this.settings.tournamentListContainer.style.display = 'none';

      if (typeof callback === 'function') callback();
    }, 200);
  };

  this.hideCompetitionDetails = function (callback) {
    const _this = this;

    removeClass(_this.settings.detailsContainer, 'cl-show');
    setTimeout(function () {
      _this.settings.detailsContainer.style.display = 'none';
      _this.settings.headerDate.style.display = 'block';

      if (typeof callback === 'function') callback();
    }, 200);
  };

  this.achievementItem = function (ach) {
    const listItem = document.createElement('div');
    listItem.setAttribute('class', 'cl-ach-list-item cl-ach-' + ach.id);
    listItem.dataset.id = ach.id;

    let isOptedIn = true;

    if (Array.isArray(ach.constraints) && ach.constraints.includes('optinRequiredForEntrants')) {
      if (ach.optInStatus && ach.optInStatus >= 15 && ach.optInStatus <= 35) {
        isOptedIn = true;
      } else if (!isNaN(ach.optInStatus) && (ach.optInStatus === 10 || ach.optInStatus === 0)) {
        isOptedIn = true;
      } else {
        isOptedIn = false;
      }
    } else {
      isOptedIn = true;
    }

    if (!isOptedIn) listItem.classList.add('optin-required');

    let bgImage = '';
    if (ach.iconLink) {
      bgImage = 'background-image: url(' + ach.iconLink + ')';
    }

    let rewardValue = '';
    let rewardName = '';
    if (ach.reward) {
      rewardValue = this.settings.lbWidget.settings.partialFunctions.rewardFormatter(ach.reward);
      rewardName = ach.reward.name;
    }

    let endsValue = '-';
    if (ach.scheduling && ach.scheduling.endDate) {
      endsValue = new Date(ach.scheduling.endDate).toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });
      if (endsValue.includes(', 00:00')) {
        endsValue = endsValue.replace(', 00:00', '');
      }
    }

    const template = require('../templates/mainWidget/achievementItem.hbs');
    listItem.innerHTML = template({
      id: ach.id,
      title: ach.name,
      bgImage: bgImage,
      rewardValue: rewardValue,
      endsLabel: this.settings.lbWidget.settings.translation.achievements.endsLabel,
      endsValue: endsValue,
      rewardName: rewardName,
      isOptedIn: isOptedIn,
      enterLabel: this.settings.lbWidget.settings.translation.achievements.enter
    });

    return listItem;
  };

  this.achievementItemPast = async function (ach) {
    const listItem = document.createElement('div');
    listItem.setAttribute('class', 'past cl-ach-list-item cl-ach-' + ach.id);
    listItem.dataset.id = ach.id;

    let bgImage = '';
    if (ach.iconLink) {
      bgImage = 'background-image: url(' + ach.iconLink + ')';
    }

    let rewardValue = '';
    let rewardName = '';
    if (ach.reward) {
      rewardValue = this.settings.lbWidget.settings.partialFunctions.rewardFormatter(ach.reward);
      rewardName = ach.reward.name;
    }

    const startDate = new Date(ach.scheduling.startDate);
    let endsValue = '-';
    if (ach.scheduling.endDate) {
      endsValue = new Date(ach.scheduling.endDate).toLocaleString('fr-CH', { timeZone: 'UTC', year: '2-digit', month: '2-digit', day: '2-digit' });
    }

    const statuses = await this.settings.lbWidget.getMemberAchievementsOptInStatuses([ach.id]);

    let isCompleted = false;
    let isEntrant = false;
    let percentageComplete = 0;

    if (statuses && statuses.length) {
      percentageComplete = statuses[0].percentageComplete;
      if (statuses[0].status === 'Completed') { isCompleted = true; isEntrant = true; };
      if (statuses[0].status === 'Entrant') isEntrant = true;
    }

    const template = require('../templates/mainWidget/achievementItemPast.hbs');
    listItem.innerHTML = template({
      id: ach.id,
      title: ach.name,
      bgImage: bgImage,
      isCompleted: isCompleted,
      isEntrant: isEntrant,
      percentageComplete: percentageComplete,
      rewardValue: rewardValue,
      completedLabel: this.settings.lbWidget.settings.translation.achievements.completedLabel,
      expiredLabel: this.settings.lbWidget.settings.translation.achievements.expiredLabel,
      abortedLabel: this.settings.lbWidget.settings.translation.achievements.abortedLabel,
      startsOnLabel: this.settings.lbWidget.settings.translation.achievements.startsOnLabel,
      endsOnLabel: this.settings.lbWidget.settings.translation.achievements.endsOnLabel,
      freeSpinLabel: this.settings.lbWidget.settings.translation.achievements.freeSpinLabel,
      rewardLabel: this.settings.lbWidget.settings.translation.achievements.rewardLabel,
      tAndCLabel: this.settings.lbWidget.settings.translation.global.tAndCLabel,
      rewardName: rewardName,
      startsValue: startDate.toLocaleDateString('fr-CH', { timeZone: 'UTC', year: '2-digit', month: '2-digit', day: '2-digit' }),
      endsValue: endsValue
    });

    return listItem;
  };

  this.achievementItemEmpty = function () {
    const listItem = document.createElement('div');
    listItem.setAttribute('class', 'cl-ach-list-item');

    return listItem;
  };

  this.achievementItemUpdateProgression = function (id, percentageComplete) {
    const achList = query(
      this.settings.section,
      '.' + this.settings.lbWidget.settings.navigation.achievements.containerClass + ' .cl-main-widget-ach-list-body-res'
    );
    if (!achList) return;

    const ach = achList.querySelector('[data-id="' + id + '"]');
    if (!ach) return;

    const bar = query(ach, '.cl-ach-list-progression-bar');
    if (!bar) return;

    const barLabel = query(ach, '.cl-ach-list-progression-label');
    bar.style.width = ((percentageComplete > 1 || percentageComplete === 0) ? percentageComplete : 1) + '%';
    barLabel.innerHTML = percentageComplete + '/100';
  };

  this.achievementDashboardItemUpdateProgression = function (id, percentageComplete) {
    const achList = document.querySelector('.cl-main-widget-dashboard-achievements-list');
    if (!achList) return;

    const ach = achList.querySelector('[data-id="' + id + '"]');
    if (!ach) return;

    const bar = query(ach, '.cl-ach-list-progression-bar');
    const barLabel = query(ach, '.cl-ach-list-progression-label');
    bar.style.width = ((percentageComplete > 1 || percentageComplete === 0) ? percentageComplete : 1) + '%';
    barLabel.innerHTML = percentageComplete + '/100';
  };

  this.achievementList = function (data, onLayout) {
    const _this = this;
    const accordionWrapper = document.createElement('div');

    accordionWrapper.setAttribute('class', 'cl-main-accordion-container');

    const statusMenu = document.createElement('div');
    statusMenu.setAttribute('class', 'cl-main-accordion-container-menu');

    const availableTitle = document.createElement('div');
    const claimedTitle = document.createElement('div');

    availableTitle.setAttribute('class', 'cl-main-accordion-container-menu-item currentAchievements');
    claimedTitle.setAttribute('class', 'cl-main-accordion-container-menu-item pastAchievements');

    const idx = data.findIndex(d => d.show === true);
    if (idx !== -1) {
      switch (data[idx].type) {
        case 'current':
          availableTitle.classList.add('active');
          break;
        case 'past':
          claimedTitle.classList.add('active');
          break;
      }
    }

    availableTitle.innerHTML = _this.settings.lbWidget.settings.translation.rewards.availableRewards;
    claimedTitle.innerHTML = _this.settings.lbWidget.settings.translation.rewards.claimed;

    statusMenu.appendChild(availableTitle);
    statusMenu.appendChild(claimedTitle);

    accordionWrapper.appendChild(statusMenu);

    mapObject(data, function (entry) {
      const accordionSection = document.createElement('div');
      const topShownEntry = document.createElement('div');
      const accordionListContainer = document.createElement('div');
      const accordionList = document.createElement('div');

      accordionSection.setAttribute('class', 'cl-accordion ' + entry.type + ((typeof entry.show === 'boolean' && entry.show) ? ' cl-shown' : ''));
      topShownEntry.setAttribute('class', 'cl-accordion-entry');
      accordionListContainer.setAttribute('class', 'cl-accordion-list-container');
      accordionList.setAttribute('class', 'cl-accordion-list');

      if (typeof onLayout === 'function') {
        onLayout(accordionSection, accordionList, topShownEntry, entry);
      }

      accordionListContainer.appendChild(accordionList);

      accordionSection.appendChild(accordionListContainer);

      accordionWrapper.appendChild(accordionSection);
    });

    return accordionWrapper;
  };

  this.achievementListLayout = function (pageNumber, achievementData, paginationArr = null) {
    const _this = this;
    const achList = query(_this.settings.section, '.' + _this.settings.lbWidget.settings.navigation.achievements.containerClass + ' .cl-main-widget-ach-list-body-res');

    const accordionObj = _this.achievementList(_this.settings.achievementSection.accordionLayout, function (accordionSection, listContainer, topEntryContainer, layout) {
      const data = achievementData[layout.type];
      if (typeof data !== 'undefined' && data.length && layout.type === 'current') {
        mapObject(data, function (rew) {
          const listItem = _this.achievementItem(rew);
          listContainer.appendChild(listItem);
        });
      } else if (typeof data !== 'undefined' && data.length && layout.type === 'past') {
        mapObject(data, function (rew) {
          // const listItem =  _this.achievementItemPast(rew);
          // listContainer.appendChild(listItem);
          _this.achievementItemPast(rew)
            .then((listItem) => listContainer.appendChild(listItem));
        });
      } else {
        const listItem = _this.achievementItemEmpty();
        listContainer.appendChild(listItem);
      }
    });

    achList.innerHTML = '';
    achList.appendChild(accordionObj);
  };

  this.createGameItem = (product) => {
    const item = document.createElement('div');
    item.classList.add('cl-main-widget-ach-details-game-item');
    if (product.iconLink) item.style.backgroundImage = `url(${product.iconLink})`;
    item.dataset.id = product.id;
    item.dataset.refId = product.productRefId;
    item.dataset.name = product.name;

    return item;
  };

  this.loadAchievementDetails = async function (data, callback) {
    const _this = this;
    const label = query(_this.settings.achievement.detailsContainer, '.cl-main-widget-ach-details-header-label');
    const topLabel = query(_this.settings.achievement.detailsContainer, '.cl-main-widget-ach-details-top-label');
    const tc = query(_this.settings.achievement.detailsContainer, '.cl-main-widget-ach-details-tc');
    const image = query(_this.settings.achievement.detailsContainer, '.cl-main-widget-ach-details-body-image-cont');
    const pregressBar = query(_this.settings.achievement.detailsContainer, '.cl-ach-list-progression-bar');
    const pregressLabel = query(_this.settings.achievement.detailsContainer, '.cl-ach-list-progression-label');
    const rewardTitle = query(_this.settings.achievement.detailsContainer, '.cl-ach-list-actions-reward-title');
    const pickUpBtn = query(_this.settings.achievement.detailsContainer, '.cl-main-widget-ach-details-body-cta-ends-btn-pick');
    const optedInLabel = query(_this.settings.achievement.detailsContainer, '.cl-main-widget-ach-details-header-label-opted-in');
    const abortBtn = query(_this.settings.achievement.detailsContainer, '.cl-main-widget-ach-details-body-abort');
    const progress = query(_this.settings.achievement.detailsContainer, '.cl-ach-list-progression');
    const description = query(_this.settings.achievement.detailsContainer, '.cl-main-widget-ach-details-hw');
    const endsDate = query(_this.settings.achievement.detailsContainer, '.cl-main-widget-ach-details-body-cta-ends-date');

    const games = query(_this.settings.achievement.detailsContainer, '.cl-main-widget-ach-details-game-items.ach-games');

    const headerActions = query(_this.settings.achievement.detailsContainer, '.cl-ach-list-actions');
    const footerActions = query(_this.settings.achievement.detailsContainer, '.cl-main-widget-ach-details-body-cta');

    const optInHeader = query(headerActions, '.cl-main-widget-ach-details-optin-action');
    const optInFooter = query(footerActions, '.cl-main-widget-ach-details-optin-action');

    const gamesWrapp = document.querySelector('.cl-main-widget-ach-details-games.ach-games');
    const gameItems = gamesWrapp.querySelector('.cl-main-widget-ach-details-game-items');
    const gameFull = gamesWrapp.querySelector('.cl-main-widget-ach-details-game-full');
    const gameOverlay = gamesWrapp.querySelector('.cl-main-widget-ach-details-game-overlay');
    let isExpand = false;

    gameItems.classList.remove('expanded');

    games.innerHTML = '';

    if (data.products && data.products.length) {
      if (data.products.length > 9) {
        isExpand = true;
      }
      data.products.forEach(product => {
        const gameItem = this.createGameItem(product);
        games.appendChild(gameItem);
      });
    }

    if (isExpand) {
      gameFull.style.display = 'flex';
      gameOverlay.style.display = 'block';
    } else {
      gameFull.style.display = 'none';
      gameOverlay.style.display = 'none';
    }

    if (data.reward) {
      rewardTitle.innerHTML = data.reward.name;
    } else {
      rewardTitle.innerHTML = '';
    }

    if (data.description) {
      description.innerHTML = data.description;
    } else {
      description.innerHTML = '';
    }

    if (data.scheduling.endDate) {
      const date = new Date(data.scheduling.endDate);
      endsDate.innerHTML = date.toLocaleDateString('fr-CH', {
        timeZone: 'UTC', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    } else {
      endsDate.innerHTML = '-';
    }

    let optinRequiredForEntrants = false;

    if (data.constraints && data.constraints.length) {
      optinRequiredForEntrants = data.constraints.includes('optinRequiredForEntrants');
    }

    const memberAchievementOptInStatus = await _this.settings.lbWidget.getMemberAchievementOptInStatus(data.id);

    if (optinRequiredForEntrants) {
      if (
        memberAchievementOptInStatus.length &&
        memberAchievementOptInStatus[0].statusCode >= 15 &&
        memberAchievementOptInStatus[0].statusCode <= 35
      ) {
        optInHeader.innerHTML = _this.settings.lbWidget.settings.translation.achievements.leave;
        optInFooter.innerHTML = _this.settings.lbWidget.settings.translation.achievements.leave;
        removeClass(optInHeader, 'cl-disabled');
        removeClass(optInFooter, 'cl-disabled');
        addClass(optInHeader, 'leave-achievement');
        addClass(optInFooter, 'leave-achievement');
        optInHeader.style.display = 'none';
        optInFooter.style.display = 'none';
        pickUpBtn.style.display = 'flex';
        optedInLabel.style.display = 'flex';
        progress.style.display = 'flex';
        abortBtn.style.display = 'block';
      } else if (
        memberAchievementOptInStatus.length &&
        (memberAchievementOptInStatus[0].statusCode === 10 || memberAchievementOptInStatus[0].statusCode === 0)
      ) {
        optInHeader.innerHTML = _this.settings.lbWidget.settings.translation.achievements.listProgressionBtn;
        optInFooter.innerHTML = _this.settings.lbWidget.settings.translation.achievements.listProgressionBtn;
        removeClass(optInHeader, 'cl-disabled');
        removeClass(optInFooter, 'cl-disabled');
        addClass(optInHeader, 'leave-achievement');
        addClass(optInFooter, 'leave-achievement');
        optInHeader.style.display = 'flex';
        optInFooter.style.display = 'flex';
        pickUpBtn.style.display = 'none';
        optedInLabel.style.display = 'none';
        abortBtn.style.display = 'none';
        progress.style.display = 'none';
      } else {
        optInHeader.innerHTML = _this.settings.lbWidget.settings.translation.achievements.enter;
        optInFooter.innerHTML = _this.settings.lbWidget.settings.translation.achievements.enter;
        removeClass(optInHeader, 'cl-disabled');
        removeClass(optInFooter, 'cl-disabled');
        optInHeader.style.display = 'flex';
        optInFooter.style.display = 'flex';
        pickUpBtn.style.display = 'none';
        optedInLabel.style.display = 'none';
        abortBtn.style.display = 'none';
        progress.style.display = 'none';
      }
    } else {
      addClass(optInHeader, 'cl-disabled');
      addClass(optInFooter, 'cl-disabled');
      optInHeader.style.display = 'none';
      optInFooter.style.display = 'none';
      pickUpBtn.style.display = 'flex';
      optedInLabel.style.display = 'flex';
      progress.style.display = 'flex';
      abortBtn.style.display = 'block';
    }

    label.innerHTML = data.name;
    topLabel.innerHTML = data.name;
    tc.innerHTML = data.termsAndConditions
      ? data.termsAndConditions.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      : this.settings.lbWidget.settings.translation.global.tAndCEmpty;

    if (data && data.iconLink) {
      image.setAttribute('style', `background-image: url(${data.iconLink})`);
    }

    this.settings.lbWidget.checkForMemberAchievementsProgression([data.id], function (issued, progression) {
      if (issued && issued.length && issued[0].status === 'Completed') {
        pregressLabel.innerHTML = '100/100';
        pregressBar.style.width = '100%';
      } else if (progression && progression.length) {
        const perc = progression[0].percentageComplete ? parseInt(progression[0].percentageComplete) : 0;
        const percValue = ((perc > 1 || perc === 0) ? perc : 1) + '%';
        pregressLabel.innerHTML = perc + '/100';
        pregressBar.style.width = percValue;
      }
    });

    _this.settings.achievement.detailsContainer.style.display = 'block';
    setTimeout(function () {
      addClass(_this.settings.achievement.detailsContainer, 'cl-show');

      if (typeof callback === 'function') callback();
    }, 50);
  };

  this.hideAchievementDetails = function (callback) {
    const _this = this;

    removeClass(_this.settings.achievement.detailsContainer, 'cl-show');
    setTimeout(function () {
      _this.settings.achievement.detailsContainer.style.display = 'none';

      if (typeof callback === 'function') callback();
    }, 200);
  };

  this.loadRewardDetails = async function (data, callback) {
    const rewardValue = query(this.settings.reward.detailsContainer, '.cl-main-widget-reward-details-value');
    const detailRewardValue = query(this.settings.reward.detailsContainer, '.cl-main-widget-reward-details-content-body-item-value.reward');
    const rewardType = query(this.settings.reward.detailsContainer, '.cl-main-widget-reward-details-type');
    const campaign = query(this.settings.reward.detailsContainer, '.cl-main-widget-reward-details-content-body-item-value.campaign');
    const tAndC = query(this.settings.reward.detailsContainer, '.cl-main-widget-reward-details-tc-body');
    const expires = query(this.settings.reward.detailsContainer, '.cl-main-widget-reward-details-expires-value');
    const detailExpires = query(this.settings.reward.detailsContainer, '.cl-main-widget-reward-details-content-body-item-value.expires');
    const games = query(this.settings.reward.detailsContainer, '.cl-main-widget-ach-details-game-items.reward-games');
    const expand = query(this.settings.reward.detailsContainer, '.cl-main-widget-ach-details-game-full');
    const expandOverlay = query(this.settings.reward.detailsContainer, '.cl-main-widget-ach-details-game-overlay');
    let products = null;
    let isExpand = false;

    rewardValue.innerHTML = data.rewardValue;
    detailRewardValue.innerHTML = data.rewardValue;
    rewardType.innerHTML = data.name;

    if (data.entityType === 'Achievement') {
      const achievement = await this.settings.lbWidget.getAchievementsByIds([data.entityId]);
      const productRequest = {
        languageKey: this.settings.lbWidget.settings.language,
        productFilter: {
          entityIds: [achievement[0].id],
          entityType: 'achievement',
          limit: 20,
          skip: 0
        }
      };
      products = await this.settings.lbWidget.getProductsApi(productRequest);

      campaign.innerHTML = achievement[0].name;
      tAndC.innerHTML = achievement[0].termsAndConditions ?? this.settings.lbWidget.settings.translation.global.tAndCEmpty;
    } else if (data.entityType === 'Contest') {
      const contest = await this.settings.lbWidget.getContestsByIds([data.entityId]);
      const productRequest = {
        languageKey: this.settings.lbWidget.settings.language,
        productFilter: {
          entityIds: [contest[0].id],
          entityType: 'competition',
          limit: 20,
          skip: 0
        }
      };
      products = await this.settings.lbWidget.getProductsApi(productRequest);

      campaign.innerHTML = contest[0].name;
      tAndC.innerHTML = contest[0].termsAndConditions ?? this.settings.lbWidget.settings.translation.global.tAndCEmpty;
    }

    games.innerHTML = '';

    if (products && products.data.length) {
      if (products.data.length > 9) {
        isExpand = true;
      }
      products.data.forEach(product => {
        const gameItem = this.createGameItem(product);
        games.appendChild(gameItem);
      });
    }

    if (isExpand) {
      expand.style.display = 'flex';
      expandOverlay.style.display = 'block';
    } else {
      expand.style.display = 'none';
      expandOverlay.style.display = 'none';
    }

    let expiresValue = '-';
    if (data.period) {
      const date = new Date(moment(data.created).add(data.period, 'm'));
      expiresValue = date.toLocaleDateString('fr-CH', {
        timeZone: 'UTC', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    }

    expires.innerHTML = expiresValue;
    detailExpires.innerHTML = expiresValue;

    this.settings.reward.detailsContainer.style.display = 'block';
    addClass(this.settings.reward.detailsContainer, 'cl-show');

    setTimeout(function () {
      if (typeof callback === 'function') callback();
    }, 50);
  };

  this.hideRewardDetails = function (callback) {
    const _this = this;

    removeClass(_this.settings.reward.detailsContainer, 'cl-show');
    setTimeout(function () {
      _this.settings.reward.detailsContainer.style.display = 'none';

      if (typeof callback === 'function') callback();
    }, 200);
  };

  this.updateAchievementProgressionAndIssued = function (issued, progression) {
    const _this = this;
    const achList = query(_this.settings.section, '.' + _this.settings.lbWidget.settings.navigation.achievements.containerClass + ' .cl-main-widget-ach-list-body-res' + ' .cl-accordion.current');
    const dashboardAchList = document.querySelector('.cl-main-widget-dashboard-achievements-list');

    objectIterator(query(achList, '.cl-ach-list-item'), function (ach) {
      const id = ach.dataset.id;
      const issuedStatus = (issued.findIndex(i => i.entityId === id) !== -1);

      let perc = 0;
      mapObject(progression, function (pr) {
        if (pr.entityId === id) {
          perc = pr.percentageComplete ? parseInt(pr.percentageComplete) : 0;
        }
      });

      if (ach.dataset.id) {
        const bar = query(ach, '.cl-ach-list-progression-bar');
        const barLabel = query(ach, '.cl-ach-list-progression-label');
        if (bar) {
          if (issuedStatus) {
            addClass(bar, 'cl-ach-complete');
            barLabel.innerHTML = '100/100';
            bar.style.width = '100%';
            if (ach.classList.contains('past')) {
              const reward = ach.querySelector('.cl-ach-list-actions-reward');
              reward.classList.add('issued');
            }
          } else {
            const percValue = ((perc > 1 || perc === 0) ? perc : 1) + '%';
            barLabel.innerHTML = perc + '/100';
            bar.style.width = percValue;
          }
        }
      }
    });

    objectIterator(query(dashboardAchList, '.cl-ach-list-item'), function (ach) {
      const id = ach.dataset.id;
      const issuedStatus = (issued.findIndex(i => i.entityId === id) !== -1);

      let perc = 0;
      mapObject(progression, function (pr) {
        if (pr.entityId === id) {
          perc = pr.percentageComplete ? parseInt(pr.percentageComplete) : 0;
        }
      });

      if (ach !== null) {
        const bar = query(ach, '.cl-ach-list-progression-bar');
        const barLabel = query(ach, '.cl-ach-list-progression-label');

        if (issuedStatus) {
          addClass(bar, 'cl-ach-complete');
          barLabel.innerHTML = '100/100';
          bar.style.width = '100%';
        } else {
          if (bar) {
            const percValue = ((perc > 1 || perc === 0) ? perc : 1) + '%';
            barLabel.innerHTML = perc + '/100';
            bar.style.width = percValue;
          }
        }
      }
    });
  };

  this.loadAchievements = function (pageNumber, callback, paginationArr = null) {
    const _this = this;

    _this.settings.lbWidget.checkForAvailableAchievements(pageNumber, function (achievementData) {
      _this.achievementListLayout(pageNumber, achievementData, paginationArr);

      const idList = _this.settings.lbWidget.settings.achievements.list.map(a => a.id);

      _this.settings.lbWidget.checkForMemberAchievementsProgression(idList, function (issued, progression) {
        _this.updateAchievementProgressionAndIssued(issued, progression);
      });

      if (typeof callback === 'function') {
        callback();
      }
    });
  };

  this.showLeaveAchievementPopup = function (activeAchievementId, isDashboard = false) {
    let container = null;
    if (isDashboard) {
      container = document.querySelector('.cl-main-widget-section-dashboard');
    } else {
      container = document.querySelector('.cl-main-widget-section-ach');
    }
    const popup = container.querySelector('.cl-main-widget-ach-list-popup-wrapp');
    const closeBtn = popup.querySelector('.cl-main-widget-ach-list-popup-close');
    const confirm = popup.querySelector('.cl-main-widget-ach-list-popup-confirm');
    const close = popup.querySelector('.cl-main-widget-ach-list-popup-cancel');

    const closePopup = () => {
      popup.style.display = 'none';
    };
    const leaveAchievement = () => {
      closePopup();
      this.settings.lbWidget.leaveAchievement(activeAchievementId, isDashboard);
    };

    popup.style.display = 'flex';

    closeBtn.removeEventListener('click', closePopup);
    close.removeEventListener('click', closePopup);
    confirm.removeEventListener('click', leaveAchievement);

    closeBtn.addEventListener('click', closePopup);
    close.addEventListener('click', closePopup);
    confirm.addEventListener('click', leaveAchievement);
  };

  this.dashboardTournamentItem = async function (tournament, isReadyStatus = false) {
    const listItem = document.createElement('div');
    listItem.setAttribute('class', 'dashboard-tournament-item');
    const contestRequest = ContestRequest.constructFromObject({
      languageKey: this.settings.language,
      contestFilter: {
        competitionIds: [tournament.id],
        constraints: ['hasOptInStatus'],
        statusCode: {
          moreThan: 0,
          lessThan: 100
        },
        limit: 20,
        skip: 0
      }
    }, null);

    const contests = await this.settings.lbWidget.getContests(contestRequest);

    if (!contests.length) return;

    const contest = contests[0];

    let isOptIn = false;

    if (tournament.constraints.includes('optinRequiredForEntrants')) {
      const optInStatus = await this.settings.lbWidget.getCompetitionOptInStatus(tournament.id);
      if (optInStatus.length) {
        if (optInStatus[0].statusCode === 5) {
          isOptIn = true;
        }
      } else {
        isOptIn = true;
      }
    }

    const rewardRequest = {
      entityFilter: [{
        entityType: 'Contest',
        entityIds: [contest.id]
      }],
      currencyKey: this.settings.currency,
      skip: 0,
      limit: 20
    };
    const rewards = await this.settings.lbWidget.getRewardsApi(rewardRequest);
    const rewardsData = rewards.data;

    listItem.setAttribute('data-id', tournament.id);
    listItem.setAttribute('data-contest-id', contest.id);

    let rewardValue = '';
    let rewardName = '';

    if (rewardsData && rewardsData.length) {
      const rewardResponse = [];
      const rank = 1;
      mapObject(rewardsData, function (reward) {
        if (reward.rewardRank.indexOf('-') !== -1 || reward.rewardRank.indexOf(',') !== -1) {
          const rewardRankArr = reward.rewardRank.split(',');
          rewardRankArr.forEach(r => {
            const idx = r.indexOf('-');
            if (idx !== -1) {
              const start = parseInt(r);
              const end = parseInt(r.substring(idx + 1));
              if (rank >= start && rank <= end) {
                rewardResponse.push(reward);
              }
            } else if (parseInt(r) === rank) {
              rewardResponse.push(reward);
            }
          });
        } else if (rank !== 0 && parseInt(reward.rewardRank) === rank) {
          rewardResponse.push(reward);
        }
      });

      if (rewardResponse[0]) {
        rewardName = rewardResponse[0].name;
        rewardValue = this.settings.lbWidget.settings.partialFunctions.rewardFormatter(rewardResponse[0]);
      }
    }

    const endsLabel = isReadyStatus
      ? this.settings.lbWidget.settings.translation.dashboard.startsTitle
      : this.settings.lbWidget.settings.translation.dashboard.endsTitle;

    let productsCount = null;
    let products = tournament.products.data;

    if (products && products.length > 3) {
      products = products.slice(0, 3);
      productsCount = tournament.products.meta.totalRecordsFound - 3;
    }

    let itemBg = '';
    if (products && products.length) {
      itemBg = products[products.length - 1].iconLink;
    }

    let duration = '';
    const diff = moment(contest.scheduledEndDate).diff(moment(contest.scheduledStartDate));
    duration = moment.duration(diff).humanize();

    let points = '-';
    let position = '-';
    if (contest.status === 'Active' && contest.optInStatus) {
      points = contest.optInStatus.points;
      position = contest.optInStatus.position;
    }

    const date = isReadyStatus ? new Date(contest.scheduledStartDate) : new Date(contest.scheduledEndDate);
    const template = require('../templates/dashboard/tournamentItem.hbs');
    listItem.innerHTML = template({
      title: contest.name,
      itemBg: itemBg,
      endsLabel: endsLabel,
      endsValue: date.toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' }),
      prizeLabel: this.settings.lbWidget.settings.translation.dashboard.prizeTitle,
      prizeValue: rewardValue,
      rewardName: rewardName,
      playTournamentLabel: this.settings.lbWidget.settings.translation.dashboard.playTournamentLabel,
      icon: contest.iconLink ?? '',
      isOptIn: isOptIn,
      optInLabel: this.settings.lbWidget.settings.translation.dashboard.optInTournamentLabel,
      isLive: contest.status === 'Active',
      joinedLabel: this.settings.lbWidget.settings.translation.tournaments.joinedLabel,
      liveLabel: this.settings.lbWidget.settings.translation.tournaments.liveLabel,
      positionLabel: this.settings.lbWidget.settings.translation.tournaments.positionLabel,
      spinsLeftLabel: this.settings.lbWidget.settings.translation.tournaments.spinsLeftLabel,
      pointsLabel: this.settings.lbWidget.settings.translation.tournaments.pointsLabel,
      productsCount: productsCount,
      products: products,
      duration: duration,
      points: points,
      position: position
    });

    return listItem;
  };

  this.tournamentResultItem = async function (tournament) {
    const listItem = document.createElement('div');
    listItem.setAttribute('class', 'tournament-result-item');
    const contestRequest = ContestRequest.constructFromObject({
      languageKey: this.settings.language,
      contestFilter: {
        competitionIds: [tournament.id],
        constraints: ['hasOptInStatus'],
        statusCode: {
          moreThan: 0,
          lessThan: 100
        },
        limit: 20,
        skip: 0
      }
    }, null);

    const contests = await this.settings.lbWidget.getContests(contestRequest);

    if (!contests.length) return;

    const contest = contests[0];
    const rewardRequest = {
      entityFilter: [{
        entityType: 'Contest',
        entityIds: [contest.id]
      }],
      currencyKey: this.settings.currency,
      skip: 0,
      limit: 20
    };
    const rewards = await this.settings.lbWidget.getRewardsApi(rewardRequest);
    const rewardsData = rewards.data;

    listItem.setAttribute('data-id', tournament.id);
    listItem.setAttribute('data-contest-id', contest.id);

    let rewardValue = '';
    let rewardName = '';

    if (rewardsData && rewardsData.length) {
      const idx = rewardsData.findIndex(reward => {
        if (reward.rewardRank.indexOf('-') !== -1 || reward.rewardRank.indexOf(',') !== -1) {
          const rewardRankArr = reward.rewardRank.split(',');
          rewardRankArr.forEach(r => {
            const idx = r.indexOf('-');
            if (idx !== -1) {
              const start = parseInt(r);
              if (start === 1) {
                return true;
              }
            } else if (parseInt(r) === 1) {
              return true;
            }
            return false;
          });
        } else if (parseInt(reward.rewardRank) === 1) {
          return true;
        }
        return false;
      });

      if (idx !== -1) {
        rewardName = rewardsData[idx].name;
        rewardValue = this.settings.lbWidget.settings.partialFunctions.rewardFormatter(rewardsData[idx]);
      }
    }

    let itemBg = '';
    if (tournament.bannerLowResolutionLink) {
      itemBg = tournament.bannerLowResolutionLink;
    } else if (tournament.bannerLink) {
      itemBg = tournament.bannerLink;
    }

    const date = new Date(contest.scheduledEndDate);
    const startedDate = new Date(contest.scheduledStartDate);

    let points = '-';
    let position = '-';
    if (contest.optInStatus) {
      points = contest.optInStatus.points;
      position = contest.optInStatus.position;
    }

    const template = require('../templates/mainWidget/tournamentResultItem.hbs');
    listItem.innerHTML = template({
      title: contest.name,
      itemBg: itemBg,
      endedLabel: this.settings.lbWidget.settings.translation.tournaments.endedLabel,
      startedLabel: this.settings.lbWidget.settings.translation.tournaments.startedLabel,
      endedValue: date.toLocaleDateString('fr-CH', { timeZone: 'UTC', year: '2-digit', month: '2-digit', day: '2-digit' }),
      detailsEndedValue: date.toLocaleDateString('fr-CH', {
        timeZone: 'UTC', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      }),
      startedValue: startedDate.toLocaleDateString('fr-CH', {
        timeZone: 'UTC', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      }),
      prizeLabel: this.settings.lbWidget.settings.translation.dashboard.prizeTitle,
      prizeValue: rewardValue,
      rewardName: rewardName,
      playTournamentLabel: this.settings.lbWidget.settings.translation.dashboard.playTournamentLabel,
      icon: contest.iconLink ?? '',
      positionLabel: this.settings.lbWidget.settings.translation.tournaments.positionLabel,
      spinsLeftLabel: this.settings.lbWidget.settings.translation.tournaments.spinsLeftLabel,
      pointsLabel: this.settings.lbWidget.settings.translation.tournaments.pointsLabel,
      points: points,
      position: position
    });

    return listItem;
  };

  this.dashboardAwardItem = function (award, products = null) {
    const listItem = document.createElement('div');
    listItem.setAttribute('class', 'dashboard-rewards-list-item');
    listItem.setAttribute('data-id', award.id);

    const rewardImg = `background-image: url(${award.rewardData.iconLink ?? ''})`;

    let expires = '&#8734;';
    if (award.period) {
      const date = new Date(moment(award.created).add(award.period, 'm'));
      expires = date.toLocaleDateString('fr-CH', {
        timeZone: 'UTC', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    }

    let productsCount = null;
    let productsData = products.data;

    if (productsData && productsData.length > 3) {
      productsData = productsData.slice(0, 3);
      productsCount = products.meta.totalRecordsFound - 3;
    }

    const template = require('../templates/dashboard/awardItem.hbs');
    listItem.innerHTML = template({
      rewardValue: award.rewardValue,
      rewardName: award.rewardData.name,
      expiresInLabel: this.settings.lbWidget.settings.translation.rewards.expiresInLabel,
      rewardImg: rewardImg,
      expires: expires,
      productsCount: productsCount,
      products: productsData
    });

    return listItem;
  };

  this.dashboardAwardItemEmpty = function (award) {
    const listItem = document.createElement('div');
    listItem.setAttribute('class', 'dashboard-rewards-list-item-empty');

    const template = require('../templates/dashboard/awardItemEmpty.hbs');
    listItem.innerHTML = template({
      title: this.settings.lbWidget.settings.translation.rewards.emptyLabel,
      description: this.settings.lbWidget.settings.translation.rewards.emptyDescription
    });

    return listItem;
  };

  this.loadDashboardAwards = async function (claimedAwards = [], availableAwards = [], expiredAwards = []) {
    const awardsList = query(this.settings.section, '.cl-main-widget-dashboard-rewards-list');
    awardsList.innerHTML = '';

    availableAwards = availableAwards.filter(a => a.rewardData);

    if (availableAwards.length) {
      availableAwards = availableAwards.slice(0, 3);

      for (const award of availableAwards) {
        let products = null;
        if (award.entityType === 'Achievement') {
          const achievement = await this.settings.lbWidget.getAchievementsByIds([award.entityId]);
          const productRequest = {
            languageKey: this.settings.language,
            productFilter: {
              entityIds: [achievement[0].id],
              entityType: 'achievement',
              limit: 100,
              skip: 0
            }
          };
          products = await this.settings.lbWidget.getProductsApi(productRequest);
        } else if (award.entityType === 'Contest') {
          const contest = await this.settings.lbWidget.getContestsByIds([award.entityId]);
          const productRequest = {
            languageKey: this.settings.language,
            productFilter: {
              entityIds: [contest[0].id],
              entityType: 'competition',
              limit: 100,
              skip: 0
            }
          };
          products = await this.settings.lbWidget.getProductsApi(productRequest);
        }

        const listItem = this.dashboardAwardItem(award, products);
        awardsList.appendChild(listItem);
      }
    } else {
      const listItem = this.dashboardAwardItemEmpty();
      awardsList.appendChild(listItem);
    }

    if (window.screen.width > 400) {
      let mouseDown = false;
      let startX;
      let scrollLeft;
      const slider = document.querySelector('.cl-main-widget-dashboard-rewards-list');

      const startDragging = (e) => {
        mouseDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        setTimeout(function () {
          slider.classList.add('dragging');
        }, 100);
      };

      const stopDragging = (e) => {
        mouseDown = false;
        setTimeout(function () {
          slider.classList.remove('dragging');
        }, 50);
      };

      const move = (e) => {
        if (!mouseDown) return;
        const x = e.pageX - slider.offsetLeft;
        const scroll = x - startX;
        slider.scrollLeft = scrollLeft - scroll;
      };

      slider.addEventListener('mousemove', move, false);
      slider.addEventListener('mousedown', startDragging, false);
      slider.addEventListener('mouseup', stopDragging, false);
      slider.addEventListener('mouseleave', stopDragging, false);
    }
  };

  this.showAwardCelebration = async function (awardData) {
    const mainSectionContainer = document.querySelector('.cl-main-widget-section-container');
    const rewardCelebration = document.createElement('div');
    rewardCelebration.setAttribute('class', 'cl-main-widget-reward-celebration');

    this.awardTAndC = null;

    let campaign = '';
    let title = '-';
    let products = null;
    let productsCount = null;

    if (awardData.entityType === 'Achievement') {
      const achievement = await this.settings.lbWidget.getAchievementsByIds([awardData.entityId]);
      campaign = achievement[0].name;
      title = 'Mission Completed';
      this.awardTAndC = achievement[0].termsAndConditions;

      const productRequest = {
        languageKey: this.settings.language,
        productFilter: {
          entityIds: [achievement[0].id],
          entityType: 'achievement',
          limit: 100,
          skip: 0
        }
      };

      products = await this.settings.lbWidget.getProductsApi(productRequest);
    } else if (awardData.entityType === 'Contest') {
      const contest = await this.settings.lbWidget.getContestsByIds([awardData.entityId]);
      campaign = contest[0].name;
      title = 'Tournament Completed';
      this.awardTAndC = contest[0].termsAndConditions;

      const productRequest = {
        languageKey: this.settings.language,
        productFilter: {
          entityIds: [contest[0].id],
          entityType: 'competition',
          limit: 100,
          skip: 0
        }
      };
      products = await this.settings.lbWidget.getProductsApi(productRequest);
    }

    let awardProducts = products ? products.data : null;

    if (awardProducts && awardProducts.length > 3) {
      awardProducts = awardProducts.slice(0, 3);
      productsCount = products.meta.totalRecordsFound - 3;
    }

    let expires = '-';
    if (awardData.period) {
      const date = new Date(moment(awardData.created).add(awardData.period, 'm'));
      expires = date.toLocaleDateString('fr-CH', {
        timeZone: 'UTC', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    }

    const template = require('../templates/mainWidget/rewardCelebration.hbs');
    rewardCelebration.innerHTML = template({
      id: awardData.id,
      rewardName: awardData.name,
      rewardValue: awardData.rewardValue,
      campaign: campaign,
      expires: expires,
      title: title,
      label: this.settings.lbWidget.settings.translation.rewardCelebration.label,
      expiresLabel: this.settings.lbWidget.settings.translation.rewardCelebration.expiresLabel,
      tAndCLabel: this.settings.lbWidget.settings.translation.global.tAndCLabel,
      climeBtnLabel: this.settings.lbWidget.settings.translation.rewardCelebration.climeBtnLabel,
      declineBtnLabel: this.settings.lbWidget.settings.translation.rewardCelebration.declineBtnLabel,
      drawerTitle: this.settings.lbWidget.settings.translation.rewardCelebration.drawerTitle,
      drawerDescription: this.settings.lbWidget.settings.translation.rewardCelebration.drawerDescription,
      drawerClimeBtn: this.settings.lbWidget.settings.translation.rewardCelebration.drawerClimeBtn,
      drawerDeclineBtn: this.settings.lbWidget.settings.translation.rewardCelebration.drawerDeclineBtn,
      productsCount: productsCount,
      products: awardProducts
    });

    mainSectionContainer.appendChild(rewardCelebration);

    const rewardCelebrationPage = document.querySelector('.cl-main-widget-reward-celebration');
    setTimeout(function () {
      rewardCelebrationPage.classList.add('active');
    }, 500);

    const confetti = require('./confetti');

    setTimeout(() => {
      confetti.startConfetti();
    }, 1000);
  };

  this.loadDashboardTournaments = async function (callback) {
    // const _this = this;
    const tournamentsList = query(this.settings.section, '.cl-main-widget-dashboard-tournaments-list');
    const tournamentsContainer = query(this.settings.section, '.cl-main-widget-dashboard-tournaments');
    const { activeCompetitions } = await this.settings.lbWidget.getDashboardCompetitions();

    tournamentsList.innerHTML = '';

    if (activeCompetitions && activeCompetitions.length) {
      tournamentsContainer.classList.remove('hidden');
      const title = document.querySelector('.cl-main-widget-dashboard-tournaments-title');
      title.innerHTML = this.settings.lbWidget.settings.translation.dashboard.tournamentsTitle;
      for (const comp of activeCompetitions) {
        const listItem = await this.dashboardTournamentItem(comp);
        if (listItem) tournamentsList.appendChild(listItem);
      }
    } else {
      tournamentsContainer.classList.add('hidden');
    }

    if (typeof callback === 'function') {
      callback();
    }

    if (window.screen.width > 400) {
      let mouseDown = false;
      let startX;
      let scrollLeft;
      const slider = tournamentsList;

      const startDragging = (e) => {
        mouseDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        setTimeout(function () {
          slider.classList.add('dragging');
        }, 100);
      };

      const stopDragging = (e) => {
        mouseDown = false;
        setTimeout(function () {
          slider.classList.remove('dragging');
        }, 50);
      };

      const move = (e) => {
        if (!mouseDown) return;
        const x = e.pageX - slider.offsetLeft;
        const scroll = x - startX;
        slider.scrollLeft = scrollLeft - scroll;
      };

      slider.addEventListener('mousemove', move, false);
      slider.addEventListener('mousedown', startDragging, false);
      slider.addEventListener('mouseup', stopDragging, false);
      slider.addEventListener('mouseleave', stopDragging, false);
    }
  };

  this.loadDashboardAchievements = function (achievementData, callback) {
    const _this = this;
    const achList = query(this.settings.section, '.cl-main-widget-dashboard-achievements-list');
    const achContainer = query(this.settings.section, '.cl-main-widget-dashboard-achievements');
    achList.innerHTML = '';

    if (!achievementData.length) {
      achContainer.classList.add('hidden');
      return;
    }

    achContainer.classList.remove('hidden');

    if (achievementData.length > 3) {
      achievementData = achievementData.slice(0, 3);
    }

    mapObject(achievementData, function (ach) {
      if (query(achList, '.cl-ach-' + ach.id) === null) {
        const listItem = _this.achievementItem(ach);
        achList.appendChild(listItem);
      }
    });

    const idList = achievementData.map(a => a.id);

    _this.settings.lbWidget.checkForMemberAchievementsProgression(idList, function (issued, progression) {
      _this.updateAchievementProgressionAndIssued(issued, progression);
    });

    if (typeof callback === 'function') {
      callback();
    }

    if (window.screen.width > 400) {
      let mouseDown = false;
      let startX;
      let scrollLeft;
      const slider = achList;

      const startDragging = (e) => {
        mouseDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        setTimeout(function () {
          slider.classList.add('dragging');
        }, 100);
      };

      const stopDragging = (e) => {
        mouseDown = false;
        setTimeout(function () {
          slider.classList.remove('dragging');
        }, 50);
      };

      const move = (e) => {
        if (!mouseDown) return;
        const x = e.pageX - slider.offsetLeft;
        const scroll = x - startX;
        slider.scrollLeft = scrollLeft - scroll;
      };

      slider.addEventListener('mousemove', move, false);
      slider.addEventListener('mousedown', startDragging, false);
      slider.addEventListener('mouseup', stopDragging, false);
      slider.addEventListener('mouseleave', stopDragging, false);
    }
  };

  this.rewardItem = async function (award) {
    const listItem = document.createElement('div');
    listItem.setAttribute('class', 'dashboard-rewards-list-item');
    listItem.dataset.id = award.id;

    const rewardImg = `background-image: url(${award.rewardData.iconLink ?? ''})`;
    const isClimeBtn = !award.claimed && award.statusCode !== 115;

    let expires = '&#8734;';
    if (award.period) {
      const date = new Date(moment(award.created).add(award.period, 'm'));
      expires = date.toLocaleDateString('fr-CH', {
        timeZone: 'UTC', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    }

    let products = null;
    let awardProducts = null;
    let productsCount = null;

    if (award.entityType === 'Achievement') {
      const achievement = await this.settings.lbWidget.getAchievementsByIds([award.entityId]);
      const productRequest = {
        languageKey: this.settings.lbWidget.settings.language,
        productFilter: {
          entityIds: [achievement[0].id],
          entityType: 'achievement',
          limit: 100,
          skip: 0
        }
      };

      products = await this.settings.lbWidget.getProductsApi(productRequest);
    } else if (award.entityType === 'Contest') {
      const contest = await this.settings.lbWidget.getContestsByIds([award.entityId]);
      const productRequest = {
        languageKey: this.settings.lbWidget.settings.language,
        productFilter: {
          entityIds: [contest[0].id],
          entityType: 'competition',
          limit: 100,
          skip: 0
        }
      };

      products = await this.settings.lbWidget.getProductsApi(productRequest);
    }

    awardProducts = products.data;

    if (awardProducts && awardProducts.length > 3) {
      awardProducts = awardProducts.slice(0, 3);
      productsCount = products.meta.totalRecordsFound - 3;
    }

    const template = require('../templates/mainWidget/rewardItem.hbs');
    listItem.innerHTML = template({
      rewardValue: award.rewardValue,
      rewardName: award.rewardData.name,
      expiresInLabel: this.settings.lbWidget.settings.translation.rewards.expiresInLabel,
      rewardImg: rewardImg,
      isClimeBtn: isClimeBtn,
      expires: expires,
      products: awardProducts,
      productsCount: productsCount
    });

    return listItem;
  };

  this.rewardItemEmpty = function () {
    const listItem = document.createElement('div');
    listItem.setAttribute('class', 'rewards-list-item-empty');

    const template = require('../templates/mainWidget/rewardItemEmpty.hbs');
    listItem.innerHTML = template({});

    return listItem;
  };

  this.rewardItemPast = async function (reward) {
    const listItem = document.createElement('div');
    listItem.setAttribute('class', 'rewards-list-item-past');
    listItem.setAttribute('data-entity-id', reward.entityId);
    listItem.setAttribute('data-entity-type', reward.entityType);

    let campaign = '';
    if (reward.entityType === 'Achievement') {
      const achievement = await this.settings.lbWidget.getAchievementsByIds([reward.entityId]);
      campaign = achievement[0].name;
    } else if (reward.entityType === 'Contest') {
      const contest = await this.settings.lbWidget.getContestsByIds([reward.entityId]);
      campaign = contest[0].name;
    }

    let expires = '-';
    if (reward.period) {
      const date = new Date(moment(reward.created).add(reward.period, 'm'));
      expires = date.toLocaleDateString('fr-CH', {
        timeZone: 'UTC', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    }

    const template = require('../templates/mainWidget/rewardItemPast.hbs');
    listItem.innerHTML = template({
      name: reward.name,
      status: reward.status.toLowerCase(),
      campaign: campaign,
      expires: expires,
      pastFS: this.settings.lbWidget.settings.translation.rewards.pastFS,
      pastFSWinnings: this.settings.lbWidget.settings.translation.rewards.pastFSWinnings,
      expiredOnLabel: this.settings.lbWidget.settings.translation.rewards.expiredOnLabel,
      campaignLabel: this.settings.lbWidget.settings.translation.rewards.campaignLabel,
      tAndCLabel: this.settings.lbWidget.settings.translation.global.tAndCLabel
    });

    return listItem;
  };

  this.tournamentItem = function (tournament, isReadyStatus = false) {
    const listItem = document.createElement('div');
    listItem.setAttribute('class', 'dashboard-tournament-item');
    listItem.setAttribute('data-id', tournament.id);

    let rewardValue = '';
    let rewardName = '';

    if (tournament.rewards && tournament.rewards.length) {
      const idx = tournament.rewards.findIndex(reward => {
        if (reward.rewardRank.indexOf('-') !== -1 || reward.rewardRank.indexOf(',') !== -1) {
          const rewardRankArr = reward.rewardRank.split(',');
          rewardRankArr.forEach(r => {
            const idx = r.indexOf('-');
            if (idx !== -1) {
              const start = parseInt(r);
              if (start === 1) {
                return true;
              }
            } else if (parseInt(r) === 1) {
              return true;
            }
            return false;
          });
        } else if (parseInt(reward.rewardRank) === 1) {
          return true;
        }
        return false;
      });

      if (idx !== -1) {
        rewardName = tournament.rewards[idx].name;
        rewardValue = this.settings.lbWidget.settings.partialFunctions.rewardFormatter(tournament.rewards[idx]);
      }
    }

    let itemBg = '';
    if (tournament.bannerLowResolutionLink) {
      itemBg = tournament.bannerLowResolutionLink;
    } else if (tournament.bannerLink) {
      itemBg = tournament.bannerLink;
    }

    const endsLabel = isReadyStatus
      ? this.settings.lbWidget.settings.translation.dashboard.startsTitle
      : this.settings.lbWidget.settings.translation.dashboard.endsTitle;

    const date = isReadyStatus ? new Date(tournament.scheduledStartDate) : new Date(tournament.scheduledEndDate);

    const template = require('../templates/dashboard/tournamentItem.hbs');
    listItem.innerHTML = template({
      title: tournament.name,
      itemBg: itemBg,
      endsLabel: endsLabel,
      endsValue: date.toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' }),
      prizeLabel: this.settings.lbWidget.settings.translation.dashboard.prizeTitle,
      prizeValue: rewardValue,
      rewardName: rewardName,
      playTournamentLabel: this.settings.lbWidget.settings.translation.dashboard.playTournamentLabel,
      icon: tournament.iconLink ?? '',
      joinedLabel: this.settings.lbWidget.settings.translation.tournaments.joinedLabel,
      liveLabel: this.settings.lbWidget.settings.translation.tournaments.liveLabel,
      positionLabel: this.settings.lbWidget.settings.translation.tournaments.positionLabel,
      spinsLeftLabel: this.settings.lbWidget.settings.translation.tournaments.spinsLeftLabel,
      pointsLabel: this.settings.lbWidget.settings.translation.tournaments.pointsLabel
    });

    return listItem;
  };

  this.rewardsListLayout = function (
    pageNumber = 1,
    claimedPageNumber = 1,
    expiredPageNumber = 1,
    claimedRewards,
    availableRewards,
    expiredRewards,
    paginationArr = null,
    isClaimed = false,
    isExpired = false
  ) {
    const _this = this;
    const rewardList = query(_this.settings.section, '.' + _this.settings.lbWidget.settings.navigation.rewards.containerClass + ' .cl-main-widget-reward-list-body-res');
    const totalCount = _this.settings.lbWidget.settings.awards.totalCount;
    const claimedTotalCount = _this.settings.lbWidget.settings.awards.claimedTotalCount;
    const itemsPerPage = 20;
    let paginator = query(rewardList, '.paginator-available');

    const prev = document.createElement('span');
    prev.setAttribute('class', 'paginator-item prev');
    const next = document.createElement('span');
    next.setAttribute('class', 'paginator-item next');

    if (!paginator && totalCount > itemsPerPage) {
      const pagesCount = Math.ceil(totalCount / itemsPerPage);
      paginator = document.createElement('div');
      paginator.setAttribute('class', 'paginator-available');
      addClass(paginator, 'paginator');
      addClass(paginator, 'accordion');

      let page = '';
      const isEllipsis = pagesCount > 7;

      if (isEllipsis) {
        for (let i = 0; i < 7; i++) {
          if (i === 5) {
            page += '<span class="paginator-item" data-page="..."\>...</span>';
          } else if (i === 6) {
            page += '<span class="paginator-item" data-page=' + pagesCount + '\>' + pagesCount + '</span>';
          } else {
            page += '<span class="paginator-item" data-page=' + (i + 1) + '\>' + (i + 1) + '</span>';
          }
        }
      } else {
        for (let i = 0; i < pagesCount; i++) {
          page += '<span class="paginator-item" data-page=' + (i + 1) + '\>' + (i + 1) + '</span>';
        }
      }

      paginator.innerHTML = page;

      const prev = document.createElement('span');
      prev.setAttribute('class', 'paginator-item prev');
      const next = document.createElement('span');
      next.setAttribute('class', 'paginator-item next');

      paginator.prepend(prev);
      paginator.appendChild(next);
    }

    let paginatorClaimed = query(rewardList, '.paginator-claimed');
    if (!paginatorClaimed && claimedTotalCount > itemsPerPage) {
      const pagesCount = Math.ceil(claimedTotalCount / itemsPerPage);
      paginatorClaimed = document.createElement('div');
      paginatorClaimed.setAttribute('class', 'paginator-claimed');
      addClass(paginatorClaimed, 'paginator');
      addClass(paginatorClaimed, 'accordion');

      let page = '';
      const isEllipsis = pagesCount > 7;

      if (isEllipsis) {
        for (let i = 0; i < 7; i++) {
          if (i === 5) {
            page += '<span class="paginator-item" data-page="..."\>...</span>';
          } else if (i === 6) {
            page += '<span class="paginator-item" data-page=' + pagesCount + '\>' + pagesCount + '</span>';
          } else {
            page += '<span class="paginator-item" data-page=' + (i + 1) + '\>' + (i + 1) + '</span>';
          }
        }
      } else {
        for (let i = 0; i < pagesCount; i++) {
          page += '<span class="paginator-item" data-page=' + (i + 1) + '\>' + (i + 1) + '</span>';
        }
      }

      paginatorClaimed.innerHTML = page;

      paginatorClaimed.prepend(prev);
      paginatorClaimed.appendChild(next);
    }

    const accordionObj = _this.awardsList(_this.settings.rewardsSection.accordionLayout, function (accordionSection, listContainer, topEntryContainer, layout, paginator) {
      let rewardData = _this.settings.lbWidget.settings.awards[layout.type];
      if (rewardData && rewardData.length) {
        rewardData = rewardData.filter(a => a.rewardData);
      }
      if (typeof rewardData !== 'undefined' && rewardData.length && layout.type === 'availableAwards') {
        if (rewardData.length === 0) {
          accordionSection.style.display = 'none';
        }
        mapObject(rewardData, async function (rew, key, count) {
          if (query(listContainer, '.cl-reward-' + rew.id) === null) {
            const listItem = await _this.rewardItem(rew);
            listContainer.appendChild(listItem);
          }
        });
      } else if (typeof rewardData !== 'undefined' && rewardData.length && layout.type === 'pastAwards') {
        mapObject(rewardData, async function (rew) {
          const listItem = await _this.rewardItemPast(rew);
          listContainer.appendChild(listItem);
        });
      } else {
        const listItem = _this.rewardItemEmpty();
        listContainer.appendChild(listItem);
      }
    });

    rewardList.innerHTML = '';
    rewardList.appendChild(accordionObj);

    if (paginator) {
      const paginatorItems = query(paginator, '.paginator-item');
      paginatorItems.forEach(item => {
        removeClass(item, 'active');
        if (Number(item.dataset.page) === Number(pageNumber)) {
          addClass(item, 'active');
        }
      });

      const availableRewards = query(rewardList, '.cl-accordion.availableAwards');
      if (availableRewards) {
        const container = query(availableRewards, '.cl-accordion-list-container');
        container.appendChild(paginator);
      }
    }

    if (paginatorClaimed) {
      const paginatorItems = query(paginatorClaimed, '.paginator-item');
      paginatorItems.forEach(item => {
        removeClass(item, 'active');
        if (Number(item.dataset.page) === Number(claimedPageNumber)) {
          addClass(item, 'active');
        }
      });
      const claimedRewards = query(rewardList, '.cl-accordion.claimedAwards');
      if (claimedRewards) {
        const container = query(claimedRewards, '.cl-accordion-list-container');
        container.appendChild(paginatorClaimed);
      }
    }
  };

  this.loadAwards = function (callback, pageNumber, claimedPageNumber, expiredPageNumber, paginationArr = null, isClaimed = false, isExpired = false) {
    const _this = this;
    _this.settings.lbWidget.checkForAvailableAwards(
      function (claimedRewards, availableRewards, expiredRewards) {
        _this.rewardsListLayout(
          pageNumber,
          claimedPageNumber,
          expiredPageNumber,
          claimedRewards,
          availableRewards,
          expiredRewards,
          paginationArr,
          isClaimed,
          isExpired
        );

        if (typeof callback === 'function') {
          callback();
        }
      },
      pageNumber,
      claimedPageNumber
    );
  };

  this.loadInstantWins = function () {
    const isMobile = window.screen.availWidth <= 768;

    const instantWinsContainer = document.querySelector('.cl-accordion.instantWins');
    const list = instantWinsContainer.querySelector('.cl-accordion-list');

    const wheel = document.createElement('div');
    const wheelLabel = document.createElement('div');
    const wheelImage = document.createElement('div');
    const wheelButton = document.createElement('div');

    const scratchcards = document.createElement('div');
    const scratchcardsLabel = document.createElement('div');
    const scratchcardsImage = document.createElement('div');
    const scratchcardsButton = document.createElement('div');

    const scratchcardsGame = document.createElement('div');
    const scratchcardsGameWrapper = document.createElement('div');
    const scratchcardsGameLabel = document.createElement('div');
    const scratchcardsGameContainer = document.createElement('div');
    const scratchcardsGameCardWrapper = document.createElement('div');
    const scratchcardsGameCardBlock = document.createElement('div');
    const scratchcardsGameCanvas = document.createElement('canvas');
    const scratchcardsGamePrize = document.createElement('div');
    const scratchcardsGamePrizeLabel = document.createElement('div');
    const scratchcardsGamePrizePrizes = document.createElement('div');
    const scratchcardsGamePrizePrizesPrize1 = document.createElement('div');
    const scratchcardsGamePrizePrizesPrize2 = document.createElement('div');
    const scratchcardsGamePrizePrizesPrize3 = document.createElement('div');
    const scratchcardsGamePrizePrizesPrize1Label = document.createElement('div');
    const scratchcardsGamePrizePrizesPrize2Label = document.createElement('div');
    const scratchcardsGamePrizePrizesPrize3Label = document.createElement('div');
    const scratchcardsGamePrizeButton = document.createElement('div');

    const scratchcardsPopup = document.createElement('div');
    const scratchcardsPopupLabel = document.createElement('div');
    const scratchcardsPopupDescription = document.createElement('div');
    const scratchcardsPopupButton = document.createElement('div');

    const singleWheel = document.createElement('div');
    const singleWheelWrapper = document.createElement('div');
    const singleWheelPopup = document.createElement('div');
    const singleWheelPopupLabel = document.createElement('div');
    const singleWheelPopupDescription = document.createElement('div');
    const singleWheelPopupButton = document.createElement('div');

    wheel.classList.add('wheel-item');
    wheelLabel.classList.add('wheel-label');
    wheelImage.classList.add('wheel-image');
    wheelButton.classList.add('wheel-button');

    scratchcards.classList.add('scratchcards-item');
    scratchcardsLabel.classList.add('scratchcards-label');
    scratchcardsImage.classList.add('scratchcards-image');
    scratchcardsButton.classList.add('scratchcards-button');

    singleWheel.classList.add('single-wheel');
    singleWheelWrapper.classList.add('single-wheel-wrapper');

    singleWheelPopup.classList.add('single-wheel-popup');
    singleWheelPopupLabel.classList.add('single-wheel-popup-label');
    singleWheelPopupDescription.classList.add('single-wheel-popup-description');
    singleWheelPopupButton.classList.add('single-wheel-popup-button');

    scratchcardsGame.classList.add('scratchcards-game');
    scratchcardsGameWrapper.classList.add('scratchcards-game-wrapper');
    scratchcardsGameLabel.classList.add('scratchcards-game-label');

    scratchcardsGameContainer.classList.add('scratchcards-game-container');
    scratchcardsGamePrize.classList.add('scratchcards-game-prize');
    scratchcardsGamePrizeLabel.classList.add('scratchcards-game-prize-label');
    scratchcardsGamePrizePrizes.classList.add('scratchcards-game-prize-prizes');
    scratchcardsGamePrizePrizesPrize1.classList.add('scratchcards-game-prize-prizes-first');
    scratchcardsGamePrizePrizesPrize2.classList.add('scratchcards-game-prize-prizes-second');
    scratchcardsGamePrizePrizesPrize3.classList.add('scratchcards-game-prize-prizes-third');
    scratchcardsGamePrizePrizesPrize1Label.classList.add('scratchcards-game-prize-prizes-label');
    scratchcardsGamePrizePrizesPrize2Label.classList.add('scratchcards-game-prize-prizes-label');
    scratchcardsGamePrizePrizesPrize3Label.classList.add('scratchcards-game-prize-prizes-label');
    scratchcardsGamePrizeButton.classList.add('scratchcards-game-prize-button');
    scratchcardsGameCardWrapper.classList.add('scratchcards-game-cardWrapper');
    scratchcardsGameCardBlock.classList.add('scratchcards-game-card-block');

    const wcardSize = isMobile ? '230' : '300';

    scratchcardsGameCanvas.classList.add('scratchcards-game-canvas');
    scratchcardsGameCanvas.setAttribute('width', wcardSize);
    scratchcardsGameCanvas.setAttribute('height', wcardSize);

    scratchcardsPopup.classList.add('scratchcards-popup');
    scratchcardsPopupLabel.classList.add('scratchcards-popup-label');
    scratchcardsPopupDescription.classList.add('scratchcards-popup-description');
    scratchcardsPopupButton.classList.add('scratchcards-popup-button');

    wheelLabel.innerHTML = this.settings.lbWidget.settings.translation.rewards.wheelLabel;
    scratchcardsLabel.innerHTML = this.settings.lbWidget.settings.translation.rewards.scratchcardsLabel;
    wheelButton.innerHTML = this.settings.lbWidget.settings.translation.rewards.wheelButton;
    scratchcardsButton.innerHTML = this.settings.lbWidget.settings.translation.rewards.scratchcardsButton;

    singleWheelPopupLabel.innerHTML = this.settings.lbWidget.settings.translation.rewards.singleWheelWinLabel;
    singleWheelPopupButton.innerHTML = this.settings.lbWidget.settings.translation.rewards.singleWheelWinButton;

    scratchcardsPopupLabel.innerHTML = this.settings.lbWidget.settings.translation.rewards.singleWheelWinLabel;
    scratchcardsPopupButton.innerHTML = this.settings.lbWidget.settings.translation.rewards.singleWheelWinButton;

    scratchcardsGameLabel.innerHTML = this.settings.lbWidget.settings.translation.rewards.scratchcardsLabel;
    scratchcardsGamePrizeLabel.innerHTML = this.settings.lbWidget.settings.translation.rewards.prizeLabel;
    scratchcardsGamePrizeButton.innerHTML = this.settings.lbWidget.settings.translation.rewards.prizeButton;

    scratchcardsGamePrizePrizesPrize1Label.innerHTML = 'First prize';
    scratchcardsGamePrizePrizesPrize2Label.innerHTML = 'Second prize';
    scratchcardsGamePrizePrizesPrize3Label.innerHTML = 'Third prize';

    scratchcardsPopup.appendChild(scratchcardsPopupLabel);
    scratchcardsPopup.appendChild(scratchcardsPopupDescription);
    scratchcardsPopup.appendChild(scratchcardsPopupButton);

    scratchcardsGamePrizePrizesPrize1.appendChild(scratchcardsGamePrizePrizesPrize1Label);
    scratchcardsGamePrizePrizesPrize2.appendChild(scratchcardsGamePrizePrizesPrize2Label);
    scratchcardsGamePrizePrizesPrize3.appendChild(scratchcardsGamePrizePrizesPrize3Label);

    scratchcardsGamePrizePrizes.appendChild(scratchcardsGamePrizePrizesPrize1);
    scratchcardsGamePrizePrizes.appendChild(scratchcardsGamePrizePrizesPrize2);
    scratchcardsGamePrizePrizes.appendChild(scratchcardsGamePrizePrizesPrize3);

    scratchcardsGamePrize.appendChild(scratchcardsGamePrizeLabel);
    scratchcardsGamePrize.appendChild(scratchcardsGamePrizePrizes);
    scratchcardsGamePrize.appendChild(scratchcardsGamePrizeButton);

    scratchcardsGameCardWrapper.appendChild(scratchcardsGameCanvas);
    scratchcardsGameCardWrapper.appendChild(scratchcardsGameCardBlock);

    scratchcardsGameContainer.appendChild(scratchcardsGameCardWrapper);
    scratchcardsGameContainer.appendChild(scratchcardsGamePrize);

    scratchcardsGameWrapper.appendChild(scratchcardsGameLabel);
    scratchcardsGameWrapper.appendChild(scratchcardsGameContainer);
    scratchcardsGame.appendChild(scratchcardsGameWrapper);
    scratchcardsGame.appendChild(scratchcardsPopup);

    singleWheelPopup.appendChild(singleWheelPopupLabel);
    singleWheelPopup.appendChild(singleWheelPopupDescription);
    singleWheelPopup.appendChild(singleWheelPopupButton);

    singleWheel.appendChild(singleWheelWrapper);
    singleWheel.appendChild(singleWheelPopup);

    wheel.appendChild(wheelLabel);
    wheel.appendChild(wheelImage);
    wheel.appendChild(wheelButton);

    scratchcards.appendChild(scratchcardsLabel);
    scratchcards.appendChild(scratchcardsImage);
    scratchcards.appendChild(scratchcardsButton);

    list.appendChild(wheel);
    list.appendChild(scratchcards);
    list.appendChild(singleWheel);
    list.appendChild(scratchcardsGame);
  };

  this.loadScratchCards = function () {
    const isMobile = window.screen.availWidth <= 768;
    const _this = this;
    const scratchcardsGame = document.querySelector('.scratchcards-game');
    const backBtn = document.querySelector('.cl-main-widget-reward-header-back');
    const scratchAllBtn = document.querySelector('.scratchcards-game-prize-button');
    const cardBlock = document.querySelector('.scratchcards-game-card-block');
    const themeWrapper = document.querySelector('.cl-widget-ms-wrapper');

    const isLightTheme = themeWrapper.classList.contains('lightTheme');

    cardBlock.innerHtml = '';
    while (cardBlock.firstChild) {
      cardBlock.removeChild(cardBlock.lastChild);
    }

    const prizeClasses = ['prize-1', 'prize-2', 'prize-3'];

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.classList.add('scratchcards-game-card-cell');
      const randNum = Math.floor(Math.random() * 3);
      cell.classList.add(prizeClasses[randNum]);
      cardBlock.appendChild(cell);
    }

    scratchcardsGame.classList.add('cl-show');
    backBtn.style.display = 'block';

    const grid = [];
    for (let i = 0; i < 3; i++) {
      const row = [];
      for (let j = 0; j < 3; j++) {
        row.push({ image: getRandomImage(), scratched: false });
      }
      grid.push(row);
    }

    function getRandomImage () {
      return 'https://first-space.cdn.ziqni.com/member-home-page/img/second_prize.39d8d773.png';
    }

    const canvas = document.querySelector('.scratchcards-game-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const cellSize = isMobile ? 60 : 80;
    const spacing = isMobile ? 15 : 20;
    const borderRadius = 10;
    const cardSize = isMobile ? 212 : 300;

    ctx.clearRect(0, 0, cardSize, cardSize);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cell = grid[i][j];
        const x = j * (cellSize + spacing) + 10;
        const y = i * (cellSize + spacing) + 10;

        if (cell.scratched) {
          const image = new Image();
          image.src = cell.image;
          image.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x + borderRadius, y);
            ctx.arcTo(x + cellSize, y, x + cellSize, y + borderRadius, borderRadius);
            ctx.arcTo(x + cellSize, y + cellSize, x + cellSize - borderRadius, y + cellSize, borderRadius);
            ctx.arcTo(x, y + cellSize, x, y + cellSize - borderRadius, borderRadius);
            ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(image, x, y, cellSize, cellSize);

            ctx.restore();
          };
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x + borderRadius, y);
          ctx.arcTo(x + cellSize, y, x + cellSize, y + borderRadius, borderRadius);
          ctx.arcTo(x + cellSize, y + cellSize, x + cellSize - borderRadius, y + cellSize, borderRadius);
          ctx.arcTo(x, y + cellSize, x, y + cellSize - borderRadius, borderRadius);
          ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
          ctx.closePath();
          ctx.shadowColor = isLightTheme ? 'rgba(238, 62, 200, 0.4)' : 'rgba(64, 106, 140, 0.5)';
          ctx.shadowBlur = 12;
          ctx.fillStyle = isLightTheme ? '#ffffff' : '#1A202C';
          ctx.fill();
          ctx.strokeStyle = isLightTheme ? '#F7A1E4' : '#406A8C';
          ctx.stroke();
          ctx.clip();

          ctx.fillStyle = '#BEE9F3';
          ctx.font = '40px Syne';

          const textWidth = ctx.measureText('?').width;
          const textX = x + (cellSize - textWidth) / 2;
          const textY = y + cellSize / 2 + 15;

          ctx.fillText('?', textX, textY);

          ctx.restore();
        }
      }
    }

    let isDrag = false;

    canvas.addEventListener('mousedown', function (event) {
      isDrag = true;
      clearArc(event.offsetX, event.offsetY);
      judgeVisible();
    }, false);

    canvas.addEventListener('mousemove', function (event) {
      if (!isDrag) {
        return;
      }
      clearArc(event.offsetX, event.offsetY);
      judgeVisible();
    }, false);

    canvas.addEventListener('mouseup', function (event) {
      isDrag = false;
    }, false);

    canvas.addEventListener('touchstart', function (event) {
      if (event.targetTouches.length !== 1) {
        return;
      }

      const r = canvas.getBoundingClientRect();
      const currX = event.touches[0].clientX - r.left;
      const currY = event.touches[0].clientY - r.top;

      event.preventDefault();

      isDrag = true;

      clearArc(currX, currY);
      judgeVisible();
    }, false);

    canvas.addEventListener('touchmove', function (event) {
      if (!isDrag || event.targetTouches.length !== 1) {
        return;
      }

      const r = canvas.getBoundingClientRect();
      const currX = event.touches[0].clientX - r.left;
      const currY = event.touches[0].clientY - r.top;

      event.preventDefault();
      clearArc(currX, currY);
      judgeVisible();
    }, false);

    canvas.addEventListener('touchend', function (event) {
      isDrag = false;
    }, false);

    function clearArc (x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2, false);
      ctx.fill();
    }

    function judgeVisible () {
      const imageData = ctx.getImageData(0, 0, 300, 300);
      const pixels = imageData.data;
      const result = {};
      let i;
      let len;

      for (i = 3, len = pixels.length; i < len; i += 4) {
        result[pixels[i]] || (result[pixels[i]] = 0);
        result[pixels[i]]++;
      }

      let n = 0;
      for (let i = 0; i < pixels.length; i += 100) {
        if (pixels[i + 3] < 128) {
          n += 100;
        }
      }

      if (n >= pixels.length * 0.9) {
        ctx.globalCompositeOperation = 'destination-over';
        clearCanvas();
      }
    }

    function clearCanvas () {
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      showPopup();
    }

    function showPopup () {
      const popup = document.querySelector('.scratchcards-popup');
      popup.style.display = 'flex';

      const wrapp = document.querySelector('.scratchcards-game-wrapper');
      wrapp.classList.add('blur');

      const description = document.querySelector('.scratchcards-popup-description');
      description.innerHTML = _this.settings.lbWidget.settings.translation.rewards.singleWheelWinDescription + ' ' + 'First prize';
      description.innerHTML = _this.settings.lbWidget.settings.translation.rewards.singleWheelWinDescription + ' ' + 'First prize';

      const climeBtn = document.querySelector('.scratchcards-popup-button');
      climeBtn.addEventListener('click', () => {
        const popup = document.querySelector('.scratchcards-popup');
        const wrapp = document.querySelector('.scratchcards-game-wrapper');

        popup.style.display = 'none';
        wrapp.classList.remove('blur');
      });
    }

    scratchAllBtn.addEventListener('click', clearCanvas, false);
    document.addEventListener('DOMContentLoaded', judgeVisible, false);
  };

  this.loadSingleWheels = async function (singleWheelsData) {
    console.log('singleWheelsData:', singleWheelsData);
    const isMobile = window.screen.availWidth <= 768;
    const singleWheel = document.querySelector('.single-wheel');
    const singleWheelWrapper = singleWheel.querySelector('.single-wheel-wrapper');
    const backBtn = document.querySelector('.cl-main-widget-reward-header-back ');
    singleWheel.classList.add('cl-show');
    backBtn.style.display = 'block';

    if (singleWheelsData && singleWheelsData.length) {
      singleWheelsData.forEach((singleWheel, idx) => {
        const swDom = this.createSingleWheelDom(idx, singleWheel, isMobile);
        singleWheelWrapper.appendChild(swDom);
      });
      for (let i = 0; i < singleWheelsData.length; i++) {
        await this.loadSingleWheel(isMobile, singleWheelsData[i], i);
      }
    }
  };

  this.loadSingleWheel = async function (isMobile, singleWheel, idx) {
    const _this = this;
    const preLoader = _this.preloader();
    const tiles = singleWheel.tiles;

    const rand = (m, M) => Math.random() * (M - m) + m;
    const tot = tiles.length;
    const spinEl = document.querySelector('#spin-' + idx);
    const climeBtn = document.querySelector('.single-wheel-popup-button');
    const ctx = document.querySelector('#wheel-' + idx).getContext('2d');
    const dia = ctx.canvas.width;
    const rad = dia / 2;
    const PI = Math.PI;
    const TAU = 2 * PI;
    const arc = TAU / tiles.length;

    const friction = 0.991;
    let angVel = 0;
    let ang = 0;

    const wheelFont = isMobile ? '10px sans-serif' : 'bold 15px sans-serif';

    const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

    const randomRgbColor = () => {
      const r = Math.floor(Math.random() * 256); // Random between 0-255
      const g = Math.floor(Math.random() * 256); // Random between 0-255
      const b = Math.floor(Math.random() * 256); // Random between 0-255
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    };

    const addImageProcess = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    // eslint-disable-next-line no-unused-vars
    const loadImage = async (ctx, src, rad, rot) => {
      const img = await addImageProcess(src);
      ctx.save();
      ctx.resetTransform();
      ctx.translate(rad, rad);
      ctx.rotate(rot);
      ctx.clip();
      ctx.drawImage(img, 0, -75, 150, 150);
      ctx.restore();
    };

    async function drawSector (sector, i) {
      const ang = arc * i;
      // eslint-disable-next-line no-unused-vars
      const rot = ang + arc / 2;
      ctx.save();
      // COLOR
      ctx.beginPath();
      ctx.fillStyle = randomRgbColor();
      ctx.strokeStyle = '#8D0C71';
      ctx.moveTo(rad, rad);
      ctx.arc(rad, rad, rad, ang, ang + arc);
      ctx.lineTo(rad, rad);
      ctx.fill();
      if (sector.iconLink) {
        await loadImage(ctx, sector.iconLink, rad, rot);
      }
      ctx.stroke();
      // TEXT
      ctx.translate(rad, rad);
      ctx.rotate(ang + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = wheelFont;
      ctx.strokeText(stripHtml(sector.text), rad - 15, 10);
      ctx.fillText(stripHtml(sector.text), rad - 15, 10);
      ctx.restore();
    }

    function rotate () {
      ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
    }

    function frame () {
      if (!angVel) return;
      angVel *= friction;
      if (angVel < 0.002) {
        angVel = 0;
        const sector = tiles[getIndex()];

        const popup = document.querySelector('.single-wheel-popup');
        popup.style.display = 'flex';

        const wrapp = document.querySelector('.single-wheel-wrapper');
        wrapp.classList.add('blur');

        const description = document.querySelector('.single-wheel-popup-description');
        description.innerHTML = _this.settings.lbWidget.settings.translation.rewards.singleWheelWinDescription + ' ' + stripHtml(sector.text);
      } // Bring to stop
      ang += angVel; // Update angle
      ang %= TAU; // Normalize angle
      rotate();
    }

    function engine () {
      frame();
      requestAnimationFrame(engine);
    }
    async function init () {
      for (const [i, sector] of tiles.entries()) {
        await drawSector(sector, i);
      }
      // rotate();
      engine();
      spinEl.addEventListener('click', () => {
        const play = _this.settings.lbWidget.playInstantWin();
        console.log('play:', play);
        if (!angVel) angVel = rand(0.25, 0.45);
      });
      climeBtn.addEventListener('click', () => {
        const popup = document.querySelector('.single-wheel-popup');
        popup.style.display = 'none';

        const wrapp = document.querySelector('.single-wheel-wrapper');
        wrapp.classList.remove('blur');
      });
    }

    preLoader.show(async function () {
      await init();
      preLoader.hide();
    });
  };

  this.createSingleWheelDom = function (idx, singleWheel, isMobile) {
    const sw = document.createElement('div');
    sw.classList.add('single-wheel-element');
    sw.classList.add('single-wheel-element-' + idx);

    const wheelSize = isMobile ? '192' : '300';

    const template = require('../templates/mainWidget/singleWheelDom.hbs');
    sw.innerHTML = template({
      idx: idx,
      wheelSize: wheelSize,
      label: singleWheel.name ?? '',
      description: singleWheel.description ? stripHtml(singleWheel.description) : '',
      buttonLabel: 'Spin'
    });

    return sw;
  };

  this.hideInstantWins = function () {
    const singleWheel = document.querySelector('.single-wheel');
    const scratchcardsGame = document.querySelector('.scratchcards-game');

    singleWheel.classList.remove('cl-show');
    scratchcardsGame.classList.remove('cl-show');
  };

  this.closeOpenedItems = function () {
    this.hideCompetitionList();
    this.hideAchievementDetails();
    this.hideRewardDetails();
  };

  this.activateDashboard = () => {
    const _this = this;
    const dashboardContainer = query(this.settings.container, '.cl-main-widget-section-container .' + this.settings.lbWidget.settings.navigation.dashboard.containerClass);
    const preLoader = _this.preloader();
    preLoader.show(() => {});

    dashboardContainer.style.display = 'flex';

    this.settings.lbWidget.checkForAvailableAwards(function (claimedAwards, availableAwards, expiredAwards) {
      _this.loadDashboardAwards(claimedAwards, availableAwards, expiredAwards);
    });

    if (this.settings.lbWidget.settings.navigation.achievements.enable) {
      this.settings.lbWidget.checkForAvailableAchievements(1, function (achievementData) {
        _this.loadDashboardAchievements(achievementData.current);
      });
    }

    if (this.settings.lbWidget.settings.navigation.tournaments.enable) {
      this.loadDashboardTournaments();
    }

    changeInterval = setTimeout(function () {
      addClass(dashboardContainer, 'cl-main-active-section');
      preLoader.hide();
    }, 800);

    this.loadAwards();

    this.settings.navigationSwitchInProgress = false;
  };

  let changeInterval;
  let changeContainerInterval;
  this.navigationSwitch = function (target, callback) {
    const _this = this;
    const preLoader = _this.preloader();

    if (_this.settings.navigationSwitchInProgress && _this.settings.navigationSwitchLastAtempt + 3000 < new Date().getTime()) {
      _this.settings.navigationSwitchInProgress = false;
    }

    if (!_this.settings.navigationSwitchInProgress) {
      _this.settings.navigationSwitchInProgress = true;
      _this.settings.navigationSwitchLastAtempt = new Date().getTime();

      if (!hasClass(target.parentNode, 'cl-active-nav')) {
        preLoader.show(function () {
          if (changeInterval) clearTimeout(changeInterval);
          if (changeContainerInterval) clearTimeout(changeContainerInterval);

          _this.closeOpenedItems();

          objectIterator(query(_this.settings.container, '.cl-main-widget-section-container .cl-main-active-section'), function (obj) {
            removeClass(obj, 'cl-main-active-section');
            obj.style.display = 'none';
          });

          changeContainerInterval = setTimeout(function () {
            if (target.classList.contains('cl-main-widget-navigation-dashboard') || target.closest('.cl-main-widget-navigation-dashboard')) {
              const dashboardContainer = query(_this.settings.container, '.cl-main-widget-section-container .' + _this.settings.lbWidget.settings.navigation.dashboard.containerClass);

              dashboardContainer.style.display = 'flex';

              if (_this.settings.lbWidget.settings.navigation.achievements.enable) {
                _this.settings.lbWidget.checkForAvailableAchievements(1, function (achievementData) {
                  _this.loadDashboardAchievements(achievementData.current);
                });
              }

              if (_this.settings.lbWidget.settings.navigation.tournaments.enable) {
                _this.loadDashboardTournaments();
              }

              changeInterval = setTimeout(function () {
                addClass(dashboardContainer, 'cl-main-active-section');
              }, 30);

              _this.loadAwards();

              preLoader.hide();

              _this.settings.navigationSwitchInProgress = false;
            } else if (target.classList.contains('cl-main-widget-navigation-lb') || target.closest('.cl-main-widget-navigation-lb')) {
              _this.settings.lbWidget.checkForAvailableRewards(1);
              _this.loadLeaderboard(function () {
                const lbContainer = query(_this.settings.container, '.cl-main-widget-section-container .' + _this.settings.lbWidget.settings.navigation.tournaments.containerClass);
                const missingMember = query(lbContainer, '.cl-main-widget-lb-missing-member');
                if (missingMember) {
                  missingMember.style.display = 'none';
                }

                lbContainer.style.display = 'flex';
                changeInterval = setTimeout(function () {
                  addClass(lbContainer, 'cl-main-active-section');
                }, 30);

                if (typeof callback === 'function') {
                  callback();
                }

                preLoader.hide();

                _this.settings.navigationSwitchInProgress = false;
              }, true);
            } else if (target.classList.contains('cl-main-widget-navigation-ach') || target.closest('.cl-main-widget-navigation-ach')) {
              _this.loadAchievements(1, function () {
                const achContainer = query(_this.settings.container, '.cl-main-widget-section-container .' + _this.settings.lbWidget.settings.navigation.achievements.containerClass);

                _this.settings.achievement.detailsContainer.style.display = 'none';

                achContainer.style.display = 'flex';
                changeInterval = setTimeout(function () {
                  addClass(achContainer, 'cl-main-active-section');

                  if (typeof callback === 'function') {
                    callback();
                  }
                }, 30);

                preLoader.hide();

                _this.settings.navigationSwitchInProgress = false;
              });
            }
          }, 250);
        });
      } else if (typeof callback === 'function') {
        _this.settings.navigationSwitchInProgress = false;
        callback();
      }
    }
  };

  this.resetNavigation = function (callback) {
    const _this = this;

    objectIterator(query(_this.settings.container, '.cl-main-widget-navigation-items .cl-active-nav'), function (obj) {
      removeClass(obj, 'cl-active-nav');
    });

    objectIterator(query(_this.settings.container, '.cl-main-widget-section-container .cl-main-active-section'), function (obj) {
      obj.style.display = 'none';
      removeClass(obj, 'cl-main-active-section');
    });

    let activeNave = false;
    objectIterator(query(_this.settings.container, '.cl-main-widget-navigation-container .cl-main-widget-navigation-item'), function (navItem, key, count) {
      if (!activeNave && !hasClass(navItem, 'cl-hidden-navigation-item')) {
        _this.navigationSwitch(query(navItem, '.cl-main-navigation-item'));
        activeNave = true;
      }
    });

    this.activateDashboard();

    _this.hideEmbeddedCompetitionDetailsContent();
    _this.hideCompetitionList();

    setTimeout(function () {
      if (typeof callback !== 'undefined') callback();
    }, 70);
  };

  this.enableDragging = () => {
    if (window.screen.width < 400) return;

    const container = document.querySelector('.cl-main-widget-wrapper');

    container.onmousedown = function (e) {
      if (e.target.closest('.cl-main-widget-dashboard-rewards') || e.target.closest('.cl-main-widget-dashboard-achievements') || e.target.closest('.cl-main-widget-dashboard-tournaments')) return;

      const coords = getCoords(container);
      const shiftX = e.pageX - coords.left;
      const maxLeft = window.innerWidth;

      container.style.position = 'absolute';

      moveAt(e);

      function moveAt (e) {
        let shift = e.pageX - shiftX + 225;
        if (shift < -100) shift = -100;
        if (shift > maxLeft) shift = maxLeft;
        container.style.left = shift + 'px';
      }

      document.onmousemove = function (e) {
        moveAt(e);
      };
    };

    container.onmouseup = () => {
      document.onmousemove = null;
      container.onmouseup = null;
    };

    document.onmouseup = () => {
      document.onmousemove = null;
      container.onmouseup = null;
    };

    container.ondragstart = function () {
      return false;
    };

    function getCoords (elem) {
      const box = elem.getBoundingClientRect();
      return {
        left: box.left
      };
    }
  };

  this.initLayout = function (callback) {
    const _this = this;

    document.body.classList.add('no-scroll');

    _this.settings.active = true;

    _this.loadLeaderboard(() => {}, true);

    setTimeout(function () {
      _this.settings.container.style.display = 'block';
      _this.settings.overlayContainer.style.display = 'block';
      addClass(_this.settings.container, 'cl-show');

      const member = query(_this.settings.leaderboard.resultContainer, '.cl-lb-member-row');
      if (member !== null) {
        _this.missingMember(_this.isElementVisibleInView(member, _this.settings.leaderboard.resultContainer));
      } else {
        _this.missingMemberReset();
      }

      _this.resetNavigation(callback);

      _this.enableDragging();
    }, 200);
  };
};
