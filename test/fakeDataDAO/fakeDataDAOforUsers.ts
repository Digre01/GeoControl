import { UserDAO } from "@models/dao/UserDAO";
import { UserType } from "@models/UserType";

const FAKE_USERS: UserDAO[] = [
    Object.assign(new UserDAO(), { username: "nicolo", password: "ciao", type: UserType.Admin }),
    Object.assign(new UserDAO(), { username: "marco", password: "ciaociao", type: UserType.Operator }),
    Object.assign(new UserDAO(), { username: "gabriele", password: "ciaociaociao", type: UserType.Viewer }),
    Object.assign(new UserDAO(), { username: "francesco", password: "ciaociaociaociao", type: UserType.Viewer })
]


export const FAKE_DATA = {
    FAKE_USERS: FAKE_USERS,
}