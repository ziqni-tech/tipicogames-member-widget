import cssVars from 'css-vars-ponyfill';

cssVars({
  include: 'link[rel=stylesheet],style',
  watch: true,
  onlyLegacy: true
});
