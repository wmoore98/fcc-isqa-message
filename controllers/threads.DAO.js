const ObjectId = require("mongodb").ObjectID;

let threads;

async function injectDb(client) {
  try {
    const dbName = process.env.DB_NAME || "fcc_msg_brd";
    threads = await client.db(dbName).collection("threads");
  } catch (err) {
    throw err;
  }
}
exports.injectDb = injectDb;

async function getThreads(board, maxCount) {
  try {
    const limit = typeof maxCount === "number" ? maxCount : 10;
    const matchStage = {
      $match: { board }
    };
    const projectStage = {
      $project: {
        board: 1,
        text: 1,
        created_on: 1,
        bumped_on: 1,
        "replies._id": 1,
        "replies.text": 1,
        "replies.created_on": 1
      }
    };
    const limitRepliesStage = {
      $addFields: {
        replies: {
          $slice: ["$replies", -3]
        }
      }
    };
    const sortStage = { $sort: { bumped_on: -1 } };
    const limitStage = { $limit: limit };

    const pipeline = [
      matchStage,
      projectStage,
      limitRepliesStage,
      sortStage,
      limitStage
    ];
    const result = await threads.aggregate(pipeline).toArray();
    return result;
  } catch (err) {
    console.error("There was an error getting threads:", err);
  }
}
exports.getThreads = getThreads;

async function getThread(board, thread_id) {
  try {
    const limit = typeof maxCount === "number" ? maxCount : 10;
    const matchStage = {
      $match: { board, _id: ObjectId(thread_id) }
    };
    const projectStage = {
      $project: {
        board: 1,
        text: 1,
        created_on: 1,
        bumped_on: 1,
        "replies._id": 1,
        "replies.text": 1,
        "replies.created_on": 1
      }
    };

    const pipeline = [matchStage, projectStage];
    const result = await threads.aggregate(pipeline).toArray();
    return result[0];
  } catch (err) {
    console.error("There was an error getting thread:", err);
  }
}
exports.getThread = getThread;

async function insertThread(board, text, delete_password) {
  // should scrub user input (board, text, delete_password) to protect against attacks
  try {
    const now = new Date();
    const doc = {
      board,
      text,
      created_on: now,
      bumped_on: now,
      reported: false,
      delete_password,
      replies: []
    };
    const result = await threads.insertOne(doc);
    return result.ops[0];
  } catch (err) {
    console.error("There was an error inserting thread:", err);
  }
}
exports.insertThread = insertThread;

async function insertReply(board, thread_id, text, delete_password) {
  try {
    const now = new Date();
    const embedDoc = {
      _id: ObjectId(),
      text,
      created_on: now,
      reported: false,
      delete_password
    };
    const filter = { _id: ObjectId(thread_id), board };
    const update = {
      $push: { replies: embedDoc },
      $set: { bumped_on: now }
    };
    const options = {};
    const result = await threads.findOneAndUpdate(filter, update, options);
    return result.value;
  } catch (err) {
    console.error("There was an error inserting reply:", err);
  }
}
exports.insertReply = insertReply;

async function deleteThread(board, thread_id, delete_password) {
  try {
    const filter = { _id: ObjectId(thread_id), board, delete_password };
    const doc = await threads.findOneAndDelete(filter);
    if (!doc.value) {
      return "incorrect password";
    } else {
      return "success";
    }
  } catch (err) {
    console.error("There was an error deleting thread:", err);
  }
}
exports.deleteThread = deleteThread;

async function deleteReply(board, thread_id, reply_id, delete_password) {
  try {
    const filter = {
      _id: ObjectId(thread_id),
      board,
      replies: { $elemMatch: { _id: ObjectId(reply_id), delete_password } }
    };
    const update = {
      $set: {
        "replies.$.text": "deleted"
      }
    };
    const doc = await threads.updateOne(filter, update);
    if (doc.result.nModified === 1) {
      return "success";
    } else {
      return "incorrect password";
    }
  } catch (err) {
    console.error("There was an error deleting reply:", err);
  }
}
exports.deleteReply = deleteReply;

async function reportThread(board, thread_id) {
  try {
    const filter = { _id: ObjectId(thread_id), board };
    const update = { $set: { reported: true } };
    const doc = await threads.findOneAndUpdate(filter, update);
    return "success";
  } catch (err) {
    console.error("There was an error reporting thread:", err);
  }
}
exports.reportThread = reportThread;

async function reportReply(board, thread_id, reply_id) {
  try {
    const filter = {
      _id: ObjectId(thread_id),
      board,
      "replies._id": ObjectId(reply_id)
    };
    const update = {
      $set: {
        "replies.$.reported": true
      }
    };
    const doc = await threads.updateOne(filter, update);
    return "success";
  } catch (err) {
    console.error("There was an error reporting reply:", err);
  }
}
exports.reportReply = reportReply;
