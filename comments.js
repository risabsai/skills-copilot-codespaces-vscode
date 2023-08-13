// Create web server

// Import modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

// Import models
const Dishes = require('../models/dishes');
const Comments = require('../models/comments');

// Create router
const commentRouter = express.Router();

// Use body-parser
commentRouter.use(bodyParser.json());

// Create endpoints
commentRouter.route('/')
    .get((req, res, next) => {
        // Get all comments
        Comments.find({})
            .populate('author')
            .then((comments) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comments);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        // Post a new comment
        req.body.author = req.user._id;
        Comments.create(req.body)
            .then((comment) => {
                Comments.findById(comment._id)
                    .populate('author')
                    .then((comment) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(comment);
                    });
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        // Put method not supported
        res.statusCode = 403;
        res.end('PUT operation not supported on /comments');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // Delete all comments
        Comments.remove({})
            .then((response) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

commentRouter.route('/:commentId')
    .get((req, res, next) => {
        // Get a comment by id
        Comments.findById(req.params.commentId)
            .populate('author')
            .then((comment) => {
                if (comment) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment);
                } else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);

                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })  
    .post(authenticate.verifyUser, (req, res, next) => {
        // Post method not supported
        res.statusCode = 403;
        res.end('POST operation not supported on /comments/' + req.params.commentId);
    }
    )
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // Delete a comment by id
        Comments.findByIdAndRemove(req.params.commentId)
            .then((response) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            }, (err) => next(err))
            .catch((err) => next(err));
    }
);
