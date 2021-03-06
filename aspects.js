/**
 * Created by chamod on 4/29/18.
 */
var express = require('express');
var router = express.Router();
var util = require("./util");

var PythonShell = require('python-shell');


const {check, validationResult} = require('express-validator/check')

router.get('/', function (req, res) {
    util.readJsonFiles().then(function (json_files) {
        res.render('aspects', {files: json_files, req: req});
    });
});

router.post('/findAspects', [
    check('message')
        .isLength({min: 1})
        .withMessage('Review is required'),
], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('aspects', {
            data: req.body,
            errors: errors.mapped(),
        })
    }

    // sends e message to the Python script via stdin
    // pyshell.send('I love food');

    var options = {
        args: [
            req.body.message
        ]
    }

    PythonShell.run("lstm_crf_pos_run.py", options, function (err, data) {
        if (err) return res.send(err);

        aspects = []
        data = data.toString().replace('[', '').replace(']', '').replace("'", '').split(',');
        for (e in data) {
            aspects.push(
                {
                    aspect: data[e].replace("'", '').replace("'", "").trim(),
                    sentiment: Math.floor(Math.random() * (2 - (-1)) ) + (-1)
                }
            );
        }
        util.readJsonFiles().then(function (json_files) {
                return res.render('aspects', {
                    data: req.body,
                    aspects: aspects,
                    files: json_files, req: req
                })
            });
    });

})

//export this router to use in our index.js
module.exports = router;