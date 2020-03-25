var express = require('express');
var router = express.Router();
var model = require('../model');
var moment = require('moment');

/* GET home page. */
router.get('/', function(req, res, next) {
  var username = req.session.username;
  var page = req.query.page || 1;
  var data = {
    total:0, //总页数
    curPage:page, //当前页
    list:[] //当前页文章
  }
  var pageSize = 2; //每页显示两条

  model.connect(function(db){
    //查询所有文章
    db.collection('articles').find().toArray(function(err,docs){
      data.total = Math.ceil(docs.length / pageSize);
      //查询当前页的文章
      model.connect(function(db){
        db.collection('articles').find().sort({_id: -1}).limit(pageSize).skip((page - 1) * pageSize).toArray(function(err,docs2){
          if(docs2.length == 0){
            res.redirect('/?page=' + ((page - 1) || 1));
          }else{
            docs2.map(function(ele, index){
              ele['time'] = moment(ele.id).format('YYYY-MM-DD HH:mm:ss');
            })
            data.list = docs2;
          }
          res.render('index', { username: username, data: data});
        })
      })
    })
  })
});

//写文章页面
router.get('/write',function(req, res, next){
  var username = req.session.username;
  var id = parseInt(req.query.id);
  var page = req.query.page;
  var item = {
    title: '',
    content: ''
  }
  if(id){ //编辑页面
    model.connect(function(db){
      db.collection('articles').findOne({id: id}, function(err, docs){
        if(err){
          console.log("查询失败！");
        }else{
          item = docs;
          item['page'] = page;
          res.render('write',{username: username,item: item});
        }
      })
    })
  }else{ //新增页面
    res.render('write',{username: username,item: item});
  }
})

module.exports = router;
