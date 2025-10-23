export default class UserModel {
    private id: string = '';
    private name: string = '';
    private email: string = '';

    setId(id: string) {
        this.id = id;
    }
    
    setName(name: string) {
        this.name = name;
    }
    
    setEmail(email: string) {
        this.email = email;
    }

    getId() {
        return this.id;
    }
    
    getName() {
        return this.name;
    }
    getEmail() {
        return this.email;
    }
    
}