import mongoose from 'mongoose';
const TaskSchema = new mongoose.Schema({
Title: String,
Description: String,
Status: [ "Pending", "In Progress", "Completed"],
Due_Date:String
});
const Task = mongoose.model('Task', TaskSchema);
export default  Task;