"use strict";

const debug = require('debug')('controllers:events_controller:' + process.pid),
    path = require('path'),
    Router = require("express").Router,
    models = require('../models/index.js'),
    SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
    Authorize = require("../services/Authorize.js"),
    attributesToLoad = ['id', 'isPinned', 'isBreaking', 'isPublished', 'imageUrl', 'imageAttribution', 'politicianId', 'headline', 'summary', 'createdAt', 'updatedAt'];


function loadAdmin(req) {
  const id = req.params.id || req.body.eventId;
  debug("id: %s", id);

  return models.Event.unscoped().findOne({
    include: [ { model: models.Politician, attributes: ['color', 'firstName', 'lastName', 'jobTitle'] } ],
    attributes: attributesToLoad,
    where: { id: id, deletedAt: null }
  });
}

function load(req) {
  const id = req.params.id || req.body.eventId;
  debug("id: %s", id);

  return models.Event.findOne({
    attributes: attributesToLoad,
    where: { id: id }
  });
}

function unPinEvent(req, res, next) {
  debug('unPinEvent');

  models.Event.unscoped().findOne({
    attributes: attributesToLoad,
    where: { isPinned: true, deletedAt: null }
  })
  .then(function(event, err) {
    if (event) {
      event.isPinned = false;
      event.save(function(err) {
        if (err) {
          throw err;
        }
      }).then(function() {
        next();
      });
    } else {
      next();
    }
  });
}

function pinEvent(req, res, next) {
  debug("pinEvent");

  loadAdmin(req)
  .then(function(event, err) {
    event.isPinned = true;

    event.updatedAt = Date.now() / 1000;
    event.save(function(err) {
      if (err) { throw err; }
    }).then(function(existingEvent) {
      req.event = existingEvent;
      return next();
    });
  })
  .catch(function(error, event) {
    return next(new SequelizeError("422", {message: error}));
  });
}


function unsetBreakingNews(req, res, next) {
  debug('unsetBreakingNews');

  models.Event.unscoped().findOne({
    attributes: attributesToLoad,
    where: { isBreaking: true, deletedAt: null }
  })
  .then(function(event, err) {
    debug("in pinnedEvents");
    if (event) {
      event.isBreaking = false;
      event.save(function(err) {
        if (err) {
          throw err;
        }
      }).then(function() {
        next();
      });
    } else {
      next();
    }
  });
}

function setBreakingNews(req, res, next) {
  debug("setBreakingNews");

  loadAdmin(req)
  .then(function(event, err) {
    event.isBreaking = true;

    event.updatedAt = Date.now() / 1000;
    event.save(function(err) {
      if (err) { throw err; }
    }).then(function(event) {
      req.event = event;
      next();
    });
  })
  .catch(function(error, event) {
    return next(new SequelizeError("422", {message: error}));
  });
}

function fetchBreaking(req, res, next) {
  debug('fetchBreaking');
  models.Event.findOne({attributes: ['id', 'isBreaking', 'headline', 'createdAt'], where: { isBreaking: true }})
  .then(function(event, err) {
    req.breakingEvent = event;
    next();
  })
}

function togglePublish(req, res, next) {
  debug("togglePublish");
  loadAdmin(req)
  .then(function(event, err) {
    event.isPublished = !event.isPublished;
    event.updatedAt = Date.now() / 1000;
    event.save(function(err) {
      if (err) { throw err; }
    }).then(function(existingEvent) {
      return next();
    });
  })
  .catch(function(error, event) {
    return next(new SequelizeError("422", {message: error}));
  });
}

function fetchAdmin(req, res, next) {
  debug("fetchAdmin");
  loadAdmin(req)
  .then(function(obj, err) {
    req.event = obj;
    next();
  });
}

function fetch(req, res, next) {
  debug("fetch");
  load(req)
  .then(function(obj, err) {
    req.event = obj;
    next();
  });
}

function updateEvent(req, res, next) {
  debug("updateEvent");
  loadAdmin(req)
  .then(function(event, err) {
    event.isPinned = false;
    // event.isPublished = req.body.event.isPublished; // NOTE use publish method only
    event.imageUrl = req.body.event.imageUrl;
    event.imageAttribution = req.body.event.imageAttribution;

    // event.politicianId = req.body.event.politicianId; // NOTE cannot change politician ID (can add draft option later but not now.)
    event.headline = req.body.event.headline;
    event.summary = req.body.event.summary;
    event.updatedAt = Date.now() / 1000;
    event.save(function(err) {
      if (err) { throw err; }
    }).then(function(existingEvent) {
      next();
    });
  })
  .catch(function(error, event) {
    return next(new SequelizeError("422", {message: error}));
  });
}

function createEvent(req, res, next) {
  debug("createEvent");
  const newEvent = models.Event.build({
    isPinned: false,
    isPublished: false,
    isBreaking: false,
    imageUrl: req.body.event.imageUrl,
    imageAttribution: req.body.event.imageAttribution,
    politicianId: req.body.event.politicianId,
    headline: req.body.event.headline,
    summary: req.body.event.summary,
    updatedAt: Date.now() / 1000
  });
  newEvent.save(function(err) {
    if (err) { throw err; }
  }).then(function(newEvent) {
    req.event = newEvent;
    next();
  });
}

function getAllEvents(req, res, next) {
  debug("getAllEvents");
  models.Event.findAll({
    include: [ { model: models.Politician, include: [ models.PoliticianPhoto] } ],
    attributes: attributesToLoad,
    offset: req.query.offset,
    limit: 10,
    order: '"id" DESC'
  }).then(function(objects, err) {
    req.events = objects;
    next();
  });
}

// Includes draft events as well
function getAdminEvents(req, res, next) {
  debug("getAllEvents");
  models.Event.unscoped().findAll({
    where: { deletedAt: null },
    attributes: attributesToLoad,
    offset: req.query.offset,
    limit: 100,
    order: '"id" DESC'
  }).then(function(objects, err) {
    req.events = objects;
    next();
  });
}


module.exports = function() {
  const router = new Router();

  router.route("/events")
  .get(getAllEvents, function(req, res, next) {
    debug("in GET-INDEX /events");
    return res.status(200).json(req.events);
  })
  .post(Authorize.role("admin"), createEvent, function(req, res, next) {
    debug('in POST-CREATE /events');
    return res.status(201).json(req.events);
  });

  // TO load draft events as well
  router.route("/admin_events")
  .get(Authorize.role("admin"), getAdminEvents, function(req, res, next) {
    debug("in GET-INDEX /admin_events");
    return res.status(200).json(req.events);
  });
  // TO load draft events as well
  router.route("/admin_events/:id")
  .get(Authorize.role("admin"), fetchAdmin, function(req, res, next) {
    debug("in GET-INDEX /admin_events/:id");
    return res.status(200).json(req.event);
  });

  router.route("/events/:id")
  .get(fetch, function(req, res, next) {
    debug('in GET-SHOW /events/:id');
    debug("eventId: %s", req.params.id);
    return res.status(200).send(req.event);
  })
  .put(Authorize.role("admin"), updateEvent, function(req, res, next) {
    debug('in PUT-UPDATE /events/:id');
    debug("eventId: %s", req.params.id);
    return res.status(204);
  });

  router.route("/events/:id/pin")
  .put(Authorize.role("admin"), unPinEvent, pinEvent, function(req, res, next) {
    debug('in PUT-PIN /events/:id/pin');
    return res.status(204).send(req.event);
  });

  router.route("/events/:id/setBreaking")
  .put(Authorize.role("admin"), unsetBreakingNews, setBreakingNews, function(req, res, next) {
    debug('in PUT-PIN /events/:id/setBreaking');
    return res.status(200).send(req.event);
  });

  router.route("/unSetBreaking")
  .put(Authorize.role("admin"), unsetBreakingNews, function(req, res, next) {
    debug('in PUT-PIN /unSetBreaking');
    return res.status(204).send(req.event);
  });

  router.route('/fetchBreaking')
  .get(fetchBreaking, function(req, res, next) {
    debug('in GET /fetchBreaking');
    return res.status(200).send(req.breakingEvent);
  });

  return router;
};
