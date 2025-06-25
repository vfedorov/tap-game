import { User } from '../user/user.model'; // Импортируйте ваш тип User

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}