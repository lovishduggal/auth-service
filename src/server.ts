function login(username: string, password: string) {
    if (username === 'admin' && password === 'admin') {
        return 'Login Success';
    } else {
        return 'Login Failed';
    }
}

console.log(login('admin', 'admin'));
console.log(login('admin', 'admin1'));
