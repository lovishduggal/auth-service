function login(username: string, password: string): string {
    const user = {
        name: 'Lovish',
    };
    const name = user.name;
    if (username === 'admin' && password === 'admin') {
        return 'Login Success' + name;
    } else {
        return 'Login Failed' + name;
    }
}
login('admin', 'admin');
