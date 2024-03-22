import app from './app';
import { Config } from './config';

const startServer = () => {
    const PORT = Config.PORT;

    try {
        app.listen(PORT, () => {
            // eslint-disable-next-line no-console
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        // Terminate the Node.js process with an exit code of 1.
        process.exit(1);
    }
};

startServer();
