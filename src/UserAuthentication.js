import { useAuth } from './AuthProvider'; // Path to your AuthContext file
import LogIn from './LogIn';
import SignedIn from './SignedIn';

export default function UserAuthentication() {
    const { authUser, login, logout } = useAuth();
    const someCredentials = {
        username: 'anupta',
        email: 'anuptaislam33@gmail.com',
    };
    return (
        <div>
            {authUser ? (
                // <><p>Welcome, {authUser.email}!</p><button onClick={logout}>Logout</button></>
                <SignedIn />
            ) : (
                // <button onClick={() => login(someCredentials)}>Login</button>
                <LogIn />
            )}
        </div>
    );
}