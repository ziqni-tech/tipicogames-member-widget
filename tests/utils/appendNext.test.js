import appendNext from '../../src/javascript/utils/appendNext';

describe('Utils: Append Next', () => {
  const mockInsertBeforeMethod = jest.fn();
  const mockAppendChildMethod = jest.fn();

  beforeEach(() => {
    mockInsertBeforeMethod.mockClear();
    mockAppendChildMethod.mockClear();
  });

  it('should invoke insertBefore method', function () {
    const newNode = `node-${Math.random()}`;
    const mockElement = {
      nextSibling: Math.random(),
      parentNode: {
        insertBefore: mockInsertBeforeMethod
      }
    };

    const result = appendNext(mockElement, newNode);

    expect(result).toEqual(undefined);
    expect(mockInsertBeforeMethod).toBeCalledTimes(1);
    expect(mockInsertBeforeMethod).toBeCalledWith(newNode, mockElement.nextSibling);
  });

  it('should invoke appendChild method', function () {
    const newNode = `node-${Math.random()}`;
    const mockElement = {
      parentNode: {
        appendChild: mockAppendChildMethod
      }
    };

    const result = appendNext(mockElement, newNode);

    expect(result).toEqual(undefined);
    expect(mockAppendChildMethod).toBeCalledTimes(1);
    expect(mockAppendChildMethod).toBeCalledWith(newNode);
  });
});
