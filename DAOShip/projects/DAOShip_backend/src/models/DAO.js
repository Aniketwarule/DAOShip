const mongoose = require("mongoose");

const daoSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
    // unique: true,
  },
  description: {
    type: String,
    
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  contractAddress: {
    type: String,
    
  },
  votingPeriod: {
    type: Number,
    // required: true,
  },
  quorum: {
    type: Number,
    // required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DAO", daoSchema);
