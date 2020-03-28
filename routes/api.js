/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const threadsController = require("../controllers/threads.controller");

module.exports = function(app) {
  app
    .route("/api/threads/:board")
    .get(threadsController.apiGetThreads)
    .post(threadsController.apiInsertThread)
    .delete(threadsController.apiDeleteThread)
    .put(threadsController.apiReportThread);

  app
    .route("/api/replies/:board")
    .get(threadsController.apiGetThread)
    .post(threadsController.apiInsertReply)
    .delete(threadsController.apiDeleteReply)
    .put(threadsController.apiReportReply);
};
