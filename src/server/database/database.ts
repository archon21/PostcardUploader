import mongoose from "mongoose";

import { siteConfig } from "../../site-config";

try {
  mongoose.connect(siteConfig.server.database.connection.production, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} catch (err) {
  console.error(err);
}

const connection = mongoose.connection;

export default connection;
