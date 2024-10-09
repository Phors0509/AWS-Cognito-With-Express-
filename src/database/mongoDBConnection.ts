import mongoose from "mongoose";
import configs from "../config";

class MongoDBConnector {
    private static instance: MongoDBConnector;
    private constructor() { }

    public static getInstance(): MongoDBConnector {
        if (!MongoDBConnector.instance) {
            MongoDBConnector.instance = new MongoDBConnector();
        }
        return MongoDBConnector.instance;
    }

    public async connect(): Promise<void> {
        try {
            await mongoose.connect(configs.mongodbUrl);
            console.log("Connection : Connected to database");
        } catch (error) {
            console.error('Connection : MongoDB connection error:', error);
            process.exit(1);
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            console.log("Connection : Disconnected from database");
        } catch (error) {
            console.error('Connection : MongoDB disconnection error:', error);
        }
    }
}

export default MongoDBConnector;