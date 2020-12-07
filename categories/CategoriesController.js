const { Router } = require('express');
const Category = require('./Category');
const slugify = require('slugify');
const authenticate = require('../middlewares/authenticate');


const router = Router();

router.get('/admin/categories/new', authenticate, (req, res) => {
  res.render('admin/categories/new');
})

router.post('/categories/save', authenticate, (req, res) => {
  const title = req.body.title;
       
  if(title != undefined){
    Category.create({
      title: title,
      slug: slugify(title).toLowerCase(),
    }).then(() => {
      res.redirect('/admin/categories')
    })
  }else{
    res.redirect('/admin/categories/new');
  }

});

router.get('/admin/categories', authenticate, (req, res) => {
    Category.findAll().then(categories => {
      res.render('admin/categories/index', {
        categories
      });
    });
})

router.post('/categories/delete', authenticate, (req, res) => {
  const id = req.body.id;
  if(id != undefined && !isNaN(id)){
    Category.destroy({
      where: { id: id }
    }).then(() => res.redirect('/admin/categories'))
  }else{
    res.redirect('/admin/categories');
  }
});

router.get('/admin/categories/edit/:id', authenticate, (req, res) => {
  const id =  req.params.id; 

   Category.findByPk(id).then(category => {
     if(category != undefined && !isNaN(id)){
        res.render('admin/categories/edit', { category });
     }else{
       res.redirect('/admin/categories');
     }
   }).catch(erro => {
     res.redirect('/admin/categories', { erro });
   });
});

router.post('/categories/update', authenticate, (req, res) => {
  const id = req.body.id;
  const title = req.body.title;

  Category.update({ title: title, slug: slugify(title).toLowerCase()}, {
    where: { id: id }
  }).then(() => res.redirect('/admin/categories')).catch(erro => console.log(erro.message))
});

module.exports = router;