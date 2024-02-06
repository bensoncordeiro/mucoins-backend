import {app} from './app.js'
import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config({
    path:'./.env'
});


// app.get('/', (req, res) => {
//     res.json('Welcome Benson');
// });
connectDB()
.then(() => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

