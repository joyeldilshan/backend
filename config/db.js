import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// SQLite database setup
export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'  // database file
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('SQLite DB Connected');
    } catch (err) {
        console.error('SQLite Connection Error:', err);
        throw err;
    }
};