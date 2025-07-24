import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Theme:String,
  Password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);
export default User;
