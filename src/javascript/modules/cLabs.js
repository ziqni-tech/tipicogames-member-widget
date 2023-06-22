// default domain

// var apiURL = "http://192.168.1.8:9998";

const apiURL = 'https://gateway.ziqni.com';

const cLabs = {
  api: {
    url: apiURL
  },
  classSelector: /^\.([\w-]+)$/, // class string expression check
  idSelector: /^#[\w\d\-\_\&\!\@\*]+$/, // ID string expression check
  tagSelector: /^[\w-]+$/ // TAG string expression check
};

export default cLabs;
