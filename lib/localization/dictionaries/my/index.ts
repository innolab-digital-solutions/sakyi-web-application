import layout from './layout.json';
import about from './pages/about.json';
import blog from './pages/blog.json';
import contact from './pages/contact.json';
import home from './pages/home.json';
import programs from './pages/programs.json';
import validation from './validation.json';

const my = {
  validation,
  layout,
  site: {
    home,
    about,
    programs,
    blog,
    contact,
  },
};

export default my;
