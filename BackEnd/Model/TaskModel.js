import mongoose from 'mongoose';
const TaskSchema = new mongoose.Schema({
Owner: String,
Shared:[String],
Title: String,
Description: String,
Status: [ "Pending", "In Progress", "Completed"],
Due_Date:Date
});
const Task = mongoose.model('Task', TaskSchema);
export default  Task;
