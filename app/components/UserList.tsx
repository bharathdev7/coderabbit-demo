// src/app/components/UserList.tsx

type User = {
    id: number;
    name: string;
    email: string;
};

async function getUsers(): Promise<User[]> {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const users = await response.json();
        return users;
    } catch (error) {
        console.error(error);
        return []; // Return empty array on error
    }
}

export default async function UserList() {
    const users = await getUsers();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">User List</h1>
            <ul className="space-y-4">
                {users.map((user) => (
                    <li key={user.id} className="p-4 border rounded-lg shadow-sm">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-gray-600">{user.email}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
  }