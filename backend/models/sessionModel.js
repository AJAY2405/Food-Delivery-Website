// import mongoose from "mongoose";

// const sessionSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
// });

// export const Session = mongoose.model("Session", sessionSchema);



import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Session = mongoose.model("Session", sessionSchema);