const threadsDAO = require("./threads.DAO");

function asyncWrapper(req, res, next, func) {
  return async () => {
    try {
      await func();
    } catch (err) {
      next(err);
    }
  };
}

async function apiGetThreads(req, res, next) {
  asyncWrapper(req, res, next, async () => {
    const board = req.params.board && req.params.board.toLowerCase();
    const maxReturn = 10;
    const threads = await threadsDAO.getThreads(board, maxReturn);
    res.json(threads);
  })();
}
exports.apiGetThreads = apiGetThreads;

async function apiGetThread(req, res, next) {
  asyncWrapper(req, res, next, async () => {
    const board = req.params.board && req.params.board.toLowerCase();
    const { thread_id } = req.query;
    const thread = await threadsDAO.getThread(board, thread_id);
    if (!thread) {
      res.status(404);
    }
    res.json(thread);
  })();
}
exports.apiGetThread = apiGetThread;

async function apiInsertThread(req, res, next) {
  asyncWrapper(req, res, next, async () => {
    const board = req.params.board && req.params.board.toLowerCase();
    const { text, delete_password } = req.body;
    if (!board || !text || !delete_password) {
      const err = new Error("Board, text, and delete_password are required");
      err.code = 400;
      throw err;
    }
    const thread = await threadsDAO.insertThread(board, text, delete_password);
    res.redirect(`/b/${board}`);
  })();
}
exports.apiInsertThread = apiInsertThread;

async function apiInsertReply(req, res, next) {
  asyncWrapper(req, res, next, async () => {
    const board = req.params.board && req.params.board.toLowerCase();
    const { thread_id, text, delete_password } = req.body;
    if (!board || !thread_id || !text || !delete_password) {
      const err = new Error(
        "Board, thread_id, text, and delete_password are required"
      );
      err.code = 400;
      throw err;
    }
    await threadsDAO.insertReply(board, thread_id, text, delete_password);
    res.redirect(`/b/${board}/${thread_id}`);
  })();
}
exports.apiInsertReply = apiInsertReply;

async function apiDeleteThread(req, res, next) {
  asyncWrapper(req, res, next, async () => {
    const board = req.params.board && req.params.board.toLowerCase();
    const { thread_id, delete_password } = req.body;
    if (!board || !thread_id || !delete_password) {
      const err = new Error(
        "Board, thread_id, and delete_password are required"
      );
      err.code = 400;
      throw err;
    }
    const result = await threadsDAO.deleteThread(
      board,
      thread_id,
      delete_password
    );
    if (result !== "success") {
      res.status(400);
    }
    res.send(result);
  })();
}
exports.apiDeleteThread = apiDeleteThread;

async function apiDeleteReply(req, res, next) {
  asyncWrapper(req, res, next, async () => {
    const board = req.params.board && req.params.board.toLowerCase();
    const { thread_id, reply_id, delete_password } = req.body;
    if (!board || !thread_id || !reply_id || !delete_password) {
      const err = new Error(
        "Board, thread_id, reply_id, and delete_password are required"
      );
      err.code = 400;
      throw err;
    }
    const result = await threadsDAO.deleteReply(
      board,
      thread_id,
      reply_id,
      delete_password
    );
    if (result !== "success") {
      res.status(400);
    }
    res.send(result);
  })();
}
exports.apiDeleteReply = apiDeleteReply;

async function apiReportThread(req, res, next) {
  asyncWrapper(req, res, next, async () => {
    const board = req.params.board && req.params.board.toLowerCase();
    const { thread_id } = req.body;
    if (!board || !thread_id) {
      const err = new Error("Board and thread_id are required");
      err.code = 400;
      throw err;
    }
    const result = await threadsDAO.reportThread(board, thread_id);
    if (result !== "success") {
      res.status(400);
    }
    res.send(result);
  })();
}
exports.apiReportThread = apiReportThread;

async function apiReportReply(req, res, next) {
  asyncWrapper(req, res, next, async () => {
    const board = req.params.board && req.params.board.toLowerCase();
    const { thread_id, reply_id } = req.body;
    if (!board || !thread_id || !reply_id) {
      const err = new Error("Board, thread_id, and reply_id are required");
      err.code = 400;
      throw err;
    }
    const result = await threadsDAO.reportReply(board, thread_id, reply_id);
    if (result !== "success") {
      res.status(400);
    }
    res.send(result);
  })();
}
exports.apiReportReply = apiReportReply;
