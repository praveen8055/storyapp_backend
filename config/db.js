import mongoose from "mongoose";
import 'dotenv/config'
export const  connectDB = async () =>{

    await mongoose.connect(process.env.MongoDB_URL).then(()=>console.log("DB Connected"));
   
}