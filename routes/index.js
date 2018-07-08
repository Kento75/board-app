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
Bookshelf.plugin('pagination');

// User model
var User = Bookshelf.Model.extend({
  tableName: 'users',
});

// Message Model
var Message = Bookshelf.Model.extend({
  tableName: 'message',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  },
});

// routes

router.get('/', (req, res, next) => {
  if(req.session.login == null) {
    res.redirect('/usres');
  } else {
    res.redirect('/1');
  }
});

router.get('/:page', (req, res, next) => {
  if(req.session.login == null) {
    res.redirect('/users');
    return;
  }
  var pg = req.params.page;
  pg *= 1;

  if(pg < 1) { pg = 1; }

  new Message().orderBy('created_at', 'DESC')
    .fetchPage({ 
      page: pg,
      pageSize: 10,
      withRelated: ['user'],
    })
    .then((collection) => {
      var data = {
        title: 'miniBoard',
        login: req.session.login,
        collection: collection.toArray(),
        pagination: collection.pagination,
      };
      res.render('index', data);
    })
    .catch((err) => {
      res.status(500).json({
        error: true,
        data: {
          message: err.message,
        },
      });
    });
});

router.post('/', (req, res, next) => {
  var rec = {
    message: req.body.msg,
    user_id: req.session.login.id,
  };

  new Message(rec).save().then((model) => {
    res.redirect('/');
  });
})

module.exports = router;
