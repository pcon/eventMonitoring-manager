# Event Monitoring Manager
![workflow](https://github.com/pcon/eventMonitoring-manager/workflows/Lint%20and%20Test/badge.svg)
[![Code Climate](https://codeclimate.com/github/pcon/eventMonitoring-manager/badges/gpa.svg)](https://codeclimate.com/github/pcon/eventMonitoring-manager)
[![Coverage Status](https://img.shields.io/coveralls/github/pcon/eventMonitoring-manager.svg)](https://coveralls.io/github/pcon/eventMonitoring-manager?branch=master)

This application is very much a work in progress and doesn't actually do anything yet.  I'll update the README with more information as the project moves along.

# Installation and Usage

1. Clone the repository
2. Copy `config.example.json` to `config.json` and edit or run `npm run setup`
    
    _NOTE:_ if `config.json` is cannot live in the root of the project (such as when running as an Openshift or Heroku app) set the `CONFIG_ROOT` environment variable to point to the config's location
3. Start the app with `npm run server`

# To-Do
- [ ] Write test for existing functionality
- [X] Write loader for Mongo
- [X] Write setup command
- [ ] Write usage dashboard
- [ ] Implement user auth
- [ ] Write loader for Splunk
- [ ] Write loader for New Relic
- [X] Write loader for flat file storage
- [ ] Write loader for Amazon Glacier
- [ ] Write configuration management interface
- [ ] Write scheduled job to compress flat files