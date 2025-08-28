// src/app/components/UserList.tsx (The "Bad" Version for the PR)

// Flaw 1: Using 'any' type instead of a specific type
async function getUsers(): Promise<any> {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    // Flaw 2: Not handling promise rejection or non-ok HTTP statuses
    const users = await response.json();
    return users;
}

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