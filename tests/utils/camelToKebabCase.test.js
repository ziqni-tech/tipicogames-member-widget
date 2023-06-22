import camelToKebabCase from '../../src/javascript/utils/camelToKebabCase';

describe('Utils: Camel To Kebab Case', () => {
  it('should work properly and return correct result', function () {
    const result = camelToKebabCase('camelToKebabCase');

    expect(result).toEqual('camel-to-kebab-case');
  });
});
