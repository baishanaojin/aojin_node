var express = require('express');
var router = express.Router();
var model = require('../model');
var multiparty = require('multiparty');
var fs = require('fs');

router.post('/add',function(req,res,next){
    var id = parseInt(req.body.id);
    var form = new multiparty.Form();
    form.parse(req, function(err,fields,files){
        if(err){
            console.log('上传失败！',err);
        }else{
            console.log(files.logo[0].originalFilename);
            var file = files.logo[0];
            var rs = fs.createReadStream(file.path);
            var newpath = '/uploads/' + file.originalFilename;
            var ws = fs.createWriteStream('./public' + newpath);
            rs.pipe(ws);
            ws.on('close',function(){
                console.log('文件上传成功！');
            })
        }
    })
    if(id){//编辑
        var page = req.body.page;
        var title = req.body.title;
        var content = req.body.content;
        model.connect(function(db){
            db.collection('articles').updateOne({id: id}, {$set: {
                title: title,
                content: content
            }},function(err,ret){
                if(err){
                    console.log('修改失败！',err);
                }else{
                    console.log('修改成功！');
                    res.redirect('/?page=' + page);
                }
            })
        })
    }else{//发布
        var data = {
            title: req.body.title,
            content: req.body.content,
            id: Date.now(),
            username: req.session.username
        }
        model.connect(function(db){
            db.collection('articles').insertOne(data, function(err, ret){
                if(err){
                    console.log('文章发布失败', err);
                    res.redirect('/write');
                }else{
                    res.redirect('/');
                }
            })
        })
    }
})

//删除文章
router.get('/del',function(req,res,next){
    var id = parseInt(req.query.id);
    var page = req.query.page;
    model.connect(function(db){
        db.collection('articles').deleteOne({id: id},function(err, ret){
            if(err){
                console.log("删除失败",err);
            }else{
                console.log("删除成功！");
            }
            res.redirect('/?page='+page);
        })
    })
})

module.exports = router;