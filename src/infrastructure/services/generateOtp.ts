import IOTP from "../../useCase/Interface/otpGenerate";

class GenerateOtp implements IOTP {
    createOtp(): number {
        return Math.floor(10000  + Math.random() * 90000)
    }
}

export default GenerateOtp;