import mongoose from "mongoose";
import User from "../src/models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await User.updateMany(
      {
        $or: [
          { followers: { $exists: false } },
          { following: { $exists: false } },
        ],
      },
      {
        $set: {
          followers: [],
          following: [],
        },
      },
    );

    console.log("Migration done:", result);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMigration();
