import { ContestRequest, ContestsApiWs } from '@ziqni-tech/member-api-client';
import cloneDeep from 'lodash.clonedeep';

const tournamentBrackets = async (apiClientStomp, tournamentId, language, translation, activeContestId) => {
  const container = document.querySelector('.cl-main-widget-lb-details-brackets');
  container.innerHTML = '';

  const contests = await getContests(apiClientStomp, tournamentId, language);

  if (!contests || contests.length <= 1) return null;

  const roundsCount = contests.reduce((prev, current) => (prev.round > current.round) ? prev : current).round;

  const contestsByRounds = {};
  for (let i = 1; i <= roundsCount; i++) {
    contestsByRounds[i] = contests.filter(c => c.round === i);
  }

  let elementPairs = [];
  contests.forEach(c => {
    if (c.entrantsFromContest && c.entrantsFromContest.length) {
      c.entrantsFromContest.forEach(e => elementPairs.push([c.id, e]));
    }
  });
  elementPairs = [...new Set(elementPairs)];

  // Sorting
  const sorted = {};
  if (Object.keys(contestsByRounds).length && elementPairs.length) {
    sorted[roundsCount] = cloneDeep(contestsByRounds[roundsCount]);
    const tmp = cloneDeep(contestsByRounds);
    for (let round = roundsCount - 1; round > 0; round--) {
      if (!sorted[round]) sorted[round] = cloneDeep([]);
      contestsByRounds[round + 1].forEach(contest => {
        if (contest.entrantsFromContest && contest.entrantsFromContest.length) {
          contest.entrantsFromContest.forEach(entrant => {
            const idx = tmp[round].findIndex(c => c.id === entrant);
            if (idx !== -1) {
              const el = tmp[round].splice(idx, 1);
              sorted[round].push(el[0]);
            }
          });
        }

        contestsByRounds[round] = cloneDeep(sorted[round]);
      });
    }

    for (let round = 1; round < roundsCount; round++) {
      if (tmp[round] && tmp[round].length) {
        tmp[round].forEach(c => {
          contestsByRounds[round].push(c);
        });
      }
    }
  }
  // End Sorting

  const title = document.createElement('div');
  title.setAttribute('class', 'cl-main-widget-lb-details-brackets-title');
  title.innerHTML = translation.brackets.title;

  const html = createHtml(roundsCount, contestsByRounds, translation, activeContestId);

  container.appendChild(title);
  container.appendChild(html);

  drawConnectionLines(elementPairs);
};

const drawConnectionLines = (elementPairs) => {
  const coordinatesArr = [];
  if (elementPairs.length) {
    elementPairs.forEach(pair => {
      const firsPoint = document.querySelector(`[data-connect-id="${pair[0]}"]`);
      const firsPointCoordinates = { left: firsPoint.offsetLeft, top: firsPoint.offsetTop + 30 };
      const secondPoint = document.querySelector(`[data-connect-id="${pair[1]}"]`);
      const secondPointCoordinates = { left: secondPoint.offsetLeft + 150, top: secondPoint.offsetTop + 30 };
      coordinatesArr.push([firsPointCoordinates, secondPointCoordinates]);
    });
  }
  if (coordinatesArr.length) {
    coordinatesArr.forEach(c => drawLine(c[0].left, c[0].top, c[1].left, c[1].top));
  }
};

const drawLine = (x1, y1, x2, y2) => {
  if (x2 < x1) {
    let tmp;
    tmp = x2; x2 = x1; x1 = tmp;
    tmp = y2; y2 = y1; y1 = tmp;
  }
  const container = document.querySelector('.connections-table_rounds');
  const width = Math.abs(x2 - x1) / 2;
  const height = Math.abs(y2 - y1);
  let border = 'border-top: solid 1px #ddd';
  let lineClass = 'top-line';
  if (y1 > y2) {
    lineClass = 'bottom-line';
    y1 = y2;
    border = 'border-bottom: solid 1px #ddd';
  }

  container.innerHTML += '<div class="bracket ' + lineClass + '" style="width: ' + width + 'px; height: ' + height + 'px; ' + border + '; border-right: solid 1px #ddd; position: absolute; top: ' + y1 + 'px; left: ' + x1 + 'px;"></div>';
};

const createHtml = (roundsCount, contestsByRounds, translation, activeContestId) => {
  const container = document.createElement('div');
  container.setAttribute('class', 'connections-table_rounds');

  for (let i = 1; i <= roundsCount; i++) {
    const round = document.createElement('div');
    round.setAttribute('class', 'connections-table_round');
    if (Object.keys(contestsByRounds[i]).length) {
      for (let j = 0; j < contestsByRounds[i].length; j++) {
        const roundItem = document.createElement('div');
        const roundItemName = document.createElement('div');
        const roundItemDate = document.createElement('div');
        const roundItemDateTitle = document.createElement('div');
        const roundItemDateValue = document.createElement('div');

        roundItem.setAttribute('class', 'connections-table_round-item');
        roundItem.setAttribute('data-connect-id', contestsByRounds[i][j].id);

        if (contestsByRounds[i][j].entrantsFromContest && contestsByRounds[i][j].entrantsFromContest.length) {
          roundItem.classList.add('hasEntrants');
        }

        if (contestsByRounds[i][j].id === activeContestId) {
          roundItem.classList.add('current');
        }

        roundItemName.setAttribute('class', 'connections-table_round-item-name');
        roundItemDate.setAttribute('class', 'connections-table_round-item-date');
        roundItemDateTitle.setAttribute('class', 'connections-table_round-item-date-title');
        roundItemDateValue.setAttribute('class', 'connections-table_round-item-date-value');

        roundItemName.innerHTML = contestsByRounds[i][j].name;

        let startDate = new Date(contestsByRounds[i][j].actualStartDate ?? contestsByRounds[i][j].scheduledStartDate);
        let endDate = new Date(contestsByRounds[i][j].actualEndDate ?? contestsByRounds[i][j].scheduledEndDate);
        startDate = startDate.toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });
        endDate = endDate.toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });

        switch (contestsByRounds[i][j].status) {
          case 'Ready':
            roundItemDateTitle.innerHTML = translation.brackets.starts;
            roundItem.classList.add('ready');
            roundItemDateValue.innerHTML = startDate;
            break;
          case 'Active':
            roundItemDateTitle.innerHTML = translation.brackets.ends;
            roundItem.classList.add('active');
            roundItemDateValue.innerHTML = endDate;
            break;
          case 'Finishing':
            roundItemDateTitle.innerHTML = translation.brackets.ends;
            roundItem.classList.add('finishing');
            roundItemDateValue.innerHTML = endDate;
            break;
          case 'Finalised':
            roundItemDateTitle.innerHTML = translation.brackets.ended;
            roundItem.classList.add('finalised');
            roundItemDateValue.innerHTML = endDate;
            break;
          case 'Cancelled':
            roundItem.classList.add('cancelled');
            break;
        }

        roundItemDate.appendChild(roundItemDateTitle);
        roundItemDate.appendChild(roundItemDateValue);

        roundItem.appendChild(roundItemName);
        roundItem.appendChild(roundItemDate);

        round.appendChild(roundItem);
      }
    }

    container.appendChild(round);
  }

  return container;
};

const getContests = async (apiClientStomp, tournamentId, language) => {
  const contestsApiWsClient = new ContestsApiWs(apiClientStomp);

  const contestRequest = ContestRequest.constructFromObject({
    languageKey: language,
    contestFilter: {
      productIds: [],
      tags: [],
      startDate: null,
      endDate: null,
      sortBy: [],
      ids: [],
      competitionIds: [tournamentId],
      statusCode: {
        moreThan: 0,
        lessThan: 100
      },
      constraints: [],
      limit: 20,
      skip: 0
    }
  }, null);

  return new Promise((resolve, reject) => {
    contestsApiWsClient.getContests(contestRequest, (json) => {
      resolve(json.data);
    });
  });
};

export default tournamentBrackets;
