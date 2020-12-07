const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./database');
const session = require('express-session');

const categories = require('./categories/CategoriesController');
const articles = require('./articles/ArticlesController');
const users = require('./user/UsersController');

const Article = require('./articles/Article');
const Category = require('./categories/Category');

connection.authenticate().then(() => console.log('Success...')).catch((error) => console.log('Error...', error.message))


const app = express();
// View Engine
app.set('view engine', 'ejs');

// Session
app.use(session({
  secret: 'cursoguiadoprogramador',
  cookie: {
    maxAge: 30000000
  },
}))

// Static
app.use(express.static('public'));

//Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use(categories);
app.use(articles);
app.use(users);


app.get('/', (req, res) => {
  Article.findAll({
    order: [
      ['id', 'DESC']
    ],
    limit: 4
  }).then(articles => {
      Category.findAll().then(categories => {
        res.render('index', { articles, categories
      });
    });
  });
});

app.get('/:slug', (req, res) => {
  const slug = req.params.slug;

  Article.findOne({
    where: { slug }
  }).then(articles => {
    if(articles != undefined){
      Category.findAll().then(categories => {
         res.render('articles', { articles, categories });
      });
    }else{
      res.redirect('/')
    }
  }).catch(err => {
    res.redirect('', { err });
  })
});

app.get('/category/:slug', (req, res) => {
  const slug = req.params.slug;

  Category.findOne({
    where: { slug },
    include: [
    { model: Article }
    ],
  }).then(categorie => {
    if(categorie != undefined){
        Category.findAll().then(categories => {
        res.render('index', { articles: categorie.articles, categories })
        })
    }else{
      res.redirect('/');
    }
  }).catch(err => res.redirect('/', { err }));
})

app.listen(3333, () => console.log('Server is running....'))