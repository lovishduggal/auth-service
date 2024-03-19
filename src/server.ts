function login(username: string, password: string): string {
    if (username === 'admin' && password === 'admin') {
        return 'Login Success';
    } else {
        return 'Login Failed';
    }
}
login('admin', 'admin');
