const { Router } = require('express');
const User = require('./User');
const bcrypt = require('bcryptjs');

const authenticate = require('../middlewares/authenticate');

const routes = Router();

routes.get('/admin/users', authenticate, (req, res) => {
  User.findAll().then(users => {
    res.render('admin/users/index', { users })
  });
});

routes.get('/admin/users/create', (req, res) => {
  res.render('admin/users/create')
});

routes.post('/users/create', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  User.findOne({ where: {  email }}).then( user => {
    if(user == undefined){
      const salt = bcrypt.genSaltSync(10);

      const hashPassword = bcrypt.hashSync(password, salt);

      User.create({
        email,
        password: hashPassword
      }).then(() => {
        res.redirect('/')
      }).catch(err => console.log(err.message));
    }else{
      res.redirect('/admin/users/create')
    }
  });
});

routes.get('/login', (req, res) => {
  res.render('admin/users/login')
});

routes.post('/authenticate', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ where: { email }}).then(user => {
    if(user != undefined){
      const confirmPassword = bcrypt.compareSync(password, user.password);
      if(confirmPassword){
        req.session.user = {
          id: user.id,
          email: user.email
        }
        res.redirect('/admin/articles');
      }else{res.redirect('/login')}
    }else{res.redirect('/login')}
  })
});


routes.get('/logout', (req, res) => {
  req.session.user = undefined;
  
  res.redirect('/');
})
module.exports = routes;