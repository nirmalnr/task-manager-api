require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')

// Task.findByIdAndDelete('5f6895c46389658ea50b4ccc').then(()=>{
//     return Task.countDocuments({completed:false})
// }).then((count)=>{
//     console.log(count);
// }).catch((e)=>{
//     console.log(e)
// })

const deleteTaskAndCount = async (id) => {
    await Task.findByIdAndDelete(id)
    return await Task.countDocuments({completed:false})
}

deleteTaskAndCount('5f6896436389658ea50b4cce').then((count)=>{
    console.log(count);
}).catch((e)=>{
    console.log(e);
})