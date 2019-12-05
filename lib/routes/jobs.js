const consts = require('../consts');

var agenda = require('../agenda');
const agendash = require('agendash');

const routes = require('express').Router();

var opts = {
    title: consts.app.name
};

routes.use('/', agendash(agenda, opts));

module.exports = routes;