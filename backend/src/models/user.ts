import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    passwordHash: String
})

userSchema.set("toJSON", {
  transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);
export default User;