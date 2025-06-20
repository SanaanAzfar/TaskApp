import Task from "../Model/TaskModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


// export const RegisterUser = async (req, res) => {
//     const user = new User(req.body);
//     user.password = await bcrypt.hash(user.password, 10)
//     try {
//         await user.save();
//         res.status(201).send({ "message": "User registered successfully" });
//     } catch (error) {
//         res.status(400).send(error);
//     }
// };

// export const LoginUser = async (req, res) => {
//     try {
//         const email = req.body.email;
//         const pass = req.body.password;
//         const user = await User.findOne({ "email": email });
//         if (!user) {
//             return res.status(404).send({ error: 'Student not found' });
//         }
//         if (user && await bcrypt.compare(pass, user.password)) {
//             const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
//                 expiresIn: '1h'
//             });
//             res.json({
//                 "message": "Login successful",
//                 "token": token
//             });
//         }
//         return res.status(401).send('Invalid credentials'); // Return the entire student object
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// };
// export const SearchByTitle = async (req, res) => {
//     try {
//         const movieTitle=req.body.title;
//         const movie = await Movie.find()
//         const foundmovies=movie.filter(le=>le.title==movieTitle||le.title.includes(movieTitle));
//         (foundmovies.length==0)
//         {
//             res.status(404).json({message:"Movie not found"});
//         }
//         for(let i=0;i<foundmovies.length;i++)
//         {foundmovies[i].searchCount++;
//             await foundmovies[i].save();
//         }
//         res.send(foundmovies);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// };

// export const SearchByGenre = async (req, res) => {
//     try {
//         const movieFind=req.body.genre;
//         const movie = await Movie.find();
//         const foundmovies=movie.filter(le=>{
//             for(let i=0;i<le.genre.length;i++)
//             {if(le.genre[i]==movieFind||le.genre[i].includes(movieFind))
//             {return true;}}
//             return false;   
//             });
//         (foundmovies.length==0)
//         {
//             res.status(404).json({message:"Movie not found"});
//         }
//         for(let i=0;i<foundmovies.length;i++)
//             {foundmovies[i].searchCount++;
//                 await foundmovies[i].save();
//             }
//         res.send(foundmovies);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// };


// export const SearchByActor = async (req, res) => {
//     try {
//         const movieFind=req.body.actors;
//         const movie = await Movie.find();
//         const foundmovies=movie.filter(le=>{
//             for(let i=0;i<le.genre.length;i++)
//             {if(le.actors[i]==movieFind||le.actors[i].includes(movieFind))
//             {return true;}}
//             return false;   
//             });
//         (foundmovies.length==0)
//         {
//             res.status(404).json({message:"Movie not found"});
//         }
//         for(let i=0;i<foundmovies.length;i++)
//             {foundmovies[i].searchCount++;
//                 await foundmovies[i].save();
//             }
//         res.send(foundmovies);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// };


export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        if (!tasks) {
            return res.status(405).json({ message: "No tasks added yet" });
        }
        res.status(200).send(tasks);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getTask = async (req, res) => {
    try {
        const id = req.params.id;
        const tasks = await Task.findById(id);
        if (!tasks) {
            return res.status(405).json({ message: "No tasks added yet" });
        }
        res.status(200).send(tasks);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: error.message });
    }
};




export const CreateTask = async (req, res) => {
    try {
        const givenData = req.body;
        const NewTask = new Task({
            Title: givenData.Title,
            Description: givenData.Description,
            Status: givenData.Status,
            Due_Date: givenData.Due_Date
        });
        const savedTask =await NewTask.save();
        res.status(200).json({
            message: "Added New Task",
            changes: savedTask
        });
    } catch (error) {
        console.error(error);
        return res.staus(500).json({ message: "Server error", error: error.message });
    }
};

export const UpdateTask = async (req, res) => {
    try {
        const givenData = req.body;
        let id = req.params.id;
        const task = await Task.findByIdAndUpdate(id, givenData, { new: true, runValidators: true });
        if (!task) {
            return res.status(404).json({ message: "Task Not Found" });
        }
        res.status(200).json({
            message: "Updated Task",
            changes: task
        });
    } catch (error) {
        console.error(error);
        return res.staus(500).json({ message: "Server error", error: error.message });
    }
};



export const deleteUser = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task Not Found" });
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
};
