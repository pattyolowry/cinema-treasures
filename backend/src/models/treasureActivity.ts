import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    troveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Treasure",
      required: true,
    },
    user: {
      type: String,
      enum: {
        values: ["Ren", "Greg", "Max", "Quinn", "Patio", "Ian"],
        message: "{VALUE} is not a valid user",
      },
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

activitySchema.set("toJSON", {
  transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const TreasureActivity = mongoose.model("TreasureActivity", activitySchema);
export default TreasureActivity;
