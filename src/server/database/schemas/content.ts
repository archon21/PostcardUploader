import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
  name: { type: String },
  items: {
    type: Object,
  },
});

export default mongoose.model("content", ContentSchema);
