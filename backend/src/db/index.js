import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\n MONGODB connection successful! \nDB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Failed Connecting MONGODB:", error)
        process.exit(1)
    }
}

export default connectDB