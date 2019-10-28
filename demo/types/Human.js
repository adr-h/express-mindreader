export default class Human {
    /** @param {number} age */
    constructor(name, address, age) {
        this.name = `Mr/Mrs ${name}`;
        this.address = `${address}`;
        this.age = age;
    }
}