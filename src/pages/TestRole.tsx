import { useAuth } from '../context/AuthContext';
import './TestRole.css';

const TestRole = () => {
    const { user, userRole } = useAuth();

    return (
        <div className="test-role-page">
            <div className="container">
                <h1>Role Debug Page</h1>
                <div className="debug-info">
                    <h2>Current User Info:</h2>
                    <pre>{JSON.stringify({
                        email: user?.email,
                        userRole: userRole,
                        user_metadata: user?.user_metadata,
                        app_metadata: user?.app_metadata
                    }, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};

export default TestRole;
