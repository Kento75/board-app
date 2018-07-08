var express = require('express');
var router = express.Router();

// DB setting
var knex = require('knex')({
  dialect: 'sqlite3',
  connection: {
    filename: 'board_data.sqlite3',
  },
  useNullAsDefault: true,
});

var Bookshelf = require('bookshelf')(knex);

var User = Bookshelf.Model.extend({
  tableName: 'users',
});

router.get('/add', (req, res, next) => {
  var data = {
    title: 'Users/Add',
    form: {
      name: '',
      password: '',
      comment: '',
    },
  };
  res.render('users/add', data);
})

router.post('/add', (req, res, next) => {
  var request = req;
  var response = res;
  req.check('name', 'NAMEは必ず入力してください。').notEmpty();
  req.check('password', 'PASSWORDは必ず入力してください。').notEmpty();
  
  req.getValidationResult().then((result) => {
    if(!result.isEmpty()) {
      var content = '<ul class="error">';
      var result_arr = result.array();
      
      for(var i in result_arr) {
        content += '<li>' + result_arr[n] + '</li>';
      }
      content += '</ul>';
      var data = {
        title: 'Users/Add',
        content: content,
        form: req.body,
      };
      response.render('users/add', data);

    } else {
      request.session.login = null;
      new User(req.body).save().then((model) => {
        response.redirect('/');
      });
    }
  });
});

router