// src/app/components/UserList.tsx (The "Bad" Version for the PR)

/**
 * Fetches user data from the JSONPlaceholder users endpoint and returns the parsed JSON.
 *
 * Performs a GET request to 'https://jsonplaceholder.typicode.com/users' and resolves with the parsed response body (typically an array of user objects).
 *
 * @returns The parsed JSON response from the users endpoint (currently untyped).
 */
async function getUsers(): Promise<any> {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    // Flaw 2: Not handling promise rejection or non-ok HTTP statuses
    const users = await response.json();
    return users;
}

/**
 * Server-side React component that fetches and renders a list of users.
 *
 * Fetches user data via `getUsers()` and returns JSX that displays a header and either
 * a list of users (name, email, and a profile link) or a "No users found." message when
 * the fetched list is empty.
 *
 * @returns The rendered JSX for the user list.
 */
export default async function UserList() {
    const users = await getUsers();
    var componentTitle = "User List"; // Flaw 3: Using 'var' instead of 'const'

    // Flaw 4: Overly complex logic to check for users
    const hasUsers = users && users.length > 0 ? true : false;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">{componentTitle}</h1>
            {hasUsers ? (
                <ul className="space-y-4">
                    {/* Flaw 5: Missing 'key' prop in a list */}
                    {users.map((user: any) => (
                        <li className="p-4 border rounded-lg shadow-sm">
                            <p className="font-semibold">{user.name}</p>
                            {/* Flaw 6: Potential null access if email is optional */}
                            <p className="text-gray-600">{user.email.toLowerCase()}</p>
                            <a href="/profile">View Profile</a> {/* Flaw 7: Using <a> for internal nav instead of <Link> */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No users found.</p>
            )}
        </div>
    );
}