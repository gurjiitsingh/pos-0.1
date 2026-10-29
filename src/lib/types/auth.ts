//import { ISODateString } from "next-auth";

export type CustomSessionType = {
    user?: CustomUserType;
   // expires: ISODateString;
  };
  
  export type CustomUserType = {
    name?: string | null;
    id?: string | null;
    email?: string | null;
    role?: string | null;
    image?: string | null;
    avatar?: string | null;
  };