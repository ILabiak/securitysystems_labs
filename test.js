const passwordRegex = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)

console.log(passwordRegex.test("sdfsdfsd"))