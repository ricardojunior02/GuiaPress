const { Router } = require('express');
const slugify  = require('slugify');
const Category = require('../categories/Category');
const Article = require('./Article');

const authenticate = require('../middlewares/authenticate');

const router = Router();

router.get('/admin/articles', authenticate, (req, res) => {
  Article.findAll({
    include: [
      {
        model: Category
      }
    ]
  }).then((articles) => {
    res.render('admin/articles/index', { articles });
  })
});

router.get('/admin/articles/new', authenticate, (req, res) => {
  Category.findAll().then(categories => {
  res.render('admin/articles/new', {
    categories
  });
  });
});

router.post('/articles/save', authenticate, (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  const category = req.body.category;

  Article.create({
    title,
    slug: slugify(title).toLowerCase(),
    categoryId: category,
    body: body
  }).then(() => {
    res.redirect('/admin/articles');
  });
});

router.post('/articles/delete', authenticate, (req, res) => {
  const id = req.body.id;
  if(id != undefined && !isNaN(id)){
    Article.destroy({
      where: { id: id }
    }).then(() => res.redirect('/admin/articles'))
  }else{
    res.redirect('/admin/categories');
  }
});

router.get('/admin/articles/edit/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if(isNaN(id)) {
    res.redirect('/admin/articles')
  };

  Article.findByPk(id).then(article => {
    if(article != undefined){
      Category.findAll().then(categories => {
        res.render('admin/articles/edit', { article, categories })
      })
      
    }else{
      res.redirect('/admin/articles')
    }
  })
});

router.post('/articles/update', authenticate, (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const body = req.body.body;
  const categoryId = req.body.category;

  Article.update({ title, slug: slugify(title).toLowerCase(), body, categoryId}, {
    where: { id }
  }).then(article => {
    res.redirect('/admin/articles')
  }).catch(err => res.redirect('/admin/articles', { err }));
})

router.get('/articles/page/:num', authenticate, (req, res) => {
  const page = req.params.num;
  var offset = 0;
  
  if(isNaN(page) || page === 1){
    offset = 0;
  }else{
    offset = (parseInt(page) - 1) * 4;
  }

  Article.findAndCountAll({
    limit: 4,
    offset,
    order: [
      ['id', 'DESC']
    ]
  }).then(articles => {

    var next;
    if(offset + 4 >= articles.count){
      next = false;
    }else{
      next = true;
    }
    const result = { next, articles, page: parseInt(page)};
    Category.findAll().then(categories => {
      res.render('admin/articles/page', { result, categories });
    });
  });
});

module.exports = router;
