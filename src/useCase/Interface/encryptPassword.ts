interface Encrypt {
    encryptPassword(password:string) : Promise<string>,
    compare(password:string,hashPassword:string) : Promise<boolean>
}

export default Encrypt;