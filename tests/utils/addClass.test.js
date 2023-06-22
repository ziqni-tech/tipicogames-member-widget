import addClass from '../../src/javascript/utils/addClass';

describe('Utils: Add Class', () => {
  const mockClassListAddMethod = jest.fn();

  beforeEach(() => {
    mockClassListAddMethod.mockClear();
  });

  it('should invoke classList.add method', function () {
    const element = {
      classList: {
        add: mockClassListAddMethod
      }
    };
    const newClassName = `className-${Math.random()}`;

    const result = addClass(element, newClassName);

    expect(result).toEqual(element);
    expect(mockClassListAddMethod).toBeCalledTimes(1);
    expect(mockClassListAddMethod).toBeCalledWith(newClassName);
  });

  it('should add className to element.className', function () {
    const defaultClassName = 'default';
    const newClassName = `className-${Math.random()}`;
    const element = {className: defaultClassName};

    const result = addClass(element, newClassName);

    expect(result).toEqual({
      className: `${defaultClassName} ${newClassName}`
    });
  });
});
