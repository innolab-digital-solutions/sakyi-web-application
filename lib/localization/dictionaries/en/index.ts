import layout from './marketing/layout.json';
import about from './marketing/pages/about.json';
import blog from './marketing/pages/blog.json';
import contact from './marketing/pages/contact.json';
import home from './marketing/pages/home.json';
import programs from './marketing/pages/programs.json';
import validation from './shared/validation.json';

const en = {
  marketing: {
    layout,
    pages: {
      home,
      about,
      programs,
      blog,
      contact,
    },
  },
  shared: {
    validation,
  },
};

export default en;
