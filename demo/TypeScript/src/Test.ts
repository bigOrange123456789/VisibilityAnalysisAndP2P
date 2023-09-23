export class Test {
    test: string;
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
        this.test="010";
    }
    greet() {
        return "Hello, " + this.greeting;
    }
}
// let greeter = new Greeter("world");