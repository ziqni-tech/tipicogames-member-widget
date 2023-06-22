import {LbWidget} from '../src/javascript/modules/LbWidget';
import {MiniScoreBoard} from '../src/javascript/modules/MiniScoreBoard';

describe('LbWidget', () => {
  const LbWidgetInstance = new LbWidget();
  LbWidgetInstance.loadStylesheet = jest.fn().mockImplementation((callback) => callback());
  LbWidgetInstance.loadMember = jest.fn().mockImplementation((callback) => callback());
  LbWidgetInstance.loadWidgetTranslations = jest.fn().mockImplementation((callback) => callback());
  LbWidgetInstance.loadWidgetTranslations = jest.fn().mockImplementation((callback) => callback());
  LbWidgetInstance.deactivateCompetitionsAndLeaderboards = jest.fn().mockImplementation((callback) => callback());
  LbWidgetInstance.startup = jest.fn();
  LbWidgetInstance.eventListeners = jest.fn();

  const mock = {
    mainWidget: {
      hide: jest.fn().mockImplementation((callback) => callback())
    },
  }

  it('Init Method', function () {
    LbWidgetInstance.settings.miniScoreBoard = null;

    const result = LbWidgetInstance.init();

    expect(result).toEqual(undefined);
    expect(LbWidgetInstance.loadStylesheet).toBeCalledTimes(1);
    expect(LbWidgetInstance.loadMember).toBeCalledTimes(1);
    expect(LbWidgetInstance.loadWidgetTranslations).toBeCalledTimes(1);

    expect(LbWidgetInstance.settings.notifications.settings.lbWidget).toEqual(LbWidgetInstance);
    expect(LbWidgetInstance.settings.miniScoreBoard.settings.lbWidget).toEqual(LbWidgetInstance);
    expect(LbWidgetInstance.settings.mainWidget.settings.lbWidget).toEqual(LbWidgetInstance);

    expect(LbWidgetInstance.startup).toBeCalledTimes(1);
    expect(LbWidgetInstance.eventListeners).toBeCalledTimes(1);
  });

  it('Init Method: should work properly if MiniScoreBoard is initialized', function () {
    LbWidgetInstance.settings.miniScoreBoard = new MiniScoreBoard(LbWidgetInstance.settings);
    LbWidgetInstance.settings.miniScoreBoard.settings.container = {style: {}};
    LbWidgetInstance.settings.mainWidget.hide = mock.mainWidget.hide;

    LbWidgetInstance.init();

    expect(mock.mainWidget.hide).toBeCalledTimes(1);
    expect(LbWidgetInstance.deactivateCompetitionsAndLeaderboards).toBeCalledTimes(1);
    expect(LbWidgetInstance.settings.miniScoreBoard.settings.active).toEqual(true);
    expect(LbWidgetInstance.startup).toBeCalledTimes(1);
  });
});
