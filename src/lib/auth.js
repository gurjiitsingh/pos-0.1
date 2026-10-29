
  import { hash, compare } from 'bcryptjs';



export async function hashPassword(password){

const hassedPassword = await hash(password, 12);

return hassedPassword;

}

export async function verifyPassword(password, hashedPassword){

const isValid = await compare(password, hashedPassword);
return isValid;
}